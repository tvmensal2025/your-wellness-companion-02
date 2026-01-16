-- ============================================================================
-- 🔧 COMANDOS DE ORGANIZAÇÃO DO BANCO - MaxNutrition
-- ⚠️ EXECUTE COM CUIDADO! FAÇA BACKUP ANTES!
-- ============================================================================

-- ============================================
-- 1️⃣ VERIFICAR TABELAS VAZIAS (seguro remover)
-- ============================================

SELECT relname as tabela, n_live_tup as registros
FROM pg_stat_user_tables
WHERE schemaname = 'public' 
  AND n_live_tup = 0
  AND relname IN (

    'alimentos_completos',
    'base_de_conhecimento_sofia',
    'chat_conversation_history',
    'company_configurations',
    'exercise_challenges',
    'food_history',
    'health_integrations',
    'heart_rate_data',
    'information_feedback',
    'institute_nutritional_catalog',
    'layout_config',
    'lições',
    'meal_feedback',
    'meal_plan_items',
    'meal_plans',
    'meal_suggestions',
    'medical_exam_analyses',
    'medical_pdf_reports',
    'missions',
    'missões_diárias',
    'notification_queue_unified',
    'notificações_enviadas',
    'nutritional_aliases',
    'nutritional_food_patterns',
    'nutritional_protocols',
    'nutritional_recommendations',
    'nutritional_yields',
    'offers',
    'payment_records',
    'pending_nutritional_aliases',
    'pregnancy_nutrition',
    'premium_medical_reports',
    'premium_report_events',
    'productivity_tracking',
    'public_report_links',
    'reações_feed_de_saúde',
    'received_leads',
    'recipe_components',
    'recipe_items',
    'recipe_templates',
    'recipes',
    'saboteur_assessments',
    'saboteur_responses',
    'saboteur_results',
    'saude_especifica',
    'sent_notifications',
    'smart_notifications',
    'social_context_tracking',
    'sofia_comprehensive_analyses',
    'sofia_conversation_context',
    'sofia_knowledge_base',
    'sofia_learning',
    'sofia_memory',
    'sofia_messages',
    'specific_health',
    'sports_challenge_participations',
    'sports_challenges',
    'sports_training_plans',
    'sports_training_records',
    'subscribers',
    'subscription_invoices',
    'sugestões_nutracêuticas_do_usuário',
    'taco_foods',
    'team_challenge_contributions',
    'team_challenges',
    'therapeutic_recipes',
    'user_anamnesis_history',
    'user_assessments',
    'user_challenges',
    'user_custom_saboteurs',
    'user_exercise_feedback',
    'user_exercise_programs',
    'user_favorite_foods',
    'user_goal_invites',
    'user_ingredient_history',
    'user_medical_reports',
    'user_nutraceutical_suggestions',
    'user_progress',
    'user_purchases',
    'user_sports_modalities',
    'user_supplements',
    'users_needing_analysis',
    'valores_nutricionais_completos',
    'weekly_goal_progress',
    'weekly_insights',
    'weighings',
    'weight_measures',
    'whatsapp_message_queue',
    'whatsapp_message_templates',
    'whatsapp_pending_medical',
    'whatsapp_pending_nutrition',
    'whatsapp_rate_limit_tracking',
    'whatsapp_scheduled_messages',
    'whatsapp_webhook_responses',
    'wheel_of_life',
    'workout_plans'
  )
ORDER BY relname;

-- ============================================
-- 2️⃣ MIGRAR DADOS DE DUPLICATAS PT → EN
-- ============================================

-- Migrar alimentos_completos → nutrition_foods
-- PRIMEIRO: Verificar se há dados
SELECT COUNT(*) as registros_pt FROM "alimentos_completos";
SELECT COUNT(*) as registros_en FROM "nutrition_foods";

-- Migrar base_de_conhecimento_sofia → sofia_knowledge_base
-- PRIMEIRO: Verificar se há dados
SELECT COUNT(*) as registros_pt FROM "base_de_conhecimento_sofia";
SELECT COUNT(*) as registros_en FROM "sofia_knowledge_base";

-- Migrar lições → lessons
-- PRIMEIRO: Verificar se há dados
SELECT COUNT(*) as registros_pt FROM "lições";
SELECT COUNT(*) as registros_en FROM "lessons";

