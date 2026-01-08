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
    try {
      const body = await req.json();
      targetUserId = body?.userId || null;
    } catch {
      // Execução via cron
    }

    const today = new Date().toISOString().split('T')[0];
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

        message += `\nCom carinho,\nSofia 💚\n_Instituto dos Sonhos_`;

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
