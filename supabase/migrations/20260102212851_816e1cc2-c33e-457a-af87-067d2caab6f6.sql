-- ============================================
-- MIGRAÇÃO 4: TABELAS DE NUTRIÇÃO PARTE 2
-- ============================================

-- Tabela: food_aliases (4 colunas)
CREATE TABLE IF NOT EXISTS public.food_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES public.nutrition_foods(id) ON DELETE CASCADE,
  alias_name TEXT NOT NULL,
  language TEXT DEFAULT 'pt-BR'
);

-- Tabela: nutritional_aliases (4 colunas)
CREATE TABLE IF NOT EXISTS public.nutritional_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES public.nutrition_foods(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: pending_nutritional_aliases (6 colunas)
CREATE TABLE IF NOT EXISTS public.pending_nutritional_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  alias TEXT NOT NULL,
  submitted_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: food_active_principles (8 colunas)
CREATE TABLE IF NOT EXISTS public.food_active_principles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES public.nutrition_foods(id) ON DELETE CASCADE,
  active_principle_name TEXT NOT NULL,
  concentration TEXT,
  health_benefit TEXT,
  scientific_evidence TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: active_principles (12 colunas)
CREATE TABLE IF NOT EXISTS public.active_principles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  principle_name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  health_benefits TEXT[],
  mechanism_of_action TEXT,
  bioavailability TEXT,
  food_sources TEXT[],
  recommended_intake TEXT,
  contraindications TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: food_diseases (13 colunas)
CREATE TABLE IF NOT EXISTS public.food_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES public.nutrition_foods(id),
  disease_id UUID,
  food_name TEXT,
  disease_name TEXT,
  relationship_type TEXT,
  benefit_level TEXT,
  mechanism TEXT,
  dosage_recommendation TEXT,
  precautions TEXT[],
  evidence_quality TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: food_densities (2 colunas)
CREATE TABLE IF NOT EXISTS public.food_densities (
  food_name TEXT PRIMARY KEY,
  density_g_ml DECIMAL(5,3)
);

-- Tabela: food_yields (5 colunas)
CREATE TABLE IF NOT EXISTS public.food_yields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  raw_weight_g DECIMAL(8,2),
  cooked_weight_g DECIMAL(8,2),
  yield_percentage DECIMAL(5,2)
);

-- Tabela: nutritional_yields (6 colunas)
CREATE TABLE IF NOT EXISTS public.nutritional_yields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT NOT NULL,
  preparation_method TEXT,
  yield_factor DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: taco_stage (31 colunas)
CREATE TABLE IF NOT EXISTS public.taco_stage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER,
  alimento TEXT,
  categoria TEXT,
  energia_kcal DECIMAL(8,2),
  proteina_g DECIMAL(6,2),
  lipidios_g DECIMAL(6,2),
  carboidrato_g DECIMAL(6,2),
  fibra_g DECIMAL(6,2),
  calcio_mg DECIMAL(8,2),
  magnesio_mg DECIMAL(6,2),
  manganes_mg DECIMAL(6,2),
  fosforo_mg DECIMAL(8,2),
  ferro_mg DECIMAL(6,2),
  sodio_mg DECIMAL(8,2),
  potassio_mg DECIMAL(8,2),
  cobre_mg DECIMAL(6,2),
  zinco_mg DECIMAL(6,2),
  selenio_mcg DECIMAL(6,2),
  vitamina_a_rae_mcg DECIMAL(8,2),
  vitamina_b1_mg DECIMAL(6,2),
  vitamina_b2_mg DECIMAL(6,2),
  vitamina_b3_mg DECIMAL(6,2),
  vitamina_b6_mg DECIMAL(6,2),
  vitamina_b12_mcg DECIMAL(6,2),
  vitamina_c_mg DECIMAL(6,2),
  vitamina_d_mcg DECIMAL(6,2),
  vitamina_e_mg DECIMAL(6,2),
  acido_folico_mcg DECIMAL(6,2),
  colesterol_mg DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: taco_foods (35 colunas) 
CREATE TABLE IF NOT EXISTS public.taco_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code INTEGER,
  food_name TEXT NOT NULL,
  category TEXT,
  energy_kcal DECIMAL(8,2),
  energy_kj DECIMAL(8,2),
  protein_g DECIMAL(6,2),
  lipids_g DECIMAL(6,2),
  carbohydrate_g DECIMAL(6,2),
  fiber_g DECIMAL(6,2),
  ash_g DECIMAL(6,2),
  calcium_mg DECIMAL(8,2),
  magnesium_mg DECIMAL(6,2),
  manganese_mg DECIMAL(6,2),
  phosphorus_mg DECIMAL(8,2),
  iron_mg DECIMAL(6,2),
  sodium_mg DECIMAL(8,2),
  potassium_mg DECIMAL(8,2),
  copper_mg DECIMAL(6,2),
  zinc_mg DECIMAL(6,2),
  retinol_mcg DECIMAL(8,2),
  re_mcg DECIMAL(8,2),
  rae_mcg DECIMAL(8,2),
  thiamine_mg DECIMAL(6,2),
  riboflavin_mg DECIMAL(6,2),
  pyridoxine_mg DECIMAL(6,2),
  niacin_mg DECIMAL(6,2),
  vitamin_c_mg DECIMAL(6,2),
  saturated_g DECIMAL(6,2),
  monounsaturated_g DECIMAL(6,2),
  polyunsaturated_g DECIMAL(6,2),
  cholesterol_mg DECIMAL(6,2),
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.food_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_nutritional_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_active_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_densities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_yields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_yields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taco_stage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taco_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view food aliases" ON public.food_aliases FOR SELECT USING (true);
CREATE POLICY "Everyone can view nutritional aliases" ON public.nutritional_aliases FOR SELECT USING (true);
CREATE POLICY "Users can submit pending aliases" ON public.pending_nutritional_aliases FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Everyone can view active principles" ON public.active_principles FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view food diseases" ON public.food_diseases FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view food densities" ON public.food_densities FOR SELECT USING (true);
CREATE POLICY "Everyone can view food yields" ON public.food_yields FOR SELECT USING (true);
CREATE POLICY "Everyone can view taco data" ON public.taco_stage FOR SELECT USING (true);
CREATE POLICY "Everyone can view taco foods" ON public.taco_foods FOR SELECT USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_food_aliases_food_id ON public.food_aliases(food_id);
CREATE INDEX IF NOT EXISTS idx_nutritional_aliases_food_id ON public.nutritional_aliases(food_id);
CREATE INDEX IF NOT EXISTS idx_food_active_principles_food_id ON public.food_active_principles(food_id);
CREATE INDEX IF NOT EXISTS idx_taco_foods_category ON public.taco_foods(category);
CREATE INDEX IF NOT EXISTS idx_food_diseases_food_id ON public.food_diseases(food_id);