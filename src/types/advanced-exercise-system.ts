// ============================================
// 🏋️ ADVANCED EXERCISE SYSTEM - TYPE DEFINITIONS
// Sistema de exercícios avançado com IA, gamificação,
// progressão inteligente, previsão de lesões e social
// ============================================

// ============================================
// 1. AI ENGINE TYPES
// ============================================

export interface ContextData {
  timeOfDay: string;
  weather?: WeatherData;
  stressLevel: number;
  sleepQuality: number;
  sleepHours: number;
  recentPerformance: PerformanceMetric[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  conditions: string;
}

export interface UserAnalysis {
  energyLevel: number;
  readiness: number;
  fatigueLevel: number;
  stressLevel: number;
  recommendedIntensity: 'low' | 'medium' | 'high' | 'rest';
  recommendedDurationMinutes: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
  confidenceScore: number;
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  affectedAreas?: string[];
}

export interface WorkoutAdaptation {
  id: string;
  adaptationType: 'intensity_increase' | 'intensity_decrease' | 'rest_extension' | 'exercise_swap' | 'skip';
  originalValue: Record<string, unknown>;
  adaptedValue: Record<string, unknown>;
  reason: string;
  triggerType: 'difficulty_rating' | 'heart_rate' | 'fatigue' | 'pain' | 'environmental';
  triggerValue: Record<string, unknown>;
  userAccepted?: boolean;
  userFeedback?: string;
  effectivenessRating?: number;
}

export interface UserLearningModel {
  userId: string;
  preferredWorkoutTimes: string[];
  preferredExerciseTypes: string[];
  dislikedExercises: string[];
  optimalRestTimes: Record<string, number>;
  performancePatterns: Record<string, unknown>;
  recoveryPatterns: Record<string, unknown>;
  fatiguePatterns: Record<string, unknown>;
  totalFeedbackCount: number;
  modelAccuracy: number;
  lastModelUpdate: Date;
}

// ============================================
// 2. GAMIFICATION TYPES
// ============================================

export interface GamificationPoints {
  userId: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  currentLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  activeMultipliers: Multiplier[];
}

export interface Multiplier {
  type: string;
  value: number;
  expiresAt?: Date;
  reason: string;
}

export interface PointsAwarded {
  basePoints: number;
  bonusPoints: number;
  multiplier: number;
  totalPoints: number;
  xpEarned: number;
  reason: string;
  sourceType: 'workout_complete' | 'streak' | 'personal_record' | 'challenge' | 'social' | 'achievement';
  sourceId?: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'strength' | 'endurance' | 'social' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsReward: number;
  xpReward: number;
  unlocks?: Record<string, unknown>;
  unlockCriteria: Record<string, unknown>;
  isActive: boolean;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  achievement?: Achievement;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  streakStartDate?: Date;
  lastWorkoutDate?: Date;
  freezeAvailable: boolean;
  freezeUsedAt?: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  challengeType: 'individual' | 'group' | 'weekly' | 'monthly' | 'special';
  startDate: Date;
  endDate: Date;
  goalType: 'workouts' | 'minutes' | 'calories' | 'exercises' | 'points';
  goalValue: number;
  pointsReward: number;
  xpReward: number;
  difficultyLevel: number;
  minLevelRequired: number;
  isActive: boolean;
  maxParticipants?: number;
}

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  challenge?: Challenge;
  currentProgress: number;
  isCompleted: boolean;
  rankPosition?: number;
  joinedAt: Date;
  completedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  points: number;
  rank: number;
  change?: number; // posição ganha/perdida
}

export interface Leaderboard {
  type: 'daily' | 'weekly' | 'monthly' | 'all_time' | 'friends';
  periodStart?: Date;
  periodEnd?: Date;
  rankings: LeaderboardEntry[];
  lastCalculatedAt: Date;
}

// ============================================
// 3. PROGRESSION ENGINE TYPES
// ============================================

export interface PerformanceMetric {
  id: string;
  userId: string;
  exerciseCode: string;
  workoutSessionId?: string;
  weightKg?: number;
  repsCompleted: number;
  setsCompleted: number;
  durationSeconds: number;
  restTimeSeconds: number;
  difficultyRating: number; // 1-10
  fatigueLevel: number; // 1-10
  painLevel: number; // 0-10
  enjoymentRating: number; // 1-5
  heartRateAvg?: number;
  heartRateMax?: number;
  caloriesBurned?: number;
  timeOfDay: string;
  environmentalFactors?: Record<string, unknown>;
  createdAt: Date;
}

