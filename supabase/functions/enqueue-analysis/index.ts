import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, input, priority = 5, useCache = true } = await req.json();

    // Validate input
    if (!type || !input) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate type
    const validTypes = ['sofia_image', 'sofia_text', 'medical_exam', 'unified_assistant', 'meal_plan', 'whatsapp_message'];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache if enabled
    if (useCache) {
      const cacheKey = generateCacheKey(type, input);
      const { data: cached } = await supabase
        .from('analysis_cache')
        .select('response, hit_count')
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cached) {
        // Update hit count
        await supabase
          .from('analysis_cache')
          .update({ 
            hit_count: cached.hit_count + 1,
            last_hit_at: new Date().toISOString()
          })
          .eq('cache_key', cacheKey);

        console.log(`✅ Cache hit for ${type}`);
        
        return new Response(
          JSON.stringify({
            jobId: null,
            status: 'completed',
            result: cached.response,
            cached: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create job
    const { data: job, error } = await supabase
      .from('analysis_jobs')
      .insert({
        type,
        input,
        priority,
        user_id: input.userId || 'anonymous'
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Job enqueued: ${job.id} (type: ${type})`);

    return new Response(
      JSON.stringify({
        jobId: job.id,
        status: 'pending',
        estimatedTime: getEstimatedTime(type),
        message: 'Análise em andamento...'
      }),
      { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateCacheKey(type: string, input: any): string {
  const normalized = JSON.stringify(input, Object.keys(input).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  return crypto.subtle.digest('SHA-256', data)
    .then(hash => {
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `${type}:${hashHex}`;
    });
}

function getEstimatedTime(type: string): number {
  const estimates: Record<string, number> = {
    'sofia_image': 10,
    'sofia_text': 5,
    'medical_exam': 15,
    'unified_assistant': 8,
    'meal_plan': 12,
    'whatsapp_message': 5
  };
  return estimates[type] || 10;
}
