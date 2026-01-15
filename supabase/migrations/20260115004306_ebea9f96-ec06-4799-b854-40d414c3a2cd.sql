-- =============================================
-- AI Usage Logs Table
-- Tracks all AI provider calls for cost analysis
-- =============================================

-- Create the ai_usage_logs table (drop existing if needed to add new columns)
DROP TABLE IF EXISTS ai_usage_logs CASCADE;

CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('yolo', 'gemini', 'gpt', 'ollama', 'lovable')),
  method TEXT NOT NULL,
  estimated_cost DECIMAL(10, 6) DEFAULT 0,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  functionality TEXT DEFAULT 'image_analysis',
  model_name TEXT,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE ai_usage_logs IS 'Logs all AI provider calls for cost tracking and analytics';
COMMENT ON COLUMN ai_usage_logs.provider IS 'AI provider: yolo, gemini, gpt, ollama, lovable';
COMMENT ON COLUMN ai_usage_logs.method IS 'Analysis method: yolo_only, yolo_gemini_confirm, gemini_full, etc.';
COMMENT ON COLUMN ai_usage_logs.estimated_cost IS 'Estimated cost in USD';
COMMENT ON COLUMN ai_usage_logs.functionality IS 'Feature using the AI: image_analysis, chat, medical_exam, etc.';

-- Create indexes for performance
CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_usage_logs_provider ON ai_usage_logs(provider);
CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_method ON ai_usage_logs(method);
CREATE INDEX idx_ai_usage_logs_functionality ON ai_usage_logs(functionality);

-- Composite index for common queries
CREATE INDEX idx_ai_usage_logs_provider_created ON ai_usage_logs(provider, created_at DESC);

-- Enable RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all AI usage logs" ON ai_usage_logs
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policy: Service role can insert logs
CREATE POLICY "Service role can insert AI usage logs" ON ai_usage_logs
FOR INSERT WITH CHECK (true);

-- Policy: Users can view their own logs
CREATE POLICY "Users can view own AI usage logs" ON ai_usage_logs
FOR SELECT USING (auth.uid() = user_id);

-- Create a view for daily aggregates (for dashboard performance)
CREATE OR REPLACE VIEW ai_usage_daily_stats AS
SELECT 
  DATE(created_at) as date,
  provider,
  method,
  COUNT(*) as total_calls,
  SUM(estimated_cost) as total_cost,
  AVG(response_time_ms) as avg_response_time,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as success_rate,
  SUM(tokens_used) as total_tokens
FROM ai_usage_logs
GROUP BY DATE(created_at), provider, method;

-- Grant access to the view
GRANT SELECT ON ai_usage_daily_stats TO authenticated;

-- Function to get AI usage summary for a date range
CREATE OR REPLACE FUNCTION get_ai_usage_summary(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  provider TEXT,
  total_calls BIGINT,
  total_cost DECIMAL,
  avg_response_time DECIMAL,
  success_rate DECIMAL,
  yolo_savings DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.provider,
    COUNT(*)::BIGINT as total_calls,
    COALESCE(SUM(l.estimated_cost), 0) as total_cost,
    COALESCE(AVG(l.response_time_ms), 0) as avg_response_time,
    COALESCE(SUM(CASE WHEN l.success THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 0) as success_rate,
    COALESCE(SUM(CASE WHEN l.method = 'yolo_only' THEN 0.005 ELSE 0 END), 0) as yolo_savings
  FROM ai_usage_logs l
  WHERE l.created_at BETWEEN start_date AND end_date
  GROUP BY l.provider;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_ai_usage_summary TO authenticated;