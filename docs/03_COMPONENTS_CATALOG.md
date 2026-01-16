# 🧩 Catálogo de Componentes React

> Documentação gerada em: 2026-01-16
> Total de Componentes: 742

---

## 📊 Visão Geral

| Categoria | Quantidade | Localização |
|-----------|------------|-------------|
| UI Base (shadcn) | 50+ | `src/components/ui/` |
| Sofia (IA) | 25+ | `src/components/sofia/` |
| Dr. Vital (IA) | 15+ | `src/components/dr-vital/` |
| Gamificação | 20+ | `src/components/gamification/` |
| Exercícios | 30+ | `src/components/exercise/` |
| Nutrição | 25+ | `src/components/nutrition/` |
| Dashboard | 20+ | `src/components/dashboard/` |
| Admin | 30+ | `src/components/admin/` |
| Comunidade | 35+ | `src/components/community/` |
| Standalone | 60+ | `src/components/*.tsx` |

---

## 🎨 UI Base (src/components/ui/)

Componentes base do design system, baseados em shadcn/ui.

### Button
```typescript
// src/components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

// Uso
<Button variant="default" size="lg">
  Salvar
</Button>
```

### Card
```typescript
// src/components/ui/card.tsx
// Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

### Dialog
```typescript
// src/components/ui/dialog.tsx
// Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    Conteúdo
  </DialogContent>
</Dialog>
```

### Outros Componentes UI

| Componente | Descrição |
|------------|-----------|
| `accordion.tsx` | Accordion expansível |
| `alert-dialog.tsx` | Dialog de confirmação |
| `avatar.tsx` | Avatar com fallback |
| `badge.tsx` | Badge/Tag |
| `calendar.tsx` | Calendário date picker |
| `checkbox.tsx` | Checkbox |
| `collapsible.tsx` | Área colapsável |
| `dropdown-menu.tsx` | Menu dropdown |
| `input.tsx` | Input de texto |
| `label.tsx` | Label de formulário |
| `popover.tsx` | Popover flutuante |
| `progress.tsx` | Barra de progresso |
| `radio-group.tsx` | Grupo de radio |
| `scroll-area.tsx` | Área com scroll |
| `select.tsx` | Select dropdown |
| `separator.tsx` | Separador |
| `sheet.tsx` | Sheet lateral |
| `skeleton.tsx` | Skeleton loader |
| `slider.tsx` | Slider de valor |
| `switch.tsx` | Switch toggle |
| `tabs.tsx` | Tabs navegação |
| `textarea.tsx` | Textarea multiline |
| `toast.tsx` | Toast notification |
| `tooltip.tsx` | Tooltip |

---

## 🤖 Sofia - IA Nutricionista (src/components/sofia/)

### SofiaChat
Chat principal com a Sofia.

```typescript
interface SofiaChatProps {
  onClose?: () => void;
  initialMessage?: string;
  embedded?: boolean;
}

// Uso
<SofiaChat 
  embedded={true}
  onClose={() => navigate('/dashboard')}
/>
```

### SofiaImageAnalysis
Análise de imagens de alimentos.

```typescript
interface SofiaImageAnalysisProps {
  imageUrl: string;
  onAnalysisComplete: (result: FoodAnalysisResult) => void;
  onError?: (error: string) => void;
}

interface FoodAnalysisResult {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: number;
}
```

### SofiaFoodHistory
Histórico de análises de alimentos.

```typescript
interface SofiaFoodHistoryProps {
  userId: string;
  dateRange?: { start: Date; end: Date };
  onItemClick?: (item: FoodHistoryItem) => void;
}
```

### Outros Componentes Sofia

| Componente | Descrição |
|------------|-----------|
| `SofiaSuggestions.tsx` | Sugestões personalizadas |
| `SofiaQuickActions.tsx` | Ações rápidas |
| `SofiaMessageBubble.tsx` | Bolha de mensagem |
| `SofiaTypingIndicator.tsx` | Indicador digitando |
| `SofiaHeader.tsx` | Cabeçalho do chat |
| `SofiaInputArea.tsx` | Área de input |
| `SofiaImagePreview.tsx` | Preview de imagem |
| `SofiaNutritionCard.tsx` | Card nutricional |

---

## 🏥 Dr. Vital - IA Médica (src/components/dr-vital/)

### DrVitalChat
Chat com o Dr. Vital.

```typescript
interface DrVitalChatProps {
  examContext?: ExamAnalysis;
  onClose?: () => void;
}
```

### ExamAnalysis
Componente de análise de exames.

```typescript
interface ExamAnalysisProps {
  examId?: string;
  onAnalysisComplete?: (analysis: MedicalAnalysis) => void;
}

