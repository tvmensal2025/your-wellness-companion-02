-- =====================================================
-- DR. VITAL REVOLUTION - Database Migration
-- =====================================================
-- Sistema completo de saúde gamificada, preditiva e interativa
-- =====================================================

-- Health Score tracking
CREATE TABLE IF NOT EXISTS health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  nutrition_score INTEGER CHECK (nutrition_score >= 0 AND nutrition_score <= 25),
  exercise_score INTEGER CHECK (exercise_score >= 0 AND exercise_score <= 25),
  sleep_score INTEGER CHECK (sleep_score >= 0 AND sleep_score <= 25),
  mental_score INTEGER CHECK (mental_score >= 0 AND mental_score <= 25),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint for one score per user per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_health_scores_user_day 
ON health_scores(user_id, DATE(calculated_at));

-- Gamification: Missions
CREATE TABLE IF NOT EXISTS health_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('daily', 'weekly', 'boss_battle', 'achievement')) NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  related_exam_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification: Streaks
CREATE TABLE IF NOT EXISTS health_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  total_xp_earned INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification: Achievements
CREATE TABLE IF NOT EXISTS health_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT CHECK (category IN ('nutrition', 'exercise', 'consistency', 'milestones')),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- Predictions
CREATE TABLE IF NOT EXISTS health_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  risk_type TEXT NOT NULL,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  timeframe TEXT CHECK (timeframe IN ('3_months', '6_months', '1_year')),
  factors JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Events
CREATE TABLE IF NOT EXISTS health_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  is_milestone BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Queue
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared Reports
CREATE TABLE IF NOT EXISTS shared_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT CHECK (report_type IN ('complete', 'summary', 'exam_focused')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  pdf_url TEXT,
  access_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  ai_analysis TEXT,
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wearable Data
CREATE TABLE IF NOT EXISTS wearable_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT CHECK (provider IN ('apple_health', 'google_fit', 'garmin')) NOT NULL,
  heart_rate_current INTEGER,
  heart_rate_resting INTEGER,
  heart_rate_max INTEGER,
  steps INTEGER,
  active_minutes INTEGER,
  calories_burned INTEGER,
  sleep_hours DECIMAL(4,2),
  sleep_deep_hours DECIMAL(4,2),
  sleep_rem_hours DECIMAL(4,2),
  sleep_quality INTEGER CHECK (sleep_quality >= 0 AND sleep_quality <= 100),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  data_date DATE NOT NULL,
  raw_data JSONB DEFAULT '{}',
  UNIQUE(user_id, provider, data_date)
);

-- Avatar Customizations
CREATE TABLE IF NOT EXISTS avatar_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_outfit TEXT DEFAULT 'default',
  current_accessory TEXT,
  current_background TEXT DEFAULT 'clinic',
  unlocked_items JSONB DEFAULT '["default"]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_health_scores_user_date 
