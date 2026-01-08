
-- Criar função de cálculo de metas nutricionais
CREATE OR REPLACE FUNCTION public.calculate_nutrition_goals_from_anamnesis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tmb DECIMAL;
  tdee DECIMAL;
  goal_calories INTEGER;
  is_male BOOLEAN;
  weight_kg DECIMAL;
  v_height DECIMAL;
BEGIN
  weight_kg := COALESCE(NEW.current_weight, NEW.peso_atual, 70);
  v_height := COALESCE(NEW.height_cm, NEW.altura_cm, 170);
  
  IF weight_kg IS NULL OR v_height IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(gender, 'masculino') IN ('masculino', 'male', 'm')
  INTO is_male FROM profiles WHERE user_id = NEW.user_id;
  
  IF is_male THEN
    tmb := 88.362 + (13.397 * weight_kg) + (4.799 * v_height) - (5.677 * 30);
  ELSE
    tmb := 447.593 + (9.247 * weight_kg) + (3.098 * v_height) - (4.330 * 30);
  END IF;
  
  tdee := tmb * 1.375;
  goal_calories := ROUND(tdee);
  
  IF goal_calories < 1200 THEN goal_calories := 1200; END IF;
  
  BEGIN
    INSERT INTO nutritional_goals (id, user_id, goal_type, goal_name, target_calories, target_protein_g, target_carbs_g, target_fats_g, target_fiber_g, target_water_ml, status, start_date, created_at)
    VALUES (gen_random_uuid(), NEW.user_id, 'weight_management', 'Metas da Anamnese', goal_calories, ROUND((goal_calories*0.25)/4), ROUND((goal_calories*0.45)/4), ROUND((goal_calories*0.30)/9), 25, 2000, 'active', CURRENT_DATE, NOW());
  EXCEPTION WHEN unique_violation THEN
    UPDATE nutritional_goals SET target_calories = goal_calories, target_protein_g = ROUND((goal_calories*0.25)/4), target_carbs_g = ROUND((goal_calories*0.45)/4), target_fats_g = ROUND((goal_calories*0.30)/9), updated_at = NOW() WHERE user_id = NEW.user_id;
  END;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_calculate_nutrition_goals ON user_anamnesis;
CREATE TRIGGER trigger_calculate_nutrition_goals
AFTER INSERT OR UPDATE ON user_anamnesis
FOR EACH ROW EXECUTE FUNCTION calculate_nutrition_goals_from_anamnesis();
