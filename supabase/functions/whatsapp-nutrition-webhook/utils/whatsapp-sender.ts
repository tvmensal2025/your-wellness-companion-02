/**
 * WhatsApp message sending utility - APENAS WHAPI
 * Evolution desativado
 */

const WHAPI_API_URL = Deno.env.get('WHAPI_API_URL') || 'https://gate.whapi.cloud';
const WHAPI_TOKEN = Deno.env.get('WHAPI_TOKEN') || '';
const WHAPI_CHANNEL_ID = Deno.env.get('WHAPI_CHANNEL_ID') || '';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format phone for Whapi (só números, sem @s.whatsapp.net)
 */
function formatPhoneWhapi(phone: string): string {
  let formatted = phone.replace(/\D/g, '');
  if (!formatted.startsWith('55')) {
    formatted = '55' + formatted;
  }
  return formatted;
}

/**
 * Sanitiza mensagem para evitar erros
 */
function sanitizeMessage(text: string): string {
  if (!text) return '';
  
  let sanitized = text
    .replace(/\u200B/g, '')
    .replace(/\u200C/g, '')
    .replace(/\u200D/g, '')
    .replace(/\uFEFF/g, '');
  
  if (sanitized.length > 4000) {
    sanitized = sanitized.substring(0, 3997) + '...';
  }
  
  return sanitized;
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
 * Send text message via Whapi
 */
async function sendWhapiText(phone: string, text: string): Promise<boolean> {
  if (!WHAPI_TOKEN) {
    console.error('[Whapi] ❌ Token não configurado');
    return false;
  }

  const formattedPhone = formatPhoneWhapi(phone);
  const sanitizedMessage = sanitizeMessage(text);
  
  console.log('[Whapi] Config:', {
    url: WHAPI_API_URL,
    channelId: WHAPI_CHANNEL_ID ? `configurado (${WHAPI_CHANNEL_ID.substring(0, 10)}...)` : 'NÃO configurado',
    tokenLength: WHAPI_TOKEN?.length || 0,
    phone: formattedPhone,
  });
  
  try {
    console.log(`[Whapi] Enviando texto para ${formattedPhone}`);
    
    const response = await fetch(`${WHAPI_API_URL}/messages/text`, {
      method: 'POST',
      headers: getWhapiHeaders(),
      body: JSON.stringify({
        to: formattedPhone,
        body: sanitizedMessage,
      }),
    });

    const responseText = await response.text();
    console.log(`[Whapi] Response status: ${response.status}, body: ${responseText.substring(0, 300)}`);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[Whapi] Resposta não é JSON:', responseText.substring(0, 200));
      return false;
    }

    if (!response.ok) {
      console.error('[Whapi] Erro ao enviar texto:', data);
      if (response.status === 404 && !WHAPI_CHANNEL_ID) {
        console.error('[Whapi] ⚠️ DICA: Configure o secret WHAPI_CHANNEL_ID!');
      }
      return false;
    }

    if (data.sent === false) {
      console.error('[Whapi] Mensagem não foi enviada:', data);
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
 * Send text message via WhatsApp - APENAS WHAPI
 */
export async function sendWhatsApp(
  phone: string, 
  message: string,
  _maxRetries: number = 3
): Promise<boolean> {
  console.log('[WhatsApp] Usando Whapi (único provider)');
  return await sendWhapiText(phone, message);
}

/**
 * Envia mensagem com fallback para versão simplificada
 */
export async function sendWhatsAppWithFallback(
  phone: string,
  primaryText: string,
  fallbackText: string
): Promise<boolean> {
  const success = await sendWhatsApp(phone, primaryText, 2);
  
  if (success) return true;
  
  console.log('[WhatsApp] Tentando mensagem de fallback...');
  return await sendWhatsApp(phone, fallbackText, 2);
}

/**
 * Get base64 from Whapi media (placeholder - não usado mais)
 */
export async function getBase64FromEvolution(_webhook: any): Promise<string | null> {
  console.log('[WhatsApp] getBase64FromEvolution desativado - usar Whapi');
  return null;
}
