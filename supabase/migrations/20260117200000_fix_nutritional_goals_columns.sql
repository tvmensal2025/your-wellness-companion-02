-- =====================================================
-- FIX NUTRITIONAL GOALS COLUMNS
-- =====================================================
-- Adiciona colunas alternativas para compatibilidade com o código

-- Adicionar colunas sem prefixo 'target_' para compatibilidade
ALTER TABLE nutritional_goals 
  ADD COLUMN IF NOT EXISTS calories INTEGER GENERATED ALWAYS AS (target_calories) STORED,
  ADD COLUMN IF NOT EXISTS protein DECIMAL(6,2) GENERATED ALWAYS AS (target_protein_g) STORED,
  ADD COLUMN IF NOT EXISTS carbs DECIMAL(6,2) GENERATED ALWAYS AS (target_carbs_g) STORED,
  ADD COLUMN IF NOT EXISTS fat DECIMAL(6,2) GENERATED ALWAYS AS (target_fats_g) STORED,
  ADD COLUMN IF NOT EXISTS fiber DECIMAL(6,2) GENERATED ALWAYS AS (target_fiber_g) STORED;

-- Comentários
COMMENT ON COLUMN nutritional_goals.calories IS 'Computed column for compatibility (same as target_calories)';
COMMENT ON COLUMN nutritional_goals.protein IS 'Computed column for compatibility (same as target_protein_g)';
COMMENT ON COLUMN nutritional_goals.carbs IS 'Computed column for compatibility (same as target_carbs_g)';
COMMENT ON COLUMN nutritional_goals.fat IS 'Computed column for compatibility (same as target_fats_g)';
COMMENT ON COLUMN nutritional_goals.fiber IS 'Computed column for compatibility (same as target_fiber_g)';
