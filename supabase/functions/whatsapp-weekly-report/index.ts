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
    
    // Aceitar userId opcional para envio manual
    let targetUserId: string | null = null;
    try {
      const body = await req.json();
      targetUserId = body?.userId || null;
    } catch {
      // Sem body = execução via cron
    }

    console.log("📊 Iniciando envio de relatórios semanais via WhatsApp...");

    // Calcular período da semana
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = today.toISOString().split("T")[0];

    // Buscar usuários elegíveis
    let query = supabase
      .from("profiles")
      .select(`
        user_id,
        full_name,
        phone,
        user_notification_settings!inner(
          whatsapp_enabled,
          whatsapp_weekly_report
        )
      `)
      .not("phone", "is", null);

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error("Erro ao buscar usuários:", usersError);
      throw usersError;
    }

    const eligibleUsers = users?.filter((u: any) => 
      u.user_notification_settings?.whatsapp_enabled && 
      u.user_notification_settings?.whatsapp_weekly_report
    ) || [];

    console.log(`📱 ${eligibleUsers.length} usuários elegíveis para relatório semanal`);

    const results: any[] = [];

    for (const user of eligibleUsers) {
      try {
        console.log(`\n👤 Processando relatório de: ${user.full_name}`);

        // Chamar a edge function dr-vital-weekly-report para gerar análise
        const { data: reportData, error: reportError } = await supabase.functions.invoke(
          "dr-vital-weekly-report",
          {
            body: {
              userId: user.user_id,
              weekStartDate: weekStartStr
            }
          }
        );

        if (reportError) {
          throw new Error(`Erro ao gerar relatório: ${reportError.message}`);
        }

        const report = reportData?.report;
        if (!report) {
          throw new Error("Relatório não gerado");
        }

        // Formatar mensagem do relatório
        const reportMessage = formatReportMessage(user.full_name, report, weekStartStr, weekEndStr);

        // Enviar mensagem via Evolution API
        const phone = formatPhone(user.phone);
        
        const evolutionResponse = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": EVOLUTION_API_KEY,
          },
          body: JSON.stringify({
            number: phone,
            text: reportMessage,
            delay: 2000,
          }),
        });

        const evolutionData = await evolutionResponse.json();

        // Registrar log
        await supabase.from("whatsapp_evolution_logs").insert({
          user_id: user.user_id,
          phone: phone,
          message_type: "weekly_report",
          message_content: reportMessage,
          evolution_response: evolutionData,
          status: evolutionResponse.ok ? "sent" : "failed",
          error_message: evolutionResponse.ok ? null : JSON.stringify(evolutionData),
        });

        results.push({
          userId: user.user_id,
          name: user.full_name,
          success: evolutionResponse.ok,
          healthScore: report.healthScore,
        });

        console.log(`✅ Relatório enviado para ${user.full_name} (Health Score: ${report.healthScore})`);

        // Delay entre envios
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (userError) {
        console.error(`❌ Erro ao processar ${user.full_name}:`, userError);
        results.push({
          userId: user.user_id,
          name: user.full_name,
          success: false,
          error: userError instanceof Error ? userError.message : "Erro desconhecido",
        });
      }
    }

    console.log(`\n📊 Resumo: ${results.filter(r => r.success).length}/${results.length} relatórios enviados`);

    return new Response(JSON.stringify({ 
      success: true, 
      processed: results.length,
      sent: results.filter(r => r.success).length,
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
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

function formatReportMessage(userName: string, report: any, weekStart: string, weekEnd: string): string {
  const firstName = userName?.split(" ")[0] || "Paciente";
  const data = report.data || {};
  
  // Health Score com emoji baseado no valor
  const healthScore = report.healthScore || 0;
  const scoreEmoji = healthScore >= 80 ? "🌟" : healthScore >= 60 ? "✨" : healthScore >= 40 ? "💪" : "🎯";
  
  // Formatação dos dados
  const weightChange = data.weight?.change 
    ? `${data.weight.change > 0 ? "+" : ""}${data.weight.change.toFixed(1)}kg`
    : "—";
  const weightEmoji = data.weight?.change < 0 ? "📉" : data.weight?.change > 0 ? "📈" : "➡️";
  
  const waterAvg = data.water?.average 
    ? `${(data.water.average / 1000).toFixed(1)}L/dia`
    : "—";
  const waterEmoji = (data.water?.average || 0) >= 2000 ? "✅" : "⚠️";
  
  const sleepAvg = data.sleep?.average 
    ? `${data.sleep.average.toFixed(1)}h/noite`
    : "—";
  const sleepEmoji = (data.sleep?.average || 0) >= 7 ? "✅" : "⚠️";
  
  const moodAvg = data.mood?.average 
    ? `${data.mood.average.toFixed(1)}/10`
    : "—";
  
  const exerciseDays = data.exercise?.days || 0;
  const exerciseMinutes = data.exercise?.totalMinutes || 0;
  const exerciseEmoji = exerciseDays >= 3 ? "✅" : "⚠️";
  
  const missionsCompleted = data.missions?.completed || 0;
  const streak = data.missions?.streak || 0;

  // Formatar data em PT-BR
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}`;
  };

  let message = `📊 *RELATÓRIO SEMANAL*
📅 ${formatDate(weekStart)} a ${formatDate(weekEnd)}

${scoreEmoji} *Health Score: ${healthScore}/100*

━━━━━━━━━━━━━━━━━━

⚖️ *Peso:* ${weightEmoji} ${weightChange}
💧 *Hidratação:* ${waterEmoji} ${waterAvg}
😴 *Sono:* ${sleepEmoji} ${sleepAvg}
😊 *Humor médio:* ${moodAvg}
🏃 *Exercícios:* ${exerciseEmoji} ${exerciseDays} dias (${exerciseMinutes}min)
🎯 *Missões:* ${missionsCompleted}/7 completadas`;

  if (streak > 0) {
    message += `\n🔥 *Streak:* ${streak} dias!`;
  }

  message += `\n\n━━━━━━━━━━━━━━━━━━`;

  // Adicionar análise do Dr. Vital (resumida)
  if (report.analysis) {
    // Pegar apenas os primeiros 500 caracteres da análise
    let analysisShort = report.analysis;
    if (analysisShort.length > 500) {
      analysisShort = analysisShort.substring(0, 497) + "...";
    }
    message += `\n\n🩺 *Dr. Vital:*\n${analysisShort}`;
  }

  // Adicionar recomendações (máx 3)
  if (report.recommendations && report.recommendations.length > 0) {
    message += `\n\n💡 *Recomendações:*`;
    report.recommendations.slice(0, 3).forEach((rec: string, i: number) => {
      // Limitar cada recomendação a 100 caracteres
      const shortRec = rec.length > 100 ? rec.substring(0, 97) + "..." : rec;
      message += `\n${i + 1}. ${shortRec}`;
    });
  }

  message += `\n\n━━━━━━━━━━━━━━━━━━
_Acesse o app para ver o relatório completo!_

Equipe Mission Health 💚`;

  return message;
}
