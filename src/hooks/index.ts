/**
 * 📦 Índice Centralizado de Hooks
 * 
 * ARQUITETURA ESCALÁVEL (2026-01-11)
 * 
 * ✅ NOVOS HOOKS UNIFICADOS (usar estes):
 * - useCurrentUser - Substitui 10+ hooks de usuário
 * - useGamification - Substitui 5+ hooks de gamificação
 * - useRankingPaginated - Ranking com paginação
 * - useFeedInfinite - Feed com infinite scroll
 * 
 * ⚠️ HOOKS LEGADOS (deprecated, mantidos para compatibilidade):
 * - useUserDataCentralized → use useCurrentUser
 * - useGamificationUnified → use useGamification
 * - useRanking → use useRankingPaginated
 * - useFeedPosts → use useFeedInfinite
 */

// ═══════════════════════════════════════════════════════════════════════════
// 🆕 NOVOS HOOKS UNIFICADOS (USAR ESTES)
// ═══════════════════════════════════════════════════════════════════════════

// Core - Usuário atual
export { 
  useCurrentUser, 
  useCurrentUserWithAuth,
} from './core/useCurrentUser';

// Gamification - Pontos, streak, níveis
export { 
  useGamification,
} from './gamification/useGamificationUnified';

// Community - Ranking e Feed
export { 
  useRankingPaginated,
  useTopRanking,
  useRankingWithContext,
  useUserRankingPosition,
  useRankingStats,
  useFeedInfinite,
} from './community';

// ═══════════════════════════════════════════════════════════════════════════
// 🔐 AUTH
// ═══════════════════════════════════════════════════════════════════════════

export { useAuth } from './useAuth';
export { useAutoAuth } from './useAutoAuth';
export { useGoogleAuth } from './useGoogleAuth';
export { useAdminMode } from './useAdminMode';
export { useAdminPermissions } from './useAdminPermissions';

// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ LEGADO - User Data (deprecated, use useCurrentUser)
// ═══════════════════════════════════════════════════════════════════════════

export { useUserDataCentralized, useUserProfile, useUserPhysicalData, useUserPoints } from './useUserDataCentralized';
export { useUserDataCache } from './useUserDataCache';

// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ LEGADO - Gamification (deprecated, use useGamification)
// ═══════════════════════════════════════════════════════════════════════════

export { useGamificationUnified } from './useGamificationUnified';
export { useEnhancedGamification } from './useEnhancedGamification';

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CHALLENGES
// ═══════════════════════════════════════════════════════════════════════════

export { useChallenges } from './useChallenges';
export { useChallengeParticipation } from './useChallengeParticipation';
export { useFlashChallenge } from './useFlashChallenge';

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 GOALS
// ═══════════════════════════════════════════════════════════════════════════

export { useGoals } from './useGoals';
export { useWeeklyGoalProgress } from './useWeeklyGoalProgress';

// ═══════════════════════════════════════════════════════════════════════════
// 📋 MISSIONS
// ═══════════════════════════════════════════════════════════════════════════

export { useDailyMissions } from './useDailyMissions';

// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ LEGADO - Ranking (deprecated, use useRankingPaginated)
// ═══════════════════════════════════════════════════════════════════════════

export { useRanking } from './useRanking';
export { useRealRanking } from './useRealRanking';

// Exercise
export { useExerciseProgram } from './useExerciseProgram';
export { useExercisePreferences } from './useExercisePreferences';
export { useWorkoutSound } from './useWorkoutSound';

// Nutrition
export { useNutritionTracking } from './useNutritionTracking';
export { useNutritionHistory } from './useNutritionHistory';
export { useUserRestrictions } from './useUserRestrictions';

// Tracking
export { useTrackingData } from './useTrackingData';

// Sofia
export { useSofiaAnalysis } from './useSofiaAnalysis';
export { useSofiaProactive } from './useSofiaProactive';

// Subscription
export { useSubscription } from './useSubscription';

// Admin
export { useAdminDashboard } from './useAdminDashboard';

// Points
export { usePointsConfig } from './usePointsConfig';

// UI
export { useToast } from './use-toast';
export { useIsMobile as useMobile } from './use-mobile';
export { useSafeAnimation } from './useSafeAnimation';


// ═══════════════════════════════════════════════════════════════════════════
// 🏋️ EXERCISE
// ═══════════════════════════════════════════════════════════════════════════

export { useExerciseProgram } from './useExerciseProgram';
export { useExerciseRecommendation } from './useExerciseRecommendation';
export { useExercisePreferences } from './useExercisePreferences';
export { useWorkoutSound } from './useWorkoutSound';

// ═══════════════════════════════════════════════════════════════════════════
// 🍎 NUTRITION
// ═══════════════════════════════════════════════════════════════════════════

export { useNutritionTracking } from './useNutritionTracking';
export { useNutritionHistory } from './useNutritionHistory';
export { useUserRestrictions } from './useUserRestrictions';

// ═══════════════════════════════════════════════════════════════════════════
// 📊 TRACKING
// ═══════════════════════════════════════════════════════════════════════════

export { useTrackingData } from './useTrackingData';

// ═══════════════════════════════════════════════════════════════════════════
// 🤖 SOFIA
// ═══════════════════════════════════════════════════════════════════════════

export { useSofiaAnalysis } from './useSofiaAnalysis';
export { useSofiaProactive } from './useSofiaProactive';

// ═══════════════════════════════════════════════════════════════════════════
// 💳 SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════════════════

export { useSubscription } from './useSubscription';

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ ADMIN
// ═══════════════════════════════════════════════════════════════════════════

export { useAdminDashboard } from './useAdminDashboard';

// ═══════════════════════════════════════════════════════════════════════════
// ⚙️ CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export { usePointsConfig } from './usePointsConfig';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 UI
// ═══════════════════════════════════════════════════════════════════════════

export { useToast } from './use-toast';
export { useMobile } from './use-mobile';
export { useSafeAnimation } from './useSafeAnimation';
