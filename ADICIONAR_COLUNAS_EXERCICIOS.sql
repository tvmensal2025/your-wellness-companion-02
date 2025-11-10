-- ============================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA
-- ============================================

-- Adicionar colunas que estão sendo usadas pelo código
ALTER TABLE public.sport_training_plans 
ADD COLUMN IF NOT EXISTS modality TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS level TEXT,
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS frequency_per_week INTEGER,
ADD COLUMN IF NOT EXISTS time_per_session TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS week_plan JSONB;

-- Atualizar programas existentes para ter is_active se não tiver
UPDATE public.sport_training_plans 
SET is_active = (status = 'active')
WHERE is_active IS NULL;

-- Comentários
COMMENT ON COLUMN public.sport_training_plans.modality IS 'Modalidade: gym, home_bodyweight, home_equipment, walking, functional';
COMMENT ON COLUMN public.sport_training_plans.name IS 'Nome do programa (ex: "Academia - Treino ABC")';
COMMENT ON COLUMN public.sport_training_plans.description IS 'Descrição detalhada do programa';
COMMENT ON COLUMN public.sport_training_plans.level IS 'Nível: sedentario, leve, moderado';
COMMENT ON COLUMN public.sport_training_plans.goal IS 'Objetivo: condicionamento, emagrecer, estresse, saude';
COMMENT ON COLUMN public.sport_training_plans.location IS 'Local: academia, casa_sem, casa_com';
COMMENT ON COLUMN public.sport_training_plans.frequency_per_week IS 'Frequência semanal (3-5x)';
COMMENT ON COLUMN public.sport_training_plans.time_per_session IS 'Tempo por treino (ex: "45-60 minutos")';
COMMENT ON COLUMN public.sport_training_plans.is_active IS 'Se é o programa ativo do usuário';
COMMENT ON COLUMN public.sport_training_plans.week_plan IS 'JSON com plano de todas as semanas';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sport_training_plans_user_active 
ON public.sport_training_plans(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_sport_training_plans_status 
ON public.sport_training_plans(status);

-- ============================================
-- TABELA PARA IA (OLLAMA INTEGRATION)
-- ============================================

CREATE TABLE IF NOT EXISTS public.exercise_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.sport_training_plans(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- 'adjustment', 'motivation', 'recovery', 'nutrition'
  prompt TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  model_used TEXT DEFAULT 'llama3.2',
  confidence_score DECIMAL,
  user_feedback TEXT CHECK (user_feedback IN ('helpful', 'not_helpful', null)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies para IA
ALTER TABLE public.exercise_ai_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recommendations" ON public.exercise_ai_recommendations;
CREATE POLICY "Users can view own recommendations"
  ON public.exercise_ai_recommendations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recommendations" ON public.exercise_ai_recommendations;
CREATE POLICY "Users can insert own recommendations"
  ON public.exercise_ai_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recommendations" ON public.exercise_ai_recommendations;
CREATE POLICY "Users can update own recommendations"
  ON public.exercise_ai_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_exercise_ai_recommendations_updated_at ON public.exercise_ai_recommendations;
CREATE TRIGGER update_exercise_ai_recommendations_updated_at
  BEFORE UPDATE ON public.exercise_ai_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_exercise_ai_recommendations_user 
ON public.exercise_ai_recommendations(user_id);

CREATE INDEX IF NOT EXISTS idx_exercise_ai_recommendations_plan 
ON public.exercise_ai_recommendations(plan_id);

CREATE INDEX IF NOT EXISTS idx_exercise_ai_recommendations_type 
ON public.exercise_ai_recommendations(recommendation_type);

-- ============================================
-- TABELA PARA ANÁLISE DE PROGRESSO IA
-- ============================================

CREATE TABLE IF NOT EXISTS public.exercise_progress_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.sport_training_plans(id) ON DELETE CASCADE NOT NULL,
  analysis_date DATE DEFAULT CURRENT_DATE,
  week_analyzed INTEGER NOT NULL,
  workouts_completed INTEGER DEFAULT 0,
  workouts_missed INTEGER DEFAULT 0,
  adherence_percentage DECIMAL,
  performance_trend TEXT, -- 'improving', 'stable', 'declining'
  ai_insights TEXT, -- Análise da IA
  ai_suggestions TEXT[], -- Array de sugestões
  motivation_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.exercise_progress_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analysis" ON public.exercise_progress_analysis;
CREATE POLICY "Users can view own analysis"
  ON public.exercise_progress_analysis FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analysis" ON public.exercise_progress_analysis;
CREATE POLICY "Users can insert own analysis"
  ON public.exercise_progress_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_exercise_progress_analysis_user 
ON public.exercise_progress_analysis(user_id, analysis_date);

-- ============================================
COMMENT ON TABLE public.exercise_ai_recommendations IS 'Recomendações da IA (Ollama) para ajustes no treino';
COMMENT ON TABLE public.exercise_progress_analysis IS 'Análise semanal de progresso pela IA';
-- ============================================
