-- =====================================================
-- RESTORE MISSING TABLES
-- =====================================================
-- This migration restores tables that were accidentally dropped
-- but are still referenced throughout the codebase

-- Nutritional Goals table
CREATE TABLE IF NOT EXISTS nutritional_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Targets
  target_calories INTEGER DEFAULT 2000,
  target_protein_g DECIMAL(6,2) DEFAULT 150,
  target_carbs_g DECIMAL(6,2) DEFAULT 250,
  target_fats_g DECIMAL(6,2) DEFAULT 65,
  target_water_ml INTEGER DEFAULT 2000,
  target_fiber_g DECIMAL(6,2) DEFAULT 25,
  
  -- Goal metadata
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  goal_type TEXT DEFAULT 'maintenance' CHECK (goal_type IN ('weight_loss', 'weight_gain', 'maintenance', 'muscle_gain')),
  activity_level TEXT DEFAULT 'moderate' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one active goal per user
  UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Weekly Analyses table
CREATE TABLE IF NOT EXISTS weekly_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Week period
  semana_inicio DATE NOT NULL,
  semana_fim DATE NOT NULL,
  
  -- Analysis data
  analysis_text TEXT,
  health_score INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
  
  -- Metrics summary
  avg_weight_kg DECIMAL(5,2),
  total_steps INTEGER DEFAULT 0,
  total_calories INTEGER DEFAULT 0,
  avg_sleep_hours DECIMAL(4,2),
  avg_mood_level INTEGER DEFAULT 5 CHECK (avg_mood_level >= 1 AND avg_mood_level <= 10),
  
  -- Goals progress
  nutrition_compliance_pct INTEGER DEFAULT 0 CHECK (nutrition_compliance_pct >= 0 AND nutrition_compliance_pct <= 100),
  exercise_compliance_pct INTEGER DEFAULT 0 CHECK (exercise_compliance_pct >= 0 AND exercise_compliance_pct <= 100),
  
  -- AI insights
  insights JSONB DEFAULT '{}',
  recommendations TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one analysis per user per week
  UNIQUE(user_id, semana_inicio)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Nutritional Goals indexes
CREATE INDEX IF NOT EXISTS idx_nutritional_goals_user_status 
  ON nutritional_goals(user_id, status);

CREATE INDEX IF NOT EXISTS idx_nutritional_goals_user_active 
  ON nutritional_goals(user_id) WHERE status = 'active';

-- Weekly Analyses indexes
CREATE INDEX IF NOT EXISTS idx_weekly_analyses_user_week 
  ON weekly_analyses(user_id, semana_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_weekly_analyses_user_date 
  ON weekly_analyses(user_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE nutritional_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_analyses ENABLE ROW LEVEL SECURITY;

-- Nutritional Goals policies
CREATE POLICY "Users can view own nutritional goals"
  ON nutritional_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutritional goals"
  ON nutritional_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutritional goals"
  ON nutritional_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutritional goals"
  ON nutritional_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Weekly Analyses policies
CREATE POLICY "Users can view own weekly analyses"
  ON weekly_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly analyses"
  ON weekly_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly analyses"
  ON weekly_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly analyses"
  ON weekly_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Service role policies
CREATE POLICY "Service role full access nutritional_goals"
  ON nutritional_goals FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access weekly_analyses"
  ON weekly_analyses FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE nutritional_goals IS 'User nutritional targets and goals';
COMMENT ON TABLE weekly_analyses IS 'Weekly health and progress analyses';

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_nutritional_goals_updated_at 
  BEFORE UPDATE ON nutritional_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_analyses_updated_at 
  BEFORE UPDATE ON weekly_analyses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();