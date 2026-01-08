import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// 🔥 USAR LOVABLE AI GATEWAY
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash";

// ============ CONTEXTO COMPACTO DO PACIENTE ============

interface PatientContext {
  nome: string;
  idade: number | null;
  genero: string | null;
  peso_atual: number | null;
  peso_perdido: number | null;
  meta_peso: number | null;
  imc: number | null;
  gordura_corporal: number | null;
  tendencia_peso: string;
  agua_hoje: number;
  calorias_hoje: number;
  calorias_media_7d: number | null;
  exercicio_hoje: number;
  sono_horas: number | null;
  sono_qualidade: number | null;
  estresse_nivel: number | null;
  energia_nivel: number | null;
  humor_nivel: number | null;
  sintomas_recentes: string[];
  medicamentos: string[];
  doencas_cronicas: string[];
  alergias: string[];
  historico_familiar: string[];
  maior_desafio: string | null;
  objetivo_principal: string | null;
  completude_dados: number;
}

async function getPatientContext(supabase: any, userId: string): Promise<PatientContext> {
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // Buscar dados em paralelo
  const [
    profileRes, 
    weightsRes, 
    trackingRes, 
    anamnesisRes, 
    symptomsRes, 
    foodRes,
    nutritionRes
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, age, gender, current_weight").eq("user_id", userId).maybeSingle(),
    supabase.from("weight_measurements").select("peso_kg, imc, gordura_corporal_percent, measurement_date").eq("user_id", userId).order("measurement_date", { ascending: false }).limit(5),
    supabase.from("advanced_daily_tracking").select("*").eq("user_id", userId).eq("tracking_date", today).maybeSingle(),
    supabase.from("user_anamnesis").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("advanced_daily_tracking").select("pain_location, pain_level, symptoms, tracking_date").eq("user_id", userId).not("pain_location", "is", null).order("tracking_date", { ascending: false }).limit(10),
    supabase.from("food_history").select("total_calories").eq("user_id", userId).eq("meal_date", today),
    supabase.from("food_history").select("total_calories, meal_date").eq("user_id", userId).gte("meal_date", sevenDaysAgo.toISOString().split('T')[0]),
  ]);

  const profile = profileRes.data;
  const weights = weightsRes.data || [];
  const tracking = trackingRes.data;
  const anamnesis = anamnesisRes.data;
  const symptoms = symptomsRes.data || [];
  const foods = foodRes.data || [];
  const nutrition7d = nutritionRes.data || [];

  const peso_atual = weights[0]?.peso_kg || profile?.current_weight || null;
  const peso_anterior = weights[1]?.peso_kg || null;
  const peso_perdido = peso_atual && peso_anterior && peso_anterior > peso_atual 
    ? Number((peso_anterior - peso_atual).toFixed(1)) 
    : null;

  // Calcular média de calorias dos últimos 7 dias
  const uniqueDays = [...new Set(nutrition7d.map(f => f.meal_date))];
  const dailyCalories = uniqueDays.map(day => 
    nutrition7d.filter(f => f.meal_date === day).reduce((sum, f) => sum + (Number(f.total_calories) || 0), 0)
  );
  const calorias_media_7d = dailyCalories.length > 0 
    ? Math.round(dailyCalories.reduce((a, b) => a + b, 0) / dailyCalories.length) 
    : null;

  // Tendência de peso
  let tendencia_peso = 'indeterminado';
  if (weights.length >= 2) {
    const diff = weights[0].peso_kg - weights[1].peso_kg;
    tendencia_peso = diff > 0.3 ? 'aumentando' : diff < -0.3 ? 'diminuindo' : 'estável';
  }

  // Histórico familiar
  const historico_familiar: string[] = [];
  if (anamnesis?.family_obesity_history) historico_familiar.push('obesidade');
  if (anamnesis?.family_diabetes_history) historico_familiar.push('diabetes');
  if (anamnesis?.family_heart_disease_history) historico_familiar.push('cardiopatias');
  if (anamnesis?.family_thyroid_problems_history) historico_familiar.push('tireoide');
  if (anamnesis?.family_depression_anxiety_history) historico_familiar.push('depressão/ansiedade');

  // Calcular completude
  let completude = 0;
  if (profile?.full_name) completude += 10;
  if (peso_atual) completude += 15;
  if (anamnesis) completude += 25;
  if (weights.length > 0) completude += 15;
  if (nutrition7d.length > 0) completude += 15;
  if (tracking) completude += 10;
  if (symptoms.length > 0) completude += 10;

  return {
    nome: profile?.full_name?.split(' ')[0] || "Paciente",
    idade: profile?.age || null,
    genero: profile?.gender || null,
    peso_atual,
    peso_perdido,
    meta_peso: anamnesis?.ideal_weight_goal || null,
    imc: weights[0]?.imc || null,
    gordura_corporal: weights[0]?.gordura_corporal_percent || null,
    tendencia_peso,
    agua_hoje: tracking?.water_ml || 0,
    calorias_hoje: foods.reduce((sum, f) => sum + (Number(f.total_calories) || 0), 0),
    calorias_media_7d,
    exercicio_hoje: tracking?.exercise_duration_minutes || 0,
    sono_horas: tracking?.sleep_hours || null,
    sono_qualidade: tracking?.sleep_quality || null,
    estresse_nivel: tracking?.stress_level || anamnesis?.daily_stress_level || null,
    energia_nivel: tracking?.energy_level || anamnesis?.daily_energy_level || null,
    humor_nivel: tracking?.mood_rating || null,
    sintomas_recentes: symptoms.map(s => `${s.pain_location} (${s.pain_level || '?'}/10)`).slice(0, 5),
    medicamentos: (anamnesis?.current_medications || []).map((m: any) => m.name || m).slice(0, 10),
    doencas_cronicas: (anamnesis?.chronic_diseases || []).slice(0, 10),
    alergias: (anamnesis?.allergies || []).slice(0, 10),
    historico_familiar,
    maior_desafio: anamnesis?.biggest_weight_loss_challenge || null,
    objetivo_principal: anamnesis?.main_treatment_goals || null,
    completude_dados: completude,
  };
}

