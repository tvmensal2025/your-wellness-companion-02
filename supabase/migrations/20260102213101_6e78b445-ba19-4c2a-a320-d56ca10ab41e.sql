-- ============================================
-- MIGRAÇÃO 9: TABELAS DE SABOTADORES
-- ============================================

-- Tabela: saboteur_assessments (10 colunas)
CREATE TABLE IF NOT EXISTS public.saboteur_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  saboteur_type TEXT,
  intensity_score INTEGER,
  trigger_situations TEXT[],
  impact_areas TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: custom_saboteurs (13 colunas)
CREATE TABLE IF NOT EXISTS public.custom_saboteurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saboteur_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  common_triggers TEXT[],
  behavioral_patterns TEXT[],
  physical_symptoms TEXT[],
  mental_patterns TEXT[],
  coping_strategies TEXT[],
  related_saboteurs TEXT[],
  severity_levels JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: user_custom_saboteurs (5 colunas)
CREATE TABLE IF NOT EXISTS public.user_custom_saboteurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  saboteur_id UUID REFERENCES public.custom_saboteurs(id),
  intensity_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: saboteur_results (10 colunas)
CREATE TABLE IF NOT EXISTS public.saboteur_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  saboteur_type TEXT,
  score INTEGER,
  percentage DECIMAL(5,2),
  dominant_saboteurs TEXT[],
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: saboteur_responses (9 colunas)
CREATE TABLE IF NOT EXISTS public.saboteur_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.saboteur_results(id),
  question_id TEXT,
  question_text TEXT,
  response_value INTEGER,
  response_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.saboteur_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_saboteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_saboteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saboteur_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saboteur_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saboteur assessments" ON public.saboteur_assessments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view custom saboteurs" ON public.custom_saboteurs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own custom saboteurs" ON public.user_custom_saboteurs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saboteur results" ON public.saboteur_results
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saboteur responses" ON public.saboteur_responses
  FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_saboteur_assessments_user_id ON public.saboteur_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_saboteurs_user_id ON public.user_custom_saboteurs(user_id);
CREATE INDEX IF NOT EXISTS idx_saboteur_results_user_id ON public.saboteur_results(user_id);
CREATE INDEX IF NOT EXISTS idx_saboteur_responses_user_id ON public.saboteur_responses(user_id);