ON health_scores(user_id, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_missions_user_active 
ON health_missions(user_id, is_completed, expires_at);

CREATE INDEX IF NOT EXISTS idx_health_missions_type 
ON health_missions(user_id, type);

CREATE INDEX IF NOT EXISTS idx_health_achievements_user 
ON health_achievements(user_id, category);

CREATE INDEX IF NOT EXISTS idx_health_predictions_user_active 
ON health_predictions(user_id, is_active, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_timeline_user_date 
ON health_timeline_events(user_id, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_health_timeline_type 
ON health_timeline_events(user_id, event_type);

CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled 
ON notification_queue(scheduled_for, sent_at) WHERE sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notification_queue_user 
ON notification_queue(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wearable_data_user_date 
ON wearable_data(user_id, data_date DESC);

CREATE INDEX IF NOT EXISTS idx_shared_reports_token 
ON shared_reports(access_token) WHERE access_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_shared_reports_user 
ON shared_reports(user_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_customizations ENABLE ROW LEVEL SECURITY;

-- Health Scores policies
CREATE POLICY "Users can view own health scores"
ON health_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health scores"
ON health_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health scores"
ON health_scores FOR UPDATE
USING (auth.uid() = user_id);

-- Health Missions policies
CREATE POLICY "Users can view own missions"
ON health_missions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions"
ON health_missions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions"
ON health_missions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own missions"
ON health_missions FOR DELETE
USING (auth.uid() = user_id);

-- Health Streaks policies
CREATE POLICY "Users can view own streaks"
ON health_streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
ON health_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
ON health_streaks FOR UPDATE
USING (auth.uid() = user_id);

-- Health Achievements policies
CREATE POLICY "Users can view own achievements"
ON health_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
ON health_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Health Predictions policies
CREATE POLICY "Users can view own predictions"
ON health_predictions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
ON health_predictions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
ON health_predictions FOR UPDATE
USING (auth.uid() = user_id);

-- Health Timeline Events policies
CREATE POLICY "Users can view own timeline events"
ON health_timeline_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline events"
ON health_timeline_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline events"
ON health_timeline_events FOR UPDATE
USING (auth.uid() = user_id);

-- Notification Queue policies
CREATE POLICY "Users can view own notifications"
ON notification_queue FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
ON notification_queue FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON notification_queue FOR UPDATE
USING (auth.uid() = user_id);

-- Shared Reports policies
CREATE POLICY "Users can view own reports"
ON shared_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
ON shared_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
ON shared_reports FOR UPDATE
USING (auth.uid() = user_id);

-- Public access to shared reports via token (for doctors)
CREATE POLICY "Anyone can view shared reports with valid token"
ON shared_reports FOR SELECT
USING (
  access_token IS NOT NULL 
  AND expires_at > NOW()
);

-- Wearable Data policies
CREATE POLICY "Users can view own wearable data"
ON wearable_data FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wearable data"
ON wearable_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wearable data"
ON wearable_data FOR UPDATE
USING (auth.uid() = user_id);

-- Avatar Customizations policies
CREATE POLICY "Users can view own avatar"
ON avatar_customizations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own avatar"
ON avatar_customizations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avatar"
ON avatar_customizations FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_health_level(total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(total_xp::FLOAT / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION xp_to_next_level(current_level INTEGER, total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (current_level * current_level * 100) - total_xp;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get streak bonus XP
CREATE OR REPLACE FUNCTION calculate_streak_bonus(streak_days INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF streak_days >= 7 THEN
    RETURN streak_days * 10;
  END IF;
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update streak on mission completion
CREATE OR REPLACE FUNCTION update_health_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
  v_streak_record health_streaks%ROWTYPE;
BEGIN
  -- Only process when mission is completed
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    -- Get or create streak record
    SELECT * INTO v_streak_record
    FROM health_streaks
    WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
      INSERT INTO health_streaks (user_id, current_streak, longest_streak, last_completed_date, total_xp_earned)
      VALUES (NEW.user_id, 1, 1, v_today, NEW.xp_reward)
      RETURNING * INTO v_streak_record;
    ELSE
      v_last_date := v_streak_record.last_completed_date;
      
      IF v_last_date = v_today THEN
        -- Already completed today, just add XP
        UPDATE health_streaks
        SET total_xp_earned = total_xp_earned + NEW.xp_reward,
            current_level = calculate_health_level(total_xp_earned + NEW.xp_reward),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
      ELSIF v_last_date = v_today - 1 THEN
        -- Consecutive day, increment streak
        UPDATE health_streaks
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_completed_date = v_today,
            total_xp_earned = total_xp_earned + NEW.xp_reward + calculate_streak_bonus(current_streak + 1),
            current_level = calculate_health_level(total_xp_earned + NEW.xp_reward + calculate_streak_bonus(current_streak + 1)),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
      ELSE
        -- Streak broken, reset to 1
        UPDATE health_streaks
        SET current_streak = 1,
            last_completed_date = v_today,
            total_xp_earned = total_xp_earned + NEW.xp_reward,
            current_level = calculate_health_level(total_xp_earned + NEW.xp_reward),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for streak updates
DROP TRIGGER IF EXISTS trigger_update_health_streak ON health_missions;
CREATE TRIGGER trigger_update_health_streak
AFTER UPDATE ON health_missions
FOR EACH ROW
EXECUTE FUNCTION update_health_streak();

-- Function to create timeline event
CREATE OR REPLACE FUNCTION create_timeline_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_is_milestone BOOLEAN DEFAULT FALSE,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_icon TEXT;
BEGIN
  -- Determine icon based on event type
  v_icon := CASE p_event_type
    WHEN 'weight_change' THEN 'scale'
    WHEN 'exam_result' THEN 'file-text'
    WHEN 'achievement' THEN 'trophy'
    WHEN 'goal_reached' THEN 'target'
    WHEN 'consultation' THEN 'stethoscope'
    WHEN 'medication_change' THEN 'pill'
    WHEN 'level_up' THEN 'arrow-up'
    WHEN 'streak_milestone' THEN 'flame'
    ELSE 'activity'
  END;
  
  INSERT INTO health_timeline_events (
    user_id, event_type, title, description, event_date, is_milestone, metadata, icon
  )
  VALUES (
    p_user_id, p_event_type, p_title, p_description, NOW(), p_is_milestone, p_metadata, v_icon
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADMIN POLICIES (for service role operations)
-- =====================================================

-- Allow service role to manage all tables
CREATE POLICY "Service role full access health_scores"
ON health_scores FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access health_missions"
ON health_missions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access health_streaks"
ON health_streaks FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access health_achievements"
ON health_achievements FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access health_predictions"
ON health_predictions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access health_timeline_events"
ON health_timeline_events FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access notification_queue"
ON notification_queue FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access shared_reports"
ON shared_reports FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access wearable_data"
ON wearable_data FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access avatar_customizations"
ON avatar_customizations FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE health_scores IS 'Stores daily health scores (0-100) with breakdown by category';
COMMENT ON TABLE health_missions IS 'Gamification missions: daily, weekly, boss battles, achievements';
COMMENT ON TABLE health_streaks IS 'Tracks user streaks, XP, and levels';
COMMENT ON TABLE health_achievements IS 'Unlocked achievements/badges';
COMMENT ON TABLE health_predictions IS 'AI-generated health risk predictions';
COMMENT ON TABLE health_timeline_events IS 'Visual timeline of health journey events';
COMMENT ON TABLE notification_queue IS 'Smart notification scheduling queue';
COMMENT ON TABLE shared_reports IS 'Shareable health reports for doctors';
COMMENT ON TABLE wearable_data IS 'Data synced from wearable devices';
COMMENT ON TABLE avatar_customizations IS 'Dr. Vital avatar customization settings';
