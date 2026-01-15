# 🗺️ MAPA COMPLETO DE FUNCIONALIDADES - MaxNutrition

**Data da Análise:** Janeiro 2026  
**Projeto:** MaxNutrition (Instituto dos Sonhos)  
**Versão:** 0.0.0

---

## 📊 RESUMO EXECUTIVO

| Métrica | Quantidade |
|---------|------------|
| **Páginas** | 26 |
| **Componentes** | 400+ |
| **Hooks** | 120+ |
| **Edge Functions** | 90 |
| **Tabelas no Banco** | 209 |
| **Rotas** | 28 |

---

## 🎯 VISÃO GERAL DO SISTEMA

O MaxNutrition é uma plataforma completa de saúde e bem-estar que integra:

- **Sofia** - IA de nutrição e análise de alimentos
- **Dr. Vital** - IA de saúde e análise de exames médicos
- **Alex** - Personagem de exercícios físicos
- **Rafael** - Personagem de coaching mental

### Personagens e Funcionalidades

| Personagem | Foco | Funcionalidades Principais |
|------------|------|---------------------------|
| **Sofia** 🥗 | Nutrição | Análise de alimentos, cardápios, tracking nutricional |
| **Dr. Vital** 🩺 | Saúde | Análise de exames, relatórios médicos, monitoramento |
| **Alex** 💪 | Exercícios | Treinos, exercícios, progresso físico |
| **Rafael** 🧠 | Mental | Sessões, sabotadores, coaching |

---

## 👤 FUNCIONALIDADES DO USUÁRIO

### 1. Autenticação e Perfil

| Funcionalidade | Rota | Componente | Status |
|----------------|------|------------|--------|
| Login/Cadastro | `/auth` | `AuthPage.tsx` | ✅ Funcional |
| Auto Login | `/auto-login` | `AutoLoginPage.tsx` | ✅ Funcional |
| Perfil do Usuário | Modal | `UserProfile.tsx` | ✅ Funcional |
| Seleção de Personagem | Modal | `CharacterGate.tsx` | ✅ Funcional |
| Termos de Uso | `/terms`, `/termos` | `TermsPage.tsx` | ✅ Funcional |
| Privacidade | `/privacidade` | `TermsPage.tsx` | ✅ Funcional |

### 2. Dashboard Principal (Sofia)

| Funcionalidade | Seção | Componente | Status |
|----------------|-------|------------|--------|
| Dashboard Overview | `dashboard` | `DashboardOverview.tsx` | ✅ Funcional |
| Sofia Nutricional | `dashboard` | `SofiaNutricionalSection.tsx` | ✅ Funcional |
| Análise de Alimentos | Chat | `SofiaSimpleChat.tsx` | ✅ Funcional |
| Histórico de Refeições | Tab | `NutritionTracker.tsx` | ✅ Funcional |
| Insights Nutricionais | Tab | `SofiaNutritionInsights.tsx` | ✅ Funcional |

### 3. Nutrição (Sofia)

| Funcionalidade | Rota/Seção | Componente | Status |
|----------------|------------|------------|--------|
| Tracking Nutricional | `/nutricao` | `NutritionTrackingPage.tsx` | ✅ Funcional |
| Análise de Imagem | Chat | `sofia-image-analysis` (Edge) | ✅ Funcional |
| Cardápio 7 Dias | Tab | `CardapioEstruturado7D.tsx` | ✅ Funcional |
| Metas Nutricionais | Tab | `NutritionTracker.tsx` | ✅ Funcional |
| Favoritos | Tab | `nutrition_favorites` (DB) | ✅ Funcional |
| Histórico | Tab | `food_history` (DB) | ✅ Funcional |

### 4. Saúde (Dr. Vital)

| Funcionalidade | Rota/Seção | Componente | Status |
|----------------|------------|------------|--------|
| Chat Dr. Vital | `dr-vital` | `DrVitalEnhancedChat.tsx` | ✅ Funcional |
| Análise de Exames | Upload | `analyze-medical-exam` (Edge) | ✅ Funcional |
| Relatórios Médicos | Tab | `MedicalDocumentsSection.tsx` | ✅ Funcional |
| Relatório Semanal | Auto | `dr-vital-weekly-report` (Edge) | ✅ Funcional |
| Diário de Saúde | Tab | `health_diary` (DB) | ✅ Funcional |

