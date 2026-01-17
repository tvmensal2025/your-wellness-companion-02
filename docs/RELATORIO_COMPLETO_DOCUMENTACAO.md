# 📚 Relatório Completo da Documentação - MaxNutrition

> **Gerado em:** 2026-01-16  
> **Projeto:** Instituto dos Sonhos - MaxNutrition  
> **Análise:** Documentação completa via Python

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Documentos Analisados** | 16 |
| **Total de Linhas** | 9,244 |
| **Tamanho Total** | 220.32 KB |
| **Palavras Totais** | ~26,000 |
| **Tabelas no Banco** | 53 |
| **Edge Functions** | 27 |
| **Componentes UI** | 742 |
| **Hooks Customizados** | 165 |
| **Páginas** | 27 |

---

## 🏗️ Stack Tecnológica

### Frontend
- **Framework:** React 18.3.1 + TypeScript 5.5.3
- **Build Tool:** Vite 5.4.1
- **Styling:** Tailwind CSS 3.4.11
- **UI Components:** Radix UI (50+ componentes)
- **State Management:** React Query (TanStack Query 5.56.2)
- **Forms:** React Hook Form 7.53.0 + Zod 3.23.8
- **Icons:** Lucide React 0.462.0
- **Animation:** Framer Motion 12.23.9
- **Charts:** Recharts 3.1.0 + ApexCharts 5.3.2

### Backend
- **BaaS:** Supabase (PostgreSQL + Edge Functions)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (8 buckets)
- **Real-time:** Supabase Realtime

### IA & ML
- **YOLO:** Detecção de objetos em imagens (alimentos)
- **Gemini:** Análise contextual e interpretação
- **Sofia:** IA Nutricionista (YOLO + Gemini)
- **Dr. Vital:** IA Médica (OCR + Gemini)

### Mobile
- **Capacitor:** 8.0.0 (iOS + Android)
- **PWA:** Vite Plugin PWA 1.2.0

---

## 📁 Estrutura do Projeto

### Diretórios Principais

```
maxnutrition/
├── docs/                    # 48 arquivos de documentação
├── public/                  # Assets públicos + PWA
├── src/
│   ├── components/          # 742 componentes React
│   ├── hooks/              # 165 hooks customizados
│   ├── pages/              # 27 páginas
│   ├── integrations/       # Supabase client
│   ├── lib/                # Utilitários
│   ├── services/           # Serviços
│   ├── types/              # TypeScript types
│   └── utils/              # Funções auxiliares
├── supabase/
│   ├── functions/          # 89 Edge Functions
│   └── migrations/         # SQL migrations
└── [config files]
```

### Componentes por Categoria

| Categoria | Quantidade | Descrição |
|-----------|------------|-----------|
| **UI Base** | 50+ | Componentes shadcn/ui (Button, Card, Dialog, etc) |
| **Admin** | 15+ | Painel administrativo e gestão |
| **Sofia** | 20+ | IA Nutricionista |
| **Dr. Vital** | 15+ | IA Médica |
| **Gamificação** | 25+ | Pontos, XP, badges, desafios |
| **Nutrição** | 40+ | Tracking, análise, planos alimentares |
| **Exercícios** | 30+ | Biblioteca, programas, timer |
| **Comunidade** | 20+ | Feed social, posts, stories |
| **Navegação** | 10+ | Sidebar, bottom nav, breadcrumbs |
| **Mobile** | 15+ | Componentes mobile-first |

---

## 💾 Banco de Dados

### Tabelas por Categoria

#### 1. Usuários e Perfis (8 tabelas)
- `profiles` - Perfil principal
- `user_anamnesis` - Anamnese médica
- `user_preferences` - Preferências
- `user_physical_data` - Dados físicos
- `user_roles` - Papéis/permissões
- `user_conversations` - Histórico de conversas
- `user_supplements` - Suplementos
- `company_configurations` - Configurações empresa

