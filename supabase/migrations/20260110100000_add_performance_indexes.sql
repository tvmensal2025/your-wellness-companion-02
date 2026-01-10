-- =====================================================
-- MIGRAÇÃO DE PERFORMANCE: Índices Otimizados
-- Data: 2026-01-10
-- Objetivo: Melhorar performance de queries frequentes
-- SEGURO: Apenas adiciona índices, não altera dados
-- =====================================================

-- Índices para tabela profiles (mais acessada)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Índices para weight_measurements (queries por data)
CREATE INDEX IF NOT EXISTS idx_weight_measurements_user_date 
ON public.weight_measurements(user_id, measurement_date DESC);

-- Índices para advanced_daily_tracking (tracking diário)
CREATE INDEX IF NOT EXISTS idx_daily_tracking_user_date 
ON public.advanced_daily_tracking(user_id, tracking_date DESC);

-- Índices para food_history (histórico alimentar)
CREATE INDEX IF NOT EXISTS idx_food_history_user_date 
ON public.food_history(user_id, meal_date DESC);

-- Índices para challenges e participações
CREATE INDEX IF NOT EXISTS idx_challenges_active 
ON public.challenges(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_challenge_participations_user 
ON public.challenge_participations(user_id, challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_participations_status 
ON public.challenge_participations(status) WHERE status = 'active';

-- Índices para user_goals (metas)
CREATE INDEX IF NOT EXISTS idx_user_goals_user_status 
ON public.user_goals(user_id, status);

-- Índices para chat_conversation_history (histórico de chat)
CREATE INDEX IF NOT EXISTS idx_chat_history_user_session 
ON public.chat_conversation_history(user_id, session_id, created_at DESC);

-- Índices para ai_response_cache (cache de IA)
CREATE INDEX IF NOT EXISTS idx_ai_cache_hash_expires 
ON public.ai_response_cache(query_hash, expires_at);

-- Índices para user_missions (missões diárias)
CREATE INDEX IF NOT EXISTS idx_user_missions_user_date 
ON public.user_missions(user_id, date_assigned DESC);

-- Índices para sofia_food_analysis (análises de comida)
CREATE INDEX IF NOT EXISTS idx_sofia_food_user_date 
ON public.sofia_food_analysis(user_id, created_at DESC);

-- Índices para user_anamnesis (anamnese - dados sensíveis)
CREATE INDEX IF NOT EXISTS idx_user_anamnesis_user 
ON public.user_anamnesis(user_id);

-- Índices para courses e lessons
CREATE INDEX IF NOT EXISTS idx_course_lessons_module 
ON public.course_lessons(module_id, order_index);

CREATE INDEX IF NOT EXISTS idx_course_modules_course 
ON public.course_modules(course_id, order_index);

-- Índice para taco_foods (busca de alimentos)
CREATE INDEX IF NOT EXISTS idx_taco_foods_name_lower 
ON public.taco_foods(LOWER(food_name));

-- Índices para community/feed
CREATE INDEX IF NOT EXISTS idx_posts_created 
ON public.posts(created_at DESC) WHERE is_published = true;

-- Índice composto para dr_vital_memory
CREATE INDEX IF NOT EXISTS idx_dr_vital_memory_key 
ON public.dr_vital_memory(memory_key);

-- =====================================================
-- ANALYZE para atualizar estatísticas do planner
-- =====================================================
ANALYZE public.profiles;
ANALYZE public.weight_measurements;
ANALYZE public.advanced_daily_tracking;
ANALYZE public.food_history;
ANALYZE public.challenges;
ANALYZE public.challenge_participations;
ANALYZE public.user_goals;
ANALYZE public.chat_conversation_history;
ANALYZE public.ai_response_cache;
ANALYZE public.user_missions;
ANALYZE public.sofia_food_analysis;

-- =====================================================
-- Comentário de conclusão
-- =====================================================
COMMENT ON INDEX idx_profiles_user_id IS 'Índice de performance para busca de perfil por user_id';
