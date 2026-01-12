import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WHAPI_API_URL = Deno.env.get('WHAPI_API_URL') || 'https://gate.whapi.cloud';
const WHAPI_TOKEN = Deno.env.get('WHAPI_TOKEN') || '';
const WHAPI_CHANNEL_ID = Deno.env.get('WHAPI_CHANNEL_ID') || '';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number required", example: { phone: "5511999999999" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!WHAPI_TOKEN) {
      return new Response(
        JSON.stringify({ error: "WHAPI_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Formatar telefone
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }

    console.log('[Test Buttons] Config:', {
      url: WHAPI_API_URL,
      channelId: WHAPI_CHANNEL_ID ? `configurado (${WHAPI_CHANNEL_ID.substring(0, 10)}...)` : 'NÃO configurado',
      tokenLength: WHAPI_TOKEN.length,
      phone: formattedPhone,
    });

    // Headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${WHAPI_TOKEN}`,
    };
    
    if (WHAPI_CHANNEL_ID) {
      headers['X-Channel-Id'] = WHAPI_CHANNEL_ID;
    }

    // Payload de teste com botões
    const payload = {
      to: formattedPhone,
      type: 'button',
      body: { 
        text: '🧪 *TESTE DE BOTÕES WHAPI*\n\nEsta mensagem testa se os botões interativos estão funcionando.\n\nClique em um botão abaixo:' 
      },
      header: { text: '🔬 Teste Whapi' },
      footer: { text: 'MaxNutrition - Teste' },
      action: {
        buttons: [
          { type: 'quick_reply', title: '✅ Funciona!', id: 'test_ok' },
          { type: 'quick_reply', title: '🔄 Teste 2', id: 'test_2' },
          { type: 'quick_reply', title: '❌ Cancelar', id: 'test_cancel' },
        ],
      },
    };

    console.log('[Test Buttons] Enviando payload:', JSON.stringify(payload));

    const response = await fetch(`${WHAPI_API_URL}/messages/interactive`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`[Test Buttons] Response status: ${response.status}`);
    console.log(`[Test Buttons] Response body: ${responseText}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `HTTP ${response.status}`,
          details: data,
          config: {
            url: WHAPI_API_URL,
            channelIdConfigured: !!WHAPI_CHANNEL_ID,
            tokenConfigured: !!WHAPI_TOKEN,
          },
          tip: !WHAPI_CHANNEL_ID 
            ? '⚠️ WHAPI_CHANNEL_ID não está configurado. Verifique no painel Whapi.' 
            : 'Verifique se o token e channel_id estão corretos.',
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "✅ Mensagem com botões enviada!",
        phone: formattedPhone,
        whapi_response: data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('[Test Buttons] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