#### 2. Gamificação (10 tabelas)
- `user_points` - Pontos e XP
- `challenges` - Definição de desafios
- `challenge_participations` - Participações
- `flash_challenges` - Desafios relâmpago
- `daily_mission_sessions` - Missões diárias
- `user_achievements` - Conquistas
- `user_achievements_v2` - Conquistas v2
- `goal_updates` - Atualizações de metas
- `user_goals` - Metas do usuário
- `daily_responses` - Respostas diárias

#### 3. Nutrição e Sofia (12 tabelas)
- `food_history` - Histórico de refeições
- `food_analysis` - Análises de IA
- `sofia_memory` - Memória contextual
- `sofia_learning` - Aprendizado
- `meal_plans` - Planos alimentares
- `nutrition_tracking` - Tracking diário
- `nutrition_foods` - Base de alimentos
- `nutrition_aliases` - Aliases de alimentos
- `water_tracking` - Hidratação
- `base_de_conhecimento_sofia` - Base de conhecimento

#### 4. Saúde e Médico (10 tabelas)
- `medical_exam_analyses` - Análises de exames
- `medical_documents` - Documentos médicos
- `google_fit_data` - Dados Google Fit
- `google_fit_tokens` - Tokens OAuth
- `health_diary` - Diário de saúde
- `advanced_daily_tracking` - Tracking avançado
- `weight_measurements` - Medições de peso
- `sleep_tracking` - Monitoramento de sono
- `mood_tracking` - Monitoramento de humor
- `heart_rate_data` - Frequência cardíaca
- `dr_vital_memory` - Memória Dr. Vital

#### 5. Exercícios (5 tabelas)
- `exercises_library` - Biblioteca de exercícios
- `exercise_tracking` - Registro de exercícios
- `saved_workout_programs` - Programas salvos
- `workout_plans` - Planos de treino
- `course_modules` - Módulos de cursos
- `lesson_progress` - Progresso nas aulas

#### 6. Social/Comunidade (6 tabelas)
- `health_feed_posts` - Posts do feed
- `health_feed_stories` - Stories
- `health_feed_follows` - Seguidores
- `health_feed_reactions` - Reações
- `community_posts` - Posts da comunidade
- `conversation_messages` - Mensagens

#### 7. Configurações e Admin (3 tabelas)
- `ai_configurations` - Configurações de IA
- `admin_logs` - Logs administrativos
- `chat_conversations` - Conversas de chat

#### 8. Cache e Logs (3 tabelas)
- `analysis_cache` - Cache de análises
- `ai_response_cache` - Cache de respostas IA
- `ai_usage_logs` - Logs de uso de IA

### Principais Colunas por Tabela

#### `profiles`
```sql
id, user_id, full_name, avatar_url, gender, birth_date, 
height_cm, weight_kg, target_weight_kg, activity_level,
dietary_preference, health_goals[], onboarding_completed,
is_admin, subscription_status, subscription_tier
```

#### `user_points`
```sql
user_id, total_points, xp_total, level, current_streak,
longest_streak, last_activity_date, weekly_points, monthly_points
```

#### `food_history`
```sql
user_id, meal_date, meal_type, meal_time, food_items (jsonb),
total_calories, total_proteins, total_carbs, total_fats,
photo_url, ai_analysis, confidence_score, source
```

#### `medical_exam_analyses`
```sql
user_id, exam_type, exam_date, file_url, extracted_text,
extracted_data (jsonb), ai_interpretation, health_indicators (jsonb),
recommendations[], risk_level, processing_status
```

---

## ⚡ Edge Functions (27 funções)

### Nutrição e Sofia
1. **sofia-image-analysis** - Análise de imagens (YOLO + Gemini)
2. **food-analysis** - Análise nutricional de texto
3. **nutrition-calc** - Cálculo nutricional determinístico
4. **nutrition-daily-summary** - Resumo diário
5. **generate-meal-plan-taco** - Geração de cardápio (Tabela TACO)
6. **nutrition-planner** - Planejador nutricional
7. **enrich-food-data** - Enriquecimento de dados

