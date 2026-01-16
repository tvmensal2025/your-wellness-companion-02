# 🪝 Referência de Hooks Customizados

> Documentação gerada em: 2026-01-16
> Total de Hooks: 165

---

## 📊 Visão Geral

| Categoria | Quantidade | Localização |
|-----------|------------|-------------|
| Autenticação | 5 | `src/hooks/` |
| Gamificação | 15+ | `src/hooks/gamification/` |
| Dados de Usuário | 15+ | `src/hooks/` |
| Nutrição | 12+ | `src/hooks/` |
| Exercícios | 10+ | `src/hooks/exercise/` |
| Saúde/Médico | 8+ | `src/hooks/dr-vital/` |
| Comunidade | 10+ | `src/hooks/community/` |
| Utilidades | 20+ | `src/hooks/` |

---

## 🔐 Autenticação

### useAuth
Hook principal de autenticação.

```typescript
// src/hooks/useAuth.ts
interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: object) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Uso
const { user, isAuthenticated, signOut } = useAuth();

if (!isAuthenticated) {
  return <LoginPage />;
}
```

### useAdminMode
Verifica se usuário é admin.

```typescript
// src/hooks/useAdminMode.ts
interface UseAdminModeReturn {
  isAdmin: boolean;
  isLoading: boolean;
  adminSince: Date | null;
}

// Uso
const { isAdmin, isLoading } = useAdminMode();

if (!isAdmin) {
  return <AccessDenied />;
}
```

### useAdminPermissions
Permissões granulares de admin.

```typescript
// src/hooks/useAdminPermissions.ts
interface UseAdminPermissionsReturn {
  permissions: AdminPermission[];
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

type AdminPermission = 
  | 'manage_users'
  | 'manage_content'
  | 'view_analytics'
  | 'manage_ai'
  | 'manage_system';

// Uso
const { hasPermission } = useAdminPermissions();

if (!hasPermission('manage_users')) {
  return null;
}
```

---

## 🎮 Gamificação

### useGamificationUnified
Hook unificado de gamificação.

```typescript
// src/hooks/useGamificationUnified.ts
interface UseGamificationUnifiedReturn {
  // Dados
  points: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  
  // Status
  isLoading: boolean;
  error: Error | null;
  
  // Ações
  addPoints: (amount: number, action: string) => Promise<void>;
  addXP: (amount: number, source: string) => Promise<void>;
  updateStreak: () => Promise<void>;
  
  // Computed
  xpToNextLevel: number;
  levelProgress: number; // 0-100
}

// Uso
const { 
  points, 
  level, 
  currentStreak, 
  addPoints 
} = useGamificationUnified();

await addPoints(10, 'meal_logged');
```

### useRealRanking
Posição real no ranking.

```typescript
// src/hooks/useRealRanking.ts
interface UseRealRankingReturn {
  position: number;
  totalUsers: number;
  league: LeagueType;
  weeklyChange: number;
  topUsers: RankedUser[];
  isLoading: boolean;
  refetch: () => void;
}

type LeagueType = 'bronze' | 'silver' | 'gold' | 'diamond';

interface RankedUser {
  userId: string;
  name: string;
  avatarUrl: string;
  points: number;
  position: number;
  level: number;
}

// Uso
const { position, league, topUsers } = useRealRanking();
```

### useChallenges
Gerenciamento de desafios.

```typescript
// src/hooks/useChallenges.ts
interface UseChallengesReturn {
  // Dados
  activeChallenges: Challenge[];
  myParticipations: ChallengeParticipation[];
  completedChallenges: Challenge[];
  
  // Status
  isLoading: boolean;
  
  // Ações
  joinChallenge: (challengeId: string) => Promise<void>;
  updateProgress: (participationId: string, progress: number) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
}

// Uso
const { 
  activeChallenges, 
  joinChallenge, 
  updateProgress 
} = useChallenges();
```

### useDailyMissions
Missões diárias.

```typescript
// src/hooks/useDailyMissions.ts
interface UseDailyMissionsReturn {
  missions: DailyMission[];
  completedCount: number;
  totalMissions: number;
  streakDays: number;
  totalPoints: number;
  isLoading: boolean;
  completeMission: (missionId: string) => Promise<void>;
  refreshMissions: () => void;
}

interface DailyMission {
  id: string;
  title: string;
  description: string;
  points: number;
  isCompleted: boolean;
  category: 'nutrition' | 'exercise' | 'health' | 'social';
  icon: string;
}

// Uso
const { missions, completeMission } = useDailyMissions();
```

