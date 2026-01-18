# 💻 Code Examples - VPS AI Worker Migration

Quick reference for implementation with copy-paste ready code.

---

## 1. Database Migration

### supabase/migrations/20260117_create_async_jobs_system.sql

```sql
-- Create analysis_jobs table
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Job type
  type TEXT NOT NULL CHECK (type IN (
    'sofia_image',
    'sofia_text',
    'medical_exam',
    'unified_assistant',
    'meal_plan',
    'whatsapp_message'
  )),
  
  -- Input and output
  input JSONB NOT NULL,
  result JSONB,
  error TEXT,
  
  -- Status and control
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  )),
  
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  
  -- Metadata
  processing_time_ms INTEGER,
  worker_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_jobs_status_priority ON analysis_jobs(status, priority, created_at);
CREATE INDEX idx_jobs_user_created ON analysis_jobs(user_id, created_at DESC);
CREATE INDEX idx_jobs_type_status ON analysis_jobs(type, status);

-- Enable RLS
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own jobs"
  ON analysis_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON analysis_jobs FOR ALL
  USING (auth.role() = 'service_role');

-- Create analysis_cache table
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  response JSONB NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_cache_key ON analysis_cache(cache_key);
CREATE INDEX idx_cache_expires ON analysis_cache(expires_at);

-- Cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM analysis_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analysis_jobs_updated_at
  BEFORE UPDATE ON analysis_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 2. Gateway Edge Function

### supabase/functions/enqueue-analysis/index.ts

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { createHash } from "https://deno.land/std@0.168.0/hash/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, input, priority = 5, useCache = true } = await req.json();

    // Validate input
    if (!type || !input) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache if enabled
    if (useCache) {
      const cacheKey = generateCacheKey(type, input);
      const { data: cached } = await supabase
        .from('analysis_cache')
        .select('response, hit_count')
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cached) {
        // Update hit count
        await supabase
          .from('analysis_cache')
          .update({ 
            hit_count: cached.hit_count + 1,
            last_hit_at: new Date().toISOString()
          })
          .eq('cache_key', cacheKey);

        console.log(`✅ Cache hit for ${type}`);
        
        return new Response(
          JSON.stringify({
            jobId: null,
            status: 'completed',
            result: cached.response,
            cached: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create job
    const { data: job, error } = await supabase
      .from('analysis_jobs')
      .insert({
        type,
        input,
        priority,
        user_id: input.userId || 'anonymous'
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Job enqueued: ${job.id} (type: ${type})`);

    return new Response(
      JSON.stringify({
        jobId: job.id,
        status: 'pending',
        estimatedTime: getEstimatedTime(type),
        pollUrl: `/functions/v1/get-analysis-status?jobId=${job.id}`
      }),
      { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateCacheKey(type: string, input: any): string {
  const normalized = JSON.stringify(input, Object.keys(input).sort());
  const hash = createHash("sha256");
  hash.update(normalized);
  return `${type}:${hash.toString()}`;
}

function getEstimatedTime(type: string): number {
  const estimates: Record<string, number> = {
    'sofia_image': 10,
    'medical_exam': 15,
    'unified_assistant': 8,
    'meal_plan': 12,
    'whatsapp_message': 5
  };
  return estimates[type] || 10;
}
```

---

## 3. VPS AI Worker

### vps-backend/src/ai-worker/index.ts

```typescript
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const app = express();
app.use(express.json());

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const WORKER_ID = process.env.WORKER_ID || 'worker-1';
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5');
const POLL_INTERVAL = parseInt(process.env.WORKER_POLL_INTERVAL_MS || '1000');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Active jobs tracking
const activeJobs = new Set<string>();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  const { count: queueSize } = await supabase
    .from('analysis_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    version: '1.0.0',
    worker: {
      id: WORKER_ID,
      concurrency: CONCURRENCY,
      activeJobs: activeJobs.size,
      queueSize: queueSize || 0
    }
  });
});

// Main worker loop
async function workerLoop() {
  while (true) {
    try {
      // Check if we can process more jobs
      if (activeJobs.size >= CONCURRENCY) {
        await sleep(POLL_INTERVAL);
        continue;
      }

      // Fetch pending jobs
      const availableSlots = CONCURRENCY - activeJobs.size;
      const { data: jobs } = await supabase
        .from('analysis_jobs')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(availableSlots);

      if (!jobs || jobs.length === 0) {
        await sleep(POLL_INTERVAL);
        continue;
      }

      // Process jobs in parallel
      for (const job of jobs) {
        processJob(job); // Fire and forget
      }

    } catch (error) {
      console.error('Worker loop error:', error);
      await sleep(5000); // Backoff on error
    }
  }
}

