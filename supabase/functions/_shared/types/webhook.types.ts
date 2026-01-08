/**
 * Shared webhook-related types for edge functions
 */

/**
 * Evolution API webhook message types
 */
export interface EvolutionWebhookPayload {
  event?: string;
  instance?: string;
  data?: EvolutionMessageData;
  sender?: string;
  apikey?: string;
}

export interface EvolutionMessageData {
  key?: {
    remoteJid?: string;
    fromMe?: boolean;
    id?: string;
  };
  pushName?: string;
  message?: {
    conversation?: string;
    extendedTextMessage?: {
      text?: string;
    };
    imageMessage?: {
      url?: string;
      mimetype?: string;
      caption?: string;
      mediaKey?: string;
      directPath?: string;
    };
    audioMessage?: {
      url?: string;
      mimetype?: string;
      ptt?: boolean;
    };
    documentMessage?: {
      url?: string;
      mimetype?: string;
      fileName?: string;
    };
    buttonsResponseMessage?: {
      selectedButtonId?: string;
    };
    listResponseMessage?: {
      singleSelectReply?: {
        selectedRowId?: string;
      };
    };
  };
  messageType?: string;
  messageTimestamp?: number;
}

/**
 * Extracted message info for easier handling
 */
export interface ParsedWhatsAppMessage {
  phone: string;
  messageId: string;
  senderName: string;
  messageType: "text" | "image" | "audio" | "document" | "button" | "list" | "unknown";
  text?: string;
  mediaUrl?: string;
  mediaMimetype?: string;
  buttonId?: string;
  listRowId?: string;
  caption?: string;
  isFromMe: boolean;
  timestamp: number;
}

/**
 * Parse Evolution webhook payload into a clean structure
 */
export function parseEvolutionMessage(
  payload: EvolutionWebhookPayload
): ParsedWhatsAppMessage | null {
  const data = payload.data;
  if (!data?.key?.remoteJid) return null;

  const phone = data.key.remoteJid.replace("@s.whatsapp.net", "");
  const message = data.message;

  let messageType: ParsedWhatsAppMessage["messageType"] = "unknown";
  let text: string | undefined;
  let mediaUrl: string | undefined;
  let mediaMimetype: string | undefined;
  let buttonId: string | undefined;
  let listRowId: string | undefined;
  let caption: string | undefined;

  if (message?.conversation) {
    messageType = "text";
    text = message.conversation;
  } else if (message?.extendedTextMessage?.text) {
    messageType = "text";
    text = message.extendedTextMessage.text;
  } else if (message?.imageMessage) {
    messageType = "image";
    mediaUrl = message.imageMessage.url;
    mediaMimetype = message.imageMessage.mimetype;
    caption = message.imageMessage.caption;
  } else if (message?.audioMessage) {
    messageType = "audio";
    mediaUrl = message.audioMessage.url;
    mediaMimetype = message.audioMessage.mimetype;
  } else if (message?.documentMessage) {
    messageType = "document";
    mediaUrl = message.documentMessage.url;
    mediaMimetype = message.documentMessage.mimetype;
  } else if (message?.buttonsResponseMessage) {
    messageType = "button";
    buttonId = message.buttonsResponseMessage.selectedButtonId;
  } else if (message?.listResponseMessage) {
    messageType = "list";
    listRowId = message.listResponseMessage.singleSelectReply?.selectedRowId;
  }

  return {
    phone,
    messageId: data.key.id || "",
    senderName: data.pushName || "",
    messageType,
    text,
    mediaUrl,
    mediaMimetype,
    buttonId,
    listRowId,
    caption,
    isFromMe: data.key.fromMe || false,
    timestamp: data.messageTimestamp || Date.now(),
  };
}

/**
 * Pending confirmation for multi-step flows
 */
export interface PendingConfirmation {
  id: string;
  user_id: string;
  confirmation_type: string;
  data: Record<string, unknown>;
  expires_at: string;
  created_at: string;
}

/**
 * Webhook processing result
 */
export interface WebhookProcessingResult {
  success: boolean;
  action?: string;
  responseMessage?: string;
  error?: string;
  shouldReply: boolean;
}
