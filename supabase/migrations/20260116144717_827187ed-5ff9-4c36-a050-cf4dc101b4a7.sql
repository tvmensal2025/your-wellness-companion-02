-- Tabela para logar todas as chamadas da API VPS Node.js
CREATE TABLE public.vps_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  success BOOLEAN DEFAULT true,
  response_time_ms INTEGER,
  request_summary TEXT,
  response_summary TEXT,
  error_message TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas eficientes
CREATE INDEX idx_vps_api_logs_endpoint ON public.vps_api_logs(endpoint);
CREATE INDEX idx_vps_api_logs_created_at ON public.vps_api_logs(created_at DESC);
CREATE INDEX idx_vps_api_logs_success ON public.vps_api_logs(success);
CREATE INDEX idx_vps_api_logs_method ON public.vps_api_logs(method);

-- RLS
ALTER TABLE public.vps_api_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver os logs
CREATE POLICY "Admins can view API logs"
ON public.vps_api_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Service role pode inserir (para o frontend logar)
CREATE POLICY "Authenticated users can insert API logs"
ON public.vps_api_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Comentário
COMMENT ON TABLE public.vps_api_logs IS 'Logs de todas as chamadas para a API VPS Node.js (media-api)';