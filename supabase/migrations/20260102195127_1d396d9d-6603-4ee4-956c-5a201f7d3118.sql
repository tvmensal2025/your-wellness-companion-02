-- ========================================
-- TABELAS ADICIONAIS - PARTE 7 (FINAL)
-- ========================================

-- SPORT_TRAINING_PLANS (Planos de treino esportivo)
CREATE TABLE IF NOT EXISTS public.sport_training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport_type TEXT,
  goal TEXT,
  difficulty TEXT,
  duration_weeks INTEGER,
  current_week INTEGER DEFAULT 1,
  total_workouts INTEGER DEFAULT 0,
  completed_workouts INTEGER DEFAULT 0,
  workouts_per_week INTEGER,
  exercises JSONB,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SPORT_WORKOUT_LOGS (Logs de treino)
CREATE TABLE IF NOT EXISTS public.sport_workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.sport_training_plans(id) ON DELETE CASCADE,
  workout_name TEXT,
  exercises_completed JSONB,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BIOIMPEDANCE_ANALYSIS (Análise bioimpedância)
CREATE TABLE IF NOT EXISTS public.bioimpedance_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_id UUID REFERENCES public.weight_measurements(id),
  analysis_result JSONB,
  recommendations TEXT,
  health_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHAT_CONVERSATIONS (Conversas de chat)
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  personality TEXT,
  messages JSONB,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.sport_training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bioimpedance_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS
CREATE POLICY "Users can view own sport plans" ON public.sport_training_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sport plans" ON public.sport_training_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sport plans" ON public.sport_training_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sport plans" ON public.sport_training_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workout logs" ON public.sport_workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout logs" ON public.sport_workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own bioimpedance" ON public.bioimpedance_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bioimpedance" ON public.bioimpedance_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);

-- TRIGGERS
CREATE TRIGGER update_sport_training_plans_updated_at BEFORE UPDATE ON public.sport_training_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ÍNDICES
CREATE INDEX idx_sport_training_plans_user ON public.sport_training_plans(user_id);
CREATE INDEX idx_sport_workout_logs_user ON public.sport_workout_logs(user_id);
CREATE INDEX idx_bioimpedance_analysis_user ON public.bioimpedance_analysis(user_id);
CREATE INDEX idx_chat_conversations_user ON public.chat_conversations(user_id);