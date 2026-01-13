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

// Re-export types that actually exist in the types file
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
  MuscleBalance,
  MuscleImbalance,
  InjuryRiskAssessment,
  PainReport,
  WorkoutGroup,
  GroupMember,
  GroupChallenge,
  WorkoutBuddyProfile,
  BuddyConnection,
  WorkoutEncouragement,
  UserStatistics,
  ExerciseInsight,
  GoalPrediction,
  UserBenchmarkComparison,
} from '@/types/advanced-exercise-system';
