import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface RateLimitRequest {
  action: 'check' | 'reset' | 'block' | 'stats';
  user_id?: string;
  endpoint?: string;
  max_requests?: number;
  window_hours?: number;
  block_hours?: number;
}

// Rate limit configurations by endpoint
const RATE_LIMITS: Record<string, { max_requests: number; window_hours: number }> = {
  'ai_chat': { max_requests: 100, window_hours: 24 },
  'ai_analysis': { max_requests: 50, window_hours: 24 },
  'medical_exam': { max_requests: 10, window_hours: 24 },
  'image_generation': { max_requests: 20, window_hours: 24 },
  'whatsapp': { max_requests: 200, window_hours: 24 },
  'default': { max_requests: 1000, window_hours: 24 }
};

serve(async (req) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflightRequest(req);
  if (preflightResponse) return preflightResponse;

  const origin = req.headers.get('origin');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RateLimitRequest = await req.json();
    const { action } = body;

    switch (action) {
      case 'check': {
        if (!body.user_id || !body.endpoint) {
          return errorResponse('user_id and endpoint are required', 400, origin);
        }

        const config = RATE_LIMITS[body.endpoint] || RATE_LIMITS['default'];
        const maxRequests = body.max_requests || config.max_requests;
        const windowHours = body.window_hours || config.window_hours;

        // Use database function for atomic check
        const { data, error } = await supabase.rpc('check_rate_limit', {
          p_user_id: body.user_id,
          p_endpoint: body.endpoint,
          p_max_requests: maxRequests,
          p_window_hours: windowHours
        });

        if (error) {
          console.error('Rate limit check error:', error);
          // Fail open - allow request if rate limit check fails
          return jsonResponse({ 
            allowed: true, 
            remaining: maxRequests,
            limit: maxRequests,
            warning: 'Rate limit check failed, allowing request'
          }, 200, origin);
        }

        const corsHeaders = getCorsHeaders(origin);
        const headers = {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(data.limit),
          'X-RateLimit-Remaining': String(data.remaining),
          'X-RateLimit-Reset': data.reset_at
        };

        if (!data.allowed) {
          return new Response(
            JSON.stringify({
              error: 'Rate limit exceeded',
              message: `Você atingiu o limite de ${data.limit} requisições para ${body.endpoint}. Tente novamente após ${new Date(data.reset_at).toLocaleString('pt-BR')}.`,
              retry_after: data.reset_at,
              ...data
            }),
            { status: 429, headers }
          );
        }

        return new Response(JSON.stringify(data), { headers });
      }

      case 'reset': {
        if (!body.user_id) {
          return errorResponse('user_id is required', 400, origin);
        }

        let query = supabase
          .from('rate_limits')
          .update({ 
            request_count: 0, 
            window_start: new Date().toISOString(),
            is_blocked: false,
            blocked_until: null
          })
          .eq('user_id', body.user_id);

        if (body.endpoint) {
          query = query.eq('endpoint', body.endpoint);
        }

        const { error } = await query;

        if (error) {
          return errorResponse('Failed to reset rate limit', 500, origin);
        }

        return jsonResponse({ success: true, message: 'Rate limit reset successfully' }, 200, origin);
      }

      case 'block': {
        if (!body.user_id || !body.endpoint) {
          return errorResponse('user_id and endpoint are required', 400, origin);
        }

        const blockUntil = new Date();
        blockUntil.setHours(blockUntil.getHours() + (body.block_hours || 24));

        const { error } = await supabase
          .from('rate_limits')
          .upsert({
            user_id: body.user_id,
            endpoint: body.endpoint,
            is_blocked: true,
            blocked_until: blockUntil.toISOString()
          }, { onConflict: 'user_id,endpoint' });

        if (error) {
          return errorResponse('Failed to block user', 500, origin);
        }

        return jsonResponse({ 
          success: true, 
          message: `User blocked until ${blockUntil.toISOString()}` 
        }, 200, origin);
      }

      case 'stats': {
        const { data: totalLimits } = await supabase
          .from('rate_limits')
          .select('*');

        const { data: blockedUsers } = await supabase
          .from('rate_limits')
          .select('*')
          .eq('is_blocked', true);

        const endpointStats: Record<string, { total_requests: number; users: number }> = {};
        
        totalLimits?.forEach(limit => {
          if (!endpointStats[limit.endpoint]) {
            endpointStats[limit.endpoint] = { total_requests: 0, users: 0 };
          }
          endpointStats[limit.endpoint].total_requests += limit.request_count;
          endpointStats[limit.endpoint].users += 1;
        });

        const topUsers = totalLimits
          ?.sort((a, b) => b.request_count - a.request_count)
          .slice(0, 10)
          .map(u => ({
            user_id: u.user_id,
            endpoint: u.endpoint,
            requests: u.request_count,
            remaining: u.max_requests - u.request_count
          }));

        return jsonResponse({
          total_tracked_users: new Set(totalLimits?.map(l => l.user_id)).size,
          total_endpoints: Object.keys(endpointStats).length,
          blocked_users: blockedUsers?.length || 0,
          endpoint_stats: endpointStats,
          top_users: topUsers,
          rate_limit_configs: RATE_LIMITS
        }, 200, origin);
      }

      default:
        return errorResponse('Invalid action', 400, origin);
    }
  } catch (error) {
    console.error('Rate limiter error:', error);
    return errorResponse(error.message, 500, req.headers.get('origin'));
  }
});
