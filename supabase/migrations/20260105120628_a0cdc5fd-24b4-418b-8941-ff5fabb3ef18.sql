-- Criar tabela para registrar exercícios completados pelo usuário
CREATE TABLE IF NOT EXISTS public.user_exercise_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT,
  sets_completed INTEGER DEFAULT 0,
  reps_completed INTEGER DEFAULT 0,
  weight_used DECIMAL,
  duration_seconds INTEGER,
  calories_burned INTEGER,
  difficulty_level TEXT,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_exercise_history_user_id ON public.user_exercise_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_history_completed_at ON public.user_exercise_history(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_exercise_history_exercise_type ON public.user_exercise_history(exercise_type);

-- Habilitar RLS
ALTER TABLE public.user_exercise_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own exercise history"
  ON public.user_exercise_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise history"
  ON public.user_exercise_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise history"
  ON public.user_exercise_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE public.user_exercise_history IS 'Histórico de exercícios completados para análise da Sofia e Dr. Vital';
COMMENT ON COLUMN public.user_exercise_history.exercise_type IS 'Tipo: cardio, força, flexibilidade, etc';