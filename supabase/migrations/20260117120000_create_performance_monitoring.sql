-- =====================================================
-- SISTEMA DE MONITORAMENTO DE PERFORMANCE
-- =====================================================
-- Criado: 2026-01-17
-- Descrição: Sistema completo de métricas em tempo real
-- =====================================================

-- Tabela principal de métricas
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Identificação
  feature TEXT NOT NULL, -- 'yolo', 'sofia', 'camera_workout', 'dr_vital', etc
  action TEXT NOT NULL, -- 'detect', 'analyze', 'workout_complete', etc
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Métricas de performance
  duration_ms INTEGER, -- Tempo de execução em ms
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Métricas específicas
  metadata JSONB DEFAULT '{}'::jsonb, -- Dados extras flexíveis
  
  -- Índices para queries rápidas
  CONSTRAINT valid_duration CHECK (duration_ms >= 0)
);

-- Índices otimizados
CREATE INDEX idx_perf_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX idx_perf_metrics_feature ON performance_metrics(feature);
CREATE INDEX idx_perf_metrics_action ON performance_metrics(action);
CREATE INDEX idx_perf_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_perf_metrics_success ON performance_metrics(success);
CREATE INDEX idx_perf_metrics_feature_created ON performance_metrics(feature, created_at DESC);

-- Tabela de health checks (serviços externos)
CREATE TABLE IF NOT EXISTS service_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  service_name TEXT NOT NULL, -- 'yolo', 'supabase', 'gemini', etc
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_health_checks_service ON service_health_checks(service_name, created_at DESC);
CREATE INDEX idx_health_checks_status ON service_health_checks(status);

-- Tabela de erros críticos (para alertas)
CREATE TABLE IF NOT EXISTS critical_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  feature TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  url TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_critical_errors_created ON critical_errors(created_at DESC);
CREATE INDEX idx_critical_errors_feature ON critical_errors(feature);
CREATE INDEX idx_critical_errors_resolved ON critical_errors(resolved);

-- View: Métricas agregadas por hora (últimas 24h)
CREATE OR REPLACE VIEW metrics_hourly AS
SELECT 
  date_trunc('hour', created_at) as hour,
  feature,
  action,
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE success = true) as successful_calls,
  COUNT(*) FILTER (WHERE success = false) as failed_calls,
  ROUND(AVG(duration_ms)::numeric, 2) as avg_duration_ms,
  MIN(duration_ms) as min_duration_ms,
  MAX(duration_ms) as max_duration_ms,
  ROUND((COUNT(*) FILTER (WHERE success = true)::float / COUNT(*)::float * 100)::numeric, 2) as success_rate
FROM performance_metrics
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY date_trunc('hour', created_at), feature, action
ORDER BY hour DESC;

-- View: Status dos serviços (última verificação)
CREATE OR REPLACE VIEW services_status AS
SELECT DISTINCT ON (service_name)
  service_name,
  status,
  response_time_ms,
  created_at as last_check,
  error_message
FROM service_health_checks
ORDER BY service_name, created_at DESC;

-- View: Top erros (últimas 24h)
CREATE OR REPLACE VIEW top_errors_24h AS
SELECT 
  feature,
  error_type,
  COUNT(*) as occurrences,
  MAX(created_at) as last_occurrence,
  COUNT(DISTINCT user_id) as affected_users
FROM critical_errors
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND resolved = false
GROUP BY feature, error_type
ORDER BY occurrences DESC
LIMIT 20;

-- View: Performance por feature (últimas 24h)
CREATE OR REPLACE VIEW feature_performance_24h AS
SELECT 
  feature,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE success = true) as successful_requests,
  ROUND(AVG(duration_ms)::numeric, 2) as avg_duration_ms,
  ROUND((COUNT(*) FILTER (WHERE success = true)::float / COUNT(*)::float * 100)::numeric, 2) as success_rate,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_duration_ms
FROM performance_metrics
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY feature
ORDER BY total_requests DESC;

-- Function: Registrar métrica
CREATE OR REPLACE FUNCTION log_performance_metric(
  p_feature TEXT,
  p_action TEXT,
  p_duration_ms INTEGER,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_metric_id UUID;
BEGIN
  INSERT INTO performance_metrics (
    feature,
    action,
    duration_ms,
    success,
    error_message,
    user_id,
    metadata
  ) VALUES (
    p_feature,
    p_action,
    p_duration_ms,
    p_success,
    p_error_message,
    COALESCE(p_user_id, auth.uid()),
    p_metadata
  ) RETURNING id INTO v_metric_id;
  
  RETURN v_metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Registrar health check
CREATE OR REPLACE FUNCTION log_health_check(
  p_service_name TEXT,
  p_status TEXT,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_check_id UUID;
BEGIN
  INSERT INTO service_health_checks (
    service_name,
    status,
    response_time_ms,
    error_message,
    metadata
  ) VALUES (
    p_service_name,
    p_status,
    p_response_time_ms,
    p_error_message,
    p_metadata
  ) RETURNING id INTO v_check_id;
  
  RETURN v_check_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Registrar erro crítico
CREATE OR REPLACE FUNCTION log_critical_error(
  p_feature TEXT,
  p_error_type TEXT,
  p_error_message TEXT,
  p_stack_trace TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_error_id UUID;
BEGIN
  INSERT INTO critical_errors (
    feature,
    error_type,
    error_message,
    stack_trace,
    user_id,
    user_agent,
    url,
    metadata
  ) VALUES (
    p_feature,
    p_error_type,
    p_error_message,
    p_stack_trace,
    COALESCE(p_user_id, auth.uid()),
    p_user_agent,
    p_url,
    p_metadata
  ) RETURNING id INTO v_error_id;
  
  RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Resolver erro
CREATE OR REPLACE FUNCTION resolve_critical_error(
  p_error_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE critical_errors
  SET 
    resolved = true,
    resolved_at = NOW(),
    resolved_by = auth.uid()
  WHERE id = p_error_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies (apenas admins podem ver)
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE critical_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem ver tudo
CREATE POLICY "Admins can view all metrics"
  ON performance_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ));

CREATE POLICY "Admins can view health checks"
  ON service_health_checks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ));

CREATE POLICY "Admins can view critical errors"
  ON critical_errors FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ));

CREATE POLICY "Admins can update critical errors"
  ON critical_errors FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ));

-- Policy: Sistema pode inserir (via service role)
CREATE POLICY "Service role can insert metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can insert health checks"
  ON service_health_checks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can insert errors"
  ON critical_errors FOR INSERT
  WITH CHECK (true);

-- Limpeza automática (manter apenas 7 dias de métricas)
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM performance_metrics 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  DELETE FROM service_health_checks 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Erros resolvidos: manter 30 dias
  DELETE FROM critical_errors 
  WHERE resolved = true 
  AND resolved_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE performance_metrics IS 'Métricas de performance em tempo real de todas as features';
COMMENT ON TABLE service_health_checks IS 'Health checks de serviços externos (YOLO, APIs, etc)';
COMMENT ON TABLE critical_errors IS 'Erros críticos que requerem atenção';
COMMENT ON VIEW metrics_hourly IS 'Métricas agregadas por hora (últimas 24h)';
COMMENT ON VIEW services_status IS 'Status atual de todos os serviços';
COMMENT ON VIEW feature_performance_24h IS 'Performance por feature nas últimas 24h';
