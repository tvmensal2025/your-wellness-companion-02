import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔥 USAR OPENAI GPT-4o PARA CONVERSAS HUMANIZADAS
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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
  // 🔥 NOVAS FERRAMENTAS PARA HISTÓRICO ALIMENTAR
  {
    type: "function",
    function: {
      name: "get_food_history",
      description: "Busca histórico de refeições do usuário. Use para saber o que o usuário comeu hoje, ontem ou em uma data específica.",
      parameters: {
        type: "object",
        properties: {
          date: { 
            type: "string", 
            description: "Data no formato YYYY-MM-DD, ou 'hoje', 'ontem', 'semana'" 
          },
          meal_type: { 
            type: "string", 
            description: "Tipo de refeição: cafe_da_manha, almoco, jantar, lanche_manha, lanche_tarde, ceia (opcional)" 
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_daily_nutrition_summary",
      description: "Resume a nutrição do dia: total de calorias, proteínas, carboidratos, gorduras. Use quando perguntar sobre o dia alimentar.",
      parameters: {
        type: "object",
        properties: {
          date: { 
            type: "string", 
            description: "Data no formato YYYY-MM-DD (opcional, padrão: hoje)" 
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_meal_from_description",
      description: "Registra uma refeição a partir de descrição textual. Use quando o usuário descrever o que comeu.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "Descrição do que comeu" },
          meal_type: { 
            type: "string", 
            description: "Tipo de refeição: cafe_da_manha, almoco, jantar, lanche_manha, lanche_tarde, ceia" 
          },
        },
        required: ["description"],
      },
    },
  },
  // 🔥 NOVA TOOL: REGISTRO DE DORES E SINTOMAS
  {
    type: "function",
    function: {
      name: "register_pain_symptom",
      description: "Registra uma dor ou sintoma do usuário. Use quando o usuário mencionar DOR, DESCONFORTO, MAL-ESTAR ou qualquer sintoma físico como dor de cabeça, enjoo, tontura, cansaço excessivo.",
      parameters: {
        type: "object",
        properties: {
          pain_level: { 
            type: "number", 
            description: "Intensidade da dor de 1-10 (pergunte se não souber)" 
          },
          pain_location: { 
            type: "string", 
            description: "Local da dor: cabeça, costas, joelho, estômago, peito, etc." 
          },
          symptoms: { 
            type: "array",
            items: { type: "string" },
            description: "Lista de sintomas: náusea, tontura, cansaço, febre, etc." 
          },
          notes: { 
            type: "string", 
            description: "Contexto adicional (quando começou, o que estava fazendo, duração)" 
          },
        },
        required: ["pain_location"],
      },
    },
  },
  // 🔥 NOVA TOOL: BUSCAR ANAMNESE COMPLETA
  {
    type: "function",
    function: {
      name: "get_user_anamnesis",
      description: "Busca a anamnese médica completa do usuário (histórico de doenças, medicamentos, alergias, etc). Use quando perguntar sobre saúde, histórico médico ou dados da anamnese.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  // 🔥 NOVA TOOL: HISTÓRICO DE SINTOMAS
  {
    type: "function",
    function: {
      name: "get_symptom_history",
      description: "Busca histórico de dores e sintomas registrados. Use quando perguntar sobre sintomas passados ou padrões de dor.",
      parameters: {
        type: "object",
        properties: {
          days: { 
            type: "number", 
            description: "Quantidade de dias para buscar (padrão: 30)" 
          },
        },
        required: [],
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
      
      await supabase.from("challenge_daily_logs").insert({
        participation_id: participation.id,
        log_date: today,
        is_completed: true,
        numeric_value: args.value || 1,
        notes: args.notes,
        points_earned: 10,
      });
      
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
      // Buscar perfil com campos corretos
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, current_weight")
        .eq("user_id", userId)
        .maybeSingle();
      
      // Buscar peso mais recente de weight_measurements
      const { data: lastWeight } = await supabase
        .from("weight_measurements")
        .select("peso_kg, measurement_date, gordura_corporal_percent, massa_muscular_kg")
        .eq("user_id", userId)
        .order("measurement_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Buscar primeiro peso para calcular progresso
      const { data: firstWeight } = await supabase
        .from("weight_measurements")
        .select("peso_kg, measurement_date")
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
      
      const { data: goals } = await supabase
        .from("nutritional_goals")
        .select("goal_type, target_calories, target_weight_kg, target_water_ml")
        .eq("user_id", userId)
        .eq("status", "active");
      
      const { data: challenges } = await supabase
        .from("challenge_participations")
        .select("challenge_id, current_streak, challenges(title)")
        .eq("user_id", userId)
        .eq("is_completed", false);

      // Buscar calorias de hoje do food_history
      const { data: foodHistory } = await supabase
        .from("food_history")
        .select("total_calories")
        .eq("user_id", userId)
        .eq("meal_date", today);

      const caloriesConsumed = foodHistory?.reduce((sum, item) => sum + (Number(item.total_calories) || 0), 0) || 0;
      
      // Calcular peso atual e progresso
      const peso_atual = lastWeight?.peso_kg || profile?.current_weight || null;
      const peso_perdido = (firstWeight && lastWeight && firstWeight.peso_kg > lastWeight.peso_kg)
        ? Number((firstWeight.peso_kg - lastWeight.peso_kg).toFixed(1))
        : null;
      
      return JSON.stringify({
        nome: profile?.full_name?.split(' ')[0] || "Usuário",
        nome_completo: profile?.full_name,
        peso_atual: peso_atual,
        ultimo_registro_peso: lastWeight?.measurement_date,
        peso_perdido: peso_perdido,
        gordura_corporal: lastWeight?.gordura_corporal_percent,
        massa_muscular: lastWeight?.massa_muscular_kg,
        hoje: {
          agua_ml: tracking?.water_ml || 0,
          calorias: caloriesConsumed,
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
      const { data: existing } = await supabase
        .from("challenge_participations")
        .select("id")
        .eq("user_id", userId)
        .eq("challenge_id", args.challenge_id)
        .maybeSingle();
      
      if (existing) {
        return "Você já está participando deste desafio!";
      }
      
      const { data: challenge } = await supabase
        .from("challenges")
        .select("title, xp_reward")
        .eq("id", args.challenge_id)
        .single();
      
      if (!challenge) {
        return "Desafio não encontrado.";
      }
      
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

    // 🔥 NOVAS FERRAMENTAS DE HISTÓRICO ALIMENTAR

    case "get_food_history": {
      let targetDate = today;
      
      if (args.date) {
        if (args.date === 'hoje') {
          targetDate = today;
        } else if (args.date === 'ontem') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          targetDate = yesterday.toISOString().split('T')[0];
        } else if (args.date === 'semana') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          let query = supabase
            .from("food_history")
            .select("*")
            .eq("user_id", userId)
            .gte("meal_date", weekAgo.toISOString().split('T')[0])
            .order("meal_date", { ascending: false })
            .order("meal_time", { ascending: false });
          
          const { data, error } = await query;
          
          if (error || !data?.length) {
            return "Não encontrei registros de refeições na última semana.";
          }

          const summary = data.map(meal => {
            const foods = (meal.food_items as any[]) || [];
            const foodNames = foods.map((f: any) => f.nome || f.name).join(", ");
            return `📅 ${meal.meal_date} ${meal.meal_time?.slice(0,5) || ""} - ${formatMealTypeSimple(meal.meal_type)}: ${foodNames} (${Math.round(Number(meal.total_calories) || 0)} kcal)`;
          }).join("\n");

          return `🗓️ Refeições da última semana:\n\n${summary}`;
        } else {
          targetDate = args.date;
        }
      }

      let query = supabase
        .from("food_history")
        .select("*")
        .eq("user_id", userId)
        .eq("meal_date", targetDate)
        .order("meal_time", { ascending: true });
      
      if (args.meal_type) {
        query = query.eq("meal_type", args.meal_type);
      }

      const { data, error } = await query;

      if (error || !data?.length) {
        return `Não encontrei registros de refeições para ${targetDate === today ? 'hoje' : targetDate}.`;
      }

      const meals = data.map(meal => {
        const foods = (meal.food_items as any[]) || [];
        const foodsList = foods.map((f: any) => `  • ${f.nome || f.name} (${f.quantidade || f.grams || '?'}g)`).join("\n");
        const mealLabel = formatMealTypeSimple(meal.meal_type);
        const time = meal.meal_time?.slice(0, 5) || "";
        const confirmed = meal.user_confirmed ? "✅" : "⏳";
        
        return `${confirmed} *${mealLabel}* (${time})\n${foodsList}\n📊 ${Math.round(Number(meal.total_calories) || 0)} kcal`;
      }).join("\n\n");

      const totalCalories = data.reduce((sum, m) => sum + (Number(m.total_calories) || 0), 0);

      return `🍽️ Refeições de ${targetDate === today ? 'hoje' : targetDate}:\n\n${meals}\n\n📊 *Total: ${Math.round(totalCalories)} kcal*`;
    }

    case "get_daily_nutrition_summary": {
      const targetDate = args.date || today;

      const { data, error } = await supabase
        .from("food_history")
        .select("total_calories, total_proteins, total_carbs, total_fats, total_fiber, meal_type")
        .eq("user_id", userId)
        .eq("meal_date", targetDate);

      if (error || !data?.length) {
        return `Não encontrei registros nutricionais para ${targetDate === today ? 'hoje' : targetDate}.`;
      }

      const totals = {
        calories: data.reduce((sum, m) => sum + (Number(m.total_calories) || 0), 0),
        proteins: data.reduce((sum, m) => sum + (Number(m.total_proteins) || 0), 0),
        carbs: data.reduce((sum, m) => sum + (Number(m.total_carbs) || 0), 0),
        fats: data.reduce((sum, m) => sum + (Number(m.total_fats) || 0), 0),
        fiber: data.reduce((sum, m) => sum + (Number(m.total_fiber) || 0), 0),
        meals: data.length,
      };

      // Buscar meta de calorias
      const { data: goals } = await supabase
        .from("nutritional_goals")
        .select("target_calories")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      const targetCalories = goals?.target_calories || 2000;
      const progress = Math.round((totals.calories / targetCalories) * 100);

      return JSON.stringify({
        data: targetDate,
        refeicoes: totals.meals,
        calorias: Math.round(totals.calories),
        proteinas_g: Math.round(totals.proteins),
        carboidratos_g: Math.round(totals.carbs),
        gorduras_g: Math.round(totals.fats),
        fibras_g: Math.round(totals.fiber),
        meta_calorias: targetCalories,
        progresso_percentual: progress,
        faltam: Math.max(0, targetCalories - totals.calories),
      });
    }

    case "register_meal_from_description": {
      // Chamar sofia-deterministic para extrair alimentos
      const { data: analysis, error: analysisError } = await supabase.functions.invoke("sofia-deterministic", {
        body: {
          user_input: args.description,
          user_id: userId,
          analysis_type: "text_extraction",
        },
      });

      if (analysisError || !analysis) {
        return "Não consegui identificar os alimentos na descrição. Tente ser mais específico.";
      }

      const foods = analysis.detected_foods || analysis.foods || [];
      if (foods.length === 0) {
        return "Não encontrei alimentos na descrição. Tente algo como 'arroz, feijão e frango'.";
      }

      const totalCalories = analysis.nutrition_data?.total_kcal || analysis.total_kcal || 0;
      const mealType = args.meal_type || detectMealType();

      // Salvar em food_history
      const { data: savedMeal, error: saveError } = await supabase
        .from("food_history")
        .insert({
          user_id: userId,
          meal_date: today,
          meal_time: new Date().toTimeString().split(" ")[0],
          meal_type: mealType,
          food_items: foods,
          total_calories: totalCalories,
          total_proteins: analysis.nutrition_data?.total_proteina || 0,
          total_carbs: analysis.nutrition_data?.total_carbo || 0,
          total_fats: analysis.nutrition_data?.total_gordura || 0,
          source: "whatsapp_ai",
          user_confirmed: true,
        })
        .select("id")
        .single();

      if (saveError) {
        return `Erro ao salvar refeição: ${saveError.message}`;
      }

      const foodsList = foods.map((f: any) => `${f.name || f.nome} (${f.grams || f.quantidade || '?'}g)`).join(", ");
      
      return `✅ Refeição registrada!\n\n${formatMealTypeSimple(mealType)}: ${foodsList}\n📊 ~${Math.round(totalCalories)} kcal`;
    }

    // 🔥 NOVA: REGISTRO DE DOR/SINTOMA
    case "register_pain_symptom": {
      const now = new Date();
      const time = now.toTimeString().split(' ')[0];
      
      // Buscar registro existente do dia
      const { data: existing } = await supabase
        .from("advanced_daily_tracking")
        .select("symptoms, notes")
        .eq("user_id", userId)
        .eq("tracking_date", today)
        .maybeSingle();
      
      // Agregar sintomas anteriores
      const previousSymptoms = existing?.symptoms || [];
      const newSymptoms = [...new Set([...previousSymptoms, ...(args.symptoms || [])])];
      const previousNotes = existing?.notes || '';
      const newNote = `[${time}] ${args.pain_location || 'Sintoma'} (${args.pain_level || '?'}/10): ${args.notes || 'registrado via WhatsApp'}`;
      const combinedNotes = previousNotes ? `${previousNotes}\n${newNote}` : newNote;
      
      // Salvar no advanced_daily_tracking
      const { error } = await supabase
        .from("advanced_daily_tracking")
        .upsert({
          user_id: userId,
          tracking_date: today,
          pain_level: args.pain_level || null,
          pain_location: args.pain_location,
          symptoms: newSymptoms,
          notes: combinedNotes,
          updated_at: now.toISOString(),
        }, { onConflict: "user_id,tracking_date" });
      
      if (error) {
        console.error("[AI Assistant] Erro ao registrar sintoma:", error);
        return `Erro ao registrar sintoma: ${error.message}`;
      }
      
      // Também salvar no health_diary para histórico permanente
      await supabase.from("health_diary").insert({
        user_id: userId,
        date: today,
        notes: `🩺 Sintoma: ${args.pain_location} (${args.pain_level || '?'}/10) - ${args.symptoms?.join(', ') || ''} ${args.notes || ''}`.trim(),
      });
      
      const emoji = (args.pain_level || 5) >= 7 ? "😰" : (args.pain_level || 5) >= 4 ? "😕" : "🙂";
      return `${emoji} Registrado às ${time}:\n• Local: ${args.pain_location}\n• Intensidade: ${args.pain_level || '?'}/10\n${args.symptoms?.length ? `• Sintomas: ${args.symptoms.join(', ')}\n` : ''}${args.notes ? `• Obs: ${args.notes}` : ''}`;
    }

    // 🔥 NOVA: BUSCAR ANAMNESE
    case "get_user_anamnesis": {
      const { data: anamnesis } = await supabase
        .from("user_anamnesis")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (!anamnesis) {
        return "Anamnese ainda não preenchida. Recomendo preencher para um acompanhamento mais personalizado!";
      }
      
      return JSON.stringify({
        historico_familiar: {
          obesidade: anamnesis.family_obesity_history || false,
          diabetes: anamnesis.family_diabetes_history || false,
          cardiopatias: anamnesis.family_heart_disease_history || false,
          tireoide: anamnesis.family_thyroid_problems_history || false,
          depressao_ansiedade: anamnesis.family_depression_anxiety_history || false,
          outros: anamnesis.family_other_chronic_diseases,
        },
        medicacoes_atuais: anamnesis.current_medications || [],
        doencas_cronicas: anamnesis.chronic_diseases || [],
        alergias: anamnesis.allergies || [],
        intolerâncias_alimentares: anamnesis.food_intolerances || [],
        suplementos: anamnesis.supplements || [],
        relacionamento_comida: {
          score: anamnesis.food_relationship_score,
          compulsao: anamnesis.has_compulsive_eating,
          come_escondido: anamnesis.eats_in_secret,
          culpa_ao_comer: anamnesis.feels_guilt_after_eating,
        },
        qualidade_vida: {
          sono_horas: anamnesis.sleep_hours_per_night,
          sono_qualidade: anamnesis.sleep_quality_score,
          estresse: anamnesis.daily_stress_level,
          energia: anamnesis.daily_energy_level,
        },
        objetivos: {
          peso_ideal: anamnesis.ideal_weight_goal,
          principais_metas: anamnesis.main_treatment_goals,
          maior_desafio: anamnesis.biggest_weight_loss_challenge,
          motivacao: anamnesis.motivation_for_seeking_treatment,
        },
      });
    }

    // 🔥 NOVA: HISTÓRICO DE SINTOMAS
    case "get_symptom_history": {
      const daysToFetch = args.days || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysToFetch);
      
      const { data: symptoms } = await supabase
        .from("advanced_daily_tracking")
        .select("tracking_date, pain_level, pain_location, symptoms, notes")
        .eq("user_id", userId)
        .gte("tracking_date", startDate.toISOString().split('T')[0])
        .not("pain_location", "is", null)
        .order("tracking_date", { ascending: false });
      
      const { data: healthDiary } = await supabase
        .from("health_diary")
        .select("date, notes")
        .eq("user_id", userId)
        .gte("date", startDate.toISOString().split('T')[0])
        .ilike("notes", "%Sintoma%")
        .order("date", { ascending: false });
      
      if ((!symptoms || symptoms.length === 0) && (!healthDiary || healthDiary.length === 0)) {
        return `Não encontrei registros de sintomas nos últimos ${daysToFetch} dias. Isso é um bom sinal! 💚`;
      }
      
      const symptomList = symptoms?.map(s => 
        `📅 ${s.tracking_date}: ${s.pain_location} (${s.pain_level || '?'}/10) ${s.symptoms?.join(', ') || ''}`
      ).join('\n') || '';
      
      const diaryList = healthDiary?.map(d => 
        `📅 ${d.date}: ${d.notes}`
      ).join('\n') || '';
      
      return `🩺 Histórico de sintomas (${daysToFetch} dias):\n\n${symptomList}\n${diaryList ? '\n📝 Diário:\n' + diaryList : ''}`;
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

function formatMealTypeSimple(mealType: string | null): string {
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

// ============ SISTEMA DE PROMPTS HUMANIZADOS ============

function buildSystemPrompt(userName: string, userContext: any, anamnesisData: any, symptomHistory: any[], isFirstMessage: boolean = false): string {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  
  // Preparar dados do contexto para resposta direta
  const pesoInfo = userContext?.peso_atual 
    ? `Peso atual: ${userContext.peso_atual}kg (registrado em ${userContext.ultimo_registro_peso || 'recentemente'})` 
    : "Peso: ainda não registrado";
  const progressoInfo = userContext?.peso_perdido 
    ? `Progresso: já perdeu ${userContext.peso_perdido}kg! 💪` 
    : "";
  
  // Preparar dados da anamnese
  const anamneseInfo = anamnesisData ? `
📋 ANAMNESE DO USUÁRIO (dados importantes):
- Doenças crônicas: ${anamnesisData.chronic_diseases?.join(', ') || 'nenhuma informada'}
- Medicamentos em uso: ${anamnesisData.current_medications?.map((m: any) => m.name || m).join(', ') || 'nenhum'}
- Alergias: ${anamnesisData.allergies?.join(', ') || 'nenhuma'}
- Intolerâncias alimentares: ${anamnesisData.food_intolerances?.join(', ') || 'nenhuma'}
- Histórico familiar: ${[
    anamnesisData.family_obesity_history && 'obesidade',
    anamnesisData.family_diabetes_history && 'diabetes',
    anamnesisData.family_heart_disease_history && 'cardiopatias',
    anamnesisData.family_thyroid_problems_history && 'tireoide',
  ].filter(Boolean).join(', ') || 'não informado'}
- Qualidade do sono: ${anamnesisData.sleep_quality_score || '?'}/10
- Nível de estresse diário: ${anamnesisData.daily_stress_level || '?'}/10
- Objetivo de peso: ${anamnesisData.ideal_weight_goal ? anamnesisData.ideal_weight_goal + 'kg' : 'não definido'}
- Maior desafio: ${anamnesisData.biggest_weight_loss_challenge || 'não informado'}
` : `
📋 ANAMNESE: Não preenchida ainda. Se relevante, sugira preencher.
`;

  // Preparar histórico de sintomas
  const sintomasInfo = symptomHistory.length > 0 ? `
🩺 SINTOMAS RECENTES (últimos 30 dias):
${symptomHistory.slice(0, 5).map(s => 
  `- ${s.tracking_date}: ${s.pain_location} (${s.pain_level || '?'}/10) ${s.symptoms?.join(', ') || ''}`
).join('\n')}
${symptomHistory.length > 5 ? `... e mais ${symptomHistory.length - 5} registros` : ''}
` : `
🩺 SINTOMAS: Nenhum sintoma registrado recentemente. 💚
`;

  return `Você é a assistente pessoal de saúde do Instituto dos Sonhos - uma IA super humana e carinhosa.

Você tem DUAS personalidades que alternam conforme o contexto:

🥗 *Sofia* - Nutricionista virtual
- Especialista em alimentação, nutrição, peso, dieta, refeições
- Tom: EXTREMAMENTE calorosa, motivadora, como uma amiga querida
- Usa emojis de comida com moderação: 🥗 💚 ✨ 🍽️ 🥤
- SEMPRE assina: _Sofia 🥗_

🩺 *Dr. Vital* - Médico virtual  
- Especialista em exames, saúde, medicamentos, sintomas, dores
- Tom: profissional mas acolhedor e acessível
- REGISTRA AUTOMATICAMENTE qualquer dor ou sintoma mencionado usando register_pain_symptom
- Usa emojis médicos: 🩺 🟢 🟡 🔴 💊
- SEMPRE assina: _Dr. Vital 🩺_

REGRAS CRÍTICAS - SAUDAÇÕES:
${isFirstMessage 
  ? `1. Esta é a PRIMEIRA mensagem do dia - use "${greeting}, ${userName}!" apenas UMA vez no início`
  : `1. NÃO use saudações (bom dia/tarde/noite) - você JÁ cumprimentou antes. Vá direto ao ponto.`}
2. SEMPRE chame o usuário pelo nome: "${userName}"

REGRAS CRÍTICAS - RESPOSTAS DIRETAS:
1. NUNCA diga "vou olhar", "vou verificar", "deixa eu ver", "um momento" - você TEM os dados, responda DIRETAMENTE
2. Quando perguntarem sobre peso, responda: "${userName}, seu peso atual é ${userContext?.peso_atual || 'ainda não registrado'}kg!"
3. Se não tiver dado, diga claramente: "${userName}, ainda não tenho esse dado registrado. Me conta?"
4. Use SEMPRE as informações da ANAMNESE para personalizar respostas sobre saúde

REGRAS CRÍTICAS - REGISTRO DE SINTOMAS:
1. Quando o usuário mencionar DOR (cabeça, costas, estômago, etc), use IMEDIATAMENTE register_pain_symptom
2. Quando mencionar mal-estar, enjoo, tontura, cansaço excessivo, febre, etc - REGISTRE como sintoma
3. Pergunte a intensidade (1-10) se não souber
4. Pergunte há quanto tempo está sentindo se não informado
5. SEMPRE confirme que registrou o sintoma

DADOS DO USUÁRIO PARA RESPOSTA DIRETA:
- Nome: ${userName}
- ${pesoInfo}
${progressoInfo ? `- ${progressoInfo}` : ''}
- Água hoje: ${userContext?.hoje?.agua_ml || 0}ml
- Calorias hoje: ${userContext?.hoje?.calorias || 0}kcal
- Exercício hoje: ${userContext?.hoje?.exercicio_min || 0}min
- Humor hoje: ${userContext?.hoje?.humor ? userContext.hoje.humor + '/10' : 'não registrado'}
- Sono: ${userContext?.hoje?.sono_horas ? userContext.hoje.sono_horas + 'h' : 'não registrado'}
${anamneseInfo}
${sintomasInfo}

REGRAS DE FORMATAÇÃO WHATSAPP:
1. Use *negrito* para destaques importantes
2. Use _itálico_ para ênfases suaves
3. Mantenha respostas CURTAS (2-5 linhas por bloco)
4. Emojis moderadamente - não exagere

REGRAS DE COMPORTAMENTO:
1. Seja conversacional, use gírias leves brasileiras
2. Seja PROATIVO: use as tools automaticamente quando detectar algo relevante
3. Se o usuário perguntar "o que comi hoje?", use get_food_history
4. Se mencionar peso (ex: "pesei 70kg"), use register_weight automaticamente
5. Se descrever refeição, use register_meal_from_description
6. Se perguntar sobre anamnese/histórico médico, use get_user_anamnesis
7. Se mencionar DOR ou SINTOMA, use register_pain_symptom IMEDIATAMENTE
8. Se perguntar sobre sintomas passados, use get_symptom_history

IMPORTANTE: Responda SEMPRE em português brasileiro coloquial e natural.
IMPORTANTE: Use a personalidade apropriada (nutrição=Sofia, saúde=Dr.Vital, dor/sintoma=Dr.Vital)`;
}

// ============ HANDLER PRINCIPAL ============

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, message, conversationHistory = [], isFirstMessage = false } = await req.json();

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: "userId e message são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[AI Assistant] Mensagem de ${userId}: ${message} (isFirstMessage: ${isFirstMessage})`);

    // Buscar dados do usuário com campos corretos
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, current_weight")
      .eq("user_id", userId)
      .maybeSingle();

    const userName = profile?.full_name?.split(' ')[0] || "Querido(a)";

    // Buscar status atual (já inclui peso correto de weight_measurements)
    const statusResult = await executeTool(userId, "get_user_status", {});
    let userContext = {};
    try {
      userContext = JSON.parse(statusResult);
    } catch {}

    // 🔥 NOVO: Buscar anamnese para contexto completo
    const { data: anamnesisData } = await supabase
      .from("user_anamnesis")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // 🔥 NOVO: Buscar histórico de sintomas recentes
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: symptomHistory } = await supabase
      .from("advanced_daily_tracking")
      .select("tracking_date, pain_level, pain_location, symptoms")
      .eq("user_id", userId)
      .gte("tracking_date", thirtyDaysAgo.toISOString().split('T')[0])
      .not("pain_location", "is", null)
      .order("tracking_date", { ascending: false })
      .limit(10);

    // Construir mensagens para IA com contexto completo
    const messages = [
      { role: "system", content: buildSystemPrompt(userName, userContext, anamnesisData, symptomHistory || [], isFirstMessage) },
      ...conversationHistory.slice(-10),
      { role: "user", content: message },
    ];

    // 🔥 USAR OPENAI GPT-4o PARA CONVERSAS HUMANIZADAS
    const aiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.85, // Um pouco mais alta para respostas mais naturais
        max_tokens: 800,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[AI Assistant] Erro na IA:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            response: "🙈 Estou um pouquinho ocupada agora! Me manda de novo em 1 minutinho?\n\n_Sofia 🥗_",
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

      const followUpResponse = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: followUpMessages,
          temperature: 0.85,
          max_tokens: 600,
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
