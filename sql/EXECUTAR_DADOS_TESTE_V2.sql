-- =====================================================
-- 🚀 DADOS DE TESTE - SISTEMA DE DESAFIOS V2
-- =====================================================
-- INSTRUÇÕES:
-- 1. Execute a migração principal primeiro (20260111200000_challenges_system_v2.sql)
-- 2. Depois execute este script no Supabase SQL Editor
-- =====================================================

-- 1. FLASH CHALLENGES (Desafios Relâmpago)
INSERT INTO flash_challenges (
  title, description, emoji, challenge_type, 
  target_value, unit, xp_reward, bonus_multiplier,
  duration_hours, starts_at, ends_at, is_active
) VALUES 
(
  '⚡ Hidratação Express',
  'Beba 2 litros de água nas próximas 4 horas!',
  '💧',
  'hidratacao',
  2000,
  'ml',
  150,
  1.5,
  4,
  NOW(),
  NOW() + INTERVAL '4 hours',
  true
),
(
  '🏃 Sprint de Passos',
  'Dê 5.000 passos em 2 horas!',
  '👟',
  'passos',
  5000,
  'passos',
  200,
  2.0,
  2,
  NOW(),
  NOW() + INTERVAL '2 hours',
  true
),
(
  '💪 Treino Relâmpago',
  '30 minutos de exercício intenso!',
  '🔥',
  'exercicio',
  30,
  'min',
  180,
  1.75,
  3,
  NOW(),
  NOW() + INTERVAL '3 hours',
  true
)
ON CONFLICT DO NOTHING;

-- 2. SEASONAL EVENTS (Eventos Sazonais)
INSERT INTO seasonal_events (
  name, description, theme, emoji,
  primary_color, secondary_color,
  starts_at, ends_at, 
  exclusive_rewards, total_challenges, is_active
) VALUES 
(
  '🏖️ Verão Fitness 2026',
  'Prepare-se para o verão com desafios especiais! Complete todos para ganhar recompensas exclusivas.',
  'summer',
  '☀️',
  '#F97316',
  '#FBBF24',
  NOW(),
  NOW() + INTERVAL '30 days',
  '[
    {"type": "badge", "name": "Corpo de Verão", "icon": "🏖️"},
    {"type": "xp", "name": "Bônus Verão", "value": 500},
    {"type": "title", "name": "Atleta do Verão"}
  ]'::jsonb,
  7,
  true
),
(
  '🎯 Desafio Janeiro',
  'Comece o ano com tudo! Metas especiais para janeiro.',
  'newyear',
  '🎆',
  '#8B5CF6',
  '#EC4899',
  NOW(),
  NOW() + INTERVAL '20 days',
  '[
    {"type": "badge", "name": "Ano Novo, Vida Nova", "icon": "🎯"},
    {"type": "xp", "name": "Bônus Ano Novo", "value": 300}
  ]'::jsonb,
  5,
  true
)
ON CONFLICT DO NOTHING;

-- 3. USER LEAGUES (Ligas) - Para todos os usuários existentes
INSERT INTO user_leagues (user_id, current_league, weekly_xp, rank_position, highest_league, weeks_in_current_league, week_start)
SELECT 
  id,
  CASE 
    WHEN RANDOM() < 0.5 THEN 'bronze'
    WHEN RANDOM() < 0.8 THEN 'silver'
    ELSE 'gold'
  END::league_tier,
  FLOOR(RANDOM() * 500)::int,
  ROW_NUMBER() OVER (ORDER BY RANDOM()),
  'bronze'::league_tier,
  1,
  date_trunc('week', CURRENT_DATE)::date
FROM auth.users
ON CONFLICT (user_id, week_start) DO UPDATE SET
  weekly_xp = EXCLUDED.weekly_xp,
  rank_position = EXCLUDED.rank_position;

-- 4. POWER-UPS para todos os usuários
INSERT INTO user_powerups (user_id, powerup_type, quantity)
SELECT 
  u.id,
  p.powerup_type,
  FLOOR(RANDOM() * 3 + 1)::int
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('shield'::powerup_type),
    ('xp_boost'::powerup_type),
    ('time_extend'::powerup_type),
    ('combo_freeze'::powerup_type)
) AS p(powerup_type)
ON CONFLICT (user_id, powerup_type) DO UPDATE SET
  quantity = user_powerups.quantity + 1;