interface MedicalAnalysis {
  examType: string;
  extractedData: Record<string, any>;
  interpretation: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}
```

### ExamHistory
Histórico de exames analisados.

```typescript
interface ExamHistoryProps {
  userId: string;
  onExamSelect?: (exam: ExamRecord) => void;
}
```

### Outros Componentes Dr. Vital

| Componente | Descrição |
|------------|-----------|
| `DrVitalHeader.tsx` | Cabeçalho |
| `ExamUploadArea.tsx` | Área de upload |
| `ExamResultCard.tsx` | Card de resultado |
| `HealthIndicator.tsx` | Indicador de saúde |
| `ReportGenerator.tsx` | Gerador de PDF |
| `RiskBadge.tsx` | Badge de risco |

---

## 🎮 Gamificação (src/components/gamification/)

### BadgeSystem
Sistema de badges/conquistas.

```typescript
interface BadgeSystemProps {
  userId: string;
  showRecent?: boolean;
  maxDisplay?: number;
}
```

### LevelProgress
Barra de progresso de nível.

```typescript
interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  showDetails?: boolean;
}

// Uso
<LevelProgress 
  currentLevel={5}
  currentXP={450}
  xpToNextLevel={500}
  showDetails={true}
/>
```

### PointsDisplay
Exibição de pontos.

```typescript
interface PointsDisplayProps {
  points: number;
  weeklyPoints?: number;
  showTrend?: boolean;
  compact?: boolean;
}
```

### StreakCounter
Contador de streak.

```typescript
interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  showFlame?: boolean;
}
```

### XPBar
Barra de XP.

```typescript
interface XPBarProps {
  current: number;
  max: number;
  level: number;
  animated?: boolean;
}
```

### RankingCard
Card de posição no ranking.

```typescript
interface RankingCardProps {
  position: number;
  totalUsers: number;
  league: 'bronze' | 'silver' | 'gold' | 'diamond';
  weeklyChange?: number;
}
```

### Outros Componentes Gamificação

| Componente | Descrição |
|------------|-----------|
| `ChallengeCard.tsx` | Card de desafio |
| `ChallengeProgress.tsx` | Progresso do desafio |
| `DailyMissionCard.tsx` | Card missão diária |
| `LeaderboardRow.tsx` | Linha do ranking |
| `AchievementUnlock.tsx` | Animação conquista |
| `XPGainAnimation.tsx` | Animação ganho XP |
| `LevelUpModal.tsx` | Modal level up |
| `ComboMultiplier.tsx` | Multiplicador combo |

---

## 🏋️ Exercícios (src/components/exercise/)

### ExerciseLibrary
Biblioteca de exercícios.

```typescript
interface ExerciseLibraryProps {
  location?: 'home' | 'gym' | 'outdoor';
  muscleGroup?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  onExerciseSelect?: (exercise: Exercise) => void;
}
```

### ExerciseCard
Card individual de exercício.

```typescript
interface ExerciseCardProps {
  exercise: Exercise;
  showDetails?: boolean;
  onStart?: () => void;
  onInfoClick?: () => void;
}

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: string;
  sets: string;
  reps: string;
  restTime: string;
  youtubeUrl?: string;
  imageUrl?: string;
  instructions: string[];
}
```

### ActiveWorkoutModal
Modal de treino ativo.

```typescript
interface ActiveWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onComplete: (summary: WorkoutSummary) => void;
}
```

### Subpastas de Exercícios

#### `exercise/saved-program/`
| Componente | Descrição |
|------------|-----------|
| `index.tsx` | Orchestrator principal |
| `ProgramHeader.tsx` | Cabeçalho do programa |
| `ProgramDayList.tsx` | Lista de dias |
| `ProgramExerciseList.tsx` | Lista de exercícios |
| `WorkoutDayCard.tsx` | Card dia treino |
| `RestDayCard.tsx` | Card dia descanso |

#### `exercise/workout/`
| Componente | Descrição |
|------------|-----------|
| `WorkoutTimer.tsx` | Timer do treino |
| `ExerciseDisplay.tsx` | Display exercício |
| `ProgressTracker.tsx` | Tracker progresso |

#### `exercise/unified-timer/`
| Componente | Descrição |
|------------|-----------|
| `index.tsx` | Timer unificado |
| `TimerDisplay.tsx` | Display do timer |
| `TimerControls.tsx` | Controles |
| `MotivationalMessages.tsx` | Mensagens |

---

## 🥗 Nutrição (src/components/nutrition/)

### NutritionDashboard
Dashboard nutricional.

```typescript
interface NutritionDashboardProps {
  userId: string;
  date?: Date;
}
```

### MacroChart
Gráfico de macronutrientes.

```typescript
interface MacroChartProps {
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}
```

### CalorieProgress
Progresso de calorias.

```typescript
interface CalorieProgressProps {
  consumed: number;
  goal: number;
  burned?: number;
  showBreakdown?: boolean;
}
```

### MealCard
Card de refeição.

```typescript
interface MealCardProps {
  meal: Meal;
  onEdit?: () => void;
  onDelete?: () => void;
  showMacros?: boolean;
}
```

### Outros Componentes Nutrição

| Componente | Descrição |
|------------|-----------|
| `WaterTracker.tsx` | Tracker de água |
| `FoodSearch.tsx` | Busca de alimentos |
| `NutritionGoals.tsx` | Metas nutricionais |
| `MealPlanView.tsx` | Visualização cardápio |
| `NutritionHistory.tsx` | Histórico |
| `MacroRing.tsx` | Anel de macros |
| `FoodItemRow.tsx` | Linha de alimento |

---

## 📊 Dashboard (src/components/dashboard/)

### DashboardHeader
Cabeçalho do dashboard.

```typescript
interface DashboardHeaderProps {
  userName: string;
  greeting?: string;
  showNotifications?: boolean;
}
```

### QuickActions
Ações rápidas.

```typescript
interface QuickActionsProps {
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
}

