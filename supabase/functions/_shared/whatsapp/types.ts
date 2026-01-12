// ============================================
// WhatsApp Hybrid Integration - Shared Types
// ============================================

// ============================================
// Provider Types
// ============================================

export type WhatsAppProvider = 'evolution' | 'whapi';

export interface ProviderConfig {
  activeProvider: WhatsAppProvider;
  evolutionEnabled: boolean;
  whapiEnabled: boolean;
  evolutionApiUrl?: string;
  evolutionInstance?: string;
  evolutionHealthStatus?: 'healthy' | 'unhealthy' | 'unknown';
  whapiApiUrl?: string;
  whapiHealthStatus?: 'healthy' | 'unhealthy' | 'unknown';
}

// ============================================
// Message Content Types
// ============================================

export interface TextContent {
  body: string;
  previewUrl?: boolean;
}

export interface MediaContent {
  url?: string;
  base64?: string;
  caption?: string;
  fileName?: string;
  mimeType?: string;
}

export interface ButtonAction {
  buttons: Array<{
    type: 'quick_reply' | 'call' | 'url' | 'copy';
    id: string;
    title: string;
    payload?: string; // phone_number for call, url for url type, text for copy
  }>;
}

export interface ListAction {
  label: string; // Button text to open list
  sections: Array<{
    title: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
}

export interface CarouselCard {
  id: string;
  media: string; // URL or base64
  text: string;
  buttons: ButtonAction['buttons'];
}

export interface CarouselAction {
  cards: CarouselCard[];
}

export interface InteractiveContent {
  type: 'button' | 'list' | 'carousel';
  header?: {
    type?: 'text' | 'image' | 'video' | 'document';
    text?: string;
    media?: string;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: ButtonAction | ListAction | CarouselAction;
}

export type MessageContent = TextContent | MediaContent | InteractiveContent;

// ============================================
// Send Message Payload
// ============================================

export type MessageType = 'text' | 'image' | 'document' | 'audio' | 'video' | 'interactive';

export interface SendMessagePayload {
  phone: string;
  userId?: string;
  messageType: MessageType;
  content: MessageContent;
  templateKey?: string;
  context?: Record<string, any>;
  priority?: number; // 1-10, lower = higher priority
  metadata?: Record<string, any>;
}

// ============================================
// Send Result
// ============================================

export interface SendResult {
  success: boolean;
  messageId?: string;
  provider: WhatsAppProvider;
  logId?: string;
  error?: string;
  errorCode?: WhatsAppErrorCode;
  queued?: boolean;
  estimatedWaitMs?: number;
  retryCount?: number;
}

// ============================================
// Error Types
// ============================================

export enum WhatsAppErrorCode {
  // Provider Errors
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
  PROVIDER_AUTH_FAILED = 'PROVIDER_AUTH_FAILED',
  PROVIDER_RATE_LIMITED = 'PROVIDER_RATE_LIMITED',
  PROVIDER_TIMEOUT = 'PROVIDER_TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Validation Errors
  INVALID_PHONE_FORMAT = 'INVALID_PHONE_FORMAT',
  INVALID_MESSAGE_TYPE = 'INVALID_MESSAGE_TYPE',
  INVALID_CONTENT = 'INVALID_CONTENT',
  BUTTON_LIMIT_EXCEEDED = 'BUTTON_LIMIT_EXCEEDED',
  LIST_LIMIT_EXCEEDED = 'LIST_LIMIT_EXCEEDED',
  CAROUSEL_LIMIT_EXCEEDED = 'CAROUSEL_LIMIT_EXCEEDED',
  
  // Delivery Errors
  NUMBER_NOT_ON_WHATSAPP = 'NUMBER_NOT_ON_WHATSAPP',
  MESSAGE_REJECTED = 'MESSAGE_REJECTED',
  MEDIA_TOO_LARGE = 'MEDIA_TOO_LARGE',
  MEDIA_INVALID_FORMAT = 'MEDIA_INVALID_FORMAT',
  
