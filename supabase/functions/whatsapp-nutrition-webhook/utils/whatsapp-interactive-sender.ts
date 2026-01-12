/**
 * WhatsApp Interactive Message Sender - APENAS WHAPI
 * Evolution desativado
 */

const WHAPI_API_URL = Deno.env.get('WHAPI_API_URL') || 'https://gate.whapi.cloud';
const WHAPI_TOKEN = Deno.env.get('WHAPI_TOKEN') || '';
const WHAPI_CHANNEL_ID = Deno.env.get('WHAPI_CHANNEL_ID') || '';

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
 * Build Whapi headers with Channel ID
 */
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

/**
 * Send interactive message with buttons via Whapi
 */
async function sendWhapiInteractive(
  phone: string,
  message: InteractiveMessage
): Promise<boolean> {
  if (!WHAPI_TOKEN) {
    console.error('[Whapi] ❌ Token não configurado');
    return false;
  }

  // Whapi usa só o número
  let formattedPhone = phone.replace(/\D/g, '');
  if (!formattedPhone.startsWith('55')) {
    formattedPhone = '55' + formattedPhone;
  }
  
  console.log('[Whapi Interactive] Config:', {
    url: WHAPI_API_URL,
    channelId: WHAPI_CHANNEL_ID ? `configurado (${WHAPI_CHANNEL_ID.substring(0, 10)}...)` : 'NÃO configurado',
    tokenLength: WHAPI_TOKEN?.length || 0,
    phone: formattedPhone,
  });
  
  try {
    // Formato Whapi para botões interativos
    const payload: Record<string, any> = {
      to: formattedPhone,
      type: 'button',
      body: { text: message.bodyText },
      action: {
        buttons: message.buttons.slice(0, 3).map(btn => ({
          type: 'quick_reply',
          title: btn.title.substring(0, 25),
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

    console.log('[Whapi Interactive] Payload:', JSON.stringify(payload).substring(0, 500));

    const response = await fetch(`${WHAPI_API_URL}/messages/interactive`, {
      method: 'POST',
      headers: getWhapiHeaders(),
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`[Whapi Interactive] Status: ${response.status}, Body: ${responseText.substring(0, 400)}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[Whapi Interactive] Resposta não é JSON:', responseText);
      return false;
    }

    if (!response.ok) {
      console.error('[Whapi Interactive] Erro HTTP:', response.status, data);
      if (response.status === 404 && !WHAPI_CHANNEL_ID) {
        console.error('[Whapi] ⚠️ DICA: Configure WHAPI_CHANNEL_ID!');
      }
      return false;
    }

    if (data.sent === false) {
      console.error('[Whapi Interactive] Não enviado:', data);
      return false;
    }

    console.log('[Whapi Interactive] ✅ Enviado:', data?.message?.id || data?.id || 'ok');
    return true;
  } catch (error) {
    console.error('[Whapi Interactive] Exceção:', error);
    return false;
  }
}

/**
 * Send text via Whapi
 */
async function sendWhapiText(phone: string, text: string): Promise<boolean> {
  if (!WHAPI_TOKEN) {
    console.error('[Whapi] ❌ Token não configurado');
    return false;
  }

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
    console.log(`[Whapi Text] Status: ${response.status}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[Whapi Text] Resposta não é JSON:', responseText.substring(0, 200));
      return false;
    }

    if (!response.ok) {
      console.error('[Whapi Text] Erro:', data);
      return false;
    }

    console.log('[Whapi Text] ✅ Enviado:', data?.message?.id || data?.id || 'ok');
    return true;
  } catch (error) {
    console.error('[Whapi Text] Exceção:', error);
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
 * Send interactive message - tenta botões, fallback para texto
 */
export async function sendInteractiveMessage(
  phone: string,
  message: InteractiveMessage
): Promise<boolean> {
  console.log('[WhatsApp] Enviando mensagem interativa via Whapi');
  
  const success = await sendWhapiInteractive(phone, message);
  if (success) return true;
  
  // Fallback para texto
  console.log('[WhatsApp] Botões falharam, enviando como texto...');
  const textFallback = convertToTextFallback(message);
  return await sendWhapiText(phone, textFallback);
}

/**
 * Send simple text message
 */
export async function sendTextMessage(phone: string, text: string): Promise<boolean> {
  return await sendWhapiText(phone, text);
}

// ============================================
// Pre-built Interactive Messages
// ============================================

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

/**
 * TEMPLATE DE TESTE - Use para verificar se botões funcionam
 */
export async function sendTestButtons(phone: string): Promise<boolean> {
  return await sendInteractiveMessage(phone, {
    headerText: '🧪 TESTE DE BOTÕES',
    bodyText: 'Esta é uma mensagem de teste para verificar se os botões interativos estão funcionando corretamente.\n\nClique em um botão abaixo:',
    footerText: 'Teste Whapi',
    buttons: [
      { id: 'test_btn_1', title: '✅ Botão 1' },
      { id: 'test_btn_2', title: '🔄 Botão 2' },
      { id: 'test_btn_3', title: '❌ Botão 3' },
    ],
  });
}
