#!/usr/bin/env python3
"""
Análise e Categorização de Tabelas do Banco de Dados MaxNutrition
================================================================

Este script analisa as 200+ tabelas do Supabase e as organiza em categorias
lógicas para facilitar a compreensão e manutenção do sistema.
"""

import re
from collections import defaultdict
from typing import Dict, List, Tuple

# Lista completa de tabelas (copiada do Lovable)
TABLES = """
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
""".split()

def categorize_tables(tables: List[str]) -> Dict[str, List[str]]:
    """Categoriza tabelas baseado em padrões de nome e domínio."""
    
    categories = defaultdict(list)
    
    # Padrões de categorização
    patterns = {
        # ===== CORE =====
        "👤 Usuários & Perfis": [
            r"^profiles$", r"^user_roles$", r"^user_blocks$",
            r"^user_layout_preferences$", r"^user_notification_settings$"
        ],
        
        # ===== SAÚDE =====
        "🏥 Dados de Saúde": [
            r"^user_physical_data$", r"^user_anamnesis", r"^health_",
            r"^heart_rate", r"^weight_", r"^weighings$", r"^water_tracking$",
            r"^advanced_daily_tracking$", r"^specific_health$", r"^saude_especifica$",
            r"^pregnancy_nutrition$", r"^preventive_health"
        ],
        
        "🩺 Médico & Exames": [
            r"^medical_", r"^premium_medical", r"^premium_report",
            r"^public_report_links$"
        ],
        
        # ===== NUTRIÇÃO =====
        "🍎 Nutrição - Alimentos": [
            r"^alimentos_", r"^nutrition_foods$", r"^taco_foods$",
            r"^nutritional_aliases$", r"^pending_nutritional_aliases$",
            r"^nutritional_food_patterns$", r"^nutritional_yields$",
            r"^valores_nutricionais", r"^institute_nutritional_catalog$",
            r"^food_history$", r"^user_favorite_foods$", r"^user_food_preferences$",
            r"^user_ingredient_history$"
        ],
        
        "🥗 Nutrição - Planos & Refeições": [
            r"^meal_", r"^recipe", r"^therapeutic_recipes$",
            r"^nutritional_goals$", r"^nutritional_protocols$",
            r"^nutritional_recommendations$", r"^nutrition_tracking$"
        ],
        
        "💊 Suplementos": [
            r"^supplement", r"^protocol_supplements$",
            r"^user_supplements$", r"^user_nutraceutical",
            r"^sugestões_nutracêuticas"
        ],
        
        # ===== EXERCÍCIOS =====
        "🏋️ Exercícios": [
            r"^exercise", r"^user_exercise", r"^workout_plans$",
            r"^user_workout_evolution$"
        ],
        
        "⚽ Esportes": [
            r"^sport", r"^sports_", r"^user_sport"
        ],
        
        # ===== GAMIFICAÇÃO =====
        "🎮 Gamificação - Desafios": [
            r"^challenge", r"^flash_challenges$", r"^team_challenge",
            r"^team_battles$", r"^user_challenges$"
        ],
        
        "🏆 Gamificação - Conquistas & Pontos": [
            r"^user_achievements", r"^user_gamification$", r"^user_points$",
            r"^user_powerups$", r"^powerup_usage", r"^points_configuration$",
            r"^user_leagues$", r"^xp_config", r"^seasonal_events$"
        ],
        
        "🎯 Metas & Progresso": [
            r"^user_goals$", r"^user_goal_", r"^goal_streaks$", r"^goal_updates$",
            r"^user_progress$", r"^weekly_goal_progress$"
        ],
        
        "📋 Missões": [
            r"^missions$", r"^missões_diárias$", r"^user_missions$",
            r"^daily_mission_sessions$"
        ],
        
        # ===== SESSÕES & CURSOS =====
        "📚 Cursos & Lições": [
            r"^courses$", r"^course_modules$", r"^lessons$", r"^lições$"
        ],
        
        "🧘 Sessões & Avaliações": [
            r"^sessions$", r"^session_templates$", r"^user_sessions$",
            r"^daily_responses$", r"^user_assessments$",
            r"^professional_evaluations$"
        ],
        
        "🎭 Sabotadores": [
            r"^saboteur", r"^user_custom_saboteurs$"
        ],
        
        # ===== SOCIAL =====
        "👥 Comunidade & Feed": [
            r"^health_feed_", r"^reações_feed", r"^team_chat_messages$",
            r"^social_context_tracking$"
        ],
        
        # ===== IA =====
        "🤖 Sofia (IA Nutricional)": [
            r"^sofia_", r"^base_de_conhecimento_sofia$"
        ],
        
        "🧠 IA - Configurações & Cache": [
            r"^ai_", r"^analysis_cache$", r"^image_cache$",
            r"^scheduled_analysis", r"^users_needing_analysis$",
            r"^weekly_analyses$", r"^weekly_insights$"
        ],
        
        # ===== CHAT =====
        "💬 Chat & Conversas": [
            r"^chat_"
        ],
        
        # ===== INTEGRAÇÕES =====
        "📱 Google Fit": [
            r"^google_fit"
        ],
        
        "📲 WhatsApp": [
            r"^whatsapp_"
        ],
        
        "🔗 Webhooks & APIs": [
            r"^webhook_", r"^vps_api_logs$", r"^rate_limits$"
        ],
        
        # ===== PAGAMENTOS =====
        "💳 Pagamentos & Assinaturas": [
            r"^payment_", r"^subscription", r"^subscribers$",
            r"^user_subscriptions$", r"^user_purchases$", r"^offers$"
        ],
        
        # ===== NOTIFICAÇÕES =====
        "🔔 Notificações": [
            r"^notification", r"^notificações_enviadas$",
            r"^sent_notifications$", r"^smart_notifications$"
        ],
        
        # ===== ADMIN & SISTEMA =====
        "⚙️ Admin & Logs": [
            r"^admin_logs$", r"^system_metrics$"
        ],
        
        "🏢 Empresa & Configurações": [
            r"^company_", r"^dashboard_settings$", r"^layout_config$"
        ],
        
        "📊 Tracking & Produtividade": [
            r"^productivity_tracking$", r"^wheel_of_life$"
        ],
        
        "📝 Feedback & Leads": [
            r"^information_feedback$", r"^received_leads$"
        ],
    }
    
    categorized = set()
    
    for category, regex_patterns in patterns.items():
        for table in tables:
            if table in categorized:
                continue
            for pattern in regex_patterns:
                if re.match(pattern, table):
                    categories[category].append(table)
                    categorized.add(table)
                    break
    
    # Tabelas não categorizadas
    uncategorized = [t for t in tables if t not in categorized]
    if uncategorized:
        categories["❓ Não Categorizadas"] = uncategorized
    
    return dict(categories)