### 5. Exercícios (Alex)

| Funcionalidade | Seção | Componente | Status |
|----------------|-------|------------|--------|
| Dashboard Exercícios | `exercicios` | `ExerciseDashboard.tsx` | ✅ Funcional |
| Onboarding Treino | Modal | `ExerciseOnboardingModal.tsx` | ✅ Funcional |
| Biblioteca de Exercícios | Tab | `exercises_library` (DB) | ✅ Funcional |
| Sessões de Treino | Tab | `exercise_sessions` (DB) | ✅ Funcional |
| Progresso | Tab | `exercise_progress_logs` (DB) | ✅ Funcional |
| Conquistas | Tab | `exercise_achievements` (DB) | ✅ Funcional |

### 6. Metas e Objetivos

| Funcionalidade | Rota/Seção | Componente | Status |
|----------------|------------|------------|--------|
| Página de Metas | `/app/goals` | `GoalsPageV2.tsx` | ✅ Funcional |
| Criar Meta | Modal | `CreateGoalDialog.tsx` | ✅ Funcional |
| Card de Meta | Lista | `ModernGoalCard.tsx` | ✅ Funcional |
| Estatísticas | Cards | `goal_stats` | ✅ Funcional |
| Streak de Metas | Badge | `goal_streaks` (DB) | ✅ Funcional |

### 7. Desafios e Gamificação

| Funcionalidade | Rota/Seção | Componente | Status |
|----------------|------------|------------|--------|
| Lista de Desafios | `/desafios`, `/challenges` | `ChallengesV2Page.tsx` | ✅ Funcional |
| Detalhe do Desafio | `/challenges/:id` | `ChallengeDetailPage.tsx` | ✅ Funcional |
| Dashboard Desafios | `challenges` | `ChallengesDashboard.tsx` | ✅ Funcional |
| Participações | Tab | `challenge_participations` (DB) | ✅ Funcional |
| Pontos e XP | Sistema | `user_gamification` (DB) | ✅ Funcional |

### 8. Missões Diárias

| Funcionalidade | Seção | Componente | Status |
|----------------|-------|------------|--------|
| Missões do Dia | `missions` | `DailyMissionsLight.tsx` | ✅ Funcional |
| Completar Missão | Ação | `user_missions` (DB) | ✅ Funcional |
| Recompensas | Sistema | `points_configuration` (DB) | ✅ Funcional |

### 9. Sessões (Rafael)

| Funcionalidade | Seção | Componente | Status |
|----------------|-------|------------|--------|
| Lista de Sessões | `sessions` | `UserSessionsCompact.tsx` | ✅ Funcional |
| Executar Sessão | Modal | `SessionPlayer.tsx` | ✅ Funcional |
| Respostas | Tab | `daily_responses` (DB) | ✅ Funcional |
| Teste de Sabotadores | `saboteur-test` | `SaboteurTest.tsx` | ✅ Funcional |

### 10. Cursos e Educação

| Funcionalidade | Rota/Seção | Componente | Status |
|----------------|------------|------------|--------|
| Plataforma de Cursos | `/app/courses` | `CoursePlatform.tsx` | ✅ Funcional |
| Netflix Style | Seção | `CoursePlatformNetflix.tsx` | ✅ Funcional |
| Módulos | Tab | `course_modules` (DB) | ✅ Funcional |
| Lições | Tab | `course_lessons` (DB) | ✅ Funcional |

### 11. Progresso e Tracking

| Funcionalidade | Rota/Seção | Componente | Status |
|----------------|------------|------------|--------|
| Meu Progresso | `/app/progress` | `ProgressPage.tsx` | ✅ Funcional |
| Gráficos | Tab | `MyProgress.tsx` | ✅ Funcional |
| Tracking Diário | Sistema | `advanced_daily_tracking` (DB) | ✅ Funcional |
| Pesagens | Tab | `weight_measurements` (DB) | ✅ Funcional |

### 12. Comunidade (Social)

