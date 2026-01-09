-- Tabela de cache de respostas de IA
CREATE TABLE public.ai_response_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_hash TEXT NOT NULL,
  query_type TEXT NOT NULL,
  query_input TEXT NOT NULL,
  response_text TEXT NOT NULL,
  model_used TEXT,
  tokens_used INTEGER DEFAULT 0,
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMP WITH TIME ZONE,
  ttl_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Índices para cache
CREATE INDEX idx_ai_response_cache_hash ON public.ai_response_cache(query_hash);
CREATE INDEX idx_ai_response_cache_type ON public.ai_response_cache(query_type);
CREATE INDEX idx_ai_response_cache_expires ON public.ai_response_cache(expires_at);

-- Tabela de rate limiting
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  window_hours INTEGER DEFAULT 24,
  max_requests INTEGER DEFAULT 100,
  is_blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Índices para rate limits
CREATE INDEX idx_rate_limits_user ON public.rate_limits(user_id);
CREATE INDEX idx_rate_limits_endpoint ON public.rate_limits(endpoint);
CREATE INDEX idx_rate_limits_blocked ON public.rate_limits(is_blocked) WHERE is_blocked = true;

-- Tabela de métricas do sistema
CREATE TABLE public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para métricas
CREATE INDEX idx_system_metrics_type ON public.system_metrics(metric_type);
CREATE INDEX idx_system_metrics_recorded ON public.system_metrics(recorded_at DESC);

-- Índices otimizados para tabelas existentes com alta carga

-- daily_responses (coluna correta: date)
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_date ON public.daily_responses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_responses_date ON public.daily_responses(date DESC);

-- chat_conversation_history
CREATE INDEX IF NOT EXISTS idx_chat_history_user_session ON public.chat_conversation_history(user_id, session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_created ON public.chat_conversation_history(created_at DESC);

-- image_cache (coluna correta: accessed_at)
CREATE INDEX IF NOT EXISTS idx_image_cache_accessed ON public.image_cache(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_cache_path ON public.image_cache(storage_path);

-- whatsapp_evolution_logs
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created ON public.whatsapp_evolution_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_response_cache (acesso público para leitura, sistema para escrita)
CREATE POLICY "Cache is readable by authenticated users"
ON public.ai_response_cache FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Cache is writable by service role"
ON public.ai_response_cache FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Políticas para rate_limits
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role manages rate limits"
ON public.rate_limits FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Políticas para system_metrics (apenas admin)
CREATE POLICY "Admins can view system metrics"
ON public.system_metrics FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Service role manages metrics"
ON public.system_metrics FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.ai_response_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_hours INTEGER DEFAULT 24
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_record RECORD;
  v_allowed BOOLEAN := true;
  v_remaining INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get or create rate limit record
  INSERT INTO public.rate_limits (user_id, endpoint, request_count, window_start, max_requests, window_hours)
  VALUES (p_user_id, p_endpoint, 1, now(), p_max_requests, p_window_hours)
  ON CONFLICT (user_id, endpoint) DO UPDATE SET
    request_count = CASE 
      WHEN rate_limits.window_start + (rate_limits.window_hours || ' hours')::interval < now() 
      THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE 
      WHEN rate_limits.window_start + (rate_limits.window_hours || ' hours')::interval < now() 
      THEN now()
      ELSE rate_limits.window_start
    END,
    updated_at = now()
  RETURNING * INTO v_record;
  
  v_reset_at := v_record.window_start + (v_record.window_hours || ' hours')::interval;
  v_remaining := GREATEST(0, v_record.max_requests - v_record.request_count);
  v_allowed := v_record.request_count <= v_record.max_requests AND NOT v_record.is_blocked;
  
  IF v_record.is_blocked AND v_record.blocked_until IS NOT NULL AND v_record.blocked_until < now() THEN
    UPDATE public.rate_limits SET is_blocked = false, blocked_until = NULL WHERE id = v_record.id;
    v_allowed := true;
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'remaining', v_remaining,
    'limit', v_record.max_requests,
    'reset_at', v_reset_at,
    'request_count', v_record.request_count
  );
END;
$$;