interface QuickAction {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  badge?: string;
}
```

### StatsCards
Cards de estatísticas.

```typescript
interface StatsCardsProps {
  stats: StatCard[];
}

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: string;
}
```

### HealthScoreCard
Card de score de saúde.

```typescript
interface HealthScoreCardProps {
  score: number;
  maxScore?: number;
  breakdown?: ScoreBreakdown;
  onDetailsClick?: () => void;
}
```

### Outros Componentes Dashboard

| Componente | Descrição |
|------------|-----------|
| `DailyProgress.tsx` | Progresso diário |
| `WeeklyChart.tsx` | Gráfico semanal |
| `UpcomingGoals.tsx` | Metas próximas |
| `RecentActivity.tsx` | Atividade recente |
| `MotivationalQuote.tsx` | Citação motivacional |
| `WeatherWidget.tsx` | Widget clima |
| `TodaySchedule.tsx` | Agenda do dia |

---

## 🛡️ Admin (src/components/admin/)

### AdminDashboard
Dashboard administrativo.

```typescript
interface AdminDashboardProps {
  adminId: string;
}
```

### UserManagement
Gerenciamento de usuários.

```typescript
interface UserManagementProps {
  onUserSelect?: (user: UserProfile) => void;
}
```

### AIConfigPanel
Configuração de IA.

```typescript
interface AIConfigPanelProps {
  functionality: string;
  onSave?: (config: AIConfig) => void;
}
```

### SystemHealth
Saúde do sistema.

```typescript
interface SystemHealthProps {
  showDetails?: boolean;
  refreshInterval?: number;
}
```

### Outros Componentes Admin

| Componente | Descrição |
|------------|-----------|
| `AdminSidebar.tsx` | Sidebar admin |
| `UserTable.tsx` | Tabela usuários |
| `AIUsageChart.tsx` | Gráfico uso IA |
| `SystemLogs.tsx` | Logs do sistema |
| `StorageStats.tsx` | Estatísticas storage |
| `DatabaseStats.tsx` | Estatísticas DB |
| `FeatureFlagsPanel.tsx` | Feature flags |

---

## 👥 Comunidade (src/components/community/)

### FeedPost
Post do feed.

```typescript
interface FeedPostProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}
```

### StoryRing
Ring de stories.

```typescript
interface StoryRingProps {
  stories: Story[];
  onStoryClick?: (story: Story) => void;
}
```

### ProfileCard
Card de perfil.

```typescript
interface ProfileCardProps {
  user: UserProfile;
  isFollowing?: boolean;
  onFollow?: () => void;
}
```

### Outros Componentes Comunidade

| Componente | Descrição |
|------------|-----------|
| `CommentSection.tsx` | Seção comentários |
| `FollowersList.tsx` | Lista seguidores |
| `FollowingList.tsx` | Lista seguindo |
| `CreatePostModal.tsx` | Modal criar post |
| `CreateStoryModal.tsx` | Modal criar story |
| `DirectMessages.tsx` | Mensagens diretas |
| `NotificationBell.tsx` | Sino notificações |
| `UserSearchBar.tsx` | Busca usuários |

---

## 📱 Navegação (src/components/navigation/)

### BottomNavigation
Navegação inferior mobile.

```typescript
interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
```

### MobileHeader
Header mobile.

```typescript
interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  actions?: HeaderAction[];
}
```

### Sidebar
Sidebar lateral.

```typescript
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}
```

---

## 🔧 Componentes Standalone

Componentes importantes na raiz de `src/components/`:

| Componente | Descrição |
|------------|-----------|
| `AuthGuard.tsx` | Proteção de rotas autenticadas |
| `Dashboard.tsx` | Dashboard principal |
| `OnboardingFlow.tsx` | Fluxo de onboarding |
| `OptimizedImage.tsx` | Imagem otimizada |
| `InstallPrompt.tsx` | Prompt instalação PWA |
| `NotificationBell.tsx` | Sino de notificações |
| `ThemeToggle.tsx` | Toggle tema claro/escuro |
| `VirtualList.tsx` | Lista virtualizada |
| `HeroCarousel.tsx` | Carousel hero |
| `HealthChatBot.tsx` | ChatBot de saúde |
| `MissionSystem.tsx` | Sistema de missões |
| `RankingPage.tsx` | Página de ranking |
| `SubscriptionStatus.tsx` | Status assinatura |

---

## 📐 Padrões de Componentes

### Estrutura Recomendada

```typescript
// ComponentName.tsx
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // Props tipadas
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Hooks no topo
  const [state, setState] = useState();
  
  // Handlers
  const handleClick = useCallback(() => {
    // Lógica
  }, []);
  
  // Render
  return (
    <div className={cn("base-classes", conditionalClass)}>
      {/* Conteúdo */}
    </div>
  );
}
```

### Convenções

1. **Nomes**: PascalCase para componentes
2. **Arquivos**: Um componente principal por arquivo
3. **Props**: Interface com sufixo `Props`
4. **Hooks**: Extrair lógica para hooks customizados
5. **Estilos**: Usar tokens semânticos do Tailwind

---

## 📝 Próximos Passos

- Consulte `04_HOOKS_REFERENCE.md` para hooks utilizados
- Consulte `06_NAVIGATION_FLOWS.md` para fluxos de navegação
