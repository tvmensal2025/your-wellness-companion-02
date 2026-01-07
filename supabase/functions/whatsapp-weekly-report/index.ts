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
      // Sem body = execução via cron
    }

    console.log("📊 Dr. Vital & Sofia: Iniciando envio de relatórios semanais...");

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = today.toISOString().split("T")[0];

    // Buscar usuários elegíveis
    let settingsQuery = supabase
      .from("user_notification_settings")
      .select("user_id, whatsapp_enabled, whatsapp_weekly_report")
      .eq("whatsapp_enabled", true)
      .eq("whatsapp_weekly_report", true);

    if (targetUserId) {
      settingsQuery = settingsQuery.eq("user_id", targetUserId);
    }

    const { data: settingsRows, error: settingsError } = await settingsQuery;

    if (settingsError) {
      throw new Error(settingsError.message);
    }

    const eligibleUserIds = (settingsRows || []).map((s: any) => s.user_id).filter(Boolean);

    if (eligibleUserIds.length === 0) {
      console.log("📱 0 usuários elegíveis");
      return new Response(
        JSON.stringify({ success: true, processed: 0, sent: 0, weekStart: weekStartStr, weekEnd: weekEndStr, results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let profilesQuery = supabase
      .from("profiles")
      .select("user_id, full_name, phone")
      .in("user_id", eligibleUserIds)
      .not("phone", "is", null);

    if (targetUserId) {
      profilesQuery = profilesQuery.eq("user_id", targetUserId);
    }

    const { data: users, error: usersError } = await profilesQuery;

    if (usersError) {
      throw new Error(usersError.message);
    }

    const eligibleUsers = users || [];
    console.log(`📱 ${eligibleUsers.length} usuários elegíveis`);

    const results: any[] = [];

    for (const user of eligibleUsers) {
      try {
        console.log(`\n👤 Processando relatório: ${user.full_name}`);

        // Gerar relatório via edge function
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

        // Formatar mensagem com DUPLA VOZ: Dr. Vital + Sofia
        const reportMessage = formatReportMessage(user.full_name, report, weekStartStr, weekEndStr);

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

        console.log(`✅ Relatório enviado: ${user.full_name} (Score: ${report.healthScore})`);
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (userError) {
        console.error(`❌ Erro: ${user.full_name}:`, userError);
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
  const firstName = userName?.split(" ")[0] || "você";
  const data = report.data || {};
  
  // Health Score
  const healthScore = report.healthScore || 0;
  const scoreEmoji = healthScore >= 80 ? "🌟" : healthScore >= 60 ? "✨" : healthScore >= 40 ? "💪" : "🎯";
  
  // Dados formatados
  const weightChange = data.weight?.change 
    ? `${data.weight.change > 0 ? "+" : ""}${data.weight.change.toFixed(1)}kg`
    : "—";
  const weightEmoji = data.weight?.change < 0 ? "📉" : data.weight?.change > 0 ? "📈" : "➡️";
  
  const waterAvg = data.water?.average 
    ? `${(data.water.average / 1000).toFixed(1)}L/dia`
    : "—";
  const waterEmoji = (data.water?.average || 0) >= 2000 ? "✅" : "💧";
  
  const sleepAvg = data.sleep?.average 
    ? `${data.sleep.average.toFixed(1)}h/noite`
    : "—";
  const sleepEmoji = (data.sleep?.average || 0) >= 7 ? "✅" : "😴";
  
  const moodAvg = data.mood?.average 
    ? `${data.mood.average.toFixed(1)}/10`
    : "—";
  
  const exerciseDays = data.exercise?.days || 0;
  const exerciseMinutes = data.exercise?.totalMinutes || 0;
  
  const missionsCompleted = data.missions?.completed || 0;
  const streak = data.missions?.streak || 0;

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}`;
  };

  // Mensagem com DUPLA VOZ
  let message = `*${firstName}*, aqui está seu resumo semanal! 📊

📅 _${formatDate(weekStart)} a ${formatDate(weekEnd)}_

━━━━━━━━━━━━━━━━

🩺 *Dr. Vital analisa:*

${scoreEmoji} *Health Score: ${healthScore}/100*

⚖️ Peso: ${weightEmoji} ${weightChange}
${waterEmoji} Hidratação: ${waterAvg}
${sleepEmoji} Sono: ${sleepAvg}
😊 Humor médio: ${moodAvg}
🏃 Exercícios: ${exerciseDays} dias (${exerciseMinutes}min)
🎯 Missões: ${missionsCompleted}/7`;

  if (streak > 0) {
    message += `\n🔥 Streak: ${streak} dias!`;
  }

  message += `\n\n━━━━━━━━━━━━━━━━`;

  // Análise resumida do Dr. Vital
  if (report.analysis) {
    let analysisShort = report.analysis;
    if (analysisShort.length > 300) {
      analysisShort = analysisShort.substring(0, 297) + "...";
    }
    message += `\n\n📋 *Análise:*\n${analysisShort}`;
  }

  // Mensagem da Sofia (motivacional)
  message += `\n\n━━━━━━━━━━━━━━━━

💚 *Sofia diz:*
`;

  if (healthScore >= 80) {
    message += `Você está arrasando! Seu compromisso com a saúde está dando resultados incríveis. Continue assim! ✨`;
  } else if (healthScore >= 60) {
    message += `Você está no caminho certo! Cada dia é uma oportunidade de cuidar ainda mais de você. Orgulho! 💪`;
  } else if (healthScore >= 40) {
    message += `Sei que nem sempre é fácil, mas você está tentando e isso é o que importa. Semana que vem será ainda melhor! 🌟`;
  } else {
    message += `Estou aqui com você, tá? Uma semana de cada vez. Pequenos passos fazem grandes jornadas. Vamos juntos! 🤝`;
  }

  // Recomendações (máx 2)
  if (report.recommendations && report.recommendations.length > 0) {
    message += `\n\n💡 *Foco da semana:*`;
    report.recommendations.slice(0, 2).forEach((rec: string, i: number) => {
      const shortRec = rec.length > 80 ? rec.substring(0, 77) + "..." : rec;
      message += `\n${i + 1}. ${shortRec}`;
    });
  }

  message += `\n\n━━━━━━━━━━━━━━━━

_Acesse o app para ver o relatório completo!_

Dr. Vital 🩺 & Sofia 💚
_Instituto dos Sonhos_`;

  return message;
}