| Funcionalidade | Seção | Componente | Status |
|----------------|-------|------------|--------|
| Feed de Saúde | `comunidade` | `HealthFeedPage.tsx` | ✅ Funcional |
| Posts | Tab | `health_feed_posts` (DB) | ✅ Funcional |
| Comentários | Tab | `health_feed_comments` (DB) | ✅ Funcional |
| Curtidas | Tab | `health_feed_likes` (DB) | ✅ Funcional |
| Mensagens Diretas | Modal | `DirectMessagesModal.tsx` | ✅ Funcional |
| Post Público | `/community/post/:postId` | `PublicPostPage.tsx` | ✅ Funcional |

### 13. Google Fit

| Funcionalidade | Rota | Componente | Status |
|----------------|------|------------|--------|
| Conexão OAuth | `/google-fit-oauth` | `GoogleFitPage.tsx` | ✅ Funcional |
| Callback | `/google-fit-callback` | `GoogleFitCallback.tsx` | ✅ Funcional |
| Dashboard Premium | `/google-fit-dashboard` | `GoogleFitPremiumDashboard.tsx` | ✅ Funcional |
| Teste | `/google-fit-test` | `GoogleFitTestPage.tsx` | ✅ Funcional |
| Sincronização | Edge | `google-fit-sync` | ✅ Funcional |

### 14. Anamnese

| Funcionalidade | Rota | Componente | Status |
|----------------|------|------------|--------|
| Anamnese Sistêmica | `/anamnesis` | `AnamnesisPage.tsx` | ✅ Funcional |
| Formulário | Tab | `SystemicAnamnesis.tsx` | ✅ Funcional |
| Dados | DB | `user_anamnesis` | ✅ Funcional |

### 15. Avaliação Profissional

| Funcionalidade | Rota | Componente | Status |
|----------------|------|------------|--------|
| Avaliação | `/professional-evaluation` | `ProfessionalEvaluationPage.tsx` | ✅ Funcional |
| Métricas | Tab | `professional_evaluations` (DB) | ✅ Funcional |
| Gráficos | Tab | `EvaluationComparison.tsx` | ✅ Funcional |

### 16. Assinaturas

| Funcionalidade | Seção | Componente | Status |
|----------------|-------|------------|--------|
| Planos | `subscriptions` | `PaymentPlans.tsx` | ✅ Funcional |
| Status | Tab | `SubscriptionStatus.tsx` | ✅ Funcional |
| Pagamento Asaas | Edge | `create-asaas-payment` | ✅ Funcional |

### 17. Relatórios Públicos

| Funcionalidade | Rota | Componente | Status |
|----------------|------|------------|--------|
| Relatório Público | `/relatorio/:token` | `PublicReport.tsx` | ✅ Funcional |
| Geração | Edge | `get-public-report` | ✅ Funcional |

### 18. PWA e Instalação

| Funcionalidade | Rota | Componente | Status |
|----------------|------|------------|--------|
| Página de Instalação | `/install` | `Install.tsx` | ✅ Funcional |
| Prompt de Instalação | Auto | `InstallPrompt.tsx` | ✅ Funcional |
| Atualização | Auto | `UpdatePrompt.tsx` | ✅ Funcional |
| Splash Screen | Auto | `SplashScreen.tsx` | ✅ Funcional |
| Offline Indicator | Auto | `OfflineIndicator.tsx` | ✅ Funcional |

---

## 🔧 FUNCIONALIDADES DO ADMIN

### Painel Administrativo (`/admin`)

