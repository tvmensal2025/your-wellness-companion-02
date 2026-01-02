-- Corrigir search_path nas funções
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ========================================
-- TABELAS ADICIONAIS FALTANTES
-- ========================================

-- USER_ANAMNESIS (Anamnese do usuário)
CREATE TABLE IF NOT EXISTS public.user_anamnesis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_weight_treatments TEXT,
  current_medications TEXT,
  chronic_diseases TEXT,
  supplements TEXT,
  herbal_medicines TEXT,
  food_allergies TEXT,
  food_intolerances TEXT,
  digestive_issues TEXT,
  sleep_quality TEXT,
  stress_level TEXT,
  physical_activity TEXT,
  eating_habits TEXT,
  water_intake TEXT,
  alcohol_consumption TEXT,
  smoking TEXT,
  family_history TEXT,
  health_goals TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DAILY_RESPONSES (Respostas diárias)
CREATE TABLE IF NOT EXISTS public.daily_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT,
  response TEXT,
  response_type TEXT,
  score INTEGER,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.user_anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS - USER_ANAMNESIS
CREATE POLICY "Users can view own anamnesis" ON public.user_anamnesis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own anamnesis" ON public.user_anamnesis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own anamnesis" ON public.user_anamnesis FOR UPDATE USING (auth.uid() = user_id);

-- POLÍTICAS RLS - DAILY_RESPONSES
CREATE POLICY "Users can view own daily responses" ON public.daily_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily responses" ON public.daily_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily responses" ON public.daily_responses FOR UPDATE USING (auth.uid() = user_id);

-- TRIGGERS
CREATE TRIGGER update_user_anamnesis_updated_at BEFORE UPDATE ON public.user_anamnesis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ÍNDICES
CREATE INDEX idx_user_anamnesis_user ON public.user_anamnesis(user_id);
CREATE INDEX idx_daily_responses_user_date ON public.daily_responses(user_id, date);