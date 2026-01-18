import { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export class CacheManager {
  private supabase: SupabaseClient;
  private enabled: boolean;
  private ttlHours: number;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.enabled = process.env.ENABLE_CACHE !== 'false';
    this.ttlHours = parseInt(process.env.CACHE_TTL_HOURS || '24');
  }

  generateKey(type: string, input: any): string {
    const normalized = JSON.stringify(input, Object.keys(input).sort());
    const hash = crypto.createHash('sha256').update(normalized).digest('hex');
    return `${type}:${hash}`;
  }

  async get(type: string, input: any): Promise<any | null> {
    if (!this.enabled) return null;

    try {
      const cacheKey = this.generateKey(type, input);
      
      const { data, error } = await this.supabase
        .from('analysis_cache')
        .select('response, hit_count')
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) return null;

      // Update hit count
      await this.supabase
        .from('analysis_cache')
        .update({
          hit_count: data.hit_count + 1,
          last_hit_at: new Date().toISOString()
        })
        .eq('cache_key', cacheKey);

      return data.response;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(type: string, input: any, response: any): Promise<void> {
    if (!this.enabled) return;

    try {
      const cacheKey = this.generateKey(type, input);
      const expiresAt = new Date(Date.now() + this.ttlHours * 60 * 60 * 1000);

      await this.supabase
        .from('analysis_cache')
        .upsert({
          cache_key: cacheKey,
          type,
          response,
          expires_at: expiresAt.toISOString(),
          hit_count: 0
        }, {
          onConflict: 'cache_key'
        });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.supabase.rpc('cleanup_expired_cache');
      console.log('✅ Cache cleanup completed');
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}