-- 5. CONQUISTAS para todos os usuários
INSERT INTO user_achievements_v2 (user_id, achievement_type, title, description, icon, xp_earned, achieved_at)
SELECT 
  id,
  'first_login',
  'Bem-vindo!',
  'Fez login pela primeira vez',
  '👋',
  25,
  NOW() - INTERVAL '7 days'
FROM auth.users
ON CONFLICT (user_id, achievement_type) DO NOTHING;

INSERT INTO user_achievements_v2 (user_id, achievement_type, title, description, icon, xp_earned, achieved_at)
SELECT 
  id,
  'streak_3',
  'Streak de 3 dias!',
  'Completou 3 dias consecutivos',
  '🔥',
  50,
  NOW() - INTERVAL '3 days'
FROM auth.users
ON CONFLICT (user_id, achievement_type) DO NOTHING;

INSERT INTO user_achievements_v2 (user_id, achievement_type, title, description, icon, xp_earned, achieved_at)
SELECT 
  id,
  'first_challenge',
  'Primeiro Desafio!',
  'Completou seu primeiro desafio',
  '🎯',
  75,
  NOW() - INTERVAL '5 days'
FROM auth.users
ON CONFLICT (user_id, achievement_type) DO NOTHING;

-- 6. ATUALIZAR DESAFIOS EXISTENTES com campos V2
UPDATE challenges SET
  challenge_mode = 'individual',
  combo_enabled = true,
  max_combo_multiplier = 3.0
WHERE challenge_mode IS NULL;

-- 7. ATUALIZAR PARTICIPAÇÕES com combo
UPDATE challenge_participations SET
  combo_multiplier = 1.0 + (RANDOM() * 0.75),
  combo_days = FLOOR(RANDOM() * 7)::int
WHERE combo_multiplier IS NULL OR combo_multiplier = 0;

-- 8. CRIAR TIME DE EXEMPLO
DO $$
DECLARE
  v_user_id UUID;
  v_team_id UUID;
BEGIN
  -- Pegar primeiro usuário
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Criar time
    INSERT INTO challenge_teams (
      name, description, avatar_emoji, color,
      leader_id, max_members, is_public, invite_code,
      total_xp, challenges_completed, current_rank
    ) VALUES (
      'Equipe MaxNutrition',
      'Time oficial da comunidade!',
      '💪',
      '#22C55E',
      v_user_id,
      20,
      true,
      'MAXFIT26',
      2500,
      5,
      1
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_team_id;
    
    -- Adicionar líder como membro
    IF v_team_id IS NOT NULL THEN
      INSERT INTO challenge_team_members (team_id, user_id, role, contribution_xp)
      VALUES (v_team_id, v_user_id, 'leader', 800)
      ON CONFLICT (team_id, user_id) DO NOTHING;
      
      -- Criar desafio de time
      INSERT INTO team_challenges (
        team_id, title, description, challenge_type,
        target_value, current_progress, unit,
        total_xp_reward, starts_at, ends_at
      ) VALUES (
        v_team_id,
        'Meta Coletiva: 100km',
        'Juntos vamos percorrer 100km esta semana!',
        'passos',
        100000,
        45000,
        'passos',
        1000,
        NOW(),
        NOW() + INTERVAL '7 days'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- =====================================================
-- ✅ VERIFICAÇÃO DOS DADOS CRIADOS
-- =====================================================
SELECT '✅ DADOS DE TESTE CRIADOS!' as status;

SELECT 
  '📊 Resumo:' as info,
  (SELECT COUNT(*) FROM flash_challenges WHERE is_active = true) as flash_challenges,
  (SELECT COUNT(*) FROM seasonal_events WHERE is_active = true) as eventos,
  (SELECT COUNT(*) FROM user_leagues) as ligas,
  (SELECT COUNT(*) FROM challenge_teams) as times,
  (SELECT COUNT(*) FROM user_powerups) as powerups,
  (SELECT COUNT(*) FROM user_achievements_v2) as conquistas;
