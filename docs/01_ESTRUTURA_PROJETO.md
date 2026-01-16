# 📁 Estrutura do Projeto MaxNutrition

> Documentação gerada em: 2026-01-16
> Última atualização: Manual

---

## 📊 Visão Geral

| Métrica | Valor |
|---------|-------|
| **Total de Arquivos** | 1,114+ |
| **Arquivos TypeScript (.ts)** | 362 |
| **Arquivos React (.tsx)** | 746 |
| **Componentes React** | 742 |
| **Hooks Customizados** | 165 |
| **Edge Functions** | 89 |
| **Páginas** | 27 |
| **Tabelas no Banco** | 130+ |

---

## 🌳 Árvore de Diretórios Principal

```
maxnutrition/
├── 📁 docs/                          # Documentação do projeto
│   ├── ADRs/                         # Architecture Decision Records
│   ├── AI_SYSTEMS.md                 # Sistema de IA
│   ├── ARCHITECTURE.md               # Arquitetura geral
│   ├── DATABASE_SCHEMA.md            # Schema do banco
│   ├── EDGE_FUNCTIONS_CATALOG.md     # Catálogo de funções
│   └── ... (48 arquivos)
│
├── 📁 public/                        # Assets públicos
│   ├── icons/                        # Ícones PWA
│   ├── manifest.json                 # PWA manifest
│   └── favicon.ico
│
├── 📁 src/                           # Código fonte principal
│   ├── 📁 assets/                    # Assets estáticos
│   ├── 📁 components/                # Componentes React (742)
│   ├── 📁 contexts/                  # React Contexts
│   ├── 📁 hooks/                     # Hooks customizados (165)
│   ├── 📁 integrations/              # Integrações externas
│   ├── 📁 lib/                       # Utilitários
│   ├── 📁 pages/                     # Páginas da aplicação (27)
│   ├── 📁 services/                  # Serviços
│   ├── 📁 types/                     # Definições TypeScript
│   ├── 📁 utils/                     # Funções utilitárias
│   ├── App.tsx                       # Componente raiz
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Estilos globais
│
├── 📁 supabase/                      # Backend Supabase
│   ├── 📁 functions/                 # Edge Functions (89)
│   ├── 📁 migrations/                # Migrations SQL
│   └── config.toml                   # Configuração Supabase
│
├── 📄 package.json                   # Dependências
├── 📄 vite.config.ts                 # Configuração Vite
├── 📄 tailwind.config.ts             # Configuração Tailwind
├── 📄 tsconfig.json                  # Configuração TypeScript
└── 📄 capacitor.config.ts            # Configuração Capacitor (mobile)
```

---

## 📁 src/components/ - Componentes React

```
src/components/
├── 📁 abundance/                # Mapeamento de abundância
├── 📁 admin/                    # Painel administrativo
│   ├── AIConfigPanel.tsx
│   ├── AdminDashboard.tsx
│   ├── UserManagement.tsx
│   └── SystemHealth.tsx
│
├── 📁 analysis/                 # Componentes de análise
├── 📁 branding/                 # Elementos de marca
├── 📁 camera-workout/           # Exercícios com câmera
├── 📁 cardio/                   # Treinos cardio
├── 📁 challenges-v2/            # Sistema de desafios v2
├── 📁 character-selector/       # Seletor de personagem
├── 📁 charts/                   # Gráficos e visualizações
├── 📁 chat/                     # Chat genérico
├── 📁 common/                   # Componentes compartilhados
├── 📁 community/                # Funcionalidades sociais
├── 📁 competency/               # Sistema de competências
├── 📁 daily-missions/           # Missões diárias
├── 📁 dashboard/                # Dashboard principal
│   ├── DashboardHeader.tsx
│   ├── QuickActions.tsx
│   ├── StatsCards.tsx
│   └── HealthScore.tsx
│
├── 📁 dr-vital/                 # Dr. Vital (IA médica)
│   ├── DrVitalChat.tsx
│   ├── ExamAnalysis.tsx
│   ├── ExamHistory.tsx
│   └── ReportGenerator.tsx
│
├── 📁 evaluation/               # Avaliações
├── 📁 exercise/                 # Sistema de exercícios
│   ├── saved-program/           # Programas salvos
│   ├── unified-timer/           # Timer unificado
│   ├── workout/                 # Treino ativo
│   ├── ExerciseLibrary.tsx
│   └── ExerciseCard.tsx
│
├── 📁 gamification/             # Sistema de gamificação
│   ├── BadgeSystem.tsx
│   ├── LevelProgress.tsx
│   ├── PointsDisplay.tsx
│   ├── StreakCounter.tsx
│   └── XPBar.tsx
│
├── 📁 goals/                    # Sistema de metas
├── 📁 google-fit/               # Integração Google Fit
├── 📁 health-feed/              # Feed de saúde social
├── 📁 meal-plan/                # Planejamento de refeições
├── 📁 medical/                  # Componentes médicos
├── 📁 mobile/                   # Componentes mobile-first
├── 📁 navigation/               # Navegação
│   ├── BottomNavigation.tsx
│   ├── MobileHeader.tsx
│   └── Breadcrumbs.tsx
│
├── 📁 nutrition-tracking/       # Tracking nutricional
├── 📁 nutrition/                # Nutrição geral
├── 📁 onboarding/               # Fluxo de onboarding
├── 📁 production/               # Componentes de produção
├── 📁 profile/                  # Perfil do usuário
├── 📁 progress/                 # Progresso e evolução
├── 📁 pwa/                      # PWA específicos
├── 📁 ranking/                  # Sistema de ranking
├── 📁 saboteur-test/            # Teste do sabotador
├── 📁 session-tools/            # Ferramentas de sessão
├── 📁 sessions/                 # Gerenciamento de sessões
├── 📁 settings/                 # Configurações
├── 📁 shared/                   # Componentes compartilhados
├── 📁 sidebar/                  # Sidebar lateral
├── 📁 sofia/                    # Sofia (IA nutricionista)
│   ├── SofiaChat.tsx
│   ├── SofiaImageAnalysis.tsx
│   ├── SofiaFoodHistory.tsx
│   └── SofiaSuggestions.tsx
│
├── 📁 theme/                    # Tema e estilização
├── 📁 tracking/                 # Tracking geral
├── 📁 ui/                       # UI Base (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── ... (50+ componentes)
│
├── 📁 user-history/             # Histórico do usuário
├── 📁 user/                     # Componentes de usuário
├── 📁 weekly-report/            # Relatório semanal
├── 📁 weighing/                 # Pesagem
├── 📁 wheel/                    # Roda de escolhas
│
└── 📄 [Componentes standalone]  # ~60 arquivos na raiz
    ├── Dashboard.tsx
    ├── AuthGuard.tsx
    ├── OnboardingFlow.tsx
    └── ...
```

