import { corsHeaders } from "./cors.ts";

/**
 * Standardized HTTP response helpers for edge functions
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create a JSON success response
 */
export function jsonResponse<T>(
  data: T,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

/**
 * Create a success response with data
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  return jsonResponse(response, status);
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status = 400,
  details?: unknown
): Response {
  const response: ApiResponse = {
    success: false,
    error,
  };
  if (details) {
    (response as Record<string, unknown>).details = details;
  }
  console.error(`Error response (${status}):`, error, details);
  return jsonResponse(response, status);
}

/**
 * Create a 404 Not Found response
 */
export function notFoundResponse(message = "Resource not found"): Response {
  return errorResponse(message, 404);
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorizedResponse(
  message = "Unauthorized"
): Response {
  return errorResponse(message, 401);
}

/**
 * Create a 403 Forbidden response
 */
export function forbiddenResponse(message = "Forbidden"): Response {
  return errorResponse(message, 403);
}

/**
 * Create a 500 Internal Server Error response
 */
export function serverErrorResponse(
  error: unknown,
  publicMessage = "Internal server error"
): Response {
  console.error("Server error:", error);
  return errorResponse(publicMessage, 500);
}

/**
 * Create a plain text response
 */
export function textResponse(
  text: string,
  status = 200
): Response {
  return new Response(text, {
    status,
    headers: {
      "Content-Type": "text/plain",
      ...corsHeaders,
    },
  });
}

/**
 * Wrap an async handler with error handling
 */
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      return serverErrorResponse(error);
    }
  };
}
