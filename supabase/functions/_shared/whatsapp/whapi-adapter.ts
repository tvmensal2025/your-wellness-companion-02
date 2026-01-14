// ============================================
// Whapi API Adapter
// Adapter for Whapi Cloud (WhatsApp with interactive buttons)
// ============================================

import {
  WhatsAppProvider,
  SendResult,
  MediaContent,
  InteractiveContent,
  ConnectionStatus,
  WhatsAppErrorCode,
  IWhatsAppAdapter,
  ButtonAction,
  ListAction,
  CarouselAction,
} from './types.ts';
import { formatPhoneNumber } from './phone-formatter.ts';

// ============================================
// Configuration Interface
// ============================================

export interface WhapiConfig {
  apiUrl: string;
  apiToken: string;
  channelId?: string;
}


// ============================================
// Whapi Adapter Class
// ============================================

export class WhapiAdapter implements IWhatsAppAdapter {
  readonly provider: WhatsAppProvider = 'whapi';
  private config: WhapiConfig;
  
  constructor(config: WhapiConfig) {
    this.config = config;
  }
  
  /**
   * Get headers for Whapi API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.config.apiToken}`,
    };
    
    if (this.config.channelId) {
      headers['X-Channel-Id'] = this.config.channelId;
    }
    
    return headers;
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
    
    console.log(`[Whapi] Sending text to ${formattedPhone}`);
    
    try {
      const response = await fetch(`${this.config.apiUrl}/messages/text`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          to: formattedPhone,
          body: message,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[Whapi] Error sending text:', data);
        return {
          success: false,
          provider: this.provider,
          error: data.message || data.error || 'Failed to send message',
          errorCode: this.mapHttpErrorCode(response.status, data),
        };
      }
      
      console.log('[Whapi] Text sent successfully:', data);
      
      return {
        success: true,
        provider: this.provider,
        messageId: data.message?.id || data.id,
      };
    } catch (error) {
      console.error('[Whapi] Network error:', error);
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
    console.log(`[Whapi] Sending ${mediaType} to ${formattedPhone}`);
    
    try {
      // Determine endpoint based on media type
      const endpoint = this.getMediaEndpoint(mediaType);
      
      const body: Record<string, any> = {
        to: formattedPhone,
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
        body.filename = media.fileName;
      }
      
      const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[Whapi] Error sending media:', data);
        return {
          success: false,
          provider: this.provider,
          error: data.message || data.error || 'Failed to send media',
          errorCode: this.mapHttpErrorCode(response.status, data),
        };
      }
      
      console.log('[Whapi] Media sent successfully:', data);
      
      return {
        success: true,
        provider: this.provider,
        messageId: data.message?.id || data.id,
      };
    } catch (error) {
      console.error('[Whapi] Network error:', error);
      return {
        success: false,
        provider: this.provider,
        error: error instanceof Error ? error.message : 'Network error',
        errorCode: WhatsAppErrorCode.PROVIDER_UNAVAILABLE,
      };
    }
  }

  
  /**
   * Send interactive message (buttons, lists, or carousel)
   * This is Whapi's main advantage - native interactive support
   */
  async sendInteractive(
    phone: string,
    content: InteractiveContent,
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
    
    // Validate interactive content limits
    const validationError = this.validateInteractiveContent(content);
    if (validationError) {
      return {
        success: false,
        provider: this.provider,
        error: validationError.message,
        errorCode: validationError.code,
      };
    }
    
    console.log(`[Whapi] Sending interactive (${content.type}) to ${formattedPhone}`);
    
    try {
      const payload = this.formatInteractivePayload(formattedPhone, content);
      
      const response = await fetch(`${this.config.apiUrl}/messages/interactive`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[Whapi] Error sending interactive:', data);
        return {
          success: false,
          provider: this.provider,
          error: data.message || data.error || 'Failed to send interactive message',
          errorCode: this.mapHttpErrorCode(response.status, data),
        };
      }
      
      console.log('[Whapi] Interactive sent successfully:', data);
      
      return {
        success: true,
        provider: this.provider,
        messageId: data.message?.id || data.id,
      };
    } catch (error) {
      console.error('[Whapi] Network error:', error);
      return {
        success: false,
        provider: this.provider,
        error: error instanceof Error ? error.message : 'Network error',
        errorCode: WhatsAppErrorCode.PROVIDER_UNAVAILABLE,
      };
    }
  }

  
  /**
   * Send carousel message (up to 10 cards)
   */
  async sendCarousel(
    phone: string,
    cards: CarouselAction['cards'],
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
    
    // Validate carousel limits
    if (cards.length > 10) {
      return {
        success: false,
        provider: this.provider,
        error: 'Carousel cannot have more than 10 cards',
        errorCode: WhatsAppErrorCode.CAROUSEL_LIMIT_EXCEEDED,
      };
    }
    
    console.log(`[Whapi] Sending carousel with ${cards.length} cards to ${formattedPhone}`);
    
    try {
      const payload = {
        to: formattedPhone,
        cards: cards.map(card => ({
          id: card.id,
          media: card.media,
          body: { text: card.text },
          action: {
            buttons: card.buttons.map(btn => ({
              type: btn.type,
              title: btn.title,
              id: btn.id,
              ...(btn.payload && { payload: btn.payload }),
            })),
          },
        })),
      };
      
      const response = await fetch(`${this.config.apiUrl}/messages/carousel`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[Whapi] Error sending carousel:', data);
        return {
          success: false,
          provider: this.provider,
          error: data.message || data.error || 'Failed to send carousel',
          errorCode: this.mapHttpErrorCode(response.status, data),
        };
      }
      
      console.log('[Whapi] Carousel sent successfully:', data);
      
      return {
        success: true,
        provider: this.provider,
        messageId: data.message?.id || data.id,
      };
    } catch (error) {
      console.error('[Whapi] Network error:', error);
      return {
        success: false,
        provider: this.provider,
        error: error instanceof Error ? error.message : 'Network error',
        errorCode: WhatsAppErrorCode.PROVIDER_UNAVAILABLE,
      };
    }
  }

  
  /**
   * Check connection status
   */
  async checkConnection(): Promise<ConnectionStatus> {
    console.log('[Whapi] Checking connection status');
    
    try {
      const response = await fetch(`${this.config.apiUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      const data = await response.json();
      const connected = response.ok && data.status === 'ok';
      
      console.log('[Whapi] Connection status:', { connected, data });
      
      return {
        connected,
        provider: this.provider,
        state: connected ? 'connected' : 'disconnected',
        lastCheck: new Date().toISOString(),
        error: connected ? undefined : data.message || 'Not connected',
      };
    } catch (error) {
      console.error('[Whapi] Error checking connection:', error);
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
   * Validate interactive content limits
   */
  private validateInteractiveContent(
    content: InteractiveContent
  ): { code: WhatsAppErrorCode; message: string } | null {
    if (content.type === 'button' && 'buttons' in content.action) {
      const buttons = (content.action as ButtonAction).buttons;
      const quickReplyCount = buttons.filter(b => b.type === 'quick_reply').length;
      
      if (quickReplyCount > 3) {
        return {
          code: WhatsAppErrorCode.BUTTON_LIMIT_EXCEEDED,
          message: `Quick reply buttons cannot exceed 3 (got ${quickReplyCount})`,
        };
      }
    }
    
    if (content.type === 'list' && 'sections' in content.action) {
      const sections = (content.action as ListAction).sections;
      for (const section of sections) {
        if (section.rows.length > 10) {
          return {
            code: WhatsAppErrorCode.LIST_LIMIT_EXCEEDED,
            message: `List section cannot have more than 10 rows (got ${section.rows.length})`,
          };
        }
      }
    }
    
    if (content.type === 'carousel' && 'cards' in content.action) {
      const cards = (content.action as CarouselAction).cards;
      if (cards.length > 10) {
        return {
          code: WhatsAppErrorCode.CAROUSEL_LIMIT_EXCEEDED,
          message: `Carousel cannot have more than 10 cards (got ${cards.length})`,
        };
      }
    }
    
    return null;
  }

  
  /**
   * Format interactive payload for Whapi API
   */
  private formatInteractivePayload(
    phone: string,
    content: InteractiveContent
  ): Record<string, any> {
    const payload: Record<string, any> = {
      to: phone,
      type: content.type,
      body: content.body,
    };
    
    if (content.header) {
      payload.header = content.header;
    }
    
    if (content.footer) {
      payload.footer = content.footer;
    }
    
    // Format action based on type
    if (content.type === 'button' && 'buttons' in content.action) {
      payload.action = {
        buttons: (content.action as ButtonAction).buttons.map(btn => ({
          type: btn.type,
          title: btn.title,
          id: btn.id,
          ...(btn.payload && { payload: btn.payload }),
        })),
      };
    } else if (content.type === 'list' && 'sections' in content.action) {
      const listAction = content.action as ListAction;
      payload.action = {
        button: listAction.label,
        sections: listAction.sections.map(section => ({
          title: section.title,
          rows: section.rows.map(row => ({
            id: row.id,
            title: row.title,
            ...(row.description && { description: row.description }),
          })),
        })),
      };
    }
    
    return payload;
  }
  
  /**
   * Get media endpoint based on type
   */
  private getMediaEndpoint(mediaType: string): string {
    switch (mediaType) {
      case 'image':
        return '/messages/image';
      case 'document':
        return '/messages/document';
      case 'audio':
        return '/messages/audio';
      case 'video':
        return '/messages/video';
      default:
        return '/messages/image';
    }
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
    if (data?.error?.includes('not on WhatsApp') || data?.message?.includes('not registered')) {
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

export function createWhapiAdapter(): WhapiAdapter {
  const config: WhapiConfig = {
    apiUrl: Deno.env.get('WHAPI_API_URL') || 'https://gate.whapi.cloud',
    apiToken: Deno.env.get('WHAPI_TOKEN') || Deno.env.get('WHAPI_API_TOKEN') || '',
    channelId: Deno.env.get('WHAPI_CHANNEL_ID') || undefined,
  };
  
  if (!config.apiToken) {
    throw new Error('Whapi API configuration missing. Check WHAPI_TOKEN or WHAPI_API_TOKEN');
  }
  
  return new WhapiAdapter(config);
}
