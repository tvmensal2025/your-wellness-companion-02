-- =============================================
-- CORREÇÃO DO CÁLCULO DE STREAK
-- Data: 2026-01-11
-- =============================================

-- 1. CORRIGIR STREAKS ZERADOS PARA USUÁRIOS COM ATIVIDADE RECENTE
-- Se last_activity_date é hoje ou ontem, streak deveria ser pelo menos 1
UPDATE user_points
SET current_streak = GREATEST(current_streak, 1)
WHERE current_streak = 0 
  AND last_activity_date >= CURRENT_DATE - INTERVAL '1 day';

-- 2. CRIAR FUNÇÃO PARA RECALCULAR STREAK BASEADO NO HISTÓRICO
CREATE OR REPLACE FUNCTION recalculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
  v_has_activity BOOLEAN;
BEGIN
  -- Começar de hoje e ir para trás
  v_check_date := v_current_date;
  
  LOOP
    -- Verificar se há atividade nesta data
    SELECT EXISTS (
      SELECT 1 FROM (
        -- Verificar food_analysis
        SELECT 1 FROM food_analysis 
        WHERE user_id = p_user_id 
          AND DATE(created_at) = v_check_date
        UNION ALL
        -- Verificar weight_measurements
        SELECT 1 FROM weight_measurements 
        WHERE user_id = p_user_id 
          AND measurement_date = v_check_date
        UNION ALL
        -- Verificar advanced_daily_tracking
        SELECT 1 FROM advanced_daily_tracking 
        WHERE user_id = p_user_id 
          AND tracking_date = v_check_date
        UNION ALL
        -- Verificar daily_mission_sessions
        SELECT 1 FROM daily_mission_sessions 
        WHERE user_id = p_user_id 
          AND date = v_check_date
          AND completed = true
        UNION ALL
        -- Verificar health_feed_posts
        SELECT 1 FROM health_feed_posts 
        WHERE user_id = p_user_id 
          AND DATE(created_at) = v_check_date
      ) activities
    ) INTO v_has_activity;
    
    IF v_has_activity THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      -- Se não há atividade e não é o primeiro dia, parar
      IF v_check_date < v_current_date THEN
        EXIT;
      END IF;
      -- Se é hoje e não há atividade, verificar ontem
      v_check_date := v_check_date - INTERVAL '1 day';
      
      -- Verificar ontem
      SELECT EXISTS (
        SELECT 1 FROM (
          SELECT 1 FROM food_analysis WHERE user_id = p_user_id AND DATE(created_at) = v_check_date
          UNION ALL
          SELECT 1 FROM weight_measurements WHERE user_id = p_user_id AND measurement_date = v_check_date
          UNION ALL
          SELECT 1 FROM advanced_daily_tracking WHERE user_id = p_user_id AND tracking_date = v_check_date
          UNION ALL
          SELECT 1 FROM daily_mission_sessions WHERE user_id = p_user_id AND date = v_check_date AND completed = true
        ) activities
      ) INTO v_has_activity;
      
      IF NOT v_has_activity THEN
        EXIT; -- Sem atividade ontem também, streak = 0
      ELSE
        v_streak := 1;
        v_check_date := v_check_date - INTERVAL '1 day';
      END IF;
    END IF;
    
    -- Limite de 365 dias para evitar loop infinito
    IF v_current_date - v_check_date > 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CRIAR FUNÇÃO PARA ATUALIZAR STREAK DE TODOS OS USUÁRIOS
CREATE OR REPLACE FUNCTION sync_all_user_streaks()
RETURNS void AS $$
DECLARE
  v_user RECORD;
  v_new_streak INTEGER;
BEGIN
  FOR v_user IN 
    SELECT DISTINCT user_id FROM user_points WHERE total_points > 0
  LOOP
    v_new_streak := recalculate_user_streak(v_user.user_id);
    
    UPDATE user_points
    SET 
      current_streak = v_new_streak,
      best_streak = GREATEST(best_streak, v_new_streak),
      updated_at = NOW()
    WHERE user_id = v_user.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. EXECUTAR SINCRONIZAÇÃO INICIAL
SELECT sync_all_user_streaks();

-- 5. CRIAR TRIGGER PARA ATUALIZAR STREAK AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION trigger_update_streak_on_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_new_streak INTEGER;
BEGIN
  -- Determinar user_id baseado na tabela
  IF TG_TABLE_NAME = 'food_analysis' THEN
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
    -- Recalcular streak
    v_new_streak := recalculate_user_streak(v_user_id);
    
    -- Atualizar user_points
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR TRIGGERS NAS TABELAS DE ATIVIDADE
DROP TRIGGER IF EXISTS update_streak_on_food_analysis ON food_analysis;
CREATE TRIGGER update_streak_on_food_analysis
  AFTER INSERT ON food_analysis
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_streak_on_activity();

DROP TRIGGER IF EXISTS update_streak_on_weight ON weight_measurements;
CREATE TRIGGER update_streak_on_weight
  AFTER INSERT ON weight_measurements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_streak_on_activity();

DROP TRIGGER IF EXISTS update_streak_on_tracking ON advanced_daily_tracking;
CREATE TRIGGER update_streak_on_tracking
  AFTER INSERT OR UPDATE ON advanced_daily_tracking
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_streak_on_activity();

DROP TRIGGER IF EXISTS update_streak_on_mission ON daily_mission_sessions;
CREATE TRIGGER update_streak_on_mission
  AFTER INSERT OR UPDATE ON daily_mission_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_streak_on_activity();

DROP TRIGGER IF EXISTS update_streak_on_post ON health_feed_posts;
CREATE TRIGGER update_streak_on_post
  AFTER INSERT ON health_feed_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_streak_on_activity();

-- 7. LOG
DO $$
BEGIN
  RAISE NOTICE 'Streak calculation fix applied successfully!';
  RAISE NOTICE 'Triggers created for: food_analysis, weight_measurements, advanced_daily_tracking, daily_mission_sessions, health_feed_posts';
END $$;
