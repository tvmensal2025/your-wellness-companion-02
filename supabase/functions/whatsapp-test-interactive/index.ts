import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WHAPI_API_URL = Deno.env.get('WHAPI_API_URL') || 'https://gate.whapi.cloud';
const WHAPI_TOKEN = Deno.env.get('WHAPI_TOKEN') || '';
const WHAPI_CHANNEL_ID = Deno.env.get('WHAPI_CHANNEL_ID') || '';

const defaultTemplates: Record<string, any> = {
  quick_reply: {
    type: 'button',
    header: { text: '⚡ Resposta Rápida' },
    body: { text: '🧪 *TESTE QUICK REPLY*\n\nEscolha uma das opções abaixo para testar os botões de resposta rápida:' },
    footer: { text: 'MaxNutrition • Teste Whapi' },
    action: {
      buttons: [
        { type: 'quick_reply', title: '✅ Confirmar', id: 'test_confirm' },
        { type: 'quick_reply', title: '✏️ Corrigir', id: 'test_correct' },
        { type: 'quick_reply', title: '❌ Cancelar', id: 'test_cancel' }
      ]
    }
  },
  list: {
    type: 'list',
    header: { text: '📋 Menu de Opções' },
    body: { text: '🧪 *TESTE LISTA*\n\nClique no botão abaixo para ver as opções disponíveis:' },
    footer: { text: 'MaxNutrition • Teste Whapi' },
    action: {
      button: 'Ver Opções',
      sections: [
        {
          title: '🍽️ Refeições',
          rows: [
            { id: 'meal_breakfast', title: '☕ Café da Manhã', description: 'Registrar café da manhã' },
            { id: 'meal_lunch', title: '🍛 Almoço', description: 'Registrar almoço' },
            { id: 'meal_dinner', title: '🌙 Jantar', description: 'Registrar jantar' }
          ]
        },
        {
          title: '💧 Hidratação',
          rows: [
            { id: 'water_250', title: '💧 250ml', description: 'Adicionar 250ml de água' },
            { id: 'water_500', title: '💧 500ml', description: 'Adicionar 500ml de água' }
          ]
        }
      ]
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, type, customTemplate } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Se for template customizado, usa ele; senão usa os defaults
    let template;
    if (type === 'custom' && customTemplate) {
      template = customTemplate;
    } else if (type && defaultTemplates[type]) {
      template = defaultTemplates[type];
    } else if (!type && !customTemplate) {
      return new Response(
        JSON.stringify({ 
          error: "Type or customTemplate required", 
          available: Object.keys(defaultTemplates) 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!WHAPI_TOKEN) {
      return new Response(
        JSON.stringify({ error: "WHAPI_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }

    console.log(`[Test Interactive] Type: ${type || 'custom'}, Phone: ${formattedPhone}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${WHAPI_TOKEN}`,
    };
    
    if (WHAPI_CHANNEL_ID) {
      headers['X-Channel-Id'] = WHAPI_CHANNEL_ID;
    }

    const payload = {
      to: formattedPhone,
      ...template
    };

    console.log(`[Test Interactive] Payload:`, JSON.stringify(payload));

    const response = await fetch(`${WHAPI_API_URL}/messages/interactive`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`[Test Interactive] Response: ${response.status} - ${responseText}`);

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
          type: type || 'custom',
          tip: !WHAPI_CHANNEL_ID 
            ? '⚠️ WHAPI_CHANNEL_ID não configurado' 
            : 'Verifique token e channel_id'
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `✅ Template enviado!`,
        type: type || 'custom',
        phone: formattedPhone,
        whapi_response: data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('[Test Interactive] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
