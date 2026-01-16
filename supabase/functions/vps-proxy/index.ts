import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: VPS Proxy
 * 
 * Proxy para chamadas à VPS API (WhatsApp, Tracking, Storage, etc.)
 * O frontend não tem acesso às variáveis VITE_VPS_*, então esta
 * function atua como proxy seguro.
 * 
 * Endpoints especiais:
 * - /storage/delete - Deletar arquivo do MinIO
 * - /storage/download - Baixar arquivo do MinIO (retorna base64)
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

    // ===== ENDPOINT ESPECIAL: DELETE de arquivo do MinIO =====
    if (endpoint === '/storage/delete' && method === 'DELETE') {
      const { path, folder } = body as { path: string; folder?: string };
      
      if (!path) {
        return new Response(
          JSON.stringify({ success: false, error: "Path do arquivo é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[vps-proxy] Deletando arquivo: ${path}`);
      
      // Chamar endpoint de delete na media-api (se existir) ou deletar via S3 API
      const deleteUrl = `${VPS_API_URL}/storage/delete`;
      
      try {
        const deleteResponse = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': VPS_API_KEY || '',
          },
          body: JSON.stringify({ path, folder }),
        });

        if (deleteResponse.ok) {
          const result = await deleteResponse.json();
          return new Response(
            JSON.stringify({ success: true, ...result }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Se endpoint não existe ou falhou, retornar aviso
        console.log(`[vps-proxy] Delete endpoint retornou ${deleteResponse.status}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Endpoint de delete não disponível na VPS",
            note: "Arquivo permanece no MinIO (limpeza manual ou automática necessária)"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (deleteError) {
        console.log(`[vps-proxy] Erro ao deletar: ${deleteError}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Erro ao conectar com VPS para delete",
            note: "Arquivo permanece no MinIO"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ===== ENDPOINT ESPECIAL: Download de arquivo do MinIO =====
    if (endpoint === '/storage/download' && method === 'POST') {
      const { url } = body as { url: string };
      
      if (!url) {
        return new Response(
          JSON.stringify({ success: false, error: "URL do arquivo é obrigatória" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[vps-proxy] Baixando arquivo: ${url}`);
      
      try {
        const downloadResponse = await fetch(url);
        
        if (!downloadResponse.ok) {
          throw new Error(`Erro ao baixar: ${downloadResponse.status}`);
        }
        
        const arrayBuffer = await downloadResponse.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Converter para base64
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        
        const contentType = downloadResponse.headers.get('content-type') || 'application/octet-stream';
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            base64,
            contentType,
            size: bytes.length
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (downloadError) {
        console.error(`[vps-proxy] Erro ao baixar: ${downloadError}`);
        return new Response(
          JSON.stringify({ success: false, error: `Erro ao baixar arquivo: ${downloadError}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ===== PROXY PADRÃO PARA VPS =====
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

    // Para health checks, retornar os dados mesmo com status 503 (degraded)
    // O frontend pode decidir o que fazer com o status
    if (endpoint.includes('/health')) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          ...data,
          httpStatus: response.status 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
      JSON.stringify({ success: true, ...data }),
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