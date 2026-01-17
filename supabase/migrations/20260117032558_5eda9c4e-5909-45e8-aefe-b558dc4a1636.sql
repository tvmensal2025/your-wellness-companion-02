-- =====================================================
-- SISTEMA DE JOBS ASSÍNCRONOS PARA ANÁLISE DE IMAGENS
-- =====================================================

-- 1. Criar tabela de jobs de análise
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('food_image', 'medical_exam', 'body_composition')),
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  result JSONB,
  error_message TEXT,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_duration_seconds INTEGER DEFAULT 10,
  actual_duration_seconds INTEGER,
  worker_id TEXT
);

-- 2. Criar tabela de fila de jobs
CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 5,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  lock_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id)
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user_id ON public.analysis_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON public.analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created_at ON public.analysis_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user_status ON public.analysis_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_job_queue_priority ON public.job_queue(priority DESC, scheduled_at ASC);
CREATE INDEX IF NOT EXISTS idx_job_queue_locked ON public.job_queue(locked_at) WHERE locked_at IS NULL;

-- 4. Atualizar analysis_cache com colunas faltantes
ALTER TABLE public.analysis_cache 
ADD COLUMN IF NOT EXISTS cache_key TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Backfill cache_key com image_hash
UPDATE public.analysis_cache SET cache_key = image_hash WHERE cache_key IS NULL;

-- Backfill expires_at com created_at + 1 hora
UPDATE public.analysis_cache SET expires_at = created_at + INTERVAL '1 hour' WHERE expires_at IS NULL;

-- 5. Habilitar RLS nas tabelas
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para analysis_jobs
CREATE POLICY "Users can view their own jobs"
ON public.analysis_jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs"
ON public.analysis_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all jobs"
ON public.analysis_jobs FOR ALL
USING (auth.role() = 'service_role');

-- 7. Políticas RLS para job_queue (apenas service_role)
CREATE POLICY "Service role can manage job queue"
ON public.job_queue FOR ALL
USING (auth.role() = 'service_role');

-- 8. Função para enfileirar job
CREATE OR REPLACE FUNCTION public.enqueue_job(
  p_job_id UUID,
  p_priority INTEGER DEFAULT 5,
  p_scheduled_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO public.job_queue (job_id, priority, scheduled_at)
  VALUES (p_job_id, p_priority, p_scheduled_at)
  ON CONFLICT (job_id) DO UPDATE SET
    priority = EXCLUDED.priority,
    scheduled_at = EXCLUDED.scheduled_at
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$;

-- 9. Função para pegar próximo job disponível
CREATE OR REPLACE FUNCTION public.get_next_job(
  p_worker_id TEXT,
  p_lock_duration INTERVAL DEFAULT '5 minutes'
)
RETURNS TABLE (
  job_id UUID,
  job_type TEXT,
  input_data JSONB,
  priority INTEGER,
  attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_queue_record RECORD;
  v_job_record RECORD;
BEGIN
  -- Selecionar e travar o próximo job disponível
  SELECT jq.* INTO v_queue_record
  FROM public.job_queue jq
  WHERE jq.scheduled_at <= NOW()
    AND (jq.locked_at IS NULL OR jq.lock_expires_at < NOW())
  ORDER BY jq.priority DESC, jq.scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF v_queue_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Travar o job
  UPDATE public.job_queue
  SET locked_at = NOW(),
      locked_by = p_worker_id,
      lock_expires_at = NOW() + p_lock_duration
  WHERE id = v_queue_record.id;
  
  -- Atualizar status do job
  UPDATE public.analysis_jobs
  SET status = 'processing',
      started_at = NOW(),
      attempts = attempts + 1,
      worker_id = p_worker_id,
      updated_at = NOW()
  WHERE id = v_queue_record.job_id
  RETURNING * INTO v_job_record;
  
  -- Retornar dados do job
  RETURN QUERY
  SELECT 
    v_job_record.id,
    v_job_record.job_type,
    v_job_record.input_data,
    v_queue_record.priority,
    v_job_record.attempts;
END;
$$;

-- 10. Função para marcar job como completo
CREATE OR REPLACE FUNCTION public.complete_job(
  p_job_id UUID,
  p_result JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_started_at TIMESTAMPTZ;
BEGIN
  -- Buscar started_at para calcular duração
  SELECT started_at INTO v_started_at
  FROM public.analysis_jobs
  WHERE id = p_job_id;
  
  -- Atualizar job como completo
  UPDATE public.analysis_jobs
  SET status = 'completed',
      result = p_result,
      completed_at = NOW(),
      actual_duration_seconds = EXTRACT(EPOCH FROM (NOW() - v_started_at))::INTEGER,
      updated_at = NOW()
  WHERE id = p_job_id;
  
  -- Remover da fila
  DELETE FROM public.job_queue WHERE job_id = p_job_id;
  
  RETURN FOUND;
END;
$$;

-- 11. Função para marcar job como falho
CREATE OR REPLACE FUNCTION public.fail_job(
  p_job_id UUID,
  p_error_message TEXT,
  p_should_retry BOOLEAN DEFAULT TRUE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
  v_delay INTERVAL;
BEGIN
  -- Buscar job atual
  SELECT * INTO v_job
  FROM public.analysis_jobs
  WHERE id = p_job_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se deve fazer retry
  IF p_should_retry AND v_job.attempts < v_job.max_attempts THEN
    -- Calcular delay exponencial: 30s, 60s, 120s
    v_delay := (30 * POWER(2, v_job.attempts - 1)) * INTERVAL '1 second';
    
    -- Reagendar na fila
    UPDATE public.job_queue
    SET locked_at = NULL,
        locked_by = NULL,
        lock_expires_at = NULL,
        scheduled_at = NOW() + v_delay
    WHERE job_id = p_job_id;
    
    -- Atualizar status para queued
    UPDATE public.analysis_jobs
    SET status = 'queued',
        error_message = p_error_message,
        updated_at = NOW()
    WHERE id = p_job_id;
  ELSE
    -- Marcar como falho permanentemente
    UPDATE public.analysis_jobs
    SET status = 'failed',
        error_message = p_error_message,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_job_id;
    
    -- Remover da fila
    DELETE FROM public.job_queue WHERE job_id = p_job_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 12. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_analysis_jobs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_analysis_jobs_updated_at ON public.analysis_jobs;
CREATE TRIGGER trigger_analysis_jobs_updated_at
  BEFORE UPDATE ON public.analysis_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_analysis_jobs_updated_at();

-- 13. Habilitar Realtime para analysis_jobs
ALTER PUBLICATION supabase_realtime ADD TABLE public.analysis_jobs;