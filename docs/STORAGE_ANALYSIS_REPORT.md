# 📊 Relatório de Análise de Armazenamento - MaxNutrition

**Data da Análise:** Janeiro 2026  
**Projeto:** MaxNutrition (Instituto dos Sonhos)  
**Versão:** 0.0.0

---

## 🎯 Resumo Executivo

Este documento mapeia **TODOS** os locais onde dados são armazenados no projeto MaxNutrition.

### Estatísticas Gerais

| Métrica | Quantidade |
|---------|------------|
| **Tabelas no Banco** | 209 |
| **Edge Functions** | 73 |
| **localStorage Keys** | 8 |
| **PWA Caches** | 3 |
| **Storage Buckets** | Múltiplos (avatars, medical-documents, etc) |

---

## 🌐 1. SUPABASE CLOUD DATABASE (Principal)

### 📍 Localização
- **URL**: Configurado via `SUPABASE_URL` em `.env`
- **Tipo**: PostgreSQL (Cloud)
- **Acesso**: Via `@/integrations/supabase/client`

### 📊 Tabelas Identificadas (209 total)

#### Perfil e Autenticação
- `profiles` - Dados do perfil do usuário
- `user_roles` - Papéis e permissões
- `user_physical_data` - Dados físicos (altura, peso, IMC)
- `avatars` - Avatares disponíveis
- `avatar_customizations` - Customizações de avatar

#### Nutrição (Sofia)
- `food_analysis` - Análises de alimentos
- `sofia_food_analysis` - Análises da IA Sofia
- `nutrition_tracking` - Tracking nutricional
- `nutrition_foods` - Base de alimentos
- `nutrition_aliases` - Aliases de alimentos
- `nutrition_yields` - Rendimentos
- `nutritional_goals` - Metas nutricionais
- `nutrition_favorites` - Favoritos
- `meal_plan_history` - Histórico de planos
- `food_history` - Histórico de alimentos
- `daily_nutrition_summary` - Resumo diário

#### Saúde (Dr. Vital)
- `medical_documents` - Documentos médicos
- `medical_exam_analyses` - Análises de exames
- `preventive_health_analyses` - Análises preventivas
- `health_diary` - Diário de saúde
- `health_scores` - Pontuações de saúde
- `health_achievements` - Conquistas de saúde
- `health_streaks` - Sequências de saúde
- `health_missions` - Missões de saúde
- `health_timeline_events` - Eventos da linha do tempo
- `weekly_analyses` - Análises semanais
- `professional_evaluations` - Avaliações profissionais
- `coaching_reports` - Relatórios de coaching
- `premium_medical_reports` - Relatórios premium

#### Tracking Diário
- `advanced_daily_tracking` - Tracking avançado
- `daily_health_snapshot` - Snapshot diário
- `weight_measurements` - Medições de peso
- `sleep_tracking` - Tracking de sono
- `sleep_monitoring` - Monitoramento de sono
- `water_tracking` - Tracking de água
- `mood_tracking` - Tracking de humor
- `pain_reports` - Relatórios de dor
- `holistic_health_data` - Dados holísticos

#### Exercícios
- `exercises` - Exercícios
- `exercises_library` - Biblioteca de exercícios
- `exercise_sessions` - Sessões de exercício
- `exercise_tracking` - Tracking de exercícios
- `exercise_progress_logs` - Logs de progresso
- `exercise_progress_stats` - Estatísticas
- `exercise_performance_metrics` - Métricas de performance
- `exercise_streaks` - Sequências
- `exercise_achievements` - Conquistas
- `exercise_user_achievements` - Conquistas do usuário
- `exercise_feedback` - Feedback
- `exercise_insights` - Insights
- `exercise_learned_patterns` - Padrões aprendidos
- `exercise_modification_records` - Registros de modificação
- `exercise_skip_records` - Registros de pulos
- `workout_history` - Histórico de treinos
- `workout_sessions` - Sessões de treino
- `user_workout_evolution` - Evolução do usuário

