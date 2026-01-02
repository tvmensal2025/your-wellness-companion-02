-- ============================================
-- MIGRAÇÃO 6: TABELAS DE EXERCÍCIOS E ESPORTES
-- ============================================

-- Tabela: sports_training_plans (22 colunas)
CREATE TABLE IF NOT EXISTS public.sports_training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  sport_type TEXT,
  goal TEXT,
  difficulty_level TEXT,
  duration_weeks INTEGER,
  sessions_per_week INTEGER,
  description TEXT,
  training_phases JSONB,
  exercises JSONB,
  progression_plan JSONB,
  equipment_needed TEXT[],
  recovery_guidelines TEXT,
  nutrition_recommendations TEXT,
  performance_metrics TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  created_by TEXT,
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: sports_training_records (11 colunas)
CREATE TABLE IF NOT EXISTS public.sports_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  training_plan_id UUID REFERENCES public.sports_training_plans(id),
  session_date DATE DEFAULT CURRENT_DATE,
  session_type TEXT,
  exercises_completed JSONB,
  duration_minutes INTEGER,
  intensity_level TEXT,
  performance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: sports_challenges (18 colunas)
CREATE TABLE IF NOT EXISTS public.sports_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_name TEXT NOT NULL,
  sport_type TEXT,
  description TEXT,
  difficulty TEXT,
  duration_days INTEGER,
  target_metric TEXT,
  target_value DECIMAL(10,2),
  unit TEXT,
  start_date DATE,
  end_date DATE,
  rules JSONB,
  rewards JSONB,
  max_participants INTEGER,
  is_team_challenge BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: sports_challenge_participations (10 colunas)
CREATE TABLE IF NOT EXISTS public.sports_challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.sports_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  current_progress DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  rank INTEGER,
  achievements JSONB,
  notes TEXT
);

-- Tabela: sports_achievements (11 colunas)
CREATE TABLE IF NOT EXISTS public.sports_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT,
  achievement_name TEXT NOT NULL,
  description TEXT,
  sport_type TEXT,
  badge_icon TEXT,
  points_earned INTEGER,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: user_sports_modalities (9 colunas)
CREATE TABLE IF NOT EXISTS public.user_sports_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_name TEXT NOT NULL,
  skill_level TEXT,
  years_experience INTEGER,
  training_frequency TEXT,
  goals TEXT[],
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: exercise_sessions (16 colunas)
CREATE TABLE IF NOT EXISTS public.exercise_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE DEFAULT CURRENT_DATE,
  session_type TEXT,
  exercises JSONB,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  intensity_level TEXT,
  mood_before TEXT,
  mood_after TEXT,
  notes TEXT,
  performance_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: exercise_progress_analysis (13 colunas)
CREATE TABLE IF NOT EXISTS public.exercise_progress_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_period TEXT,
  period_start DATE,
  period_end DATE,
  total_sessions INTEGER,
  total_duration_minutes INTEGER,
  avg_intensity DECIMAL(3,2),
  improvements JSONB,
  recommendations TEXT[],
  next_goals TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: exercise_nutrition (9 colunas)
CREATE TABLE IF NOT EXISTS public.exercise_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_type TEXT NOT NULL,
  pre_workout_recommendations JSONB,
  post_workout_recommendations JSONB,
  hydration_guidelines TEXT,
  supplement_suggestions TEXT[],
  timing_guidelines TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: exercise_ai_recommendations (11 colunas)
CREATE TABLE IF NOT EXISTS public.exercise_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT,
  recommendation_text TEXT,
  recommended_exercises JSONB,
  reasoning TEXT,
  priority_level TEXT,
  valid_until DATE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.sports_training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sports_modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_progress_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own training plans" ON public.sports_training_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own training records" ON public.sports_training_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view active sports challenges" ON public.sports_challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own challenge participations" ON public.sports_challenge_participations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sports achievements" ON public.sports_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sports modalities" ON public.user_sports_modalities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own exercise sessions" ON public.exercise_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own exercise analysis" ON public.exercise_progress_analysis
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view exercise nutrition" ON public.exercise_nutrition
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own exercise recommendations" ON public.exercise_ai_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sports_training_plans_user_id ON public.sports_training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_sports_training_records_user_id ON public.sports_training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sports_challenge_participations_user_id ON public.sports_challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_sports_achievements_user_id ON public.sports_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user_date ON public.exercise_sessions(user_id, session_date);