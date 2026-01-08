/**
 * WhatsApp message sending utility
 */

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

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
 * Send text message via WhatsApp
 */
export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.error("[WhatsApp] Evolution API não configurada");
    return;
  }

  const formattedPhone = formatPhone(phone);

  try {
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
          text: message,
          delay: 1200,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[WhatsApp] Erro ao enviar mensagem:", errorData);
    } else {
      console.log("[WhatsApp] Mensagem enviada com sucesso");
    }
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar WhatsApp:", error);
  }
}

/**
 * Get base64 from Evolution API media message
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

  try {
    const response = await fetch(
      `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${EVOLUTION_INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      return null;
    }

    const responseData = await response.json();
    return responseData?.base64 || responseData?.data?.base64 || responseData?.media || null;
  } catch (e) {
    return null;
  }
}
