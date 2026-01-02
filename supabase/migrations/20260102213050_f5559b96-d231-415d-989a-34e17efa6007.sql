-- ============================================
-- MIGRAÇÃO 8: TABELAS DE TRACKING E MONITORAMENTO
-- ============================================

-- Tabela: advanced_daily_tracking (40 colunas)
CREATE TABLE IF NOT EXISTS public.advanced_daily_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_date DATE DEFAULT CURRENT_DATE,
  
  -- Físico
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  waist_cm DECIMAL(5,2),
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  resting_heart_rate INTEGER,
  
  -- Nutrição
  calories_consumed INTEGER,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fats_g DECIMAL(6,2),
  water_ml INTEGER,
  supplements_taken TEXT[],
  
  -- Atividade
  steps INTEGER,
  active_minutes INTEGER,
  exercise_duration_minutes INTEGER,
  exercise_type TEXT,
  calories_burned INTEGER,
  
  -- Sono
  sleep_hours DECIMAL(4,2),
  sleep_quality INTEGER,
  bedtime TIME,
  wake_time TIME,
  
  -- Bem-estar Mental
  mood_rating INTEGER,
  stress_level INTEGER,
  anxiety_level INTEGER,
  energy_level INTEGER,
  focus_level INTEGER,
  
  -- Sintomas
  symptoms TEXT[],
  pain_level INTEGER,
  pain_location TEXT,
  
  -- Outros
  medications_taken TEXT[],
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: mood_monitoring (10 colunas)
CREATE TABLE IF NOT EXISTS public.mood_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  time TIME DEFAULT LOCALTIME,
  mood_rating INTEGER,
  mood_tags TEXT[],
  triggers TEXT[],
  context TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: water_tracking (7 colunas)
CREATE TABLE IF NOT EXISTS public.water_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  amount_ml INTEGER NOT NULL,
  time TIME DEFAULT LOCALTIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: achievement_tracking (13 colunas)
CREATE TABLE IF NOT EXISTS public.achievement_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT,
  achievement_name TEXT,
  description TEXT,
  milestone_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  progress_percentage DECIMAL(5,2),
  badge_icon TEXT,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: user_progress (6 colunas)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_data JSONB,
  progress_type TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: device_sync_log (10 colunas)
CREATE TABLE IF NOT EXISTS public.device_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT,
  device_id TEXT,
  sync_type TEXT,
  data_synced JSONB,
  sync_status TEXT,
  records_synced INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.advanced_daily_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily tracking" ON public.advanced_daily_tracking
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mood monitoring" ON public.mood_monitoring
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own water tracking" ON public.water_tracking
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON public.achievement_tracking
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sync logs" ON public.device_sync_log
  FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_advanced_tracking_user_date ON public.advanced_daily_tracking(user_id, tracking_date);
CREATE INDEX IF NOT EXISTS idx_mood_monitoring_user_date ON public.mood_monitoring(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_tracking_user_date ON public.water_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_achievement_tracking_user_id ON public.achievement_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_device_sync_log_user_id ON public.device_sync_log(user_id);