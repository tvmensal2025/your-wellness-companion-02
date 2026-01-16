import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: VPS Proxy
 * 
 * Proxy para chamadas à VPS API (WhatsApp, Tracking, etc.)
 * O frontend não tem acesso às variáveis VITE_VPS_*, então esta
 * function atua como proxy seguro.
 */

interface ProxyRequest {
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VPS_API_URL = Deno.env.get("VPS_API_URL") || Deno.env.get("VITE_VPS_API_URL");
    const VPS_API_KEY = Deno.env.get("VPS_API_KEY") || Deno.env.get("VITE_VPS_API_KEY");

    if (!VPS_API_URL) {
      return new Response(
        JSON.stringify({ success: false, error: "VPS não configurada" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { endpoint, method = "GET", headers = {}, body }: ProxyRequest = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ success: false, error: "Endpoint não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[vps-proxy] ${method} ${endpoint}`);

    const response = await fetch(`${VPS_API_URL}${endpoint}`, {
      method,
      headers: {
        "X-API-Key": VPS_API_KEY || "",
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`[vps-proxy] Erro: ${response.status}`, data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error || `HTTP ${response.status}`,
          status: response.status,
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[vps-proxy] Erro:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erro interno" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
