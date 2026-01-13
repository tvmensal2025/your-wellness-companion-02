// =====================================================
// DR. VITAL REVOLUTION - TypeScript Types
// =====================================================

// =====================================================
// HEALTH SCORE TYPES
// =====================================================

export interface HealthScoreBreakdown {
  nutrition: number;  // 0-25
  exercise: number;   // 0-25
  sleep: number;      // 0-25
  mental: number;     // 0-25
}

export interface HealthScoreData {
  id: string;
  userId: string;
  score: number;           // 0-100
  breakdown: HealthScoreBreakdown;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  previousScore?: number;
}

export type ScoreColor = 'red' | 'yellow' | 'green';

export interface MetricCard {
  id: string;
  type: 'weight' | 'sleep' | 'exercise' | 'nutrition' | 'mood';
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue?: number;
  isAlert: boolean;
  alertMessage?: string;
  icon: string;
}

// =====================================================
// GAMIFICATION TYPES
// =====================================================

export type MissionType = 'daily' | 'weekly' | 'boss_battle' | 'achievement';

export interface HealthMission {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: MissionType;
  xpReward: number;
  progress: number;        // 0-100
  isCompleted: boolean;
  completedAt?: Date;
  expiresAt?: Date;
  relatedExamId?: string;  // For boss battles
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface HealthStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
  totalXpEarned: number;
  currentLevel: number;
  updatedAt: Date;
}

export interface HealthLevel {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  title: string;
  unlockedFeatures: string[];
  progressPercentage: number;
}

export type AchievementCategory = 'nutrition' | 'exercise' | 'consistency' | 'milestones';

export interface Achievement {
  id: string;
  achievementKey: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  unlockedAt?: Date;
  isUnlocked: boolean;
  reward?: {
    type: 'xp' | 'avatar_item' | 'badge';
    value: string | number;
  };
}

// Level titles based on level number (masculine)
export const LEVEL_TITLES_MASC: Record<number, string> = {
  1: 'Iniciante',
  2: 'Aprendiz',
  3: 'Praticante',
  4: 'Dedicado',
  5: 'Guerreiro da Saúde',
  6: 'Mestre do Bem-Estar',
  7: 'Campeão Vital',
  8: 'Lenda da Saúde',
  9: 'Guardião do Corpo',
  10: 'Imortal Saudável',
};

// Level titles based on level number (feminine)
export const LEVEL_TITLES_FEM: Record<number, string> = {
  1: 'Iniciante',
  2: 'Aprendiz',
  3: 'Praticante',
  4: 'Dedicada',
  5: 'Guerreira da Saúde',
  6: 'Mestra do Bem-Estar',
  7: 'Campeã Vital',
  8: 'Lenda da Saúde',
  9: 'Guardiã do Corpo',
  10: 'Imortal Saudável',
};

// Default export for backward compatibility
export const LEVEL_TITLES = LEVEL_TITLES_MASC;

// Helper function to get level title by gender
export const getLevelTitleByGender = (level: number, gender: string | null | undefined): string => {
  const isFeminine = gender && ['feminino', 'female', 'f'].includes(gender.toLowerCase());
  const titles = isFeminine ? LEVEL_TITLES_FEM : LEVEL_TITLES_MASC;
  return titles[level] || titles[1];
};

// =====================================================
// PREDICTION TYPES
// =====================================================

export type RiskTimeframe = '3_months' | '6_months' | '1_year';
export type RiskImpact = 'high' | 'medium' | 'low';

export interface RiskFactor {
  name: string;
  impact: RiskImpact;
  currentValue: number;
  idealValue: number;
  unit: string;
  description?: string;
}

export interface HealthPrediction {
  id: string;
  userId: string;
  riskType: string;
  probability: number;     // 0-100
  timeframe: RiskTimeframe;
  factors: RiskFactor[];
  recommendations: string[];
  isActive: boolean;
  calculatedAt: Date;
}

export interface WhatIfChange {
  factor: string;
  currentValue: number;
  newValue: number;
}

export interface WhatIfSimulation {
  inputChanges: WhatIfChange[];
  originalPredictions: HealthPrediction[];
  simulatedPredictions: HealthPrediction[];
  improvementPercentage: number;
  insights: string[];
}

