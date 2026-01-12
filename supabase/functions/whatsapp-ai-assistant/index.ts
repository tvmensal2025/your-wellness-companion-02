import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔥 USAR LOVABLE AI GATEWAY - OpenAI como principal (melhor compreensão de voz)
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash-lite"; // Otimizado: -40% latência, -40% custo

// ============ SISTEMA DE TOOLS ============

const TOOLS = [
  {
    type: "function",
    function: {
      name: "register_weight",
      description: "Registra o peso do usuário em kg. Use quando o usuário mencionar seu peso atual.",
      parameters: {
        type: "object",
        properties: {
          weight_kg: { type: "number", description: "Peso em kg" },
          waist_cm: { type: "number", description: "Medida da cintura em cm (opcional)" },
        },
        required: ["weight_kg"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_water",
      description: "Registra consumo de água. Use quando usuário mencionar que bebeu água.",
      parameters: {
        type: "object",
        properties: {
          amount_ml: { type: "number", description: "Quantidade em ml" },
        },
        required: ["amount_ml"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_mood",
      description: "Registra o humor/bem-estar do usuário. Use quando usuário falar sobre como está se sentindo emocionalmente.",
      parameters: {
        type: "object",
        properties: {
          mood_rating: { type: "number", description: "Nota de 1-10 para o humor" },
          energy_level: { type: "number", description: "Nível de energia 1-10" },
          stress_level: { type: "number", description: "Nível de estresse 1-10" },
          notes: { type: "string", description: "Observações" },
        },
        required: ["mood_rating"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_sleep",
      description: "Registra informações de sono. Use quando usuário falar sobre sono/dormir.",
      parameters: {
        type: "object",
        properties: {
          hours: { type: "number", description: "Horas dormidas" },
          quality: { type: "number", description: "Qualidade 1-10" },
        },
        required: ["hours"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_exercise",
      description: "Registra atividade física. Use quando usuário mencionar exercício/treino.",
      parameters: {
        type: "object",
        properties: {
          exercise_type: { type: "string", description: "Tipo de exercício" },
          duration_minutes: { type: "number", description: "Duração em minutos" },
          intensity: { type: "string", enum: ["leve", "moderado", "intenso"] },
        },
        required: ["exercise_type", "duration_minutes"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_user_status",
      description: "Busca status completo do usuário: peso, metas, progresso do dia.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_food_history",
      description: "Busca histórico de refeições do usuário. Use para saber o que o usuário comeu.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "Data: 'hoje', 'ontem', 'semana' ou YYYY-MM-DD" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_meal_from_description",
      description: "Registra uma refeição a partir de descrição textual.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "Descrição do que comeu" },
          meal_type: { type: "string", description: "Tipo: cafe_da_manha, almoco, jantar, lanche" },
        },
        required: ["description"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_pain_symptom",
      description: "Registra dor ou sintoma do usuário. Use quando mencionar DOR, mal-estar, enjoo, tontura, etc.",
      parameters: {
        type: "object",
        properties: {
          pain_level: { type: "number", description: "Intensidade da dor 1-10" },
          pain_location: { type: "string", description: "Local: cabeça, costas, estômago, etc." },
          symptoms: { type: "array", items: { type: "string" }, description: "Lista de sintomas" },
          notes: { type: "string", description: "Contexto adicional" },
        },
        required: ["pain_location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "manage_medical_exams",
      description: "Gerencia exames médicos pendentes. Use quando usuário perguntar sobre status de exames, quiser cancelar análises, ou ver exames pendentes.",
      parameters: {
        type: "object",
        properties: {
          action: { 
            type: "string", 
            enum: ["status", "cancel", "list", "cleanup"],
            description: "Ação: status (ver progresso), cancel (cancelar análise), list (listar pendentes), cleanup (limpar antigos)" 
          },
        },
        required: ["action"],
      },
    },
  },
];

// ============ EXECUÇÃO DE TOOLS ============

async function executeTool(userId: string, toolName: string, args: any): Promise<string> {
  console.log(`[Sofia] Executando tool: ${toolName}`, args);
  const today = new Date().toISOString().split('T')[0];

  switch (toolName) {
    case "register_weight": {
      await supabase.from("weight_measurements").insert({
        user_id: userId,
        peso_kg: args.weight_kg,
        measurement_date: today,
      });
      return `✅ Peso registrado: ${args.weight_kg}kg`;
    }

    case "register_water": {
      const { data: current } = await supabase
        .from("advanced_daily_tracking")
        .select("water_ml")
        .eq("user_id", userId)
        .eq("tracking_date", today)
        .maybeSingle();
      
      const newTotal = (current?.water_ml || 0) + args.amount_ml;
      await supabase.from("advanced_daily_tracking").upsert({
        user_id: userId,
        tracking_date: today,
        water_ml: newTotal,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,tracking_date" });
      
      return `💧 Água registrada: +${args.amount_ml}ml (Total: ${newTotal}ml)`;
    }

    case "register_mood": {
      await supabase.from("advanced_daily_tracking").upsert({
        user_id: userId,
        tracking_date: today,
        mood_rating: args.mood_rating,
        energy_level: args.energy_level || null,
        stress_level: args.stress_level || null,
        notes: args.notes || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,tracking_date" });
      
      const emoji = args.mood_rating >= 7 ? "😊" : args.mood_rating >= 5 ? "😐" : "😔";
      return `${emoji} Humor registrado: ${args.mood_rating}/10`;
    }

    case "register_sleep": {
      await supabase.from("advanced_daily_tracking").upsert({
        user_id: userId,
        tracking_date: today,
        sleep_hours: args.hours,
        sleep_quality: args.quality || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,tracking_date" });
      
      return `😴 Sono registrado: ${args.hours}h`;
    }

    case "register_exercise": {
      await supabase.from("advanced_daily_tracking").upsert({
        user_id: userId,
        tracking_date: today,
        exercise_type: args.exercise_type,
        exercise_duration_minutes: args.duration_minutes,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,tracking_date" });
      
      return `🏃 Exercício registrado: ${args.exercise_type} por ${args.duration_minutes}min`;
    }

    case "get_user_status": {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, current_weight")
        .eq("user_id", userId)
        .maybeSingle();
      
      const { data: lastWeight } = await supabase
        .from("weight_measurements")
        .select("peso_kg, measurement_date")
        .eq("user_id", userId)
        .order("measurement_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: firstWeight } = await supabase
        .from("weight_measurements")
        .select("peso_kg")
        .eq("user_id", userId)
        .order("measurement_date", { ascending: true })
        .limit(1)
        .maybeSingle();
      
      const { data: tracking } = await supabase
        .from("advanced_daily_tracking")
        .select("*")
        .eq("user_id", userId)
        .eq("tracking_date", today)
        .maybeSingle();

      const { data: foodHistory } = await supabase
        .from("food_history")
        .select("total_calories")
        .eq("user_id", userId)
        .eq("meal_date", today)
        .eq("user_confirmed", true);

      const caloriesConsumed = foodHistory?.reduce((sum, item) => sum + (Number(item.total_calories) || 0), 0) || 0;
      const peso_atual = lastWeight?.peso_kg || profile?.current_weight || null;
      const peso_perdido = (firstWeight && lastWeight && firstWeight.peso_kg > lastWeight.peso_kg)
        ? Number((firstWeight.peso_kg - lastWeight.peso_kg).toFixed(1))
        : null;
      
      return JSON.stringify({
        nome: profile?.full_name?.split(' ')[0] || "Usuário",
        peso_atual,
        peso_perdido,
        hoje: {
          agua_ml: tracking?.water_ml || 0,
          calorias: caloriesConsumed,
          exercicio_min: tracking?.exercise_duration_minutes || 0,
          humor: tracking?.mood_rating,
          sono_horas: tracking?.sleep_hours,
        },
      });
    }

    case "get_food_history": {
      let targetDate = today;
      if (args.date === 'ontem') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        targetDate = yesterday.toISOString().split('T')[0];
      }

      const { data } = await supabase
        .from("food_history")
        .select("*")
        .eq("user_id", userId)
        .eq("meal_date", targetDate)
        .order("meal_time", { ascending: true });

      if (!data?.length) {
        return `Não encontrei refeições para ${targetDate === today ? 'hoje' : targetDate}.`;
      }

      const meals = data.map(meal => {
        const foods = (meal.food_items as any[]) || [];
        const foodNames = foods.map((f: any) => f.nome || f.name).join(", ");
        return `• ${formatMealType(meal.meal_type)}: ${foodNames} (~${Math.round(Number(meal.total_calories) || 0)} kcal)`;
      }).join("\n");

      const totalCalories = data.reduce((sum, m) => sum + (Number(m.total_calories) || 0), 0);
      return `🍽️ Refeições de ${targetDate === today ? 'hoje' : targetDate}:\n${meals}\n\n📊 Total: ${Math.round(totalCalories)} kcal`;
    }

    case "register_meal_from_description": {
      const { data: analysis } = await supabase.functions.invoke("sofia-deterministic", {
        body: { user_input: args.description, user_id: userId, analysis_type: "text_extraction" },
      });

      if (!analysis) return "Não consegui identificar os alimentos.";

      const foods = analysis.detected_foods || analysis.foods || [];
      const totalCalories = analysis.nutrition_data?.total_kcal || 0;
      const mealType = args.meal_type || detectMealType();

      await supabase.from("food_history").insert({
        user_id: userId,
        meal_date: today,
        meal_time: new Date().toTimeString().split(" ")[0],
        meal_type: mealType,
        food_items: foods,
        total_calories: totalCalories,
        source: "whatsapp_ai",
        user_confirmed: true,
      });

      const foodsList = foods.map((f: any) => f.name || f.nome).join(", ");
      return `✅ Refeição registrada: ${foodsList} (~${Math.round(totalCalories)} kcal)`;
    }

    case "register_pain_symptom": {
      const now = new Date();
      await supabase.from("advanced_daily_tracking").upsert({
        user_id: userId,
        tracking_date: today,
        pain_level: args.pain_level || null,
        pain_location: args.pain_location,
        symptoms: args.symptoms || [],
        notes: `[${now.toTimeString().split(' ')[0]}] ${args.notes || 'Registrado via chat'}`,
        updated_at: now.toISOString(),
      }, { onConflict: "user_id,tracking_date" });
      
      return `🩺 Registrado: ${args.pain_location} (${args.pain_level || '?'}/10)`;
    }

    case "manage_medical_exams": {
      const { action } = args;
      
      // Buscar lotes pendentes
      const { data: batches } = await supabase
        .from("whatsapp_pending_medical")
        .select("id, status, images_count, created_at")
        .eq("user_id", userId)
        .eq("is_processed", false)
        .in("status", ["collecting", "awaiting_confirm", "processing", "stuck"])
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (action === "list" || action === "status") {
        if (!batches || batches.length === 0) {
          return "✅ Não há exames pendentes. Pode enviar novas fotos quando quiser!";
        }
        
        const formatStatus = (s: string) => {
          const map: Record<string, string> = {
            collecting: "📥 Coletando",
            awaiting_confirm: "⏳ Aguardando confirmação",
            processing: "🔄 Analisando",
            stuck: "⚠️ Travado",
          };
          return map[s] || s;
        };
        
        const list = batches.map((b: any, i: number) => 
          `${i+1}. ${b.images_count} foto(s) - ${formatStatus(b.status)}`
        ).join("\n");
        
        return `📋 *Exames Pendentes:*\n${list}\n\nDigite "cancelar exames" para limpar tudo.`;
      }
      
      if (action === "cancel" || action === "cleanup") {
        if (!batches || batches.length === 0) {
          return "✅ Não há exames para cancelar.";
        }
        
        await supabase
          .from("whatsapp_pending_medical")
          .update({ status: "cancelled", is_processed: true })
          .eq("user_id", userId)
          .eq("is_processed", false);
        
        return `❌ ${batches.length} análise(s) cancelada(s). Pode enviar novos exames quando quiser!`;
      }
      
      return "Ação não reconhecida.";
    }

    default:
      return "Função não reconhecida.";
  }
}

// ============ HELPERS ============

function detectMealType(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "cafe_da_manha";
  if (hour >= 10 && hour < 12) return "lanche_manha";
  if (hour >= 12 && hour < 15) return "almoco";
  if (hour >= 15 && hour < 18) return "lanche_tarde";
  if (hour >= 18 && hour < 21) return "jantar";
  return "ceia";
}

function formatMealType(mealType: string | null): string {
  const types: Record<string, string> = {
    cafe_da_manha: "☕ Café",
    lanche_manha: "🍎 Lanche",
    almoco: "🍽️ Almoço",
    lanche_tarde: "🥤 Lanche",
    jantar: "🌙 Jantar",
    ceia: "🌃 Ceia",
  };
  return types[mealType || ""] || mealType || "Refeição";
}

// ============ FALLBACK INTELIGENTE ============

/**
 * Gera resposta de fallback quando a IA não retorna conteúdo
 * Especialmente útil para saudações simples como "Boa noite", "Oi", etc.
 */
function generateSmartFallback(message: string, ctx: CompactContext, personality: string): string {
  const msgLower = message.toLowerCase().trim();
  const nome = ctx.nome;
  const signature = personality === 'drvital' ? '\n\n_Dr. Vital 🩺_' : '\n\n_Sofia 💚_';
  
  // Saudações - categoria mais comum de falha
  const saudacoes = [
    'oi', 'olá', 'ola', 'hey', 'hi', 'eai', 'e ai', 'e aí',
    'boa noite', 'boa tarde', 'bom dia', 'boa madrugada',
    'tudo bem', 'tudo bom', 'como vai', 'como você está',
    'bom feriado', 'feliz feriado', 'salve', 'fala'
  ];
  
  const isSaudacao = saudacoes.some(s => msgLower.includes(s));
  
  if (isSaudacao) {
    const hora = new Date().getHours();
    let saudacao = 'Olá';
    if (hora >= 5 && hora < 12) saudacao = 'Bom dia';
    else if (hora >= 12 && hora < 18) saudacao = 'Boa tarde';
    else saudacao = 'Boa noite';
    
    // Contexto do dia para resposta mais rica
    const aguaInfo = ctx.agua_hoje > 0 ? `\n💧 Água hoje: ${ctx.agua_hoje}ml` : '';
    const calInfo = ctx.calorias_hoje > 0 ? `\n🍽️ Calorias: ${Math.round(ctx.calorias_hoje)} kcal` : '';
    const statusDia = (aguaInfo || calInfo) ? `\n${aguaInfo}${calInfo}` : '';
    
    return `${saudacao}, ${nome}! 😊\n\n` +
      `Como posso te ajudar hoje?${statusDia}\n\n` +
      `📸 Envie foto da refeição\n` +
      `✍️ Ou me conta o que comeu${signature}`;
  }
  
  // Agradecimentos
  const agradecimentos = ['obrigado', 'obrigada', 'valeu', 'thanks', 'brigado', 'brigada'];
  if (agradecimentos.some(a => msgLower.includes(a))) {
    return `Por nada, ${nome}! 😊 Estou aqui sempre que precisar!${signature}`;
  }
  
  // Despedidas
  const despedidas = ['tchau', 'até mais', 'ate mais', 'bye', 'adeus', 'fui', 'até logo', 'ate logo'];
  if (despedidas.some(d => msgLower.includes(d))) {
    return `Até mais, ${nome}! 👋 Cuide-se bem e volte sempre!${signature}`;
  }
  
  // OK/Confirmações
  const confirmacoes = ['ok', 'certo', 'entendi', 'blz', 'beleza', 'show', 'top', 'massa'];
  if (confirmacoes.some(c => msgLower === c || msgLower.includes(c))) {
    return `Perfeito, ${nome}! 😊 Precisa de mais alguma coisa?${signature}`;
  }
  
  // Pedidos de ajuda
  const ajuda = ['ajuda', 'help', 'menu', 'comandos', 'o que você faz', 'como funciona'];
  if (ajuda.some(a => msgLower.includes(a))) {
    return `${nome}, posso te ajudar com:\n\n` +
      `📸 *Foto de refeição* → analiso calorias\n` +
      `🩺 *Foto de exame* → interpreto resultados\n` +
      `💬 *Descreva o que comeu* → registro pra você\n` +
      `⚖️ *Diga seu peso* → registro e acompanho\n` +
      `💧 *Registrar água* → ex: "bebi 500ml"\n` +
      `📊 *Como estou?* → resumo do dia${signature}`;
  }
  
  // Fallback genérico - resposta amigável que incentiva interação
  return `Oi ${nome}! 😊\n\n` +
    `Como posso te ajudar?\n\n` +
    `📸 Envie uma foto da refeição\n` +
    `✍️ Ou me conta o que comeu${signature}`;
}

// ============ CONTEXTO EXPANDIDO ============

interface CompactContext {
  nome: string;
  peso_atual: number | null;
  peso_perdido: number | null;
  meta_peso: number | null;
  agua_hoje: number;
  calorias_hoje: number;
  exercicio_hoje: number;
  humor_hoje: number | null;
  sono_ontem: number | null;
  sintomas_recentes: string[];
  medicamentos: string[];
  alergias: string[];
  maior_desafio: string | null;
  // Campos expandidos
  refeicoes_recentes: Array<{tipo: string, descricao: string, calorias: number}>;
  metas_macros: {calorias: number, proteina: number, agua: number} | null;
  exercicios_semana: {total_min: number, sessoes: number};
  humor_semana: {media: number | null, tendencia: string};
}

async function getCompactUserContext(userId: string): Promise<CompactContext> {
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  
  // Buscar dados em paralelo - expandido
  const [
    profileRes, 
    weightRes, 
    trackingRes, 
    anamnesisRes, 
    symptomsRes, 
    foodRes,
    recentMealsRes,
    nutritionalGoalsRes,
    exerciseHistoryRes,
    moodHistoryRes
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, current_weight").eq("user_id", userId).maybeSingle(),
    supabase.from("weight_measurements").select("peso_kg").eq("user_id", userId).order("measurement_date", { ascending: false }).limit(2),
    supabase.from("advanced_daily_tracking").select("*").eq("user_id", userId).eq("tracking_date", today).maybeSingle(),
    supabase.from("user_anamnesis").select("ideal_weight_goal, biggest_weight_loss_challenge, current_medications, allergies").eq("user_id", userId).maybeSingle(),
    supabase.from("advanced_daily_tracking").select("pain_location, symptoms").eq("user_id", userId).not("pain_location", "is", null).order("tracking_date", { ascending: false }).limit(5),
    supabase.from("food_history").select("total_calories").eq("user_id", userId).eq("meal_date", today),
    // Novas queries
    supabase.from("food_history").select("meal_type, food_items, total_calories").eq("user_id", userId).order("meal_date", { ascending: false }).order("meal_time", { ascending: false }).limit(3),
    supabase.from("nutritional_goals").select("target_calories, target_protein_g, target_water_ml").eq("user_id", userId).eq("status", "active").limit(1),
    supabase.from("advanced_daily_tracking").select("exercise_duration_minutes").eq("user_id", userId).gte("tracking_date", sevenDaysAgoStr).not("exercise_duration_minutes", "is", null),
    supabase.from("mood_monitoring").select("mood_level").eq("user_id", userId).gte("mood_date", sevenDaysAgoStr),
  ]);

  const profile = profileRes.data;
  const weights = weightRes.data || [];
  const tracking = trackingRes.data;
  const anamnesis = anamnesisRes.data;
  const symptoms = symptomsRes.data || [];
  const foods = foodRes.data || [];
  const recentMeals = recentMealsRes.data || [];
  const nutritionalGoals = nutritionalGoalsRes.data?.[0];
  const exerciseHistory = exerciseHistoryRes.data || [];
  const moodHistory = moodHistoryRes.data || [];

  const peso_atual = weights[0]?.peso_kg || profile?.current_weight || null;
  const peso_anterior = weights[1]?.peso_kg || null;
  const peso_perdido = peso_atual && peso_anterior && peso_anterior > peso_atual 
    ? Number((peso_anterior - peso_atual).toFixed(1)) 
    : null;

  // Processar refeições recentes
  const refeicoes_recentes = recentMeals.slice(0, 3).map((meal: any) => {
    const items = meal.food_items || [];
    const nomes = items.map((f: any) => f.nome || f.name || 'item').slice(0, 2).join(', ');
    return {
      tipo: formatMealType(meal.meal_type),
      descricao: nomes || 'não especificado',
      calorias: Math.round(Number(meal.total_calories) || 0),
    };
  });

  // Metas de macros
  const metas_macros = nutritionalGoals ? {
    calorias: nutritionalGoals.target_calories || 2000,
    proteina: nutritionalGoals.target_protein_g || 100,
    agua: nutritionalGoals.target_water_ml || 2000,
  } : null;

  // Exercícios da semana
  const totalExerciseMin = exerciseHistory.reduce((sum: number, e: any) => sum + (Number(e.exercise_duration_minutes) || 0), 0);
  const exercicios_semana = {
    total_min: totalExerciseMin,
    sessoes: exerciseHistory.length,
  };

  // Humor da semana
  const moodValues = moodHistory.map((m: any) => m.mood_level).filter(Boolean);
  const humor_semana = {
    media: moodValues.length > 0 ? Math.round(moodValues.reduce((a: number, b: number) => a + b, 0) / moodValues.length * 10) / 10 : null,
    tendencia: moodValues.length >= 2 
      ? (moodValues[0] > moodValues[moodValues.length - 1] ? 'melhorando' : 'piorando')
      : 'estável',
  };

  return {
    nome: profile?.full_name?.split(' ')[0] || "Usuário",
    peso_atual,
    peso_perdido,
    meta_peso: anamnesis?.ideal_weight_goal || null,
    agua_hoje: tracking?.water_ml || 0,
    calorias_hoje: foods.reduce((sum, f) => sum + (Number(f.total_calories) || 0), 0),
    exercicio_hoje: tracking?.exercise_duration_minutes || 0,
    humor_hoje: tracking?.mood_rating || null,
    sono_ontem: tracking?.sleep_hours || null,
    sintomas_recentes: symptoms.map(s => s.pain_location).filter(Boolean).slice(0, 3),
    medicamentos: (anamnesis?.current_medications || []).map((m: any) => m.name || m).slice(0, 5),
    alergias: (anamnesis?.allergies || []).slice(0, 5),
    maior_desafio: anamnesis?.biggest_weight_loss_challenge || null,
    // Novos campos
    refeicoes_recentes,
    metas_macros,
    exercicios_semana,
    humor_semana,
  };
}

// ============ MEMÓRIA DE CONVERSA ============

async function getConversationHistory(userId: string, sessionId: string): Promise<Array<{role: string, content: string}>> {
  const { data } = await supabase
    .from("chat_conversation_history")
    .select("role, content")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(10);
  
  return (data || []).map(m => ({ role: m.role, content: m.content }));
}

async function saveMessage(userId: string, sessionId: string, role: string, content: string, personality: string) {
  await supabase.from("chat_conversation_history").insert({
    user_id: userId,
    session_id: sessionId,
    role,
    content,
    personality,
  });
}

// ============ DETECÇÃO DE PERSONALIDADE (Sofia vs DrVital) ============

type Personality = 'sofia' | 'drvital';

function detectPersonality(message: string, ctx: CompactContext): Personality {
  const lowerMsg = message.toLowerCase();
  
  // Palavras-chave do Dr. Vital (saúde médica)
  const drVitalKeywords = [
    'exame', 'dor', 'remedio', 'remédio', 'medicamento', 'sintoma',
    'pressao', 'pressão', 'glicemia', 'colesterol', 'doenca', 'doença',
    'médico', 'medico', 'consulta', 'tratamento', 'dr', 'doutor', 'vital',
    'febre', 'infecção', 'infeccao', 'sangue', 'cirurgia', 'hospital',
    'receita médica', 'diagnostico', 'diagnóstico', 'vacina', 'alergia grave'
  ];
  
  // Palavras-chave da Sofia (nutrição/alimentação)
  const sofiaKeywords = [
    'comida', 'refeição', 'refeicao', 'almoco', 'almoço', 'jantar', 'cafe', 'café',
    'caloria', 'dieta', 'peso', 'emagrecer', 'nutricao', 'nutrição',
    'agua', 'água', 'sofia', 'receita', 'alimento', 'comer', 'comi',
    'fome', 'saciedade', 'proteína', 'proteina', 'carboidrato', 'gordura',
    'lanche', 'fruta', 'legume', 'verdura', 'vitamina'
  ];
  
  const drVitalScore = drVitalKeywords.filter(k => lowerMsg.includes(k)).length;
  const sofiaScore = sofiaKeywords.filter(k => lowerMsg.includes(k)).length;
  
  // Se mencionar sintomas recentes com keywords médicas, usar Dr. Vital
  if (ctx.sintomas_recentes.length > 0 && drVitalScore >= 2) {
    return 'drvital';
  }
  
  // Se tiver mais keywords médicas que nutricionais
  if (drVitalScore > sofiaScore && drVitalScore >= 2) {
    return 'drvital';
  }
  
  // Padrão: Sofia
  return 'sofia';
}

// ============ SYSTEM PROMPT POR PERSONALIDADE ============

function buildSystemPrompt(ctx: CompactContext, personality: Personality = 'sofia'): string {
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  // Construir seção de refeições
  let refeicoesTxt = '';
  if (ctx.refeicoes_recentes.length > 0) {
    refeicoesTxt = ctx.refeicoes_recentes
      .map(r => `  - ${r.tipo}: ${r.descricao} (~${r.calorias}kcal)`)
      .join('\n');
  }

  // Calcular progresso de metas
  let metasProgress = '';
  if (ctx.metas_macros) {
    const calPct = Math.round((ctx.calorias_hoje / ctx.metas_macros.calorias) * 100);
    const aguaPct = Math.round((ctx.agua_hoje / ctx.metas_macros.agua) * 100);
    metasProgress = `
PROGRESSO HOJE:
- Calorias: ${ctx.calorias_hoje}/${ctx.metas_macros.calorias}kcal (${calPct}%)
- Água: ${ctx.agua_hoje}/${ctx.metas_macros.agua}ml (${aguaPct}%)`;
  }

  // Dados comuns do usuário
  const dadosUsuario = `
═══════════════════════════════════════
USUÁRIO: ${ctx.nome}
═══════════════════════════════════════

PESO:
- Atual: ${ctx.peso_atual ? ctx.peso_atual + 'kg' : 'não registrado'}
${ctx.peso_perdido ? `- Já perdeu: ${ctx.peso_perdido}kg 💪` : ''}
${ctx.meta_peso ? `- Meta: ${ctx.meta_peso}kg` : ''}
${metasProgress}

HOJE:
- Água: ${ctx.agua_hoje}ml
- Calorias: ${ctx.calorias_hoje}kcal
- Exercício: ${ctx.exercicio_hoje}min
${ctx.humor_hoje ? `- Humor: ${ctx.humor_hoje}/10` : ''}
${ctx.sono_ontem ? `- Sono: ${ctx.sono_ontem}h` : ''}

${ctx.refeicoes_recentes.length > 0 ? `ÚLTIMAS REFEIÇÕES:
${refeicoesTxt}` : ''}

SEMANA:
- Exercícios: ${ctx.exercicios_semana.sessoes} treinos, ${ctx.exercicios_semana.total_min}min
- Humor médio: ${ctx.humor_semana.media || '?'}/10 (${ctx.humor_semana.tendencia})

SAÚDE:
${ctx.sintomas_recentes.length > 0 ? `- Sintomas: ${ctx.sintomas_recentes.join(', ')}` : ''}
${ctx.medicamentos.length > 0 ? `- Medicamentos: ${ctx.medicamentos.join(', ')}` : ''}
${ctx.alergias.length > 0 ? `- Alergias: ${ctx.alergias.join(', ')}` : ''}
${ctx.maior_desafio ? `- Maior desafio: ${ctx.maior_desafio}` : ''}`;

  // ===== DR. VITAL =====
  if (personality === 'drvital') {
    return `Você é o Dr. Vital, médico virtual e assistente pessoal de saúde do Instituto dos Sonhos.

🩺 SEU PAPEL:
- Você é o MÉDICO PESSOAL do usuário ${ctx.nome}
- Analisa exames laboratoriais e de imagem
- Explica resultados de forma clara e acessível
- Dá orientações preventivas de saúde
- Gerencia análises de exames pendentes

💬 PERSONALIDADE:
- Profissional mas acolhedor e empático
- Usa linguagem simples, evita jargão médico
- Respostas OBJETIVAS (3-5 linhas máximo)
- Usa emojis médicos com moderação 🩺💊🏥
- Fala com autoridade médica, mas acessível
- Sempre mostra empatia

📋 CAPACIDADES:
- Receber e analisar fotos de exames
- Explicar o que cada exame significa
- Comparar com valores de referência
- Dar orientações de saúde preventiva
- Gerenciar múltiplas análises pendentes (use manage_medical_exams)

${dadosUsuario}

═══════════════════════════════════════
REGRAS DO DR. VITAL:
1. Responda SEMPRE com base nos dados do paciente
2. Se identificar sintomas graves, ORIENTE buscar atendimento urgente
3. Use o nome "${ctx.nome}" para criar conexão
4. Assine sempre: _Dr. Vital 🩺_
5. Quando mencionar DOR ou mal-estar, use a tool register_pain_symptom
6. NUNCA prescreva medicamentos - oriente consulta presencial
7. Seja tranquilizador mas responsável
8. Se perguntarem sobre exames pendentes, use manage_medical_exams

Saudação do momento: "${saudacao}, ${ctx.nome}!"

⚠️ IMPORTANTE: 
- Sempre recomendar consulta médica para casos preocupantes
- Nunca diagnosticar doenças, apenas interpretar resultados
- Responda em português brasileiro, tom profissional mas acolhedor.`;
  }

  // ===== SOFIA (padrão) =====
  return `Você é a Sofia, nutricionista virtual do Instituto dos Sonhos.

PERSONALIDADE:
- Calorosa e empática como uma amiga querida
- Respostas CURTAS (2-4 linhas máximo)
- Usa emojis com moderação 💚
- Fala direto, sem enrolação
- NUNCA diz "vou verificar" - você JÁ TEM os dados
- Identifique PADRÕES nos dados do usuário

${dadosUsuario}

═══════════════════════════════════════
REGRAS DA SOFIA:
1. Responda SEMPRE com base nos dados acima
2. Se não tiver dado, diga claramente e pergunte
3. Use o nome "${ctx.nome}" frequentemente
4. Assine sempre: _Sofia 💚_
5. Quando mencionar DOR ou mal-estar, use a tool register_pain_symptom
6. Quando mencionar peso, água, comida, use as tools correspondentes

Saudação do momento: "${saudacao}, ${ctx.nome}!"

IMPORTANTE: Responda em português brasileiro, tom coloquial e natural.`;
}

// ============ HANDLER PRINCIPAL ============

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, message, sessionId = "default" } = await req.json();

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: "userId e message são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Sofia] Mensagem de ${userId}: ${message}`);

    // Buscar contexto compacto e histórico em paralelo
    const [ctx, conversationHistory] = await Promise.all([
      getCompactUserContext(userId),
      getConversationHistory(userId, sessionId),
    ]);

    // 🎯 Detectar personalidade baseada na mensagem e contexto
    const personality = detectPersonality(message, ctx);
    console.log(`[IA] Personalidade detectada: ${personality}`);

    // Salvar mensagem do usuário com personalidade detectada
    await saveMessage(userId, sessionId, "user", message, personality);

    // Construir mensagens para IA com prompt da personalidade correta
    const messages = [
      { role: "system", content: buildSystemPrompt(ctx, personality) },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // 🔥 Chamar OpenAI via Lovable AI Gateway (melhor compreensão)
    // NOTA: Não usar temperature com tool_choice="auto" pois alguns modelos não suportam
    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,  // openai/gpt-5-mini
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        max_completion_tokens: 700,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[Sofia] Erro na IA:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            response: `${ctx.nome}, estou um pouquinho ocupada! Me manda de novo em 1 minutinho? 🙏\n\n_Sofia 💚_`,
            error: "rate_limited" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            response: `${ctx.nome}, preciso de uma pausa técnica. Tenta de novo mais tarde? 💚\n\n_Sofia 💚_`,
            error: "payment_required" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices?.[0];
    const aiMessage = choice?.message;

    // Processar tool calls se houver
    let toolResults: string[] = [];
    let finalResponse = aiMessage?.content;

    if (aiMessage?.tool_calls?.length > 0) {
      for (const toolCall of aiMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executeTool(userId, toolCall.function.name, args);
        toolResults.push(result);
        console.log(`[Sofia] Tool ${toolCall.function.name}:`, result);
      }

      // Segunda chamada para resposta final
      const followUpMessages = [
        ...messages,
        aiMessage,
        {
          role: "tool",
          tool_call_id: aiMessage.tool_calls[0].id,
          content: toolResults.join("\n"),
        },
      ];

      const followUpResponse = await fetch(AI_GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: followUpMessages,
          max_completion_tokens: 400,
        }),
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        finalResponse = followUpData.choices?.[0]?.message?.content || "✅ Feito!";
      }
    }

    // 🔥 FALLBACK INTELIGENTE para saudações e mensagens simples
    if (!finalResponse || finalResponse.trim() === '') {
      console.log(`[Sofia] Resposta vazia, gerando fallback para: "${message}"`);
      finalResponse = generateSmartFallback(message, ctx, personality);
    }

    // Salvar resposta da IA com personalidade correta
    if (finalResponse) {
      await saveMessage(userId, sessionId, "assistant", finalResponse, personality);
    }

    return new Response(
      JSON.stringify({
        response: finalResponse,
        personality: personality,  // Retorna qual voz foi usada
        toolResults: toolResults.length > 0 ? toolResults : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[Sofia] Erro:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "Ops! Tive um probleminha. Tenta de novo? 🙏\n\n_Sofia 💚_" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
