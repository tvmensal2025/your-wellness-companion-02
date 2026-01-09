import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type JsonObject = Record<string, unknown>;

function safeJsonParse<T>(value: unknown): T | null {
  try {
    if (typeof value !== "string") return value as T;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";

    // 1) Garantir que o chamador está autenticado
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2) Só admin pode testar (evita SSRF aberto)
    const { data: isAdmin, error: adminError } = await userClient.rpc("is_admin_user");
    if (adminError) {
      return new Response(
        JSON.stringify({ success: false, error: adminError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3) Ler destino por ID
    const body = await req.json().catch(() => ({} as JsonObject));
    const destinationId = (body as any)?.destination_id as string | undefined;
    if (!destinationId) {
      return new Response(
        JSON.stringify({ success: false, error: "destination_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(supabaseUrl, serviceKey);

    const { data: destination, error: destError } = await serviceClient
      .from("webhook_destinations")
      .select("url, secret_key, headers, timeout_seconds")
      .eq("id", destinationId)
      .single();

    if (destError || !destination) {
      return new Response(
        JSON.stringify({ success: false, error: destError?.message || "Destination not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const testPayload = {
      event: "lead.test",
      event_type: "test",
      timestamp: new Date().toISOString(),
      source: "mission-health-nexus",
      webhook_id: `test-${Date.now()}`,
      contact: {
        id: "test-user-id",
        email: "teste@exemplo.com",
        phone: "+5511999999999",
        full_name: "Usuário de Teste",
        first_name: "Usuário",
        last_name: "de Teste",
      },
      location: { city: "São Paulo", state: "SP", country: "BR" },
      profile: { gender: "male", birth_date: "1990-01-15", age: 36 },
      health_data: {
        height_cm: 175,
        current_weight_kg: 80,
        target_weight_kg: 70,
        activity_level: "moderate",
        fitness_level: "intermediate",
      },
      engagement: { points: 100, registered_at: new Date().toISOString() },
      meta: { is_test: true },
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "MissionHealthNexus-Webhook/1.0",
      "X-Webhook-Event": "test",
      "X-Webhook-Timestamp": new Date().toISOString(),
    };

    if (destination.secret_key) {
      headers["X-Webhook-Secret"] = destination.secret_key;
      headers["Authorization"] = `Bearer ${destination.secret_key}`;
    }

    const customHeaders = safeJsonParse<Record<string, string>>(destination.headers);
    if (customHeaders) Object.assign(headers, customHeaders);

    const timeoutMs = (destination.timeout_seconds ?? 30) * 1000;

    const start = Date.now();
    const res = await fetchWithTimeout(destination.url, {
      method: "POST",
      headers,
      body: JSON.stringify(testPayload),
    }, timeoutMs);

    const timeMs = Date.now() - start;
    const resText = (await res.text().catch(() => ""))?.slice(0, 2000) ?? "";

    return new Response(
      JSON.stringify({
        success: res.ok,
        status: res.status,
        time_ms: timeMs,
        response_body: resText,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("test-webhook error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