async function processJob(job: any) {
  activeJobs.add(job.id);
  const startTime = Date.now();

  try {
    console.log(`🔄 Processing job ${job.id} (type: ${job.type})`);

    // Mark as processing
    await supabase
      .from('analysis_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        worker_id: WORKER_ID
      })
      .eq('id', job.id);

    // Process based on type
    let result;
    switch (job.type) {
      case 'sofia_image':
        result = await processSofiaImage(job.input);
        break;
      case 'medical_exam':
        result = await processMedicalExam(job.input);
        break;
      case 'unified_assistant':
        result = await processUnifiedAssistant(job.input);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    // Mark as completed
    const processingTime = Date.now() - startTime;
    await supabase
      .from('analysis_jobs')
      .update({
        status: 'completed',
        result,
        completed_at: new Date().toISOString(),
        processing_time_ms: processingTime
      })
      .eq('id', job.id);

    // Cache result
    await cacheResult(job, result);

    console.log(`✅ Job ${job.id} completed in ${processingTime}ms`);

  } catch (error) {
    console.error(`❌ Job ${job.id} failed:`, error);
    await handleJobError(job, error);
  } finally {
    activeJobs.delete(job.id);
  }
}

async function processSofiaImage(input: any) {
  // 1. Call YOLO
  const yoloResponse = await axios.post(
    `${process.env.YOLO_URL}/detect`,
    { image_url: input.imageUrl },
    { timeout: 10000 }
  );

  // 2. Call Gemini with YOLO context
  const geminiResponse = await axios.post(
    'https://ai.gateway.lovable.dev/v1/chat/completions',
    {
      model: 'google/gemini-2.5-pro',
      messages: [{
        role: 'user',
        content: `Analyze this food image. YOLO detected: ${JSON.stringify(yoloResponse.data)}`
      }]
    },
    {
      headers: { 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` },
      timeout: 30000
    }
  );

  // 3. Format result
  return {
    foods: geminiResponse.data.choices[0].message.content,
    yolo_detections: yoloResponse.data,
    timestamp: new Date().toISOString()
  };
}

async function processMedicalExam(input: any) {
  // Similar to processSofiaImage
  return { analysis: 'Medical exam analysis result' };
}

async function processUnifiedAssistant(input: any) {
  // Similar to processSofiaImage
  return { response: 'AI assistant response' };
}

async function handleJobError(job: any, error: any) {
  const attempts = job.attempts + 1;

  if (attempts >= job.max_attempts) {
    // Max retries reached
    await supabase
      .from('analysis_jobs')
      .update({
        status: 'failed',
        error: error.message,
        attempts,
        completed_at: new Date().toISOString()
      })
      .eq('id', job.id);
  } else {
    // Retry
    await supabase
      .from('analysis_jobs')
      .update({
        status: 'pending',
        attempts,
        error: `Retry ${attempts}/${job.max_attempts}: ${error.message}`
      })
      .eq('id', job.id);
  }
}

async function cacheResult(job: any, result: any) {
  const cacheKey = generateCacheKey(job.type, job.input);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await supabase
    .from('analysis_cache')
    .upsert({
      cache_key: cacheKey,
      type: job.type,
      response: result,
      expires_at: expiresAt.toISOString()
    });
}

function generateCacheKey(type: string, input: any): string {
  const normalized = JSON.stringify(input, Object.keys(input).sort());
  return `${type}:${Buffer.from(normalized).toString('base64')}`;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 AI Worker ${WORKER_ID} listening on port ${PORT}`);
  workerLoop(); // Start worker loop
});
```

---

## 4. Frontend Hook

### src/hooks/useAsyncAnalysis.ts

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

type JobType = 'sofia_image' | 'medical_exam' | 'unified_assistant' | 'meal_plan';
type JobStatus = 'idle' | 'enqueuing' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'error';

interface UseAsyncAnalysisOptions {
  type: JobType;
  pollInterval?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export function useAsyncAnalysis(options: UseAsyncAnalysisOptions) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  // Check feature flag
  const useAsync = useMemo(() => {
    switch (options.type) {
      case 'sofia_image':
        return import.meta.env.VITE_USE_ASYNC_SOFIA === 'true';
      case 'medical_exam':
        return import.meta.env.VITE_USE_ASYNC_EXAMS === 'true';
      case 'unified_assistant':
        return import.meta.env.VITE_USE_ASYNC_UNIFIED === 'true';
      case 'meal_plan':
        return import.meta.env.VITE_USE_ASYNC_MEAL_PLAN === 'true';
      default:
        return false;
    }
  }, [options.type]);

  // Enqueue job
  const enqueue = useCallback(async (input: any) => {
    if (!useAsync) {
      // Fallback to sync
      console.log('Using sync fallback');
      return await callSyncFunction(options.type, input);
    }

    try {
      setStatus('enqueuing');
      setError(null);

      const { data, error: invokeError } = await supabase.functions.invoke('enqueue-analysis', {
        body: { type: options.type, input }
      });

      if (invokeError) throw invokeError;

      if (data.cached) {
        // Cache hit - return immediately
        setResult(data.result);
        setStatus('completed');
        options.onSuccess?.(data.result);
        return data.result;
      }

      // Job enqueued - start polling
      setJobId(data.jobId);
      setStatus('pending');

    } catch (err: any) {
      console.error('Enqueue error:', err);
      setError(err);
      setStatus('error');
      options.onError?.(err);
      
      // Fallback to sync on error
      console.log('Falling back to sync due to error');
      return await callSyncFunction(options.type, input);
    }
  }, [useAsync, options]);

  // Poll for status
  useEffect(() => {
    if (!jobId || status === 'completed' || status === 'error' || status === 'cancelled') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const { data, error: statusError } = await supabase.functions.invoke('get-analysis-status', {
          body: { jobId }
        });

        if (statusError) throw statusError;

        setStatus(data.status);

        if (data.status === 'completed') {
          setResult(data.result);
          options.onSuccess?.(data.result);
        } else if (data.status === 'failed') {
          const err = new Error(data.error || 'Job failed');
          setError(err);
          options.onError?.(err);
        }

      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, options.pollInterval || 2000);

    return () => clearInterval(interval);
  }, [jobId, status, options]);

  // Cancel job
  const cancel = useCallback(async () => {
    if (!jobId) return;

    await supabase
      .from('analysis_jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId);

    setStatus('cancelled');
  }, [jobId]);

  return {
    enqueue,
    cancel,
    status,
    result,
    error,
    isLoading: ['enqueuing', 'pending', 'processing'].includes(status)
  };
}

// Fallback to sync function
async function callSyncFunction(type: JobType, input: any) {
  const functionMap: Record<JobType, string> = {
    'sofia_image': 'sofia-image-analysis',
    'medical_exam': 'analyze-medical-exam',
    'unified_assistant': 'unified-ai-assistant',
    'meal_plan': 'generate-meal-plan-taco'
  };

  const { data, error } = await supabase.functions.invoke(functionMap[type], {
    body: input
  });

  if (error) throw error;
  return data;
}
```

---

## 5. Component Example

### src/components/nutrition/QuickPhotoCapture.tsx (Migrated)

```typescript
import { useAsyncAnalysis } from '@/hooks/useAsyncAnalysis';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export function QuickPhotoCapture() {
  const { enqueue, cancel, status, result, error, isLoading } = useAsyncAnalysis({
    type: 'sofia_image',
    onSuccess: (result) => {
      toast.success('Análise concluída!');
      console.log('Result:', result);
    },
    onError: (error) => {
      toast.error('Erro na análise: ' + error.message);
    }
  });

  const handleCapture = async (imageUrl: string) => {
    await enqueue({
      imageUrl,
      mealType: 'lunch',
      userId: 'current-user-id'
    });
  };

  return (
    <div className="space-y-4">
      <Camera onCapture={handleCapture} />

      {isLoading && (
        <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="font-medium">Analisando imagem...</p>
          <p className="text-sm text-muted-foreground">
            {status === 'enqueuing' && 'Enviando...'}
            {status === 'pending' && 'Na fila...'}
            {status === 'processing' && 'Processando...'}
          </p>
          <Button variant="outline" size="sm" onClick={cancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      )}

      {result && <ResultDisplay result={result} />}
      {error && <ErrorDisplay error={error} />}
    </div>
  );
}
```

---

## 6. Dockerfile

### vps-backend/src/ai-worker/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start worker
CMD ["node", "dist/index.js"]
```

---

## 7. Environment Variables

### .env.example (VPS Worker)

```env
# Supabase
SUPABASE_URL=https://ciszqtlaacrhfwsqnvjr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services (Internal EasyPanel URLs)
YOLO_URL=http://yolo-service:8000
OLLAMA_URL=http://ollama-web:11434
GEMINI_API_KEY=your-gemini-key

# Worker Configuration
WORKER_ID=ai-worker-1
WORKER_CONCURRENCY=5
WORKER_POLL_INTERVAL_MS=1000
WORKER_MAX_RETRIES=3
WORKER_STUCK_JOB_TIMEOUT_MS=300000

# Cache
ENABLE_CACHE=true
CACHE_TTL_HOURS=24

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL=info
PORT=3001
```

### .env (Frontend)

```env
# Feature Flags
VITE_USE_ASYNC_SOFIA=false
VITE_USE_ASYNC_EXAMS=false
VITE_USE_ASYNC_UNIFIED=false
VITE_USE_ASYNC_MEAL_PLAN=false
VITE_USE_ASYNC_WHATSAPP=false

# Worker URL
VITE_AI_WORKER_URL=https://ai-worker.easypanel.host
```

---

**Ready to copy-paste and start implementing!** 🚀