def find_duplicates_and_similar(tables: List[str]) -> Dict[str, List[str]]:
    """Encontra tabelas potencialmente duplicadas ou similares."""
    
    issues = defaultdict(list)
    
    # Padrões de duplicação conhecidos
    duplicate_patterns = [
        # Português vs Inglês
        (r"lições", r"lessons", "Duplicação PT/EN"),
        (r"missões_diárias", r"missions", "Duplicação PT/EN"),
        (r"notificações_enviadas", r"sent_notifications", "Duplicação PT/EN"),
        (r"reações_feed_de_saúde", r"health_feed_reactions", "Duplicação PT/EN"),
        
        # Versões
        (r"user_achievements$", r"user_achievements_v2", "Versão antiga vs nova"),
        
        # Similares
        (r"weight_measurements", r"weight_measures", "Nomes muito similares"),
        (r"weighings", r"weight_", "Funcionalidade similar"),
        (r"sport_training_plans", r"sports_training_plans", "Singular vs Plural"),
        (r"user_sport_modalities", r"user_sports_modalities", "Singular vs Plural"),
    ]
    
    for pattern1, pattern2, issue_type in duplicate_patterns:
        matches1 = [t for t in tables if re.search(pattern1, t)]
        matches2 = [t for t in tables if re.search(pattern2, t)]
        if matches1 and matches2:
            issues[issue_type].extend(matches1 + matches2)
    
    return dict(issues)


def analyze_table_prefixes(tables: List[str]) -> Dict[str, int]:
    """Analisa prefixos mais comuns nas tabelas."""
    
    prefixes = defaultdict(int)
    
    for table in tables:
        parts = table.split('_')
        if len(parts) > 1:
            prefix = parts[0]
            prefixes[prefix] += 1
    
    # Ordenar por frequência
    return dict(sorted(prefixes.items(), key=lambda x: -x[1]))