### useFlashChallenge
Desafios relâmpago.

```typescript
// src/hooks/useFlashChallenge.ts
interface UseFlashChallengeReturn {
  currentChallenge: FlashChallenge | null;
  timeRemaining: number; // segundos
  myProgress: number;
  isParticipating: boolean;
  join: () => Promise<void>;
  updateProgress: (value: number) => Promise<void>;
}
```

### useUserPoints
Pontos do usuário.

```typescript
// src/hooks/useUserPoints.ts
interface UseUserPointsReturn {
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  pointsHistory: PointsEntry[];
  isLoading: boolean;
}
```

### useUserXP
XP do usuário.

```typescript
// src/hooks/useUserXP.ts
interface UseUserXPReturn {
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  progress: number; // 0-100
  isLoading: boolean;
}
```

### useUserStreak
Streak do usuário.

```typescript
// src/hooks/useUserStreak.ts
interface UseUserStreakReturn {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  isActive: boolean;
  isLoading: boolean;
}
```

---

## 👤 Dados de Usuário

### useUserProfile
Perfil do usuário.

```typescript
// src/hooks/useUserProfile.ts
interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => void;
}

interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  gender: string | null;
  birthDate: Date | null;
  heightCm: number | null;
  weightKg: number | null;
  targetWeightKg: number | null;
  activityLevel: string | null;
  dietaryPreference: string | null;
  healthGoals: string[];
  onboardingCompleted: boolean;
  isAdmin: boolean;
  subscriptionStatus: string;
}

// Uso
const { profile, updateProfile } = useUserProfile();

await updateProfile({ fullName: 'Novo Nome' });
```

### useHealthData
Dados de saúde consolidados.

```typescript
// src/hooks/useHealthData.ts
interface UseHealthDataReturn {
  // Dados atuais
  currentWeight: number | null;
  bmi: number | null;
  bodyFatPercentage: number | null;
  
  // Histórico
  weightHistory: WeightEntry[];
  healthDiary: HealthDiaryEntry[];
  
  // Ações
  logWeight: (weight: number, date?: Date) => Promise<void>;
  logHealthEntry: (entry: Partial<HealthDiaryEntry>) => Promise<void>;
  
  // Status
  isLoading: boolean;
}
```

### useGoogleFitData
Dados do Google Fit.

```typescript
// src/hooks/useGoogleFitData.ts
interface UseGoogleFitDataReturn {
  isConnected: boolean;
  lastSync: Date | null;
  
  // Dados do dia
  todayData: GoogleFitDayData | null;
  
  // Histórico
  weeklyData: GoogleFitDayData[];
  
  // Ações
  sync: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Status
  isSyncing: boolean;
  error: Error | null;
}

interface GoogleFitDayData {
  date: Date;
  steps: number;
  calories: number;
  distanceMeters: number;
  activeMinutes: number;
  heartRateAvg: number | null;
  sleepHours: number | null;
}

// Uso
const { todayData, sync, isSyncing } = useGoogleFitData();
```

### useTrackingData
Dados de tracking diário.

```typescript
// src/hooks/useTrackingData.ts
interface UseTrackingDataReturn {
  todayTracking: DailyTracking | null;
  weeklyTracking: DailyTracking[];
  
  // Ações
  updateTracking: (data: Partial<DailyTracking>) => Promise<void>;
  
  isLoading: boolean;
}
```

### useHealthScore
Score de saúde calculado.

```typescript
// src/hooks/useHealthScore.ts
interface UseHealthScoreReturn {
  score: number; // 0-100
  breakdown: ScoreBreakdown;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  isLoading: boolean;
}

interface ScoreBreakdown {
  nutrition: number;
  exercise: number;
  sleep: number;
  hydration: number;
  consistency: number;
}
```

---

## 🥗 Nutrição

### useNutritionData
Dados nutricionais do usuário.

```typescript
// src/hooks/useNutritionData.ts
interface UseNutritionDataReturn {
  // Metas
  dailyGoals: NutritionGoals;
  
  // Progresso hoje
  todayProgress: NutritionProgress;
  
  // Histórico
  weeklyHistory: DailyNutrition[];
  
  // Status
  isLoading: boolean;
  
  // Ações
  updateGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number; // ml
}

interface NutritionProgress {
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  waterConsumed: number;
}
```

### useSofiaAnalysis
Análise de alimentos via Sofia.

