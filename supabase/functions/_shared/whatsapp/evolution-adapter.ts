// ============================================
// Evolution API Adapter
// Adapter for Evolution API (self-hosted WhatsApp)
// ============================================

import {
  WhatsAppProvider,
  SendResult,
  MediaContent,
  InteractiveContent,
  ConnectionStatus,
  WhatsAppErrorCode,
  createWhatsAppError,
  IWhatsAppAdapter,
} from './types.ts';
import { formatPhoneNumber } from './phone-formatter.ts';

// ============================================
// Configuration Interface
// ============================================

export interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instance: string;
}

// ============================================
// Evolution Adapter Class
// ============================================

export class EvolutionAdapter implements IWhatsAppAdapter {
  readonly provider: WhatsAppProvider = 'evolution';
  private config: EvolutionConfig;
  
  constructor(config: EvolutionConfig) {
    this.config = config;
  }
  
  /**
   * Send a text message
   */
  async sendText(
    phone: string,
    message: string,
    options?: { userId?: string }
  ): Promise<SendResult> {
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone) {
      return {
        success: false,
        provider: this.provider,
        error: 'Invalid phone number format',
        errorCode: WhatsAppErrorCode.INVALID_PHONE_FORMAT,
      };
    }
    
    console.log(`[Evolution] Sending text to ${formattedPhone}`);
    
    try {
      const response = await fetch(
        `${this.config.apiUrl}/message/sendText/${this.config.instance}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.config.apiKey,
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: message,
            delay: 1200, // Simulates typing
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[Evolution] Error sending text:', data);
        return {
          success: false,
          provider: this.provider,
          error: data.message || 'Failed to send message',
          errorCode: this.mapHttpErrorCode(response.status, data),
        };
      }
      
      console.log('[Evolution] Text sent successfully:', data);
      
      return {
        success: true,
        provider: this.provider,
        messageId: data.key?.id || data.messageId || data.id,
      };
    } catch (error) {
      console.error('[Evolution] Network error:', error);
      return {
        success: false,
        provider: this.provider,
        error: error instanceof Error ? error.message : 'Network error',
        errorCode: WhatsAppErrorCode.PROVIDER_UNAVAILABLE,
      };
    }
  }
  
  /**
   * Send media (image, document, audio, video)
   */
  async sendMedia(
    phone: string,
    media: MediaContent,
    options?: { userId?: string; mediaType?: string }
  ): Promise<SendResult> {
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone) {
      return {
        success: false,
        provider: this.provider,
        error: 'Invalid phone number format',
        errorCode: WhatsAppErrorCode.INVALID_PHONE_FORMAT,
      };
    }
    
    const mediaType = options?.mediaType || 'image';
    console.log(`[Evolution] Sending ${mediaType} to ${formattedPhone}`);
    
    try {
      const body: Record<string, any> = {
        number: formattedPhone,
        mediatype: mediaType,
        delay: 1500,
      };
      
      // Use URL or Base64
      if (media.base64) {
        body.media = media.base64;
      } else if (media.url) {
        body.media = media.url;
      } else {
        return {
          success: false,
          provider: this.provider,
          error: 'Media URL or base64 is required',
          errorCode: WhatsAppErrorCode.INVALID_CONTENT,
        };
      }
      
      if (media.caption) {
        body.caption = media.caption;
      }
      
      if (media.fileName) {
        body.fileName = media.fileName;
      }
      
      const response = await fetch(
        `${this.config.apiUrl}/message/sendMedia/${this.config.instance}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.config.apiKey,
          },
          body: JSON.stringify(body),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[Evolution] Error sending media:', data);
        return {
          success: false,
          provider: this.provider,
          error: data.message || 'Failed to send media',
          errorCode: this.mapHttpErrorCode(response.status, data),
        };
      }
      
      console.log('[Evolution] Media sent successfully:', data);
      
