/**
 * Tipos TypeScript para UserSessions e SessionTemplates
 * @description Interfaces para gerenciamento de sessões de usuário e templates
 */

// ============================================
// UserSession Types
// ============================================

export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  status: SessionStatus;
  progress: number;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  auto_save_data?: Record<string, unknown>;
  cycle_number: number;
  next_available_date?: string;
  is_locked: boolean;
  review_count: number;
  tools_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface UserSessionWithDetails extends UserSession {
  session?: SessionTemplate;
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface SessionAssignment {
  user_id: string;
  session_id: string;
  status?: SessionStatus;
  progress?: number;
  cycle_number?: number;
}

// ============================================
// SessionTemplate Types
// ============================================

export type SessionDifficulty = 'easy' | 'medium' | 'hard';
export type SessionType = 'coaching' | 'therapy' | 'assessment' | 'exercise' | 'meditation' | 'reflection';
export type SectionType = 'intro' | 'questions' | 'exercise' | 'reflection' | 'summary' | 'tool';
export type QuestionType = 'text' | 'scale' | 'multiple_choice' | 'checkbox' | 'rating' | 'date' | 'time';

export interface SessionTemplate {
  id: string;
  title: string;
  description: string;
  type: SessionType | string;
  content: SessionContent;
  target_saboteurs?: string[];
  difficulty: SessionDifficulty;
  estimated_time: number;
  is_active: boolean;
  order_index?: number;
  category?: string;
  tags?: string[];
  prerequisites?: string[];
  created_at: string;
  updated_at?: string;
}

export interface SessionContent {
  sections: SessionSection[];
  tools?: SessionToolConfig[];
  intro_text?: string;
  outro_text?: string;
  resources?: SessionResource[];
}

export interface SessionSection {
  id: string;
  title: string;
  type: SectionType;
  content: string;
  questions?: SessionQuestion[];
  order_index: number;
  is_required?: boolean;
  estimated_time?: number;
  tool_id?: string;
}

export interface SessionQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[] | QuestionOption[];
  required: boolean;
  placeholder?: string;
  min_value?: number;
  max_value?: number;
  validation_regex?: string;
  help_text?: string;
  conditional_on?: {
    question_id: string;
    value: string | number | boolean;
  };
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface SessionToolConfig {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  is_required?: boolean;
  order_index?: number;
}

export interface SessionResource {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'document' | 'link' | 'image';
  url: string;
  description?: string;
}

// ============================================
// Session Response Types
// ============================================

export interface SessionResponse {
  id: string;
  user_id: string;
  session_id: string;
  section_id: string;
  question_id: string;
  answer: string | number | boolean | string[];
  answered_at: string;
  points_earned?: number;
}

export interface SessionAttempt {
  id: string;
  user_session_id: string;
  started_at: string;
  completed_at?: string;
  responses: SessionResponse[];
  score?: number;
  feedback?: string;
}

// ============================================
// Session Progress Types
// ============================================

export interface SessionProgress {
  session_id: string;
  user_id: string;
  total_sections: number;
  completed_sections: number;
  current_section_id?: string;
  progress_percentage: number;
  time_spent: number;
  last_activity?: string;
}

export interface SessionCompletionData {
  session_id: string;
  user_id: string;
  completed_at: string;
  total_time: number;
  score?: number;
  responses_count: number;
  tools_completed: string[];
  insights?: string[];
  next_session_id?: string;
}

// ============================================
// Session Analytics Types
// ============================================

export interface SessionAnalytics {
  session_id: string;
  total_attempts: number;
  completion_rate: number;
  average_time: number;
  average_score?: number;
  drop_off_sections: {
    section_id: string;
    drop_off_rate: number;
  }[];
}

export interface UserSessionStats {
  user_id: string;
  total_sessions: number;
  completed_sessions: number;
  in_progress_sessions: number;
  total_time_spent: number;
  average_score?: number;
  streak_days: number;
  last_session_date?: string;
}

// ============================================
// Session Filter Types
// ============================================

export interface SessionFilter {
  status?: SessionStatus | SessionStatus[];
  type?: SessionType | string;
  difficulty?: SessionDifficulty;
  is_active?: boolean;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UserSessionFilter {
  user_id?: string;
  session_id?: string;
  status?: SessionStatus | SessionStatus[];
  is_locked?: boolean;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// Session Action Types
// ============================================

export interface StartSessionPayload {
  user_id: string;
  session_id: string;
}

export interface CompleteSessionPayload {
  user_session_id: string;
  responses?: SessionResponse[];
  tools_data?: Record<string, unknown>;
}

export interface SaveProgressPayload {
  user_session_id: string;
  progress: number;
  current_section_id?: string;
  auto_save_data?: Record<string, unknown>;
}
