-- Tabela para registrar progressão de cargas por exercício
CREATE TABLE public.exercise_progress_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID REFERENCES public.exercises_library(id),
  exercise_name TEXT NOT NULL,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  set_number INTEGER NOT NULL DEFAULT 1,
  reps_completed INTEGER,
  weight_kg DECIMAL(6,2),
  duration_seconds INTEGER,
  perceived_difficulty INTEGER CHECK (perceived_difficulty >= 1 AND perceived_difficulty <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_exercise_progress_user ON public.exercise_progress_logs(user_id);
CREATE INDEX idx_exercise_progress_exercise ON public.exercise_progress_logs(exercise_id);
CREATE INDEX idx_exercise_progress_date ON public.exercise_progress_logs(workout_date DESC);
CREATE INDEX idx_exercise_progress_user_exercise ON public.exercise_progress_logs(user_id, exercise_id, workout_date DESC);

-- Habilitar RLS
ALTER TABLE public.exercise_progress_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own progress" 
  ON public.exercise_progress_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
  ON public.exercise_progress_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON public.exercise_progress_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
  ON public.exercise_progress_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- View para estatísticas de progressão
CREATE OR REPLACE VIEW public.exercise_progress_stats AS
SELECT 
  user_id,
  exercise_id,
  exercise_name,
  COUNT(*) as total_sessions,
  MAX(weight_kg) as max_weight,
  AVG(weight_kg) as avg_weight,
  MAX(reps_completed) as max_reps,
  AVG(reps_completed) as avg_reps,
  MIN(workout_date) as first_workout,
  MAX(workout_date) as last_workout,
  -- Calcular progressão (diferença entre última e primeira carga)
  (
    SELECT weight_kg FROM public.exercise_progress_logs p2 
    WHERE p2.user_id = exercise_progress_logs.user_id 
    AND p2.exercise_id = exercise_progress_logs.exercise_id 
    ORDER BY workout_date DESC LIMIT 1
  ) - (
    SELECT weight_kg FROM public.exercise_progress_logs p3 
    WHERE p3.user_id = exercise_progress_logs.user_id 
    AND p3.exercise_id = exercise_progress_logs.exercise_id 
    ORDER BY workout_date ASC LIMIT 1
  ) as weight_progress
FROM public.exercise_progress_logs
GROUP BY user_id, exercise_id, exercise_name;