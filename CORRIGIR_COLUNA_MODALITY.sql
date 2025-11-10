-- ============================================
-- CORRIGIR ERRO: Adicionar coluna modality
-- ============================================

-- Adicionar coluna modality que está faltando
ALTER TABLE public.sport_training_plans 
ADD COLUMN IF NOT EXISTS modality TEXT;

-- Comentário para a coluna
COMMENT ON COLUMN public.sport_training_plans.modality IS 'Modalidade: gym, home_bodyweight, home_equipment, walking, functional';

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sport_training_plans' 
AND column_name = 'modality';


