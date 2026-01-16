-- Fix function recalculate_user_streak to use sofia_food_analysis instead of food_analysis
CREATE OR REPLACE FUNCTION recalculate_user_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
  v_has_activity BOOLEAN;
BEGIN
  v_check_date := v_current_date;
  
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM (
        SELECT 1 FROM sofia_food_analysis WHERE user_id = p_user_id AND DATE(created_at) = v_check_date
        UNION ALL
        SELECT 1 FROM weight_measurements WHERE user_id = p_user_id AND measurement_date = v_check_date
        UNION ALL
        SELECT 1 FROM advanced_daily_tracking WHERE user_id = p_user_id AND tracking_date = v_check_date
        UNION ALL
        SELECT 1 FROM daily_mission_sessions WHERE user_id = p_user_id AND date = v_check_date AND is_completed = true
        UNION ALL
        SELECT 1 FROM health_feed_posts WHERE user_id = p_user_id AND DATE(created_at) = v_check_date
      ) activities
    ) INTO v_has_activity;

    IF v_has_activity THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      IF v_check_date < v_current_date THEN
        EXIT;
      END IF;
      
      v_check_date := v_check_date - INTERVAL '1 day';
      
      SELECT EXISTS (
        SELECT 1 FROM (
          SELECT 1 FROM sofia_food_analysis WHERE user_id = p_user_id AND DATE(created_at) = v_check_date
          UNION ALL
          SELECT 1 FROM weight_measurements WHERE user_id = p_user_id AND measurement_date = v_check_date
          UNION ALL
          SELECT 1 FROM advanced_daily_tracking WHERE user_id = p_user_id AND tracking_date = v_check_date
          UNION ALL
          SELECT 1 FROM daily_mission_sessions WHERE user_id = p_user_id AND date = v_check_date AND is_completed = true
        ) activities
      ) INTO v_has_activity;

      IF NOT v_has_activity THEN
        EXIT;
      ELSE
        v_streak := 1;
        v_check_date := v_check_date - INTERVAL '1 day';
      END IF;
    END IF;

    IF v_current_date - v_check_date > 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$;

-- Fix trigger function to use sofia_food_analysis
CREATE OR REPLACE FUNCTION trigger_update_streak_on_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_new_streak INTEGER;
BEGIN
  IF TG_TABLE_NAME = 'sofia_food_analysis' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'weight_measurements' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'advanced_daily_tracking' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'daily_mission_sessions' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'health_feed_posts' THEN
    v_user_id := NEW.user_id;
  END IF;

  IF v_user_id IS NOT NULL THEN
    v_new_streak := recalculate_user_streak(v_user_id);
    
    UPDATE user_points
    SET 
      current_streak = v_new_streak,
      best_streak = GREATEST(best_streak, v_new_streak),
      last_activity_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = v_user_id;
  END IF;

  RETURN NEW;
END;
$$;