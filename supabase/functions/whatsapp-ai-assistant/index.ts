import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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
      name: "complete_challenge_log",
      description: "Registra progresso em um desafio ativo. Use quando usuário mencionar que fez algo relacionado a um desafio.",
      parameters: {
        type: "object",
        properties: {
          challenge_id: { type: "string", description: "ID do desafio" },
          value: { type: "number", description: "Valor numérico do progresso" },
          notes: { type: "string", description: "Observações do usuário" },
        },
        required: ["challenge_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_goal",
      description: "Define ou atualiza uma meta do usuário. Use quando usuário quiser definir uma meta de peso, calorias, etc.",
      parameters: {
        type: "object",
        properties: {
          goal_type: { 
            type: "string", 
            enum: ["weight", "calories", "water", "steps", "sleep"],
            description: "Tipo da meta" 
          },
          target_value: { type: "number", description: "Valor alvo" },
          deadline_days: { type: "number", description: "Prazo em dias (opcional)" },
        },
        required: ["goal_type", "target_value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_mood",
      description: "Registra o humor/bem-estar do usuário. Use quando usuário falar sobre como está se sentindo.",
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
      description: "Busca status completo do usuário: peso, metas, desafios ativos, progresso do dia.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_active_challenges",
      description: "Lista os desafios ativos do usuário.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "join_challenge",
      description: "Inscreve o usuário em um desafio disponível.",
      parameters: {
        type: "object",
        properties: {
          challenge_id: { type: "string", description: "ID do desafio" },
        },
        required: ["challenge_id"],
      },
    },
  },
];

// ============ EXECUÇÃO DE TOOLS ============

async function executeTool(userId: string, toolName: string, args: any): Promise<string> {
  console.log(`[AI Assistant] Executando tool: ${toolName}`, args);
  
  const today = new Date().toISOString().split('T')[0];

  switch (toolName) {
    case "register_weight": {
      // Upsert no tracking diário
      const { error } = await supabase
        .from("advanced_daily_tracking")
        .upsert({
          user_id: userId,
          tracking_date: today,
          weight_kg: args.weight_kg,
          waist_cm: args.waist_cm || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,tracking_date" });
      
      if (error) {
        console.error("[AI Assistant] Erro ao registrar peso:", error);
        return `Erro ao registrar peso: ${error.message}`;
      }
      
      // Também atualizar dados físicos
      await supabase
        .from("dados_físicos_do_usuário")
        .upsert({
          user_id: userId,
          peso_atual_kg: args.weight_kg,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      
      return `Peso registrado: ${args.weight_kg}kg${args.waist_cm ? ` | Cintura: ${args.waist_cm}cm` : ''}`;
    }

    case "register_water": {
      // Buscar registro atual e somar
      const { data: current } = await supabase
        .from("advanced_daily_tracking")
        .select("water_ml")
        .eq("user_id", userId)
        .eq("tracking_date", today)
        .maybeSingle();
      
      const newTotal = (current?.water_ml || 0) + args.amount_ml;
      
      await supabase
        .from("advanced_daily_tracking")
        .upsert({
          user_id: userId,
          tracking_date: today,
          water_ml: newTotal,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,tracking_date" });
      
      return `Água registrada: +${args.amount_ml}ml (Total hoje: ${newTotal}ml)`;
    }

    case "complete_challenge_log": {
      // Buscar participação ativa
      const { data: participation } = await supabase
        .from("challenge_participations")
        .select("id, challenge_id, current_streak, points_earned")
        .eq("user_id", userId)
        .eq("challenge_id", args.challenge_id)
        .eq("is_completed", false)
        .maybeSingle();
      
      if (!participation) {
        return "Você não está participando deste desafio.";
      }
      
      // Registrar log diário
      await supabase.from("challenge_daily_logs").insert({
        participation_id: participation.id,
        log_date: today,
        is_completed: true,
        numeric_value: args.value || 1,
        notes: args.notes,
        points_earned: 10,
      });
      
      // Atualizar streak
      await supabase
        .from("challenge_participations")
        .update({
          current_streak: (participation.current_streak || 0) + 1,
          points_earned: (participation.points_earned || 0) + 10,
          updated_at: new Date().toISOString(),
        })
        .eq("id", participation.id);
      
      return `Desafio atualizado! +10 pontos | Streak: ${(participation.current_streak || 0) + 1} dias`;
    }

    case "set_goal": {
      const goalMappings: Record<string, any> = {
        weight: { field: "target_weight_kg", name: "Peso" },
        calories: { field: "target_calories", name: "Calorias" },
        water: { field: "target_water_ml", name: "Água" },
        steps: { field: "target_steps", name: "Passos" },
        sleep: { field: "target_sleep_hours", name: "Sono" },
      };
      
      const mapping = goalMappings[args.goal_type];
      if (!mapping) return "Tipo de meta não reconhecido.";
      
      const targetDate = args.deadline_days 
        ? new Date(Date.now() + args.deadline_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null;
      
      await supabase.from("nutritional_goals").upsert({
        user_id: userId,
        goal_type: args.goal_type,
        goal_name: `Meta de ${mapping.name}`,
        [mapping.field]: args.target_value,
        target_date: targetDate,
        status: "active",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,goal_type" });
      
      return `Meta definida: ${mapping.name} = ${args.target_value}${targetDate ? ` até ${targetDate}` : ''}`;
    }

    case "register_mood": {
      await supabase
        .from("advanced_daily_tracking")
        .upsert({
          user_id: userId,
          tracking_date: today,
          mood_rating: args.mood_rating,
          energy_level: args.energy_level || null,
          stress_level: args.stress_level || null,
          notes: args.notes || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,tracking_date" });
      
      const emoji = args.mood_rating >= 7 ? "😊" : args.mood_rating >= 5 ? "😐" : "😔";
      return `Humor registrado: ${emoji} ${args.mood_rating}/10`;
    }

    case "register_sleep": {
      await supabase
        .from("advanced_daily_tracking")
        .upsert({
          user_id: userId,
          tracking_date: today,
          sleep_hours: args.hours,
          sleep_quality: args.quality || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,tracking_date" });
      
      return `Sono registrado: ${args.hours}h${args.quality ? ` (qualidade: ${args.quality}/10)` : ''}`;
    }

    case "register_exercise": {
      await supabase
        .from("advanced_daily_tracking")
        .upsert({
          user_id: userId,
          tracking_date: today,
          exercise_type: args.exercise_type,
          exercise_duration_minutes: args.duration_minutes,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,tracking_date" });
      
      const calories = Math.round(args.duration_minutes * (args.intensity === 'intenso' ? 10 : args.intensity === 'moderado' ? 7 : 4));
      return `Exercício registrado: ${args.exercise_type} por ${args.duration_minutes}min (~${calories}kcal)`;
    }

    case "get_user_status": {
      // Buscar perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("user_id", userId)
        .maybeSingle();
      
      // Buscar dados físicos
      const { data: fisica } = await supabase
        .from("dados_físicos_do_usuário")
        .select("peso_atual_kg, altura_cm")
        .eq("user_id", userId)
        .maybeSingle();
      
      // Buscar tracking de hoje
      const { data: tracking } = await supabase
        .from("advanced_daily_tracking")
        .select("*")
        .eq("user_id", userId)
        .eq("tracking_date", today)
        .maybeSingle();
      
      // Buscar metas ativas
      const { data: goals } = await supabase
        .from("nutritional_goals")
        .select("goal_type, target_calories, target_weight_kg, target_water_ml")
        .eq("user_id", userId)
        .eq("status", "active");
      
      // Buscar desafios ativos
      const { data: challenges } = await supabase
        .from("challenge_participations")
        .select("challenge_id, current_streak, challenges(title)")
        .eq("user_id", userId)
        .eq("is_completed", false);
      
      return JSON.stringify({
        nome: profile?.name || "Usuário",
        peso_atual: fisica?.peso_atual_kg,
        altura: fisica?.altura_cm,
        hoje: {
          agua_ml: tracking?.water_ml || 0,
          calorias: tracking?.calories_consumed || 0,
          exercicio_min: tracking?.exercise_duration_minutes || 0,
          humor: tracking?.mood_rating,
          sono_horas: tracking?.sleep_hours,
        },
        metas: goals || [],
        desafios_ativos: challenges?.length || 0,
      });
    }

    case "get_active_challenges": {
      const { data: participations } = await supabase
        .from("challenge_participations")
        .select(`
          id, current_streak, points_earned,
          challenges(id, title, description, duration_days, xp_reward)
        `)
        .eq("user_id", userId)
        .eq("is_completed", false);
      
      if (!participations?.length) {
        // Buscar desafios disponíveis
        const { data: available } = await supabase
          .from("challenges")
          .select("id, title, description, duration_days, xp_reward")
          .eq("is_active", true)
          .limit(5);
        
        return JSON.stringify({
          participando: [],
          disponiveis: available || [],
        });
      }
      
      return JSON.stringify({
        participando: participations.map(p => ({
          id: (p.challenges as any)?.id,
          titulo: (p.challenges as any)?.title,
          streak: p.current_streak,
          pontos: p.points_earned,
        })),
      });
    }

    case "join_challenge": {
      // Verificar se já participa
      const { data: existing } = await supabase
        .from("challenge_participations")
        .select("id")
        .eq("user_id", userId)
        .eq("challenge_id", args.challenge_id)
        .maybeSingle();
      
      if (existing) {
        return "Você já está participando deste desafio!";
      }
      
      // Buscar info do desafio
      const { data: challenge } = await supabase
        .from("challenges")
        .select("title, xp_reward")
        .eq("id", args.challenge_id)
        .single();
      
      if (!challenge) {
        return "Desafio não encontrado.";
      }
      
      // Inscrever
      await supabase.from("challenge_participations").insert({
        user_id: userId,
        challenge_id: args.challenge_id,
        started_at: new Date().toISOString(),
        current_streak: 0,
        points_earned: 0,
        is_completed: false,
      });
      
      return `Inscrito no desafio "${challenge.title}"! 🎯 XP possível: ${challenge.xp_reward}`;
    }

    default:
      return "Função não reconhecida.";
  }
}

// ============ SISTEMA DE PROMPTS ============

function buildSystemPrompt(userName: string, userContext: any): string {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  
  return `Você é a assistente pessoal de saúde do Instituto dos Sonhos.
Você tem DUAS personalidades que alternam conforme o contexto:

🥗 **Sofia** - Nutricionista virtual
- Especialista em alimentação, nutrição, peso, dieta
- Tom: carinhosa, motivadora, usa emojis de comida
- Fala: "Vamos juntas nessa jornada!", "Que delícia!", "Você está arrasando!"

🩺 **Dr. Vital** - Médico virtual  
- Especialista em exames, saúde, medicamentos, sintomas
- Tom: profissional mas acolhedor, usa emojis médicos
- Fala: "Vamos analisar isso com cuidado", "Importante observar...", "Recomendo..."

REGRAS:
1. Responda SEMPRE em português brasileiro, de forma HUMANA e NATURAL
2. Use a personalidade apropriada ao contexto (nutrição=Sofia, saúde=Dr.Vital)
3. NUNCA pareça robótico - seja conversacional, use gírias leves
4. Use emojis moderadamente para dar vida às mensagens
5. Chame o usuário pelo nome: "${userName}"
6. Seja PROATIVO: ofereça registrar dados quando o usuário mencionar algo relevante
7. ${greeting}! Adapte a saudação ao horário

CONTEXTO DO USUÁRIO:
${JSON.stringify(userContext, null, 2)}

AÇÕES DISPONÍVEIS (use as tools quando apropriado):
- Registrar peso/cintura
- Registrar água consumida
- Registrar exercício
- Registrar sono
- Registrar humor
- Definir metas
- Ver desafios ativos
- Completar desafios

Quando o usuário mencionar algo acionável (ex: "pesei 70kg", "bebi 500ml de água", "fiz 30min de caminhada"), USE A TOOL APROPRIADA automaticamente e confirme o registro.

Mantenha respostas CURTAS (2-4 linhas) a menos que precise explicar algo detalhado.`;
}

// ============ HANDLER PRINCIPAL ============

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, message, conversationHistory = [] } = await req.json();

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: "userId e message são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[AI Assistant] Mensagem de ${userId}: ${message}`);

    // Buscar dados do usuário para contexto
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("user_id", userId)
      .maybeSingle();

    const userName = profile?.name?.split(' ')[0] || "Querido(a)";

    // Buscar status atual
    const statusResult = await executeTool(userId, "get_user_status", {});
    let userContext = {};
    try {
      userContext = JSON.parse(statusResult);
    } catch {}

    // Construir mensagens para IA
    const messages = [
      { role: "system", content: buildSystemPrompt(userName, userContext) },
      ...conversationHistory.slice(-10), // Últimas 10 mensagens
      { role: "user", content: message },
    ];

    // Chamar Lovable AI
    const aiResponse = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[AI Assistant] Erro na IA:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            response: "🙈 Estou um pouquinho ocupada agora! Me manda de novo em 1 minutinho?",
            error: "rate_limited" 
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
    if (aiMessage?.tool_calls?.length > 0) {
      for (const toolCall of aiMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executeTool(userId, toolCall.function.name, args);
        toolResults.push(result);
        console.log(`[AI Assistant] Tool ${toolCall.function.name}:`, result);
      }

      // Se teve tool calls, fazer segunda chamada para resposta final
      const followUpMessages = [
        ...messages,
        aiMessage,
        {
          role: "tool",
          tool_call_id: aiMessage.tool_calls[0].id,
          content: toolResults.join("\n"),
        },
      ];

      const followUpResponse = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: followUpMessages,
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        const finalContent = followUpData.choices?.[0]?.message?.content;
        
        return new Response(
          JSON.stringify({
            response: finalContent || "✅ Feito!",
            toolResults,
            personality: detectPersonality(message),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Resposta direta sem tools
    return new Response(
      JSON.stringify({
        response: aiMessage?.content || "Hmm, não entendi. Pode repetir?",
        personality: detectPersonality(message),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[AI Assistant] Erro:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "Ops! Tive um probleminha. Tenta de novo? 🙏" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Detectar personalidade pelo contexto
function detectPersonality(message: string): 'sofia' | 'drvital' {
  const medical = ['exame', 'médico', 'dor', 'sintoma', 'remédio', 'sangue', 'pressão', 'doença'];
  const lower = message.toLowerCase();
  
  for (const word of medical) {
    if (lower.includes(word)) return 'drvital';
  }
  
  return 'sofia';
}