| Funcionalidade | Seção | Componente | Status |
|----------------|-------|------------|--------|
| Dashboard Admin | `dashboard` | `AdminDashboard.tsx` | ✅ Funcional |
| Gestão de Usuários | `users` | `UserManagement.tsx` | ✅ Funcional |
| Monitoramento de Pesagens | `weighings` | `WeighingMonitoring.tsx` | ✅ Funcional |
| Gestão de Anamneses | `anamneses` | `AnamnesisManagement.tsx` | ✅ Funcional |
| Análises e Relatórios | `reports` | `AdvancedReports.tsx` | ✅ Funcional |
| Gestão de Cursos | `courses` | `CourseManagementNew.tsx` | ✅ Funcional |
| Capa da Plataforma | `platform-settings` | `PlatformSettingsPanel.tsx` | ✅ Funcional |
| Gestão de Exercícios | `exercises` | `ExerciseLibraryManagement.tsx` | ✅ Funcional |
| Gestão de Produtos | `products` | `ProductManagement.tsx` | ✅ Funcional |
| Gestão de Desafios | `challenges` | `ChallengeManagement.tsx` | ✅ Funcional |
| Configuração de XP | `xp-config` | `XPConfigPanel.tsx` | ✅ Funcional |
| Gestão de Pagamentos | `payments` | Integração Asaas | ✅ Funcional |
| Dados da Empresa | `company-config` | `CompanyConfiguration.tsx` | ✅ Funcional |
| Controle de IA | `ai-control` | `AIControlPanelUnified.tsx` | ✅ Funcional |
| Custos de IA | `ai-costs` | `AICostDashboard.tsx` | ✅ Funcional |
| Mealie (Cardápio) | `mealie` | Integração Externa | ✅ Funcional |
| Gestão de Sessões | `sessions` | `SessionManagement.tsx` | ✅ Funcional |
| WhatsApp Evolution | `whatsapp` | `WhatsAppManagement.tsx` | ✅ Funcional |
| Leads e Webhooks | `webhooks` | `WebhookManagement.tsx` | ✅ Funcional |
| Automação n8n | `n8n` | `N8nWebhookManager.tsx` | ✅ Funcional |
| Gestão de Dispositivos | `devices` | Integração Google Fit | ✅ Funcional |
| Documentos Médicos | `documents` | `MedicalDocumentsSection.tsx` | ✅ Funcional |
| Configurações | `settings` | Configurações Gerais | ✅ Funcional |
| Segurança e Auditoria | `security` | Logs de Segurança | ✅ Funcional |
| Suporte e Ajuda | `support` | Central de Suporte | ✅ Funcional |
| Backup e Manutenção | `backup` | Backup e Manutenção | ✅ Funcional |
| Status do Sistema | `system` | `SystemStatus.tsx` | ✅ Funcional |
| Admin Principal | `tests` | `SimulatedTests.tsx` | ✅ Funcional |
| Teste Sofia & Dr. Vital | `sofia` | `SofiaDataTestPanel.tsx` | ✅ Funcional |
| Tutoriais | `tutorials` | `TutorialDeviceConfig.tsx` | ✅ Funcional |

### System Health (`/admin/system-health`)

| Funcionalidade | Componente | Status |
|----------------|------------|--------|
| Saúde do Sistema | `SystemHealth.tsx` | ✅ Funcional |

---

## ⚡ EDGE FUNCTIONS (90 funções)

### Nutrição (Sofia)
| Função | Descrição | YOLO |
|--------|-----------|------|
| `sofia-image-analysis` | Análise de imagens de alimentos | ✅ Usa YOLO |
| `sofia-deterministic` | Análise determinística | ❌ |
| `sofia-enhanced-memory` | Memória aprimorada | ❌ |
| `sofia-text-analysis` | Análise de texto | ❌ |
| `food-analysis` | Análise de alimentos | ❌ |
| `confirm-food-analysis` | Confirmação de análise | ❌ |
| `enrich-food-data` | Enriquecimento de dados | ❌ |
| `enrich-sofia-analysis` | Enriquecimento de análise | ❌ |
| `nutrition-calc` | Cálculo nutricional | ❌ |
| `nutrition-calc-deterministic` | Cálculo determinístico | ❌ |
| `nutrition-ai-insights` | Insights de IA | ❌ |
| `nutrition-daily-summary` | Resumo diário | ❌ |
| `nutrition-planner` | Planejador | ❌ |
| `nutrition-alias-admin` | Admin de aliases | ❌ |
| `generate-meal-plan-taco` | Geração de cardápio TACO | ❌ |
| `mealie-real` | Integração Mealie | ❌ |
| `seed-standard-recipes` | Semear receitas | ❌ |

