-- ============================================
-- WhatsApp Hybrid Integration - Database Infrastructure
-- Migration: 20260112000000_whatsapp_hybrid_infrastructure.sql
-- ============================================

-- ============================================
-- 1. Provider Configuration Table (Singleton)
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_provider_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_provider TEXT NOT NULL CHECK (active_provider IN ('evolution', 'whapi')),
  evolution_enabled BOOLEAN DEFAULT true,
  whapi_enabled BOOLEAN DEFAULT false,
  
  -- Evolution API Configuration
  evolution_api_url TEXT,
  evolution_instance TEXT,
  evolution_last_health_check TIMESTAMPTZ,
  evolution_health_status TEXT CHECK (evolution_health_status IN ('healthy', 'unhealthy', 'unknown')),
  evolution_last_message_at TIMESTAMPTZ,
  evolution_success_count_24h INTEGER DEFAULT 0,
  evolution_failure_count_24h INTEGER DEFAULT 0,
  
  -- Whapi API Configuration
  whapi_api_url TEXT DEFAULT 'https://gate.whapi.cloud',
  whapi_last_health_check TIMESTAMPTZ,
  whapi_health_status TEXT CHECK (whapi_health_status IN ('healthy', 'unhealthy', 'unknown')),
  whapi_last_message_at TIMESTAMPTZ,
  whapi_success_count_24h INTEGER DEFAULT 0,
  whapi_failure_count_24h INTEGER DEFAULT 0,
  
  -- Control
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Singleton pattern - only one row allowed
  CONSTRAINT single_config CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Insert initial configuration with Evolution as default
INSERT INTO whatsapp_provider_config (
  id, 
  active_provider, 
  evolution_enabled, 
  whapi_enabled,
  evolution_health_status,
  whapi_health_status
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, 
  'evolution', 
  true, 
  false,
  'unknown',
  'unknown'
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for admin-only access
ALTER TABLE whatsapp_provider_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view provider config"
  ON whatsapp_provider_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admin can update provider config"
  ON whatsapp_provider_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Service role can always access (for edge functions)
CREATE POLICY "Service role full access to provider config"
  ON whatsapp_provider_config FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 2. Unified Message Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  phone TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('evolution', 'whapi')),
  
  -- Message Type and Content
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video', 'interactive')),
  message_content TEXT,
  interactive_type TEXT CHECK (interactive_type IN ('button', 'list', 'carousel')),
  template_key TEXT,
  
  -- Provider Response
  provider_message_id TEXT,
  provider_response JSONB,
  
  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  queued_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- Indexes for efficient querying
CREATE INDEX idx_whatsapp_logs_user ON whatsapp_message_logs(user_id);
CREATE INDEX idx_whatsapp_logs_phone ON whatsapp_message_logs(phone);
CREATE INDEX idx_whatsapp_logs_created ON whatsapp_message_logs(created_at DESC);
CREATE INDEX idx_whatsapp_logs_status ON whatsapp_message_logs(status);
CREATE INDEX idx_whatsapp_logs_provider ON whatsapp_message_logs(provider);
CREATE INDEX idx_whatsapp_logs_provider_msg_id ON whatsapp_message_logs(provider_message_id);

-- RLS for message logs
ALTER TABLE whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own message logs"
  ON whatsapp_message_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all message logs"
  ON whatsapp_message_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Service role full access to message logs"
  ON whatsapp_message_logs FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 3. Webhook Responses Table
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_webhook_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  phone TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('evolution', 'whapi')),
  
  -- Response Data
  original_message_id TEXT,
  response_type TEXT NOT NULL CHECK (response_type IN ('button_reply', 'list_reply', 'text', 'unknown')),
  button_id TEXT,
  button_title TEXT,
  list_row_id TEXT,
  list_row_title TEXT,
  raw_payload JSONB,
  
  -- Action Execution
  action_triggered TEXT,
  action_result JSONB,
  action_error TEXT,
  
  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  -- Processing Status
  is_processed BOOLEAN DEFAULT false
);

-- Indexes for webhook responses
CREATE INDEX idx_webhook_responses_user ON whatsapp_webhook_responses(user_id);
CREATE INDEX idx_webhook_responses_message ON whatsapp_webhook_responses(original_message_id);
CREATE INDEX idx_webhook_responses_phone ON whatsapp_webhook_responses(phone);
CREATE INDEX idx_webhook_responses_received ON whatsapp_webhook_responses(received_at DESC);
CREATE INDEX idx_webhook_responses_unprocessed ON whatsapp_webhook_responses(is_processed) WHERE is_processed = false;

-- RLS for webhook responses
ALTER TABLE whatsapp_webhook_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhook responses"
  ON whatsapp_webhook_responses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all webhook responses"
  ON whatsapp_webhook_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Service role full access to webhook responses"
  ON whatsapp_webhook_responses FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 4. Rate Limit Tracking Table
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  
  -- Counters
  messages_last_minute INTEGER DEFAULT 0,
  messages_last_hour INTEGER DEFAULT 0,
  messages_today INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  
  -- Control
  tracking_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint per phone per day
  UNIQUE(phone, tracking_date)
);

-- Indexes for rate limit tracking
CREATE INDEX idx_rate_limit_phone ON whatsapp_rate_limit_tracking(phone);
CREATE INDEX idx_rate_limit_user ON whatsapp_rate_limit_tracking(user_id);
CREATE INDEX idx_rate_limit_date ON whatsapp_rate_limit_tracking(tracking_date);

