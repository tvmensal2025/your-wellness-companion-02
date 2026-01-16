-- ======================================================================
-- FASE 2: LIMPEZA DE TABELAS VAZIAS E NÃO UTILIZADAS
-- Esta migração remove ~120 tabelas que estão vazias ou não são usadas
-- ======================================================================

-- POOLS DE ALIMENTOS (0 rows, sem uso no código)
DROP TABLE IF EXISTS public.bakery_pool CASCADE;
DROP TABLE IF EXISTS public.bean_pool CASCADE;
DROP TABLE IF EXISTS public.carb_pool CASCADE;
DROP TABLE IF EXISTS public.fruit_pool CASCADE;
DROP TABLE IF EXISTS public.protein_pool CASCADE;
DROP TABLE IF EXISTS public.vegetable_pool CASCADE;

-- TABELAS DE IA LEGACY (0 rows, substituídas por ai_configurations)
DROP TABLE IF EXISTS public.ai_presets CASCADE;
DROP TABLE IF EXISTS public.ai_fallback_configs CASCADE;
DROP TABLE IF EXISTS public.ai_documents CASCADE;

-- TABELAS DE CHAT VAZIAS (0 rows)
DROP TABLE IF EXISTS public.chat_configurations CASCADE;
DROP TABLE IF EXISTS public.chat_emotional_analysis CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;

-- TRACKING NUNCA USADOS (0 rows cada)
DROP TABLE IF EXISTS public.body_sensation_tracking CASCADE;
DROP TABLE IF EXISTS public.breathing_mindfulness_tracking CASCADE;
DROP TABLE IF EXISTS public.daily_health_snapshot CASCADE;
DROP TABLE IF EXISTS public.daily_self_assessment CASCADE;
DROP TABLE IF EXISTS public.digestion_tracking CASCADE;
DROP TABLE IF EXISTS public.hunger_behavior_tracking CASCADE;
DROP TABLE IF EXISTS public.hydration_details_tracking CASCADE;
DROP TABLE IF EXISTS public.medication_adherence_tracking CASCADE;
DROP TABLE IF EXISTS public.menstrual_cycle_tracking CASCADE;
DROP TABLE IF EXISTS public.mood_monitoring CASCADE;
DROP TABLE IF EXISTS public.sleep_monitoring CASCADE;
DROP TABLE IF EXISTS public.trigger_incident_tracking CASCADE;

-- EXERCÍCIOS VAZIOS (0 rows cada)
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.exercise_ai_recommendations CASCADE;
DROP TABLE IF EXISTS public.exercise_muscle_group_progress CASCADE;
DROP TABLE IF EXISTS public.exercise_nutrition CASCADE;
DROP TABLE IF EXISTS public.exercise_performance_metrics CASCADE;
DROP TABLE IF EXISTS public.exercise_programs CASCADE;
DROP TABLE IF EXISTS public.exercise_progress_analysis CASCADE;
DROP TABLE IF EXISTS public.exercise_progress_logs CASCADE;
DROP TABLE IF EXISTS public.exercise_sessions CASCADE;
DROP TABLE IF EXISTS public.exercise_streaks CASCADE;
DROP TABLE IF EXISTS public.exercise_gamification_points CASCADE;

-- NUTRIÇÃO VAZIAS (0 rows cada)
DROP TABLE IF EXISTS public.alimentos_alias CASCADE;
DROP TABLE IF EXISTS public.alimentos_principios_ativos CASCADE;
DROP TABLE IF EXISTS public.daily_nutrition_summary CASCADE;
DROP TABLE IF EXISTS public.food_aliases CASCADE;
DROP TABLE IF EXISTS public.food_active_principles CASCADE;
DROP TABLE IF EXISTS public.food_analysis CASCADE;
DROP TABLE IF EXISTS public.food_analysis_logs CASCADE;
DROP TABLE IF EXISTS public.food_contraindications CASCADE;
DROP TABLE IF EXISTS public.food_craving_tracking CASCADE;
DROP TABLE IF EXISTS public.food_diseases CASCADE;
DROP TABLE IF EXISTS public.food_densities CASCADE;
DROP TABLE IF EXISTS public.food_yields CASCADE;
DROP TABLE IF EXISTS public.food_preparation_preservation CASCADE;
DROP TABLE IF EXISTS public.food_security CASCADE;

-- SOCIAL/FEED VAZIOS (0 rows cada)
DROP TABLE IF EXISTS public.health_feed_groups CASCADE;
DROP TABLE IF EXISTS public.health_feed_group_members CASCADE;
DROP TABLE IF EXISTS public.health_feed_polls CASCADE;
DROP TABLE IF EXISTS public.health_feed_poll_votes CASCADE;
DROP TABLE IF EXISTS public.health_feed_profile_views CASCADE;
DROP TABLE IF EXISTS public.health_feed_comments CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;

-- GOALS VAZIOS (0 rows cada)
DROP TABLE IF EXISTS public.goal_achievements CASCADE;
DROP TABLE IF EXISTS public.goal_benefits CASCADE;
DROP TABLE IF EXISTS public.goal_reminders CASCADE;

