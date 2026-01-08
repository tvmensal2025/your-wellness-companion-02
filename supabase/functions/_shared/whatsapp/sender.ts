/**
 * Centralized WhatsApp message sender using Evolution API
 */

export interface WhatsAppMessageOptions {
  to: string;
  message: string;
  quotedMessageId?: string;
}

export interface WhatsAppMediaOptions {
  to: string;
  mediaUrl: string;
  caption?: string;
  mediaType: "image" | "audio" | "document" | "video";
  fileName?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get Evolution API configuration from environment
 */
function getEvolutionConfig() {
  const apiUrl = Deno.env.get("EVOLUTION_API_URL");
  const apiKey = Deno.env.get("EVOLUTION_API_KEY");
  const instance = Deno.env.get("EVOLUTION_INSTANCE");

  if (!apiUrl || !apiKey || !instance) {
    throw new Error("Missing Evolution API configuration");
  }

  return { apiUrl, apiKey, instance };
}

/**
 * Format phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  
  // Add Brazil country code if not present
  if (!cleaned.startsWith("55")) {
    cleaned = "55" + cleaned;
  }
  
  return cleaned;
}

/**
 * Send a text message via WhatsApp
 */
export async function sendWhatsAppMessage(
  options: WhatsAppMessageOptions
): Promise<WhatsAppSendResult> {
  try {
    const { apiUrl, apiKey, instance } = getEvolutionConfig();
    const formattedPhone = formatPhoneForWhatsApp(options.to);

    const payload: Record<string, unknown> = {
      number: formattedPhone,
      text: options.message,
    };

    if (options.quotedMessageId) {
      payload.quoted = { key: { id: options.quotedMessageId } };
    }

    const response = await fetch(
      `${apiUrl}/message/sendText/${instance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WhatsApp send error:", errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.key?.id || result.messageId,
    };
  } catch (error) {
    console.error("WhatsApp send exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send media (image, audio, document, video) via WhatsApp
 */
export async function sendWhatsAppMedia(
  options: WhatsAppMediaOptions
): Promise<WhatsAppSendResult> {
  try {
    const { apiUrl, apiKey, instance } = getEvolutionConfig();
    const formattedPhone = formatPhoneForWhatsApp(options.to);

    const endpointMap = {
      image: "sendMedia",
      audio: "sendWhatsAppAudio",
      document: "sendMedia",
      video: "sendMedia",
    };

    const endpoint = endpointMap[options.mediaType] || "sendMedia";

    const payload: Record<string, unknown> = {
      number: formattedPhone,
      media: options.mediaUrl,
      caption: options.caption || "",
      mediatype: options.mediaType,
    };

    if (options.fileName) {
      payload.fileName = options.fileName;
    }

    const response = await fetch(
      `${apiUrl}/message/${endpoint}/${instance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WhatsApp media send error:", errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.key?.id || result.messageId,
    };
  } catch (error) {
    console.error("WhatsApp media send exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a button list message via WhatsApp
 */
export async function sendWhatsAppButtons(
  to: string,
  title: string,
  description: string,
  buttons: Array<{ id: string; text: string }>
): Promise<WhatsAppSendResult> {
  try {
    const { apiUrl, apiKey, instance } = getEvolutionConfig();
    const formattedPhone = formatPhoneForWhatsApp(to);

    const response = await fetch(
      `${apiUrl}/message/sendButtons/${instance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify({
          number: formattedPhone,
          title,
          description,
          buttons: buttons.map((b) => ({
            type: "reply",
            reply: { id: b.id, title: b.text },
          })),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return { success: true, messageId: result.key?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
