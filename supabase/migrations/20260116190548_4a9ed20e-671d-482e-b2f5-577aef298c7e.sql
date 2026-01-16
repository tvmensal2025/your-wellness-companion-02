-- DADOS FICTÍCIOS SIMPLIFICADOS

-- 1. USER POINTS (dados de teste)
INSERT INTO user_points (user_id, total_points, daily_points, current_streak, best_streak, level, missions_completed, completed_challenges, last_activity_date)
SELECT p.user_id, 
  (random() * 3000)::int as total_points,
  (random() * 100)::int as daily_points,
  (random() * 30)::int as current_streak,
  (random() * 60)::int as best_streak,
  (1 + random() * 10)::int as level,
  (random() * 50)::int as missions_completed,
  (random() * 20)::int as completed_challenges,
  CURRENT_DATE
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM user_points up WHERE up.user_id = p.user_id)
LIMIT 20
ON CONFLICT (user_id) DO NOTHING;

-- 2. DESAFIOS (10 novos)
INSERT INTO challenges (title, description, challenge_type, difficulty, duration_days, target_value, target_unit, xp_reward, points_reward, icon, color, is_active, is_featured, created_at)
VALUES 
  ('Hidratação Perfeita', 'Beba 2L de água por dia durante 7 dias', 'hydration', 'easy', 7, 14, 'litros', 100, 50, '💧', '#3b82f6', true, true, NOW()),
  ('Caminhada Diária', '30 minutos de caminhada todos os dias', 'exercise', 'medium', 14, 14, 'sessões', 200, 100, '🚶', '#22c55e', true, true, NOW()),
  ('Proteína em Dia', 'Atinja sua meta de proteína por 10 dias', 'nutrition', 'medium', 10, 10, 'dias', 150, 75, '🥩', '#ef4444', true, false, NOW()),
  ('Sono Reparador', 'Durma pelo menos 7h por noite', 'sleep', 'easy', 7, 49, 'horas', 120, 60, '😴', '#8b5cf6', true, false, NOW()),
  ('Guerreiro do Treino', 'Complete 20 treinos em 30 dias', 'exercise', 'hard', 30, 20, 'treinos', 500, 250, '🏋️', '#f59e0b', true, true, NOW())
ON CONFLICT DO NOTHING;

-- 3. EXERCISE TRACKING (registros de exercício)
INSERT INTO exercise_tracking (user_id, date, exercise_type, duration_minutes, calories_burned, steps, notes, created_at)
SELECT p.user_id,
  CURRENT_DATE - ((random() * 30)::int || ' days')::interval,
  (ARRAY['running', 'walking', 'strength', 'yoga', 'cycling'])[1 + (random() * 4)::int],
  (20 + random() * 60)::int,
  (100 + random() * 500)::int,
  (1000 + random() * 10000)::int,
  'Treino registrado',
  NOW() - ((random() * 30)::int || ' days')::interval
FROM profiles p
LIMIT 20
ON CONFLICT DO NOTHING;

-- 4. ATUALIZAR DADOS DA EMPRESA
INSERT INTO company_data (company_name, contact_email, contact_phone, address, website, primary_color, secondary_color)
SELECT 'Wellness Companion', 'contato@wellnesscompanion.com.br', '(11) 99999-0000', 'Av. Paulista, 1000 - São Paulo/SP', 'https://wellnesscompanion.com.br', '#10b981', '#6366f1'
WHERE NOT EXISTS (SELECT 1 FROM company_data LIMIT 1);

UPDATE company_data SET
  company_name = 'Wellness Companion',
  contact_email = 'contato@wellnesscompanion.com.br',
  contact_phone = '(11) 99999-0000',
  primary_color = '#10b981',
  secondary_color = '#6366f1',
  updated_at = NOW();