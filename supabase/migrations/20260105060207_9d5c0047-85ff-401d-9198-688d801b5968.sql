-- Criar tabela para feedback de dificuldade dos exercícios pelo usuário
CREATE TABLE IF NOT EXISTS public.user_exercise_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  perceived_difficulty TEXT NOT NULL CHECK (perceived_difficulty IN ('facil', 'medio', 'dificil')),
  expected_difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Enable RLS
ALTER TABLE public.user_exercise_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - usuários podem gerenciar seu próprio feedback
CREATE POLICY "Users can view own feedback" 
ON public.user_exercise_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" 
ON public.user_exercise_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback" 
ON public.user_exercise_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Adicionar coluna de nível de experiência no perfil se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fitness_level TEXT DEFAULT 'iniciante' 
CHECK (fitness_level IN ('iniciante', 'intermediario', 'avancado'));

-- Trigger para atualizar updated_at
CREATE OR REPLACE TRIGGER update_user_exercise_feedback_updated_at
BEFORE UPDATE ON public.user_exercise_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();