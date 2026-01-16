-- ============================================
-- ADD CUSTOM CHALLENGE TYPE SUPPORT
-- Permite tipos de desafio personalizados
-- ============================================

-- 1. Adicionar coluna para descrição do tipo personalizado
ALTER TABLE exercise_challenges 
ADD COLUMN IF NOT EXISTS custom_type_description TEXT;

-- 2. Atualizar o CHECK constraint para incluir 'custom'
-- Primeiro remover o constraint antigo (se existir)
ALTER TABLE exercise_challenges 
DROP CONSTRAINT IF EXISTS exercise_challenges_challenge_type_check;

-- Adicionar novo constraint com 'custom'
ALTER TABLE exercise_challenges 
ADD CONSTRAINT exercise_challenges_challenge_type_check 
CHECK (challenge_type IN ('max_reps', 'first_to', 'timed', 'custom'));

-- 3. Comentário
COMMENT ON COLUMN exercise_challenges.custom_type_description IS 'Descrição do tipo de desafio quando challenge_type = custom';
