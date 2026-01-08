import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ReminderType = "weighing" | "water" | "missions" | "streak_risk";

// SOFIA - Voz para lembretes (carinhosa, sem cobrança)
const SOFIA_ASSINATURA = "Com carinho,\nSofia 💚\n_MaxNutrition_";

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
    
    let reminderType: ReminderType = "missions";
    try {
      const body = await req.json();
      reminderType = body?.type || "missions";
    } catch {
      // Default: missions
    }

    console.log(`💚 Sofia: Enviando lembretes carinhosos (${reminderType})`);

    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Buscar usuários com lembretes habilitados
    const { data: settingsRows, error: settingsError } = await supabase
      .from("user_notification_settings")
      .select("user_id, whatsapp_enabled, whatsapp_reminders")
      .eq("whatsapp_enabled", true)
      .eq("whatsapp_reminders", true);

    if (settingsError) {
      throw new Error(settingsError.message);
    }

    const eligibleUserIds = (settingsRows || []).map((s: any) => s.user_id).filter(Boolean);

    if (eligibleUserIds.length === 0) {
      console.log("📱 0 usuários com lembretes habilitados");
      return new Response(
        JSON.stringify({ success: true, type: reminderType, sent: 0, results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone")
      .in("user_id", eligibleUserIds)
      .not("phone", "is", null);

    if (usersError) throw new Error(usersError.message);

    const eligibleUsers = users || [];
    console.log(`📱 ${eligibleUsers.length} usuários com lembretes habilitados`);

    const results: any[] = [];

    for (const user of eligibleUsers) {
      try {
        const firstName = user.full_name?.split(" ")[0] || "você";
        let shouldSend = false;
        let reminderMessage = "";

        switch (reminderType) {
          case "weighing": {
            const { data: weights } = await supabase
              .from("weight_measurements")
              .select("id")
              .eq("user_id", user.user_id)
              .gte("measurement_date", sevenDaysAgo)
              .limit(1);

            if (!weights || weights.length === 0) {
              shouldSend = true;
              reminderMessage = `*${firstName}*, é dia de pesagem! ⚖️

Sua pesagem semanal está esperando por você! 💚

Pesar-se uma vez por semana ajuda você a:
📊 Acompanhar sua evolução real
🎯 Manter o foco nos seus objetivos
✨ Celebrar cada conquista

_Que tal registrar agora? Eu vou adorar ver seu progresso!_ 💪

${SOFIA_ASSINATURA}`;
            }
            break;
          }

          case "water": {
            const { data: waterData } = await supabase
              .from("water_tracking")
              .select("amount_ml")
              .eq("user_id", user.user_id)
              .eq("date", today);

            const totalWater = waterData?.reduce((sum, w) => sum + (w.amount_ml || 0), 0) || 0;
            const hour = new Date().getHours();

            if (hour >= 12 && totalWater < 1000) {
              shouldSend = true;
              reminderMessage = `*${firstName}*, um lembrete com carinho! 💧

Você bebeu ${(totalWater / 1000).toFixed(1)}L de água hoje.

Hidratação é essencial para:
⚡ Energia e disposição
✨ Pele saudável
🔥 Metabolismo ativo

_Que tal beber um copinho agora? Seu corpo agradece!_ 🥤

${SOFIA_ASSINATURA}`;
            }
            break;
          }

          case "missions": {
            const { data: mission } = await supabase
              .from("daily_mission_sessions")
              .select("is_completed, missions_completed")
              .eq("user_id", user.user_id)
              .eq("date", today)
              .maybeSingle();

            if (!mission || !mission.is_completed) {
              const completed = mission?.missions_completed || 0;
              shouldSend = true;
              
              if (completed > 0) {
                reminderMessage = `*${firstName}*, você está quase lá! 🎯

Você já completou ${completed} missão(ões) hoje. Falta pouquinho para fechar o dia!

Completar as missões:
🔥 Mantém seu streak
🏆 Ganha pontos e conquistas
📈 Te aproxima dos seus objetivos

_Eu acredito em você! Vamos finalizar juntos?_ 💪

${SOFIA_ASSINATURA}`;
              } else {
                reminderMessage = `*${firstName}*, suas missões estão te esperando! 🎯

Sei que nem sempre é fácil, mas cada pequeno passo conta.

Completar as missões diárias:
🔥 Constrói hábitos saudáveis
🏆 Desbloqueia conquistas
📈 Te mantém no caminho certo

_Sem pressa, no seu ritmo. Estou aqui torcendo por você!_ 💚

${SOFIA_ASSINATURA}`;
              }
            }
            break;
          }

          case "streak_risk": {
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

            if (streak >= 3 && (!todaySession || !todaySession.is_completed) && hour >= 20) {
              shouldSend = true;
              reminderMessage = `*${firstName}*, um carinho especial pra você! 🔥

Você está há *${streak} dias consecutivos* cuidando da sua saúde!

Isso é INCRÍVEL! Cada dia desses representa sua força e determinação. 💪

Suas missões de hoje ainda estão esperando... Seria uma pena perder esse progresso lindo.

_Mas ei, sem pressão! Se hoje não der, amanhã a gente recomeça juntos. Estou aqui!_ 💚

${SOFIA_ASSINATURA}`;
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
      voice: "Sofia",
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
