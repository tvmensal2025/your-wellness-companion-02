// =====================================================
// EDGE FUNCTION: enqueue-analysis
// Arquitetura Assíncrona - Enfileiramento Rápido
// Tempo de resposta: ~200ms
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request
    const { imageUrl, userId, jobType, userContext, mealType } = await req.json();

    // Validação rápida
    if (!imageUrl || !userId) {
      return new Response(
        JSON.stringify({ error: 'imageUrl e userId são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!jobType || !['food_image', 'medical_exam', 'body_composition'].includes(jobType)) {
      return new Response(
        JSON.stringify({ error: 'jobType inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📥 Enfileirando job: ${jobType} para usuário ${userId}`);

    // Verificar cache primeiro (opcional - para otimização futura)
    const cacheKey = `${jobType}:${imageUrl}`;
    const { data: cachedResult } = await supabase
      .from('analysis_cache')
      .select('result')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedResult) {
      console.log('✅ Cache hit! Retornando resultado cacheado');
      return new Response(
        JSON.stringify({
          success: true,
          cached: true,
          result: cachedResult.result,
          message: 'Resultado encontrado no cache'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar job na tabela analysis_jobs
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .insert({
        user_id: userId,
        job_type: jobType,
        input_data: {
          imageUrl,
          userContext,
          mealType,
          timestamp: new Date().toISOString()
        },
        status: 'queued',
        priority: 5, // Prioridade padrão
        estimated_duration_seconds: jobType === 'food_image' ? 10 : 15
      })
      .select()
      .single();

    if (jobError) {
      console.error('❌ Erro ao criar job:', jobError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar job', details: jobError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Job criado: ${job.id}`);

    // Enfileirar job usando RPC
    const { error: queueError } = await supabase.rpc('enqueue_job', {
      p_job_id: job.id,
      p_priority: 5,
      p_scheduled_at: new Date().toISOString()
    });

    if (queueError) {
      console.error('❌ Erro ao enfileirar job:', queueError);
      // Tentar deletar o job criado
      await supabase.from('analysis_jobs').delete().eq('id', job.id);
      return new Response(
        JSON.stringify({ error: 'Erro ao enfileirar job', details: queueError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Job enfileirado: ${job.id}`);

    // Retornar resposta imediata (202 Accepted)
    return new Response(
      JSON.stringify({
        success: true,
        job_id: job.id,
        status: 'queued',
        message: jobType === 'food_image' 
          ? 'Analisando sua foto... Você receberá uma notificação em breve! 📸✨'
          : 'Processando seu exame... Aguarde alguns instantes! 🔬✨',
        estimated_time: `${job.estimated_duration_seconds} segundos`
      }),
      { 
        status: 202, // Accepted
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: 'Erro interno', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