export interface ProgressionLevel {
  userId: string;
  exerciseCode: string;
  currentLevel: number;
  currentDifficulty: number;
  progressionHistory: ProgressionHistoryEntry[];
  estimated1RM?: number;
  maxRepsAchieved?: number;
  maxWeightAchieved?: number;
  plateauDetected: boolean;
  plateauStartDate?: Date;
  plateauInterventions: PlateauIntervention[];
  lastProgressionAt?: Date;
}

export interface ProgressionHistoryEntry {
  date: Date;
  previousLevel: number;
  newLevel: number;
  reason: string;
  metrics: Record<string, number>;
}

export interface PlateauIntervention {
  date: Date;
  type: 'variation' | 'deload' | 'new_exercise' | 'technique_focus';
  description: string;
  result?: 'success' | 'partial' | 'failed';
}

export interface MuscleBalance {
  userId: string;
  muscleGroupProgress: Record<string, number>;
  imbalancesDetected: MuscleImbalance[];
  correctionRecommendations: CorrectionRecommendation[];
  lastAnalysisAt?: Date;
}

export interface MuscleImbalance {
  weakGroup: string;
  strongGroup: string;
  ratio: number;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface CorrectionRecommendation {
  targetGroup: string;
  exercises: string[];
  frequency: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ProgressionAnalysis {
  currentCapacity: number;
  recommendedIncrease: number;
  confidenceLevel: number;
  reasoning: string[];
}

// ============================================
// 4. INJURY PREDICTOR TYPES
// ============================================

export interface InjuryRiskAssessment {
  id: string;
  userId: string;
  overallRiskScore: number; // 0-1
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  specificRisks: SpecificRisk[];
  riskFactors: RiskFactor[];
  preventionRecommendations: PreventionRecommendation[];
  automaticInterventions: AutomaticIntervention[];
  assessmentType: 'scheduled' | 'triggered' | 'manual';
  modelVersion: string;
  createdAt: Date;
}

export interface SpecificRisk {
  area: string;
  risk: number;
  factors: string[];
}

export interface PreventionRecommendation {
  type: 'rest' | 'deload' | 'exercise_swap' | 'technique' | 'recovery';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  exercises?: string[];
}

export interface AutomaticIntervention {
  type: string;
  appliedAt: Date;
  description: string;
  originalPlan: Record<string, unknown>;
  modifiedPlan: Record<string, unknown>;
}

export interface PainReport {
  id: string;
  userId: string;
  bodyArea: string;
  painLevel: number; // 1-10
  painType?: 'sharp' | 'dull' | 'burning' | 'aching' | 'throbbing';
  occurredDuring?: 'exercise' | 'rest' | 'daily_activity';
  relatedExerciseCode?: string;
  workoutSessionId?: string;
  description?: string;
  durationMinutes?: number;
  isRecurring: boolean;
  actionsTaken?: string[];
  createdAt: Date;
}

export interface OvertrainingPattern {
  userId: string;
  trainingLoad7d: number;
  trainingLoad28d: number;
  acuteChronicRatio: number;
  performanceDecline: boolean;
  increasedFatigue: boolean;
  sleepDisruption: boolean;
  moodChanges: boolean;
  overtrainingDetected: boolean;
  severity?: 'mild' | 'moderate' | 'severe';
  suggestedInterventions: string[];
}

export interface HolisticHealthData {
  userId: string;
  trackingDate: Date;
  sleepHours?: number;
  sleepQuality?: number; // 1-10
  stressLevel?: number; // 1-10
  nutritionQuality?: number; // 1-10
  hydrationMl?: number;
  proteinG?: number;
  recoveryScore?: number; // 1-100
  sorenessLevel?: number; // 1-10
  energyLevel?: number; // 1-10
}

// ============================================
// 5. SOCIAL HUB TYPES
// ============================================

export interface WorkoutGroup {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  isPublic: boolean;
  maxMembers: number;
  totalWorkouts: number;
  totalPoints: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  workoutsCompleted: number;
  pointsContributed: number;
  isActive: boolean;
  joinedAt: Date;
  // Dados do usuário (join)
  userName?: string;
  avatarUrl?: string;
}

export interface GroupChallenge {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  goalType: string;
  goalValue: number;
  startDate: Date;
  endDate: Date;
  currentProgress: number;
  isCompleted: boolean;
  rewards?: Record<string, unknown>;
  createdBy?: string;
  createdAt: Date;
}

export interface WorkoutBuddyProfile {
  userId: string;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredWorkoutTimes: string[];
  preferredWorkoutTypes: string[];
  goals: string[];
  locationCity?: string;
  locationCountry?: string;
  isLookingForBuddy: boolean;
  totalBuddyWorkouts: number;
  // Dados do usuário (join)
  userName?: string;
  avatarUrl?: string;
}

export interface BuddyConnection {
  id: string;
  userId: string;
  buddyId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  compatibilityScore?: number;
  workoutsTogether: number;
  createdAt: Date;
  updatedAt: Date;
  // Dados do buddy (join)
  buddyName?: string;
  buddyAvatarUrl?: string;
}

export interface WorkoutEncouragement {
  id: string;
  fromUserId: string;
  toUserId: string;
  messageType: 'cheer' | 'congratulation' | 'motivation' | 'custom';
  message?: string;
  emoji?: string;
  relatedWorkoutId?: string;
  relatedAchievementId?: string;
  isRead: boolean;
  createdAt: Date;
  // Dados do remetente (join)
  fromUserName?: string;
  fromUserAvatarUrl?: string;
}

// ============================================
// 5.1 COMPETITION & TOURNAMENT TYPES
// ============================================

export interface Competition {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'team' | 'bracket';
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  entryFeePoints: number;
  prizes?: CompetitionPrize[];
  rules?: string[];
  goalType: 'points' | 'workouts' | 'minutes' | 'calories';
  goalValue?: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
}

export interface CompetitionPrize {
  rank: number;
  description: string;
  points?: number;
  badge?: string;
  title?: string;
}

export interface CompetitionParticipation {
  id: string;
  competitionId: string;
  competition?: Competition;
  currentProgress: number;
  currentRank: number;
  pointsEarned: number;
  joinedAt: Date;
}

export interface CompetitionLeaderboardEntry {
  rank: number;
  oderId: string;
  userName: string;
  avatarUrl?: string;
  progress: number;
  pointsEarned: number;
  teamId?: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  bracketSize: 8 | 16 | 32 | 64;
  startDate: Date;
  matchDurationDays: number;
  prizes?: CompetitionPrize[];
  currentRound: number;
  status: 'registration' | 'active' | 'completed';
  createdBy: string;
}

export interface TournamentBracket {
  tournamentId: string;
  tournamentName: string;
  bracketSize: number;
  currentRound: number;
  status: string;
  rounds: TournamentRound[];
}

export interface TournamentRound {
  roundNumber: number;
  roundName: string;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  matchNumber: number;
  player1Id: string;
  player1Name?: string;
  player1Score: number;
  player2Id: string;
  player2Name?: string;
  player2Score: number;
  winnerId?: string;
  status: 'pending' | 'active' | 'completed';
  startDate?: Date;
  endDate?: Date;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  specialRewards?: Record<string, unknown>;
  challenges?: string[];
  leaderboardId?: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  eventType: 'workout' | 'challenge' | 'meetup' | 'webinar';
  maxParticipants?: number;
  currentParticipants: number;
  isVirtual: boolean;
  location?: string;
  meetingLink?: string;
  createdBy: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

// ============================================
// 6. PERFORMANCE DASHBOARD TYPES
// ============================================

export interface UserStatistics {
  userId: string;
  totalWorkouts: number;
  totalExercises: number;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  avgWorkoutDurationMinutes: number;
  avgDifficultyRating: number;
  avgEnjoymentRating: number;
  personalRecords: Record<string, PersonalRecord>;
  consistencyScore: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  strengthScore: number;
  enduranceScore: number;
  lastWorkoutAt?: Date;
}

export interface PersonalRecord {
  exerciseCode: string;
  exerciseName: string;
  recordType: 'weight' | 'reps' | 'duration' | 'volume';
  value: number;
  unit: string;
  achievedAt: Date;
  previousRecord?: number;
}

export interface ExerciseInsight {
  id: string;
  userId: string;
  insightType: 'pattern' | 'recommendation' | 'milestone' | 'warning' | 'tip';
  category?: 'performance' | 'consistency' | 'recovery' | 'nutrition' | 'social';
  title: string;
  description: string;
  actionItems: ActionItem[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relevanceScore: number;
  isRead: boolean;
  isDismissed: boolean;
  isActedUpon: boolean;
  validUntil?: Date;
  createdAt: Date;
}

export interface ActionItem {
  action: string;
  completed: boolean;
  completedAt?: Date;
}

export interface GoalPrediction {
  id: string;
  userId: string;
  goalType: 'weight_loss' | 'strength' | 'endurance' | 'consistency' | 'custom';
  goalDescription?: string;
  targetValue: number;
  currentValue: number;
  predictedCompletionDate?: Date;
  confidenceLevel: number;
  positiveFactors: string[];
  negativeFactors: string[];
  accelerationTips: string[];
}

export interface ExerciseBenchmark {
  ageGroup: string;
  gender: string;
  fitnessLevel: string;
  exerciseCode: string;
  metricType: 'avg_weight' | 'avg_reps' | 'avg_duration' | 'completion_rate';
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  sampleSize: number;
}

export interface UserBenchmarkComparison {
  exerciseCode: string;
  userValue: number;
  percentile: number;
  comparedTo: string; // descrição do grupo de comparação
  aboveAverage: boolean;
}

// ============================================
// 7. NOTIFICATION SYSTEM TYPES
// ============================================

export interface ExerciseNotification {
  id: string;
  userId: string;
  notificationType: 'reminder' | 'achievement' | 'social' | 'insight' | 'alert' | 'motivation';
  category?: string;
  title: string;
  body: string;
  icon?: string;
  actionUrl?: string;
  actionData?: Record<string, unknown>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  isRead: boolean;
  isSent: boolean;
  sentAt?: Date;
  readAt?: Date;
  scheduledFor?: Date;
  createdAt: Date;
}

export interface NotificationPreferences {
  userId: string;
  workoutReminders: boolean;
  achievementNotifications: boolean;
  socialNotifications: boolean;
  insightNotifications: boolean;
  injuryAlerts: boolean;
  motivationMessages: boolean;
  preferredReminderTimes: string[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  maxDailyNotifications: number;
}

// ============================================
// 8. FEEDBACK AND LEARNING TYPES
// ============================================

export interface ExerciseFeedback {
  id: string;
  userId: string;
  exerciseCode?: string;
  workoutSessionId?: string;
  overallRating?: number; // 1-5
  difficultyRating?: number; // 1-10
  enjoymentRating?: number; // 1-5
  comments?: string;
  wasSkipped: boolean;
  wasModified: boolean;
  modificationDetails?: Record<string, unknown>;
  wouldDoAgain?: boolean;
  suggestedChanges?: string;
  createdAt: Date;
}

export interface UserFeedback {
  id: string;
  exerciseCode: string;
  type: string;
  rating: number;
  difficulty?: number;
  enjoyment?: number;
  wouldRepeat?: boolean;
  comment?: string;
  tags?: string[];
  createdAt: Date;
}

export interface ExercisePreference {
  exerciseCode: string;
  muscleGroup?: string;
  preferenceScore: number; // 0-1
  confidence: number; // 0-1
  lastUpdated: Date;
  factors?: Record<string, unknown>;
}

export interface LearningInsight {
  type: 'favorites' | 'avoided' | 'difficulty' | 'satisfaction' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  recommendation?: string;
}

export interface ABTestVariant {
  testId: string;
  testName: string;
  variant: string;
  startDate: Date;
  endDate?: Date;
}

export interface NotificationTiming {
  recommendedHour: number;
  confidence: number;
  reason: string;
  alternativeHours?: number[];
}

export interface WorkoutABTest {
  id: string;
  testName: string;
  description?: string;
  variantA: Record<string, unknown>;
  variantB: Record<string, unknown>;
  successMetric: 'completion_rate' | 'enjoyment' | 'effectiveness';
  status: 'active' | 'completed' | 'cancelled';
  variantAParticipants: number;
  variantBParticipants: number;
  variantASuccessRate?: number;
  variantBSuccessRate?: number;
  winner?: 'A' | 'B';
  startDate: Date;
  endDate?: Date;
}

export interface ABTestParticipation {
  testId: string;
  userId: string;
  assignedVariant: 'A' | 'B';
  completed: boolean;
  successValue?: number;
}

// ============================================
// 9. SERVICE INTERFACES
// ============================================

export interface AIEngine {
  analyzeUserState(userId: string, contextData: ContextData): Promise<UserAnalysis>;
  adaptWorkout(workoutPlan: WorkoutPlan, userState: UserAnalysis): Promise<AdaptedWorkout>;
  processUserFeedback(feedback: ExerciseFeedback): Promise<void>;
  predictOptimalTiming(userId: string): Promise<OptimalTiming>;
  generateRecommendations(userId: string, goals: string[]): Promise<string[]>;
}

export interface GamificationModule {
  awardPoints(userId: string, activity: string, performance: PerformanceMetric): Promise<PointsAwarded>;
  checkAchievements(userId: string): Promise<Achievement[]>;
  createChallenge(challenge: Partial<Challenge>): Promise<Challenge>;
  updateLeaderboards(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<void>;
  generateMotivationalContent(userId: string): Promise<string>;
}

export interface ProgressionEngine {
  analyzePerformance(userId: string, exerciseCode: string): Promise<ProgressionAnalysis>;
  calculateNextProgression(currentLevel: ProgressionLevel): Promise<ProgressionLevel>;
  detectPlateau(userId: string, exerciseCode: string, days: number): Promise<boolean>;
  balanceProgression(userId: string): Promise<MuscleBalance>;
  explainProgression(change: ProgressionHistoryEntry): string;
}

export interface InjuryPredictor {
  assessRisk(userId: string): Promise<InjuryRiskAssessment>;
  monitorPatterns(userId: string, days: number): Promise<OvertrainingPattern>;
  suggestPrevention(riskFactors: RiskFactor[]): Promise<PreventionRecommendation[]>;
  analyzeRecovery(userId: string): Promise<HolisticHealthData>;
  integrateHolisticData(userId: string): Promise<InjuryRiskAssessment>;
}

export interface SocialHub {
  createGroup(group: Partial<WorkoutGroup>): Promise<WorkoutGroup>;
  joinGroup(groupId: string, userId: string): Promise<GroupMember>;
  findBuddies(userId: string): Promise<WorkoutBuddyProfile[]>;
  sendEncouragement(encouragement: Partial<WorkoutEncouragement>): Promise<WorkoutEncouragement>;
  getGroupChallenges(groupId: string): Promise<GroupChallenge[]>;
}

export interface PerformanceDashboard {
  getUserStatistics(userId: string): Promise<UserStatistics>;
  getInsights(userId: string): Promise<ExerciseInsight[]>;
  getPredictions(userId: string): Promise<GoalPrediction[]>;
  getBenchmarkComparison(userId: string, exerciseCode: string): Promise<UserBenchmarkComparison>;
  exportReport(userId: string, format: 'pdf' | 'json' | 'csv'): Promise<Blob>;
}

// ============================================
// 10. HELPER TYPES
// ============================================

export interface WorkoutPlan {
  id: string;
  exercises: PlannedExercise[];
  totalDuration: number;
  difficulty: number;
}

export interface PlannedExercise {
  exerciseCode: string;
  sets: number;
  reps: string;
  restTime: number;
  weight?: number;
  notes?: string;
}

export interface AdaptedWorkout extends WorkoutPlan {
  adaptations: WorkoutAdaptation[];
  originalPlan: WorkoutPlan;
  adaptationReason: string;
}

export interface OptimalTiming {
  bestTimes: string[];
  worstTimes: string[];
  reasoning: string;
  confidenceScore: number;
}

// Export all types
export type {
  ContextData,
  WeatherData,
  UserAnalysis,
  RiskFactor,
  WorkoutAdaptation,
  UserLearningModel,
  GamificationPoints,
  Multiplier,
  PointsAwarded,
  Achievement,
  UserAchievement,
  Streak,
  Challenge,
  ChallengeParticipation,
  LeaderboardEntry,
  Leaderboard,
  PerformanceMetric,
  ProgressionLevel,
  ProgressionHistoryEntry,
  PlateauIntervention,
  MuscleBalance,
  MuscleImbalance,
  CorrectionRecommendation,
  ProgressionAnalysis,
  InjuryRiskAssessment,
  SpecificRisk,
  PreventionRecommendation,
  AutomaticIntervention,
  PainReport,
  OvertrainingPattern,
  HolisticHealthData,
  WorkoutGroup,
  GroupMember,
  GroupChallenge,
  WorkoutBuddyProfile,
  BuddyConnection,
  WorkoutEncouragement,
  UserStatistics,
  PersonalRecord,
  ExerciseInsight,
  ActionItem,
  GoalPrediction,
  ExerciseBenchmark,
  UserBenchmarkComparison,
  ExerciseNotification,
  NotificationPreferences,
  ExerciseFeedback,
  WorkoutABTest,
  ABTestParticipation,
  WorkoutPlan,
  PlannedExercise,
  AdaptedWorkout,
  OptimalTiming,
};