// ============ MEMÓRIA DE CONVERSA ============

async function getConversationHistory(supabase: any, userId: string): Promise<Array<{role: string, content: string}>> {
  const { data } = await supabase
    .from("chat_conversation_history")
    .select("role, content")
    .eq("user_id", userId)
    .eq("session_id", "dr_vital")
    .order("created_at", { ascending: true })
    .limit(10);
  
  return (data || []).map(m => ({ role: m.role, content: m.content }));
}

async function saveMessage(supabase: any, userId: string, role: string, content: string) {
  await supabase.from("chat_conversation_history").insert({
    user_id: userId,
    session_id: "dr_vital",
    role,
    content,
    personality: "drvital",
  });
}

// ============ SYSTEM PROMPT OTIMIZADO ============

function buildDrVitalPrompt(ctx: PatientContext): string {
  return `Você é o Dr. Vital, médico virtual do Instituto dos Sonhos.

PERSONALIDADE:
- Profissional mas acolhedor
- Respostas OBJETIVAS e práticas (3-5 linhas máximo)
- Usa termos simples, não jargão médico excessivo
- NUNCA diz "vou verificar" - você JÁ TEM os dados
- Sempre recomenda consultar profissional quando necessário

DADOS DO PACIENTE (USE ESTES DADOS DIRETAMENTE):
- Nome: ${ctx.nome}
${ctx.idade ? `- Idade: ${ctx.idade} anos` : ''}
${ctx.genero ? `- Gênero: ${ctx.genero}` : ''}
- Peso atual: ${ctx.peso_atual ? ctx.peso_atual + 'kg' : 'não registrado'}
${ctx.peso_perdido ? `- Já perdeu: ${ctx.peso_perdido}kg` : ''}
${ctx.meta_peso ? `- Meta: ${ctx.meta_peso}kg` : ''}
${ctx.imc ? `- IMC: ${ctx.imc.toFixed(1)}` : ''}
${ctx.gordura_corporal ? `- Gordura corporal: ${ctx.gordura_corporal}%` : ''}
- Tendência de peso: ${ctx.tendencia_peso}

DADOS DO DIA:
- Água: ${ctx.agua_hoje}ml
- Calorias: ${ctx.calorias_hoje}kcal
${ctx.calorias_media_7d ? `- Média 7 dias: ${ctx.calorias_media_7d}kcal` : ''}
- Exercício: ${ctx.exercicio_hoje}min
${ctx.sono_horas ? `- Sono: ${ctx.sono_horas}h (qualidade: ${ctx.sono_qualidade || '?'}/10)` : ''}
${ctx.estresse_nivel ? `- Estresse: ${ctx.estresse_nivel}/10` : ''}
${ctx.energia_nivel ? `- Energia: ${ctx.energia_nivel}/10` : ''}
${ctx.humor_nivel ? `- Humor: ${ctx.humor_nivel}/10` : ''}

HISTÓRICO DE SAÚDE:
${ctx.sintomas_recentes.length > 0 ? `- Sintomas recentes: ${ctx.sintomas_recentes.join(', ')}` : '- Sem sintomas recentes registrados'}
${ctx.medicamentos.length > 0 ? `- Medicamentos: ${ctx.medicamentos.join(', ')}` : ''}
${ctx.doencas_cronicas.length > 0 ? `- Doenças crônicas: ${ctx.doencas_cronicas.join(', ')}` : ''}
${ctx.alergias.length > 0 ? `- Alergias: ${ctx.alergias.join(', ')}` : ''}
${ctx.historico_familiar.length > 0 ? `- Histórico familiar: ${ctx.historico_familiar.join(', ')}` : ''}
${ctx.maior_desafio ? `- Maior desafio: ${ctx.maior_desafio}` : ''}
${ctx.objetivo_principal ? `- Objetivo: ${ctx.objetivo_principal}` : ''}

COMPLETUDE DOS DADOS: ${ctx.completude_dados}%
${ctx.completude_dados < 60 ? '⚠️ DADOS INSUFICIENTES para análise completa. Oriente a preencher mais dados.' : ''}

REGRAS:
1. Responda SEMPRE baseado nos dados acima
2. Identifique padrões e faça conexões entre os dados
3. Dê recomendações práticas e seguras
4. Se faltar dado importante, pergunte
5. Assine sempre: _Dr. Vital 🩺_
6. Use o nome "${ctx.nome}" frequentemente

IMPORTANTE: Responda em português brasileiro, tom profissional mas acessível.`;
}

