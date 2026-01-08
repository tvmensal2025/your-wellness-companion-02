import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mensagens personalizadas por refeição
const MEAL_MESSAGES: Record<string, { emoji: string; greeting: string; question: string }> = {
  breakfast: {
    emoji: "☀️",
    greeting: "Bom dia",
    question: "Já tomou café da manhã? Me conta ou manda uma foto!"
  },
  lunch: {
    emoji: "🍽️",
    greeting: "Boa tarde",
    question: "Hora do almoço! O que você comeu? Foto ou texto, tudo vale!"
  },
  snack: {
    emoji: "🍎",
    greeting: "E aí",
    question: "Lanchou algo? Me conta pra eu registrar!"
  },
  dinner: {
    emoji: "🌙",
    greeting: "Boa noite",
    question: "E o jantar? Foto ou conta pra mim!"
  }
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

    // Determinar qual refeição perguntar baseado no horário atual
    let targetMealType: string | null = null;
    let targetUserId: string | null = null;

    try {
      const body = await req.json();
      targetMealType = body?.mealType || null;
      targetUserId = body?.userId || null;
    } catch {
      // Execução via cron - determinar automaticamente
    }

    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const currentHour = brazilTime.getHours();
    const currentMinute = brazilTime.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    console.log(`🍽️ Sofia Nutrição: Verificando ${currentTime} (BR)`);

    // Buscar usuários com notificações de nutrição habilitadas
    let settingsQuery = supabase
      .from("user_notification_settings")
      .select("user_id, whatsapp_enabled, whatsapp_nutrition_enabled, whatsapp_nutrition_times")
      .eq("whatsapp_enabled", true)
      .eq("whatsapp_nutrition_enabled", true);

    if (targetUserId) {
      settingsQuery = settingsQuery.eq("user_id", targetUserId);
    }

    const { data: settingsRows, error: settingsError } = await settingsQuery;

    if (settingsError) {
      console.error("Erro ao buscar configurações:", settingsError);
      throw new Error(settingsError.message);
    }

    const eligibleUsers: Array<{ user_id: string; mealType: string }> = [];

    for (const settings of settingsRows || []) {
      const times = settings.whatsapp_nutrition_times as Record<string, string> || {
        breakfast: "08:00",
        lunch: "12:30",
        snack: "15:30",
        dinner: "19:30"
      };

      // Se foi especificado um tipo de refeição, usar esse
      if (targetMealType && MEAL_MESSAGES[targetMealType]) {
        eligibleUsers.push({ user_id: settings.user_id, mealType: targetMealType });
        continue;
      }

      // Verificar se está no horário de alguma refeição (margem de 15 minutos)
      for (const [mealType, mealTime] of Object.entries(times)) {
        const [mealHour, mealMinute] = (mealTime as string).split(':').map(Number);
        const mealTotalMinutes = mealHour * 60 + mealMinute;
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        
        // Margem de 15 minutos antes ou depois
        if (Math.abs(currentTotalMinutes - mealTotalMinutes) <= 15) {
          eligibleUsers.push({ user_id: settings.user_id, mealType });
          break; // Só uma refeição por vez
        }
      }
    }

    if (eligibleUsers.length === 0) {
      console.log("📱 0 usuários elegíveis no horário atual");
      return new Response(
        JSON.stringify({ success: true, processed: 0, sent: 0, results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar perfis dos usuários elegíveis
    const userIds = eligibleUsers.map(u => u.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone")
      .in("user_id", userIds)
      .not("phone", "is", null);

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    const results: any[] = [];

    for (const eligible of eligibleUsers) {
      const profile = profiles?.find(p => p.user_id === eligible.user_id);
      if (!profile?.phone) continue;

      try {
        const firstName = profile.full_name?.split(" ")[0] || "você";
        const mealConfig = MEAL_MESSAGES[eligible.mealType];

        // Verificar se já não foi perguntado sobre essa refeição hoje
        const today = new Date().toISOString().split('T')[0];
        const { data: existingQuestion } = await supabase
          .from("whatsapp_pending_nutrition")
          .select("id")
          .eq("user_id", eligible.user_id)
          .eq("meal_type", eligible.mealType)
          .gte("question_sent_at", `${today}T00:00:00`)
          .maybeSingle();

        if (existingQuestion) {
          console.log(`⏭️ ${firstName}: Já perguntado sobre ${eligible.mealType} hoje`);
          continue;
        }

        // Gerar mensagem personalizada
        const message = `*${firstName}*, ${mealConfig.greeting}! ${mealConfig.emoji}

${mealConfig.question}

_Responda com:_
📸 Uma foto da sua refeição
✍️ Ou descreva o que comeu

Com carinho,
Sofia 💚
_Instituto dos Sonhos_`;

        // Enviar mensagem via Evolution API
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
            delay: 1200,
          }),
        });

        const evolutionData = await evolutionResponse.json();

        // Registrar pergunta pendente
        await supabase.from("whatsapp_pending_nutrition").insert({
          user_id: eligible.user_id,
          meal_type: eligible.mealType,
          question_sent_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 horas
        });

        // Registrar log
        await supabase.from("whatsapp_evolution_logs").insert({
          user_id: eligible.user_id,
          phone: phone,
          message_type: `nutrition_${eligible.mealType}`,
          message_content: message,
          evolution_response: evolutionData,
          status: evolutionResponse.ok ? "sent" : "failed",
          error_message: evolutionResponse.ok ? null : JSON.stringify(evolutionData),
        });

        results.push({
          userId: eligible.user_id,
          name: profile.full_name,
          mealType: eligible.mealType,
          success: evolutionResponse.ok,
        });

        console.log(`✅ Pergunta de ${eligible.mealType} enviada para ${firstName}`);
        
        // Delay entre mensagens
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (userError) {
        console.error(`❌ Erro ao processar ${profile.full_name}:`, userError);
        results.push({
          userId: eligible.user_id,
          name: profile.full_name,
          success: false,
          error: userError instanceof Error ? userError.message : "Erro desconhecido",
        });
      }
    }

    console.log(`\n📊 Resumo: ${results.filter(r => r.success).length}/${results.length} perguntas enviadas`);

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
