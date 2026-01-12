// ============================================
// WhatsApp Adapter Layer
// Central routing layer for WhatsApp message sending
// Includes retry logic with exponential backoff
// ============================================

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  WhatsAppProvider,
  ProviderConfig,
  SendMessagePayload,
  SendResult,
  MessageLogEntry,
  WhatsAppErrorCode,
  createWhatsAppError,
  InteractiveContent,
  TextContent,
  MediaContent,
} from './types.ts';
import { formatPhoneNumber } from './phone-formatter.ts';

// ============================================
// Retry Configuration
// ============================================

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors: WhatsAppErrorCode[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000, // 1 second
  maxDelayMs: 8000,  // 8 seconds max
  retryableErrors: [
    WhatsAppErrorCode.RATE_LIMITED,
    WhatsAppErrorCode.PROVIDER_UNAVAILABLE,
    WhatsAppErrorCode.NETWORK_ERROR,
  ],
};

// ============================================
// Retry Helper Functions
// ============================================

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
  
  // Add jitter (±25%)
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  
  // Cap at max delay
  return Math.min(exponentialDelay + jitter, config.maxDelayMs);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(errorCode: WhatsAppErrorCode | undefined, config: RetryConfig): boolean {
  if (!errorCode) return false;
  return config.retryableErrors.includes(errorCode);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Adapter Layer Class
// ============================================

export class WhatsAppAdapterLayer {
  private supabase: SupabaseClient;
  private evolutionAdapter: any; // Will be injected
  private whapiAdapter: any; // Will be injected
  private cachedConfig: ProviderConfig | null = null;
  private configCacheTime: number = 0;
  private readonly CONFIG_CACHE_TTL = 30000; // 30 seconds
  private retryConfig: RetryConfig;
  
  constructor(supabaseUrl: string, supabaseKey: string, retryConfig?: Partial<RetryConfig>) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }
  
  /**
   * Set the Evolution adapter instance
   */
  setEvolutionAdapter(adapter: any): void {
    this.evolutionAdapter = adapter;
  }
  
  /**
   * Set the Whapi adapter instance
   */
  setWhapiAdapter(adapter: any): void {
    this.whapiAdapter = adapter;
  }
  
  /**
   * Get the currently active provider from database
   */
  async getActiveProvider(): Promise<WhatsAppProvider> {
    const config = await this.getProviderConfig();
    return config.activeProvider;
  }
  
  /**
   * Get full provider configuration with caching
   */
  async getProviderConfig(): Promise<ProviderConfig> {
    const now = Date.now();
    
    // Return cached config if still valid
    if (this.cachedConfig && (now - this.configCacheTime) < this.CONFIG_CACHE_TTL) {
      return this.cachedConfig;
    }
    
    const { data, error } = await this.supabase
      .from('whatsapp_provider_config')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();
    
    if (error || !data) {
      console.error('[WhatsApp] Error fetching provider config:', error);
      // Return default config
      return {
        activeProvider: 'evolution',
        evolutionEnabled: true,
        whapiEnabled: false,
      };
    }
    
    this.cachedConfig = {
      activeProvider: data.active_provider as WhatsAppProvider,
      evolutionEnabled: data.evolution_enabled,
      whapiEnabled: data.whapi_enabled,
      evolutionApiUrl: data.evolution_api_url,
      evolutionInstance: data.evolution_instance,
      evolutionHealthStatus: data.evolution_health_status,
      whapiApiUrl: data.whapi_api_url,
      whapiHealthStatus: data.whapi_health_status,
    };
    this.configCacheTime = now;
    
    return this.cachedConfig;
  }
  
  /**
   * Invalidate the config cache (call after toggle)
   */
  invalidateConfigCache(): void {
    this.cachedConfig = null;
    this.configCacheTime = 0;
  }
  
  /**
   * Main entry point for sending messages
   * Includes retry logic with exponential backoff
   */
  async sendMessage(payload: SendMessagePayload): Promise<SendResult> {
    const startTime = Date.now();
    
    // Validate and format phone number
    const formattedPhone = formatPhoneNumber(payload.phone);
    if (!formattedPhone) {
      return {
        success: false,
        provider: 'evolution', // Default for error
        error: 'Invalid phone number format',
        errorCode: WhatsAppErrorCode.INVALID_PHONE_FORMAT,
      };
    }
    
    // Get active provider
    const provider = await this.getActiveProvider();
    
    console.log(`[WhatsApp] Sending ${payload.messageType} to ${formattedPhone} via ${provider}`);
    
    // Create log entry
    const logEntry: MessageLogEntry = {
      userId: payload.userId,
      phone: formattedPhone,
      provider,
      messageType: payload.messageType,
      templateKey: payload.templateKey,
      status: 'pending',
    };
    
    // Log the attempt
    const logId = await this.logMessage(logEntry);
    
    // Attempt with retries
    let lastResult: SendResult | null = null;
    let retryCount = 0;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        // Route to appropriate adapter
        const result = await this.routeToAdapter(provider, {
          ...payload,
          phone: formattedPhone,
        });
        
        lastResult = result;
        
        if (result.success) {
          // Success - update log and return
          await this.updateMessageLog(logId, {
            status: 'sent',
            providerMessageId: result.messageId,
            retryCount,
          });
          
          await this.recordMessageSent(formattedPhone, payload.userId, provider, true);
          
          const duration = Date.now() - startTime;
          console.log(`[WhatsApp] Message sent in ${duration}ms (${retryCount} retries)`);
          
          return { ...result, logId };
        }
        
        // Check if error is retryable
        if (!isRetryableError(result.errorCode, this.retryConfig)) {
          console.log(`[WhatsApp] Non-retryable error: ${result.errorCode}`);
          break;
        }
        
        // Check if we have more retries
        if (attempt < this.retryConfig.maxRetries) {
          retryCount++;
          const delay = calculateBackoffDelay(attempt, this.retryConfig);
          console.log(`[WhatsApp] Retry ${retryCount}/${this.retryConfig.maxRetries} in ${delay}ms`);
          await sleep(delay);
        }
        
      } catch (error) {
        console.error(`[WhatsApp] Error on attempt ${attempt + 1}:`, error);
        
        lastResult = {
          success: false,
          provider,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorCode: WhatsAppErrorCode.UNKNOWN_ERROR,
        };
        
        // Check if we should retry
        if (attempt < this.retryConfig.maxRetries) {
          retryCount++;
          const delay = calculateBackoffDelay(attempt, this.retryConfig);
          console.log(`[WhatsApp] Retry ${retryCount}/${this.retryConfig.maxRetries} after error in ${delay}ms`);
          await sleep(delay);
        }
      }
    }
    
    // All retries exhausted - try fallback strategies
    const fallbackResult = await this.tryFallbackStrategies(
      payload,
      formattedPhone,
      provider,
      lastResult
    );
    
    if (fallbackResult) {
      await this.updateMessageLog(logId, {
        status: fallbackResult.success ? 'sent' : 'failed',
        providerMessageId: fallbackResult.messageId,
        errorMessage: fallbackResult.error,
        errorCode: fallbackResult.errorCode,
        retryCount,
      });
      
      await this.recordMessageSent(formattedPhone, payload.userId, provider, fallbackResult.success);
      
      return { ...fallbackResult, logId };
    }
    
    // Final failure
    await this.updateMessageLog(logId, {
      status: 'failed',
      errorMessage: lastResult?.error || 'All retries exhausted',
      errorCode: lastResult?.errorCode || WhatsAppErrorCode.UNKNOWN_ERROR,
      retryCount,
    });
    
    await this.recordMessageSent(formattedPhone, payload.userId, provider, false);
    
    const duration = Date.now() - startTime;
    console.log(`[WhatsApp] Message failed after ${duration}ms and ${retryCount} retries`);
    
    return {
      success: false,
      provider,
      logId,
      error: lastResult?.error || 'All retries exhausted',
      errorCode: lastResult?.errorCode || WhatsAppErrorCode.UNKNOWN_ERROR,
    };
  }
  
  /**
   * Try fallback strategies when primary send fails
   */
  private async tryFallbackStrategies(
    payload: SendMessagePayload,
    phone: string,
    provider: WhatsAppProvider,
    lastResult: SendResult | null
  ): Promise<SendResult | null> {
    console.log('[WhatsApp] Trying fallback strategies...');
    
    // Strategy 1: Interactive fails → retry as plain text
    if (payload.messageType === 'interactive' && lastResult?.errorCode) {
      console.log('[WhatsApp] Fallback: Converting interactive to text');
      try {
        const textContent = this.convertInteractiveToText(payload.content as InteractiveContent);
        const adapter = provider === 'evolution' ? this.evolutionAdapter : this.whapiAdapter;
        
        if (adapter) {
          const result = await adapter.sendText(phone, textContent, { userId: payload.userId });
          if (result.success) {
            console.log('[WhatsApp] Fallback to text succeeded');
            return result;
          }
        }
      } catch (error) {
        console.error('[WhatsApp] Fallback to text failed:', error);
      }
    }
    
    // Strategy 2: Media fails → send text with link
    if (['image', 'document', 'audio', 'video'].includes(payload.messageType)) {
      console.log('[WhatsApp] Fallback: Converting media to text with link');
      try {
        const mediaContent = payload.content as MediaContent;
        const textWithLink = this.convertMediaToTextWithLink(mediaContent, payload.messageType);
        const adapter = provider === 'evolution' ? this.evolutionAdapter : this.whapiAdapter;
        
        if (adapter) {
          const result = await adapter.sendText(phone, textWithLink, { userId: payload.userId });
          if (result.success) {
            console.log('[WhatsApp] Fallback to text with link succeeded');
            return result;
          }
        }
      } catch (error) {
        console.error('[WhatsApp] Fallback to text with link failed:', error);
      }
    }
    
    // Strategy 3: Queue for later (if rate limited)
    if (lastResult?.errorCode === WhatsAppErrorCode.RATE_LIMITED) {
      console.log('[WhatsApp] Fallback: Queueing message for later');
      await this.queueMessageForLater(payload, phone, provider);
      return {
        success: false,
        provider,
        error: 'Message queued for later delivery',
        errorCode: WhatsAppErrorCode.RATE_LIMITED,
        queued: true,
      } as SendResult;
    }
    
    return null;
  }
  
  /**
   * Convert media content to text with link
   */
  private convertMediaToTextWithLink(content: MediaContent, mediaType: string): string {
    const typeLabels: Record<string, string> = {
      image: '🖼️ Imagem',
      document: '📄 Documento',
      audio: '🎵 Áudio',
      video: '🎬 Vídeo',
    };
    
    let text = `${typeLabels[mediaType] || '📎 Arquivo'}`;
    
    if (content.caption) {
      text += `\n\n${content.caption}`;
    }
    
    if (content.url) {
      text += `\n\n🔗 Link: ${content.url}`;
    }
    
    return text;
  }
  
  /**
   * Queue message for later delivery
   */
  private async queueMessageForLater(
    payload: SendMessagePayload,
    phone: string,
    provider: WhatsAppProvider
  ): Promise<void> {
    try {
      await this.supabase
        .from('whatsapp_message_queue')
        .insert({
          user_id: payload.userId,
          phone,
          provider,
          message_type: payload.messageType,
          message_content: payload.content,
          template_key: payload.templateKey,
          scheduled_for: new Date(Date.now() + 60000).toISOString(), // 1 minute later
          status: 'pending',
        });
      console.log('[WhatsApp] Message queued successfully');
    } catch (error) {
      console.error('[WhatsApp] Failed to queue message:', error);
    }
  }
  
  /**
   * Route message to the appropriate adapter based on provider
   */
  private async routeToAdapter(
    provider: WhatsAppProvider,
    payload: SendMessagePayload
  ): Promise<SendResult> {
    const adapter = provider === 'evolution' ? this.evolutionAdapter : this.whapiAdapter;
    
    if (!adapter) {
      throw createWhatsAppError(
        WhatsAppErrorCode.PROVIDER_UNAVAILABLE,
        `${provider} adapter not configured`,
        provider
      );
    }
    
    switch (payload.messageType) {
      case 'text':
        return adapter.sendText(
          payload.phone,
          (payload.content as TextContent).body,
          { userId: payload.userId }
        );
      
      case 'image':
      case 'document':
      case 'audio':
      case 'video':
        return adapter.sendMedia(
          payload.phone,
          payload.content as MediaContent,
          { userId: payload.userId, mediaType: payload.messageType }
        );
      
      case 'interactive':
        // If Evolution is active, convert interactive to text fallback
        if (provider === 'evolution') {
          const textFallback = this.convertInteractiveToText(payload.content as InteractiveContent);
          return adapter.sendText(payload.phone, textFallback, { userId: payload.userId });
        }
        return adapter.sendInteractive(
          payload.phone,
          payload.content as InteractiveContent,
          { userId: payload.userId }
        );
      
      default:
        throw createWhatsAppError(
          WhatsAppErrorCode.INVALID_MESSAGE_TYPE,
          `Unsupported message type: ${payload.messageType}`,
          provider
        );
    }
  }
  
  /**
   * Convert interactive content to text fallback for Evolution
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
   * Log message to database
   */
  private async logMessage(entry: MessageLogEntry): Promise<string> {
    const { data, error } = await this.supabase
      .from('whatsapp_message_logs')
      .insert({
        user_id: entry.userId,
        phone: entry.phone,
        provider: entry.provider,
        message_type: entry.messageType,
        message_content: entry.messageContent,
        interactive_type: entry.interactiveType,
        template_key: entry.templateKey,
        status: entry.status,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('[WhatsApp] Error logging message:', error);
      return '';
    }
    
    return data?.id || '';
  }
  
  /**
   * Update message log entry
   */
  private async updateMessageLog(
    logId: string,
    updates: Partial<{
      status: string;
      providerMessageId: string;
      providerResponse: any;
      errorMessage: string;
      errorCode: string;
      retryCount: number;
    }>
  ): Promise<void> {
    if (!logId) return;
    
    const updateData: any = {};
    
    if (updates.status) {
      updateData.status = updates.status;
      if (updates.status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (updates.status === 'failed') {
        updateData.failed_at = new Date().toISOString();
      }
    }
    if (updates.providerMessageId) updateData.provider_message_id = updates.providerMessageId;
    if (updates.providerResponse) updateData.provider_response = updates.providerResponse;
    if (updates.errorMessage) updateData.error_message = updates.errorMessage;
    if (updates.errorCode) updateData.error_code = updates.errorCode;
    if (updates.retryCount !== undefined) updateData.retry_count = updates.retryCount;
    
    const { error } = await this.supabase
      .from('whatsapp_message_logs')
      .update(updateData)
      .eq('id', logId);
    
    if (error) {
      console.error('[WhatsApp] Error updating message log:', error);
    }
  }
  
  /**
   * Record message sent for stats and rate limiting
   */
  private async recordMessageSent(
    phone: string,
    userId: string | undefined,
    provider: WhatsAppProvider,
    success: boolean
  ): Promise<void> {
    try {
      await this.supabase.rpc('record_whatsapp_message_sent', {
        p_phone: phone,
        p_user_id: userId || null,
        p_provider: provider,
        p_success: success,
      });
    } catch (error) {
      console.error('[WhatsApp] Error recording message stats:', error);
    }
  }
}

// ============================================
// Factory function
// ============================================

export function createWhatsAppAdapterLayer(): WhatsAppAdapterLayer {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  return new WhatsAppAdapterLayer(supabaseUrl, supabaseKey);
}
