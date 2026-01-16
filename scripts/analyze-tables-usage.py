#!/usr/bin/env python3
"""
Análise de Uso de Tabelas - MaxNutrition
=========================================

Compara tabelas do banco com uso real no código para identificar:
- Tabelas não usadas (candidatas a remoção)
- Tabelas duplicadas (PT/EN)
- Tabelas que podem ser consolidadas
"""

# Todas as 192 tabelas do banco (do Lovable)
ALL_TABLES = set("""
admin_logs advanced_daily_tracking ai_configurations ai_response_cache ai_system_logs 
ai_usage_logs alimentos_completos analysis_cache base_de_conhecimento_sofia 
challenge_participations challenge_team_members challenge_teams challenges 
chat_conversation_history chat_conversations company_configurations company_data 
company_knowledge_base course_modules courses daily_mission_sessions daily_responses 
dashboard_settings exercise_challenges exercise_tracking exercises_library 
flash_challenges food_history goal_streaks goal_updates google_fit_data 
google_fit_tokens health_diary health_feed_direct_messages health_feed_follows 
health_feed_notifications health_feed_posts health_feed_reactions health_feed_stories 
health_feed_story_views health_integrations heart_rate_data image_cache 
information_feedback institute_nutritional_catalog layout_config lessons lições 
meal_feedback meal_plan_history meal_plan_items meal_plans meal_suggestions 
medical_documents medical_exam_analyses medical_pdf_reports missions missões_diárias 
notification_preferences notification_queue_unified notifications notificações_enviadas 
nutrition_foods nutrition_tracking nutritional_aliases nutritional_food_patterns 
nutritional_goals nutritional_protocols nutritional_recommendations nutritional_yields 
offers payment_records pending_nutritional_aliases points_configuration powerup_usage_log 
pregnancy_nutrition premium_medical_reports premium_report_events preventive_health_analyses 
productivity_tracking professional_evaluations profiles protocol_supplements 
public_report_links rate_limits reações_feed_de_saúde received_leads recipe_components 
recipe_items recipe_templates recipes saboteur_assessments saboteur_responses 
saboteur_results saude_especifica scheduled_analysis_records seasonal_events 
sent_notifications session_templates sessions smart_notifications social_context_tracking 
sofia_comprehensive_analyses sofia_conversation_context sofia_food_analysis 
sofia_knowledge_base sofia_learning sofia_memory sofia_messages specific_health 
sport_training_plans sport_workout_logs sports_achievements sports_challenge_participations 
sports_challenges sports_training_plans sports_training_records subscribers 
subscription_invoices subscription_plans sugestões_nutracêuticas_do_usuário 
supplement_protocols supplements system_metrics taco_foods team_battles 
team_challenge_contributions team_challenges team_chat_messages therapeutic_recipes 
user_achievements user_achievements_v2 user_anamnesis user_anamnesis_history 
user_assessments user_blocks user_challenges user_custom_saboteurs user_exercise_feedback 
user_exercise_history user_exercise_programs user_favorite_foods user_food_preferences 
user_gamification user_goal_invites user_goal_levels user_goal_participants user_goals 
user_ingredient_history user_layout_preferences user_leagues user_medical_reports 
user_missions user_notification_settings user_nutraceutical_suggestions user_physical_data 
user_points user_powerups user_progress user_purchases user_roles user_sessions 
user_sport_modalities user_sports_modalities user_subscriptions user_supplements 
user_workout_evolution users_needing_analysis valores_nutricionais_completos vps_api_logs 
water_tracking webhook_destinations webhook_queue weekly_analyses weekly_goal_progress 
weekly_insights weighings weight_measurements weight_measures whatsapp_evolution_logs 
whatsapp_message_logs whatsapp_message_queue whatsapp_message_templates 
whatsapp_pending_medical whatsapp_pending_nutrition whatsapp_provider_config 
whatsapp_rate_limit_tracking whatsapp_scheduled_messages whatsapp_webhook_responses 
wheel_of_life workout_plans xp_config_audit_log
""".split())