-- RLS for rate limit tracking
ALTER TABLE whatsapp_rate_limit_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to rate limit"
  ON whatsapp_rate_limit_tracking FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 5. Message Queue Table (for rate-limited messages)
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  phone TEXT NOT NULL,
  
  -- Message Data
  payload JSONB NOT NULL,
  priority INTEGER DEFAULT 5, -- 1 = highest, 10 = lowest
  
  -- Queue Status
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'failed', 'cancelled')),
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes for message queue
CREATE INDEX idx_queue_status ON whatsapp_message_queue(status);
CREATE INDEX idx_queue_scheduled ON whatsapp_message_queue(scheduled_for) WHERE status = 'queued';
CREATE INDEX idx_queue_phone ON whatsapp_message_queue(phone);
CREATE INDEX idx_queue_user ON whatsapp_message_queue(user_id);

-- RLS for message queue
ALTER TABLE whatsapp_message_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to message queue"
  ON whatsapp_message_queue FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 6. Helper Functions
-- ============================================

-- Function to get active provider
CREATE OR REPLACE FUNCTION get_active_whatsapp_provider()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  provider TEXT;
BEGIN
  SELECT active_provider INTO provider
  FROM whatsapp_provider_config
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  
  RETURN COALESCE(provider, 'evolution');
END;
$$;

-- Function to toggle provider (admin only)
CREATE OR REPLACE FUNCTION toggle_whatsapp_provider(new_provider TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Validate provider
  IF new_provider NOT IN ('evolution', 'whapi') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid provider. Must be evolution or whapi');
  END IF;
  
  -- Update configuration
  UPDATE whatsapp_provider_config
  SET 
    active_provider = new_provider,
    evolution_enabled = (new_provider = 'evolution'),
    whapi_enabled = (new_provider = 'whapi'),
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  
  RETURN jsonb_build_object(
    'success', true, 
    'active_provider', new_provider,
    'evolution_enabled', (new_provider = 'evolution'),
    'whapi_enabled', (new_provider = 'whapi')
  );
END;
$$;

-- Function to update provider health status
CREATE OR REPLACE FUNCTION update_whatsapp_provider_health(
  p_provider TEXT,
  p_status TEXT,
  p_success_count INTEGER DEFAULT NULL,
  p_failure_count INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_provider = 'evolution' THEN
    UPDATE whatsapp_provider_config
    SET 
      evolution_last_health_check = NOW(),
      evolution_health_status = p_status,
      evolution_success_count_24h = COALESCE(p_success_count, evolution_success_count_24h),
      evolution_failure_count_24h = COALESCE(p_failure_count, evolution_failure_count_24h),
      updated_at = NOW()
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  ELSIF p_provider = 'whapi' THEN
    UPDATE whatsapp_provider_config
    SET 
      whapi_last_health_check = NOW(),
      whapi_health_status = p_status,
      whapi_success_count_24h = COALESCE(p_success_count, whapi_success_count_24h),
      whapi_failure_count_24h = COALESCE(p_failure_count, whapi_failure_count_24h),
      updated_at = NOW()
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;
END;
$$;

-- Function to record message sent (updates rate limit and provider stats)
CREATE OR REPLACE FUNCTION record_whatsapp_message_sent(
  p_phone TEXT,
  p_user_id UUID,
  p_provider TEXT,
  p_success BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update rate limit tracking
  INSERT INTO whatsapp_rate_limit_tracking (phone, user_id, messages_today, last_message_at, tracking_date)
  VALUES (p_phone, p_user_id, 1, NOW(), CURRENT_DATE)
  ON CONFLICT (phone, tracking_date) 
  DO UPDATE SET
    messages_today = whatsapp_rate_limit_tracking.messages_today + 1,
    last_message_at = NOW(),
    updated_at = NOW();
  
  -- Update provider stats
  IF p_provider = 'evolution' THEN
    UPDATE whatsapp_provider_config
    SET 
      evolution_last_message_at = NOW(),
      evolution_success_count_24h = CASE WHEN p_success THEN evolution_success_count_24h + 1 ELSE evolution_success_count_24h END,
      evolution_failure_count_24h = CASE WHEN NOT p_success THEN evolution_failure_count_24h + 1 ELSE evolution_failure_count_24h END
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  ELSIF p_provider = 'whapi' THEN
    UPDATE whatsapp_provider_config
    SET 
      whapi_last_message_at = NOW(),
      whapi_success_count_24h = CASE WHEN p_success THEN whapi_success_count_24h + 1 ELSE whapi_success_count_24h END,
      whapi_failure_count_24h = CASE WHEN NOT p_success THEN whapi_failure_count_24h + 1 ELSE whapi_failure_count_24h END
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;
END;
$$;

-- ============================================
-- 7. Scheduled Job to Reset Daily Counters
-- ============================================
-- Note: This should be run via pg_cron or external scheduler
-- Example: SELECT reset_whatsapp_daily_counters();

CREATE OR REPLACE FUNCTION reset_whatsapp_daily_counters()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset provider 24h counters
  UPDATE whatsapp_provider_config
  SET 
    evolution_success_count_24h = 0,
    evolution_failure_count_24h = 0,
    whapi_success_count_24h = 0,
    whapi_failure_count_24h = 0
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  
  -- Clean up old rate limit tracking (keep last 7 days)
  DELETE FROM whatsapp_rate_limit_tracking
  WHERE tracking_date < CURRENT_DATE - INTERVAL '7 days';
END;
$$;

-- ============================================
-- Done!
-- ============================================