export interface HealthyTwinMetrics {
  weight: number;
  bmi: number;
  bodyFat: number;
  sleepHours: number;
  exerciseMinutes: number;
  waterIntake: number;
  stressLevel: number;
}

export interface HealthyTwin {
  demographics: {
    age: number;
    gender: string;
    height: number;
  };
  idealMetrics: HealthyTwinMetrics;
  comparisonScore: number; // 0-100, how close user is to ideal
  gaps: Array<{
    metric: string;
    userValue: number;
    idealValue: number;
    gap: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// =====================================================
// AVATAR TYPES
// =====================================================

export type AvatarState = 'idle' | 'thinking' | 'talking' | 'listening' | 'celebrating' | 'concerned';
export type AvatarMood = 'happy' | 'neutral' | 'concerned' | 'excited';

export interface AvatarCustomization {
  id: string;
  userId: string;
  currentOutfit: string;
  currentAccessory?: string;
  currentBackground: string;
  unlockedItems: string[];
  updatedAt: Date;
}

export interface AvatarItem {
  id: string;
  name: string;
  type: 'outfit' | 'accessory' | 'background';
  previewUrl: string;
  unlockRequirement?: {
    type: 'level' | 'achievement' | 'streak';
    value: number | string;
  };
}

// =====================================================
// WEARABLE TYPES
// =====================================================

export type WearableProvider = 'apple_health' | 'google_fit' | 'garmin';

export interface HeartRateData {
  current: number;
  resting: number;
  max: number;
}

export interface SleepData {
  totalHours: number;
  deepSleep: number;
  remSleep: number;
  lightSleep: number;
  quality: number; // 0-100
}

export interface WearableData {
  id: string;
  userId: string;
  provider: WearableProvider;
  heartRate?: HeartRateData;
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  sleepData?: SleepData;
  dataDate: Date;
  syncedAt: Date;
  rawData?: Record<string, unknown>;
}

export type AnomalySeverity = 'warning' | 'alert';
export type AnomalyType = 'heart_rate' | 'sleep' | 'activity' | 'pattern';

export interface WearableAnomaly {
  type: AnomalyType;
  severity: AnomalySeverity;
  value: number;
  threshold: number;
  message: string;
  detectedAt: Date;
  recommendation?: string;
}

// =====================================================
// VOICE ASSISTANT TYPES
// =====================================================

export interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  error?: string;
}

export interface VoiceAssistantConfig {
  language: 'pt-BR';
  autoSend: boolean;
  enableTTS: boolean;
  voiceSpeed: number;
}

// =====================================================
// NOTIFICATION TYPES
// =====================================================

export type NotificationType = 
  | 'morning_briefing'
  | 'medication_reminder'
  | 'contextual_reminder'
  | 're_engagement'
  | 'weekly_report'
  | 'urgent_exam'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'level_up';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SmartNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  scheduledFor: Date;
  sentAt?: Date;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// =====================================================
// TIMELINE TYPES
// =====================================================

export type TimelineEventType = 
  | 'weight_change'
  | 'exam_result'
  | 'achievement'
  | 'goal_reached'
  | 'consultation'
  | 'medication_change'
  | 'level_up'
  | 'streak_milestone'
  | 'prediction_improved';

export interface TimelineEvent {
  id: string;
  userId: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  eventDate: Date;
  isMilestone: boolean;
  metadata: Record<string, unknown>;
  icon: string;
  createdAt: Date;
}

export interface TimelineFilter {
  types?: TimelineEventType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  milestonesOnly?: boolean;
}

export interface TimelineComparison {
  period1: {
    start: Date;
    end: Date;
    events: TimelineEvent[];
    summary: {
      totalEvents: number;
      achievements: number;
      avgHealthScore: number;
    };
  };
  period2: {
    start: Date;
    end: Date;
    events: TimelineEvent[];
    summary: {
      totalEvents: number;
      achievements: number;
      avgHealthScore: number;
    };
  };
  insights: string[];
  improvement: number; // percentage
}

// =====================================================
// REPORT TYPES
// =====================================================

export type ReportType = 'complete' | 'summary' | 'exam_focused';

export interface HealthReport {
  id: string;
  userId: string;
  type: ReportType;
  period: {
    start: Date;
    end: Date;
  };
  pdfUrl?: string;
  shareableLink?: string;
  accessToken?: string;
  expiresAt?: Date;
  downloadCount: number;
  aiAnalysis: string;
  recommendations: string[];
  createdAt: Date;
}

export interface ShareableReportAccess {
  reportId: string;
  accessToken: string;
  expiresAt: Date;
  accessedAt?: Date;
  accessedBy?: string;
}

// =====================================================
// CHAT ENHANCEMENT TYPES
// =====================================================

export interface SuggestedQuestion {
  id: string;
  text: string;
  category: 'health' | 'nutrition' | 'exercise' | 'exams' | 'general';
  relevanceScore: number;
  basedOn?: string; // What data point triggered this suggestion
}

export interface DiscoveryInsight {
  id: string;
  title: string;
  description: string;
  type: 'pattern' | 'correlation' | 'improvement' | 'warning';
  confidence: number;
  relatedData: string[];
  actionable: boolean;
  suggestedAction?: string;
}

export interface ChatContext {
  recentMessages: number;
  hasNewData: boolean;
  newDataTypes: string[];
  userProfile: {
    hasWeightData: boolean;
    hasExamData: boolean;
    hasExerciseData: boolean;
    hasNutritionData: boolean;
    hasSleepData: boolean;
  };
}

// =====================================================
// ERROR TYPES
// =====================================================

export type DrVitalErrorCode = 
  | 'HEALTH_SCORE_CALCULATION_FAILED'
  | 'MISSION_UPDATE_FAILED'
  | 'PREDICTION_UNAVAILABLE'
  | 'WEARABLE_SYNC_FAILED'
  | 'VOICE_RECOGNITION_FAILED'
  | 'REPORT_GENERATION_FAILED'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND';

export interface DrVitalError {
  code: DrVitalErrorCode;
  message: string;
  userMessage: string;
  retryable: boolean;
  retryAfter?: number;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Database row types (for Supabase queries)
export interface HealthScoreRow {
  id: string;
  user_id: string;
  score: number;
  nutrition_score: number;
  exercise_score: number;
  sleep_score: number;
  mental_score: number;
  calculated_at: string;
  created_at: string;
}

export interface HealthMissionRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: MissionType;
  xp_reward: number;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
  expires_at: string | null;
  related_exam_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface HealthStreakRow {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  total_xp_earned: number;
  current_level: number;
  updated_at: string;
}

export interface HealthAchievementRow {
  id: string;
  user_id: string;
  achievement_key: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: AchievementCategory;
  unlocked_at: string;
}

export interface HealthPredictionRow {
  id: string;
  user_id: string;
  risk_type: string;
  probability: number;
  timeframe: RiskTimeframe;
  factors: RiskFactor[];
  recommendations: string[];
  is_active: boolean;
  calculated_at: string;
}

export interface TimelineEventRow {
  id: string;
  user_id: string;
  event_type: TimelineEventType;
  title: string;
  description: string | null;
  event_date: string;
  is_milestone: boolean;
  metadata: Record<string, unknown>;
  icon: string | null;
  created_at: string;
}

export interface NotificationQueueRow {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  scheduled_for: string;
  sent_at: string | null;
  read_at: string | null;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SharedReportRow {
  id: string;
  user_id: string;
  report_type: ReportType;
  period_start: string;
  period_end: string;
  pdf_url: string | null;
  access_token: string | null;
  expires_at: string | null;
  download_count: number;
  ai_analysis: string | null;
  recommendations: string[];
  created_at: string;
}

export interface WearableDataRow {
  id: string;
  user_id: string;
  provider: WearableProvider;
  heart_rate_current: number | null;
  heart_rate_resting: number | null;
  heart_rate_max: number | null;
  steps: number | null;
  active_minutes: number | null;
  calories_burned: number | null;
  sleep_hours: number | null;
  sleep_deep_hours: number | null;
  sleep_rem_hours: number | null;
  sleep_quality: number | null;
  synced_at: string;
  data_date: string;
  raw_data: Record<string, unknown>;
}

export interface AvatarCustomizationRow {
  id: string;
  user_id: string;
  current_outfit: string;
  current_accessory: string | null;
  current_background: string;
  unlocked_items: string[];
  updated_at: string;
}