### Saúde (Dr. Vital)
| Função | Descrição | YOLO |
|--------|-----------|------|
| `dr-vital-chat` | Chat com Dr. Vital | ❌ |
| `dr-vital-enhanced` | Dr. Vital aprimorado | ❌ |
| `dr-vital-weekly-report` | Relatório semanal | ❌ |
| `dr-vital-notifications` | Notificações | ❌ |
| `analyze-medical-exam` | Análise de exames | ✅ Usa YOLO |
| `generate-medical-report` | Geração de relatórios | ❌ |
| `premium-medical-report` | Relatórios premium | ❌ |
| `finalize-medical-document` | Finalização de documentos | ❌ |
| `cleanup-medical-images` | Limpeza de imagens | ❌ |
| `fix-stuck-documents` | Correção de documentos | ❌ |
| `medical-batch-timeout` | Timeout de lote | ❌ |

### WhatsApp
| Função | Descrição |
|--------|-----------|
| `whatsapp-webhook-unified` | Webhook unificado |
| `whatsapp-ai-assistant` | Assistente de IA |
| `whatsapp-smart-reminders` | Lembretes inteligentes |
| `whatsapp-daily-motivation` | Motivação diária |
| `whatsapp-weekly-report` | Relatório semanal |
| `whatsapp-goal-reminders` | Lembretes de metas |
| `whatsapp-nutrition-check` | Checagem nutricional |
| `whatsapp-medical-handler` | Handler médico |
| `whatsapp-nutrition-webhook` | Webhook nutricional |
| `whatsapp-mission-complete` | Missão completa |
| `whatsapp-celebration` | Celebração |
| `whatsapp-welcome` | Boas-vindas |
| `whatsapp-saboteur-result` | Resultado de sabotador |
| `whatsapp-habits-analysis` | Análise de hábitos |
| `whatsapp-health-check` | Checagem de saúde |
| `whatsapp-send-interactive` | Envio interativo |
| `whatsapp-generate-template` | Geração de template |
| `whatsapp-test-interactive` | Teste interativo |
| `evolution-send-message` | Envio Evolution |

### Google Fit
| Função | Descrição |
|--------|-----------|
| `google-fit-sync` | Sincronização |
| `google-fit-hourly-sync` | Sincronização horária |
| `google-fit-token` | Token |
| `google-fit-callback` | Callback |
| `google-fit-ai-analysis` | Análise IA |
| `add-google-fit-columns` | Adicionar colunas |

### Webhooks e Integrações
| Função | Descrição |
|--------|-----------|
| `send-lead-webhooks` | Envio de webhooks |
| `bulk-queue-leads` | Fila em massa |
| `test-webhook` | Teste de webhook |
| `n8n-weekly-whatsapp-report` | Relatório n8n |

### Relatórios
| Função | Descrição |
|--------|-----------|
| `generate-coaching-report` | Relatório de coaching |
| `saboteur-html-report` | Relatório HTML |
| `get-public-report` | Relatório público |

### IA e Utilitários
| Função | Descrição |
|--------|-----------|
| `unified-ai-assistant` | Assistente unificado |
| `enhanced-gpt-chat` | Chat GPT aprimorado |
| `generate-ai-workout` | Treino IA |
| `generate-user-biography` | Biografia |
| `interpret-user-intent` | Interpretar intenção |
| `generate-human-message` | Mensagem humanizada |
| `vision-api` | API de visão |
| `detect-image-type` | Detectar tipo de imagem |

### Configurações e Admin
| Função | Descrição |
|--------|-----------|
| `activate-ai` | Ativar IA |
| `fix-ai-configurations` | Corrigir configurações |
| `check-gender-issue` | Verificar gênero |
| `check-user-data-completeness` | Verificar completude |
| `check-subscription` | Verificar assinatura |
| `create-sirlene` | Criar Sirlene |
| `create-asaas-payment` | Pagamento Asaas |
| `create-checkout` | Checkout |
| `customer-portal` | Portal do cliente |

### Utilitários
| Função | Descrição |
|--------|-----------|
| `cache-manager` | Gerenciador de cache |
| `rate-limiter` | Limitador de taxa |
| `cleanup-scheduler` | Agendador de limpeza |
| `send-email` | Envio de email |
| `repair-auth-metadata` | Reparar metadata |
| `improve-exercises` | Melhorar exercícios |
| `goal-notifications` | Notificações de metas |
| `send-meal-plan-whatsapp` | Enviar cardápio |

