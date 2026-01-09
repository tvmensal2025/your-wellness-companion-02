import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupResult {
  table: string;
  deleted_count: number;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: CleanupResult[] = [];
    const startTime = Date.now();

    // 1. Clean expired AI cache
    console.log('Cleaning expired AI cache...');
    const { data: cacheCleanup, error: cacheError } = await supabase.rpc('cleanup_expired_cache');
    results.push({
      table: 'ai_response_cache',
      deleted_count: cacheCleanup || 0,
      error: cacheError?.message
    });

    // 2. Clean old image cache (older than 30 days)
    console.log('Cleaning old image cache...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { error: imageCacheError, count: imageCacheCount } = await supabase
      .from('image_cache')
      .delete()
      .lt('accessed_at', thirtyDaysAgo.toISOString())
      .lt('access_count', 5); // Keep frequently accessed images

    results.push({
      table: 'image_cache',
      deleted_count: imageCacheCount || 0,
      error: imageCacheError?.message
    });

    // 3. Clean old chat history (keep last 100 per user/session)
    console.log('Cleaning old chat history...');
    const { error: chatError } = await supabase.rpc('cleanup_old_chat_history');
    results.push({
      table: 'chat_conversation_history',
      deleted_count: 0, // Function doesn't return count
      error: chatError?.message
    });

    // 4. Clean old system metrics (older than 90 days)
    console.log('Cleaning old system metrics...');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { error: metricsError, count: metricsCount } = await supabase
      .from('system_metrics')
      .delete()
      .lt('recorded_at', ninetyDaysAgo.toISOString());

    results.push({
      table: 'system_metrics',
      deleted_count: metricsCount || 0,
      error: metricsError?.message
    });

    // 5. Clean old whatsapp logs (older than 60 days)
    console.log('Cleaning old WhatsApp logs...');
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { error: whatsappError, count: whatsappCount } = await supabase
      .from('whatsapp_evolution_logs')
      .delete()
      .lt('created_at', sixtyDaysAgo.toISOString());

    results.push({
      table: 'whatsapp_evolution_logs',
      deleted_count: whatsappCount || 0,
      error: whatsappError?.message
    });

    // 6. Clean expired rate limits (older than 7 days and reset)
    console.log('Cleaning old rate limits...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { error: rateLimitError, count: rateLimitCount } = await supabase
      .from('rate_limits')
      .delete()
      .lt('updated_at', sevenDaysAgo.toISOString())
      .eq('is_blocked', false);

    results.push({
      table: 'rate_limits',
      deleted_count: rateLimitCount || 0,
      error: rateLimitError?.message
    });

    // 7. Clean old AI usage logs (older than 90 days)
    console.log('Cleaning old AI usage logs...');
    const { error: aiLogsError, count: aiLogsCount } = await supabase
      .from('ai_usage_logs')
      .delete()
      .lt('created_at', ninetyDaysAgo.toISOString());

    results.push({
      table: 'ai_usage_logs',
      deleted_count: aiLogsCount || 0,
      error: aiLogsError?.message
    });

    // 8. Clean old AI system logs (older than 30 days)
    console.log('Cleaning old AI system logs...');
    const { error: sysLogsError, count: sysLogsCount } = await supabase
      .from('ai_system_logs')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    results.push({
      table: 'ai_system_logs',
      deleted_count: sysLogsCount || 0,
      error: sysLogsError?.message
    });

    const executionTime = Date.now() - startTime;
    const totalDeleted = results.reduce((sum, r) => sum + r.deleted_count, 0);
    const errors = results.filter(r => r.error);

    // Record cleanup metric
    await supabase.from('system_metrics').insert({
      metric_type: 'cleanup',
      metric_name: 'scheduled_cleanup',
      metric_value: totalDeleted,
      metadata: {
        execution_time_ms: executionTime,
        results,
        errors_count: errors.length
      }
    });

    console.log(`Cleanup completed in ${executionTime}ms. Total deleted: ${totalDeleted}`);

    return new Response(
      JSON.stringify({
        success: true,
        execution_time_ms: executionTime,
        total_deleted: totalDeleted,
        results,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cleanup scheduler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
