/**
 * WHATSAPP SAFE SENDER
 * 
 * Sistema seguro de envio de mensagens WhatsApp com:
 * - Retry automático (3 tentativas)
 * - Validação de mensagem
 * - Fallback para mensagem simplificada
 * - Logging detalhado
 */

interface SendResult {
  success: boolean;
  error?: string;
  messageId?: string;
  retries?: number;
}

const EVOLUTION_URL = Deno.env.get("EVOLUTION_API_URL") || "https://cloud.evolution-api.com";
const EVOLUTION_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "MaxNutrition";

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sanitiza mensagem para evitar erros de formatação
 */
function sanitizeMessage(text: string): string {
  if (!text) return '';
  
  // Remove caracteres invisíveis problemáticos
  let sanitized = text
    .replace(/\u200B/g, '') // Zero-width space
    .replace(/\u200C/g, '') // Zero-width non-joiner
    .replace(/\u200D/g, '') // Zero-width joiner
    .replace(/\uFEFF/g, ''); // BOM
  
  // Limita tamanho da mensagem (WhatsApp tem limite de ~65536 caracteres)
  if (sanitized.length > 4000) {
    sanitized = sanitized.substring(0, 3997) + '...';
  }
  
  return sanitized;
}

/**
 * Envia mensagem WhatsApp com retry e fallback
 */
export async function sendWhatsAppSafe(
  phone: string,
  text: string,
  maxRetries: number = 3
): Promise<SendResult> {
  if (!phone || !text) {
    console.error('[WhatsApp Sender] Phone ou texto vazio');
    return { success: false, error: 'Phone ou texto vazio' };
  }

  if (!EVOLUTION_KEY) {
    console.error('[WhatsApp Sender] EVOLUTION_API_KEY não configurada');
    return { success: false, error: 'API key não configurada' };
  }

  const sanitizedText = sanitizeMessage(text);
  const cleanPhone = phone.replace(/\D/g, '');
  
  let lastError = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[WhatsApp Sender] Enviando para ${cleanPhone} (tentativa ${attempt}/${maxRetries})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(
        `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_KEY,
          },
          body: JSON.stringify({
            number: cleanPhone,
            text: sanitizedText,
          }),
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[WhatsApp Sender] ✅ Mensagem enviada para ${cleanPhone}`);
        return { 
          success: true, 
          messageId: data?.key?.id || data?.id,
          retries: attempt 
        };
      }
      
      const errorText = await response.text();
      lastError = `HTTP ${response.status}: ${errorText}`;
      console.warn(`[WhatsApp Sender] Erro ${response.status}: ${errorText}`);
      
      // Não fazer retry para erros definitivos
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: 'Autenticação inválida' };
      }
      
      if (response.status === 404) {
        return { success: false, error: 'Instância não encontrada' };
      }
      
      // Esperar antes de tentar novamente
      if (attempt < maxRetries) {
        await sleep(1000 * attempt);
      }
      
    } catch (error) {
      const err = error as Error;
      lastError = err.name === 'AbortError' ? 'Timeout' : err.message;
      console.warn(`[WhatsApp Sender] Exceção: ${lastError}`);
      
      if (attempt < maxRetries) {
        await sleep(1000 * attempt);
      }
    }
  }
  
  console.error(`[WhatsApp Sender] ❌ Falha após ${maxRetries} tentativas: ${lastError}`);
  return { success: false, error: lastError, retries: maxRetries };
}

/**
 * Envia mensagem com fallback para versão simplificada
 */
export async function sendWhatsAppWithFallback(
  phone: string,
  primaryText: string,
  fallbackText?: string
): Promise<SendResult> {
  // Tentar mensagem principal
  let result = await sendWhatsAppSafe(phone, primaryText, 2);
  
  if (result.success) {
    return result;
  }
  
  // Se falhou e tem fallback, tentar versão simplificada
  if (fallbackText && fallbackText !== primaryText) {
    console.log('[WhatsApp Sender] Tentando mensagem de fallback...');
    result = await sendWhatsAppSafe(phone, fallbackText, 2);
  }
  
  return result;
}

/**
 * Verifica status da conexão WhatsApp
 */
export async function checkWhatsAppConnection(): Promise<{
  connected: boolean;
  status?: string;
  error?: string;
}> {
  if (!EVOLUTION_KEY) {
    return { connected: false, error: 'API key não configurada' };
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `${EVOLUTION_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`,
      {
        headers: { 'apikey': EVOLUTION_KEY },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return { connected: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    const state = data?.instance?.state || data?.state;
    
    return {
      connected: state === 'open' || state === 'connected',
      status: state,
    };
    
  } catch (error) {
    const err = error as Error;
    return { 
      connected: false, 
      error: err.name === 'AbortError' ? 'Timeout' : err.message 
    };
  }
}
