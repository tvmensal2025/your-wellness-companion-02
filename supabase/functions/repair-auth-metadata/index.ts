import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type, Range",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range",
};

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  user?: { id: string; user_metadata?: Record<string, unknown> | null } | null;
};

function sanitizeUserMetadata(meta: Record<string, unknown> | null | undefined) {
  const input = meta ?? {};
  const output: Record<string, unknown> = {};
  let changed = false;

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") {
      const isDataUri = value.startsWith("data:");
      const tooLong = value.length > 5000;

      if (isDataUri || tooLong) {
        output[key] = "";
        changed = true;
        continue;
      }
    }

    output[key] = value;
  }

  if (typeof input["avatar_url"] === "string" && (input["avatar_url"] as string).startsWith("data:image")) {
    output["avatar_url"] = "";
    changed = true;
  }

  return { output, changed };
}

async function refreshSessionWithToken(
  supabaseUrl: string,
  anonKey: string,
  refreshToken: string,
): Promise<RefreshResponse> {
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`refresh_failed_${res.status}: ${text}`);
  }

  return (await res.json()) as RefreshResponse;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return new Response(JSON.stringify({ success: false, error: "missing_env" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as { refresh_token?: string };
    const refreshToken = body.refresh_token;

    if (!refreshToken || typeof refreshToken !== "string") {
      return new Response(JSON.stringify({ success: false, error: "refresh_token_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Troca refresh_token por sessão (server-side; token pode ser gigante, ok)
    const first = await refreshSessionWithToken(supabaseUrl, anonKey, refreshToken);
    const userId = first.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: "user_not_found" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { output: sanitized, changed } = sanitizeUserMetadata(first.user?.user_metadata ?? null);

    if (changed) {
      const admin = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
        user_metadata: sanitized,
      });

      if (updErr) {
        throw new Error(`update_user_failed: ${updErr.message}`);
      }
    }

    // 2) Faz refresh de novo (usando o refresh_token possivelmente rotacionado) para devolver um access_token menor
    const second = await refreshSessionWithToken(supabaseUrl, anonKey, first.refresh_token || refreshToken);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        repaired: changed,
        access_token: second.access_token,
        refresh_token: second.refresh_token,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("repair-auth-metadata error:", message);

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