### Saúde e Dr. Vital
8. **analyze-medical-exam** - Análise de exames (OCR + IA)
9. **dr-vital-chat** - Chat com Dr. Vital
10. **dr-vital-weekly-report** - Relatório semanal
11. **generate-medical-pdf** - Geração de PDF médico
12. **generate-medical-report** - Relatório médico completo
13. **premium-medical-report** - Relatório premium

### Google Fit
14. **google-fit-sync** - Sincronização de dados
15. **google-fit-callback** - Callback OAuth
16. **google-fit-token** - Gerenciamento de tokens
17. **google-fit-ai-analysis** - Análise IA dos dados

### WhatsApp
18. **whatsapp-webhook-unified** - Webhook unificado
19. **whatsapp-weekly-report** - Relatório semanal
20. **whatsapp-daily-motivation** - Motivação diária
21. **whatsapp-goal-reminders** - Lembretes de metas

### Utilitários
22. **send-email** - Envio de emails (Resend)
23. **goal-notifications** - Notificações de metas
24. **media-upload** - Upload de mídia
25. **cache-manager** - Gerenciamento de cache
26. **rate-limiter** - Rate limiting
27. **detect-image-type** - Detecção de tipo de imagem

---

## 🪝 Hooks Customizados (165 hooks)

### Por Categoria

#### Autenticação (5 hooks)
- `useAuth` - Autenticação principal
- `useAutoAuth` - Login automático
- `useGoogleAuth` - OAuth Google
- `useAdminMode` - Modo admin
- `useAdminPermissions` - Permissões admin

#### Dados e State (40+ hooks)
- `useQuery` / `useMutation` - React Query
- `useNutritionData` - Dados nutricionais
- `useGoogleFitData` - Dados Google Fit
- `useTrackingData` - Dados de tracking
- `useHealthData` - Dados de saúde
- `useUserProfile` - Perfil do usuário
- `usePhysicalData` - Dados físicos
- `useProgressData` - Dados de progresso

#### Gamificação (15+ hooks)
- `useGamificationUnified` - Gamificação unificada
- `useUserPoints` - Pontos do usuário
- `useUserXP` - XP e níveis
- `useRealRanking` - Ranking real
- `useChallenges` - Desafios
- `useDailyMissions` - Missões diárias
- `useUserStreak` - Streaks
- `useGoals` - Metas
- `useGoalsGamification` - Gamificação de metas

#### IA e Análise (10+ hooks)
- `useSofiaAnalysis` - Análise Sofia
- `useSofiaIntegration` - Integração Sofia
- `useFoodAnalysis` - Análise de alimentos
- `useAIConfig` - Configuração de IA
- `useExerciseAI` - IA de exercícios

#### UI e UX (20+ hooks)
- `useToast` - Notificações toast
- `useTheme` - Tema (dark/light)
- `useMobile` - Detecção mobile
- `useReducedMotion` - Acessibilidade
- `useSafeAnimation` - Animações seguras
- `useSwipeGesture` - Gestures de swipe
- `useLongPress` - Long press

#### Comunidade (10+ hooks)
- `useFeedPosts` - Posts do feed
- `useStories` - Stories
- `useFollow` - Seguir/deixar de seguir
- `useDirectMessages` - Mensagens diretas
- `useCommunityProfile` - Perfil na comunidade
- `usePolls` - Enquetes

---

## 🤖 Sistemas de IA

### 1. Sofia - Nutricionista Virtual

**Tecnologias:**
- YOLO v11 (detecção de objetos)
- Google Gemini (análise contextual)
- Tabela TACO (base nutricional brasileira)

**Capacidades:**
- Análise de fotos de alimentos
- Cálculo nutricional automático
- Geração de planos alimentares
- Sugestões personalizadas
- Memória contextual do usuário
- Aprendizado contínuo

**Fluxo de Análise:**
```
1. Foto → YOLO detecta objetos (0.8s)
2. YOLO → Gemini refina análise (1.5s)
3. Gemini → Cálculo nutricional (0.5s)
4. Total: ~2.8s (vs 8s sem YOLO)
```

**Redução de Custos:**
- 90% menos chamadas ao Gemini
- 10x mais rápido
- Maior precisão

### 2. Dr. Vital - IA Médica

