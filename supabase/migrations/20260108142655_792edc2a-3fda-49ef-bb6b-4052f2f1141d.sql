-- FASE 1: Corrigir funções SQL sem search_path

-- 1.1 Corrigir calculate_level
CREATE OR REPLACE FUNCTION public.calculate_level(xp integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 1.2 Corrigir sync_goal_updates_values
CREATE OR REPLACE FUNCTION public.sync_goal_updates_values()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.new_value IS NULL AND NEW.value IS NOT NULL THEN
    NEW.new_value := NEW.value;
  ELSIF NEW.value IS NULL AND NEW.new_value IS NOT NULL THEN
    NEW.value := NEW.new_value;
  END IF;
  RETURN NEW;
END;
$function$;

-- 1.3 Corrigir update_points_config_updated_at
CREATE OR REPLACE FUNCTION public.update_points_config_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 1.4 Corrigir update_user_points_on_mission
CREATE OR REPLACE FUNCTION public.update_user_points_on_mission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 1.5 Corrigir update_user_points_on_challenge
CREATE OR REPLACE FUNCTION public.update_user_points_on_challenge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- FASE 2: Corrigir RLS Policies Permissivas

-- 2.1 Corrigir admin_logs - apenas admins podem inserir
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON admin_logs;
DROP POLICY IF EXISTS "Anyone can insert admin logs" ON admin_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON admin_logs;

CREATE POLICY "Admins can view admin logs"
ON admin_logs FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "System can insert admin logs"
ON admin_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2.2 Corrigir ai_system_logs - usuário vê seus próprios logs, admin vê todos
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON ai_system_logs;
DROP POLICY IF EXISTS "Users can view their own logs" ON ai_system_logs;

CREATE POLICY "Users can view own ai_system_logs"
ON ai_system_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "System can insert ai_system_logs"
ON ai_system_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2.3 Corrigir ai_configurations - apenas admins podem modificar
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON ai_configurations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON ai_configurations;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON ai_configurations;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON ai_configurations;

CREATE POLICY "Anyone can read ai_configurations"
ON ai_configurations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert ai_configurations"
ON ai_configurations FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update ai_configurations"
ON ai_configurations FOR UPDATE
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admins can delete ai_configurations"
ON ai_configurations FOR DELETE
TO authenticated
USING (public.is_admin_user());