# Tabelas usadas no código (extraídas do grep)
USED_TABLES = set("""
profiles weight_measurements challenge_participations user_goals user_points
user_physical_data challenges user_sessions daily_mission_sessions sessions
daily_responses courses health_feed_follows course_modules sport_training_plans
lessons health_feed_posts user_anamnesis health_diary exercises_library avatars
advanced_daily_tracking sofia_food_analysis user_layout_preferences sport_workout_logs
nutrition_tracking health_feed_notifications ai_configurations preventive_health_analyses
points_configuration nutritional_goals google_fit_data goal_updates water_tracking
supplements notifications medical_documents google_fit_tokens dashboard_settings
webhook_destinations user_workout_evolution user_exercise_history meal_plan_history
health_feed_direct_messages whatsapp_message_logs user_food_preferences user_powerups
user_leagues user_blocks professional_evaluations goal_streaks health_feed_stories
health_feed_reactions exercise_tracking challenge_team_members weekly_analyses
webhook_queue user_sport_modalities user_notification_settings user_goal_levels
user_achievements team_chat_messages team_battles supplement_protocols nutrition_foods
notification_preferences health_feed_story_views company_knowledge_base company_data
challenge_teams xp_config_audit_log whatsapp_provider_config user_subscriptions
user_roles user_missions user_goal_participants user_gamification user_achievements_v2
system_metrics subscription_plans sports_achievements session_templates seasonal_events
rate_limits protocol_supplements powerup_usage_log flash_challenges chat_conversations
ai_usage_logs ai_response_cache
""".split())

# Tabelas que são storage buckets (não tabelas reais)
STORAGE_BUCKETS = {
    'avatars', 'chat-images', 'medical-documents', 'medical-documents-reports',
    'course-thumbnails', 'exercise-media'
}

# Mapeamento de duplicatas PT → EN
DUPLICATES_PT_EN = {
    'lições': 'lessons',
    'missões_diárias': 'missions',
    'notificações_enviadas': 'sent_notifications',
    'reações_feed_de_saúde': 'health_feed_reactions',
    'saude_especifica': 'specific_health',
    'sugestões_nutracêuticas_do_usuário': 'user_nutraceutical_suggestions',
    'base_de_conhecimento_sofia': 'sofia_knowledge_base',
    'alimentos_completos': 'nutrition_foods',  # ou taco_foods
    'valores_nutricionais_completos': 'nutrition_foods',
}

# Tabelas similares que podem ser consolidadas
SIMILAR_TABLES = {
    'weight_measurements': ['weight_measures', 'weighings'],
    'user_achievements_v2': ['user_achievements'],
    'sports_training_plans': ['sport_training_plans'],
    'user_sports_modalities': ['user_sport_modalities'],
}

# Tabelas de cache/logs que podem ser limpas periodicamente
CACHE_LOG_TABLES = {
    'ai_response_cache', 'ai_system_logs', 'ai_usage_logs', 'analysis_cache',
    'image_cache', 'admin_logs', 'vps_api_logs', 'whatsapp_evolution_logs',
    'whatsapp_message_logs', 'system_metrics', 'scheduled_analysis_records',
    'xp_config_audit_log', 'powerup_usage_log'
}

def analyze():
    """Analisa uso das tabelas."""
    
    # Remove storage buckets da análise
    used = USED_TABLES - STORAGE_BUCKETS
    all_tables = ALL_TABLES
    
    # Tabelas não usadas no código
    unused = all_tables - used
    
    # Categorizar não usadas
    unused_pt = {t for t in unused if t in DUPLICATES_PT_EN}
    unused_cache = unused & CACHE_LOG_TABLES
    unused_other = unused - unused_pt - unused_cache
    
    print("=" * 80)
    print("📊 ANÁLISE DE USO DE TABELAS - MaxNutrition")
    print("=" * 80)
    print(f"\n📈 RESUMO:")
    print(f"  - Total de tabelas no banco: {len(all_tables)}")
    print(f"  - Tabelas usadas no código: {len(used)}")
    print(f"  - Tabelas NÃO usadas: {len(unused)}")
    print(f"    - Duplicatas PT/EN: {len(unused_pt)}")
    print(f"    - Cache/Logs: {len(unused_cache)}")
    print(f"    - Outras: {len(unused_other)}")
    
    print("\n" + "=" * 80)
    print("🗑️ TABELAS NÃO USADAS NO CÓDIGO (candidatas a remoção)")
    print("=" * 80)
    
    print("\n### Duplicatas PT/EN (migrar dados e remover):")
    for t in sorted(unused_pt):
        en = DUPLICATES_PT_EN.get(t, '?')
        print(f"  - {t} → {en}")
    
    print("\n### Cache/Logs (podem ser limpas, não removidas):")
    for t in sorted(unused_cache):
        print(f"  - {t}")
    
    print("\n### Outras tabelas não usadas:")
    for t in sorted(unused_other):
        print(f"  - {t}")
    
    return unused, unused_pt, unused_cache, unused_other


