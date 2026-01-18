import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type JobType = 'sofia_image' | 'sofia_text' | 'medical_exam' | 'unified_assistant' | 'meal_plan' | 'whatsapp_message' | 'food_image';
type JobStatus = 'idle' | 'enqueuing' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'error' | 'uploading';

interface UseAsyncAnalysisOptions {
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  autoRetry?: boolean;
  maxRetries?: number;
  pollInterval?: number;
}

interface AsyncAnalysisResult {
  // Actions
  enqueueAnalysis: (type: JobType, imageUrl: string, context?: Record<string, any>, mealType?: string) => Promise<any>;
  cancelAnalysis: () => Promise<void>;
  reset: () => void;
  
  // State
  status: JobStatus;
  result: any;
  error: string | null;
  progress: number;
  
  // Derived state
  isLoading: boolean;
  isProcessing: boolean;
  isCompleted: boolean;
  hasError: boolean;
  
  // Legacy aliases
  enqueue: (type: JobType, imageUrl: string, context?: Record<string, any>, mealType?: string) => Promise<any>;
  cancel: () => Promise<void>;
}

export function useAsyncAnalysis(userId?: string, options: UseAsyncAnalysisOptions = {}): AsyncAnalysisResult {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const { pollInterval = 2000, autoRetry = false, maxRetries = 3 } = options;

  // Derived states
  const isProcessing = ['enqueuing', 'pending', 'processing', 'uploading'].includes(status);
  const isCompleted = status === 'completed';
  const hasError = status === 'error' || status === 'failed';
  const isLoading = isProcessing;

  // Enqueue analysis job
  const enqueueAnalysis = useCallback(async (
    type: JobType,
    imageUrl: string,
    context?: Record<string, any>,
    mealType?: string
  ) => {
    if (!userId) {
      setError('Usuário não autenticado');
      setStatus('error');
      return null;
    }

    try {
      setStatus('enqueuing');
      setError(null);
      setProgress(10);

      const { data, error: invokeError } = await supabase.functions.invoke('enqueue-analysis', {
        body: { 
          type, 
          input: { 
            imageUrl, 
            userId,
            context,
            mealType 
          } 
        }
      });

      if (invokeError) throw invokeError;

      if (data?.cached) {
        // Cache hit - return immediately
        setResult(data.result);
        setStatus('completed');
        setProgress(100);
        options.onComplete?.(data.result);
        return data.result;
      }

      // Job enqueued - start polling
      setJobId(data?.jobId);
      setStatus('pending');
      setProgress(20);
      return null;

    } catch (err: any) {
      console.error('Enqueue error:', err);
      const errorMessage = err?.message || 'Erro ao iniciar análise';
      setError(errorMessage);
      setStatus('error');
      options.onError?.(errorMessage);
      
      // Auto retry if enabled
      if (autoRetry && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
      }
      
      return null;
    }
  }, [userId, options, autoRetry, maxRetries, retryCount]);

  // Poll for status
  useEffect(() => {
    if (!jobId || status === 'completed' || status === 'error' || status === 'cancelled' || status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const { data, error: statusError } = await supabase.functions.invoke('get-analysis-status', {
          body: { jobId }
        });

        if (statusError) throw statusError;

        const newStatus = data?.status as JobStatus;
        setStatus(newStatus);

        // Update progress based on status
        if (newStatus === 'pending') setProgress(30);
        if (newStatus === 'processing') setProgress(60);

        if (newStatus === 'completed') {
          setResult(data.result);
          setProgress(100);
          options.onComplete?.(data.result);
        } else if (newStatus === 'failed') {
          const errMsg = data?.error || 'Job falhou';
          setError(errMsg);
          options.onError?.(errMsg);
        }

      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [jobId, status, options, pollInterval]);

  // Cancel job
  const cancelAnalysis = useCallback(async () => {
    if (!jobId) return;

    try {
      await supabase
        .from('analysis_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId);

      setStatus('cancelled');
      setProgress(0);
    } catch (err) {
      console.error('Cancel error:', err);
    }
  }, [jobId]);

  // Reset state
  const reset = useCallback(() => {
    setJobId(null);
    setStatus('idle');
    setResult(null);
    setError(null);
    setProgress(0);
    setRetryCount(0);
  }, []);

  return {
    // Actions
    enqueueAnalysis,
    cancelAnalysis,
    reset,
    
    // State
    status,
    result,
    error,
    progress,
    
    // Derived state
    isLoading,
    isProcessing,
    isCompleted,
    hasError,
    
    // Legacy aliases
    enqueue: enqueueAnalysis,
    cancel: cancelAnalysis,
  };
}