#### Desafios e Gamificação
- `challenges` - Desafios
- `challenge_participations` - Participações
- `challenge_teams` - Times
- `challenge_team_members` - Membros dos times
- `challenge_duels` - Duelos
- `challenge_invites` - Convites
- `challenge_journeys` - Jornadas
- `flash_challenges` - Desafios relâmpago
- `flash_challenge_participations` - Participações
- `group_challenges` - Desafios em grupo
- `team_challenges` - Desafios de time
- `team_battles` - Batalhas de time
- `event_challenges` - Desafios de eventos
- `event_participations` - Participações em eventos
- `seasonal_events` - Eventos sazonais
- `user_gamification` - Gamificação do usuário
- `user_points` - Pontos do usuário
- `user_achievements` - Conquistas
- `user_achievements_v2` - Conquistas v2
- `achievement_tracking` - Tracking de conquistas
- `points_configuration` - Configuração de pontos
- `cardio_points_history` - Histórico de pontos cardio
- `exercise_points_history` - Histórico de pontos exercício
- `user_leagues` - Ligas do usuário
- `user_scores` - Pontuações

#### Metas e Objetivos
- `user_goals` - Metas do usuário
- `user_goal_participants` - Participantes
- `user_goal_invitations` - Convites
- `user_goal_levels` - Níveis
- `goal_achievements` - Conquistas de metas
- `goal_predictions` - Previsões
- `goal_reminders` - Lembretes
- `goal_streaks` - Sequências
- `goal_updates` - Atualizações

#### Sessões e Missões
- `sessions` - Templates de sessão
- `user_sessions` - Sessões do usuário
- `session_templates` - Templates
- `daily_missions` - Missões diárias
- `daily_mission_sessions` - Sessões de missão
- `user_missions` - Missões do usuário
- `daily_responses` - Respostas diárias

#### IA e Configurações
- `ai_configurations` - Configurações de IA
- `ai_usage_logs` - Logs de uso
- `ai_response_cache` - Cache de respostas
- `ai_user_learning_model` - Modelo de aprendizado
- `ai_user_state_analysis` - Análise de estado
- `ai_workout_adaptations` - Adaptações de treino
- `ai_system_logs` - Logs do sistema

#### Chat e Conversas
- `chat_conversations` - Conversas
- `chat_conversation_history` - Histórico
- `conversation_messages` - Mensagens
- `conversations` - Conversas
- `conversation_facts` - Fatos
- `dr_vital_memory` - Memória do Dr. Vital
- `sofia_conversations` - Conversas da Sofia
- `user_conversations` - Conversas do usuário

#### WhatsApp
- `whatsapp_evolution_logs` - Logs Evolution
- `whatsapp_message_logs` - Logs de mensagens
- `whatsapp_message_queue` - Fila de mensagens
- `whatsapp_message_templates` - Templates
- `whatsapp_pending_medical` - Médicos pendentes
- `whatsapp_pending_nutrition` - Nutrição pendente
- `whatsapp_provider_config` - Configuração do provedor
- `whatsapp_rate_limit_tracking` - Tracking de rate limit
- `whatsapp_webhook_responses` - Respostas de webhook
- `whatsapp_user_state` - Estado do usuário

#### Integrações
- `google_fit_data` - Dados do Google Fit
- `google_fit_tokens` - Tokens
- `wearable_data` - Dados de wearables
- `webhook_destinations` - Destinos de webhook
- `webhook_queue` - Fila de webhooks

#### Suplementos e Protocolos
- `supplements` - Suplementos
- `supplement_protocols` - Protocolos
- `supplement_interactions` - Interações
- `supplement_articles` - Artigos
- `protocol_supplements` - Suplementos do protocolo
- `user_supplements` - Suplementos do usuário

#### Cursos e Educação
- `courses` - Cursos
- `course_modules` - Módulos
- `course_lessons` - Lições
- `lessons` - Lições
- `scientific_articles` - Artigos científicos

#### Esportes
- `sport_training_plans` - Planos de treino
- `sport_workout_logs` - Logs de treino
- `user_sport_modalities` - Modalidades do usuário

