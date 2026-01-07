-- Trigger que credita pontos quando meta é CONCLUÍDA
CREATE OR REPLACE FUNCTION update_user_points_on_goal_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  goal_points INTEGER;
  new_total INTEGER;
BEGIN
  -- Só executa quando status muda para 'concluida'
  IF NEW.status = 'concluida' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'concluida') THEN
    -- Usa final_points (definido pelo admin) ou estimated_points como fallback
    goal_points := COALESCE(NEW.final_points, NEW.estimated_points, 50);
    
    -- Credita pontos no user_points
    INSERT INTO user_points (user_id, total_points, daily_points, level, last_activity_date, updated_at)
    VALUES (NEW.user_id, goal_points, goal_points, 1, CURRENT_DATE, now())
    ON CONFLICT (user_id) DO UPDATE SET
      total_points = user_points.total_points + goal_points,
      daily_points = user_points.daily_points + goal_points,
      level = GREATEST(1, (user_points.total_points + goal_points) / 100),
      last_activity_date = CURRENT_DATE,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger (drop se existir para evitar duplicação)
DROP TRIGGER IF EXISTS on_goal_complete ON user_goals;

CREATE TRIGGER on_goal_complete
  AFTER UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points_on_goal_complete();