import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

type JobType = 'sofia_image' | 'sofia_text' | 'medical_exam' | 'unified_assistant' | 'meal_plan' | 'whatsapp_message';
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
      case 'sofia_text':
        return import.meta.env.VITE_USE_ASYNC_SOFIA === 'true';
      case 'medical_exam':
        return import.meta.env.VITE_USE_ASYNC_EXAMS === 'true';
      case 'unified_assistant':
        return import.meta.env.VITE_USE_ASYNC_UNIFIED === 'true';
      case 'meal_plan':
        return import.meta.env.VITE_USE_ASYNC_MEAL_PLAN === 'true';
      case 'whatsapp_message':
        return import.meta.env.VITE_USE_ASYNC_WHATSAPP === 'true';
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
    'sofia_text': 'sofia-image-analysis',
    'medical_exam': 'analyze-medical-exam',
    'unified_assistant': 'unified-ai-assistant',
    'meal_plan': 'generate-meal-plan-taco',
    'whatsapp_message': 'whatsapp-ai-assistant'
  };

  const { data, error } = await supabase.functions.invoke(functionMap[type], {
    body: input
  });

  if (error) throw error;
  return data;
}
