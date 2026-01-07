
-- Adicionar colunas que podem estar faltando em user_points
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS completed_challenges integer DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS missions_completed integer DEFAULT 0;

-- Índices para performance com milhares de usuários
CREATE INDEX IF NOT EXISTS idx_user_points_ranking ON user_points(total_points DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_streak ON user_points(current_streak DESC NULLS LAST);

-- Função para calcular nível baseado em XP
CREATE OR REPLACE FUNCTION calculate_level(xp integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  lvl integer := 1;
  xp_needed integer := 0;
BEGIN
  WHILE xp >= xp_needed + (lvl * 100) LOOP
    xp_needed := xp_needed + (lvl * 100);
    lvl := lvl + 1;
  END LOOP;
  RETURN lvl;
END;
$$;

-- Função para atualizar user_points quando missão é completada
CREATE OR REPLACE FUNCTION update_user_points_on_mission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  points_earned integer;
BEGIN
  points_earned := COALESCE(NEW.total_points, 10);
  
  INSERT INTO user_points (user_id, total_points, daily_points, missions_completed, last_activity_date, updated_at)
  VALUES (NEW.user_id, points_earned, points_earned, 1, CURRENT_DATE, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + points_earned,
    daily_points = CASE 
      WHEN user_points.last_activity_date = CURRENT_DATE THEN user_points.daily_points + points_earned
      ELSE points_earned
    END,
    missions_completed = user_points.missions_completed + 1,
    level = calculate_level(user_points.total_points + points_earned),
    last_activity_date = CURRENT_DATE,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Função para atualizar user_points quando desafio é completado
CREATE OR REPLACE FUNCTION update_user_points_on_challenge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  challenge_xp integer;
BEGIN
  IF NEW.is_completed = true AND (OLD IS NULL OR OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    SELECT COALESCE(xp_reward, 50) INTO challenge_xp FROM challenges WHERE id = NEW.challenge_id;
    
    INSERT INTO user_points (user_id, total_points, completed_challenges, last_activity_date, updated_at)
    VALUES (NEW.user_id, COALESCE(challenge_xp, 50), 1, CURRENT_DATE, now())
    ON CONFLICT (user_id) DO UPDATE SET
      total_points = user_points.total_points + COALESCE(challenge_xp, 50),
      completed_challenges = user_points.completed_challenges + 1,
      level = calculate_level(user_points.total_points + COALESCE(challenge_xp, 50)),
      last_activity_date = CURRENT_DATE,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remove triggers antigos se existirem
DROP TRIGGER IF EXISTS on_mission_complete ON daily_mission_sessions;
DROP TRIGGER IF EXISTS on_challenge_complete ON challenge_participations;

-- Cria triggers
CREATE TRIGGER on_mission_complete
  AFTER INSERT ON daily_mission_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points_on_mission();

CREATE TRIGGER on_challenge_complete
  AFTER INSERT OR UPDATE ON challenge_participations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points_on_challenge();

-- Sincronizar dados existentes
INSERT INTO user_points (user_id, total_points, missions_completed, completed_challenges, current_streak, best_streak, level, last_activity_date, updated_at)
SELECT 
  p.user_id,
  COALESCE((SELECT SUM(COALESCE(dms.total_points, 10)) FROM daily_mission_sessions dms WHERE dms.user_id = p.user_id), 0),
  COALESCE((SELECT COUNT(*) FROM daily_mission_sessions dms WHERE dms.user_id = p.user_id), 0),
  COALESCE((SELECT COUNT(*) FROM challenge_participations cp WHERE cp.user_id = p.user_id AND cp.is_completed = true), 0),
  1,
  1,
  calculate_level(COALESCE((SELECT SUM(COALESCE(dms.total_points, 10)) FROM daily_mission_sessions dms WHERE dms.user_id = p.user_id), 0)::integer),
  CURRENT_DATE,
  now()
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM user_points up WHERE up.user_id = p.user_id)
ON CONFLICT (user_id) DO UPDATE SET
  total_points = GREATEST(user_points.total_points, EXCLUDED.total_points),
  missions_completed = GREATEST(user_points.missions_completed, EXCLUDED.missions_completed),
  completed_challenges = GREATEST(user_points.completed_challenges, EXCLUDED.completed_challenges),
  level = calculate_level(GREATEST(user_points.total_points, EXCLUDED.total_points)),
  updated_at = now();
