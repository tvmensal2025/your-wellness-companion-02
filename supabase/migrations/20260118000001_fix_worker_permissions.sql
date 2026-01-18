-- ============================================
-- FIX: Worker Permissions for ANON Key
-- ============================================
-- O worker usa SUPABASE_ANON_KEY (Lovable Cloud)
-- Precisa de permissões para ler/atualizar jobs
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own jobs" ON analysis_jobs;
DROP POLICY IF EXISTS "Service role full access" ON analysis_jobs;
DROP POLICY IF EXISTS "Anon can read pending jobs" ON analysis_jobs;
DROP POLICY IF EXISTS "Anon can update processing jobs" ON analysis_jobs;

-- Policy 1: Users can view their own jobs
CREATE POLICY "Users can view own jobs"
  ON analysis_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Service role has full access
CREATE POLICY "Service role full access"
  ON analysis_jobs FOR ALL
  USING (auth.role() = 'service_role');

-- Policy 3: Anon can read ALL pending jobs (for worker polling)
CREATE POLICY "Anon can read pending jobs"
  ON analysis_jobs FOR SELECT
  USING (status IN ('pending', 'processing'));

-- Policy 4: Anon can update jobs (for worker processing)
CREATE POLICY "Anon can update jobs"
  ON analysis_jobs FOR UPDATE
  USING (true);

-- Policy 5: Anon can insert jobs (for edge functions)
CREATE POLICY "Anon can insert jobs"
  ON analysis_jobs FOR INSERT
  WITH CHECK (true);

-- Grant permissions to anon role
GRANT SELECT, INSERT, UPDATE ON analysis_jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON analysis_cache TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Worker permissions fixed!';
  RAISE NOTICE '   - Anon can now read pending jobs';
  RAISE NOTICE '   - Anon can update job status';
  RAISE NOTICE '   - Worker should start processing jobs';
END $$;
