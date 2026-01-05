-- Corrigir a view para usar SECURITY INVOKER (comportamento padrão seguro)
DROP VIEW IF EXISTS public.exercise_progress_stats;

CREATE VIEW public.exercise_progress_stats 
WITH (security_invoker = true) AS
SELECT 
  user_id,
  exercise_id,
  exercise_name,
  COUNT(*) as total_sessions,
  MAX(weight_kg) as max_weight,
  AVG(weight_kg)::DECIMAL(6,2) as avg_weight,
  MAX(reps_completed) as max_reps,
  AVG(reps_completed)::INTEGER as avg_reps,
  MIN(workout_date) as first_workout,
  MAX(workout_date) as last_workout
FROM public.exercise_progress_logs
GROUP BY user_id, exercise_id, exercise_name;