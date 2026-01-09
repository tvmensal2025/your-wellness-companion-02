-- Tabela para rastrear evolução do usuário por exercício
CREATE TABLE public.user_workout_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  weight_kg DECIMAL(5,2),
  max_weight_kg DECIMAL(5,2),
  max_reps INTEGER,
  total_sets INTEGER DEFAULT 0,
  total_volume DECIMAL(10,2),
  last_workout_date TIMESTAMP WITH TIME ZONE,
  progression_trend TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, exercise_name)
);

-- Enable RLS
ALTER TABLE public.user_workout_evolution ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own evolution"
ON public.user_workout_evolution FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own evolution"
ON public.user_workout_evolution FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evolution"
ON public.user_workout_evolution FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_workout_evolution_updated_at
BEFORE UPDATE ON public.user_workout_evolution
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();