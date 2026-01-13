// ============================================
// 🏋️ ADVANCED EXERCISE SYSTEM - SERVICE EXPORTS
// ============================================

// Services
export { AIEngineService, createAIEngine } from './aiEngine';
export { GamificationService, createGamificationService } from './gamificationService';
export { ProgressionEngine, createProgressionEngine } from './progressionEngine';
export { InjuryPredictor, createInjuryPredictor } from './injuryPredictor';
export { SocialHub, createSocialHub } from './socialHub';
export { PerformanceDashboard, createPerformanceDashboard } from './performanceDashboard';

// Re-export types
export type {
  ContextData,
  UserAnalysis,
  WorkoutAdaptation,
  WorkoutPlan,
  AdaptedWorkout,
  RiskFactor,
  PerformanceMetric,
  UserLearningModel,
  GamificationPoints,
  PointsAwarded,
  Achievement,
  UserAchievement,
  Streak,
  Challenge,
  ChallengeParticipation,
  Leaderboard,
  LeaderboardEntry,
  MuscleGroupProgress,
  PlateauDetection,
  RecoveryRecommendation,
  ProgressionPlan,
  InjuryRisk,
  PainReport,
  RecoveryProtocol,
  WorkoutGroup,
  GroupMember,
  TeamChallenge,
  WorkoutBuddy,
  LiveWorkoutSession,
  Encouragement,
  WorkoutStats,
  ProgressInsight,
  GoalPrediction,
  BenchmarkComparison,
} from '@/types/advanced-exercise-system';
