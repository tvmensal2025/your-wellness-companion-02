-- Normalizar valores de meal_type existentes de português para inglês
-- Para compatibilidade com useDailyNutritionReport hook

-- Atualizar valores em português para inglês
UPDATE public.sofia_food_analysis 
SET meal_type = CASE 
  WHEN meal_type IN ('cafe_da_manha', 'café da manhã', 'cafe da manha', 'café', 'cafe') THEN 'breakfast'
  WHEN meal_type IN ('almoco', 'almoço') THEN 'lunch'
  WHEN meal_type IN ('lanche', 'lanche da tarde') THEN 'snack'
  WHEN meal_type IN ('jantar', 'janta', 'ceia') THEN 'dinner'
  WHEN meal_type IS NULL OR meal_type = '' THEN 'refeicao'
  ELSE meal_type
END
WHERE meal_type NOT IN ('breakfast', 'lunch', 'snack', 'dinner', 'refeicao')
   OR meal_type IS NULL;

-- Log de quantos registros foram atualizados
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Normalizados % registros de meal_type', updated_count;
END $$;
