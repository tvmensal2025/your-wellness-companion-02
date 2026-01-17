-- Adicionar coluna meal_type à tabela sofia_food_analysis
-- Esta coluna é essencial para categorizar as refeições (café, almoço, lanche, jantar)

-- Adicionar coluna meal_type
ALTER TABLE public.sofia_food_analysis 
ADD COLUMN IF NOT EXISTS meal_type text;

-- Criar índice para melhorar performance de queries por meal_type
CREATE INDEX IF NOT EXISTS idx_sofia_food_analysis_meal_type 
ON public.sofia_food_analysis(meal_type);

-- Criar índice composto para queries por usuário e tipo de refeição
CREATE INDEX IF NOT EXISTS idx_sofia_food_analysis_user_meal 
ON public.sofia_food_analysis(user_id, meal_type, created_at DESC);

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.sofia_food_analysis.meal_type IS 
'Tipo de refeição: breakfast (café da manhã), lunch (almoço), snack (lanche), dinner (jantar), refeicao (genérico)';

-- Atualizar registros existentes sem meal_type para 'refeicao' (genérico)
UPDATE public.sofia_food_analysis 
SET meal_type = 'refeicao' 
WHERE meal_type IS NULL;
