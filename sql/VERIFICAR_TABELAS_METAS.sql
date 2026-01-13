-- =====================================================
-- SCRIPT DE VERIFICAÇÃO: Tabelas de Gamificação de Metas
-- =====================================================

-- 1. VERIFICAR SE AS TABELAS EXISTEM
-- =====================================================

SELECT 
  'user_goal_levels' as tabela,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_goal_levels'
  ) as existe;

SELECT 
  'goal_achievements' as tabela,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'goal_achievements'
  ) as existe;

SELECT 
  'goal_streaks' as tabela,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'goal_streaks'
  ) as existe;

-- 2. VERIFICAR COLUNAS ADICIONADAS EM user_goals
-- =====================================================

SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_goals'
  AND column_name IN ('streak_days', 'last_update_date', 'xp_earned', 'level', 'evidence_urls', 'participant_ids')
ORDER BY column_name;

-- 3. VERIFICAR POLICIES RLS
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('user_goal_levels', 'goal_achievements', 'goal_streaks')
ORDER BY tablename, policyname;

-- 4. VERIFICAR FUNÇÕES CRIADAS
-- =====================================================

SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_goal_streak', 'calculate_xp_to_next_level', 'process_level_up')
ORDER BY routine_name;

-- 5. VERIFICAR TRIGGERS
-- =====================================================

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('trigger_update_goal_streak', 'update_goal_streaks_updated_at', 'update_user_goal_levels_updated_at')
ORDER BY trigger_name;

-- 6. CONTAR REGISTROS (se as tabelas existirem)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_goal_levels') THEN
    RAISE NOTICE 'Registros em user_goal_levels: %', (SELECT COUNT(*) FROM public.user_goal_levels);
  ELSE
    RAISE NOTICE 'Tabela user_goal_levels NÃO EXISTE!';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'goal_achievements') THEN
    RAISE NOTICE 'Registros em goal_achievements: %', (SELECT COUNT(*) FROM public.goal_achievements);
  ELSE
    RAISE NOTICE 'Tabela goal_achievements NÃO EXISTE!';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'goal_streaks') THEN
    RAISE NOTICE 'Registros em goal_streaks: %', (SELECT COUNT(*) FROM public.goal_streaks);
  ELSE
    RAISE NOTICE 'Tabela goal_streaks NÃO EXISTE!';
  END IF;
END $$;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

-- Se tudo estiver correto, você deve ver:
-- ✅ 3 tabelas existem (user_goal_levels, goal_achievements, goal_streaks)
-- ✅ 6 colunas novas em user_goals
-- ✅ 6 policies RLS
-- ✅ 3 funções criadas
-- ✅ 3 triggers ativos