-- CHALLENGES VAZIOS (0 rows cada)
DROP TABLE IF EXISTS public.challenge_daily_logs CASCADE;
DROP TABLE IF EXISTS public.challenge_duels CASCADE;
DROP TABLE IF EXISTS public.challenge_group_messages CASCADE;
DROP TABLE IF EXISTS public.challenge_invites CASCADE;
DROP TABLE IF EXISTS public.challenge_journeys CASCADE;
DROP TABLE IF EXISTS public.challenge_leaderboard CASCADE;
DROP TABLE IF EXISTS public.flash_challenge_participations CASCADE;

-- STAGING/BACKUP (0 rows ou não usados)
DROP TABLE IF EXISTS public.taco_stage CASCADE;
DROP TABLE IF EXISTS public.mock_users CASCADE;
DROP TABLE IF EXISTS public."backups_anamnese_do_usuário" CASCADE;

-- DUPLICATAS PT VAZIAS (migradas para EN ou não usadas)
DROP TABLE IF EXISTS public."configurações_ai" CASCADE;
DROP TABLE IF EXISTS public."conquistas_do_usuário" CASCADE;
DROP TABLE IF EXISTS public."comidas_favoritas_do_usuário" CASCADE;
DROP TABLE IF EXISTS public."fatos_da_conversação" CASCADE;
DROP TABLE IF EXISTS public."memória_sofia" CASCADE;
DROP TABLE IF EXISTS public."documentos_médicos" CASCADE;
DROP TABLE IF EXISTS public."medidas_de_peso" CASCADE;
DROP TABLE IF EXISTS public."resumo_nutricional_diário" CASCADE;
DROP TABLE IF EXISTS public."suplementos_do_usuário" CASCADE;
DROP TABLE IF EXISTS public."pontos_do_usuário" CASCADE;
DROP TABLE IF EXISTS public."pontuações_do_usuário" CASCADE;
DROP TABLE IF EXISTS public."receitas_terapeuticas" CASCADE;
DROP TABLE IF EXISTS public."informações_economicas" CASCADE;
DROP TABLE IF EXISTS public."base_de_conhecimento_da_empresa" CASCADE;
DROP TABLE IF EXISTS public."desafios_esportivos" CASCADE;
DROP TABLE IF EXISTS public."registros_diários_de_desafio" CASCADE;
DROP TABLE IF EXISTS public."respostas_do_sabotador" CASCADE;
DROP TABLE IF EXISTS public."sabotadores_personalizados" CASCADE;
DROP TABLE IF EXISTS public."avaliações_sabotadores" CASCADE;
DROP TABLE IF EXISTS public."análise_estatísticas" CASCADE;
DROP TABLE IF EXISTS public."membros_do_grupo_feed_de_saúde" CASCADE;

-- OUTRAS TABELAS VAZIAS (0 rows cada)
DROP TABLE IF EXISTS public.achievement_tracking CASCADE;
DROP TABLE IF EXISTS public.active_principles CASCADE;
DROP TABLE IF EXISTS public.activity_categories CASCADE;
DROP TABLE IF EXISTS public.activity_sessions CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.bioimpedance_analysis CASCADE;
DROP TABLE IF EXISTS public.combinacoes_ideais CASCADE;
DROP TABLE IF EXISTS public.content_access CASCADE;
DROP TABLE IF EXISTS public.conversation_attachments CASCADE;
DROP TABLE IF EXISTS public.conversation_facts CASCADE;
DROP TABLE IF EXISTS public.conversation_messages CASCADE;
DROP TABLE IF EXISTS public.course_lessons CASCADE;
DROP TABLE IF EXISTS public.cultural_context CASCADE;
DROP TABLE IF EXISTS public.custom_saboteurs CASCADE;
DROP TABLE IF EXISTS public.demographic_nutrition CASCADE;
DROP TABLE IF EXISTS public.device_sync_log CASCADE;
DROP TABLE IF EXISTS public.diseases_conditions CASCADE;
DROP TABLE IF EXISTS public.dr_vital_memory CASCADE;
DROP TABLE IF EXISTS public.economic_information CASCADE;
DROP TABLE IF EXISTS public.environmental_impact CASCADE;
DROP TABLE IF EXISTS public.event_challenges CASCADE;
DROP TABLE IF EXISTS public.event_participations CASCADE;
DROP TABLE IF EXISTS public.google_fit_analysis CASCADE;
DROP TABLE IF EXISTS public.google_fit_data_extended CASCADE;
DROP TABLE IF EXISTS public.gratitude_journal CASCADE;
DROP TABLE IF EXISTS public.health_alerts CASCADE;
DROP TABLE IF EXISTS public.health_conditions CASCADE;

-- TABELAS PT COM REFERÊNCIA NO CÓDIGO (JÁ MIGRADAS)
-- dados_físicos_do_usuário - agora usa user_physical_data
DROP TABLE IF EXISTS public."dados_físicos_do_usuário" CASCADE;