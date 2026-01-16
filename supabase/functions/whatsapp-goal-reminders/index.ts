import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    console.log("🎯 Processando lembretes de metas...");

    const now = new Date();
    const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1-7 (seg-dom)
    const currentDayOfMonth = now.getDate();

    // Buscar metas ativas com lembretes habilitados via user_goals
    const { data: goalsWithReminders, error: goalsError } = await supabase
      .from("user_goals")
      .select(`
        id,
        user_id,
        title,
        target_value,
        current_value,
        unit,
        status,
        reminder_enabled,
        reminder_frequency,
        reminder_day,
        last_reminder_sent
      `)
      .eq("reminder_enabled", true)
      .eq("status", "ativa");

    if (goalsError) {
      throw new Error(`Erro ao buscar metas: ${goalsError.message}`);
    }

    console.log(`📋 ${goalsWithReminders?.length || 0} metas com lembretes encontradas`);

    const results: any[] = [];
    const today = now.toISOString().split("T")[0];

    for (const goal of goalsWithReminders || []) {
      try {
        // Verificar se deve enviar hoje
        const shouldSendToday = checkShouldSend(
          goal.reminder_frequency || 'daily',
          goal.reminder_day,
          currentDayOfWeek,
          currentDayOfMonth,
          goal.last_reminder_sent,
          today
        );

        if (!shouldSendToday) {
          continue;
        }

        // Não enviar se meta já concluída
        if (goal.status === "concluida") {
          continue;
        }

        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("user_id", goal.user_id)
          .single();

        if (!profile?.phone) {
          console.log(`⚠️ Usuário sem telefone: ${goal.user_id}`);
          continue;
        }

        // Verificar configurações de notificação
        const { data: settings } = await supabase
          .from("user_notification_settings")
          .select("whatsapp_enabled")
          .eq("user_id", goal.user_id)
          .single();

        if (!settings?.whatsapp_enabled) {
          continue;
        }

        const firstName = profile.full_name?.split(" ")[0] || "você";
        const progress = goal.target_value > 0 
          ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
          : 0;
        // Gerar mensagem personalizada
        const message = generateGoalReminderMessage(
          firstName,
          goal.title,
          goal.current_value,
          goal.target_value,
          goal.unit,
          progress
        );

        // Enviar via WhatsApp
        const phone = formatPhone(profile.phone);
        
        const evolutionResponse = await fetch(
          `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
          {
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
          }
        );

        const evolutionData = await evolutionResponse.json();

        // Log da mensagem
        await supabase.from("whatsapp_evolution_logs").insert({
          user_id: goal.user_id,
          phone: phone,
          message_type: "goal_reminder",
          message_content: message,
          evolution_response: evolutionData,
          status: evolutionResponse.ok ? "sent" : "failed",
        });

        // Atualizar last_reminder_sent na meta
        await supabase
          .from("user_goals")
          .update({ last_reminder_sent: now.toISOString() })
          .eq("id", goal.id);

        results.push({
          userId: goal.user_id,
          goalId: goal.id,
          goalTitle: goal.title,
          sent: true,
        });

        console.log(`✅ Lembrete enviado: ${profile.full_name} - ${goal.title}`);
        
        // Delay entre mensagens
        await new Promise((resolve) => setTimeout(resolve, 2000));

      } catch (goalError) {
        console.error(`❌ Erro no lembrete ${goal.id}:`, goalError);
      }
    }

    console.log(`\n📊 ${results.length} lembretes de metas enviados`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function checkShouldSend(
  frequency: string,
  reminderDay: number | null,
  currentDayOfWeek: number,
  currentDayOfMonth: number,
  lastSentAt: string | null,
  today: string
): boolean {
  // Verificar se já enviou hoje
  if (lastSentAt) {
    const lastSentDate = lastSentAt.split("T")[0];
    if (lastSentDate === today) {
      return false;
    }
  }

  switch (frequency) {
    case "daily":
      return true;

    case "weekly":
      return reminderDay === currentDayOfWeek;

    case "monthly":
      return reminderDay === currentDayOfMonth;

    default:
      return false;
  }
}

function generateGoalReminderMessage(
  firstName: string,
  title: string,
  currentValue: number,
  targetValue: number,
  unit: string,
  progress: number
): string {
  let motivationalText = "";

  if (progress === 0) {
    motivationalText = "_Que tal dar o primeiro passo hoje? Estou torcendo por você!_";
  } else if (progress < 25) {
    motivationalText = "_Você já começou! Continue assim, cada passo conta!_";
  } else if (progress < 50) {
    motivationalText = "_Você está avançando muito bem! Metade do caminho está logo ali!_";
  } else if (progress < 75) {
    motivationalText = "_Mais da metade concluída! Você está arrasando!_";
  } else if (progress < 100) {
    motivationalText = "_Você está tão perto! Só mais um pouquinho!_";
  } else {
    motivationalText = "_Você conseguiu! Parabéns pela conquista!_ 🎉";
  }

  const progressBar = generateProgressBar(progress);

  return `*${firstName}*, lembrete da sua meta! 🎯

📌 *${title}*

${progressBar}
📊 Progresso: *${progress}%*

🎯 Meta: ${targetValue} ${unit}
✅ Atual: ${currentValue} ${unit}
📍 Faltam: ${Math.max(0, targetValue - currentValue)} ${unit}

${motivationalText}

${SOFIA_ASSINATURA}`;
}

function generateProgressBar(progress: number): string {
  const filled = Math.round(progress / 10);
  const empty = 10 - filled;
  return "▓".repeat(filled) + "░".repeat(empty);
}

function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith("55")) cleaned = "55" + cleaned;
  return cleaned;
}
