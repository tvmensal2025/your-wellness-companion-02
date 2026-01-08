import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      throw new Error("Evolution API não configurada");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let targetUserId: string | null = null;
    let targetDate: string | null = null;
    let consolidateOnly = false;
    
    try {
      const body = await req.json();
      targetUserId = body?.userId || null;
      targetDate = body?.date || null;
      consolidateOnly = body?.consolidateOnly || false;
    } catch {
      // Execução via cron
    }

    const today = targetDate || new Date().toISOString().split('T')[0];
    
    // 🔥 MODO CONSOLIDAÇÃO: Apenas atualiza o daily_nutrition_summary
    if (consolidateOnly && targetUserId) {
      console.log(`📊 Consolidando nutrição para ${targetUserId} em ${today}`);
      await consolidateDailyNutrition(supabase, targetUserId, today);
      return new Response(
        JSON.stringify({ success: true, consolidated: true, userId: targetUserId, date: today }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📊 Sofia: Gerando resumos nutricionais do dia ${today}`);

    // Buscar usuários com resumo diário habilitado
    let settingsQuery = supabase
      .from("user_notification_settings")
      .select("user_id, whatsapp_enabled, whatsapp_daily_summary_enabled")
      .eq("whatsapp_enabled", true)
      .eq("whatsapp_daily_summary_enabled", true);

    if (targetUserId) {
      settingsQuery = settingsQuery.eq("user_id", targetUserId);
    }

    const { data: settingsRows, error: settingsError } = await settingsQuery;

    if (settingsError) throw new Error(settingsError.message);

    const eligibleUserIds = (settingsRows || []).map(s => s.user_id);

    if (eligibleUserIds.length === 0) {
      console.log("📱 0 usuários elegíveis para resumo");
      return new Response(
        JSON.stringify({ success: true, processed: 0, sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar perfis
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone")
      .in("user_id", eligibleUserIds)
      .not("phone", "is", null);

    const results: any[] = [];

    for (const profile of profiles || []) {
      try {
        const firstName = profile.full_name?.split(" ")[0] || "você";

        // Buscar dados nutricionais do dia
        const { data: nutritionData } = await supabase
          .from("nutrition_tracking")
          .select("*")
          .eq("user_id", profile.user_id)
          .gte("date", today)
          .lte("date", today);

        // Buscar metas nutricionais
        const { data: goals } = await supabase
          .from("nutritional_goals")
          .select("*")
          .eq("user_id", profile.user_id)
          .eq("is_active", true)
          .maybeSingle();

        // Buscar dados do Google Fit
        const { data: fitData } = await supabase
          .from("google_fit_data")
          .select("calories, steps, water_intake_ml")
          .eq("user_id", profile.user_id)
          .eq("date", today)
          .maybeSingle();

        // Calcular totais
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        let totalWater = 0;
        const mealSummary: Record<string, number> = {
          breakfast: 0,
          lunch: 0,
          snack: 0,
          dinner: 0
        };

        for (const entry of nutritionData || []) {
          totalCalories += entry.calories || 0;
          totalProtein += entry.protein_g || 0;
          totalCarbs += entry.carbs_g || 0;
          totalFat += entry.fat_g || 0;
          totalWater += entry.water_ml || 0;
          
          if (entry.meal_type && mealSummary[entry.meal_type] !== undefined) {
            mealSummary[entry.meal_type] += entry.calories || 0;
          }
        }

        // Meta de calorias
        const calorieGoal = goals?.daily_calories || 2000;
        const waterGoal = goals?.daily_water_ml || 2000;
        
        // Calorias queimadas (Google Fit)
        const caloriesBurned = fitData?.calories || 0;
        const steps = fitData?.steps || 0;
        const waterFromFit = fitData?.water_intake_ml || 0;
        totalWater += waterFromFit;

        // Calcular saldo calórico
        const calorieBalance = caloriesBurned - totalCalories;

        // Gerar emojis de status
        const calorieStatus = totalCalories >= calorieGoal * 0.9 && totalCalories <= calorieGoal * 1.1 
          ? "✅" : totalCalories < calorieGoal * 0.8 ? "⚠️" : "🔥";
        const waterStatus = totalWater >= waterGoal * 0.8 ? "✅" : "⚠️";

        // Montar mensagem
        let message = `*${firstName}*, seu dia alimentar! 📊\n\n`;
        
        if (mealSummary.breakfast > 0) message += `☕ Café: ${Math.round(mealSummary.breakfast)} kcal\n`;
        if (mealSummary.lunch > 0) message += `🍛 Almoço: ${Math.round(mealSummary.lunch)} kcal\n`;
        if (mealSummary.snack > 0) message += `🍎 Lanche: ${Math.round(mealSummary.snack)} kcal\n`;
        if (mealSummary.dinner > 0) message += `🌙 Jantar: ${Math.round(mealSummary.dinner)} kcal\n`;
        
        message += `\n📊 *Resumo*\n`;
        message += `${calorieStatus} Calorias: ${Math.round(totalCalories)} / ${calorieGoal} kcal\n`;
        message += `${waterStatus} Água: ${(totalWater / 1000).toFixed(1)}L / ${(waterGoal / 1000).toFixed(1)}L\n`;
        message += `🥩 Proteína: ${Math.round(totalProtein)}g\n`;
        
        if (caloriesBurned > 0) {
          message += `\n🏃 *Atividade (Google Fit)*\n`;
          message += `🔥 Queimou: ${Math.round(caloriesBurned)} kcal\n`;
          message += `👟 Passos: ${steps.toLocaleString()}\n`;
          message += `⚖️ Saldo: ${calorieBalance > 0 ? '-' : '+'}${Math.abs(Math.round(calorieBalance))} kcal\n`;
        }

        // Mensagem motivacional
        if (totalCalories === 0) {
          message += `\n💭 Não registrei refeições hoje. Lembre-se de me contar o que comeu amanhã!\n`;
        } else if (calorieBalance < -300) {
          message += `\n🎯 Ótimo déficit calórico! Continue assim para alcançar seus objetivos!\n`;
        } else if (calorieBalance > 300) {
          message += `\n💪 Dia com mais energia! Amanhã equilibramos com uma caminhada!\n`;
        } else {
        message += `\n✨ Dia equilibrado! Você está no caminho certo!\n`;
        }

        message += `\nCom carinho,\nSofia 💚\n_MaxNutrition_`;

        // Enviar mensagem
        const phone = formatPhone(profile.phone);
        
        const evolutionResponse = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": EVOLUTION_API_KEY,
          },
          body: JSON.stringify({
            number: phone,
            text: message,
            delay: 1500,
          }),
        });

        const evolutionData = await evolutionResponse.json();

        // Registrar log
        await supabase.from("whatsapp_evolution_logs").insert({
          user_id: profile.user_id,
          phone: phone,
          message_type: "nutrition_daily_summary",
          message_content: message,
          evolution_response: evolutionData,
          status: evolutionResponse.ok ? "sent" : "failed",
        });

        results.push({
          userId: profile.user_id,
          name: profile.full_name,
          success: evolutionResponse.ok,
          totalCalories,
          calorieBalance
        });

        console.log(`✅ Resumo enviado para ${firstName}: ${totalCalories} kcal`);
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (userError) {
        console.error(`❌ Erro ao processar ${profile.full_name}:`, userError);
        results.push({
          userId: profile.user_id,
          name: profile.full_name,
          success: false,
          error: userError instanceof Error ? userError.message : "Erro"
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: results.length,
      sent: results.filter(r => r.success).length,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Erro geral:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith("55")) cleaned = "55" + cleaned;
  return cleaned;
}

// 🔥 FUNÇÃO DE CONSOLIDAÇÃO DIÁRIA
async function consolidateDailyNutrition(supabase: any, userId: string, date: string): Promise<void> {
  try {
    // Buscar todas as refeições do dia de food_history
    const { data: meals, error } = await supabase
      .from("food_history")
      .select("*")
      .eq("user_id", userId)
      .eq("meal_date", date);

    if (error) {
      console.error("[Consolidation] Erro ao buscar refeições:", error);
      return;
    }

    if (!meals || meals.length === 0) {
      console.log(`[Consolidation] Nenhuma refeição encontrada para ${userId} em ${date}`);
      return;
    }

    // Agrupar por tipo de refeição
    const byType: Record<string, any[]> = {
      cafe_da_manha: [],
      lanche_manha: [],
      almoco: [],
      lanche_tarde: [],
      jantar: [],
      ceia: [],
    };

    for (const meal of meals) {
      const type = meal.meal_type || "almoco";
      if (byType[type]) {
        byType[type].push(meal);
      }
    }

    // Função auxiliar para somar
    const sum = (arr: any[], field: string) => 
      arr.reduce((s, m) => s + (Number(m[field]) || 0), 0);

    // Calcular totais
    const summary = {
      user_id: userId,
      date: date,
      meals_count: meals.length,
      
      // Totais do dia
      total_calories: sum(meals, 'total_calories'),
      total_proteins: sum(meals, 'total_proteins'),
      total_carbs: sum(meals, 'total_carbs'),
      total_fats: sum(meals, 'total_fats'),
      total_fiber: sum(meals, 'total_fiber'),
      total_water_ml: sum(meals, 'water_ml') || null,
      
      // Por refeição
      breakfast_calories: sum(byType.cafe_da_manha, 'total_calories'),
      lunch_calories: sum(byType.almoco, 'total_calories'),
      dinner_calories: sum(byType.jantar, 'total_calories'),
      snacks_calories: sum([...byType.lanche_manha, ...byType.lanche_tarde, ...byType.ceia], 'total_calories'),
      
      // Health score baseado em balanço de macros
      health_score: calculateHealthScore(meals),
      
      updated_at: new Date().toISOString(),
    };

    // Upsert no daily_nutrition_summary
    const { error: upsertError } = await supabase
      .from("daily_nutrition_summary")
      .upsert(summary, { onConflict: "user_id,date" });

    if (upsertError) {
      console.error("[Consolidation] Erro ao salvar resumo:", upsertError);
    } else {
      console.log(`[Consolidation] ✅ Resumo consolidado: ${summary.total_calories} kcal, ${meals.length} refeições`);
    }
  } catch (e) {
    console.error("[Consolidation] Erro:", e);
  }
}

// Calcular health score simples baseado em macros
function calculateHealthScore(meals: any[]): number {
  if (!meals || meals.length === 0) return 0;
  
  const totals = {
    protein: meals.reduce((s, m) => s + (Number(m.total_proteins) || 0), 0),
    carbs: meals.reduce((s, m) => s + (Number(m.total_carbs) || 0), 0),
    fats: meals.reduce((s, m) => s + (Number(m.total_fats) || 0), 0),
    fiber: meals.reduce((s, m) => s + (Number(m.total_fiber) || 0), 0),
    calories: meals.reduce((s, m) => s + (Number(m.total_calories) || 0), 0),
  };
  
  let score = 50; // Base score
  
  // Proteína adequada (+15)
  if (totals.protein >= 50 && totals.protein <= 150) score += 15;
  
  // Fibra adequada (+10)
  if (totals.fiber >= 20) score += 10;
  
  // Carboidratos moderados (+10)
  const carbRatio = totals.carbs / Math.max(totals.calories / 4, 1);
  if (carbRatio >= 0.4 && carbRatio <= 0.6) score += 10;
  
  // Gordura moderada (+10)
  const fatRatio = totals.fats / Math.max(totals.calories / 9, 1);
  if (fatRatio >= 0.2 && fatRatio <= 0.35) score += 10;
  
  // Número de refeições adequado (+5)
  if (meals.length >= 3 && meals.length <= 6) score += 5;
  
  return Math.min(100, Math.max(0, score));
}