def generate_report(tables: List[str]) -> str:
    """Gera relatório completo de análise."""
    
    categories = categorize_tables(tables)
    duplicates = find_duplicates_and_similar(tables)
    prefixes = analyze_table_prefixes(tables)
    
    report = []
    report.append("=" * 80)
    report.append("📊 ANÁLISE DE TABELAS DO BANCO DE DADOS - MaxNutrition")
    report.append("=" * 80)
    report.append("")
    
    # Resumo
    report.append("## 📈 RESUMO GERAL")
    report.append(f"- Total de tabelas: {len(tables)}")
    report.append(f"- Categorias identificadas: {len(categories)}")
    report.append(f"- Problemas potenciais: {sum(len(v) for v in duplicates.values())}")
    report.append("")
    
    # Categorias
    report.append("## 📁 TABELAS POR CATEGORIA")
    report.append("")
    
    for category, cat_tables in sorted(categories.items(), key=lambda x: -len(x[1])):
        report.append(f"### {category} ({len(cat_tables)} tabelas)")
        for table in sorted(cat_tables):
            report.append(f"  - {table}")
        report.append("")
    
    # Problemas
    if duplicates:
        report.append("## ⚠️ PROBLEMAS POTENCIAIS")
        report.append("")
        for issue_type, issue_tables in duplicates.items():
            report.append(f"### {issue_type}")
            for table in sorted(set(issue_tables)):
                report.append(f"  - {table}")
            report.append("")
    
    # Prefixos
    report.append("## 🏷️ PREFIXOS MAIS COMUNS")
    report.append("")
    for prefix, count in list(prefixes.items())[:20]:
        report.append(f"  - {prefix}_*: {count} tabelas")
    report.append("")
    
    # Recomendações
    report.append("## 💡 RECOMENDAÇÕES DE ORGANIZAÇÃO")
    report.append("")
    report.append("### 1. Consolidar Tabelas Duplicadas")
    report.append("   - Migrar `lições` → `lessons`")
    report.append("   - Migrar `missões_diárias` → `missions` ou `daily_missions`")
    report.append("   - Migrar `notificações_enviadas` → `sent_notifications`")
    report.append("   - Consolidar `weight_measurements` e `weight_measures`")
    report.append("   - Migrar `user_achievements` → `user_achievements_v2`")
    report.append("")
    report.append("### 2. Padronizar Nomenclatura")
    report.append("   - Usar apenas inglês para nomes de tabelas")
    report.append("   - Padronizar singular/plural (preferir plural)")
    report.append("   - Usar prefixo `user_` para dados de usuário")
    report.append("")
    report.append("### 3. Agrupar por Domínio (Schemas)")
    report.append("   - `nutrition.*` - Todas tabelas de nutrição")
    report.append("   - `exercise.*` - Exercícios e esportes")
    report.append("   - `gamification.*` - Desafios, pontos, conquistas")
    report.append("   - `social.*` - Feed, chat, comunidade")
    report.append("   - `ai.*` - Sofia e configurações de IA")
    report.append("   - `integrations.*` - WhatsApp, Google Fit, webhooks")
    report.append("")
    report.append("### 4. Tabelas Candidatas a Arquivamento")
    report.append("   - Tabelas `_v1` ou sem `_v2` quando existe versão nova")
    report.append("   - Tabelas de cache antigas")
    report.append("   - Logs antigos (manter apenas últimos 90 dias)")
    report.append("")
    
    # Comando para Lovable
    report.append("## 🔧 COMANDO PARA LOVABLE")
    report.append("")
    report.append("Para obter detalhes de cada tabela, execute no Lovable:")
    report.append("```sql")
    report.append("-- Ver estrutura de uma tabela específica")
    report.append("SELECT column_name, data_type, is_nullable")
    report.append("FROM information_schema.columns")
    report.append("WHERE table_name = 'NOME_DA_TABELA'")
    report.append("ORDER BY ordinal_position;")
    report.append("")
    report.append("-- Contar registros em todas as tabelas")
    report.append("SELECT schemaname, relname, n_live_tup")
    report.append("FROM pg_stat_user_tables")
    report.append("ORDER BY n_live_tup DESC;")
    report.append("```")
    report.append("")
    
    return "\n".join(report)


def main():
    """Função principal."""
    
    print(f"\n🔍 Analisando {len(TABLES)} tabelas...\n")
    
    report = generate_report(TABLES)
    
    # Salvar relatório
    output_file = "docs/DATABASE_TABLES_ANALYSIS.md"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(report)
    
    print(report)
    print(f"\n✅ Relatório salvo em: {output_file}")
    
    # Estatísticas rápidas
    categories = categorize_tables(TABLES)
    print("\n📊 ESTATÍSTICAS RÁPIDAS:")
    print("-" * 40)
    for category, tables in sorted(categories.items(), key=lambda x: -len(x[1])):
        print(f"  {category}: {len(tables)}")


if __name__ == "__main__":
    main()