```typescript
// src/hooks/useSofiaAnalysis.ts
interface UseSofiaAnalysisReturn {
  analyze: (imageUrl: string) => Promise<FoodAnalysisResult>;
  isAnalyzing: boolean;
  lastAnalysis: FoodAnalysisResult | null;
  error: Error | null;
}

interface FoodAnalysisResult {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  confidence: number;
  suggestions: string[];
}

// Uso
const { analyze, isAnalyzing } = useSofiaAnalysis();

const result = await analyze(imageUrl);
```

### useFoodHistory
Histórico de refeições.

```typescript
// src/hooks/useFoodHistory.ts
interface UseFoodHistoryReturn {
  meals: Meal[];
  todayMeals: Meal[];
  
  // Ações
  addMeal: (meal: NewMeal) => Promise<void>;
  updateMeal: (id: string, data: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  
  // Filtros
  filterByDate: (date: Date) => Meal[];
  filterByType: (type: MealType) => Meal[];
  
  isLoading: boolean;
}
```

### useMealPlanHistory
Histórico de planos alimentares.

```typescript
// src/hooks/useMealPlanHistory.ts
interface UseMealPlanHistoryReturn {
  plans: MealPlan[];
  activePlan: MealPlan | null;
  
  // Ações
  createPlan: (plan: NewMealPlan) => Promise<void>;
  activatePlan: (planId: string) => Promise<void>;
  deactivatePlan: (planId: string) => Promise<void>;
  
  isLoading: boolean;
}
```

---

## 🏋️ Exercícios

### useExerciseLibrary
Biblioteca de exercícios.

```typescript
// src/hooks/useExercisesLibrary.ts
interface UseExercisesLibraryReturn {
  exercises: Exercise[];
  
  // Filtros
  filterByLocation: (location: string) => Exercise[];
  filterByMuscleGroup: (group: string) => Exercise[];
  filterByDifficulty: (difficulty: string) => Exercise[];
  search: (query: string) => Exercise[];
  
  isLoading: boolean;
}
```

### useExerciseProgram
Programa de exercícios do usuário.

```typescript
// src/hooks/useExerciseProgram.ts
interface UseExerciseProgramReturn {
  activeProgram: WorkoutProgram | null;
  programs: WorkoutProgram[];
  
  // Ações
  createProgram: (program: NewProgram) => Promise<void>;
  activateProgram: (programId: string) => Promise<void>;
  completeWorkout: (summary: WorkoutSummary) => Promise<void>;
  
  // Hoje
  todayWorkout: DayWorkout | null;
  
  isLoading: boolean;
}
```

### useExerciseProgress
Progresso de exercícios.

```typescript
// src/hooks/useExerciseProgress.ts
interface UseExerciseProgressReturn {
  totalWorkouts: number;
  totalMinutes: number;
  totalCaloriesBurned: number;
  
  weeklyStats: WeeklyExerciseStats;
  monthlyStats: MonthlyExerciseStats;
  
  streakDays: number;
  
  isLoading: boolean;
}
```

---

## 🏥 Saúde/Médico

### useDrVital (localizado em dr-vital/)
Hook do Dr. Vital.

```typescript
// src/hooks/dr-vital/useDrVital.ts
interface UseDrVitalReturn {
  // Análises
  analyses: ExamAnalysis[];
  latestAnalysis: ExamAnalysis | null;
  
  // Chat
  sendMessage: (message: string, context?: ExamContext) => Promise<string>;
  chatHistory: ChatMessage[];
  
  // Ações
  analyzeExam: (fileUrl: string, examType: string) => Promise<ExamAnalysis>;
  generateReport: (analysisId: string) => Promise<string>; // PDF URL
  
  // Status
  isAnalyzing: boolean;
  isChatting: boolean;
}
```

### useExamAccess
Acesso a exames do usuário.

```typescript
// src/hooks/useExamAccess.ts
interface UseExamAccessReturn {
  exams: ExamRecord[];
  
  uploadExam: (file: File, examType: string) => Promise<ExamRecord>;
  deleteExam: (examId: string) => Promise<void>;
  
  isUploading: boolean;
}
```

---

## 👥 Comunidade

### useFeedPosts
Posts do feed.

```typescript
// src/hooks/useFeedPosts.ts
interface UseFeedPostsReturn {
  posts: Post[];
  myPosts: Post[];
  
  // Ações
  createPost: (post: NewPost) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  
  // Paginação
  loadMore: () => void;
  hasMore: boolean;
  
  isLoading: boolean;
}
```

### useStories
Stories.