  // Internal Errors
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  WEBHOOK_PROCESSING_FAILED = 'WEBHOOK_PROCESSING_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  
  // Rate Limit Errors
  RATE_LIMITED = 'RATE_LIMITED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  DAILY_LIMIT_EXCEEDED = 'DAILY_LIMIT_EXCEEDED',
}

export interface WhatsAppError {
  code: WhatsAppErrorCode;
  message: string;
  provider: WhatsAppProvider;
  httpStatus?: number;
  retryable: boolean;
  originalError?: any;
  timestamp: string;
}

// Helper to create WhatsAppError
export function createWhatsAppError(
  code: WhatsAppErrorCode,
  message: string,
  provider: WhatsAppProvider,
  options?: {
    httpStatus?: number;
    retryable?: boolean;
    originalError?: any;
  }
): WhatsAppError {
  const retryableCodes = [
    WhatsAppErrorCode.PROVIDER_UNAVAILABLE,
    WhatsAppErrorCode.PROVIDER_RATE_LIMITED,
    WhatsAppErrorCode.PROVIDER_TIMEOUT,
    WhatsAppErrorCode.NETWORK_ERROR,
    WhatsAppErrorCode.RATE_LIMITED,
    WhatsAppErrorCode.MESSAGE_REJECTED,
  ];
  
  return {
    code,
    message,
    provider,
    httpStatus: options?.httpStatus,
    retryable: options?.retryable ?? retryableCodes.includes(code),
    originalError: options?.originalError,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// Connection Status
// ============================================

export interface ConnectionStatus {
  connected: boolean;
  provider: WhatsAppProvider;
  state: string | null;
  lastCheck: string;
  error?: string;
}

// ============================================
// Rate Limit Types
// ============================================

export interface RateLimitConfig {
  minDelayMs: number;           // 1200ms between messages
  maxMessagesPerHour: number;   // 200
  maxMessagesPerDay: number;    // 1000
}

export interface RateLimitResult {
  allowed: boolean;
  queued: boolean;
  estimatedWaitMs?: number;
  reason?: string;
  currentCount?: {
    lastMinute: number;
    lastHour: number;
    today: number;
  };
}

// ============================================
// Webhook Types
// ============================================

export type WebhookEventType = 'message' | 'button_reply' | 'list_reply' | 'status' | 'unknown';

export interface WebhookPayload {
  provider: WhatsAppProvider;
  event: WebhookEventType;
  data: any; // Raw provider-specific data
}

export interface ButtonReplyData {
  messageId: string;
  buttonId: string;
  buttonTitle: string;
  from: string;
  timestamp: number;
  userId?: string;
}

export interface ListReplyData {
  messageId: string;
  rowId: string;
  rowTitle: string;
  rowDescription?: string;
  from: string;
  timestamp: number;
  userId?: string;
}

export interface StatusUpdateData {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: number;
  error?: string;
}

// ============================================
// Template Types
// ============================================

export interface MessageTemplate {
  id: string;
  templateKey: string;
  name: string;
  content: string;
  messageType: MessageType;
  interactiveContent?: InteractiveContent;
  placeholders: string[];
  isActive: boolean;
}

export interface TemplateData {
  nome?: string;
  peso?: string | number;
  calorias?: string | number;
  data?: string;
  [key: string]: any;
}

// ============================================
// Interactive Message Templates
// ============================================

// Simple button type for templates
export interface InteractiveButton {
  id: string;
  title: string;
  type?: 'quick_reply' | 'call' | 'url' | 'copy';
  payload?: string;
}

// Simple list row type for templates
export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

export const INTERACTIVE_TEMPLATES = {
  FOOD_ANALYSIS_COMPLETE: 'food_analysis_complete',
  EXAM_ANALYSIS_COMPLETE: 'exam_analysis_complete',
  ONBOARDING_STEP: 'onboarding_step',
  DAILY_CHECKIN: 'daily_checkin',
  GOAL_REMINDER: 'goal_reminder',
  WEEKLY_REPORT: 'weekly_report',
} as const;

export type InteractiveTemplateKey = typeof INTERACTIVE_TEMPLATES[keyof typeof INTERACTIVE_TEMPLATES];

// ============================================
// Action Types (for webhook handlers)
// ============================================

export const BUTTON_ACTIONS = {
  CONFIRM_ANALYSIS: 'confirm_analysis',
  EDIT_ANALYSIS: 'edit_analysis',
  CANCEL_ANALYSIS: 'cancel_analysis',
  VIEW_DETAILS: 'view_details',
  TALK_NUTRITIONIST: 'talk_nutritionist',
  NEXT_STEP: 'next_step',
  PREVIOUS_STEP: 'previous_step',
  SKIP_STEP: 'skip_step',
  YES: 'yes',
  NO: 'no',
} as const;

export type ButtonActionId = typeof BUTTON_ACTIONS[keyof typeof BUTTON_ACTIONS];

// ============================================
// Adapter Interface
// ============================================

export interface IWhatsAppAdapter {
  readonly provider: WhatsAppProvider;
  
  sendText(phone: string, message: string, options?: { userId?: string }): Promise<SendResult>;
  sendMedia(phone: string, media: MediaContent, options?: { userId?: string }): Promise<SendResult>;
  sendInteractive(phone: string, content: InteractiveContent, options?: { userId?: string }): Promise<SendResult>;
  checkConnection(): Promise<ConnectionStatus>;
}

// ============================================
// Log Entry Types
// ============================================

export interface MessageLogEntry {
  userId?: string;
  phone: string;
  provider: WhatsAppProvider;
  messageType: MessageType;
  messageContent?: string;
  interactiveType?: 'button' | 'list' | 'carousel';
  templateKey?: string;
  providerMessageId?: string;
  providerResponse?: any;
  status: 'pending' | 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  errorMessage?: string;
  errorCode?: string;
  retryCount?: number;
}

export interface WebhookLogEntry {
  userId?: string;
  phone: string;
  provider: WhatsAppProvider;
  originalMessageId?: string;
  responseType: 'button_reply' | 'list_reply' | 'text' | 'unknown';
  buttonId?: string;
  buttonTitle?: string;
  listRowId?: string;
  listRowTitle?: string;
  rawPayload?: any;
  actionTriggered?: string;
  actionResult?: any;
  actionError?: string;
}
