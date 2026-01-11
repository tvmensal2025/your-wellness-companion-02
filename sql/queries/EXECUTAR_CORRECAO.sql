-- ============================================
-- EXECUTAR CORREÇÃO IMEDIATA
-- ============================================

-- Adicionar coluna modality que está causando o erro
ALTER TABLE public.sport_training_plans 
ADD COLUMN IF NOT EXISTS modality TEXT;

-- Adicionar outras colunas que podem estar faltando
ALTER TABLE public.sport_training_plans 
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

-- Verificar se a coluna modality foi criada
SELECT 'Coluna modality criada com sucesso!' as status;


