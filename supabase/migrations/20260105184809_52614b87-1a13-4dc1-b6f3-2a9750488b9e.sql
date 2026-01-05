-- Adicionar colunas para registro permanente de análises
ALTER TABLE public.sofia_food_analysis 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS foods_detected JSONB,
ADD COLUMN IF NOT EXISTS total_calories INTEGER,
ADD COLUMN IF NOT EXISTS total_protein NUMERIC,
ADD COLUMN IF NOT EXISTS total_carbs NUMERIC,
ADD COLUMN IF NOT EXISTS total_fat NUMERIC,
ADD COLUMN IF NOT EXISTS total_fiber NUMERIC,
ADD COLUMN IF NOT EXISTS meal_type TEXT DEFAULT 'refeicao',
ADD COLUMN IF NOT EXISTS meal_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS meal_time TIME DEFAULT CURRENT_TIME,
ADD COLUMN IF NOT EXISTS sofia_analysis TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS confirmation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS image_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS image_deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS label_studio_task_id TEXT,
ADD COLUMN IF NOT EXISTS confirmation_prompt_sent BOOLEAN DEFAULT FALSE;

-- Criar índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_sofia_food_analysis_user_date ON public.sofia_food_analysis(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_sofia_food_analysis_confirmed ON public.sofia_food_analysis(confirmed_by_user);

-- Comentário para documentação
COMMENT ON TABLE public.sofia_food_analysis IS 'Registro permanente de análises alimentares. Imagens são deletadas após confirmação, mas dados nutricionais são mantidos eternamente.';