### Correções e Manutenção
| Função | Descrição |
|--------|-----------|
| `fix-handle-new-user` | Corrigir novo usuário |
| `fix-storage` | Corrigir storage |
| `fix-storage-rls` | Corrigir RLS |
| `apply-robust-base` | Aplicar base robusta |

---

## 🗄️ INTEGRAÇÕES E DEPENDÊNCIAS

### Serviços Externos

| Serviço | Uso | Status |
|---------|-----|--------|
| **Supabase** | Banco de dados, Auth, Storage, Edge Functions | ✅ Ativo |
| **YOLO Service** | Detecção de objetos em imagens | ✅ Ativo |
| **Google Gemini** | IA para análise de alimentos e exames | ✅ Ativo |
| **OpenAI GPT** | IA para chat e análises | ✅ Ativo |
| **Google Fit** | Dados de atividade física | ✅ Ativo |
| **Asaas** | Gateway de pagamentos | ✅ Ativo |
| **Evolution API** | WhatsApp Business | ✅ Ativo |
| **n8n** | Automação de workflows | ✅ Ativo |
| **Mealie** | Gestão de receitas | ✅ Ativo |

### YOLO Service (CRÍTICO)

```
URL: https://yolo-service-yolo-detection.0sw627.easypanel.host
Status: ESSENCIAL - NUNCA DESCONECTAR
```

**Fluxo obrigatório:**
1. 📸 Imagem recebida
2. 🦾 YOLO detecta objetos (PRIMEIRO)
3. 🤖 Gemini refina com contexto YOLO
4. 📊 Resultado final

---

## ⚠️ FUNCIONALIDADES FALTANDO OU QUEBRADAS

### Identificadas na Análise

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Balanças Xiaomi | ⚠️ Parcial | Integração Bluetooth não finalizada |
| Wearables | ⚠️ Parcial | Apenas Google Fit funcional |
| Backup Offsite | ❌ Faltando | Apenas backup Supabase |
| Monitoramento de Métricas | ⚠️ Parcial | Dashboard básico |

### Erros Conhecidos (do diagnóstico anterior)

- 57 erros ESLint (maioria `any` types)
- 1555 warnings ESLint
- 7 arquivos com `@ts-nocheck`
- 10 empty catch blocks

---

## ✅ CHECKLIST DE TESTES

### Fluxos Críticos

- [ ] Login/Cadastro
- [ ] Seleção de Personagem
- [ ] Análise de Alimentos (Sofia + YOLO)
- [ ] Análise de Exames (Dr. Vital + YOLO)
- [ ] Criação de Metas
- [ ] Participação em Desafios
- [ ] Completar Missões
- [ ] Sincronização Google Fit
- [ ] Pagamento Asaas
- [ ] WhatsApp Webhook

### Fluxos Secundários

- [ ] Cursos e Lições
- [ ] Sessões de Coaching
- [ ] Teste de Sabotadores
- [ ] Comunidade (Posts/Comentários)
- [ ] Mensagens Diretas
- [ ] Relatórios Públicos
- [ ] PWA Instalação

---

## 📁 ESTRUTURA DE ARQUIVOS ANALISADOS

```
src/
├── pages/           → 26 páginas
├── components/      → 400+ componentes em 45+ pastas
├── hooks/           → 120+ hooks
├── contexts/        → Contextos React
├── integrations/    → Supabase client
└── lib/             → Utilitários

supabase/
├── functions/       → 90 Edge Functions
└── migrations/      → Migrações SQL
```

---

## 📊 ESTATÍSTICAS FINAIS

| Categoria | Quantidade |
|-----------|------------|
| Arquivos Analisados | 500+ |
| Páginas | 26 |
| Componentes | 400+ |
| Hooks | 120+ |
| Edge Functions | 90 |
| Tabelas no Banco | 209 |
| Rotas | 28 |
| Integrações Externas | 9 |

---

**Documento gerado por:** Análise Completa do Sistema  
**Última atualização:** Janeiro 2026