def generate_sql_commands(unused_pt, unused_cache, unused_other):
    """Gera comandos SQL para organização."""
    
    sql = []
    sql.append("-- " + "=" * 76)
    sql.append("-- 🔧 COMANDOS DE ORGANIZAÇÃO DO BANCO - MaxNutrition")
    sql.append("-- ⚠️ EXECUTE COM CUIDADO! FAÇA BACKUP ANTES!")
    sql.append("-- " + "=" * 76)
    sql.append("")
    
    # 1. Verificar tabelas vazias primeiro
    sql.append("-- ============================================")
    sql.append("-- 1️⃣ VERIFICAR TABELAS VAZIAS (seguro remover)")
    sql.append("-- ============================================")
    sql.append("""
SELECT relname as tabela, n_live_tup as registros
FROM pg_stat_user_tables
WHERE schemaname = 'public' 
  AND n_live_tup = 0
  AND relname IN (
""")
    all_unused = list(unused_pt) + list(unused_other)
    sql.append("    '" + "',\n    '".join(sorted(all_unused)) + "'")
    sql.append("  )")
    sql.append("ORDER BY relname;")
    sql.append("")
    
    # 2. Migrar dados de duplicatas PT → EN
    sql.append("-- ============================================")
    sql.append("-- 2️⃣ MIGRAR DADOS DE DUPLICATAS PT → EN")
    sql.append("-- ============================================")
    sql.append("")
    
    for pt, en in sorted(DUPLICATES_PT_EN.items()):
        sql.append(f"-- Migrar {pt} → {en}")
        sql.append(f"-- PRIMEIRO: Verificar se há dados")
        sql.append(f"SELECT COUNT(*) as registros_pt FROM \"{pt}\";")
        sql.append(f"SELECT COUNT(*) as registros_en FROM \"{en}\";")
        sql.append("")
    
    # 3. Limpar tabelas de cache/logs antigas
    sql.append("-- ============================================")
    sql.append("-- 3️⃣ LIMPAR CACHE/LOGS ANTIGOS (> 90 dias)")
    sql.append("-- ============================================")
    sql.append("")
    
    for t in sorted(unused_cache):
        sql.append(f"-- Limpar {t} (manter últimos 90 dias)")
        sql.append(f"-- DELETE FROM \"{t}\" WHERE created_at < NOW() - INTERVAL '90 days';")
    sql.append("")
    
    # 4. Consolidar tabelas similares
    sql.append("-- ============================================")
    sql.append("-- 4️⃣ CONSOLIDAR TABELAS SIMILARES")
    sql.append("-- ============================================")
    sql.append("")
    
    for main, others in SIMILAR_TABLES.items():
        sql.append(f"-- Consolidar em {main}:")
        for other in others:
            sql.append(f"--   - {other} (verificar se tem dados diferentes)")
            sql.append(f"SELECT COUNT(*) FROM \"{other}\";")
        sql.append("")
    
    # 5. Tabelas para DROP (apenas vazias)
    sql.append("-- ============================================")
    sql.append("-- 5️⃣ DROP TABELAS VAZIAS (após verificação)")
    sql.append("-- ⚠️ DESCOMENTE APENAS APÓS CONFIRMAR QUE ESTÃO VAZIAS!")
    sql.append("-- ============================================")
    sql.append("")
    
    for t in sorted(all_unused):
        sql.append(f"-- DROP TABLE IF EXISTS \"{t}\" CASCADE;")
    sql.append("")
    
    # 6. Renomear tabelas PT → EN
    sql.append("-- ============================================")
    sql.append("-- 6️⃣ RENOMEAR TABELAS PT → EN (se EN não existir)")
    sql.append("-- ============================================")
    sql.append("")
    
    for pt, en in sorted(DUPLICATES_PT_EN.items()):
        sql.append(f"-- ALTER TABLE \"{pt}\" RENAME TO \"{en}\";")
    sql.append("")
    
    return "\n".join(sql)


def main():
    unused, unused_pt, unused_cache, unused_other = analyze()
    
    sql = generate_sql_commands(unused_pt, unused_cache, unused_other)
    
    # Salvar SQL
    output_file = "docs/COMANDO_ORGANIZACAO_TABELAS.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(sql)
    
    print(f"\n✅ Comandos SQL salvos em: {output_file}")
    print("\n" + "=" * 80)
    print("📋 COMANDO SQL PARA LOVABLE (cole no SQL Editor):")
    print("=" * 80)
    print(sql)


if __name__ == "__main__":
    main()
