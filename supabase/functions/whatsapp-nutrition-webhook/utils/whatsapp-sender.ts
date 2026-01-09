/**
 * WhatsApp message sending utility com retry e fallback
 */

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format phone number for WhatsApp
 */
function formatPhone(phone: string): string {
  let formatted = phone.replace(/\D/g, "");
  if (!formatted.startsWith("55")) {
    formatted = "55" + formatted;
  }
  return formatted;
}

/**
 * Sanitiza mensagem para evitar erros
 */
function sanitizeMessage(text: string): string {
  if (!text) return '';
  
  let sanitized = text
    .replace(/\u200B/g, '') // Zero-width space
    .replace(/\u200C/g, '') // Zero-width non-joiner
    .replace(/\u200D/g, '') // Zero-width joiner
    .replace(/\uFEFF/g, ''); // BOM
  
  // Limita tamanho (WhatsApp tem limite)
  if (sanitized.length > 4000) {
    sanitized = sanitized.substring(0, 3997) + '...';
  }
  
  return sanitized;
}

/**
 * Send text message via WhatsApp com retry automático
 */
export async function sendWhatsApp(
  phone: string, 
  message: string,
  maxRetries: number = 3
): Promise<boolean> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.error("[WhatsApp] Evolution API não configurada");
    return false;
  }

  const formattedPhone = formatPhone(phone);
  const sanitizedMessage = sanitizeMessage(message);
  
  let lastError = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(
        `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: EVOLUTION_API_KEY,
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: sanitizedMessage,
            delay: 1200,
          }),
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`[WhatsApp] ✅ Mensagem enviada para ${formattedPhone}`);
        return true;
      }
      
      const errorData = await response.text();
      lastError = `HTTP ${response.status}: ${errorData}`;
      console.warn(`[WhatsApp] Erro ${response.status} (tentativa ${attempt}/${maxRetries}): ${errorData}`);
      
      // Não fazer retry para erros definitivos
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        return false;
      }
      
      if (attempt < maxRetries) {
        await sleep(1000 * attempt);
      }
      
    } catch (error) {
      const err = error as Error;
      lastError = err.name === 'AbortError' ? 'Timeout' : err.message;
      console.warn(`[WhatsApp] Exceção (tentativa ${attempt}/${maxRetries}): ${lastError}`);
      
      if (attempt < maxRetries) {
        await sleep(1000 * attempt);
      }
    }
  }
  
  console.error(`[WhatsApp] ❌ Falha após ${maxRetries} tentativas: ${lastError}`);
  return false;
}

/**
 * Envia mensagem com fallback para versão simplificada
 */
export async function sendWhatsAppWithFallback(
  phone: string,
  primaryText: string,
  fallbackText: string
): Promise<boolean> {
  // Tentar mensagem principal
  let success = await sendWhatsApp(phone, primaryText, 2);
  
  if (success) return true;
  
  // Se falhou, tentar versão simplificada
  console.log('[WhatsApp] Tentando mensagem de fallback...');
  return await sendWhatsApp(phone, fallbackText, 2);
}

/**
 * Get base64 from Evolution API media message com retry
 */
export async function getBase64FromEvolution(webhook: any): Promise<string | null> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    return null;
  }

  const messageKey = webhook.data?.key || {};
  const messageContent = webhook.data?.message || {};

  const payload = {
    message: {
      key: {
        remoteJid: messageKey.remoteJid,
        fromMe: messageKey.fromMe || false,
        id: messageKey.id,
      },
      message: messageContent,
    },
    convertToMp4: false,
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const response = await fetch(
        `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${EVOLUTION_INSTANCE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: EVOLUTION_API_KEY,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[WhatsApp] getBase64 erro ${response.status} (tentativa ${attempt})`);
        if (attempt < 3) {
          await sleep(1000 * attempt);
          continue;
        }
        return null;
      }

      const responseData = await response.json();
      const base64 = responseData?.base64 || responseData?.data?.base64 || responseData?.media || null;
      
      if (base64) {
        console.log('[WhatsApp] ✅ Base64 obtido com sucesso');
        return base64;
      }
      
    } catch (e) {
      const err = e as Error;
      console.warn(`[WhatsApp] getBase64 exceção (tentativa ${attempt}): ${err.message}`);
      if (attempt < 3) {
        await sleep(1000 * attempt);
      }
    }
  }
  
  return null;
}
