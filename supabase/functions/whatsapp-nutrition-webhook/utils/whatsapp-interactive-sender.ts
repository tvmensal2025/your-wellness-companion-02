/**
 * WhatsApp Interactive Message Sender
 * Uses Whapi for interactive buttons with text fallback
 */

// Whapi config
const WHAPI_API_URL = Deno.env.get('WHAPI_API_URL') || 'https://gate.whapi.cloud';
const WHAPI_TOKEN = Deno.env.get('WHAPI_TOKEN') || '';
const WHAPI_CHANNEL_ID = Deno.env.get('WHAPI_CHANNEL_ID') || '';

// Evolution config (fallback for text)
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL');
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY');
const EVOLUTION_INSTANCE = Deno.env.get('EVOLUTION_INSTANCE');

interface InteractiveButton {
  id: string;
  title: string;
}

interface InteractiveMessage {
  bodyText: string;
  buttons: InteractiveButton[];
  headerText?: string;
  footerText?: string;
}

/**
 * Format phone for WhatsApp (Whapi format)
 */
function formatPhoneWhapi(phone: string): string {
  let formatted = phone.replace(/\D/g, '');
  if (!formatted.startsWith('55')) {
    formatted = '55' + formatted;
  }
  return `${formatted}@s.whatsapp.net`;
}

/**
 * Format phone for Evolution
 */
function formatPhoneEvolution(phone: string): string {
  let formatted = phone.replace(/\D/g, '');
  if (!formatted.startsWith('55')) {
    formatted = '55' + formatted;
  }
  return formatted;
}

/**
 * Check if Whapi is configured and active
 */
function isWhapiActive(): boolean {
  const activeProvider = Deno.env.get('WHATSAPP_ACTIVE_PROVIDER') || 'evolution';
  return activeProvider === 'whapi' && !!WHAPI_TOKEN;
}


/**
 * Send interactive message with buttons via Whapi
 */
/**
 * Build Whapi headers with optional Channel ID
 */
function getWhapiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${WHAPI_TOKEN}`,
  };
  
  // Adicionar Channel ID se configurado (resolve "Channel not found")
  if (WHAPI_CHANNEL_ID) {
    headers['X-Channel-Id'] = WHAPI_CHANNEL_ID;
  }
  
  return headers;
}

/**
 * Send interactive message with buttons via Whapi
 * Uses quick_reply format as per Whapi documentation:
 * https://support.whapi.cloud/help-desk/sending/send-message-with-buttons
 */
async function sendWhapiInteractive(
  phone: string,
  message: InteractiveMessage
): Promise<boolean> {
  if (!WHAPI_TOKEN) {
    console.error('[Whapi] Token não configurado');
    return false;
  }

  // Whapi usa só o número, sem @s.whatsapp.net
  let formattedPhone = phone.replace(/\D/g, '');
  if (!formattedPhone.startsWith('55')) {
    formattedPhone = '55' + formattedPhone;
  }
  
  // Log de diagnóstico
  console.log('[Whapi] Config:', {
    url: WHAPI_API_URL,
    channelId: WHAPI_CHANNEL_ID ? `configurado (${WHAPI_CHANNEL_ID.substring(0, 8)}...)` : 'NÃO configurado',
    tokenLength: WHAPI_TOKEN?.length || 0,
    phone: formattedPhone,
  });
  
  try {
    // Formato correto do Whapi para quick_reply buttons
    const payload: Record<string, any> = {
      to: formattedPhone,
      type: 'button',
      body: { text: message.bodyText },
      action: {
        buttons: message.buttons.slice(0, 3).map(btn => ({
          type: 'quick_reply',
          title: btn.title.substring(0, 25), // Max 25 chars para Whapi
          id: btn.id
        })),
      },
    };

    if (message.headerText) {
      payload.header = { text: message.headerText };
    }
    if (message.footerText) {
      payload.footer = { text: message.footerText };
    }

    console.log('[Whapi] Enviando interativo (quick_reply):', JSON.stringify(payload).substring(0, 600));

    const response = await fetch(`${WHAPI_API_URL}/messages/interactive`, {
      method: 'POST',
      headers: getWhapiHeaders(),
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`[Whapi] Response status: ${response.status}, body: ${responseText.substring(0, 500)}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[Whapi] Resposta não é JSON válido:', responseText);
      return false;
    }

    if (!response.ok) {
      console.error('[Whapi] Erro HTTP:', response.status, data);
      // Se for 404 "Channel not found", sugerir configurar WHAPI_CHANNEL_ID
      if (response.status === 404 && !WHAPI_CHANNEL_ID) {
        console.error('[Whapi] ⚠️ DICA: Configure o secret WHAPI_CHANNEL_ID com o ID do seu canal!');
      }
      return false;
    }

    if (data.sent === false) {
      console.error('[Whapi] Mensagem não enviada:', data);
      return false;
    }

    console.log('[Whapi] ✅ Mensagem interativa enviada:', data?.message?.id || data?.id || 'ok');
    return true;
  } catch (error) {
    console.error('[Whapi] Exceção ao enviar interativo:', error);
    return false;
  }
}

