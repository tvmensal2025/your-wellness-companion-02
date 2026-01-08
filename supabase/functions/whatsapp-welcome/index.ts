import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar template do banco de dados
    const welcomeMessage = await getWelcomeTemplate(supabase, name);

    // Formatar telefone
    const formattedPhone = formatPhoneNumber(phone);

    // Enviar via Evolution API
    await sendWhatsAppMessage(formattedPhone, welcomeMessage);

    // Salvar log
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

async function getWelcomeTemplate(supabase: any, name: string): Promise<string> {
  // Buscar template welcome_premium do banco de dados
  const { data: template, error } = await supabase
    .from('whatsapp_message_templates')
    .select('content')
    .eq('template_key', 'welcome_premium')
    .eq('is_active', true)
    .single();

  if (error || !template) {
    console.log('⚠️ Template não encontrado, usando fallback');
    // Fallback caso template não exista
    return `✨ *Olá, ${name}!* ✨

Seja muito bem-vinda ao *MaxNutrition*! 💚

Sou a *Sofia*, sua nutricionista virtual. Juntas, vamos construir uma *nova relação* com seu corpo e sua alimentação.

💚 Estou muito feliz por você estar aqui!

Com carinho, *Sofia* 💚
_MaxNutrition_`;
  }

  // Substituir placeholders
  let message = template.content;
  message = message.replace(/\{\{nome\}\}/gi, name);
  
  console.log('📄 Template welcome_premium carregado do banco');
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
