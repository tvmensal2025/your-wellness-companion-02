/**
 * Shared utilities for Supabase Edge Functions
 * 
 * Import from this file in your edge functions:
 * import { corsHeaders, createSupabaseClient, jsonResponse } from "../_shared/index.ts";
 */

// CORS utilities
export { 
  corsHeaders, 
  handleCorsPreFlight, 
  isCorsPreFlight, 
  withCorsHeaders 
} from "./utils/cors.ts";

// Database client utilities
export { 
  createSupabaseClient, 
  createSupabaseClientWithAuth, 
  getUserByPhone, 
  logSystemAction 
} from "./db/client.ts";

// Response utilities
export {
  jsonResponse,
  errorResponse,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  htmlResponse,
  textResponse,
} from "./utils/response.ts";

// Validation utilities
export {
  isNonEmptyString,
  isValidUUID,
  isValidEmail,
  isValidBrazilianPhone,
  cleanPhoneNumber,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidDateString,
  validateRequiredFields,
  parseJsonBody,
} from "./utils/validators.ts";

// Medical exam utilities
export {
  EXPLICACOES_EXAMES,
  EXAM_ALIAS_MAP,
  getExplicacaoDidatica,
  groupExamsByCategory,
  getCategorySummary,
} from "./data/exam-explanations.ts";

// Types
export type {
  ExplicacaoExame,
} from "./data/exam-explanations.ts";

export type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  UserContext,
  AIConfiguration,
  WebhookPayload,
  ExamMetric,
  ExamSection,
  StructuredExamData,
  WhatsAppMessageType,
  WhatsAppMessage,
  NotificationType,
  NotificationPayload,
} from "./types/common.ts";
