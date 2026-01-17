-- Criar índice para melhorar performance de queries por meal_type
CREATE INDEX IF NOT EXISTS idx_sofia_food_analysis_meal_type 
ON public.sofia_food_analysis(meal_type);

-- Criar índice composto para queries por usuário e tipo de refeição
CREATE INDEX IF NOT EXISTS idx_sofia_food_analysis_user_meal 
ON public.sofia_food_analysis(user_id, meal_type, created_at DESC);

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.sofia_food_analysis.meal_type IS 
'Tipo de refeição: breakfast (café da manhã), lunch (almoço), snack (lanche), dinner (jantar), refeicao (genérico)';