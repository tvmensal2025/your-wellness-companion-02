import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL');
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');
const EVOLUTION_INSTANCE = Deno.env.get('EVOLUTION_INSTANCE');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, totalPoints, streakDays, answers } = await req.json();

    if (!userId) {
      throw new Error('userId é obrigatório');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar dados do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', userId)
      .single();

    if (!profile?.phone) {
      console.log('❌ Usuário não tem telefone cadastrado');
      return new Response(
        JSON.stringify({ error: 'Telefone não cadastrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userName = profile.full_name?.split(' ')[0] || 'Campeão(ã)';
    
    console.log(`🎉 Enviando celebração de missão completa para ${userName}`);

    // Gerar mensagem de celebração
    const celebrationMessage = await generateCelebrationMessage(
      userName, 
      totalPoints || 0, 
      streakDays || 1
    );

    // Gerar PNG do resumo do dia
    const summaryImageBase64 = await generateDailySummaryImage(
      userName,
      totalPoints || 0,
      streakDays || 1,
      answers || {}
    );

    // Formatar telefone
    const formattedPhone = formatPhoneNumber(profile.phone);

    // Enviar mensagem de texto primeiro
    await sendWhatsAppMessage(formattedPhone, celebrationMessage);

    // Depois enviar a imagem
    if (summaryImageBase64) {
      await sendWhatsAppImage(formattedPhone, summaryImageBase64, `Resumo do dia de ${userName}`);
    }

    // Salvar log
    await supabase.from('whatsapp_message_logs').insert({
      user_id: userId,
      message_type: 'mission_complete',
      message_content: celebrationMessage,
      phone_number: formattedPhone,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: { totalPoints, streakDays, hasImage: !!summaryImageBase64 }
    });

    console.log(`✅ Celebração de missão enviada para ${userName}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Celebração enviada' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao enviar celebração:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateCelebrationMessage(name: string, points: number, streak: number): Promise<string> {
  const systemPrompt = `Você é Sofia, a assistente virtual carinhosa do MaxNutrition.
Sua missão é celebrar conquistas dos membros de forma genuína e motivadora.

PERSONALIDADE:
- Celebradora e entusiasmada (mas não exagerada)
- Reconhece o esforço individual
- Usa linguagem natural e acessível
- Transmite orgulho e alegria pelo membro

REGRAS OBRIGATÓRIAS:
1. Comece SEMPRE com *{{nome}}* (com asteriscos para negrito)
2. Use no máximo 4 emojis distribuídos naturalmente
3. Mantenha a mensagem curta (máximo 3 parágrafos curtos)
4. Mencione os pontos ganhos e o streak de forma natural
5. Termine com sua assinatura: "Com orgulho, Sofia 💚"
6. Seja genuína, celebre a conquista real`;

  const streakText = streak > 1 
    ? `${streak} dias consecutivos de dedicação` 
    : 'primeiro dia de missão completa';

  const userPrompt = `Crie uma mensagem celebrando que ${name} completou a missão do dia!
- Pontos ganhos hoje: ${points} pontos
- Streak atual: ${streakText}

Seja entusiasmada mas natural, celebre essa conquista!`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 400
        }
      })
    }
  );

  const data = await response.json();
  let message = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Substituir placeholder do nome
  message = message.replace(/\{\{nome\}\}/gi, name);

  return message;
}

async function generateDailySummaryImage(
  name: string, 
  points: number, 
  streak: number, 
  answers: Record<string, any>
): Promise<string | null> {
  try {
    // Criar SVG com resumo do dia
    const today = new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });

    const answeredCount = Object.keys(answers).length || 0;

    const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="600" height="400" fill="url(#bgGradient)"/>
      
      <!-- Header -->
      <text x="300" y="50" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">
        🎉 Missão do Dia Completa!
      </text>
      
      <!-- Nome -->
      <text x="300" y="90" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.9)" text-anchor="middle">
        Parabéns, ${name}!
      </text>
      
      <!-- Data -->
      <text x="300" y="120" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.7)" text-anchor="middle">
        ${today}
      </text>
      
      <!-- Stats Box -->
      <rect x="50" y="150" width="500" height="180" rx="20" fill="rgba(255,255,255,0.15)"/>
      
      <!-- Pontos -->
      <text x="175" y="200" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" font-weight="bold">
        ${points}
      </text>
      <text x="175" y="230" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" text-anchor="middle">
        PONTOS HOJE
      </text>
      
      <!-- Streak -->
      <text x="425" y="200" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" font-weight="bold">
        🔥 ${streak}
      </text>
      <text x="425" y="230" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" text-anchor="middle">
        DIAS DE STREAK
      </text>
      
      <!-- Missões completadas -->
      <text x="300" y="290" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.9)" text-anchor="middle">
        ✅ ${answeredCount > 0 ? answeredCount : 'Todas as'} missões completadas
      </text>
      
      <!-- Footer -->
      <text x="300" y="370" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)" text-anchor="middle">
        MaxNutrition • Com carinho, Sofia 💚
      </text>
    </svg>`;

    // Converter SVG para base64
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;

  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    return null;
  }
}

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
}

async function sendWhatsAppMessage(phone: string, message: string): Promise<void> {
  const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY!
    },
    body: JSON.stringify({
      number: phone,
      text: message
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao enviar WhatsApp: ${errorText}`);
  }
}

async function sendWhatsAppImage(phone: string, imageBase64: string, caption: string): Promise<void> {
  const url = `${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY!
    },
    body: JSON.stringify({
      number: phone,
      mediatype: 'image',
      media: imageBase64,
      caption: caption
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Erro ao enviar imagem: ${errorText}`);
    // Não lançar erro para não bloquear o fluxo
  }
}
