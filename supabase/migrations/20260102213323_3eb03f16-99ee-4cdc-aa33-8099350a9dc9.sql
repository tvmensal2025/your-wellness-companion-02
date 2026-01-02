-- ============================================
-- MIGRAÇÃO 14: CURSOS, CONFIGURAÇÕES E OUTROS
-- ============================================

-- Tabela: content_access (8 colunas)
CREATE TABLE IF NOT EXISTS public.content_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT,
  content_id UUID,
  access_level TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: assessments (10 colunas)
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_name TEXT NOT NULL,
  assessment_type TEXT,
  description TEXT,
  questions JSONB,
  scoring_system JSONB,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: user_assessments (9 colunas)
CREATE TABLE IF NOT EXISTS public.user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id),
  responses JSONB,
  score INTEGER,
  result_data JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: layout_config (6 colunas)
CREATE TABLE IF NOT EXISTS public.layout_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: bakery_pool (2 colunas)
CREATE TABLE IF NOT EXISTS public.bakery_pool (
  food_name TEXT PRIMARY KEY,
  category TEXT DEFAULT 'bakery'
);

-- Tabela: fruit_pool (2 colunas)
CREATE TABLE IF NOT EXISTS public.fruit_pool (
  food_name TEXT PRIMARY KEY,
  category TEXT DEFAULT 'fruit'
);

-- Tabela: protein_pool (2 colunas)
CREATE TABLE IF NOT EXISTS public.protein_pool (
  food_name TEXT PRIMARY KEY,
  category TEXT DEFAULT 'protein'
);

-- Tabela: vegetable_pool (2 colunas)
CREATE TABLE IF NOT EXISTS public.vegetable_pool (
  food_name TEXT PRIMARY KEY,
  category TEXT DEFAULT 'vegetable'
);

-- Tabela: bean_pool (2 colunas)
CREATE TABLE IF NOT EXISTS public.bean_pool (
  food_name TEXT PRIMARY KEY,
  category TEXT DEFAULT 'beans'
);

-- Tabela: carb_pool (2 colunas)
CREATE TABLE IF NOT EXISTS public.carb_pool (
  food_name TEXT PRIMARY KEY,
  category TEXT DEFAULT 'carbs'
);

-- Tabela: offers (10 colunas)
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_title TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  valid_from DATE,
  valid_until DATE,
  offer_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: cultural_context (10 colunas)
CREATE TABLE IF NOT EXISTS public.cultural_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT,
  country TEXT,
  cultural_practices JSONB,
  traditional_foods TEXT[],
  dietary_customs TEXT[],
  religious_considerations TEXT[],
  celebration_foods JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: economic_information (10 colunas)
CREATE TABLE IF NOT EXISTS public.economic_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT,
  food_name TEXT,
  average_price DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  availability TEXT,
  season TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: demographic_nutrition (8 colunas)
CREATE TABLE IF NOT EXISTS public.demographic_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group TEXT,
  gender TEXT,
  life_stage TEXT,
  nutritional_needs JSONB,
  recommended_intake JSONB,
  special_considerations TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: pregnancy_nutrition (9 colunas)
CREATE TABLE IF NOT EXISTS public.pregnancy_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trimester TEXT,
  nutrient_name TEXT,
  recommended_amount TEXT,
  food_sources TEXT[],
  benefits TEXT,
  precautions TEXT[],
  is_essential BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: environmental_impact (10 colunas)
CREATE TABLE IF NOT EXISTS public.environmental_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  carbon_footprint_kg DECIMAL(8,2),
  water_usage_liters DECIMAL(10,2),
  land_usage_sqm DECIMAL(10,2),
  sustainability_rating TEXT,
  seasonal_availability TEXT[],
  local_production BOOLEAN,
  eco_certifications TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: wheel_of_life (14 colunas)
CREATE TABLE IF NOT EXISTS public.wheel_of_life (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  health_score INTEGER,
  career_score INTEGER,
  relationships_score INTEGER,
  finances_score INTEGER,
  personal_growth_score INTEGER,
  fun_recreation_score INTEGER,
  environment_score INTEGER,
  spirituality_score INTEGER,
  overall_balance DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bakery_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fruit_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protein_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vegetable_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bean_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carb_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demographic_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_of_life ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content access" ON public.content_access FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view assessments" ON public.assessments FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage their own assessments" ON public.user_assessments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view layout config" ON public.layout_config FOR SELECT USING (true);
CREATE POLICY "Everyone can view food pools" ON public.bakery_pool FOR SELECT USING (true);
CREATE POLICY "Everyone can view fruit pool" ON public.fruit_pool FOR SELECT USING (true);
CREATE POLICY "Everyone can view protein pool" ON public.protein_pool FOR SELECT USING (true);
CREATE POLICY "Everyone can view vegetable pool" ON public.vegetable_pool FOR SELECT USING (true);
CREATE POLICY "Everyone can view bean pool" ON public.bean_pool FOR SELECT USING (true);
CREATE POLICY "Everyone can view carb pool" ON public.carb_pool FOR SELECT USING (true);
CREATE POLICY "Everyone can view offers" ON public.offers FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view cultural context" ON public.cultural_context FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view economic info" ON public.economic_information FOR SELECT USING (true);
CREATE POLICY "Everyone can view demographic nutrition" ON public.demographic_nutrition FOR SELECT USING (true);
CREATE POLICY "Everyone can view pregnancy nutrition" ON public.pregnancy_nutrition FOR SELECT USING (true);
CREATE POLICY "Everyone can view environmental impact" ON public.environmental_impact FOR SELECT USING (true);
CREATE POLICY "Users can manage their own wheel of life" ON public.wheel_of_life FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_access_user_id ON public.content_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON public.user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_wheel_of_life_user_date ON public.wheel_of_life(user_id, assessment_date);