      return {
        success: true,
        provider: this.provider,
        messageId: data.key?.id || data.messageId || data.id,
      };
    } catch (error) {
      console.error('[Evolution] Network error:', error);
      return {
        success: false,
        provider: this.provider,
        error: error instanceof Error ? error.message : 'Network error',
        errorCode: WhatsAppErrorCode.PROVIDER_UNAVAILABLE,
      };
    }
  }
  
  /**
   * Send interactive message (converted to text with numbered options)
   * Evolution API doesn't support native interactive messages,
   * so we convert them to text with numbered options
   */
  async sendInteractive(
    phone: string,
    content: InteractiveContent,
    options?: { userId?: string }
  ): Promise<SendResult> {
    // Convert interactive content to text fallback
    const textMessage = this.convertInteractiveToText(content);
    
    console.log('[Evolution] Converting interactive to text fallback');
    
    return this.sendText(phone, textMessage, options);
  }
  
  /**
   * Check connection status
   */
  async checkConnection(): Promise<ConnectionStatus> {
    console.log(`[Evolution] Checking connection for instance ${this.config.instance}`);
    
    try {
      const response = await fetch(
        `${this.config.apiUrl}/instance/connectionState/${this.config.instance}`,
        {
          method: 'GET',
          headers: {
            'apikey': this.config.apiKey,
          },
        }
      );
      
      const rawText = await response.text();
      let raw: any = null;
      
      try {
        raw = rawText ? JSON.parse(rawText) : null;
      } catch {
        raw = rawText;
      }
      
      const stateRaw = raw?.instance?.state ?? raw?.state ?? raw?.connectionState ?? raw?.status ?? '';
      const state = typeof stateRaw === 'string' ? stateRaw.toLowerCase() : '';
      const connected = response.ok && ['open', 'connected', 'online'].includes(state);
      
      console.log('[Evolution] Connection state:', { state, connected });
      
      return {
        connected,
        provider: this.provider,
        state: state || null,
        lastCheck: new Date().toISOString(),
        error: connected ? undefined : 'Not connected',
      };
    } catch (error) {
      console.error('[Evolution] Error checking connection:', error);
      return {
        connected: false,
        provider: this.provider,
        state: null,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Connection check failed',
      };
    }
  }
  
  /**
   * Convert interactive content to text with numbered options
   * This is the fallback for Evolution API which doesn't support native buttons
   */
  convertInteractiveToText(content: InteractiveContent): string {
    let text = '';
    
    // Add header if present
    if (content.header?.text) {
      text += `*${content.header.text}*\n\n`;
    }
    
    // Add body
    text += content.body.text + '\n\n';
    
    // Convert action to numbered options
    if (content.type === 'button' && 'buttons' in content.action) {
      const buttons = content.action.buttons;
      buttons.forEach((button, index) => {
        const emoji = this.getNumberEmoji(index + 1);
        text += `${emoji} ${button.title}\n`;
      });
      text += '\n_Responda com o número da opção_';
    } else if (content.type === 'list' && 'sections' in content.action) {
      const listAction = content.action;
      text += `📋 *${listAction.label}*\n\n`;
      
      let optionNumber = 1;
      for (const section of listAction.sections) {
        if (section.title) {
          text += `*${section.title}*\n`;
        }
        for (const row of section.rows) {
          const emoji = this.getNumberEmoji(optionNumber);
          text += `${emoji} ${row.title}`;
          if (row.description) {
            text += ` - ${row.description}`;
          }
          text += '\n';
          optionNumber++;
        }
        text += '\n';
      }
      text += '_Responda com o número da opção_';
    } else if (content.type === 'carousel' && 'cards' in content.action) {
      // Carousel fallback - show cards as numbered items
      const cards = content.action.cards;
      cards.forEach((card, index) => {
        const emoji = this.getNumberEmoji(index + 1);
        text += `${emoji} *${card.text}*\n`;
        if (card.buttons && card.buttons.length > 0) {
          card.buttons.forEach(btn => {
            text += `   • ${btn.title}\n`;
          });
        }
        text += '\n';
      });
      text += '_Responda com o número do item_';
    }
    
    // Add footer if present
    if (content.footer?.text) {
      text += `\n\n_${content.footer.text}_`;
    }
    
    return text;
  }
  
  /**
   * Get number emoji for fallback text
   */
  private getNumberEmoji(num: number): string {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[num - 1] || `${num}.`;
  }
  
  /**
   * Map HTTP error codes to WhatsApp error codes
   */
  private mapHttpErrorCode(status: number, data: any): WhatsAppErrorCode {
    if (status === 401 || status === 403) {
      return WhatsAppErrorCode.PROVIDER_AUTH_FAILED;
    }
    if (status === 429) {
      return WhatsAppErrorCode.PROVIDER_RATE_LIMITED;
    }
    if (status === 408 || status === 504) {
      return WhatsAppErrorCode.PROVIDER_TIMEOUT;
    }
    if (data?.message?.includes('not on WhatsApp') || data?.error?.includes('not registered')) {
      return WhatsAppErrorCode.NUMBER_NOT_ON_WHATSAPP;
    }
    if (status >= 500) {
      return WhatsAppErrorCode.PROVIDER_UNAVAILABLE;
    }
    return WhatsAppErrorCode.MESSAGE_REJECTED;
  }
}

// ============================================
// Factory Function
// ============================================

export function createEvolutionAdapter(): EvolutionAdapter {
  const config: EvolutionConfig = {
    apiUrl: Deno.env.get('EVOLUTION_API_URL') || '',
    apiKey: Deno.env.get('EVOLUTION_API_KEY') || '',
    instance: Deno.env.get('EVOLUTION_INSTANCE') || '',
  };
  
  if (!config.apiUrl || !config.apiKey || !config.instance) {
    throw new Error('Evolution API configuration missing. Check EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE');
  }
  
  return new EvolutionAdapter(config);
}