// ============ HANDLER PRINCIPAL ============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID é obrigatório');
    }

    if (!message) {
      throw new Error('Message é obrigatória');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`🩺 Dr. Vital - Mensagem de ${userId}: ${message}`);

    // Buscar contexto e histórico em paralelo
    const [ctx, conversationHistory] = await Promise.all([
      getPatientContext(supabase, userId),
      getConversationHistory(supabase, userId),
    ]);

    console.log(`📊 Contexto: ${ctx.nome}, completude: ${ctx.completude_dados}%`);

    // Salvar mensagem do usuário
    await saveMessage(supabase, userId, "user", message);

    // Construir mensagens para IA
    const messages = [
      { role: "system", content: buildDrVitalPrompt(ctx) },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // 🔥 Chamar Lovable AI Gateway
    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[Dr. Vital] Erro na IA:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          response: `${ctx.nome}, estou com muitos pacientes no momento. Pode tentar novamente em alguns minutos? 🩺\n\n_Dr. Vital 🩺_`,
          error: "rate_limited" 
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          response: `${ctx.nome}, preciso de uma pausa técnica. Tente novamente mais tarde.\n\n_Dr. Vital 🩺_`,
          error: "payment_required" 
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || '';

    if (!responseText) {
      const fallbackText = `${ctx.nome}, não consegui processar sua pergunta no momento. Baseado nos seus dados, posso dizer que:\n\n` +
        `- Peso atual: ${ctx.peso_atual ? ctx.peso_atual + 'kg' : 'não registrado'}\n` +
        `- Completude dos dados: ${ctx.completude_dados}%\n\n` +
        `Tente reformular sua pergunta.\n\n_Dr. Vital 🩺_`;

      return new Response(JSON.stringify({
        response: fallbackText,
        dataCompleteness: ctx.completude_dados,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Salvar resposta
    await saveMessage(supabase, userId, "assistant", responseText);

    // Salvar na memória do Dr. Vital (histórico permanente)
    try {
      const { data: existingMemory } = await supabase
        .from('dr_vital_memory')
        .select('*')
        .eq('memory_key', `user_${userId}_analyses`)
        .maybeSingle();
      
      let analyses = existingMemory?.memory_value || [];
      if (!Array.isArray(analyses)) analyses = [];
      
      analyses.push({
        question: message,
        response: responseText,
        timestamp: new Date().toISOString(),
        dataCompleteness: ctx.completude_dados,
      });
      
      if (analyses.length > 50) analyses = analyses.slice(-50);
      
      await supabase.from('dr_vital_memory').upsert({
        memory_key: `user_${userId}_analyses`,
        memory_value: analyses,
        updated_at: new Date().toISOString()
      }, { onConflict: 'memory_key' });
    } catch (memoryError) {
      console.error('Erro ao salvar memória:', memoryError);
    }

    return new Response(JSON.stringify({ 
      response: responseText,
      dataCompleteness: ctx.completude_dados,
      dataAvailable: {
        peso: !!ctx.peso_atual,
        imc: !!ctx.imc,
        sintomas: ctx.sintomas_recentes.length,
        medicamentos: ctx.medicamentos.length,
        anamnese: ctx.completude_dados >= 25,
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Erro no Dr. Vital:', error);
    const err = error as Error;
    return new Response(JSON.stringify({ 
      error: err.message,
      response: 'Desculpe, tive um problema técnico. Tente novamente em alguns instantes.\n\n_Dr. Vital 🩺_'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
