-- Corrigir estrutura da tabela sport_training_plans de forma segura
-- Esta migração garante que a tabela tenha todas as colunas necessárias

-- 1. Remover tabelas antigas se existirem (para começar limpo)
DROP TABLE IF EXISTS public.sport_workout_logs CASCADE;
DROP TABLE IF EXISTS public.sport_training_plans CASCADE;

-- 2. Criar tabela sport_training_plans com estrutura completa
CREATE TABLE public.sport_training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modality_id UUID,
  plan_name TEXT NOT NULL,
  plan_type TEXT DEFAULT 'custom',
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  workouts_per_week INTEGER NOT NULL DEFAULT 3,
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_workouts INTEGER DEFAULT 0,
  completed_workouts INTEGER DEFAULT 0,
  completion_percentage NUMERIC DEFAULT 0,
  total_distance_km NUMERIC DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  total_calories_burned INTEGER DEFAULT 0,
  last_workout_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Criar tabela de logs de treino
CREATE TABLE public.sport_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.sport_training_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  workout_type TEXT,
  exercises JSONB DEFAULT '{}'::jsonb,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Criar índices
CREATE INDEX idx_sport_training_plans_user_id ON public.sport_training_plans(user_id);
CREATE INDEX idx_sport_training_plans_status ON public.sport_training_plans(status);
CREATE INDEX idx_sport_workout_logs_user_id ON public.sport_workout_logs(user_id);
CREATE INDEX idx_sport_workout_logs_plan_id ON public.sport_workout_logs(plan_id);

-- 5. Habilitar RLS
ALTER TABLE public.sport_training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_workout_logs ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para sport_training_plans
CREATE POLICY "Users can view own plans" 
  ON public.sport_training_plans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans" 
  ON public.sport_training_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" 
  ON public.sport_training_plans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" 
  ON public.sport_training_plans FOR DELETE 
  USING (auth.uid() = user_id);

-- 7. Criar políticas RLS para sport_workout_logs
CREATE POLICY "Users can view own logs" 
  ON public.sport_workout_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own logs" 
  ON public.sport_workout_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 8. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sport_training_plans_updated_at
  BEFORE UPDATE ON public.sport_training_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();