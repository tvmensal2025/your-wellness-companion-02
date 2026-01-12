// ============================================
// WhatsApp Health Check Edge Function
// Checks connection status for both providers
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { provider } = await req.json();
    
    let result;
    
    if (provider === 'evolution' || !provider) {
      result = await checkEvolutionHealth();
      await updateHealthStatus(supabase, 'evolution', result);
    }
    
    if (provider === 'whapi' || !provider) {
      const whapiResult = await checkWhapiHealth();
      await updateHealthStatus(supabase, 'whapi', whapiResult);
      if (provider === 'whapi') result = whapiResult;
    }
    
    // If no specific provider, return both
    if (!provider) {
      const evolutionResult = await checkEvolutionHealth();
      const whapiResult = await checkWhapiHealth();
      result = { evolution: evolutionResult, whapi: whapiResult };
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Health Check] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


// ============================================
// Evolution Health Check
// ============================================

async function checkEvolutionHealth(): Promise<{
  connected: boolean;
  status: 'healthy' | 'unhealthy' | 'unknown';
  state?: string;
  error?: string;
}> {
  const apiUrl = Deno.env.get("EVOLUTION_API_URL");
  const apiKey = Deno.env.get("EVOLUTION_API_KEY");
  const instance = Deno.env.get("EVOLUTION_INSTANCE");
  
  if (!apiUrl || !apiKey || !instance) {
    return { connected: false, status: 'unknown', error: 'Evolution not configured' };
  }
  
  try {
    const response = await fetch(`${apiUrl}/instance/connectionState/${instance}`, {
      method: "GET",
      headers: { "apikey": apiKey },
    });
    
    const rawText = await response.text();
    let raw: any = null;
    
    try {
      raw = rawText ? JSON.parse(rawText) : null;
    } catch {
      raw = rawText;
    }
    
    const stateRaw = raw?.instance?.state ?? raw?.state ?? raw?.connectionState ?? raw?.status ?? '';
    const state = typeof stateRaw === 'string' ? stateRaw.toLowerCase() : '';
    const connected = response.ok && ['open', 'connected', 'online'].includes(state);
    
    return {
      connected,
      status: connected ? 'healthy' : 'unhealthy',
      state: state || undefined,
    };
  } catch (error) {
    return {
      connected: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// ============================================
// Whapi Health Check
// ============================================

async function checkWhapiHealth(): Promise<{
  connected: boolean;
  status: 'healthy' | 'unhealthy' | 'unknown';
  error?: string;
}> {
  const apiUrl = Deno.env.get("WHAPI_API_URL") || 'https://gate.whapi.cloud';
  const apiToken = Deno.env.get("WHAPI_API_TOKEN");
  
  if (!apiToken) {
    return { connected: false, status: 'unknown', error: 'Whapi not configured' };
  }
  
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${apiToken}` },
    });
    
    const data = await response.json();
    const connected = response.ok && data.status === 'ok';
    
    return {
      connected,
      status: connected ? 'healthy' : 'unhealthy',
    };
  } catch (error) {
    return {
      connected: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// ============================================
// Update Health Status in Database
// ============================================

async function updateHealthStatus(
  supabase: any,
  provider: 'evolution' | 'whapi',
  result: { connected: boolean; status: string }
): Promise<void> {
  const now = new Date().toISOString();
  
  const updateData = provider === 'evolution'
    ? {
        evolution_health_status: result.status,
        evolution_last_health_check: now,
      }
    : {
        whapi_health_status: result.status,
        whapi_last_health_check: now,
      };
  
  await supabase
    .from('whatsapp_provider_config')
    .update(updateData)
    .eq('id', '00000000-0000-0000-0000-000000000001');
}
