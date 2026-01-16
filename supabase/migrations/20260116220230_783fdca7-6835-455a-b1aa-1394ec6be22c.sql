
-- =====================================================
-- FASE 1: LIMPEZA DO BANCO DE DADOS (CORRIGIDA)
-- Remove tabelas vazias e cria índices
-- Data: 2026-01-16
-- =====================================================

-- ETAPA 1: Remover tabelas vazias restantes
DROP TABLE IF EXISTS weighings CASCADE;
DROP TABLE IF EXISTS preventive_health_analyses CASCADE;
DROP TABLE IF EXISTS health_integrations CASCADE;
DROP TABLE IF EXISTS session_templates CASCADE;
DROP TABLE IF EXISTS information_feedback CASCADE;
DROP TABLE IF EXISTS nutritional_goals CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS protocol_supplements CASCADE;
DROP TABLE IF EXISTS heart_rate_data CASCADE;
DROP TABLE IF EXISTS team_battles CASCADE;
DROP TABLE IF EXISTS sofia_learning CASCADE;
DROP TABLE IF EXISTS subscription_invoices CASCADE;
DROP TABLE IF EXISTS professional_evaluations CASCADE;
DROP TABLE IF EXISTS user_purchases CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS saboteur_assessments CASCADE;
DROP TABLE IF EXISTS workout_plans CASCADE;
DROP TABLE IF EXISTS sofia_comprehensive_analyses CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS user_goal_invites CASCADE;
DROP TABLE IF EXISTS recipe_items CASCADE;
DROP TABLE IF EXISTS whatsapp_message_queue CASCADE;
DROP TABLE IF EXISTS weekly_goal_progress CASCADE;
DROP TABLE IF EXISTS layout_config CASCADE;
DROP TABLE IF EXISTS smart_notifications CASCADE;
DROP TABLE IF EXISTS social_context_tracking CASCADE;
DROP TABLE IF EXISTS scheduled_analysis_records CASCADE;
DROP TABLE IF EXISTS xp_config_audit_log CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS user_custom_saboteurs CASCADE;
DROP TABLE IF EXISTS meal_feedback CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS meal_suggestions CASCADE;
DROP TABLE IF EXISTS sofia_memory CASCADE;
DROP TABLE IF EXISTS weekly_analyses CASCADE;
DROP TABLE IF EXISTS pregnancy_nutrition CASCADE;
DROP TABLE IF EXISTS pending_nutritional_aliases CASCADE;
DROP TABLE IF EXISTS wheel_of_life CASCADE;
DROP TABLE IF EXISTS nutritional_yields CASCADE;
DROP TABLE IF EXISTS whatsapp_message_logs CASCADE;
DROP TABLE IF EXISTS specific_health CASCADE;
DROP TABLE IF EXISTS "notificações_enviadas" CASCADE;
DROP TABLE IF EXISTS sports_challenge_participations CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS premium_medical_reports CASCADE;
DROP TABLE IF EXISTS user_favorite_foods CASCADE;
DROP TABLE IF EXISTS saboteur_results CASCADE;
DROP TABLE IF EXISTS user_blocks CASCADE;
DROP TABLE IF EXISTS user_anamnesis_history CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS sofia_knowledge_base CASCADE;
DROP TABLE IF EXISTS payment_records CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS "lições" CASCADE;
DROP TABLE IF EXISTS user_gamification CASCADE;
DROP TABLE IF EXISTS sports_training_plans CASCADE;
DROP TABLE IF EXISTS weekly_insights CASCADE;
DROP TABLE IF EXISTS powerup_usage_log CASCADE;
DROP TABLE IF EXISTS meal_plan_items CASCADE;
DROP TABLE IF EXISTS vps_api_logs CASCADE;
DROP TABLE IF EXISTS sofia_messages CASCADE;
DROP TABLE IF EXISTS user_missions CASCADE;
DROP TABLE IF EXISTS user_assessments CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS therapeutic_recipes CASCADE;
DROP TABLE IF EXISTS premium_report_events CASCADE;
DROP TABLE IF EXISTS sent_notifications CASCADE;
DROP TABLE IF EXISTS "sugestões_nutracêuticas_do_usuário" CASCADE;
DROP TABLE IF EXISTS users_needing_analysis CASCADE;
DROP TABLE IF EXISTS water_tracking CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;
DROP TABLE IF EXISTS whatsapp_scheduled_messages CASCADE;
DROP TABLE IF EXISTS nutritional_protocols CASCADE;
DROP TABLE IF EXISTS institute_nutritional_catalog CASCADE;

-- ETAPA 2: Criar índices para performance em tabelas ativas
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_food_history_user_id_date ON food_history(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_id ON challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_health_feed_posts_user_id ON health_feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_updates_goal_id ON goal_updates(goal_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_responses_user_id ON daily_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_tracking_user_id ON exercise_tracking(user_id);

-- Comentário de auditoria
COMMENT ON SCHEMA public IS 'MaxNutrition Schema - Cleaned 2026-01-16. Removed 80+ empty tables.';