/**
 * Send text message via Evolution (fallback)
 */
async function sendEvolutionText(phone: string, text: string): Promise<boolean> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.error('[Evolution] API não configurada');
    return false;
  }

  const formattedPhone = formatPhoneEvolution(phone);

  try {
    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: text,
          delay: 1200,
        }),
      }
    );

    if (response.ok) {
      console.log('[Evolution] ✅ Mensagem enviada');
      return true;
    }

    const errorData = await response.text();
    console.error('[Evolution] Erro:', errorData);
    return false;
  } catch (error) {
    console.error('[Evolution] Exceção:', error);
    return false;
  }
}

/**
 * Send text message via Whapi
 */
async function sendWhapiText(phone: string, text: string): Promise<boolean> {
  if (!WHAPI_TOKEN) {
    console.error('[Whapi] Token não configurado');
    return false;
  }

  // Whapi usa só o número, sem @s.whatsapp.net
  let formattedPhone = phone.replace(/\D/g, '');
  if (!formattedPhone.startsWith('55')) {
    formattedPhone = '55' + formattedPhone;
  }

  try {
    const response = await fetch(`${WHAPI_API_URL}/messages/text`, {
      method: 'POST',
      headers: getWhapiHeaders(),
      body: JSON.stringify({
        to: formattedPhone,
        body: text,
      }),
    });

    const responseText = await response.text();
    console.log(`[Whapi] Text response status: ${response.status}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[Whapi] Resposta não é JSON:', responseText.substring(0, 200));
      return false;
    }

    if (!response.ok) {
      console.error('[Whapi] Erro ao enviar texto:', data);
      return false;
    }

    console.log('[Whapi] ✅ Texto enviado:', data?.message?.id || data?.id || 'ok');
    return true;
  } catch (error) {
    console.error('[Whapi] Exceção ao enviar texto:', error);
    return false;
  }
}

/**
 * Convert interactive message to text fallback
 */
function convertToTextFallback(message: InteractiveMessage): string {
  let text = '';
  
  if (message.headerText) {
    text += `*${message.headerText}*\n\n`;
  }
  
  text += message.bodyText + '\n\n';
  
  message.buttons.forEach((btn, i) => {
    const emoji = ['1️⃣', '2️⃣', '3️⃣'][i] || `${i + 1}.`;
    text += `${emoji} ${btn.title}\n`;
  });
  
  text += '\n_Responda com o número da opção_';
  
  if (message.footerText) {
    text += `\n\n_${message.footerText}_`;
  }
  
  return text;
}


/**
 * Send interactive message - uses Whapi if active, otherwise text fallback
 * Includes auto-fallback to Evolution if Whapi fails
 */
export async function sendInteractiveMessage(
  phone: string,
  message: InteractiveMessage
): Promise<boolean> {
  const useWhapi = isWhapiActive();
  
  console.log(`[WhatsApp] Provider ativo: ${useWhapi ? 'whapi' : 'evolution'}`);
  
  if (useWhapi) {
    const success = await sendWhapiInteractive(phone, message);
    if (success) return true;
    
    // Fallback 1: texto via Whapi
    console.log('[WhatsApp] Whapi interativo falhou, tentando texto via Whapi...');
    const textFallback = convertToTextFallback(message);
    const whapiTextSuccess = await sendWhapiText(phone, textFallback);
    if (whapiTextSuccess) return true;
    
    // Fallback 2: texto via Evolution (fallback final)
    console.log('[WhatsApp] ⚠️ Whapi texto também falhou, usando Evolution...');
    const evolutionSuccess = await sendEvolutionText(phone, textFallback);
    if (evolutionSuccess) {
      console.log('[WhatsApp] ✅ Fallback Evolution funcionou!');
      return true;
    }
    
    console.error('[WhatsApp] ❌ Todos os métodos de envio falharam');
    return false;
  }
  
  // Evolution: send as text (no native buttons)
  const textFallback = convertToTextFallback(message);
  return await sendEvolutionText(phone, textFallback);
}

/**
 * Send simple text message via active provider with auto-fallback
 */
export async function sendTextMessage(phone: string, text: string): Promise<boolean> {
  const useWhapi = isWhapiActive();
  
  if (useWhapi) {
    const whapiSuccess = await sendWhapiText(phone, text);
    if (whapiSuccess) return true;
    
    // Fallback automático para Evolution
    console.log('[WhatsApp] ⚠️ Whapi falhou, tentando fallback Evolution...');
    const evolutionSuccess = await sendEvolutionText(phone, text);
    if (evolutionSuccess) {
      console.log('[WhatsApp] ✅ Fallback Evolution funcionou!');
      return true;
    }
    
    console.error('[WhatsApp] ❌ Ambos providers falharam');
    return false;
  }
  
  return await sendEvolutionText(phone, text);
}

// ============================================
// Pre-built Interactive Messages
// ============================================

/**
 * Send food analysis confirmation with buttons
 */
export async function sendFoodAnalysisConfirmation(
  phone: string,
  foods: Array<{ nome?: string; name?: string; quantidade?: number; grams?: number }>,
  totalCalories?: number
): Promise<boolean> {
  const foodsList = foods
    .map(f => {
      const name = f.nome || f.name || 'alimento';
      const grams = f.quantidade ?? f.grams ?? '?';
      return `• ${name} (${grams}g)`;
    })
    .join('\n');

  const kcalLine = totalCalories && totalCalories > 0
    ? `\n📊 *Total: ~${Math.round(totalCalories)} kcal*`
    : '';

  return await sendInteractiveMessage(phone, {
    headerText: '🍽️ Analisei sua refeição!',
    bodyText: `${foodsList}${kcalLine}\n\n*Está correto?*`,
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_confirm', title: '✅ Confirmar' },
      { id: 'sofia_edit', title: '✏️ Corrigir' },
      { id: 'sofia_cancel', title: '❌ Cancelar' },
    ],
  });
}

/**
 * Send medical analysis prompt with buttons
 */
export async function sendMedicalAnalysisPrompt(
  phone: string,
  imagesCount: number
): Promise<boolean> {
  return await sendInteractiveMessage(phone, {
    headerText: `📋 ${imagesCount} ${imagesCount === 1 ? 'imagem recebida' : 'imagens recebidas'}`,
    bodyText: '*Posso analisar agora?*',
    footerText: 'Dr. Vital 🩺',
    buttons: [
      { id: 'vital_analyze', title: '✅ SIM, analisar' },
      { id: 'vital_more', title: '📸 Enviar mais' },
      { id: 'vital_cancel', title: '❌ Cancelar' },
    ],
  });
}

/**
 * Send post-confirmation options
 */
export async function sendPostConfirmation(phone: string): Promise<boolean> {
  return await sendInteractiveMessage(phone, {
    bodyText: '✅ *Análise salva!*\n\nOs dados foram registrados no seu histórico.\n\nO que deseja fazer agora?',
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Nova Foto' },
      { id: 'sofia_meal_plan', title: '🍽️ Cardápio' },
      { id: 'sofia_tips', title: '💡 Dicas' },
    ],
  });
}

/**
 * Send daily check-in
 */
export async function sendDailyCheckin(phone: string, userName?: string): Promise<boolean> {
  const greeting = userName ? `Bom dia, ${userName}!` : 'Bom dia!';
  
  return await sendInteractiveMessage(phone, {
    headerText: `☀️ ${greeting}`,
    bodyText: 'Como você está se sentindo hoje?',
    footerText: 'MaxNutrition 🌿',
    buttons: [
      { id: 'feeling_great', title: '😊 Ótimo!' },
      { id: 'feeling_ok', title: '😐 Normal' },
      { id: 'feeling_bad', title: '😔 Não muito bem' },
    ],
  });
}

/**
 * Send welcome message
 */
export async function sendWelcomeMessage(phone: string, userName?: string): Promise<boolean> {
  const name = userName || 'você';
  
  return await sendInteractiveMessage(phone, {
    headerText: '🌿 Bem-vindo ao MaxNutrition!',
    bodyText: `Olá, ${name}! 👋\n\nSou a Sofia, sua nutricionista virtual!\n\n📸 Envie foto da refeição\n🩺 Envie foto de exame\n💬 Pergunte sobre nutrição`,
    footerText: 'MaxNutrition',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Analisar Refeição' },
      { id: 'sofia_meal_plan', title: '🍽️ Ver Cardápio' },
      { id: 'help', title: '❓ Ajuda' },
    ],
  });
}