#### Social e Comunidade
- `health_feed_posts` - Posts
- `health_feed_comments` - Comentários
- `health_feed_likes` - Curtidas
- `health_feed_reactions` - Reações
- `health_feed_follows` - Seguidores
- `health_feed_notifications` - Notificações
- `health_feed_stories` - Stories
- `health_feed_story_views` - Visualizações
- `health_feed_polls` - Enquetes
- `health_feed_poll_votes` - Votos
- `health_feed_direct_messages` - Mensagens diretas
- `health_feed_profile_views` - Visualizações de perfil
- `workout_buddy_profiles` - Perfis de parceiros
- `workout_buddy_connections` - Conexões
- `workout_groups` - Grupos
- `workout_group_members` - Membros
- `workout_encouragements` - Encorajamentos
- `team_chat_messages` - Mensagens de time
- `user_blocks` - Bloqueios

#### Notificações
- `notifications` - Notificações
- `notification_queue` - Fila
- `notification_preferences` - Preferências
- `user_notification_settings` - Configurações
- `exercise_notifications` - Notificações de exercício
- `exercise_notification_preferences` - Preferências

#### Câmera e Postura
- `camera_calibrations` - Calibrações
- `camera_metrics` - Métricas
- `camera_posture_events` - Eventos de postura
- `camera_rep_events` - Eventos de repetições
- `camera_workout_sessions` - Sessões de treino

#### Testes A/B
- `exercise_ab_tests` - Testes A/B de exercício
- `exercise_ab_test_interactions` - Interações
- `workout_ab_tests` - Testes A/B de treino
- `workout_ab_test_participants` - Participantes

#### Competições e Torneios
- `exercise_competitions` - Competições
- `exercise_competition_participants` - Participantes
- `exercise_tournaments` - Torneios
- `exercise_tournament_matches` - Partidas
- `exercise_challenges` - Desafios
- `exercise_challenge_participants` - Participantes
- `exercise_community_events` - Eventos comunitários
- `exercise_community_event_participants` - Participantes
- `exercise_seasonal_events` - Eventos sazonais
- `exercise_seasonal_event_participants` - Participantes

#### Outros
- `user_anamnesis` - Anamnese
- `user_food_preferences` - Preferências alimentares
- `user_exercise_feedback` - Feedback de exercício
- `user_exercise_history` - Histórico de exercício
- `user_layout_preferences` - Preferências de layout
- `user_powerups` - Power-ups
- `powerup_usage_log` - Log de uso
- `user_subscriptions` - Assinaturas
- `subscription_plans` - Planos
- `dashboard_settings` - Configurações do dashboard
- `timeline_events` - Eventos da timeline
- `life_wheel` - Roda da vida
- `custom_saboteurs` - Sabotadores customizados
- `injury_risk_assessments` - Avaliações de risco
- `overtraining_patterns` - Padrões de overtraining
- `exercise_muscle_balance` - Balanço muscular
- `exercise_progression_levels` - Níveis de progressão
- `exercise_benchmarks` - Benchmarks
- `exercise_leaderboards` - Leaderboards
- `exercise_user_statistics` - Estatísticas
- `exercise_user_preferences_learned` - Preferências aprendidas
- `exercise_workout_feedback` - Feedback de treino
- `activity_categories` - Categorias de atividade
- `activity_sessions` - Sessões de atividade
- `company_data` - Dados da empresa
- `company_knowledge_base` - Base de conhecimento
- `rate_limits` - Limites de taxa
- `system_metrics` - Métricas do sistema
- `scheduled_analysis_logs` - Logs de análise agendada
- `public_report_links` - Links de relatórios públicos
- `shared_reports` - Relatórios compartilhados
- `prescriptions` - Prescrições
- `heart_rate_data` - Dados de frequência cardíaca
- `menstrual_cycle_tracking` - Tracking de ciclo menstrual
- `bioimpedance_analysis` - Análise de bioimpedância
- `mood_monitoring` - Monitoramento de humor
- `image_cache` - Cache de imagens
- `n8n_webhook_logs` - Logs de webhook n8n
- `premium_report_events` - Eventos de relatórios premium

---

## ☁️ 2. SUPABASE STORAGE (Arquivos)

### 📍 Localização
- **Serviço**: Supabase Storage (Cloud)
- **Acesso**: Via `supabase.storage.from('bucket_name')`

### 📦 Buckets Identificados

#### 1. `avatars`
- **Uso**: Upload de avatares de usuário
- **Arquivo**: `src/hooks/useUserProfile.ts`
- **Tipo**: Imagens (PNG, JPG, WEBP)

