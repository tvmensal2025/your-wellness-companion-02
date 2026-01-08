import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Creates a Supabase client for edge functions
 * Uses service role key for admin operations
 */
export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Creates a Supabase client with user's JWT for RLS
 */
export function createSupabaseClientWithAuth(authHeader: string): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });
}

/**
 * Get user ID from profiles table by phone number
 */
export async function getUserByPhone(
  supabase: SupabaseClient,
  phone: string
): Promise<{ id: string; user_id: string; full_name: string | null } | null> {
  const cleanPhone = phone.replace(/\D/g, "");
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_id, full_name")
    .or(`phone.eq.${cleanPhone},phone.eq.+${cleanPhone},phone.eq.55${cleanPhone}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user by phone:", error);
    return null;
  }

  return data;
}

/**
 * Log an action to ai_system_logs
 */
export async function logSystemAction(
  supabase: SupabaseClient,
  params: {
    userId?: string;
    operation: string;
    serviceName: string;
    status: "success" | "error" | "pending";
    details?: Record<string, unknown>;
    errorMessage?: string;
    executionTimeMs?: number;
  }
): Promise<void> {
  try {
    await supabase.from("ai_system_logs").insert({
      user_id: params.userId,
      operation: params.operation,
      service_name: params.serviceName,
      status: params.status,
      details: params.details,
      error_message: params.errorMessage,
      execution_time_ms: params.executionTimeMs,
      log_type: "edge_function",
    });
  } catch (error) {
    console.error("Failed to log system action:", error);
  }
}