**Tecnologias:**
- OCR (extração de texto)
- Google Gemini (interpretação)
- Análise de indicadores de saúde

**Capacidades:**
- Análise de exames médicos
- Interpretação humanizada
- Identificação de riscos
- Recomendações personalizadas
- Relatórios em PDF
- Histórico de exames

**Tipos de Exames Suportados:**
- Hemograma completo
- Perfil lipídico
- Glicemia
- Função hepática
- Função renal
- Hormônios
- Vitaminas

### 3. YOLO Service

**URL:** `yolo-service-yolo-detection.0sw627.easypanel.host`

**Modelo:** YOLOv11 Segmentation

**Funcionalidades:**
- Detecção de alimentos em imagens
- Segmentação de objetos
- Confiança de detecção
- Bounding boxes
- Classes detectadas

**Performance:**
- Tempo médio: 0.8s
- Precisão: 85-95%
- Suporta múltiplos objetos

---

## 🎮 Sistema de Gamificação

### Elementos

#### Pontos e XP
- **Pontos:** Moeda do sistema
- **XP:** Experiência para níveis
- **Níveis:** 1-100+
- **Streaks:** Dias consecutivos

#### Desafios
- **Regulares:** Duração longa (semanas/meses)
- **Flash:** Curta duração (horas/dias)
- **Diários:** Missões diárias
- **Semanais:** Metas semanais

#### Conquistas
- **Categorias:** Nutrição, Exercício, Social, Saúde
- **Raridades:** Comum, Raro, Épico, Lendário
- **Badges:** Distintivos visuais

#### Ranking
- **Global:** Todos os usuários
- **Semanal:** Reset semanal
- **Mensal:** Reset mensal
- **Amigos:** Entre seguidores

### Ações que Geram Pontos

| Ação | Pontos | XP |
|------|--------|-----|
| Login diário | 10 | 5 |
| Registrar refeição | 20 | 10 |
| Completar treino | 50 | 25 |
| Atingir meta de água | 15 | 8 |
| Completar desafio | 100-500 | 50-250 |
| Streak de 7 dias | 100 | 50 |
| Post na comunidade | 30 | 15 |
| Ajudar outro usuário | 25 | 12 |

---

## 🌐 Variáveis de Ambiente

### Obrigatórias

```bash
# Supabase
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[key]
VITE_SUPABASE_PROJECT_ID=[id]

# App
VITE_APP_NAME=MaxNutrition
VITE_APP_URL=https://[domain]

# Sentry (Monitoramento)
VITE_SENTRY_DSN=[dsn]
```

### Opcionais

```bash
# Debug
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false

# Features
VITE_ENABLE_GOOGLE_FIT=true
VITE_ENABLE_WHATSAPP=true
VITE_ENABLE_YOLO=true
```

---

## 📱 PWA (Progressive Web App)

### Configuração

**Manifest:**
- Nome: MaxNutrition
- Cor tema: #10b981 (verde)
- Cor fundo: #0f172a (escuro)
- Display: standalone
- Orientação: portrait

**Ícones:**
- 192x192 (any)
- 512x512 (any)
- 512x512 (maskable)

**Service Worker:**
- Cache de assets estáticos
- Cache de imagens
- Cache de fontes
- Cache de API (Supabase)
- Offline fallback

**Tamanho do Cache:**
- Máximo por arquivo: 5 MB
- Imagens: 60 arquivos, 30 dias
- Fontes: 20 arquivos, 365 dias
- API: 100 entradas, 24 horas

---

## 🚀 Deploy

### Ambientes

1. **Desenvolvimento**
   - URL: localhost:8080
   - Build: `npm run dev`
   - Hot reload ativo

2. **Staging**
   - URL: staging.maxnutrition.com
   - Build: `npm run build:dev`
   - Testes de integração

3. **Produção**
   - URL: app.maxnutrition.com
   - Build: `npm run build:prod`
   - Otimizações ativas

### Processo de Deploy

```bash
# 1. Build
npm run build:prod

# 2. Preview local
npm run preview

# 3. Deploy (via CI/CD ou manual)
# - MaxNutrition Cloud (automático)
# - Vercel / Netlify (manual)
# - Docker (VPS)
```

