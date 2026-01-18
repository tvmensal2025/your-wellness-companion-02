import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JobProcessor } from './JobProcessor.js';
import { metrics } from '../utils/metrics.js';

interface Job {
  id: string;
  user_id: string;
  type: string;
  input: any;
  status: string;
  priority: number;
  attempts: number;
  max_attempts: number;
  created_at: string;
}

export class AIWorker {
  private supabase: SupabaseClient;
  private processor: JobProcessor;
  private workerId: string;
  private concurrency: number;
  private pollInterval: number;
  private activeJobs: Set<string>;
  private isRunning: boolean;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    // Accept either SERVICE_ROLE_KEY or ANON_KEY (for Lovable Cloud)
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.processor = new JobProcessor(this.supabase);
    this.workerId = process.env.WORKER_ID || 'worker-1';
    this.concurrency = parseInt(process.env.WORKER_CONCURRENCY || '5');
    this.pollInterval = parseInt(process.env.WORKER_POLL_INTERVAL_MS || '1000');
    this.activeJobs = new Set();
    this.isRunning = false;

    console.log(`✅ AI Worker initialized: ${this.workerId}`);
    console.log(`   Concurrency: ${this.concurrency}`);
    console.log(`   Poll interval: ${this.pollInterval}ms`);
  }

  async start() {
    if (this.isRunning) {
      console.warn('Worker already running');
      return;
    }

    this.isRunning = true;
    console.log(`🔄 Starting worker loop...`);
    
    // Start main loop
    this.workerLoop();
    
    // Start stuck job detector
    this.stuckJobDetector();
  }

  async stop() {
    console.log('🛑 Stopping worker...');
    this.isRunning = false;
    
    // Wait for active jobs to complete
    while (this.activeJobs.size > 0) {
      console.log(`Waiting for ${this.activeJobs.size} active jobs to complete...`);
      await this.sleep(1000);
    }
    
    console.log('✅ Worker stopped');
  }

  private async workerLoop() {
    while (this.isRunning) {
      try {
        // Check if we can process more jobs
        if (this.activeJobs.size >= this.concurrency) {
          await this.sleep(this.pollInterval);
          continue;
        }

        // Fetch pending jobs
        const availableSlots = this.concurrency - this.activeJobs.size;
        const jobs = await this.fetchPendingJobs(availableSlots);

        if (!jobs || jobs.length === 0) {
          await this.sleep(this.pollInterval);
          continue;
        }

        // Process jobs in parallel
        for (const job of jobs) {
          this.processJob(job); // Fire and forget
        }

      } catch (error) {
        console.error('Worker loop error:', error);
        metrics.workerErrors.inc({ type: 'loop_error' });
        await this.sleep(5000); // Backoff on error
      }
    }
  }

  private async fetchPendingJobs(limit: number): Promise<Job[]> {
    try {
      const { data, error } = await this.supabase
        .from('analysis_jobs')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      metrics.queueSize.set(data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('Error fetching jobs:', error);
      metrics.workerErrors.inc({ type: 'fetch_error' });
      return [];
    }
  }

  private async processJob(job: Job) {
    this.activeJobs.add(job.id);
    metrics.activeJobs.set(this.activeJobs.size);
    
    const startTime = Date.now();
    const timer = metrics.jobDuration.startTimer({ type: job.type });

    try {
      console.log(`🔄 Processing job ${job.id} (type: ${job.type}, priority: ${job.priority})`);

      // Mark as processing
      await this.supabase
        .from('analysis_jobs')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          worker_id: this.workerId
        })
        .eq('id', job.id);

      // Process job
      const result = await this.processor.process(job);

      // Mark as completed
      const processingTime = Date.now() - startTime;
      await this.supabase
        .from('analysis_jobs')
        .update({
          status: 'completed',
          result,
          completed_at: new Date().toISOString(),
          processing_time_ms: processingTime
        })
        .eq('id', job.id);

      console.log(`✅ Job ${job.id} completed in ${processingTime}ms`);
      metrics.jobsProcessed.inc({ type: job.type, status: 'completed' });
      timer({ status: 'completed' });

    } catch (error: any) {
      console.error(`❌ Job ${job.id} failed:`, error.message);
      await this.handleJobError(job, error);
      metrics.jobsProcessed.inc({ type: job.type, status: 'failed' });
      timer({ status: 'failed' });
    } finally {
      this.activeJobs.delete(job.id);
      metrics.activeJobs.set(this.activeJobs.size);
    }
  }

  private async handleJobError(job: Job, error: any) {
    const attempts = job.attempts + 1;

    if (attempts >= job.max_attempts) {
      // Max retries reached
      await this.supabase
        .from('analysis_jobs')
        .update({
          status: 'failed',
          error: error.message,
          attempts,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);
      
      console.log(`❌ Job ${job.id} failed permanently after ${attempts} attempts`);
    } else {
      // Retry with exponential backoff
      const backoffMs = Math.min(1000 * Math.pow(2, attempts), 60000);
      
      await this.supabase
        .from('analysis_jobs')
        .update({
          status: 'pending',
          attempts,
          error: `Retry ${attempts}/${job.max_attempts}: ${error.message}`
        })
        .eq('id', job.id);
      
      console.log(`🔄 Job ${job.id} will retry in ${backoffMs}ms (attempt ${attempts}/${job.max_attempts})`);
      
      // Wait before retrying
      await this.sleep(backoffMs);
    }
  }

  private async stuckJobDetector() {
    const stuckTimeout = parseInt(process.env.WORKER_STUCK_JOB_TIMEOUT_MS || '300000');
    
    while (this.isRunning) {
      try {
        const cutoffTime = new Date(Date.now() - stuckTimeout).toISOString();
        
        const { data: stuckJobs } = await this.supabase
          .from('analysis_jobs')
          .select('id, type')
          .eq('status', 'processing')
          .lt('started_at', cutoffTime);

        if (stuckJobs && stuckJobs.length > 0) {
          console.warn(`⚠️ Found ${stuckJobs.length} stuck jobs`);
          
          for (const job of stuckJobs) {
            await this.supabase
              .from('analysis_jobs')
              .update({
                status: 'failed',
                error: 'Job stuck - exceeded timeout',
                completed_at: new Date().toISOString()
              })
              .eq('id', job.id);
            
            metrics.workerErrors.inc({ type: 'stuck_job' });
          }
        }

      } catch (error) {
        console.error('Stuck job detector error:', error);
      }

      await this.sleep(60000); // Check every minute
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      workerId: this.workerId,
      isRunning: this.isRunning,
      concurrency: this.concurrency,
      activeJobs: this.activeJobs.size,
      uptime: process.uptime()
    };
  }
}
