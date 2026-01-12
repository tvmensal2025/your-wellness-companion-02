-- =============================================
-- ANÁLISE DOS DADOS DA COMUNIDADE
-- Executar no Supabase SQL Editor para diagnóstico
-- =============================================

-- 1. VERIFICAR DADOS DO USUÁRIO RAFAEL (ou qualquer usuário)
SELECT 
  up.user_id,
  p.full_name,
  up.total_points,
  up.current_streak,
  up.best_streak,
  up.missions_completed,
  up.completed_challenges,
  up.level,
  up.last_activity_date,
  up.updated_at
FROM user_points up
JOIN profiles p ON p.user_id = up.user_id
WHERE p.full_name ILIKE '%rafael%'
ORDER BY up.total_points DESC;

-- 2. VERIFICAR TOP 10 DO RANKING
SELECT 
  ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as posicao,
  p.full_name as nome,
  up.total_points as pontos,
  up.current_streak as streak,
  up.missions_completed as missoes,
  up.last_activity_date as ultima_atividade
FROM user_points up
JOIN profiles p ON p.user_id = up.user_id
WHERE up.total_points > 0
ORDER BY up.total_points DESC
LIMIT 10;

-- 3. VERIFICAR SE STREAK ESTÁ CORRETO
-- O streak deveria ser > 0 se last_activity_date é hoje ou ontem
SELECT 
  p.full_name,
  up.current_streak,
  up.last_activity_date,
  CURRENT_DATE as hoje,
  CASE 
    WHEN up.last_activity_date = CURRENT_DATE THEN 'Ativo hoje'
    WHEN up.last_activity_date = CURRENT_DATE - 1 THEN 'Ativo ontem'
    WHEN up.last_activity_date >= CURRENT_DATE - 7 THEN 'Ativo esta semana'
    ELSE 'Inativo há mais de 7 dias'
  END as status_atividade,
  CASE 
    WHEN up.current_streak = 0 AND up.last_activity_date >= CURRENT_DATE - 1 
    THEN '⚠️ STREAK DEVERIA SER > 0'
    ELSE '✅ OK'
  END as diagnostico
FROM user_points up
JOIN profiles p ON p.user_id = up.user_id
WHERE up.total_points > 0
ORDER BY up.total_points DESC
LIMIT 20;

-- 4. VERIFICAR SEGUIDORES DO USUÁRIO
SELECT 
  p.full_name as usuario,
  (SELECT COUNT(*) FROM user_follows WHERE following_id = p.user_id) as seguidores,
  (SELECT COUNT(*) FROM user_follows WHERE follower_id = p.user_id) as seguindo
FROM profiles p
WHERE p.full_name ILIKE '%rafael%';

-- 5. VERIFICAR MISSÕES COMPLETADAS
SELECT 
  p.full_name,
  COUNT(DISTINCT dms.id) as sessoes_missoes,
  up.missions_completed as missoes_registradas
FROM profiles p
LEFT JOIN daily_mission_sessions dms ON dms.user_id = p.user_id AND dms.completed = true
LEFT JOIN user_points up ON up.user_id = p.user_id
WHERE p.full_name ILIKE '%rafael%'
GROUP BY p.full_name, up.missions_completed;

-- =============================================
-- CORREÇÕES (executar se necessário)
-- =============================================

-- CORRIGIR STREAK ZERADO PARA USUÁRIOS ATIVOS
-- UPDATE user_points
-- SET current_streak = 1
-- WHERE current_streak = 0 
--   AND last_activity_date >= CURRENT_DATE - 1;

-- SINCRONIZAR MISSÕES COMPLETADAS
-- UPDATE user_points up
-- SET missions_completed = (
--   SELECT COUNT(*) 
--   FROM daily_mission_sessions dms 
--   WHERE dms.user_id = up.user_id AND dms.completed = true
-- );
