// ============================================
// WhatsApp Rate Limiter
// Prevents anti-ban by enforcing message delays and limits
// ============================================

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  RateLimitConfig,
  RateLimitResult,
  WhatsAppErrorCode,
} from './types.ts';

// ============================================
// Default Configuration
// ============================================

const DEFAULT_CONFIG: RateLimitConfig = {
  minDelayMs: 1200,           // 1.2 seconds between messages
  maxMessagesPerHour: 200,    // 200 messages per hour
  maxMessagesPerDay: 1000,    // 1000 messages per day
};

// ============================================
// Rate Limiter Class
// ============================================

export class RateLimiter {
  private supabase: SupabaseClient;
  private config: RateLimitConfig;
  
  constructor(supabaseUrl: string, supabaseKey: string, config?: Partial<RateLimitConfig>) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  
  /**
   * Check if a message can be sent based on rate limits
   */
  async checkLimit(phone: string, userId?: string): Promise<RateLimitResult> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get current tracking data
    const { data: tracking, error } = await this.supabase
      .from('whatsapp_rate_limit_tracking')
      .select('*')
      .eq('phone', phone)
      .eq('tracking_date', today)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('[RateLimiter] Error fetching tracking:', error);
    }
    
    // If no tracking exists, allow the message
    if (!tracking) {
      return {
        allowed: true,
        queued: false,
        currentCount: { lastMinute: 0, lastHour: 0, today: 0 },
      };
    }
    
    // Check minimum delay between messages
    if (tracking.last_message_at) {
      const lastMessageTime = new Date(tracking.last_message_at).getTime();
      const timeSinceLastMessage = now.getTime() - lastMessageTime;
      
      if (timeSinceLastMessage < this.config.minDelayMs) {
        const waitTime = this.config.minDelayMs - timeSinceLastMessage;
        return {
          allowed: false,
          queued: true,
          estimatedWaitMs: waitTime,
          reason: `Minimum delay not met. Wait ${Math.ceil(waitTime / 1000)}s`,
          currentCount: {
            lastMinute: tracking.messages_last_minute || 0,
            lastHour: tracking.messages_last_hour || 0,
            today: tracking.messages_today || 0,
          },
        };
      }
    }
    
    // Check hourly limit
    if (tracking.messages_last_hour >= this.config.maxMessagesPerHour) {
      return {
        allowed: false,
        queued: true,
        estimatedWaitMs: 60 * 60 * 1000, // 1 hour
        reason: `Hourly limit reached (${this.config.maxMessagesPerHour}/hour)`,
        currentCount: {
          lastMinute: tracking.messages_last_minute || 0,
          lastHour: tracking.messages_last_hour || 0,
          today: tracking.messages_today || 0,
        },
      };
    }
    
    // Check daily limit
    if (tracking.messages_today >= this.config.maxMessagesPerDay) {
      return {
        allowed: false,
        queued: false,
        reason: `Daily limit reached (${this.config.maxMessagesPerDay}/day)`,
        currentCount: {
          lastMinute: tracking.messages_last_minute || 0,
          lastHour: tracking.messages_last_hour || 0,
          today: tracking.messages_today || 0,
        },
      };
    }
    
    return {
      allowed: true,
      queued: false,
      currentCount: {
        lastMinute: tracking.messages_last_minute || 0,
        lastHour: tracking.messages_last_hour || 0,
        today: tracking.messages_today || 0,
      },
    };
  }

  
  /**
   * Record that a message was sent
   */
  async recordSent(phone: string, userId?: string): Promise<void> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Upsert tracking record
    const { error } = await this.supabase
      .from('whatsapp_rate_limit_tracking')
      .upsert({
        phone,
        user_id: userId || null,
        tracking_date: today,
        messages_last_minute: 1,
        messages_last_hour: 1,
        messages_today: 1,
        last_message_at: now.toISOString(),
        updated_at: now.toISOString(),
      }, {
        onConflict: 'phone,tracking_date',
      });
    
    if (error) {
      console.error('[RateLimiter] Error recording sent:', error);
      
      // Try to increment existing record
      await this.supabase.rpc('increment_whatsapp_rate_limit', {
        p_phone: phone,
        p_user_id: userId || null,
      });
    }
  }
  
  /**
   * Get queue position for a phone number
   */
  async getQueuePosition(phone: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('whatsapp_message_queue')
      .select('id')
      .eq('phone', phone)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    if (error || !data) {
      return 0;
    }
    
    return data.length;
  }
  
  /**
   * Add message to queue
   */
  async queueMessage(
    phone: string,
    payload: any,
    userId?: string,
    priority: number = 5
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('whatsapp_message_queue')
      .insert({
        phone,
        user_id: userId || null,
        payload,
        priority,
        status: 'pending',
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('[RateLimiter] Error queueing message:', error);
      throw error;
    }
    
    return data.id;
  }
  
  /**
   * Get next message from queue
   */
  async getNextFromQueue(): Promise<{
    id: string;
    phone: string;
    payload: any;
    userId?: string;
  } | null> {
    const { data, error } = await this.supabase
      .from('whatsapp_message_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Mark as processing
    await this.supabase
      .from('whatsapp_message_queue')
      .update({ status: 'processing', processed_at: new Date().toISOString() })
      .eq('id', data.id);
    
    return {
      id: data.id,
      phone: data.phone,
      payload: data.payload,
      userId: data.user_id,
    };
  }

  
  /**
   * Mark queue item as completed
   */
  async markQueueCompleted(queueId: string, success: boolean): Promise<void> {
    await this.supabase
      .from('whatsapp_message_queue')
      .update({
        status: success ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', queueId);
  }
  
  /**
   * Wait for rate limit delay
   */
  async waitForDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.config.minDelayMs));
  }
}

// ============================================
// Factory Function
// ============================================

export function createRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return new RateLimiter(supabaseUrl, supabaseKey, config);
}
