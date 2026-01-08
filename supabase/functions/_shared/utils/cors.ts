/**
 * Standardized CORS headers for edge functions
 */

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

/**
 * Handle CORS preflight request
 */
export function handleCorsPreFlight(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Check if request is a CORS preflight
 */
export function isCorsPreFlight(req: Request): boolean {
  return req.method === "OPTIONS";
}

/**
 * Add CORS headers to existing headers
 */
export function withCorsHeaders(
  headers: Record<string, string> = {}
): Record<string, string> {
  return { ...corsHeaders, ...headers };
}
