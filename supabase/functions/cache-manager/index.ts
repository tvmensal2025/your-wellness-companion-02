import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CacheRequest {
  action: 'get' | 'set' | 'invalidate' | 'stats';
  query_hash?: string;
  query_type?: string;
  query_input?: string;
  response_text?: string;
  model_used?: string;
  tokens_used?: number;
  ttl_hours?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CacheRequest = await req.json();
    const { action } = body;

    switch (action) {
      case 'get': {
        if (!body.query_hash) {
          return new Response(
            JSON.stringify({ error: 'query_hash is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('ai_response_cache')
          .select('*')
          .eq('query_hash', body.query_hash)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          return new Response(
            JSON.stringify({ hit: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update hit count
        await supabase
          .from('ai_response_cache')
          .update({ 
            hit_count: (data.hit_count || 0) + 1,
            last_hit_at: new Date().toISOString()
          })
          .eq('id', data.id);

        return new Response(
          JSON.stringify({ 
            hit: true, 
            response: data.response_text,
            model_used: data.model_used,
            tokens_saved: data.tokens_used
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'set': {
        if (!body.query_hash || !body.query_type || !body.query_input || !body.response_text) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const ttlHours = body.ttl_hours || 24;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + ttlHours);

        const { data, error } = await supabase
          .from('ai_response_cache')
          .upsert({
            query_hash: body.query_hash,
            query_type: body.query_type,
            query_input: body.query_input,
            response_text: body.response_text,
            model_used: body.model_used,
            tokens_used: body.tokens_used || 0,
            ttl_hours: ttlHours,
            expires_at: expiresAt.toISOString()
          }, { onConflict: 'query_hash' })
          .select()
          .single();

        if (error) {
          console.error('Cache set error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to cache response' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, cached_id: data.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'invalidate': {
        let query = supabase.from('ai_response_cache').delete();
        
        if (body.query_hash) {
          query = query.eq('query_hash', body.query_hash);
        } else if (body.query_type) {
          query = query.eq('query_type', body.query_type);
        } else {
          // Invalidate expired only
          query = query.lt('expires_at', new Date().toISOString());
        }

        const { error, count } = await query;

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to invalidate cache' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, invalidated_count: count }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'stats': {
        const { data: totalData } = await supabase
          .from('ai_response_cache')
          .select('*', { count: 'exact', head: true });

        const { data: hitData } = await supabase
          .from('ai_response_cache')
          .select('hit_count, tokens_used')
          .gt('hit_count', 0);

        const { data: typeStats } = await supabase
          .from('ai_response_cache')
          .select('query_type');

        const totalHits = hitData?.reduce((acc, row) => acc + (row.hit_count || 0), 0) || 0;
        const totalTokensSaved = hitData?.reduce((acc, row) => acc + ((row.hit_count || 0) * (row.tokens_used || 0)), 0) || 0;
        
        const typeCount: Record<string, number> = {};
        typeStats?.forEach(row => {
          typeCount[row.query_type] = (typeCount[row.query_type] || 0) + 1;
        });

        return new Response(
          JSON.stringify({
            total_cached: totalData?.length || 0,
            total_hits: totalHits,
            total_tokens_saved: totalTokensSaved,
            estimated_cost_saved: (totalTokensSaved / 1000) * 0.002, // Approximate GPT-4 cost
            cache_by_type: typeCount
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Cache manager error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
