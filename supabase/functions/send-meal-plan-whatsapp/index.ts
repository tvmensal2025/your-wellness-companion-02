import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Whapi Configuration
const WHAPI_API_URL = Deno.env.get('WHAPI_API_URL') || 'https://gate.whapi.cloud';
const WHAPI_TOKEN = Deno.env.get('WHAPI_TOKEN') || '';
const WHAPI_CHANNEL_ID = Deno.env.get('WHAPI_CHANNEL_ID') || '';

interface MealPlanData {
  type: 'daily' | 'weekly';
  title: string;
  days: number;
  summary: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals?: Array<{
    day: string;
    meals: Array<{
      type: string;
      name: string;
      calories: number;
    }>;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, mealPlanData, imageBase64 } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!WHAPI_TOKEN) {
      console.error('WHAPI_TOKEN não configurado');
      return new Response(
        JSON.stringify({ success: false, message: 'WhatsApp não configurado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar telefone do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.phone) {
      console.log('Usuário sem telefone cadastrado:', userId);
      return new Response(
        JSON.stringify({ success: false, message: 'Usuário sem telefone cadastrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const phone = formatPhone(profile.phone);
    const userName = profile.full_name?.split(' ')[0] || 'você';
    const data = mealPlanData as MealPlanData;

    // Montar mensagem do cardápio
    const message = buildMealPlanMessage(userName, data);

    // Enviar mensagem de texto
    const textResult = await sendWhatsAppText(phone, message);
    
    if (!textResult.success) {
      console.error('Erro ao enviar texto:', textResult.error);
    }

    // Se tiver imagem, enviar também
    if (imageBase64) {
      const imageResult = await sendWhatsAppImage(phone, imageBase64, `🍽️ Cardápio de ${userName}`);
      if (!imageResult.success) {
        console.error('Erro ao enviar imagem:', imageResult.error);
      }
    }

    console.log(`✅ Cardápio enviado via WhatsApp (Whapi) para ${phone}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Cardápio enviado via WhatsApp!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao enviar cardápio:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


// ============================================
// HELPERS
// ============================================

function formatPhone(phone: string): string {
  // Remove tudo que não é número
  let cleaned = phone.replace(/\D/g, '');
  
  // Adiciona código do país se não tiver
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  return cleaned;
}

function buildMealPlanMessage(userName: string, data: MealPlanData): string {
  const emoji = data.type === 'weekly' ? '📅' : '🍽️';
  const typeLabel = data.type === 'weekly' ? 'Semanal' : 'Diário';
  
  let message = `${emoji} *Cardápio ${typeLabel} Gerado!*\n\n`;
  message += `Olá ${userName}! 👋\n\n`;
  message += `Seu cardápio personalizado está pronto!\n\n`;
  
  message += `📊 *Resumo Nutricional:*\n`;
  message += `• 🔥 ${data.summary.calories} kcal\n`;
  message += `• 🥩 ${data.summary.protein}g proteínas\n`;
  message += `• 🍚 ${data.summary.carbs}g carboidratos\n`;
  message += `• 🥑 ${data.summary.fat}g gorduras\n`;
  if (data.summary.fiber) {
    message += `• 🌾 ${data.summary.fiber}g fibras\n`;
  }
  
  message += `\n✨ Acesse o app para ver o cardápio completo com todas as refeições detalhadas!\n\n`;
  message += `💪 Bora seguir o plano!\n\n`;
  message += `_Sofia Nutricional - MaxNutrition_`;
  
  return message;
}

function getWhapiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${WHAPI_TOKEN}`,
  };
  
  if (WHAPI_CHANNEL_ID) {
    headers['X-Channel-Id'] = WHAPI_CHANNEL_ID;
  }
  
  return headers;
}

async function sendWhatsAppText(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Whapi] Enviando texto para ${phone}`);
    
    const response = await fetch(`${WHAPI_API_URL}/messages/text`, {
      method: 'POST',
      headers: getWhapiHeaders(),
      body: JSON.stringify({
        to: phone,
        body: message,
      }),
    });

    const responseText = await response.text();
    console.log(`[Whapi] Response: ${response.status} - ${responseText}`);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${responseText}` };
    }

    console.log(`✅ Mensagem de texto enviada para ${phone}`);
    return { success: true };
  } catch (error) {
    console.error('[Whapi] Erro ao enviar texto:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

async function sendWhatsAppImage(phone: string, imageBase64: string, caption: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Whapi] Enviando imagem para ${phone}`);
    
    // Garantir que o base64 não tem o prefixo data:image
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await fetch(`${WHAPI_API_URL}/messages/image`, {
      method: 'POST',
      headers: getWhapiHeaders(),
      body: JSON.stringify({
        to: phone,
        media: `data:image/png;base64,${cleanBase64}`,
        caption: caption,
      }),
    });

    const responseText = await response.text();
    console.log(`[Whapi] Image Response: ${response.status} - ${responseText}`);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${responseText}` };
    }

    console.log(`✅ Imagem enviada para ${phone}`);
    return { success: true };
  } catch (error) {
    console.error('[Whapi] Erro ao enviar imagem:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
