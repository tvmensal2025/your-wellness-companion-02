-- ============================================
-- MIGRATION: Exercise System Tables + RPC Functions
-- Criação de tabelas e funções para sistema de exercícios
-- ============================================

-- 1. exercise_challenges (Desafios X1)
CREATE TABLE IF NOT EXISTS public.exercise_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL,
  challenged_id uuid NOT NULL,
  exercise_name text NOT NULL,
  exercise_emoji text DEFAULT '💪',
  challenge_type text NOT NULL,
  target_value integer,
  duration_seconds integer DEFAULT 60,
  challenger_progress integer DEFAULT 0,
  challenged_progress integer DEFAULT 0,
  status text DEFAULT 'pending',
  winner_id uuid,
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

-- 2. exercise_gamification_points
CREATE TABLE IF NOT EXISTS public.exercise_gamification_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_points integer DEFAULT 0,
  weekly_points integer DEFAULT 0,
  monthly_points integer DEFAULT 0,
  current_level integer DEFAULT 1,
  current_xp integer DEFAULT 0,
  xp_to_next_level integer DEFAULT 100,
  current_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. user_workout_evolution
CREATE TABLE IF NOT EXISTS public.user_workout_evolution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_name text NOT NULL,
  weight_kg numeric,
  max_weight_kg numeric,
  last_reps integer,
  max_reps integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exercise_name)
);

-- 4. exercise_performance_metrics
CREATE TABLE IF NOT EXISTS public.exercise_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_code text NOT NULL,
  sets_completed integer DEFAULT 0,
  reps_completed integer DEFAULT 0,
  weight_used numeric,
  duration_seconds integer DEFAULT 0,
  difficulty_rating integer,
  fatigue_level integer,
  pain_level integer DEFAULT 0,
  heart_rate_avg integer,
  heart_rate_max integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 5. exercise_streaks
CREATE TABLE IF NOT EXISTS public.exercise_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_workout_date date,
  freeze_available boolean DEFAULT true,
  freeze_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. exercise_muscle_group_progress
CREATE TABLE IF NOT EXISTS public.exercise_muscle_group_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  muscle_group text NOT NULL,
  total_volume integer DEFAULT 0,
  weekly_volume integer DEFAULT 0,
  last_trained_at timestamptz,
  progress_score numeric DEFAULT 0,
  balance_score numeric DEFAULT 0.5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, muscle_group)
);

-- 7. xp_config_audit_log
CREATE TABLE IF NOT EXISTS public.xp_config_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  field_changed text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid,
  changed_at timestamptz DEFAULT now()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.exercise_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workout_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_muscle_group_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_config_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for exercise_challenges
CREATE POLICY "Users can manage their challenges" ON public.exercise_challenges
  FOR ALL USING (auth.uid() IN (challenger_id, challenged_id));

-- Policies for exercise_gamification_points
CREATE POLICY "Users can view all gamification points" ON public.exercise_gamification_points
  FOR SELECT USING (true);

CREATE POLICY "Users can update own gamification points" ON public.exercise_gamification_points
  FOR ALL USING (auth.uid() = user_id);

-- Policies for user_workout_evolution
CREATE POLICY "Users can manage own workout evolution" ON public.user_workout_evolution
  FOR ALL USING (auth.uid() = user_id);

-- Policies for exercise_performance_metrics
CREATE POLICY "Users can manage own performance metrics" ON public.exercise_performance_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Policies for exercise_streaks
CREATE POLICY "Users can manage own streaks" ON public.exercise_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Policies for exercise_muscle_group_progress
CREATE POLICY "Users can manage own muscle progress" ON public.exercise_muscle_group_progress
  FOR ALL USING (auth.uid() = user_id);

-- Policies for xp_config_audit_log (admin only read)
CREATE POLICY "Admins can view audit log" ON public.xp_config_audit_log
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "System can insert audit log" ON public.xp_config_audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- accept_exercise_challenge
CREATE OR REPLACE FUNCTION public.accept_exercise_challenge(p_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE exercise_challenges 
  SET status = 'accepted', accepted_at = now()
  WHERE id = p_challenge_id AND challenged_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge not found or not authorized');
  END IF;
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- start_exercise_challenge
CREATE OR REPLACE FUNCTION public.start_exercise_challenge(p_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE exercise_challenges 
  SET status = 'active', started_at = now()
  WHERE id = p_challenge_id AND status = 'accepted';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge not found or not ready');
  END IF;
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- update_challenge_progress
CREATE OR REPLACE FUNCTION public.update_challenge_progress(p_challenge_id uuid, p_progress integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_challenger boolean;
BEGIN
  SELECT challenger_id = auth.uid() INTO v_is_challenger 
  FROM exercise_challenges WHERE id = p_challenge_id;
  
  IF v_is_challenger IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge not found');
  END IF;
  
  IF v_is_challenger THEN
    UPDATE exercise_challenges SET challenger_progress = p_progress WHERE id = p_challenge_id;
  ELSE
    UPDATE exercise_challenges SET challenged_progress = p_progress WHERE id = p_challenge_id;
  END IF;
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- complete_exercise_challenge
CREATE OR REPLACE FUNCTION public.complete_exercise_challenge(p_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge record;
  v_winner_id uuid;
BEGIN
  SELECT * INTO v_challenge FROM exercise_challenges WHERE id = p_challenge_id;
  
  IF v_challenge IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge not found');
  END IF;
  
  IF v_challenge.challenger_progress > v_challenge.challenged_progress THEN
    v_winner_id := v_challenge.challenger_id;
  ELSIF v_challenge.challenged_progress > v_challenge.challenger_progress THEN
    v_winner_id := v_challenge.challenged_id;
  END IF;
  
  UPDATE exercise_challenges 
  SET status = 'completed', completed_at = now(), winner_id = v_winner_id
  WHERE id = p_challenge_id;
  
  RETURN jsonb_build_object('success', true, 'winner_id', v_winner_id);
END;
$$;

-- increment_report_download (for reportService)
CREATE OR REPLACE FUNCTION public.increment_report_download(p_report_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE shared_reports 
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = p_report_id;
END;
$$;