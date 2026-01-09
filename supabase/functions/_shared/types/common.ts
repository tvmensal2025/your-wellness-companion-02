/**
 * Common types shared across edge functions
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * User context from JWT
 */
export interface UserContext {
  userId: string;
  email?: string;
  role?: string;
}

/**
 * AI Configuration from database
 */
export interface AIConfiguration {
  service: string;
  model: string;
  max_tokens: number;
  temperature: number;
  system_prompt?: string;
  is_enabled: boolean;
}

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

/**
 * Medical exam metric
 */
export interface ExamMetric {
  name: string;
  value: string;
  unit?: string;
  reference?: string;
  status: "normal" | "elevated" | "low" | "critical";
  how_it_works?: string;
}

/**
 * Medical exam section
 */
export interface ExamSection {
  title: string;
  icon?: string;
  metrics: ExamMetric[];
}

/**
 * Structured medical exam data
 */
export interface StructuredExamData {
  patient_name?: string;
  exam_date?: string;
  laboratory?: string;
  sections: ExamSection[];
  summary?: string;
}

/**
 * WhatsApp message types
 */
export type WhatsAppMessageType = 
  | "text" 
  | "image" 
  | "audio" 
  | "video" 
  | "document" 
  | "location" 
  | "sticker";

/**
 * WhatsApp incoming message
 */
export interface WhatsAppMessage {
  from: string;
  type: WhatsAppMessageType;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  timestamp: string;
}

/**
 * Notification types
 */
export type NotificationType = 
  | "reminder" 
  | "motivation" 
  | "achievement" 
  | "goal" 
  | "celebration";

/**
 * Notification payload
 */
export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}
