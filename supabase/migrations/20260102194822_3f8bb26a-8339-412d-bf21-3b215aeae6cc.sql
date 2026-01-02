-- ========================================
-- TABELAS ADICIONAIS - PARTE 3
-- ========================================

-- Adicionar colunas faltantes em daily_mission_sessions
ALTER TABLE public.daily_mission_sessions 
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

-- Adicionar colunas faltantes em profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- COMPANY_DATA (Dados da empresa)
CREATE TABLE IF NOT EXISTS public.company_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT,
  company_logo TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  website TEXT,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXERCISES (Exercícios)
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  muscle_group TEXT,
  difficulty TEXT,
  video_url TEXT,
  image_url TEXT,
  instructions TEXT,
  duration_seconds INTEGER,
  calories_per_minute INTEGER,
  equipment TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUPPLEMENTS (Suplementos/Produtos)
CREATE TABLE IF NOT EXISTS public.supplements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT,
  name TEXT NOT NULL,
  category TEXT,
  brand TEXT,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  affiliate_link TEXT,
  benefits TEXT[],
  ingredients TEXT[],
  dosage TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMPANY_KNOWLEDGE_BASE (Base de conhecimento)
CREATE TABLE IF NOT EXISTS public.company_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content TEXT,
  category TEXT,
  tags TEXT[],
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOFIA_FOOD_ANALYSIS (Análise de alimentos)
CREATE TABLE IF NOT EXISTS public.sofia_food_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT,
  food_image_url TEXT,
  analysis_result JSONB,
  calories INTEGER,
  proteins DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fats DECIMAL(5,2),
  health_score INTEGER,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NUTRITION_FOODS (Alimentos nutricionais)
CREATE TABLE IF NOT EXISTS public.nutrition_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  aliases TEXT[],
  category TEXT,
  calories_per_100g INTEGER,
  proteins_per_100g DECIMAL(5,2),
  carbs_per_100g DECIMAL(5,2),
  fats_per_100g DECIMAL(5,2),
  fiber_per_100g DECIMAL(5,2),
  sodium_per_100g DECIMAL(5,2),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_ROLES (Papéis de usuário)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT DEFAULT 'user',
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GOOGLE_FIT_DATA (Dados do Google Fit)
CREATE TABLE IF NOT EXISTS public.google_fit_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT,
  value DECIMAL(10,2),
  unit TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  source TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofia_food_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_fit_data ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS
CREATE POLICY "Everyone can view company data" ON public.company_data FOR SELECT USING (true);
CREATE POLICY "Everyone can view exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Everyone can view supplements" ON public.supplements FOR SELECT USING (true);
CREATE POLICY "Everyone can view knowledge base" ON public.company_knowledge_base FOR SELECT USING (true);
CREATE POLICY "Everyone can view nutrition foods" ON public.nutrition_foods FOR SELECT USING (true);

CREATE POLICY "Users can view own food analysis" ON public.sofia_food_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food analysis" ON public.sofia_food_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own google fit data" ON public.google_fit_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own google fit data" ON public.google_fit_data FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TRIGGERS
CREATE TRIGGER update_company_data_updated_at BEFORE UPDATE ON public.company_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplements_updated_at BEFORE UPDATE ON public.supplements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.company_knowledge_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nutrition_foods_updated_at BEFORE UPDATE ON public.nutrition_foods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ÍNDICES
CREATE INDEX idx_exercises_category ON public.exercises(category);
CREATE INDEX idx_supplements_category ON public.supplements(category);
CREATE INDEX idx_sofia_food_analysis_user ON public.sofia_food_analysis(user_id);
CREATE INDEX idx_nutrition_foods_name ON public.nutrition_foods(name);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_google_fit_data_user ON public.google_fit_data(user_id);