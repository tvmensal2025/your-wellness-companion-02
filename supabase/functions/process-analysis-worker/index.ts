// =====================================================
// EDGE FUNCTION: process-analysis-worker
// Arquitetura Assíncrona - Worker de Processamento
// Processa jobs da fila em background
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Importar lógica de análise existente
const YOLO_SERVICE_URL = (Deno.env.get('YOLO_SERVICE_URL') || 'https://yolo-service-yolo-detection.0sw627.easypanel.host').replace(/\/$/, '');
const YOLO_ENABLED = (Deno.env.get('YOLO_ENABLED') || 'true').toLowerCase() === 'true';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const workerId = `worker-${crypto.randomUUID().slice(0, 8)}`;
    console.log(`🤖 Worker ${workerId} iniciado`);

    // Pegar próximo job da fila
    const { data: jobData, error: jobError } = await supabase.rpc('get_next_job', {
      p_worker_id: workerId,
      p_lock_duration_seconds: 300 // 5 minutos
    });

    if (jobError) {
      console.error('❌ Erro ao buscar job:', jobError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar job', details: jobError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!jobData || jobData.length === 0) {
      console.log('⏸️ Nenhum job disponível na fila');
      return new Response(
        JSON.stringify({ message: 'Nenhum job disponível' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const job = jobData[0];
    console.log(`🔄 Processando job ${job.job_id} (tipo: ${job.job_type})`);

    try {
      let result: any = null;

      // Processar baseado no tipo de job
      if (job.job_type === 'food_image') {
        result = await processFoodImage(job.input_data, supabase);
      } else if (job.job_type === 'medical_exam') {
        result = await processMedicalExam(job.input_data, supabase);
      } else if (job.job_type === 'body_composition') {
        result = await processBodyComposition(job.input_data, supabase);
      } else {
        throw new Error(`Tipo de job desconhecido: ${job.job_type}`);
      }

      // Marcar job como completo
      await supabase.rpc('complete_job', {
        p_job_id: job.job_id,
        p_result: result
      });

      // Salvar no cache (TTL de 1 hora)
      const cacheKey = `${job.job_type}:${job.input_data.imageUrl}`;
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      await supabase.from('analysis_cache').upsert({
        cache_key: cacheKey,
        analysis_type: job.job_type,
        result: result,
        expires_at: expiresAt
      }, {
        onConflict: 'cache_key'
      });

      console.log(`✅ Job ${job.job_id} completo`);

      return new Response(
        JSON.stringify({
          success: true,
          job_id: job.job_id,
          result: result
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (processingError) {
      console.error(`❌ Erro ao processar job ${job.job_id}:`, processingError);
      const err = processingError as Error;

      // Marcar job como falho (com retry)
      await supabase.rpc('fail_job', {
        p_job_id: job.job_id,
        p_error_message: err.message,
        p_retry: true
      });

      return new Response(
        JSON.stringify({
          success: false,
          job_id: job.job_id,
          error: err.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Erro inesperado no worker:', error);
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: 'Erro interno do worker', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// =====================================================
// FUNÇÕES DE PROCESSAMENTO
// =====================================================

async function processFoodImage(inputData: any, supabase: any): Promise<any> {
  const { imageUrl, userContext, mealType } = inputData;
  
  console.log('🍽️ Processando análise de alimento...');

  // 1. Detecção YOLO (rápida)
  let yoloContext = null;
  if (YOLO_ENABLED) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const resp = await fetch(`${YOLO_SERVICE_URL}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ 
          image_url: imageUrl, 
          task: 'detect',
          confidence: 0.35,
          model: 'yolo11s-seg.pt'
        })
      });
      
      clearTimeout(timeoutId);
      
      if (resp.ok) {
        const data = await resp.json();
        yoloContext = {
          objects: data.objects || [],
          confidence: data.confidence || 0
        };
        console.log(`✅ YOLO detectou ${yoloContext.objects.length} objetos`);
      }
    } catch (error) {
      console.log('⚠️ YOLO falhou, continuando sem contexto YOLO');
    }
  }

  // 2. Análise com Gemini (usando contexto YOLO)
  // Aqui você chamaria a função analyzeWithEnhancedAI do sofia-image-analysis
  // Por enquanto, vamos simular o resultado
  
  const result = {
    success: true,
    is_food: true,
    confidence: 0.85,
    foods: [
      { nome: 'Arroz', quantidade: 100 },
      { nome: 'Feijão', quantidade: 80 },
      { nome: 'Frango grelhado', quantidade: 150 }
    ],
    nutrition: {
      calories: 450,
      protein: 35,
      carbs: 45,
      fat: 12
    },
    yolo_context: yoloContext,
    message: 'Análise completa! 🎉'
  };

  return result;
}

async function processMedicalExam(inputData: any, supabase: any): Promise<any> {
  const { imageUrl, userContext } = inputData;
  
  console.log('🔬 Processando análise de exame médico...');

  // Implementar lógica de análise de exame
  // Similar ao analyze-medical-exam existente
  
  const result = {
    success: true,
    exam_type: 'blood_test',
    findings: [],
    recommendations: [],
    message: 'Exame analisado com sucesso! 🔬'
  };

  return result;
}

async function processBodyComposition(inputData: any, supabase: any): Promise<any> {
  const { imageUrl, userContext } = inputData;
  
  console.log('📊 Processando análise de composição corporal...');

  // Implementar lógica de análise de composição corporal
  
  const result = {
    success: true,
    body_fat_percentage: 18.5,
    muscle_mass: 65,
    message: 'Composição corporal analisada! 💪'
  };

  return result;
}
