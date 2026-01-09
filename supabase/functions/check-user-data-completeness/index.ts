import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/utils/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let userId: string | null = null;
    
    // Suportar tanto GET quanto POST
    if (req.method === 'GET') {
      const url = new URL(req.url);
      userId = url.searchParams.get('userId');
    } else if (req.method === 'POST') {
      try {
        const body = await req.json();
        userId = body.userId;
      } catch (e) {
        // Se não conseguir parsear JSON, tentar query params
        const url = new URL(req.url);
        userId = url.searchParams.get('userId');
      }
    }

    if (!userId) {
      throw new Error('userId é obrigatório (via JSON body em POST ou query param em GET)');
    }

    console.log('🔍 Verificando completude dos dados para usuário:', userId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ OTIMIZAÇÃO: Queries paralelas (5-7x mais rápido)
    const [
      anamnesisResult,
      physicalDataResult,
      weightResult,
      nutritionResult,
      exerciseResult,
      goalsResult,
      missionsResult,
      moodResult,
      profileResult
    ] = await Promise.all([
      supabase.from('user_anamnesis').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('user_physical_data').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('weight_measurements').select('id').eq('user_id', userId).limit(1).maybeSingle(),
      supabase.from('nutrition_tracking').select('id').eq('user_id', userId).limit(1).maybeSingle(),
      supabase.from('exercise_sessions').select('id').eq('user_id', userId).limit(1).maybeSingle(),
      supabase.from('user_goals').select('id').eq('user_id', userId).limit(1).maybeSingle(),
      supabase.from('daily_mission_sessions').select('id').eq('user_id', userId).limit(1).maybeSingle(),
      supabase.from('mood_monitoring').select('id').eq('user_id', userId).limit(1).maybeSingle(),
      supabase.from('profiles').select('id').eq('user_id', userId).maybeSingle()
    ]);

    const completionStatus = {
      anamnesis: !!anamnesisResult.data,
      physicalData: !!physicalDataResult.data,
      weight: !!weightResult.data,
      nutrition: !!nutritionResult.data,
      exercise: !!exerciseResult.data,
      goals: !!goalsResult.data,
      dailyMission: !!missionsResult.data,
      mood: !!moodResult.data,
      profile: !!profileResult.data
    };

    const totalFields = Object.keys(completionStatus).length;
    const completedFields = Object.values(completionStatus).filter(Boolean).length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    const minimumDataMet = completionStatus.profile && completionStatus.physicalData;
    const canReceiveAnalysis = completionPercentage >= 70;
    const hasRequiredData = completionStatus.anamnesis && completionStatus.physicalData && completionStatus.profile;

    // Calcular dados faltantes
    const missingData: string[] = [];
    if (!completionStatus.anamnesis) missingData.push('Anamnese');
    if (!completionStatus.physicalData) missingData.push('Dados Físicos');
    if (!completionStatus.weight) missingData.push('Peso');
    if (!completionStatus.nutrition) missingData.push('Nutrição');
    if (!completionStatus.exercise) missingData.push('Exercícios');
    if (!completionStatus.goals) missingData.push('Metas');
    if (!completionStatus.dailyMission) missingData.push('Missão Diária');
    if (!completionStatus.mood) missingData.push('Humor');
    if (!completionStatus.profile) missingData.push('Perfil');

    console.log('📊 Status de completude:', {
      completionStatus,
      completionPercentage,
      minimumDataMet,
      canReceiveAnalysis,
      hasRequiredData
    });

    return new Response(
      JSON.stringify({
        success: true,
        completionStatus,
        completionPercentage,
        minimumDataMet,
        canReceiveAnalysis,
        hasRequiredData,
        missingData,
        totalFields,
        completedFields
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    console.error('❌ Erro ao verificar completude dos dados:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        error: 'Falha ao verificar completude dos dados', 
        details: message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