-- Migrar missões_diárias → missions
-- PRIMEIRO: Verificar se há dados
SELECT COUNT(*) as registros_pt FROM "missões_diárias";
SELECT COUNT(*) as registros_en FROM "missions";

-- Migrar notificações_enviadas → sent_notifications
-- PRIMEIRO: Verificar se há dados
SELECT COUNT(*) as registros_pt FROM "notificações_enviadas";
SELECT COUNT(*) as registros_en FROM "sent_notifications";

-- Migrar reações_feed_de_saúde → health_feed_reactions
-- PRIMEIRO: Verificar se há dados
SELECT COUNT(*) as registros_pt FROM "reações_feed_de_saúde";
SELECT COUNT(*) as registros_en FROM "health_feed_reactions";

-- Migrar saude_especifica → specific_health
-- PRIMEIRO: Verificar se há dados
SELECT COUNT(*) as registros_pt FROM "saude_especifica";
SELECT COUNT(*) as registros_en FROM "specific_health";

-- Migrar sugestões_nutracêuticas_do_usuário → user_nutraceutical_suggestions
-- PRIMEIRO: Verificar se há dados
SELECT COUNT(*) as registros_pt FROM "sugestões_nutracêuticas_do_usuário";
SELECT COUNT(*) as registros_en FROM "user_nutraceutical_suggestions";

-- Migrar valores_nutricionais_completos → nutrition_foods
-- PRIMEIRO: Verificar se há dados
SELECT COUNT(*) as registros_pt FROM "valores_nutricionais_completos";
SELECT COUNT(*) as registros_en FROM "nutrition_foods";

-- ============================================
-- 3️⃣ LIMPAR CACHE/LOGS ANTIGOS (> 90 dias)
-- ============================================

-- Limpar admin_logs (manter últimos 90 dias)
-- DELETE FROM "admin_logs" WHERE created_at < NOW() - INTERVAL '90 days';
-- Limpar ai_system_logs (manter últimos 90 dias)
-- DELETE FROM "ai_system_logs" WHERE created_at < NOW() - INTERVAL '90 days';
-- Limpar analysis_cache (manter últimos 90 dias)
-- DELETE FROM "analysis_cache" WHERE created_at < NOW() - INTERVAL '90 days';
-- Limpar image_cache (manter últimos 90 dias)
-- DELETE FROM "image_cache" WHERE created_at < NOW() - INTERVAL '90 days';
-- Limpar scheduled_analysis_records (manter últimos 90 dias)
-- DELETE FROM "scheduled_analysis_records" WHERE created_at < NOW() - INTERVAL '90 days';
-- Limpar vps_api_logs (manter últimos 90 dias)
-- DELETE FROM "vps_api_logs" WHERE created_at < NOW() - INTERVAL '90 days';
-- Limpar whatsapp_evolution_logs (manter últimos 90 dias)
-- DELETE FROM "whatsapp_evolution_logs" WHERE created_at < NOW() - INTERVAL '90 days';

-- ============================================
-- 4️⃣ CONSOLIDAR TABELAS SIMILARES
-- ============================================

-- Consolidar em weight_measurements:
--   - weight_measures (verificar se tem dados diferentes)
SELECT COUNT(*) FROM "weight_measures";
--   - weighings (verificar se tem dados diferentes)
SELECT COUNT(*) FROM "weighings";

-- Consolidar em user_achievements_v2:
--   - user_achievements (verificar se tem dados diferentes)
SELECT COUNT(*) FROM "user_achievements";

-- Consolidar em sports_training_plans:
--   - sport_training_plans (verificar se tem dados diferentes)
SELECT COUNT(*) FROM "sport_training_plans";

-- Consolidar em user_sports_modalities:
--   - user_sport_modalities (verificar se tem dados diferentes)
SELECT COUNT(*) FROM "user_sport_modalities";

-- ============================================
-- 5️⃣ DROP TABELAS VAZIAS (após verificação)
-- ⚠️ DESCOMENTE APENAS APÓS CONFIRMAR QUE ESTÃO VAZIAS!
-- ============================================

