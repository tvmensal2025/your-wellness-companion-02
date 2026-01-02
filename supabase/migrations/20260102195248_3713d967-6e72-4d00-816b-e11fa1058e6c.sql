-- TABELAS FINAIS
-- USER_FOOD_PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_food_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  preference_type TEXT,
  severity_level TEXT,
  auto_detected BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna state em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- WEEKLY_GOAL_PROGRESS
CREATE TABLE IF NOT EXISTS public.weekly_goal_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.user_goals(id) ON DELETE CASCADE,
  week_start DATE,
  progress_value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.user_food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_goal_progress ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS
CREATE POLICY "Users can manage own food preferences" ON public.user_food_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own weekly progress" ON public.weekly_goal_progress FOR ALL USING (auth.uid() = user_id);

-- ÍNDICES
CREATE INDEX idx_user_food_preferences_user ON public.user_food_preferences(user_id);
CREATE INDEX idx_weekly_goal_progress_user ON public.weekly_goal_progress(user_id);