-- ============================================
-- VPS AI WORKER MIGRATION - DATABASE SETUP
-- ============================================

-- Create analysis_jobs table
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Job type
  type TEXT NOT NULL CHECK (type IN (
    'sofia_image',
    'sofia_text',
    'medical_exam',
    'unified_assistant',
    'meal_plan',
    'whatsapp_message'
  )),
  
  -- Input and output
  input JSONB NOT NULL,
  result JSONB,
  error TEXT,
  
  -- Status and control
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  )),
  
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  
  -- Metadata
  processing_time_ms INTEGER,
  worker_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_status_priority ON analysis_jobs(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_user_created ON analysis_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_type_status ON analysis_jobs(type, status);

-- Enable RLS
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own jobs" ON analysis_jobs;
DROP POLICY IF EXISTS "Service role full access" ON analysis_jobs;

-- RLS Policies
CREATE POLICY "Users can view own jobs"
  ON analysis_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON analysis_jobs FOR ALL
  USING (auth.role() = 'service_role');

-- Create analysis_cache table
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  response JSONB NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cache_key ON analysis_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON analysis_cache(expires_at);

-- Cleanup function for expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM analysis_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_analysis_jobs_updated_at ON analysis_jobs;

CREATE TRIGGER update_analysis_jobs_updated_at
  BEFORE UPDATE ON analysis_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON analysis_jobs TO service_role;
GRANT ALL ON analysis_cache TO service_role;
GRANT SELECT ON analysis_jobs TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ VPS AI Worker database setup complete!';
  RAISE NOTICE '   - analysis_jobs table created';
  RAISE NOTICE '   - analysis_cache table created';
  RAISE NOTICE '   - Indexes and RLS policies configured';
END $$;
