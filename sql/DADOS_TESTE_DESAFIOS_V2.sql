-- =====================================================
-- DADOS DE TESTE - SISTEMA DE DESAFIOS V2
-- =====================================================
-- Execute este script APÓS a migração principal
-- Substitua 'SEU_USER_ID' pelo seu ID real de usuário
-- =====================================================

-- 🔧 CONFIGURAÇÃO: Coloque seu user_id aqui
-- Para encontrar seu ID, execute: SELECT id FROM auth.users WHERE email = 'seu@email.com';
DO $$
DECLARE
  v_current_user_id UUID;
  v_fake_user_1 UUID;
  v_fake_user_2 UUID;
  v_fake_user_3 UUID;
  v_team_id UUID;
  v_flash_id UUID;
  v_event_id UUID;
  v_duel_id UUID;
  v_week_start DATE := date_trunc('week', CURRENT_DATE)::date;
BEGIN
  -- Pegar o primeiro usuário existente como "usuário atual"
  SELECT id INTO v_current_user_id FROM auth.users LIMIT 1;
  
  IF v_current_user_id IS NULL THEN
    RAISE NOTICE 'Nenhum usuário encontrado. Crie um usuário primeiro.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Usando usuário: %', v_current_user_id;

  -- Criar usuários fake para testes (se não existirem na tabela profiles)
  -- Nota: Não podemos criar em auth.users, então usamos IDs fictícios
  v_fake_user_1 := gen_random_uuid();
  v_fake_user_2 := gen_random_uuid();
  v_fake_user_3 := gen_random_uuid();

  -- =====================================================
  -- 1. FLASH CHALLENGES (Desafios Relâmpago)
  -- =====================================================
  INSERT INTO flash_challenges (
    id, title, description, emoji, challenge_type, 
    target_value, unit, xp_reward, bonus_multiplier,
    duration_hours, starts_at, ends_at, is_active
  ) VALUES 
  (
    gen_random_uuid(),
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
    gen_random_uuid(),
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
  )
  ON CONFLICT DO NOTHING;

  -- Pegar ID do primeiro flash challenge
  SELECT id INTO v_flash_id FROM flash_challenges WHERE is_active = true LIMIT 1;

  -- =====================================================
  -- 2. SEASONAL EVENTS (Eventos Sazonais)
  -- =====================================================
  INSERT INTO seasonal_events (
    id, name, description, theme, emoji,
    primary_color, secondary_color,
    starts_at, ends_at, 
    exclusive_rewards, total_challenges, is_active
  ) VALUES 
  (
    gen_random_uuid(),
    '🏖️ Verão Fitness 2026',
    'Prepare-se para o verão com desafios especiais!',
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
  )
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_event_id FROM seasonal_events WHERE is_active = true LIMIT 1;

  -- =====================================================
  -- 3. USER LEAGUES (Ligas dos Usuários)
  -- =====================================================
  -- Liga do usuário atual
  INSERT INTO user_leagues (
    user_id, current_league, weekly_xp, rank_position,
    highest_league, weeks_in_current_league, week_start
  ) VALUES 
  (
    v_current_user_id,
    'bronze',
    350,
    5,
    'bronze',
    1,
    v_week_start
  )
  ON CONFLICT (user_id, week_start) DO UPDATE SET
    weekly_xp = 350,
    rank_position = 5;

  -- =====================================================
  -- 4. CHALLENGE TEAMS (Times)
  -- =====================================================
  INSERT INTO challenge_teams (
    id, name, description, avatar_emoji, color,
    leader_id, max_members, is_public, invite_code,
    total_xp, challenges_completed, current_rank
  ) VALUES 
  (
    gen_random_uuid(),
    'Equipe Fênix',
    'Renascemos mais fortes a cada desafio!',
    '🔥',
    '#EF4444',
    v_current_user_id,
    10,
    true,
    'FENIX2026',
    1500,
    3,
    1
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_team_id;

  -- Se não retornou (já existia), buscar
  IF v_team_id IS NULL THEN
    SELECT id INTO v_team_id FROM challenge_teams WHERE leader_id = v_current_user_id LIMIT 1;
  END IF;

  -- Adicionar usuário atual como membro do time
  IF v_team_id IS NOT NULL THEN
    INSERT INTO challenge_team_members (team_id, user_id, role, contribution_xp)
    VALUES (v_team_id, v_current_user_id, 'leader', 500)
    ON CONFLICT (team_id, user_id) DO NOTHING;

    -- Criar desafio de time
    INSERT INTO team_challenges (
      team_id, title, description, challenge_type,
      target_value, current_progress, unit,
      total_xp_reward, starts_at, ends_at
    ) VALUES 
    (
      v_team_id,
      'Meta Coletiva: 50km',
      'Juntos vamos percorrer 50km esta semana!',
      'passos',
      50000,
      23500,
      'passos',
      500,
      NOW(),
      NOW() + INTERVAL '7 days'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- =====================================================
  -- 5. USER POWERUPS (Power-ups do Usuário)
  -- =====================================================
  INSERT INTO user_powerups (user_id, powerup_type, quantity)
  VALUES 
    (v_current_user_id, 'shield', 2),
    (v_current_user_id, 'xp_boost', 1),
    (v_current_user_id, 'time_extend', 3),
    (v_current_user_id, 'combo_freeze', 1)
  ON CONFLICT (user_id, powerup_type) DO UPDATE SET
    quantity = EXCLUDED.quantity;

  -- =====================================================
  -- 6. USER ACHIEVEMENTS V2 (Conquistas)
  -- =====================================================
  INSERT INTO user_achievements_v2 (
    user_id, achievement_type, title, description, icon, xp_earned, achieved_at
  ) VALUES 
  (
    v_current_user_id,
    'streak_7',
    'Streak de 7 dias!',
    'Completou 7 dias consecutivos de hidratação',
    '🔥',
    100,
    NOW() - INTERVAL '1 day'
  ),
  (
    v_current_user_id,
    'first_challenge',
    'Primeiro Desafio!',
    'Completou seu primeiro desafio',
    '🎯',
    50,
    NOW() - INTERVAL '3 days'
  ),
  (
    v_current_user_id,
    'early_bird',
    'Madrugador',
    'Completou um desafio antes das 7h',
    '🌅',
    75,
    NOW() - INTERVAL '5 days'
  )
  ON CONFLICT (user_id, achievement_type) DO NOTHING;

  -- =====================================================
  -- 7. ATUALIZAR DESAFIOS EXISTENTES COM CAMPOS V2
  -- =====================================================
  UPDATE challenges SET
    challenge_mode = 'individual',
    combo_enabled = true,
    max_combo_multiplier = 3.0
  WHERE challenge_mode IS NULL;

  -- =====================================================
  -- 8. ATUALIZAR PARTICIPAÇÕES COM CAMPOS V2
  -- =====================================================
  UPDATE challenge_participations SET
    combo_multiplier = 1.0 + (RANDOM() * 0.5),
    combo_days = FLOOR(RANDOM() * 5)::int
  WHERE combo_multiplier IS NULL OR combo_multiplier = 0;

  -- =====================================================
  -- RESUMO
  -- =====================================================
  RAISE NOTICE '✅ Dados de teste criados com sucesso!';
  RAISE NOTICE '📊 Flash Challenges: 2';
  RAISE NOTICE '🎉 Eventos Sazonais: 1';
  RAISE NOTICE '🏆 Liga configurada: Bronze (350 XP)';
  RAISE NOTICE '👥 Time criado: Equipe Fênix';
  RAISE NOTICE '🎒 Power-ups: 7 total';
  RAISE NOTICE '🏅 Conquistas: 3';

END $$;

-- =====================================================
-- VERIFICAÇÃO DOS DADOS
-- =====================================================
SELECT 'Flash Challenges' as tabela, COUNT(*) as total FROM flash_challenges WHERE is_active = true
UNION ALL
SELECT 'Eventos Sazonais', COUNT(*) FROM seasonal_events WHERE is_active = true
UNION ALL
SELECT 'User Leagues', COUNT(*) FROM user_leagues
UNION ALL
SELECT 'Times', COUNT(*) FROM challenge_teams
UNION ALL
SELECT 'Power-ups', COUNT(*) FROM user_powerups
UNION ALL
SELECT 'Conquistas V2', COUNT(*) FROM user_achievements_v2;