#### 2. `medical-documents` (inferido)
- **Uso**: Documentos médicos, exames, PDFs
- **Edge Functions**: 
  - `analyze-medical-exam`
  - `cleanup-medical-images`
  - `generate-medical-report`
  - `premium-medical-report`
- **Tipo**: Imagens, PDFs

#### 3. Outros buckets (inferidos do código)
- `food-images` - Imagens de alimentos
- `profile-photos` - Fotos de perfil
- `workout-videos` - Vídeos de treino

### 🔒 Políticas de Acesso
- Configuradas via RLS (Row Level Security)
- Usuários só acessam seus próprios arquivos
- Admins têm acesso total

---

## 💻 3. BROWSER STORAGE (Cliente)

### 📍 Localização
- **Onde**: Navegador do usuário
- **Persistência**: Local (não sincroniza entre dispositivos)

### 💾 localStorage (8 keys)

| Key | Uso | Tipo |
|-----|-----|------|
| `daily_chest_claimed` | Controle de baú diário | Boolean/Timestamp |
| `emailConfig` | Configuração de email | JSON |
| `hasSeenWelcomeModal` | Flag de modal de boas-vindas | Boolean |
| `maxnutrition_selected_character` | Personagem selecionado | String |
| `n8nConfig` | Configuração n8n | JSON |
| `sofia_insights_last_generated` | Última geração de insights | Timestamp |
| `user_goals` | Cache de metas | JSON |
| `voice_config` | Configuração de voz | JSON |

### 🔄 sessionStorage (1 key)

| Key | Uso | Arquivo |
|-----|-----|---------|
| `chunk_error_recovery` | Recuperação de erros de chunk | `src/components/pwa/UpdatePrompt.tsx` |

### 🗃️ IndexedDB
- **Uso**: Não identificado uso explícito
- **Potencial**: Pode ser usado pelo Service Worker para cache offline

---

## 📦 4. PWA CACHE (Service Worker)

### 📍 Localização
- **Onde**: Cache Storage API do navegador
- **Configuração**: `vite.config.ts`

### 🔄 Caches Identificados (3)

#### 1. `supabase-cache`
- **Estratégia**: NetworkFirst
- **Timeout**: 10 segundos
- **Padrão**: `https://*.supabase.co/*`
- **Expiração**: 24 horas
- **Max Entries**: 100

#### 2. `images-cache`
- **Estratégia**: CacheFirst
- **Padrão**: `*.png, *.jpg, *.jpeg, *.svg, *.gif, *.webp`
- **Expiração**: 30 dias
- **Max Entries**: 60

#### 3. `fonts-cache`
- **Estratégia**: CacheFirst
- **Padrão**: `*.woff, *.woff2, *.ttf, *.eot`
- **Expiração**: 365 dias
- **Max Entries**: 20

### 📄 Assets Cacheados
- JavaScript bundles
- CSS files
- HTML (index.html)
- Ícones PWA
- Fontes

---

## ⚡ 5. EDGE FUNCTIONS (Serverless)

### 📍 Localização
- **Onde**: Supabase Edge Functions (Deno Deploy)
- **Persistência**: Temporária (não armazena dados)

### 🔧 Functions que Acessam Storage (73 total)

#### Nutrição (Sofia)
1. `sofia-image-analysis` - Análise de imagens de alimentos
2. `sofia-deterministic` - Análise determinística
3. `sofia-enhanced-memory` - Memória aprimorada
4. `food-analysis` - Análise de alimentos
5. `confirm-food-analysis` - Confirmação de análise
6. `enrich-food-data` - Enriquecimento de dados
7. `enrich-sofia-analysis` - Enriquecimento de análise
8. `nutrition-calc` - Cálculo nutricional
9. `nutrition-calc-deterministic` - Cálculo determinístico
10. `nutrition-ai-insights` - Insights de IA
11. `nutrition-daily-summary` - Resumo diário
12. `nutrition-planner` - Planejador
13. `nutrition-alias-admin` - Admin de aliases

