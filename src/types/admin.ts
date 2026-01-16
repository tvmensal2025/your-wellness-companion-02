/**
 * Tipos TypeScript para componentes administrativos
 * @description Interfaces para PlatformAudit, SessionAnalytics, CourseManagement, GoalManagement, CompanyConfiguration
 */

// ============================================
// PlatformAudit Types
// ============================================

export interface AuditLog {
  id: string;
  action: string;
  user_id: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditFilter {
  action?: string;
  user_id?: string;
  target_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

export interface AuditStats {
  total_actions: number;
  actions_today: number;
  unique_users: number;
  most_common_action: string;
}

// ============================================
// SessionAnalytics Types
// ============================================

export interface SessionMetrics {
  total_sessions: number;
  completed_sessions: number;
  average_duration: number;
  completion_rate: number;
  active_users: number;
}

export interface DailySessionStat {
  date: string;
  count: number;
  completed: number;
  average_duration?: number;
}

export interface UserSessionBreakdown {
  user_id: string;
  user_name: string;
  user_email?: string;
  sessions_completed: number;
  total_time: number;
  last_session_date?: string;
}

export interface SessionAnalyticsData {
  metrics: SessionMetrics;
  daily_stats: DailySessionStat[];
  user_breakdown: UserSessionBreakdown[];
  period_start?: string;
  period_end?: string;
}

export interface SessionAnalyticsFilter {
  period?: 'day' | 'week' | 'month' | 'year';
  user_id?: string;
  session_type?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================
// CourseManagement Types
// ============================================

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  category: string;
  difficulty_level: string;
  duration_minutes: number;
  instructor_name: string;
  is_premium: boolean;
  is_published: boolean;
  price: number;
  modules_count?: number;
  lessons_count?: number;
  enrollments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminCourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: AdminCourseLesson[];
  created_at: string;
}

export interface AdminCourseLesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'text' | 'quiz' | 'exercise';
  content_url?: string;
  video_url?: string;
  duration_minutes?: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_lessons: string[];
  started_at: string;
  completed_at?: string;
  user?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CourseStats {
  total_enrollments: number;
  active_students: number;
  completion_rate: number;
  average_progress: number;
  revenue?: number;
}

// ============================================
// GoalManagement Types
// ============================================

export interface AdminGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at?: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface GoalProgress {
  goal_id: string;
  progress_percentage: number;
  days_remaining?: number;
  on_track: boolean;
  trend?: 'improving' | 'stable' | 'declining';
  last_update?: string;
}

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  goal_type: string;
  default_target: number;
  unit: string;
  duration_days: number;
  is_active: boolean;
}

export interface GoalStats {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  completion_rate: number;
  average_progress: number;
}

// ============================================
// CompanyConfiguration Types
// ============================================

export interface CompanyConfig {
  id: string;
  company_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color?: string;
  features_enabled: string[];
  settings: CompanySettings;
  contact_email?: string;
  support_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  allow_registration: boolean;
  require_email_verification: boolean;
  enable_gamification: boolean;
  enable_challenges: boolean;
  enable_courses: boolean;
  enable_sessions: boolean;
  enable_nutrition: boolean;
  enable_exercise: boolean;
  enable_dr_vital: boolean;
  enable_sofia: boolean;
  max_users?: number;
  custom_domain?: string;
  analytics_enabled: boolean;
  [key: string]: unknown;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage?: number;
  target_users?: string[];
  created_at: string;
}

// ============================================
// User Management Types (Admin)
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: 'user' | 'moderator' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  subscription_status?: string;
  total_points?: number;
  level?: number;
}

export interface UserActivity {
  user_id: string;
  action: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  new_users_today: number;
  new_users_week: number;
  premium_users: number;
  retention_rate: number;
}

// ============================================
// Dashboard Types (Admin)
// ============================================

export interface AdminDashboardData {
  user_stats: UserStats;
  session_metrics: SessionMetrics;
  goal_stats: GoalStats;
  course_stats: CourseStats;
  recent_activity: UserActivity[];
  system_health: SystemHealthData;
}

export interface SystemHealthData {
  database_size: string;
  storage_used: string;
  api_latency: number;
  error_rate: number;
  uptime: number;
  last_backup?: string;
}

// ============================================
// Webhook Types (Admin)
// ============================================

export interface AdminWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret?: string;
  last_triggered?: string;
  failure_count: number;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event: string;
  payload: Record<string, unknown>;
  response_status?: number;
  response_body?: string;
  success: boolean;
  triggered_at: string;
}

// ============================================
// Challenge Management Types (Admin)
// ============================================

export interface AdminChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  points_reward: number;
  xp_reward: number;
  badge_id?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_featured: boolean;
  max_participants?: number;
  current_participants: number;
  completion_criteria: Record<string, unknown>;
  created_at: string;
}

export interface ChallengeParticipation {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  points_earned: number;
  started_at: string;
  completed_at?: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface ChallengeStats {
  total_challenges: number;
  active_challenges: number;
  total_participations: number;
  completion_rate: number;
  points_distributed: number;
}
