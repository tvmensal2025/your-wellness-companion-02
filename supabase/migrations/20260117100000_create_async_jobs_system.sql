-- =====================================================
-- SISTEMA DE JOBS ASSÍNCRONOS
-- Arquitetura: Edge → Fila → Worker → Realtime
-- =====================================================

-- Tabela de jobs de análise
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de análise
  job_type TEXT NOT NULL CHECK (job_type IN ('food_image', 'medical_exam', 'body_composition')),
  
  -- Dados de entrada
  input_data JSONB NOT NULL, -- { imageUrl, mealType, etc }
  
  -- Status do job
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Resultado
  result JSONB, -- Resultado da análise quando completo
  error_message TEXT, -- Mensagem de erro se falhou
  
  -- Metadados
  priority INTEGER DEFAULT 5, -- 1-10, maior = mais prioritário
  attempts INTEGER DEFAULT 0, -- Número de tentativas
  max_attempts INTEGER DEFAULT 3,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Estimativas
  estimated_duration_seconds INTEGER DEFAULT 10,
  actual_duration_seconds INTEGER,
  
  -- Worker info
  worker_id TEXT, -- ID do worker que processou
  
  -- Índices para queries rápidas
  CONSTRAINT valid_timestamps CHECK (
    (started_at IS NULL OR started_at >= created_at) AND
    (completed_at IS NULL OR completed_at >= created_at)
  )
);

-- Índices para performance
CREATE INDEX idx_analysis_jobs_user_id ON analysis_jobs(user_id);
CREATE INDEX idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX idx_analysis_jobs_created_at ON analysis_jobs(created_at DESC);
CREATE INDEX idx_analysis_jobs_priority ON analysis_jobs(priority DESC, created_at ASC);
CREATE INDEX idx_analysis_jobs_user_status ON analysis_jobs(user_id, status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_analysis_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_analysis_jobs_updated_at
  BEFORE UPDATE ON analysis_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_analysis_jobs_updated_at();

-- =====================================================
-- FILA DE PROCESSAMENTO
-- =====================================================

CREATE TABLE IF NOT EXISTS job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES analysis_jobs(id) ON DELETE CASCADE,
  
  -- Prioridade e ordenação
  priority INTEGER NOT NULL DEFAULT 5,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(), -- Quando deve ser processado
  
  -- Controle de processamento
  locked_at TIMESTAMPTZ, -- Quando foi travado por um worker
  locked_by TEXT, -- ID do worker que travou
  lock_expires_at TIMESTAMPTZ, -- Quando o lock expira
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: não pode ter lock expirado sem locked_at
  CONSTRAINT valid_lock CHECK (
    (locked_at IS NULL AND locked_by IS NULL AND lock_expires_at IS NULL) OR
    (locked_at IS NOT NULL AND locked_by IS NOT NULL AND lock_expires_at IS NOT NULL)
  )
);

-- Índices para fila
CREATE INDEX idx_job_queue_priority ON job_queue(priority DESC, scheduled_at ASC);
CREATE INDEX idx_job_queue_locked ON job_queue(locked_at) WHERE locked_at IS NOT NULL;
CREATE INDEX idx_job_queue_job_id ON job_queue(job_id);

-- =====================================================
-- CACHE DE RESULTADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Chave de cache (hash do input)
  cache_key TEXT NOT NULL UNIQUE,
  
  -- Tipo de análise
  analysis_type TEXT NOT NULL,
  
  -- Resultado cacheado
  result JSONB NOT NULL,
  
  -- Metadados
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  
  -- TTL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Índices
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Índices para cache
CREATE INDEX idx_analysis_cache_key ON analysis_cache(cache_key);
CREATE INDEX idx_analysis_cache_expires ON analysis_cache(expires_at);
CREATE INDEX idx_analysis_cache_type ON analysis_cache(analysis_type);

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analysis_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- analysis_jobs: usuários só veem seus próprios jobs
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs"
  ON analysis_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
  ON analysis_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON analysis_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- job_queue: apenas service role
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to job_queue"
  ON job_queue FOR ALL
  USING (auth.role() = 'service_role');

-- analysis_cache: apenas service role
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to cache"
  ON analysis_cache FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Enfileirar job
