-- ========================================
-- TABELAS ADICIONAIS - PARTE 2
-- ========================================

-- Adicionar colunas faltantes em user_anamnesis
ALTER TABLE public.user_anamnesis 
ADD COLUMN IF NOT EXISTS problematic_foods TEXT,
ADD COLUMN IF NOT EXISTS forbidden_foods TEXT;

-- Adicionar coluna is_premium em lessons
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- USER_ACHIEVEMENTS (Conquistas do usuário)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT,
  achievement_name TEXT,
  achievement_type TEXT,
  description TEXT,
  xp_earned INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MEDICAL_DOCUMENTS (Documentos médicos)
CREATE TABLE IF NOT EXISTS public.medical_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  analysis_status TEXT DEFAULT 'pending',
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DAILY_MISSION_SESSIONS (Sessões de missões diárias)
CREATE TABLE IF NOT EXISTS public.daily_mission_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE DEFAULT CURRENT_DATE,
  missions_completed INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHALLENGES (Desafios)
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT,
  difficulty TEXT,
  duration_days INTEGER,
  xp_reward INTEGER DEFAULT 0,
  badge_reward TEXT,
  requirements JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_CHALLENGES (Participação em desafios)
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_mission_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own medical docs" ON public.medical_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medical docs" ON public.medical_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medical docs" ON public.medical_documents FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mission sessions" ON public.daily_mission_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mission sessions" ON public.daily_mission_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mission sessions" ON public.daily_mission_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view challenges" ON public.challenges FOR SELECT USING (true);

CREATE POLICY "Users can view own user challenges" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user challenges" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user challenges" ON public.user_challenges FOR UPDATE USING (auth.uid() = user_id);

-- TRIGGERS
CREATE TRIGGER update_medical_documents_updated_at BEFORE UPDATE ON public.medical_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ÍNDICES
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_medical_documents_user ON public.medical_documents(user_id);
CREATE INDEX idx_daily_mission_sessions_user ON public.daily_mission_sessions(user_id, session_date);
CREATE INDEX idx_challenges_active ON public.challenges(is_active);
CREATE INDEX idx_user_challenges_user ON public.user_challenges(user_id);