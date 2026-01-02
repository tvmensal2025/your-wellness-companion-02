-- ============================================
-- MIGRAÇÃO 5: TABELAS DE REFEIÇÕES E PLANOS
-- ============================================

-- Tabela: recipes (3 colunas)
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  instructions TEXT
);

-- Tabela: therapeutic_recipes (12 colunas)
CREATE TABLE IF NOT EXISTS public.therapeutic_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_name TEXT NOT NULL,
  health_condition TEXT,
  ingredients JSONB,
  instructions TEXT,
  preparation_time_minutes INTEGER,
  servings INTEGER,
  nutritional_info JSONB,
  therapeutic_benefits TEXT[],
  precautions TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: recipe_templates (7 colunas)
CREATE TABLE IF NOT EXISTS public.recipe_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  category TEXT,
  base_ingredients JSONB,
  instructions_template TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: recipe_items (5 colunas)
CREATE TABLE IF NOT EXISTS public.recipe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  food_id UUID REFERENCES public.nutrition_foods(id),
  quantity_g DECIMAL(8,2),
  notes TEXT
);

-- Tabela: recipe_components (4 colunas)
CREATE TABLE IF NOT EXISTS public.recipe_components (
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  food_name TEXT,
  quantity_g DECIMAL(8,2),
  order_index INTEGER
);

-- Tabela: meal_plans (17 colunas)
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  daily_calories INTEGER,
  daily_proteins DECIMAL(6,2),
  daily_carbs DECIMAL(6,2),
  daily_fats DECIMAL(6,2),
  meals JSONB,
  goal TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: meal_plan_history (15 colunas)
CREATE TABLE IF NOT EXISTS public.meal_plan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT,
  plan_type TEXT,
  plan_data JSONB,
  start_date DATE,
  end_date DATE,
  daily_calories INTEGER,
  adherence_percentage DECIMAL(5,2),
  weight_change_kg DECIMAL(5,2),
  notes TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Tabela: meal_plan_items (15 colunas)
CREATE TABLE IF NOT EXISTS public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER,
  meal_type TEXT,
  meal_name TEXT,
  recipe_id UUID REFERENCES public.recipes(id),
  food_items JSONB,
  calories INTEGER,
  proteins DECIMAL(6,2),
  carbs DECIMAL(6,2),
  fats DECIMAL(6,2),
  preparation_instructions TEXT,
  timing TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: meal_suggestions (11 colunas)
CREATE TABLE IF NOT EXISTS public.meal_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT,
  suggestion_data JSONB,
  nutritional_values JSONB,
  health_score INTEGER,
  reason TEXT,
  is_favorite BOOLEAN DEFAULT false,
  date_suggested DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: nutrition_tracking (15 colunas)
CREATE TABLE IF NOT EXISTS public.nutrition_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  meal_type TEXT,
  food_items JSONB,
  total_calories INTEGER,
  total_proteins DECIMAL(6,2),
  total_carbs DECIMAL(6,2),
  total_fats DECIMAL(6,2),
  total_fiber DECIMAL(6,2),
  water_ml INTEGER,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: daily_nutrition_summary (20 colunas)
CREATE TABLE IF NOT EXISTS public.daily_nutrition_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  total_calories INTEGER,
  total_proteins DECIMAL(6,2),
  total_carbs DECIMAL(6,2),
  total_fats DECIMAL(6,2),
  total_fiber DECIMAL(6,2),
  total_water_ml INTEGER,
  meals_count INTEGER,
  breakfast_calories INTEGER,
  lunch_calories INTEGER,
  dinner_calories INTEGER,
  snacks_calories INTEGER,
  adherence_to_plan_percentage DECIMAL(5,2),
  health_score INTEGER,
  notes TEXT,
  goals_met BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapeutic_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_nutrition_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Everyone can view therapeutic recipes" ON public.therapeutic_recipes FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view recipe templates" ON public.recipe_templates FOR SELECT USING (true);
CREATE POLICY "Users can manage their own meal plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own meal plan history" ON public.meal_plan_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own meal suggestions" ON public.meal_suggestions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own nutrition tracking" ON public.nutrition_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own daily nutrition summary" ON public.daily_nutrition_summary FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_history_user_id ON public.meal_plan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_suggestions_user_id ON public.meal_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_user_date ON public.nutrition_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_date ON public.daily_nutrition_summary(user_id, date);