-- DROP TABLE IF EXISTS "alimentos_completos" CASCADE;
-- DROP TABLE IF EXISTS "base_de_conhecimento_sofia" CASCADE;
-- DROP TABLE IF EXISTS "chat_conversation_history" CASCADE;
-- DROP TABLE IF EXISTS "company_configurations" CASCADE;
-- DROP TABLE IF EXISTS "exercise_challenges" CASCADE;
-- DROP TABLE IF EXISTS "food_history" CASCADE;
-- DROP TABLE IF EXISTS "health_integrations" CASCADE;
-- DROP TABLE IF EXISTS "heart_rate_data" CASCADE;
-- DROP TABLE IF EXISTS "information_feedback" CASCADE;
-- DROP TABLE IF EXISTS "institute_nutritional_catalog" CASCADE;
-- DROP TABLE IF EXISTS "layout_config" CASCADE;
-- DROP TABLE IF EXISTS "lições" CASCADE;
-- DROP TABLE IF EXISTS "meal_feedback" CASCADE;
-- DROP TABLE IF EXISTS "meal_plan_items" CASCADE;
-- DROP TABLE IF EXISTS "meal_plans" CASCADE;
-- DROP TABLE IF EXISTS "meal_suggestions" CASCADE;
-- DROP TABLE IF EXISTS "medical_exam_analyses" CASCADE;
-- DROP TABLE IF EXISTS "medical_pdf_reports" CASCADE;
-- DROP TABLE IF EXISTS "missions" CASCADE;
-- DROP TABLE IF EXISTS "missões_diárias" CASCADE;
-- DROP TABLE IF EXISTS "notification_queue_unified" CASCADE;
-- DROP TABLE IF EXISTS "notificações_enviadas" CASCADE;
-- DROP TABLE IF EXISTS "nutritional_aliases" CASCADE;
-- DROP TABLE IF EXISTS "nutritional_food_patterns" CASCADE;
-- DROP TABLE IF EXISTS "nutritional_protocols" CASCADE;
-- DROP TABLE IF EXISTS "nutritional_recommendations" CASCADE;
-- DROP TABLE IF EXISTS "nutritional_yields" CASCADE;
-- DROP TABLE IF EXISTS "offers" CASCADE;
-- DROP TABLE IF EXISTS "payment_records" CASCADE;
-- DROP TABLE IF EXISTS "pending_nutritional_aliases" CASCADE;
-- DROP TABLE IF EXISTS "pregnancy_nutrition" CASCADE;
-- DROP TABLE IF EXISTS "premium_medical_reports" CASCADE;
-- DROP TABLE IF EXISTS "premium_report_events" CASCADE;
-- DROP TABLE IF EXISTS "productivity_tracking" CASCADE;
-- DROP TABLE IF EXISTS "public_report_links" CASCADE;
-- DROP TABLE IF EXISTS "reações_feed_de_saúde" CASCADE;
-- DROP TABLE IF EXISTS "received_leads" CASCADE;
-- DROP TABLE IF EXISTS "recipe_components" CASCADE;
-- DROP TABLE IF EXISTS "recipe_items" CASCADE;
-- DROP TABLE IF EXISTS "recipe_templates" CASCADE;
-- DROP TABLE IF EXISTS "recipes" CASCADE;
-- DROP TABLE IF EXISTS "saboteur_assessments" CASCADE;
-- DROP TABLE IF EXISTS "saboteur_responses" CASCADE;
-- DROP TABLE IF EXISTS "saboteur_results" CASCADE;
-- DROP TABLE IF EXISTS "saude_especifica" CASCADE;
-- DROP TABLE IF EXISTS "sent_notifications" CASCADE;
-- DROP TABLE IF EXISTS "smart_notifications" CASCADE;
-- DROP TABLE IF EXISTS "social_context_tracking" CASCADE;
-- DROP TABLE IF EXISTS "sofia_comprehensive_analyses" CASCADE;
-- DROP TABLE IF EXISTS "sofia_conversation_context" CASCADE;
-- DROP TABLE IF EXISTS "sofia_knowledge_base" CASCADE;
-- DROP TABLE IF EXISTS "sofia_learning" CASCADE;
-- DROP TABLE IF EXISTS "sofia_memory" CASCADE;
-- DROP TABLE IF EXISTS "sofia_messages" CASCADE;
-- DROP TABLE IF EXISTS "specific_health" CASCADE;
-- DROP TABLE IF EXISTS "sports_challenge_participations" CASCADE;
-- DROP TABLE IF EXISTS "sports_challenges" CASCADE;
-- DROP TABLE IF EXISTS "sports_training_plans" CASCADE;
-- DROP TABLE IF EXISTS "sports_training_records" CASCADE;
-- DROP TABLE IF EXISTS "subscribers" CASCADE;
-- DROP TABLE IF EXISTS "subscription_invoices" CASCADE;
-- DROP TABLE IF EXISTS "sugestões_nutracêuticas_do_usuário" CASCADE;
-- DROP TABLE IF EXISTS "taco_foods" CASCADE;
-- DROP TABLE IF EXISTS "team_challenge_contributions" CASCADE;
-- DROP TABLE IF EXISTS "team_challenges" CASCADE;
-- DROP TABLE IF EXISTS "therapeutic_recipes" CASCADE;
-- DROP TABLE IF EXISTS "user_anamnesis_history" CASCADE;
-- DROP TABLE IF EXISTS "user_assessments" CASCADE;
-- DROP TABLE IF EXISTS "user_challenges" CASCADE;
-- DROP TABLE IF EXISTS "user_custom_saboteurs" CASCADE;
-- DROP TABLE IF EXISTS "user_exercise_feedback" CASCADE;
-- DROP TABLE IF EXISTS "user_exercise_programs" CASCADE;
-- DROP TABLE IF EXISTS "user_favorite_foods" CASCADE;
-- DROP TABLE IF EXISTS "user_goal_invites" CASCADE;
-- DROP TABLE IF EXISTS "user_ingredient_history" CASCADE;
-- DROP TABLE IF EXISTS "user_medical_reports" CASCADE;
-- DROP TABLE IF EXISTS "user_nutraceutical_suggestions" CASCADE;
-- DROP TABLE IF EXISTS "user_progress" CASCADE;
-- DROP TABLE IF EXISTS "user_purchases" CASCADE;
-- DROP TABLE IF EXISTS "user_sports_modalities" CASCADE;
-- DROP TABLE IF EXISTS "user_supplements" CASCADE;
-- DROP TABLE IF EXISTS "users_needing_analysis" CASCADE;
-- DROP TABLE IF EXISTS "valores_nutricionais_completos" CASCADE;
-- DROP TABLE IF EXISTS "weekly_goal_progress" CASCADE;
-- DROP TABLE IF EXISTS "weekly_insights" CASCADE;
-- DROP TABLE IF EXISTS "weighings" CASCADE;
-- DROP TABLE IF EXISTS "weight_measures" CASCADE;
-- DROP TABLE IF EXISTS "whatsapp_message_queue" CASCADE;
-- DROP TABLE IF EXISTS "whatsapp_message_templates" CASCADE;
-- DROP TABLE IF EXISTS "whatsapp_pending_medical" CASCADE;
-- DROP TABLE IF EXISTS "whatsapp_pending_nutrition" CASCADE;
-- DROP TABLE IF EXISTS "whatsapp_rate_limit_tracking" CASCADE;
-- DROP TABLE IF EXISTS "whatsapp_scheduled_messages" CASCADE;
-- DROP TABLE IF EXISTS "whatsapp_webhook_responses" CASCADE;
-- DROP TABLE IF EXISTS "wheel_of_life" CASCADE;
-- DROP TABLE IF EXISTS "workout_plans" CASCADE;

-- ============================================
-- 6️⃣ RENOMEAR TABELAS PT → EN (se EN não existir)
-- ============================================

-- ALTER TABLE "alimentos_completos" RENAME TO "nutrition_foods";
-- ALTER TABLE "base_de_conhecimento_sofia" RENAME TO "sofia_knowledge_base";
-- ALTER TABLE "lições" RENAME TO "lessons";
-- ALTER TABLE "missões_diárias" RENAME TO "missions";
-- ALTER TABLE "notificações_enviadas" RENAME TO "sent_notifications";
-- ALTER TABLE "reações_feed_de_saúde" RENAME TO "health_feed_reactions";
-- ALTER TABLE "saude_especifica" RENAME TO "specific_health";
-- ALTER TABLE "sugestões_nutracêuticas_do_usuário" RENAME TO "user_nutraceutical_suggestions";
-- ALTER TABLE "valores_nutricionais_completos" RENAME TO "nutrition_foods";
