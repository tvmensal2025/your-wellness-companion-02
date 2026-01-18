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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || '' } }
    });

    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: jobId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get job status (RLS will ensure user can only see their own jobs)
    const { data: job, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Job not found or access denied' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    // Format response
    const response: any = {
      jobId: job.id,
      status: job.status,
      type: job.type,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    };

    if (job.status === 'completed') {
      response.result = job.result;
      response.processingTime = job.processing_time_ms;
    } else if (job.status === 'failed') {
      response.error = job.error;
      response.attempts = job.attempts;
    } else if (job.status === 'processing') {
      response.startedAt = job.started_at;
      response.workerId = job.worker_id;
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
