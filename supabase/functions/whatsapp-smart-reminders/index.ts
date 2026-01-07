import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ReminderType = "weighing" | "water" | "missions" | "streak_risk";

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
    
    // Tipo de lembrete a enviar
    let reminderType: ReminderType = "missions";
    try {
      const body = await req.json();
      reminderType = body?.type || "missions";
    } catch {
      // Default: missions
    }

    console.log(`🔔 Iniciando lembretes inteligentes: ${reminderType}`);

    const today = new Date().toISOString().split("T")[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Buscar usuários com lembretes habilitados
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select(`
        user_id,
        full_name,
        phone,
        user_notification_settings!inner(
          whatsapp_enabled,
          whatsapp_reminders
        )
      `)
      .not("phone", "is", null);

    if (usersError) throw usersError;

    const eligibleUsers = users?.filter((u: any) => 
      u.user_notification_settings?.whatsapp_enabled && 
      u.user_notification_settings?.whatsapp_reminders
    ) || [];

    console.log(`📱 ${eligibleUsers.length} usuários com lembretes habilitados`);

    const results: any[] = [];

    for (const user of eligibleUsers) {
      try {
        let shouldSend = false;
        let reminderMessage = "";

        switch (reminderType) {
          case "weighing": {
            // Verificar se pesou nos últimos 2 dias
            const { data: weights } = await supabase
              .from("weight_measurements")
              .select("id")
              .eq("user_id", user.user_id)
              .gte("measurement_date", twoDaysAgo)
              .limit(1);

            if (!weights || weights.length === 0) {
              shouldSend = true;
              reminderMessage = `⚖️ Olá, ${user.full_name?.split(" ")[0]}!

Notei que você não registrou seu peso nos últimos 2 dias.

Pesar-se regularmente ajuda a acompanhar sua evolução e manter o foco nos seus objetivos! 📊

_Que tal pesar agora e registrar no app?_ 💪`;
            }
            break;
          }

          case "water": {
            // Verificar consumo de água hoje
            const { data: waterData } = await supabase
              .from("water_tracking")
              .select("amount_ml")
              .eq("user_id", user.user_id)
              .eq("date", today);

            const totalWater = waterData?.reduce((sum, w) => sum + (w.amount_ml || 0), 0) || 0;

            // Se bebeu menos de 1L até as 14h, lembrar
            const hour = new Date().getHours();
            if (hour >= 12 && totalWater < 1000) {
              shouldSend = true;
              reminderMessage = `💧 Ei, ${user.full_name?.split(" ")[0]}!

Você bebeu apenas ${(totalWater / 1000).toFixed(1)}L de água hoje.

Lembre-se: a hidratação é essencial para:
• Energia e disposição ⚡
• Pele saudável ✨
• Metabolismo ativo 🔥

_Que tal beber um copo agora?_ 🥤`;
            }
            break;
          }

          case "missions": {
            // Verificar se completou missões hoje
            const { data: mission } = await supabase
              .from("daily_mission_sessions")
              .select("is_completed, missions_completed")
              .eq("user_id", user.user_id)
              .eq("date", today)
              .maybeSingle();

            if (!mission || !mission.is_completed) {
              const completed = mission?.missions_completed || 0;
              shouldSend = true;
              reminderMessage = `🎯 ${user.full_name?.split(" ")[0]}, suas missões estão esperando!

${completed > 0 ? `Você completou ${completed} missão(ões) hoje. Falta pouco para concluir todas!` : "Você ainda não iniciou suas missões de hoje."}

Completar as missões diárias:
• Aumenta seu streak 🔥
• Ganha pontos e conquistas 🏆
• Mantém você no caminho certo 📈

_Acesse o app e complete suas missões!_ 💪`;
            }
            break;
          }

          case "streak_risk": {
            // Verificar se está em risco de perder streak
            const { data: yesterday } = await supabase
              .from("daily_mission_sessions")
              .select("streak_days")
              .eq("user_id", user.user_id)
              .lt("date", today)
              .order("date", { ascending: false })
              .limit(1)
              .maybeSingle();

            const { data: todaySession } = await supabase
              .from("daily_mission_sessions")
              .select("is_completed")
              .eq("user_id", user.user_id)
              .eq("date", today)
              .maybeSingle();

            const streak = yesterday?.streak_days || 0;
            const hour = new Date().getHours();

            // Se tem streak > 3 e não completou hoje e já são 20h+
            if (streak >= 3 && (!todaySession || !todaySession.is_completed) && hour >= 20) {
              shouldSend = true;
              reminderMessage = `🔥 ALERTA DE STREAK, ${user.full_name?.split(" ")[0]}!

Você está há ${streak} dias consecutivos cuidando da sua saúde!

⚠️ Suas missões de hoje ainda não foram completadas.

Não deixe esse progresso incrível se perder! Cada dia conta para construir hábitos duradouros.

_Acesse agora e mantenha sua sequência!_ 🏃‍♂️`;
            }
            break;
          }
        }

        if (shouldSend && reminderMessage) {
          const phone = formatPhone(user.phone);
          
          const evolutionResponse = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": EVOLUTION_API_KEY,
            },
            body: JSON.stringify({
              number: phone,
              text: reminderMessage,
              delay: 1500,
            }),
          });

          const evolutionData = await evolutionResponse.json();

          await supabase.from("whatsapp_evolution_logs").insert({
            user_id: user.user_id,
            phone: phone,
            message_type: `reminder_${reminderType}`,
            message_content: reminderMessage,
            evolution_response: evolutionData,
            status: evolutionResponse.ok ? "sent" : "failed",
          });

          results.push({
            userId: user.user_id,
            name: user.full_name,
            type: reminderType,
            sent: true,
          });

          console.log(`✅ Lembrete enviado: ${user.full_name} (${reminderType})`);
          
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (userError) {
        console.error(`❌ Erro: ${user.full_name}:`, userError);
      }
    }

    console.log(`\n📊 ${results.length} lembretes enviados`);

    return new Response(JSON.stringify({ 
      success: true, 
      type: reminderType,
      sent: results.length,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Erro:", error);
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