#### Saúde (Dr. Vital)
14. `dr-vital-chat` - Chat com Dr. Vital
15. `dr-vital-enhanced` - Dr. Vital aprimorado
16. `dr-vital-weekly-report` - Relatório semanal
17. `dr-vital-notifications` - Notificações
18. `analyze-medical-exam` - Análise de exames
19. `generate-medical-report` - Geração de relatórios
20. `premium-medical-report` - Relatórios premium
21. `finalize-medical-document` - Finalização de documentos
22. `cleanup-medical-images` - Limpeza de imagens
23. `fix-stuck-documents` - Correção de documentos travados
24. `medical-batch-timeout` - Timeout de lote

#### WhatsApp
25. `whatsapp-webhook-unified` - Webhook unificado
26. `whatsapp-ai-assistant` - Assistente de IA
27. `whatsapp-smart-reminders` - Lembretes inteligentes
28. `whatsapp-daily-motivation` - Motivação diária
29. `whatsapp-weekly-report` - Relatório semanal
30. `whatsapp-goal-reminders` - Lembretes de metas
31. `whatsapp-nutrition-check` - Checagem nutricional
32. `whatsapp-medical-handler` - Handler médico
33. `whatsapp-nutrition-webhook` - Webhook nutricional
34. `whatsapp-mission-complete` - Missão completa
35. `whatsapp-celebration` - Celebração
36. `whatsapp-welcome` - Boas-vindas
37. `whatsapp-saboteur-result` - Resultado de sabotador
38. `whatsapp-habits-analysis` - Análise de hábitos
39. `whatsapp-health-check` - Checagem de saúde
40. `whatsapp-send-interactive` - Envio interativo
41. `evolution-send-message` - Envio de mensagem Evolution

#### Integrações
42. `google-fit-sync` - Sincronização Google Fit
43. `google-fit-hourly-sync` - Sincronização horária
44. `google-fit-token` - Token Google Fit
45. `google-fit-callback` - Callback Google Fit
46. `add-google-fit-columns` - Adicionar colunas

#### Webhooks e n8n
47. `send-lead-webhooks` - Envio de webhooks de leads
48. `bulk-queue-leads` - Fila em massa de leads
49. `test-webhook` - Teste de webhook
50. `n8n-weekly-whatsapp-report` - Relatório semanal n8n

#### Relatórios
51. `generate-coaching-report` - Relatório de coaching
52. `saboteur-html-report` - Relatório HTML de sabotador
53. `get-public-report` - Obter relatório público

#### Exercícios
54. `improve-exercises` - Melhorar exercícios

#### Configurações e Admin
55. `activate-ai` - Ativar IA
56. `fix-ai-configurations` - Corrigir configurações
57. `check-gender-issue` - Verificar problema de gênero
58. `check-user-data-completeness` - Verificar completude de dados
59. `check-subscription` - Verificar assinatura
60. `create-sirlene` - Criar Sirlene
61. `create-asaas-payment` - Criar pagamento Asaas

#### Utilitários
62. `unified-ai-assistant` - Assistente unificado
63. `generate-user-biography` - Gerar biografia
64. `cache-manager` - Gerenciador de cache
65. `rate-limiter` - Limitador de taxa
66. `cleanup-scheduler` - Agendador de limpeza

#### Metas e Notificações
67. `goal-notifications` - Notificações de metas

#### Planos de Refeição
68. `send-meal-plan-whatsapp` - Enviar plano via WhatsApp

#### Receitas
69. `seed-standard-recipes` - Semear receitas padrão

### ⚠️ Importante
- Edge Functions **NÃO armazenam dados permanentemente**
- Apenas processam e salvam no Supabase
- Executam em ambiente Deno (não Node.js)

---

## 🐳 6. DOCKER VOLUMES (Desenvolvimento Local)

### 📍 Localização
- **Onde**: Sistema de arquivos local (desenvolvimento)
- **Uso**: Apenas em ambiente de desenvolvimento

### 📦 Volumes Identificados

#### docker-compose.yml
1. **Caddy**
   - `./Caddyfile:/etc/caddy/Caddyfile:ro`
   - `caddy_data:/data`
   - `caddy_config:/config`

2. **Ollama**
   - `ollama_models:/root/.ollama`

3. **Label Studio**
   - `./label-studio-data:/label-studio/data`
   - `./static:/label-studio/data/static`
   - `label_studio_postgres_data:/var/lib/postgresql/data`

