-- ========================================
-- TABELAS ADICIONAIS - PARTE 5 (FINAL)
-- ========================================

-- Adicionar colunas faltantes em várias tabelas
ALTER TABLE public.sofia_food_analysis 
ADD COLUMN IF NOT EXISTS confirmed_by_user BOOLEAN DEFAULT false;

ALTER TABLE public.medical_documents 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS doctor_name TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS results JSONB,
ADD COLUMN IF NOT EXISTS processing_stage TEXT,
ADD COLUMN IF NOT EXISTS progress_pct INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS images_processed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS images_total INTEGER DEFAULT 0;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE;

ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS tools_data JSONB;

-- EXERCISE_TRACKING (Rastreamento de exercícios)
CREATE TABLE IF NOT EXISTS public.exercise_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_type TEXT,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  distance_km DECIMAL(5,2),
  steps INTEGER,
  heart_rate_avg INTEGER,
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WATER_TRACKING (Rastreamento de água)
CREATE TABLE IF NOT EXISTS public.water_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER,
  date DATE DEFAULT CURRENT_DATE,
  time TIME DEFAULT CURRENT_TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GOAL_UPDATES (Atualizações de metas)
CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.user_goals(id) ON DELETE CASCADE,
  update_type TEXT,
  value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HEALTH_CONDITIONS (Condições de saúde)
CREATE TABLE IF NOT EXISTS public.health_conditions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  condition_name TEXT,
  severity TEXT,
  diagnosed_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUPPLEMENT_PROTOCOLS (Protocolos de suplementos)
CREATE TABLE IF NOT EXISTS public.supplement_protocols (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  conditions TEXT[],
  supplements JSONB,
  dosages JSONB,
  duration_days INTEGER,
  precautions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_GAMIFICATION (Gamificação do usuário)
CREATE TABLE IF NOT EXISTS public.user_gamification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  badges JSONB,
  achievements JSONB,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.exercise_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS
CREATE POLICY "Users can view own exercise tracking" ON public.exercise_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercise tracking" ON public.exercise_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercise tracking" ON public.exercise_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercise tracking" ON public.exercise_tracking FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own water tracking" ON public.water_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water tracking" ON public.water_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own water tracking" ON public.water_tracking FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own goal updates" ON public.goal_updates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goal updates" ON public.goal_updates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own health conditions" ON public.health_conditions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health conditions" ON public.health_conditions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health conditions" ON public.health_conditions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view supplement protocols" ON public.supplement_protocols FOR SELECT USING (true);

CREATE POLICY "Users can view own gamification" ON public.user_gamification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gamification" ON public.user_gamification FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gamification" ON public.user_gamification FOR UPDATE USING (auth.uid() = user_id);

-- TRIGGERS
CREATE TRIGGER update_supplement_protocols_updated_at BEFORE UPDATE ON public.supplement_protocols FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_gamification_updated_at BEFORE UPDATE ON public.user_gamification FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ÍNDICES
CREATE INDEX idx_exercise_tracking_user ON public.exercise_tracking(user_id, date);
CREATE INDEX idx_water_tracking_user ON public.water_tracking(user_id, date);
CREATE INDEX idx_goal_updates_user ON public.goal_updates(user_id);
CREATE INDEX idx_health_conditions_user ON public.health_conditions(user_id);
CREATE INDEX idx_user_gamification_user ON public.user_gamification(user_id);