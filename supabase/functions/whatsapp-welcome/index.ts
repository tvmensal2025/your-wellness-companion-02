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
    const { userId, phone, name } = await req.json();

    if (!userId || !phone || !name) {
      throw new Error('userId, phone e name são obrigatórios');
    }

    console.log(`📱 Enviando boas-vindas para ${name} (${phone})`);

    // Gerar mensagem humanizada com Gemini
    const welcomeMessage = await generateWelcomeMessage(name);

    // Formatar telefone
    const formattedPhone = formatPhoneNumber(phone);

    // Enviar via Evolution API
    await sendWhatsAppMessage(formattedPhone, welcomeMessage);

    // Salvar log
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase.from('whatsapp_message_logs').insert({
      user_id: userId,
      message_type: 'welcome',
      message_content: welcomeMessage,
      phone_number: formattedPhone,
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    console.log(`✅ Mensagem de boas-vindas enviada para ${name}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Mensagem de boas-vindas enviada' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao enviar boas-vindas:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateWelcomeMessage(name: string): Promise<string> {
  const systemPrompt = `Você é Sofia, a assistente virtual carinhosa do Instituto dos Sonhos.
Sua missão é dar boas-vindas aos novos membros de forma acolhedora e motivadora.

PERSONALIDADE:
- Acolhedora e empática como uma amiga próxima
- Entusiasmada mas genuína (não exagerada)
- Usa linguagem natural e acessível
- Transmite confiança e apoio

REGRAS OBRIGATÓRIAS:
1. Comece SEMPRE com *{{nome}}* (com asteriscos para negrito)
2. Use no máximo 3 emojis distribuídos naturalmente
3. Mantenha a mensagem curta (máximo 4 parágrafos curtos)
4. Termine com sua assinatura: "Com carinho, Sofia 💚"
5. Mencione brevemente o que o membro pode esperar (missões diárias, acompanhamento)
6. Seja genuína, evite frases clichês de marketing`;

  const userPrompt = `Crie uma mensagem de boas-vindas personalizada para um novo membro chamado ${name}.
O membro acabou de se cadastrar no Instituto dos Sonhos.
Seja acolhedora, apresente-se brevemente e diga que estará ao lado dele(a) nessa jornada.`;

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
          maxOutputTokens: 500
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

function formatPhoneNumber(phone: string): string {
  // Remove caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Adiciona código do país se não tiver
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

  console.log(`📤 WhatsApp enviado para ${phone}`);
}
