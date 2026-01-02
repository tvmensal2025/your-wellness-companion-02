-- ========================================
-- MISSION HEALTH NEXUS - ESQUEMA COMPLETO
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 1. PROFILES (PERFIL DO USUÁRIO)
-- ========================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  height DECIMAL(5,2),
  target_weight DECIMAL(5,2),
  current_weight DECIMAL(5,2),
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'masculino', 'feminino')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active', 'sedentario', 'moderado', 'ativo')),
  avatar_url TEXT,
  google_fit_enabled BOOLEAN DEFAULT false,
  provider TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ========================================
-- 2. USER_PHYSICAL_DATA (DADOS FÍSICOS)
-- ========================================
CREATE TABLE public.user_physical_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  altura_cm DECIMAL(5,2) NOT NULL,
  idade INTEGER NOT NULL,
  sexo VARCHAR(10) NOT NULL CHECK (sexo IN ('masculino', 'feminino')),
  nivel_atividade VARCHAR(20) DEFAULT 'moderado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. WEIGHT_MEASUREMENTS (PESAGENS)
-- ========================================
CREATE TABLE public.weight_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  peso_kg DECIMAL(5,2) NOT NULL,
  gordura_corporal_percent DECIMAL(4,2),
  gordura_visceral INTEGER,
  massa_muscular_kg DECIMAL(5,2),
  agua_corporal_percent DECIMAL(4,2),
  osso_kg DECIMAL(4,2),
  metabolismo_basal_kcal INTEGER,
  idade_metabolica INTEGER,
  risco_metabolico VARCHAR(20),
  imc DECIMAL(4,2),
  circunferencia_abdominal_cm DECIMAL(5,2),
  circunferencia_braco_cm DECIMAL(4,2),
  circunferencia_perna_cm DECIMAL(4,2),
  device_type VARCHAR(50) DEFAULT 'manual',
  notes TEXT,
  measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. USER_GOALS (METAS)
-- ========================================
CREATE TABLE public.user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  peso_meta_kg DECIMAL(5,2),
  gordura_corporal_meta_percent DECIMAL(4,2),
  imc_meta DECIMAL(4,2),
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. WEEKLY_ANALYSES (ANÁLISES SEMANAIS)
-- ========================================
CREATE TABLE public.weekly_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  semana_inicio DATE NOT NULL,
  semana_fim DATE NOT NULL,
  peso_inicial DECIMAL(5,2),
  peso_final DECIMAL(5,2),
  variacao_peso DECIMAL(5,2),
  variacao_gordura_corporal DECIMAL(4,2),
  variacao_massa_muscular DECIMAL(5,2),
  media_imc DECIMAL(4,2),
  tendencia VARCHAR(20),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, semana_inicio)
);

-- ========================================
-- 6. MISSIONS (MISSÕES)
-- ========================================
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('exercise', 'nutrition', 'mindset', 'hydration', 'sleep')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ========================================
-- 7. USER_MISSIONS (PROGRESSO MISSÕES)
-- ========================================
CREATE TABLE public.user_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  date_assigned DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, mission_id, date_assigned)
);

-- ========================================
-- 8. HEALTH_DIARY (DIÁRIO DE SAÚDE)
-- ========================================
CREATE TABLE public.health_diary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_hours DECIMAL(3,1),
  water_intake DECIMAL(4,1),
  exercise_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ========================================
-- 9. COURSES (CURSOS)
-- ========================================
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  instructor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ========================================
-- 10. COURSE_MODULES (MÓDULOS)
-- ========================================
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ========================================
-- 11. LESSONS (AULAS)
-- ========================================
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ========================================
-- 12. USER_PROGRESS (PROGRESSO CURSOS)
-- ========================================
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_time_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, lesson_id)
);

-- ========================================
-- 13. AI_CONFIGURATIONS (CONFIGURAÇÕES IA)
-- ========================================
CREATE TABLE public.ai_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  functionality VARCHAR(100) NOT NULL UNIQUE,
  service VARCHAR(50) NOT NULL DEFAULT 'gemini',
  model VARCHAR(100) NOT NULL DEFAULT 'gemini-pro',
  max_tokens INTEGER NOT NULL DEFAULT 4096,
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.8,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  system_prompt TEXT,
  personality VARCHAR(20) DEFAULT 'drvital',
  level VARCHAR(20) DEFAULT 'meio',
  cost_per_request DECIMAL(10,6) DEFAULT 0.01,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 14. SESSIONS (SESSÕES)
-- ========================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'saboteur_work',
  content JSONB NOT NULL,
  target_saboteurs TEXT[],
  difficulty VARCHAR(20) DEFAULT 'beginner',
  estimated_time INTEGER,
  materials_needed TEXT[],
  follow_up_questions TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- ========================================
-- 15. USER_SESSIONS (SESSÕES DO USUÁRIO)
-- ========================================
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'assigned',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  feedback JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_physical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS RLS - PROFILES
-- ========================================
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS - USER_PHYSICAL_DATA
-- ========================================
CREATE POLICY "Users can view own physical data" ON public.user_physical_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own physical data" ON public.user_physical_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own physical data" ON public.user_physical_data FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS - WEIGHT_MEASUREMENTS
-- ========================================
CREATE POLICY "Users can view own weight" ON public.weight_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight" ON public.weight_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight" ON public.weight_measurements FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS - USER_GOALS
-- ========================================
CREATE POLICY "Users can view own goals" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS - WEEKLY_ANALYSES
-- ========================================
CREATE POLICY "Users can view own analyses" ON public.weekly_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.weekly_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analyses" ON public.weekly_analyses FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS - MISSIONS (público)
-- ========================================
CREATE POLICY "Everyone can view missions" ON public.missions FOR SELECT USING (true);

