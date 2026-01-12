-- ═══════════════════════════════════════════════════════════════════════════
-- 🚀 OTIMIZAÇÃO DE ÍNDICES PARA ESCALABILIDADE
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- Esta migração adiciona índices otimizados para suportar bilhões de usuários.
-- Usa CONCURRENTLY para não bloquear operações durante criação.
--
-- Criado em: 2026-01-11
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 🏆 ÍNDICES PARA RANKING
-- ═══════════════════════════════════════════════════════════════════════════

-- Índice principal para ranking por pontos (DESC para top users)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_points_ranking 
  ON user_points(total_points DESC, user_id);

-- Índice para busca por user_id (já deve existir, mas garantir)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_points_user_id 
  ON user_points(user_id);

-- Índice composto para ranking com streak
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_points_ranking_full 
  ON user_points(total_points DESC, current_streak DESC, user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 📱 ÍNDICES PARA FEED
-- ═══════════════════════════════════════════════════════════════════════════

-- Índice para timeline do feed (posts públicos ordenados por data)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feed_posts_timeline 
  ON health_feed_posts(created_at DESC, user_id) 
  WHERE visibility = 'public';

-- Índice para posts de um usuário específico
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feed_posts_user 
  ON health_feed_posts(user_id, created_at DESC);

-- Índice para busca de likes por post
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feed_likes_post 
  ON health_feed_likes(post_id, user_id);

-- Índice para verificar se usuário curtiu
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feed_likes_user_post 
  ON health_feed_likes(user_id, post_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 👥 ÍNDICES PARA FOLLOWS
-- ═══════════════════════════════════════════════════════════════════════════

-- Índice para buscar seguidores de um usuário
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_following 
  ON health_feed_follows(following_id, follower_id);

-- Índice para buscar quem um usuário segue
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_follower 
  ON health_feed_follows(follower_id, following_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 👤 ÍNDICES PARA PROFILES
-- ═══════════════════════════════════════════════════════════════════════════

-- Índice para busca por user_id (principal)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id 
  ON profiles(user_id);

-- Índice para busca por email
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email 
  ON profiles(email) WHERE email IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 📊 ÍNDICES PARA TRACKING
-- ═══════════════════════════════════════════════════════════════════════════

-- Índice para buscar tracking por usuário e data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_tracking_user_date 
  ON advanced_daily_tracking(user_id, tracking_date DESC);

-- Índice para food_analysis por usuário e data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_analysis_user_date 
  ON food_analysis(user_id, created_at DESC);

-- Índice para weight_measurements por usuário e data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weight_user_date 
  ON weight_measurements(user_id, measurement_date DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 🎯 ÍNDICES PARA DESAFIOS
-- ═══════════════════════════════════════════════════════════════════════════

-- Índice para desafios ativos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenges_active 
  ON challenges(is_active, created_at DESC) WHERE is_active = true;

-- Índice para participações por usuário
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participation_user 
  ON challenge_participations(user_id, challenge_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 📋 ÍNDICES PARA SESSÕES
-- ═══════════════════════════════════════════════════════════════════════════

-- Índice para sessões do usuário
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user 
  ON user_sessions(user_id, status, assigned_at DESC);

-- Índice para sessões por status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_status 
  ON user_sessions(status, user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 🔧 FUNÇÕES AUXILIARES PARA CONTADORES
-- ═══════════════════════════════════════════════════════════════════════════

-- Função para incrementar likes_count
CREATE OR REPLACE FUNCTION increment_likes_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE health_feed_posts 
  SET likes_count = COALESCE(likes_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar likes_count
CREATE OR REPLACE FUNCTION decrement_likes_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE health_feed_posts 
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar missions_completed
CREATE OR REPLACE FUNCTION increment_missions_completed(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_points 
  SET missions_completed = COALESCE(missions_completed, 0) + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Se não existir, criar registro
  IF NOT FOUND THEN
    INSERT INTO user_points (user_id, missions_completed, total_points, level)
    VALUES (p_user_id, 1, 0, 1)
    ON CONFLICT (user_id) DO UPDATE 
    SET missions_completed = COALESCE(user_points.missions_completed, 0) + 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- 📊 MATERIALIZED VIEW PARA RANKING TOP 1000
-- ═══════════════════════════════════════════════════════════════════════════

-- Criar materialized view para ranking (atualiza periodicamente)
DROP MATERIALIZED VIEW IF EXISTS mv_ranking_top_1000;

CREATE MATERIALIZED VIEW mv_ranking_top_1000 AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as position,
  up.user_id,
  p.full_name as user_name,
  p.avatar_url,
  up.total_points,
  up.current_streak as streak_days,
  up.missions_completed,
  up.completed_challenges,
  up.level,
  up.last_activity_date as last_activity
FROM user_points up
LEFT JOIN profiles p ON p.user_id = up.user_id
WHERE up.total_points > 0
ORDER BY up.total_points DESC
LIMIT 1000;

-- Índice na materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_ranking_position 
  ON mv_ranking_top_1000(position);

CREATE INDEX IF NOT EXISTS idx_mv_ranking_user 
  ON mv_ranking_top_1000(user_id);

-- Função para refresh da view
CREATE OR REPLACE FUNCTION refresh_ranking_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ranking_top_1000;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- 📈 ESTATÍSTICAS
-- ═══════════════════════════════════════════════════════════════════════════

-- Atualizar estatísticas das tabelas principais
ANALYZE user_points;
ANALYZE profiles;
ANALYZE health_feed_posts;
ANALYZE health_feed_likes;
ANALYZE health_feed_follows;

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ COMENTÁRIOS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON INDEX idx_user_points_ranking IS 'Índice otimizado para ranking por pontos';
COMMENT ON INDEX idx_feed_posts_timeline IS 'Índice para timeline do feed público';
COMMENT ON MATERIALIZED VIEW mv_ranking_top_1000 IS 'Cache do top 1000 ranking - refresh a cada 5 min';
COMMENT ON FUNCTION refresh_ranking_view IS 'Atualiza o cache do ranking - chamar via cron';
