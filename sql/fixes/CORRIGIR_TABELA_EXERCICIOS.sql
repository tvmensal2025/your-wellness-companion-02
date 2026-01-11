-- ============================================
-- CORRIGIR TABELA sport_training_plans
-- ============================================

-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'sport_training_plans'
);

-- Adicionar todas as colunas que estão sendo usadas pelo código
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
ADD COLUMN IF NOT EXISTS week_plan JSONB,
ADD COLUMN IF NOT EXISTS current_week INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_workouts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_workouts INTEGER DEFAULT 0;

-- Comentários para as colunas
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
COMMENT ON COLUMN public.sport_training_plans.current_week IS 'Semana atual do programa';
COMMENT ON COLUMN public.sport_training_plans.total_workouts IS 'Total de treinos do programa';
COMMENT ON COLUMN public.sport_training_plans.completed_workouts IS 'Treinos completados';

-- Atualizar programas existentes
UPDATE public.sport_training_plans 
SET is_active = (status = 'active')
WHERE is_active IS NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sport_training_plans_user_active 
ON public.sport_training_plans(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_sport_training_plans_status 
ON public.sport_training_plans(status);

CREATE INDEX IF NOT EXISTS idx_sport_training_plans_modality 
ON public.sport_training_plans(modality);

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sport_training_plans' 
ORDER BY ordinal_position;


