import { Registry, Counter, Gauge, Histogram } from 'prom-client';

const register = new Registry();

// Job metrics
const jobsProcessed = new Counter({
  name: 'ai_worker_jobs_processed_total',
  help: 'Total number of jobs processed',
  labelNames: ['type', 'status'],
  registers: [register]
});

const jobDuration = new Histogram({
  name: 'ai_worker_job_duration_seconds',
  help: 'Job processing duration in seconds',
  labelNames: ['type', 'status'],
  buckets: [1, 5, 10, 15, 30, 60],
  registers: [register]
});

const activeJobs = new Gauge({
  name: 'ai_worker_active_jobs',
  help: 'Number of currently active jobs',
  registers: [register]
});

const queueSize = new Gauge({
  name: 'ai_worker_queue_size',
  help: 'Number of pending jobs in queue',
  registers: [register]
});

// Error metrics
const workerErrors = new Counter({
  name: 'ai_worker_errors_total',
  help: 'Total number of worker errors',
  labelNames: ['type'],
  registers: [register]
});

// Cache metrics
const cacheHits = new Counter({
  name: 'ai_worker_cache_hits_total',
  help: 'Total number of cache hits',
  registers: [register]
});

const cacheMisses = new Counter({
  name: 'ai_worker_cache_misses_total',
  help: 'Total number of cache misses',
  registers: [register]
});

export const metrics = {
  register,
  jobsProcessed,
  jobDuration,
  activeJobs,
  queueSize,
  workerErrors,
  cacheHits,
  cacheMisses
};