-- ========================================
-- POLÍTICAS RLS - USER_MISSIONS
-- ========================================
CREATE POLICY "Users can view own missions" ON public.user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own missions" ON public.user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own missions" ON public.user_missions FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS - HEALTH_DIARY
-- ========================================
CREATE POLICY "Users can view own diary" ON public.health_diary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diary" ON public.health_diary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diary" ON public.health_diary FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS - COURSES (público)
-- ========================================
CREATE POLICY "Everyone can view courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Everyone can view modules" ON public.course_modules FOR SELECT USING (true);
CREATE POLICY "Everyone can view lessons" ON public.lessons FOR SELECT USING (true);

-- ========================================
-- POLÍTICAS RLS - USER_PROGRESS
-- ========================================
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS RLS - AI_CONFIGURATIONS (público leitura)
-- ========================================
CREATE POLICY "Everyone can view ai config" ON public.ai_configurations FOR SELECT USING (true);

-- ========================================
-- POLÍTICAS RLS - SESSIONS (público)
-- ========================================
CREATE POLICY "Everyone can view sessions" ON public.sessions FOR SELECT USING (true);

-- ========================================
-- POLÍTICAS RLS - USER_SESSIONS
-- ========================================
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.user_sessions FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- TRIGGERS
-- ========================================
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_physical_data_updated_at BEFORE UPDATE ON public.user_physical_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_configurations_updated_at BEFORE UPDATE ON public.ai_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_weight_measurements_user_date ON public.weight_measurements(user_id, measurement_date DESC);
CREATE INDEX idx_weekly_analyses_user_week ON public.weekly_analyses(user_id, semana_inicio DESC);
CREATE INDEX idx_user_goals_user_status ON public.user_goals(user_id, status);
CREATE INDEX idx_user_physical_data_user ON public.user_physical_data(user_id);
CREATE INDEX idx_health_diary_user_date ON public.health_diary(user_id, date DESC);
CREATE INDEX idx_user_missions_user ON public.user_missions(user_id, date_assigned);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_ai_configurations_functionality ON public.ai_configurations(functionality);
CREATE INDEX idx_sessions_is_active ON public.sessions(is_active);
CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);

-- ========================================
-- DADOS INICIAIS - MISSÕES
-- ========================================
INSERT INTO public.missions (title, description, points, category, difficulty) VALUES
('Beber 2 litros de água', 'Hidrate-se adequadamente ao longo do dia', 10, 'hydration', 'easy'),
('Caminhar 30 minutos', 'Faça uma caminhada de pelo menos 30 minutos', 20, 'exercise', 'medium'),
('Meditar por 10 minutos', 'Pratique mindfulness por 10 minutos', 15, 'mindset', 'easy'),
('Comer 5 porções de frutas/vegetais', 'Consuma pelo menos 5 porções de frutas e vegetais', 25, 'nutrition', 'medium'),
('Dormir 8 horas', 'Tenha uma noite de sono reparador', 30, 'sleep', 'hard'),
('Fazer exercício de força', 'Realize exercícios de musculação ou resistência', 35, 'exercise', 'hard'),
('Evitar açúcar refinado', 'Não consuma açúcar refinado durante o dia', 20, 'nutrition', 'medium');

-- ========================================
-- DADOS INICIAIS - CURSOS
-- ========================================
INSERT INTO public.courses (title, description, category, difficulty_level, duration_minutes, instructor_name) VALUES
('Fundamentos da Nutrição Saudável', 'Aprenda os princípios básicos de uma alimentação equilibrada', 'Nutrição', 'beginner', 180, 'Dra. Ana Nutricionista'),
('Exercícios para Iniciantes', 'Comece sua jornada fitness com exercícios simples e eficazes', 'Exercício', 'beginner', 120, 'Prof. João Personal'),
('Mindfulness e Emagrecimento', 'Desenvolva uma relação saudável com a comida através da atenção plena', 'Mindset', 'intermediate', 90, 'Psic. Maria Terapia'),
('Receitas Fit Deliciosas', 'Aprenda a preparar refeições saudáveis e saborosas', 'Nutrição', 'intermediate', 150, 'Chef Carlos Fitness');

-- ========================================
-- DADOS INICIAIS - AI CONFIGURATIONS
-- ========================================
INSERT INTO public.ai_configurations (functionality, service, model, max_tokens, temperature, is_enabled, personality, level, priority) VALUES
('medical_analysis', 'gemini', 'gemini-pro', 4096, 0.8, true, 'drvital', 'meio', 1),
('weekly_report', 'gemini', 'gemini-pro', 4096, 0.8, true, 'sofia', 'meio', 1),
('monthly_report', 'gemini', 'gemini-pro', 4096, 0.8, true, 'drvital', 'meio', 1),
('daily_chat', 'gemini', 'gemini-pro', 4096, 0.8, true, 'sofia', 'meio', 1),
('preventive_analysis', 'gemini', 'gemini-pro', 4096, 0.8, true, 'drvital', 'meio', 1),
('food_analysis', 'gemini', 'gemini-pro', 4096, 0.8, true, 'drvital', 'meio', 1),
('daily_missions', 'gemini', 'gemini-pro', 4096, 0.8, true, 'sofia', 'meio', 1);

-- ========================================
-- FUNÇÃO PARA CRIAR PROFILE AUTOMATICAMENTE
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar profile ao registrar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();