/**
 * Índice centralizado de hooks
 * Use: import { useAuth, useGamificationUnified } from '@/hooks';
 */

// Auth
export { useAuth } from './useAuth';
export { useAutoAuth } from './useAutoAuth';
export { useGoogleAuth } from './useGoogleAuth';
export { useAdminMode } from './useAdminMode';
export { useAdminPermissions } from './useAdminPermissions';

// User Data (CENTRALIZADOS)
export { useUserDataCentralized, useUserProfile, useUserPhysicalData, useUserPoints } from './useUserDataCentralized';
export { useUserDataCache } from './useUserDataCache';

// Gamification (UNIFICADO)
export { useGamificationUnified } from './useGamificationUnified';
export { useEnhancedGamification } from './useEnhancedGamification';

// Challenges
export { useChallenges } from './useChallenges';
export { useChallengeParticipation } from './useChallengeParticipation';
export { useFlashChallenge } from './useFlashChallenge';

// Goals
export { useGoals } from './useGoals';
export { useWeeklyGoalProgress } from './useWeeklyGoalProgress';

// Missions
export { useDailyMissions } from './useDailyMissions';

// Ranking
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
