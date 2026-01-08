
-- FASE 1: Sistema Nutricional Integrado (Parte 1 - Base de Alimentos)

-- 1. Popular nutrition_foods a partir de taco_foods (limitando sodium)
INSERT INTO nutrition_foods (id, name, category, calories_per_100g, proteins_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g, sodium_per_100g, is_verified, created_at)
SELECT 
  gen_random_uuid(),
  tf.food_name,
  tf.category,
  COALESCE(tf.energy_kcal, 0)::integer,
  LEAST(COALESCE(tf.protein_g, 0), 99.99),
  LEAST(COALESCE(tf.carbohydrate_g, 0), 99.99),
  LEAST(COALESCE(tf.lipids_g, 0), 99.99),
  LEAST(COALESCE(tf.fiber_g, 0), 99.99),
  LEAST(COALESCE(tf.sodium_mg, 0), 999.99),
  true,
  NOW()
FROM taco_foods tf
WHERE NOT EXISTS (
  SELECT 1 FROM nutrition_foods nf WHERE LOWER(nf.name) = LOWER(tf.food_name)
)
ON CONFLICT DO NOTHING;

-- 2. Popular alimentos_completos também
INSERT INTO alimentos_completos (id, nome, categoria, peso_medio_g, unidade_padrao, is_verified, created_at)
SELECT 
  gen_random_uuid(),
  tf.food_name,
  tf.category,
  100,
  'g',
  true,
  NOW()
FROM taco_foods tf
WHERE NOT EXISTS (
  SELECT 1 FROM alimentos_completos ac WHERE LOWER(ac.nome) = LOWER(tf.food_name)
)
ON CONFLICT DO NOTHING;

-- 3. Criar desafios nutricionais iniciais
INSERT INTO challenges (id, title, description, challenge_type, duration_days, xp_reward, points_reward, is_active, difficulty, icon, color, created_at)
VALUES 
  (gen_random_uuid(), 'Desafio 7 Dias de Água', 'Beba pelo menos 2 litros de água por dia durante 7 dias consecutivos', 'hydration', 7, 100, 50, true, 'facil', 'Droplets', '#3B82F6', NOW()),
  (gen_random_uuid(), 'Desafio da Caminhada Diária', 'Caminhe pelo menos 30 minutos por dia durante 5 dias', 'exercise', 5, 75, 40, true, 'facil', 'Footprints', '#22C55E', NOW()),
  (gen_random_uuid(), 'Desafio do Sono Reparador', 'Durma pelo menos 7 horas por noite durante 7 dias', 'sleep', 7, 100, 50, true, 'medio', 'Moon', '#8B5CF6', NOW()),
  (gen_random_uuid(), 'Desafio Alimentação Consciente', 'Registre todas as suas refeições por 5 dias consecutivos', 'nutrition', 5, 80, 45, true, 'facil', 'Utensils', '#F59E0B', NOW()),
  (gen_random_uuid(), 'Desafio da Meditação', 'Medite por pelo menos 10 minutos durante 7 dias', 'mindfulness', 7, 90, 45, true, 'medio', 'Brain', '#EC4899', NOW()),
  (gen_random_uuid(), 'Desafio Proteína em Dia', 'Atinja sua meta de proteína diária por 5 dias seguidos', 'nutrition', 5, 120, 60, true, 'medio', 'Beef', '#EF4444', NOW()),
  (gen_random_uuid(), 'Desafio Fibras Saudáveis', 'Consuma pelo menos 25g de fibras por dia durante 7 dias', 'nutrition', 7, 110, 55, true, 'medio', 'Wheat', '#84CC16', NOW())
ON CONFLICT DO NOTHING;

-- 4. Verificar dados populados
SELECT 
  'nutrition_foods' as tabela, 
  COUNT(*) as registros 
FROM nutrition_foods
UNION ALL
SELECT 
  'alimentos_completos' as tabela, 
  COUNT(*) as registros 
FROM alimentos_completos
UNION ALL
SELECT 
  'challenges' as tabela, 
  COUNT(*) as registros 
FROM challenges;