---

## 📁 src/hooks/ - Hooks Customizados

```
src/hooks/
├── 📁 __tests__/                # Testes de hooks
├── 📁 camera-workout/           # Hooks de câmera
├── 📁 cardio/                   # Hooks de cardio
├── 📁 challenges/               # Hooks de desafios
├── 📁 community/                # Hooks da comunidade
├── 📁 core/                     # Hooks fundamentais
├── 📁 dr-vital/                 # Hooks do Dr. Vital
├── 📁 exercise/                 # Hooks de exercícios
├── 📁 gamification/             # Hooks de gamificação
│
├── 📄 useAuth.ts                # Autenticação
├── 📄 useAdminMode.ts           # Modo admin
├── 📄 useAdminPermissions.ts    # Permissões admin
├── 📄 useUserProfile.ts         # Perfil do usuário
├── 📄 useGamificationUnified.ts # Gamificação unificada
├── 📄 useRealRanking.ts         # Ranking real
├── 📄 useChallenges.ts          # Desafios
├── 📄 useSofiaAnalysis.ts       # Análise Sofia
├── 📄 useNutritionData.ts       # Dados nutricionais
├── 📄 useGoogleFitData.ts       # Dados Google Fit
├── 📄 useTrackingData.ts        # Dados de tracking
├── 📄 useDailyMissions.ts       # Missões diárias
├── 📄 useExerciseProgram.ts     # Programa de exercícios
├── 📄 useHealthScore.ts         # Score de saúde
└── 📄 ... (130+ hooks)
```

---

## 📁 src/pages/ - Páginas da Aplicação

```
src/pages/
├── 📁 admin/                    # Páginas administrativas
│   ├── AdminDashboardPage.tsx
│   ├── AIConfigPage.tsx
│   ├── SystemHealthPage.tsx
│   └── UserManagementPage.tsx
│
├── 📄 AdminPage.tsx             # Painel admin principal
├── 📄 AnamnesisPage.tsx         # Anamnese
├── 📄 AuthPage.tsx              # Autenticação
├── 📄 AutoLoginPage.tsx         # Login automático
├── 📄 ChallengeDetailPage.tsx   # Detalhe de desafio
├── 📄 ChallengesV2Page.tsx      # Desafios v2
├── 📄 DrVitalEnhancedPage.tsx   # Dr. Vital melhorado
├── 📄 GoalsPage.tsx             # Metas
├── 📄 GoalsPageV2.tsx           # Metas v2
├── 📄 GoogleFitCallback.tsx     # Callback OAuth
├── 📄 GoogleFitPage.tsx         # Google Fit
├── 📄 GoogleFitPremiumDashboard.tsx # Dashboard premium
├── 📄 GoogleFitTestPage.tsx     # Teste Google Fit
├── 📄 HealthFeedPage.tsx        # Feed social
├── 📄 Install.tsx               # Instalação PWA
├── 📄 MissionCompletePage.tsx   # Missão completa
├── 📄 NotFound.tsx              # 404
├── 📄 NutritionTrackingPage.tsx # Tracking nutricional
├── 📄 ProfessionalEvaluationPage.tsx # Avaliação
├── 📄 ProgressPage.tsx          # Progresso
├── 📄 PublicPostPage.tsx        # Post público
├── 📄 PublicReport.tsx          # Relatório público
├── 📄 SofiaNutricionalPage.tsx  # Sofia nutricional
├── 📄 SofiaPage.tsx             # Sofia principal
├── 📄 TermsPage.tsx             # Termos
└── 📄 UserDrVitalPage.tsx       # Dr. Vital do usuário
```

