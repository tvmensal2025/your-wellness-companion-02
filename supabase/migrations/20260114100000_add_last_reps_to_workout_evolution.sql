-- Adicionar coluna last_reps para exercícios de peso corporal
-- Isso permite rastrear a progressão de repetições em exercícios como flexão, barra, etc.

ALTER TABLE public.user_workout_evolution 
ADD COLUMN IF NOT EXISTS last_reps INTEGER;

-- Comentário explicativo
COMMENT ON COLUMN public.user_workout_evolution.last_reps IS 'Última quantidade de repetições registrada (usado para exercícios de peso corporal)';
