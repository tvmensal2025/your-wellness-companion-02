-- ========================================
-- TABELAS ADICIONAIS - PARTE 6 (CORREÇÕES)
-- ========================================

-- Adicionar colunas faltantes em user_anamnesis
ALTER TABLE public.user_anamnesis 
ADD COLUMN IF NOT EXISTS physical_activity_frequency TEXT,
ADD COLUMN IF NOT EXISTS main_treatment_goals TEXT,
ADD COLUMN IF NOT EXISTS daily_stress_level TEXT,
ADD COLUMN IF NOT EXISTS sleep_quality_score INTEGER;

-- Adicionar colunas faltantes em daily_responses
ALTER TABLE public.daily_responses 
ADD COLUMN IF NOT EXISTS section TEXT,
ADD COLUMN IF NOT EXISTS answer TEXT,
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- Adicionar colunas faltantes em daily_mission_sessions
ALTER TABLE public.daily_mission_sessions 
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_sections JSONB DEFAULT '[]'::jsonb;

-- PROTOCOL_SUPPLEMENTS (Suplementos de protocolos)
CREATE TABLE IF NOT EXISTS public.protocol_supplements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID REFERENCES public.supplement_protocols(id) ON DELETE CASCADE,
  supplement_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  timing TEXT,
  notes TEXT,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXERCISE_PROGRAMS (Programas de exercício)
CREATE TABLE IF NOT EXISTS public.exercise_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  difficulty TEXT,
  duration_weeks INTEGER,
  sessions_per_week INTEGER,
  exercises JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_EXERCISE_PROGRAMS (Programas do usuário)
CREATE TABLE IF NOT EXISTS public.user_exercise_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.exercise_programs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  current_week INTEGER DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_PURCHASES (Compras do usuário)
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.protocol_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS
CREATE POLICY "Everyone can view protocol supplements" ON public.protocol_supplements FOR SELECT USING (true);
CREATE POLICY "Everyone can view exercise programs" ON public.exercise_programs FOR SELECT USING (true);

CREATE POLICY "Users can view own exercise programs" ON public.user_exercise_programs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercise programs" ON public.user_exercise_programs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercise programs" ON public.user_exercise_programs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own purchases" ON public.user_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON public.user_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TRIGGERS
CREATE TRIGGER update_exercise_programs_updated_at BEFORE UPDATE ON public.exercise_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ÍNDICES
CREATE INDEX idx_protocol_supplements_protocol ON public.protocol_supplements(protocol_id);
CREATE INDEX idx_user_exercise_programs_user ON public.user_exercise_programs(user_id);
CREATE INDEX idx_user_purchases_user ON public.user_purchases(user_id);