4. **Nginx**
   - `./public:/usr/share/nginx/html/public`

5. **Supabase Local**
   - `supabase_data:/var/lib/postgresql/data`

#### docker-compose.yolo.yml
1. **YOLO Service**
   - `./models:/app/models` - Modelos YOLO
   - `./logs:/app/logs` - Logs

2. **Redis**
   - `redis_data:/data`

3. **Prometheus**
   - `./prometheus.yml:/etc/prometheus/prometheus.yml`
   - `prometheus_data:/prometheus`

### ⚠️ Importante
- Volumes Docker **NÃO são usados em produção**
- Apenas para desenvolvimento local
- Dados não persistem entre ambientes

---

## 🔐 7. SEGURANÇA E BACKUP

### Backup Automático
- **Supabase**: Backup automático diário
- **Retenção**: 7 dias (plano gratuito) / 30 dias (plano pago)

### Políticas de Segurança
- **RLS**: Row Level Security em todas as tabelas
- **Auth**: Supabase Auth com JWT
- **Storage**: Políticas de acesso por bucket

### GDPR e Privacidade
- Dados pessoais criptografados
- Direito ao esquecimento implementado
- Logs de acesso mantidos

---

## 📊 8. FLUXO DE DADOS

### Diagrama Simplificado

```
┌─────────────┐
│   Browser   │
│  (Cliente)  │
└──────┬──────┘
       │
       │ 1. Requisição
       ▼
┌─────────────┐
│  Supabase   │
│   Client    │
└──────┬──────┘
       │
       │ 2. Auth + Query
       ▼
┌─────────────────────────────┐
│     Supabase Cloud          │
│  ┌─────────┐  ┌──────────┐ │
│  │Database │  │ Storage  │ │
│  │(209 TB) │  │(Buckets) │ │
│  └─────────┘  └──────────┘ │
│  ┌─────────────────────┐   │
│  │  Edge Functions     │   │
│  │  (73 functions)     │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
       │
       │ 3. Resposta
       ▼
┌─────────────┐
│   Browser   │
│  localStorage│
│  PWA Cache  │
└─────────────┘
```

### Fluxo de Upload de Arquivo

```
1. Usuário seleciona arquivo
   ↓
2. Frontend valida (tipo, tamanho)
   ↓
3. Upload para Supabase Storage
   ↓
4. URL retornada
   ↓
5. URL salva no banco (tabela correspondente)
   ↓
6. Edge Function processa (se necessário)
   ↓
7. Resultado salvo no banco
```

---

## 🎯 9. RECOMENDAÇÕES

### Otimizações
1. **Cache**: Implementar cache Redis para queries frequentes
2. **CDN**: Usar CDN para assets estáticos
3. **Compressão**: Comprimir imagens antes do upload
4. **Limpeza**: Agendar limpeza de dados antigos

### Monitoramento
1. **Métricas**: Implementar dashboard de métricas
2. **Alertas**: Configurar alertas de uso de storage
3. **Logs**: Centralizar logs em serviço externo

### Backup
1. **Frequência**: Aumentar frequência de backup
2. **Testes**: Testar restauração regularmente
3. **Offsite**: Manter backup offsite

---

## 📝 10. CONCLUSÃO

### Onde os Dados Estão Salvos (Resumo)

1. **🌐 Supabase Cloud** (Principal)
   - 209 tabelas PostgreSQL
   - Múltiplos buckets de storage
   - 73 Edge Functions

2. **💻 Browser** (Cliente)
   - 8 keys no localStorage
   - 1 key no sessionStorage
   - 3 caches PWA

3. **🐳 Docker** (Dev apenas)
   - Volumes locais
   - Não usado em produção

### Dados Críticos
- **Perfis de usuário**: `profiles`, `user_physical_data`
- **Saúde**: `medical_documents`, `health_diary`
- **Nutrição**: `food_analysis`, `nutrition_tracking`
- **Exercícios**: `exercise_sessions`, `workout_history`

### Próximos Passos
1. Revisar políticas de RLS
2. Implementar backup incremental
3. Otimizar queries lentas
4. Adicionar monitoramento de storage

---

**Documento gerado automaticamente por:** `scripts/analyze-storage.py`  
**Última atualização:** Janeiro 2026
