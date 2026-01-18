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

    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: jobId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get job status using correct column names
    const { data: job, error } = await supabase
      .from('analysis_jobs')
      .select('id, user_id, job_type, input_data, status, result, error_message, priority, attempts, max_attempts, created_at, started_at, completed_at, updated_at, estimated_duration_seconds, actual_duration_seconds, worker_id')
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
      type: job.job_type,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      estimatedDuration: job.estimated_duration_seconds
    };

    if (job.status === 'completed') {
      response.result = job.result;
      response.processingTime = job.actual_duration_seconds;
      response.completedAt = job.completed_at;
    } else if (job.status === 'failed') {
      response.error = job.error_message;
      response.attempts = job.attempts;
      response.maxAttempts = job.max_attempts;
    } else if (job.status === 'processing') {
      response.startedAt = job.started_at;
      response.workerId = job.worker_id;
      response.attempts = job.attempts;
    } else if (job.status === 'pending') {
      response.priority = job.priority;
      response.attempts = job.attempts;
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