```typescript
// src/hooks/useStories.ts
interface UseStoriesReturn {
  stories: Story[];
  myStories: Story[];
  
  createStory: (story: NewStory) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  
  isLoading: boolean;
}
```

### useFollow
Sistema de seguir.

```typescript
// src/hooks/useFollow.ts
interface UseFollowReturn {
  followers: UserProfile[];
  following: UserProfile[];
  followersCount: number;
  followingCount: number;
  
  follow: (userId: string) => Promise<void>;
  unfollow: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  
  isLoading: boolean;
}
```

### useDirectMessages
Mensagens diretas.

```typescript
// src/hooks/useDirectMessages.ts
interface UseDirectMessagesReturn {
  conversations: Conversation[];
  
  sendMessage: (userId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  
  unreadCount: number;
  isLoading: boolean;
}
```

---

## 🔧 Utilidades

### useCamera
Acesso à câmera.

```typescript
// src/hooks/useCamera.ts
interface UseCameraReturn {
  takePhoto: () => Promise<CapturedPhoto>;
  selectFromGallery: () => Promise<CapturedPhoto>;
  isAvailable: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}
```

### useHaptics
Feedback háptico.

```typescript
// src/hooks/useHaptics.ts
interface UseHapticsReturn {
  vibrate: (style?: 'light' | 'medium' | 'heavy') => void;
  impact: (style?: 'light' | 'medium' | 'heavy') => void;
  notification: (type?: 'success' | 'warning' | 'error') => void;
  isAvailable: boolean;
}

// Uso
const { vibrate, impact } = useHaptics();

impact('medium');
```

### useNetworkStatus
Status da rede.

```typescript
// src/hooks/useNetworkStatus.ts
interface UseNetworkStatusReturn {
  isOnline: boolean;
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'unknown';
  effectiveType: string;
}
```

### useReducedMotion
Preferência de movimento reduzido.

```typescript
// src/hooks/useReducedMotion.ts
const prefersReducedMotion: boolean = useReducedMotion();
```

### useDebouncedState
State com debounce.

```typescript
// src/hooks/useDebouncedState.ts
const [value, setValue, debouncedValue] = useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
);
```

### useLongPress
Detecção de long press.

```typescript
// src/hooks/useLongPress.ts
const longPressProps = useLongPress(
  callback: () => void,
  options?: { delay?: number; threshold?: number }
);

<button {...longPressProps}>Hold me</button>
```

### useSwipeGesture
Detecção de gestos de swipe.

```typescript
// src/hooks/useSwipeGesture.ts
const { ref, direction } = useSwipeGesture({
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
});
```

### useMediaUpload
Upload de mídia.

```typescript
// src/hooks/useMediaUpload.ts
interface UseMediaUploadReturn {
  upload: (file: File, bucket: string) => Promise<string>;
  uploadProgress: number;
  isUploading: boolean;
  error: Error | null;
}
```

### use-mobile
Detecção de mobile.

```typescript
// src/hooks/use-mobile.tsx
const isMobile: boolean = useIsMobile();
```

### use-toast
Sistema de toast.

```typescript
// src/hooks/use-toast.ts
const { toast } = useToast();

toast({
  title: "Sucesso!",
  description: "Operação realizada.",
  variant: "default" | "destructive",
});
```

---

## 📐 Padrões de Hooks

### Estrutura Recomendada

```typescript
// useMyHook.ts
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseMyHookReturn {
  data: MyData | null;
  isLoading: boolean;
  error: Error | null;
  action: (param: string) => Promise<void>;
}

export function useMyHook(param: string): UseMyHookReturn {
  // Query para buscar dados
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-data', param],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .eq('param', param);
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation para ações
  const mutation = useMutation({
    mutationFn: async (value: string) => {
      const { error } = await supabase
        .from('my_table')
        .insert({ value });
      
      if (error) throw error;
    },
  });

  const action = useCallback(async (value: string) => {
    await mutation.mutateAsync(value);
  }, [mutation]);

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null,
    action,
  };
}
```

### Convenções

1. **Nomes**: Prefixo `use` + camelCase
2. **Retorno**: Interface tipada `Use[Name]Return`
3. **Queries**: Usar React Query para cache
4. **Mutations**: Usar useMutation para ações
5. **Callbacks**: Usar useCallback para funções

---

## 📝 Próximos Passos

- Consulte `03_COMPONENTS_CATALOG.md` para componentes que usam estes hooks
- Consulte `05_EDGE_FUNCTIONS.md` para APIs chamadas pelos hooks