### Otimizações de Build

- **Code Splitting:** Chunks por vendor
- **Tree Shaking:** Remoção de código não usado
- **Minificação:** esbuild
- **CSS:** Minificado e code-split
- **Images:** Lazy loading
- **Fonts:** Preload

---

## 📊 Métricas de Performance

### Bundle Size (estimado)

| Chunk | Tamanho |
|-------|---------|
| vendor-react | ~150 KB |
| vendor-ui | ~200 KB |
| vendor-charts | ~180 KB |
| vendor-supabase | ~100 KB |
| app | ~300 KB |
| **Total** | **~930 KB** |

### Lighthouse Score (alvo)

- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 100
- **PWA:** 100

---

## 🔒 Segurança

### Row Level Security (RLS)

- **200+ políticas** ativas
- Isolamento por usuário
- Permissões granulares
- Admin bypass controlado

### Autenticação

- **Supabase Auth**
- Email + Senha
- OAuth (Google)
- Magic Links
- JWT tokens

### Storage

- **8 buckets** configurados
- Políticas de acesso por bucket
- Upload limitado por tamanho
- Tipos de arquivo validados

---

## 📈 Roadmap

### Próximas Features

1. **IA Avançada**
   - Análise de vídeos de exercícios
   - Reconhecimento de voz
   - Chatbot multimodal

2. **Integrações**
   - Apple Health
   - Fitbit
   - Garmin
   - MyFitnessPal

3. **Social**
   - Grupos privados
   - Desafios em equipe
   - Live streaming
   - Marketplace de receitas

4. **Premium**
   - Consultas com nutricionistas
   - Planos personalizados
   - Relatórios avançados
   - Suporte prioritário

---

## 📚 Documentos Analisados

### Alta Prioridade (7 docs)
1. ✅ 01_ESTRUTURA_PROJETO.md (442 linhas)
2. ✅ 02_DATABASE_SCHEMA.md (841 linhas)
3. ✅ 03_COMPONENTS_CATALOG.md (749 linhas)
4. ✅ 05_EDGE_FUNCTIONS.md (853 linhas)
5. ✅ 07_AI_SYSTEMS.md (624 linhas)
6. ✅ DATABASE_SCHEMA.md (1,182 linhas)
7. ✅ AI_SYSTEMS.md (489 linhas)

### Média Prioridade (3 docs)
8. ✅ 04_HOOKS_REFERENCE.md (920 linhas)
9. ✅ 06_NAVIGATION_FLOWS.md (422 linhas)
10. ✅ 08_GAMIFICATION.md (635 linhas)

### Baixa Prioridade (6 docs)
11. ✅ 09_ENVIRONMENT_VARS.md (284 linhas)
12. ✅ 10_DEPLOY_GUIDE.md (439 linhas)
13. ✅ ARCHITECTURE.md (86 linhas)
14. ✅ QUICK_REFERENCE.md (277 linhas)
15. ✅ COMMON_ERRORS.md (480 linhas)
16. ✅ YOLO_INTEGRACAO_COMPLETA.md (521 linhas)

---

## 🎯 Conclusão

O **MaxNutrition** é uma plataforma robusta e completa de saúde e nutrição, com:

✅ **Arquitetura moderna** (React + TypeScript + Supabase)  
✅ **IA avançada** (YOLO + Gemini)  
✅ **Gamificação completa** (pontos, desafios, conquistas)  
✅ **Social integrado** (feed, stories, ranking)  
✅ **Mobile-first** (PWA + Capacitor)  
✅ **Documentação extensa** (9,244 linhas)  
✅ **Escalável** (200+ RLS policies, 89 edge functions)  

**Total de código estimado:** 100,000+ linhas  
**Tempo de desenvolvimento:** 6-12 meses (equipe de 3-5 devs)  
**Complexidade:** Alta (sistema enterprise)

---

*Relatório gerado automaticamente via Python*  
*Análise completa da documentação do projeto MaxNutrition*