CREATE OR REPLACE FUNCTION enqueue_job(
  p_job_id UUID,
  p_priority INTEGER DEFAULT 5,
  p_scheduled_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO job_queue (job_id, priority, scheduled_at)
  VALUES (p_job_id, p_priority, p_scheduled_at)
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pegar próximo job da fila
CREATE OR REPLACE FUNCTION get_next_job(
  p_worker_id TEXT,
  p_lock_duration_seconds INTEGER DEFAULT 300
)
RETURNS TABLE (
  queue_id UUID,
  job_id UUID,
  job_type TEXT,
  input_data JSONB,
  priority INTEGER
) AS $$
DECLARE
  v_queue_record RECORD;
BEGIN
  -- Buscar próximo job disponível
  SELECT jq.id, jq.job_id, jq.priority, aj.job_type, aj.input_data
  INTO v_queue_record
  FROM job_queue jq
  JOIN analysis_jobs aj ON aj.id = jq.job_id
  WHERE 
    jq.scheduled_at <= NOW() AND
    (jq.locked_at IS NULL OR jq.lock_expires_at < NOW()) AND
    aj.status = 'queued'
  ORDER BY jq.priority DESC, jq.scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  -- Se encontrou job, travar
  IF FOUND THEN
    UPDATE job_queue
    SET 
      locked_at = NOW(),
      locked_by = p_worker_id,
      lock_expires_at = NOW() + (p_lock_duration_seconds || ' seconds')::INTERVAL
    WHERE id = v_queue_record.id;
    
    -- Atualizar status do job
    UPDATE analysis_jobs
    SET 
      status = 'processing',
      started_at = NOW(),
      worker_id = p_worker_id,
      attempts = attempts + 1
    WHERE id = v_queue_record.job_id;
    
    -- Retornar job
    RETURN QUERY
    SELECT 
      v_queue_record.id,
      v_queue_record.job_id,
      v_queue_record.job_type,
      v_queue_record.input_data,
      v_queue_record.priority;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Completar job
CREATE OR REPLACE FUNCTION complete_job(
  p_job_id UUID,
  p_result JSONB
)
RETURNS VOID AS $$
BEGIN
  -- Atualizar job
  UPDATE analysis_jobs
  SET 
    status = 'completed',
    result = p_result,
    completed_at = NOW(),
    actual_duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
  WHERE id = p_job_id;
  
  -- Remover da fila
  DELETE FROM job_queue WHERE job_id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Falhar job
CREATE OR REPLACE FUNCTION fail_job(
  p_job_id UUID,
  p_error_message TEXT,
  p_retry BOOLEAN DEFAULT TRUE
)
RETURNS VOID AS $$
DECLARE
  v_attempts INTEGER;
  v_max_attempts INTEGER;
BEGIN
  -- Buscar tentativas
  SELECT attempts, max_attempts INTO v_attempts, v_max_attempts
  FROM analysis_jobs
  WHERE id = p_job_id;
  
  -- Se deve retentar e ainda tem tentativas
  IF p_retry AND v_attempts < v_max_attempts THEN
    -- Voltar para fila com prioridade menor
    UPDATE analysis_jobs
    SET 
      status = 'queued',
      error_message = p_error_message,
      started_at = NULL,
      worker_id = NULL
    WHERE id = p_job_id;
    
    -- Desbloquear na fila
    UPDATE job_queue
    SET 
      locked_at = NULL,
      locked_by = NULL,
      lock_expires_at = NULL,
      priority = priority - 1,
      scheduled_at = NOW() + (POWER(2, v_attempts) || ' seconds')::INTERVAL -- Exponential backoff
    WHERE job_id = p_job_id;
  ELSE
    -- Falhou definitivamente
    UPDATE analysis_jobs
    SET 
      status = 'failed',
      error_message = p_error_message,
      completed_at = NOW()
    WHERE id = p_job_id;
    
    -- Remover da fila
    DELETE FROM job_queue WHERE job_id = p_job_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View de estatísticas de jobs
CREATE OR REPLACE VIEW job_statistics AS
SELECT 
  job_type,
  status,
  COUNT(*) as count,
  AVG(actual_duration_seconds) as avg_duration,
  MIN(actual_duration_seconds) as min_duration,
  MAX(actual_duration_seconds) as max_duration,
  AVG(attempts) as avg_attempts
FROM analysis_jobs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY job_type, status;

-- View de fila atual
CREATE OR REPLACE VIEW queue_status AS
SELECT 
  COUNT(*) FILTER (WHERE locked_at IS NULL) as available_jobs,
  COUNT(*) FILTER (WHERE locked_at IS NOT NULL AND lock_expires_at > NOW()) as locked_jobs,
  COUNT(*) FILTER (WHERE lock_expires_at < NOW()) as expired_locks,
  AVG(priority) as avg_priority
FROM job_queue;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE analysis_jobs IS 'Jobs de análise assíncronos (imagens, exames, etc)';
COMMENT ON TABLE job_queue IS 'Fila de processamento de jobs';
COMMENT ON TABLE analysis_cache IS 'Cache de resultados de análises';
COMMENT ON FUNCTION enqueue_job IS 'Adiciona job na fila de processamento';
COMMENT ON FUNCTION get_next_job IS 'Pega próximo job disponível e trava para processamento';
COMMENT ON FUNCTION complete_job IS 'Marca job como completo e remove da fila';
COMMENT ON FUNCTION fail_job IS 'Marca job como falho com retry opcional';
