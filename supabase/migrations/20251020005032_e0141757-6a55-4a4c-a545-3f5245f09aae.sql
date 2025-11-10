-- ============================================
-- LIMPAR TABELAS ANTIGAS SE EXISTIREM
-- ============================================

DROP TABLE IF EXISTS public.sport_workout_logs CASCADE;
DROP TABLE IF EXISTS public.sport_training_plans CASCADE;
DROP TABLE IF EXISTS public.user_sport_modalities CASCADE;
DROP TYPE IF EXISTS public.sport_modality CASCADE;

-- ============================================
-- CRIAR ENUM
-- ============================================

CREATE TYPE public.sport_modality AS ENUM (
  'running',
  'cycling', 
  'swimming',
  'functional',
  'yoga',
  'martial_arts',
  'trail',
  'team_sports',
  'racquet_sports'
);

-- ============================================
-- TABELA: user_sport_modalities
-- ============================================

CREATE TABLE public.user_sport_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modality sport_modality NOT NULL,
  level VARCHAR(50) NOT NULL,
  goal TEXT,
  target_event TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: sport_training_plans
-- ============================================

CREATE TABLE public.sport_training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modality_id UUID REFERENCES public.user_sport_modalities(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL,
  plan_type VARCHAR(50) NOT NULL,
  duration_weeks INTEGER NOT NULL,
  workouts_per_week INTEGER NOT NULL,
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'active',
  plan_data JSONB,
  total_workouts INTEGER DEFAULT 0,
  completed_workouts INTEGER DEFAULT 0,
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  total_distance_km NUMERIC(10,2) DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  total_calories_burned INTEGER DEFAULT 0,
  last_workout_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABELA: sport_workout_logs
-- ============================================

CREATE TABLE public.sport_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_plan_id UUID REFERENCES public.sport_training_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  workout_date DATE DEFAULT CURRENT_DATE,
  workout_type VARCHAR(100),
  modality sport_modality,
  duration_minutes INTEGER,
  distance_km NUMERIC(10,2),
  calories_burned INTEGER,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  perceived_effort INTEGER,
  completed BOOLEAN DEFAULT true,
  notes TEXT,
  workout_data JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_perceived_effort CHECK (perceived_effort IS NULL OR (perceived_effort >= 1 AND perceived_effort <= 10))
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_user_sport_modalities_user ON public.user_sport_modalities(user_id, is_active);
CREATE INDEX idx_sport_training_plans_user ON public.sport_training_plans(user_id, status);
CREATE INDEX idx_sport_training_plans_active ON public.sport_training_plans(user_id) WHERE status = 'active';
CREATE INDEX idx_sport_workout_logs_user ON public.sport_workout_logs(user_id, workout_date);
CREATE INDEX idx_sport_workout_logs_plan ON public.sport_workout_logs(training_plan_id, week_number, day_number);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_user_sport_modalities_updated_at
  BEFORE UPDATE ON public.user_sport_modalities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_sport_training_plans_updated_at
  BEFORE UPDATE ON public.sport_training_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.user_sport_modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_workout_logs ENABLE ROW LEVEL SECURITY;

-- user_sport_modalities
CREATE POLICY "Users can view own modalities" ON public.user_sport_modalities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own modalities" ON public.user_sport_modalities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own modalities" ON public.user_sport_modalities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own modalities" ON public.user_sport_modalities
  FOR DELETE USING (auth.uid() = user_id);

-- sport_training_plans
CREATE POLICY "Users can view own training plans" ON public.sport_training_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own training plans" ON public.sport_training_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own training plans" ON public.sport_training_plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own training plans" ON public.sport_training_plans
  FOR DELETE USING (auth.uid() = user_id);

-- sport_workout_logs
CREATE POLICY "Users can view own workout logs" ON public.sport_workout_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout logs" ON public.sport_workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout logs" ON public.sport_workout_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout logs" ON public.sport_workout_logs
  FOR DELETE USING (auth.uid() = user_id);