---

## 📁 supabase/functions/ - Edge Functions

```
supabase/functions/
├── 📁 _shared/                  # Código compartilhado
│   ├── cors.ts
│   ├── supabase-client.ts
│   └── utils/
│       ├── image-cache.ts       # Cache de imagens
│       └── ai-helpers.ts        # Helpers de IA
│
├── 📁 sofia-image-analysis/     # Análise de imagens (YOLO+Gemini)
├── 📁 analyze-medical-exam/     # Análise de exames médicos
├── 📁 dr-vital-chat/            # Chat Dr. Vital
├── 📁 dr-vital-enhanced/        # Dr. Vital melhorado
├── 📁 dr-vital-weekly-report/   # Relatório semanal
├── 📁 food-analysis/            # Análise de alimentos
├── 📁 generate-meal-plan-taco/  # Geração de cardápio
├── 📁 nutrition-calc/           # Cálculo nutricional
├── 📁 nutrition-daily-summary/  # Resumo diário
│
├── 📁 whatsapp-webhook-unified/ # Webhook WhatsApp
├── 📁 whatsapp-ai-assistant/    # Assistente WhatsApp
├── 📁 whatsapp-weekly-report/   # Relatório WhatsApp
├── 📁 whatsapp-daily-motivation/# Motivação diária
├── 📁 whatsapp-goal-reminders/  # Lembretes de metas
│
├── 📁 google-fit-sync/          # Sincronização Google Fit
├── 📁 google-fit-callback/      # Callback OAuth
├── 📁 google-fit-token/         # Gerenciamento de tokens
├── 📁 google-fit-ai-analysis/   # Análise IA dos dados
│
├── 📁 generate-medical-pdf/     # Geração de PDF médico
├── 📁 generate-medical-report/  # Relatório médico
├── 📁 premium-medical-report/   # Relatório premium
│
├── 📁 goal-notifications/       # Notificações de metas
├── 📁 send-email/               # Envio de emails
├── 📁 media-upload/             # Upload de mídia
│
└── 📁 ... (60+ outras functions)
```

---

## 📄 Arquivos de Configuração

### package.json - Dependências Principais

```json
{
  "dependencies": {
    // Core
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.7.1",
    
    // State & Data
    "@tanstack/react-query": "^5.56.2",
    "@supabase/supabase-js": "^2.89.0",
    
    // UI Components
    "@radix-ui/react-*": "^1.x",
    "lucide-react": "^0.462.0",
    "framer-motion": "^12.23.9",
    
    // Forms
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.8",
    
    // Charts
    "recharts": "^3.1.0",
    "apexcharts": "^5.3.2",
    "react-apexcharts": "^1.7.0",
    
    // Mobile
    "@capacitor/core": "^8.0.0",
    "@capacitor/camera": "^8.0.0",
    "@capacitor/haptics": "^8.0.0",
    
    // Utilities
    "date-fns": "^4.1.0",
    "class-variance-authority": "^0.7.1",
    "tailwind-merge": "^2.5.2"
  }
}
```

### vite.config.ts

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts', 'apexcharts'],
          ui: ['@radix-ui/react-*'],
        },
      },
    },
  },
});
```

### tailwind.config.ts

```typescript
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Design tokens semânticos
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
        destructive: "hsl(var(--destructive))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

---

## 📊 Distribuição de Arquivos por Tipo

| Tipo | Quantidade | % do Total |
|------|------------|------------|
| `.tsx` (React) | 746 | 67% |
| `.ts` (TypeScript) | 362 | 32.5% |
| `.css` | 3 | 0.3% |
| `.json` | 3 | 0.2% |

---

## 🔗 Relacionamentos entre Diretórios

```
┌─────────────────┐
│   src/pages/    │ ← Páginas da aplicação
└────────┬────────┘
         │ importa
         ▼
┌─────────────────┐
│ src/components/ │ ← Componentes React
└────────┬────────┘
         │ usa
         ▼
┌─────────────────┐
│   src/hooks/    │ ← Lógica de negócio
└────────┬────────┘
         │ chama
         ▼
┌─────────────────┐
│ supabase/       │ ← Backend (Edge Functions + DB)
│ functions/      │
└─────────────────┘
```

---

## 📝 Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase com "use" | `useAuth.ts` |
| Páginas | PascalCase + "Page" | `AdminPage.tsx` |
| Edge Functions | kebab-case | `sofia-image-analysis/` |
| Utilitários | camelCase | `formatDate.ts` |
| Tipos | PascalCase | `UserProfile` interface |

---

## 🎯 Próximos Passos

- Consulte `02_DATABASE_SCHEMA.md` para detalhes do banco de dados
- Consulte `03_COMPONENTS_CATALOG.md` para documentação de componentes
- Consulte `05_EDGE_FUNCTIONS.md` para APIs backend
