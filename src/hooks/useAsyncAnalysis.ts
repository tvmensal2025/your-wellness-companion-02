import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type JobType = 'food_image' | 'medical_exam' | 'body_composition';
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface AnalysisJob {
  id: string;
  user_id: string;
  job_type: JobType;
  status: JobStatus;
  input_data: any;
  result: any;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  estimated_duration_seconds: number;
}

export interface UseAsyncAnalysisOptions {
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  autoRetry?: boolean;
  maxRetries?: number;
}

export function useAsyncAnalysis(
  userId: string | undefined,
  options: UseAsyncAnalysisOptions = {}
) {
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [currentJob, setCurrentJob] = useState<AnalysisJob | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const channelRef = useRef<any>(null);
  const retryCountRef = useRef<number>(0);

  // Cleanup channel on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  // Subscribe to job updates via Realtime
  useEffect(() => {
    if (!userId || !currentJob) return;

    console.log(`📡 Inscrevendo-se em atualizações do job ${currentJob.id}`);

    // Remove existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel
    const channel = supabase
      .channel(`analysis_job_${currentJob.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analysis_jobs',
          filter: `id=eq.${currentJob.id}`
        },
        (payload) => {
          console.log('📥 Atualização do job recebida:', payload.new);
          const updatedJob = payload.new as AnalysisJob;
          
          setCurrentJob(updatedJob);

          if (updatedJob.status === 'processing') {
            setStatus('processing');
            // Simular progresso baseado no tempo estimado
            const elapsed = Date.now() - new Date(updatedJob.started_at || updatedJob.created_at).getTime();
            const estimated = updatedJob.estimated_duration_seconds * 1000;
            const progressPercent = Math.min(90, (elapsed / estimated) * 100);
            setProgress(progressPercent);
          } else if (updatedJob.status === 'completed') {
            setStatus('completed');
            setResult(updatedJob.result);
            setProgress(100);
            setError(null);
            
            toast({
              title: 'Análise completa! 🎉',
              description: 'Sua análise foi processada com sucesso.',
            });

            if (options.onComplete) {
              options.onComplete(updatedJob.result);
            }

            // Cleanup channel
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
          } else if (updatedJob.status === 'failed') {
            setStatus('error');
            setError(updatedJob.error_message || 'Erro desconhecido');
            setProgress(0);
            
            // Retry logic
            if (options.autoRetry && retryCountRef.current < (options.maxRetries || 3)) {
              retryCountRef.current++;
              console.log(`🔄 Tentando novamente (${retryCountRef.current}/${options.maxRetries || 3})...`);
              
              toast({
                title: 'Tentando novamente...',
                description: `Tentativa ${retryCountRef.current} de ${options.maxRetries || 3}`,
              });

              // Retry after 2 seconds
              setTimeout(() => {
                // Re-enqueue the job
                enqueueAnalysis(
                  updatedJob.job_type,
                  updatedJob.input_data.imageUrl,
                  updatedJob.input_data.userContext,
                  updatedJob.input_data.mealType
                );
              }, 2000);
            } else {
              toast({
                title: 'Erro na análise',
                description: updatedJob.error_message || 'Ocorreu um erro ao processar sua análise.',
                variant: 'destructive',
              });

              if (options.onError) {
                options.onError(updatedJob.error_message || 'Erro desconhecido');
              }

              // Cleanup channel
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
              }
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, currentJob?.id, toast, options]);

  // Enqueue analysis
  const enqueueAnalysis = useCallback(
    async (
      jobType: JobType,
      imageUrl: string,
      userContext?: any,
      mealType?: string
    ) => {
      if (!userId) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar logado para fazer análises.',
          variant: 'destructive',
        });
        return null;
      }

      setStatus('uploading');
      setError(null);
      setProgress(0);
      retryCountRef.current = 0;

      try {
        console.log(`📤 Enfileirando análise: ${jobType}`);

        const response = await supabase.functions.invoke('enqueue-analysis', {
          body: {
            imageUrl,
            userId,
            jobType,
            userContext,
            mealType
          }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const data = response.data;

        // Check if cached result
        if (data.cached) {
          console.log('✅ Resultado do cache');
          setStatus('completed');
          setResult(data.result);
          setProgress(100);
          
          toast({
            title: 'Resultado instantâneo! ⚡',
            description: 'Encontramos uma análise recente idêntica.',
          });

          if (options.onComplete) {
            options.onComplete(data.result);
          }

          return data.result;
        }

        // Job enqueued, wait for updates
        console.log(`✅ Job enfileirado: ${data.job_id}`);
        setStatus('processing');
        setProgress(10);

        // Fetch job details
        const { data: jobData, error: jobError } = await supabase
          .from('analysis_jobs')
          .select('*')
          .eq('id', data.job_id)
          .single();

        if (jobError) {
          throw new Error(jobError.message);
        }

        setCurrentJob(jobData);

        toast({
          title: 'Processando...',
          description: data.message,
        });

        return data.job_id;

      } catch (err) {
        console.error('❌ Erro ao enfileirar análise:', err);
        const error = err as Error;
        setStatus('error');
        setError(error.message);
        
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao iniciar análise.',
          variant: 'destructive',
        });

        if (options.onError) {
          options.onError(error.message);
        }

        return null;
      }
    },
    [userId, toast, options]
  );

  // Cancel analysis
  const cancelAnalysis = useCallback(async () => {
    if (!currentJob) return;

    try {
      const { error } = await supabase
        .from('analysis_jobs')
        .update({ status: 'cancelled' })
        .eq('id', currentJob.id);

      if (error) throw error;

      setStatus('idle');
      setCurrentJob(null);
      setProgress(0);

      toast({
        title: 'Análise cancelada',
        description: 'A análise foi cancelada com sucesso.',
      });

    } catch (err) {
      console.error('❌ Erro ao cancelar análise:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a análise.',
        variant: 'destructive',
      });
    }
  }, [currentJob, toast]);

  // Reset state
  const reset = useCallback(() => {
    setStatus('idle');
    setCurrentJob(null);
    setResult(null);
    setError(null);
    setProgress(0);
    retryCountRef.current = 0;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return {
    // State
    status,
    currentJob,
    result,
    error,
    progress,
    
    // Actions
    enqueueAnalysis,
    cancelAnalysis,
    reset,
    
    // Computed
    isProcessing: status === 'processing' || status === 'uploading',
    isCompleted: status === 'completed',
    hasError: status === 'error',
  };
}
