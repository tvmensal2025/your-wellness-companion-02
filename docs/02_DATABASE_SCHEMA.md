# 🗄️ Schema do Banco de Dados MaxNutrition

> Documentação gerada em: 2026-01-16
> Backend: Lovable Cloud (Supabase)

---

## 📊 Visão Geral

| Métrica | Valor |
|---------|-------|
| **Total de Tabelas** | 130+ |
| **Funções RPC** | 50+ |
| **Storage Buckets** | 8 |
| **RLS Policies** | 200+ |

---

## 📑 Índice de Tabelas por Categoria

1. [Usuários e Perfis](#1-usuários-e-perfis)
2. [Gamificação](#2-gamificação)
3. [Nutrição e Sofia](#3-nutrição-e-sofia)
4. [Saúde e Médico](#4-saúde-e-médico)
5. [Exercícios](#5-exercícios)
6. [Social/Comunidade](#6-socialcomunidade)
7. [Configurações e Admin](#7-configurações-e-admin)
8. [Cache e Logs](#8-cache-e-logs)
9. [Integrações Externas](#9-integrações-externas)

---

## 1. Usuários e Perfis

### `profiles`
Perfil principal do usuário.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | NO | - | FK → auth.users |
| `full_name` | text | YES | - | Nome completo |
| `avatar_url` | text | YES | - | URL do avatar |
| `gender` | text | YES | - | Gênero |
| `birth_date` | date | YES | - | Data nascimento |
| `height_cm` | numeric | YES | - | Altura em cm |
| `weight_kg` | numeric | YES | - | Peso em kg |
| `target_weight_kg` | numeric | YES | - | Peso alvo |
| `activity_level` | text | YES | - | Nível atividade |
| `dietary_preference` | text | YES | - | Preferência alimentar |
| `health_goals` | text[] | YES | - | Metas de saúde |
| `onboarding_completed` | boolean | YES | false | Onboarding feito |
| `is_admin` | boolean | YES | false | É admin |
| `admin_since` | timestamptz | YES | - | Admin desde |
| `subscription_status` | text | YES | 'free' | Status assinatura |
| `subscription_tier` | text | YES | 'free' | Tier |
| `created_at` | timestamptz | YES | now() | Criado em |
| `updated_at` | timestamptz | YES | now() | Atualizado em |

**RLS Policies:**
- SELECT: Usuários podem ver seu próprio perfil
- INSERT: Usuários autenticados podem criar perfil
- UPDATE: Usuários podem atualizar próprio perfil

---

### `user_anamnesis`
Anamnese completa do usuário.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK → profiles |
| `medical_conditions` | text[] | YES | Condições médicas |
| `allergies` | text[] | YES | Alergias |
| `medications` | text[] | YES | Medicamentos |
| `physical_limitations` | text[] | YES | Limitações físicas |
| `sleep_quality` | text | YES | Qualidade sono |
| `stress_level` | text | YES | Nível estresse |
| `exercise_frequency` | text | YES | Frequência exercício |
| `dietary_restrictions` | text[] | YES | Restrições alimentares |
| `goals_description` | text | YES | Descrição das metas |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

### `user_preferences`
Preferências do usuário no app.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `notification_enabled` | boolean | YES | Notificações ativas |
| `dark_mode` | boolean | YES | Modo escuro |
| `language` | text | YES | Idioma |
| `meal_reminder_times` | jsonb | YES | Horários lembrete |
| `water_reminder_interval` | integer | YES | Intervalo água (min) |
| `exercise_reminder_days` | text[] | YES | Dias lembrete exercício |

---

## 2. Gamificação

### `user_points`
Pontos e XP do usuário.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | NO | - | FK |
| `total_points` | integer | YES | 0 | Pontos totais |
| `xp_total` | integer | YES | 0 | XP total |
| `level` | integer | YES | 1 | Nível atual |
| `current_streak` | integer | YES | 0 | Streak atual |
| `longest_streak` | integer | YES | 0 | Maior streak |
| `last_activity_date` | date | YES | - | Última atividade |
| `weekly_points` | integer | YES | 0 | Pontos semanais |
| `monthly_points` | integer | YES | 0 | Pontos mensais |
| `created_at` | timestamptz | YES | now() | Criado em |
| `updated_at` | timestamptz | YES | now() | Atualizado em |

**Índices:**
- `idx_user_points_user_id` (user_id)
- `idx_user_points_total` (total_points DESC)

---

### `challenges`
Definição de desafios.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `title` | text | NO | Título |
| `description` | text | YES | Descrição |
| `challenge_type` | text | YES | Tipo do desafio |
| `target_value` | integer | YES | Valor alvo |
| `target_unit` | text | YES | Unidade (passos, kcal) |
| `xp_reward` | integer | YES | XP de recompensa |
| `points_reward` | integer | YES | Pontos de recompensa |
| `badge_reward` | text | YES | Badge de recompensa |
| `start_date` | date | YES | Data início |
| `end_date` | date | YES | Data fim |
| `is_active` | boolean | YES | Está ativo |
| `difficulty` | text | YES | Dificuldade |
| `icon` | text | YES | Ícone |
| `color` | text | YES | Cor |
| `created_at` | timestamptz | YES | Criado em |

---

### `challenge_participations`
Participação em desafios.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `challenge_id` | uuid | NO | FK → challenges |
| `user_id` | uuid | NO | FK |
| `progress` | integer | YES | Progresso atual |
| `target_value` | integer | YES | Valor alvo |
| `is_completed` | boolean | YES | Completou |
| `completed_at` | timestamptz | YES | Completou em |
| `points_earned` | integer | YES | Pontos ganhos |
| `current_streak` | integer | YES | Streak no desafio |
| `started_at` | timestamptz | YES | Iniciou em |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

### `user_achievements_v2`
Conquistas do usuário.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `achievement_id` | text | NO | ID da conquista |
| `achievement_name` | text | YES | Nome |
| `achievement_description` | text | YES | Descrição |
| `achievement_icon` | text | YES | Ícone |
| `category` | text | YES | Categoria |
| `rarity` | text | YES | Raridade |
| `xp_reward` | integer | YES | XP ganho |
| `unlocked_at` | timestamptz | YES | Desbloqueado em |
| `created_at` | timestamptz | YES | Criado em |

---

### `flash_challenges`
Desafios relâmpago (curta duração).

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `title` | text | NO | Título |
| `description` | text | YES | Descrição |
| `challenge_type` | text | NO | Tipo |
| `target_value` | integer | NO | Valor alvo |
| `xp_reward` | integer | YES | XP |
| `duration_hours` | integer | YES | Duração (horas) |
| `starts_at` | timestamptz | NO | Inicia em |
| `ends_at` | timestamptz | NO | Termina em |
| `is_active` | boolean | YES | Ativo |
| `emoji` | text | YES | Emoji |

---

### `daily_mission_sessions`
Sessões de missões diárias.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `session_date` | date | NO | Data da sessão |
| `missions_completed` | integer | YES | Missões completas |
| `total_points` | integer | YES | Pontos totais |
| `streak_days` | integer | YES | Dias de streak |
| `completed_sections` | jsonb | YES | Seções completadas |
| `is_completed` | boolean | YES | Sessão completa |
| `created_at` | timestamptz | YES | Criado em |

---

## 3. Nutrição e Sofia

### `food_history`
Histórico de refeições.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `meal_date` | date | NO | Data da refeição |
| `meal_type` | text | YES | Tipo (café, almoço, etc) |
| `meal_time` | time | YES | Horário |
| `food_items` | jsonb | YES | Itens alimentares |
| `total_calories` | integer | YES | Calorias totais |
| `total_proteins` | numeric | YES | Proteínas (g) |
| `total_carbs` | numeric | YES | Carboidratos (g) |
| `total_fats` | numeric | YES | Gorduras (g) |
| `total_fiber` | numeric | YES | Fibras (g) |
| `photo_url` | text | YES | URL da foto |
| `ai_analysis` | text | YES | Análise IA |
| `confidence_score` | numeric | YES | Confiança análise |
| `user_confirmed` | boolean | YES | Confirmado usuário |
| `source` | text | YES | Fonte (manual, sofia) |
| `created_at` | timestamptz | YES | Criado em |
| `deleted_at` | timestamptz | YES | Deletado em (soft) |

---

### `sofia_memory`
Memória da Sofia para contexto.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `memory_type` | text | YES | Tipo de memória |
| `content` | text | YES | Conteúdo |
| `importance` | integer | YES | Importância (1-10) |
| `context` | jsonb | YES | Contexto adicional |
| `last_accessed` | timestamptz | YES | Último acesso |
| `access_count` | integer | YES | Contagem acessos |
| `created_at` | timestamptz | YES | Criado em |

---

### `sofia_learning`
Aprendizado da Sofia sobre o usuário.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `learning_type` | text | YES | Tipo aprendizado |
| `key` | text | YES | Chave |
| `value` | jsonb | YES | Valor |
| `confidence` | numeric | YES | Confiança |
| `source` | text | YES | Fonte |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

### `meal_plans`
Planos de refeição.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `plan_name` | text | YES | Nome do plano |
| `plan_type` | text | YES | Tipo (semanal, diário) |
| `start_date` | date | YES | Data início |
| `end_date` | date | YES | Data fim |
| `meals` | jsonb | NO | Refeições estruturadas |
| `total_daily_calories` | integer | YES | Calorias diárias |
| `macros_target` | jsonb | YES | Metas de macros |
| `restrictions_applied` | text[] | YES | Restrições aplicadas |
| `is_active` | boolean | YES | Ativo |
| `created_by` | text | YES | Criado por (sofia, manual) |
| `created_at` | timestamptz | YES | Criado em |

---

### `nutrition_tracking`
Tracking diário de nutrição.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `tracking_date` | date | NO | Data |
| `calories_consumed` | integer | YES | Calorias consumidas |
| `calories_goal` | integer | YES | Meta calorias |
| `protein_consumed` | numeric | YES | Proteína (g) |
| `protein_goal` | numeric | YES | Meta proteína |
| `carbs_consumed` | numeric | YES | Carbs (g) |
| `carbs_goal` | numeric | YES | Meta carbs |
| `fat_consumed` | numeric | YES | Gordura (g) |
| `fat_goal` | numeric | YES | Meta gordura |
| `water_ml` | integer | YES | Água (ml) |
| `water_goal` | integer | YES | Meta água |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

## 4. Saúde e Médico

### `medical_exam_analyses`
Análises de exames médicos.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `exam_type` | text | YES | Tipo do exame |
| `exam_date` | date | YES | Data do exame |
| `file_url` | text | YES | URL do arquivo |
| `file_type` | text | YES | Tipo arquivo (pdf, img) |
| `extracted_text` | text | YES | Texto extraído (OCR) |
| `extracted_data` | jsonb | YES | Dados estruturados |
| `ai_interpretation` | text | YES | Interpretação IA |
| `health_indicators` | jsonb | YES | Indicadores de saúde |
| `recommendations` | text[] | YES | Recomendações |
| `risk_level` | text | YES | Nível de risco |
| `processing_status` | text | YES | Status processamento |
| `processing_error` | text | YES | Erro se houver |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

### `google_fit_data`
Dados do Google Fit.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `date` | date | NO | Data |
| `steps` | integer | YES | Passos |
| `calories` | integer | YES | Calorias |
| `distance_meters` | numeric | YES | Distância (m) |
| `active_minutes` | integer | YES | Minutos ativos |
| `heart_rate_avg` | integer | YES | FC média |
| `heart_rate_max` | integer | YES | FC máxima |
| `heart_rate_min` | integer | YES | FC mínima |
| `sleep_hours` | numeric | YES | Horas sono |
| `sleep_quality` | text | YES | Qualidade sono |
| `weight_kg` | numeric | YES | Peso (kg) |
| `body_fat_percentage` | numeric | YES | % gordura |
| `raw_data` | jsonb | YES | Dados brutos |
| `sync_timestamp` | timestamptz | YES | Timestamp sync |
| `created_at` | timestamptz | YES | Criado em |

**Unique Constraint:** (user_id, date)

---

### `health_diary`
Diário de saúde.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `date` | date | NO | Data |
| `mood_rating` | integer | YES | Humor (1-10) |
| `energy_level` | integer | YES | Energia (1-10) |
| `sleep_hours` | numeric | YES | Horas sono |
| `water_intake` | integer | YES | Água (ml) |
| `exercise_minutes` | integer | YES | Exercício (min) |
| `notes` | text | YES | Notas |
| `created_at` | timestamptz | NO | Criado em |

---

### `advanced_daily_tracking`
Tracking diário avançado.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `tracking_date` | date | YES | Data |
| `weight_kg` | numeric | YES | Peso |
| `body_fat_percentage` | numeric | YES | % gordura |
| `waist_cm` | numeric | YES | Cintura (cm) |
| `sleep_hours` | numeric | YES | Horas sono |
| `sleep_quality` | integer | YES | Qualidade sono |
| `mood_rating` | integer | YES | Humor |
| `stress_level` | integer | YES | Estresse |
| `energy_level` | integer | YES | Energia |
| `steps` | integer | YES | Passos |
| `calories_consumed` | integer | YES | Calorias |
| `water_ml` | integer | YES | Água |
| `exercise_duration_minutes` | integer | YES | Exercício |
| `notes` | text | YES | Notas |
| `photo_url` | text | YES | Foto progresso |
| `symptoms` | text[] | YES | Sintomas |
| `medications_taken` | text[] | YES | Medicamentos |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

## 5. Exercícios

### `exercises_library`
Biblioteca de exercícios.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `name` | text | NO | Nome |
| `description` | text | YES | Descrição |
| `muscle_group` | text | YES | Grupo muscular |
| `location` | text | NO | Local (casa, academia) |
| `difficulty` | text | YES | Dificuldade |
| `equipment_needed` | text[] | YES | Equipamentos |
| `instructions` | text[] | YES | Instruções |
| `tips` | text | YES | Dicas |
| `sets` | text | YES | Séries |
| `reps` | text | YES | Repetições |
| `rest_time` | text | YES | Tempo descanso |
| `youtube_url` | text | YES | URL YouTube |
| `image_url` | text | YES | URL imagem |
| `tags` | text[] | YES | Tags |
| `is_active` | boolean | YES | Ativo |
| `created_at` | timestamptz | YES | Criado em |

---

### `exercise_tracking`
Tracking de exercícios.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `date` | date | YES | Data |
| `exercise_type` | text | YES | Tipo |
| `duration_minutes` | integer | YES | Duração (min) |
| `calories_burned` | integer | YES | Calorias |
| `distance_km` | numeric | YES | Distância |
| `steps` | integer | YES | Passos |
| `heart_rate_avg` | integer | YES | FC média |
| `notes` | text | YES | Notas |
| `created_at` | timestamptz | YES | Criado em |

---

### `saved_workout_programs`
Programas de treino salvos.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `program_name` | text | YES | Nome |
| `program_type` | text | YES | Tipo |
| `duration_weeks` | integer | YES | Duração (semanas) |
| `weekly_schedule` | jsonb | YES | Programação semanal |
| `exercises` | jsonb | YES | Exercícios |
| `is_active` | boolean | YES | Ativo |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

## 6. Social/Comunidade

### `health_feed_posts`
Posts do feed social.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `content` | text | YES | Conteúdo |
| `post_type` | text | YES | Tipo post |
| `media_urls` | text[] | YES | URLs mídia |
| `tags` | text[] | YES | Tags |
| `likes_count` | integer | YES | Likes |
| `comments_count` | integer | YES | Comentários |
| `shares_count` | integer | YES | Shares |
| `visibility` | text | YES | Visibilidade |
| `is_pinned` | boolean | YES | Fixado |
| `metadata` | jsonb | YES | Metadados |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

### `health_feed_stories`
Stories do feed.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `media_url` | text | NO | URL mídia |
| `media_type` | text | YES | Tipo mídia |
| `text_content` | text | YES | Texto |
| `background_color` | text | YES | Cor fundo |
| `category` | text | YES | Categoria |
| `views_count` | integer | YES | Visualizações |
| `expires_at` | timestamptz | YES | Expira em |
| `created_at` | timestamptz | YES | Criado em |

---

### `health_feed_follows`
Seguidores.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `follower_id` | uuid | NO | PK, FK |
| `following_id` | uuid | NO | PK, FK |
| `created_at` | timestamptz | YES | Criado em |

**PK Composta:** (follower_id, following_id)

---

### `health_feed_reactions`
Reações aos posts.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `post_id` | uuid | NO | FK → posts |
| `user_id` | uuid | NO | FK |
| `reaction_type` | text | YES | Tipo (like, love, etc) |
| `created_at` | timestamptz | YES | Criado em |

---

## 7. Configurações e Admin

### `ai_configurations`
Configurações de IA.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `functionality` | text | NO | Funcionalidade |
| `service` | text | NO | Serviço (gemini, openai) |
| `model` | text | NO | Modelo |
| `temperature` | numeric | NO | Temperatura |
| `max_tokens` | integer | NO | Max tokens |
| `system_prompt` | text | YES | Prompt sistema |
| `personality` | text | YES | Personalidade |
| `is_enabled` | boolean | YES | Ativo |
| `priority` | integer | YES | Prioridade |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

### `admin_logs`
Logs de ações admin.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `admin_id` | uuid | YES | FK |
| `action` | text | YES | Ação |
| `target_type` | text | YES | Tipo alvo |
| `target_id` | text | YES | ID alvo |
| `details` | jsonb | YES | Detalhes |
| `ip_address` | text | YES | IP |
| `created_at` | timestamptz | YES | Criado em |

---

## 8. Cache e Logs

### `analysis_cache`
Cache de análises de IA.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `image_hash` | text | NO | Hash da imagem |
| `analysis_type` | text | NO | Tipo (food, exam) |
| `result` | jsonb | NO | Resultado |
| `model_used` | text | YES | Modelo usado |
| `processing_time_ms` | integer | YES | Tempo proc. |
| `yolo_confidence` | numeric | YES | Confiança YOLO |
| `hits` | integer | YES | Hits de cache |
| `last_hit_at` | timestamptz | YES | Último hit |
| `created_at` | timestamptz | YES | Criado em |

**Unique:** image_hash + analysis_type

---

### `ai_response_cache`
Cache de respostas de IA.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `query_hash` | text | NO | Hash da query |
| `query_type` | text | NO | Tipo |
| `query_input` | text | NO | Input |
| `response_text` | text | NO | Resposta |
| `model_used` | text | YES | Modelo |
| `tokens_used` | integer | YES | Tokens |
| `ttl_hours` | integer | YES | TTL (horas) |
| `hit_count` | integer | YES | Hits |
| `last_hit_at` | timestamptz | YES | Último hit |
| `expires_at` | timestamptz | NO | Expira em |
| `created_at` | timestamptz | NO | Criado em |

---

### `ai_usage_logs`
Logs de uso de IA.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | YES | FK |
| `provider` | text | NO | Provider (gemini, openai) |
| `method` | text | NO | Método |
| `functionality` | text | YES | Funcionalidade |
| `model_name` | text | YES | Modelo |
| `tokens_used` | integer | YES | Tokens |
| `estimated_cost` | numeric | YES | Custo estimado |
| `response_time_ms` | integer | YES | Tempo resposta |
| `success` | boolean | YES | Sucesso |
| `error_message` | text | YES | Erro |
| `metadata` | jsonb | YES | Metadados |
| `created_at` | timestamptz | YES | Criado em |

---

## 9. Integrações Externas

### `google_fit_tokens`
Tokens OAuth do Google Fit.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `access_token` | text | YES | Token acesso |
| `refresh_token` | text | YES | Token refresh |
| `token_type` | text | YES | Tipo token |
| `expires_at` | timestamptz | YES | Expira em |
| `scope` | text | YES | Escopo |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

### `chat_conversations`
Conversas de chat.

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK |
| `personality` | text | YES | Personalidade IA |
| `title` | text | YES | Título |
| `messages` | jsonb | YES | Mensagens |
| `total_tokens` | integer | YES | Tokens totais |
| `created_at` | timestamptz | YES | Criado em |
| `updated_at` | timestamptz | YES | Atualizado em |

---

## 📊 Diagrama de Relacionamentos (ERD)

```
┌─────────────────┐      ┌──────────────────┐
│   auth.users    │      │     profiles     │
│   (Supabase)    │──1:1─│                  │
└─────────────────┘      └────────┬─────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   user_points   │      │  food_history   │      │ google_fit_data │
│ (Gamificação)   │      │   (Nutrição)    │      │    (Saúde)      │
└────────┬────────┘      └────────┬────────┘      └─────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│   challenges    │◄─────│ challenge_      │
│   (Definição)   │  1:N │ participations  │
└─────────────────┘      └─────────────────┘

┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│health_feed_posts│──1:N─│health_feed_     │──N:1─│    profiles     │
│    (Posts)      │      │  reactions      │      │   (Usuário)     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## 🔧 Funções RPC Principais

### Gamificação

```sql
-- Calcula nível baseado em XP
calculate_level(p_xp_total INTEGER) RETURNS INTEGER

-- Recalcula streak do usuário
recalculate_user_streak(p_user_id UUID) RETURNS VOID

-- Processa promoções de liga
process_league_promotions() RETURNS VOID

-- Atualiza progresso de desafio
update_challenge_progress(
  p_user_id UUID,
  p_challenge_id UUID,
  p_increment INTEGER
) RETURNS VOID

-- Adiciona pontos ao usuário
add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_xp INTEGER,
  p_action TEXT
) RETURNS VOID
```

### Nutrição

```sql
-- Calcula macros do dia
calculate_daily_macros(
  p_user_id UUID,
  p_date DATE
) RETURNS TABLE(
  calories INTEGER,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC
)

-- Busca histórico de refeições
get_meal_history(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS SETOF food_history
```

### Saúde

```sql
-- Calcula score de saúde
calculate_health_score(p_user_id UUID) RETURNS INTEGER

-- Sincroniza dados Google Fit
sync_google_fit_data(
  p_user_id UUID,
  p_data JSONB
) RETURNS VOID
```

---

## 🔐 Políticas RLS Principais

### profiles
```sql
-- SELECT: Próprio perfil ou admin
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- UPDATE: Apenas próprio perfil
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### food_history
```sql
-- SELECT: Apenas próprio histórico
CREATE POLICY "select_own_food" ON food_history
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Usuário autenticado
CREATE POLICY "insert_own_food" ON food_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### health_feed_posts
```sql
-- SELECT: Posts públicos ou próprios
CREATE POLICY "select_posts" ON health_feed_posts
  FOR SELECT USING (
    visibility = 'public' 
    OR auth.uid() = user_id
  );
```

---

## 📝 Próximos Passos

- Consulte `05_EDGE_FUNCTIONS.md` para APIs que usam estas tabelas
- Consulte `07_AI_SYSTEMS.md` para fluxo de análise de IA
- Consulte `08_GAMIFICATION.md` para lógica de pontos
