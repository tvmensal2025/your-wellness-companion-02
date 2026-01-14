import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      throw new Error("Evolution API não configurada");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Sem body = execução via cron
    }

    const targetUserId = body?.userId || null;
    const action = body?.action || 'send-weekly-report';
    
    // Se for apenas gerar dados para cards (sem enviar)
    if (action === 'generate-card-data') {
      return await generateCardData(supabase, body.userId, LOVABLE_API_KEY);
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

        // Gerar relatório do Dr. Vital
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

        // Gerar análise da Sofia (nutrição)
        const sofiaAnalysis = await generateSofiaAnalysis(
          supabase, 
          user.user_id, 
          user.full_name, 
          weekStartStr, 
          weekEndStr,
          LOVABLE_API_KEY
        );

        // Formatar mensagem com DUPLA VOZ: Dr. Vital + Sofia
        const reportMessage = formatReportMessage(user.full_name, report, sofiaAnalysis, weekStartStr, weekEndStr);

        const phone = formatPhone(user.phone);
        
        // Enviar mensagem principal
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
          nutritionScore: sofiaAnalysis.nutritionScore,
        });

        console.log(`✅ Relatório enviado: ${user.full_name} (Health: ${report.healthScore}, Nutrição: ${sofiaAnalysis.nutritionScore})`);
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

// Gerar dados para cards (chamado pelo frontend para gerar PNGs)
async function generateCardData(supabase: any, userId: string, lovableApiKey: string | undefined) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 7);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = today.toISOString().split("T")[0];

  // Buscar perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", userId)
    .single();

  // Gerar relatório Dr. Vital
  const { data: reportData } = await supabase.functions.invoke("dr-vital-weekly-report", {
    body: { userId, weekStartDate: weekStartStr }
  });

  const report = reportData?.report;

  // Gerar análise Sofia
  const sofiaAnalysis = await generateSofiaAnalysis(
    supabase, 
    userId, 
    profile?.full_name || 'Usuário',
    weekStartStr, 
    weekEndStr,
    lovableApiKey
  );

  return new Response(JSON.stringify({
    success: true,
    drVital: {
      userName: profile?.full_name || 'Usuário',
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      healthScore: report?.healthScore || 0,
      analysis: report?.analysis || '',
      recommendations: report?.recommendations || [],
      data: report?.data || {}
    },
    sofia: {
      userName: profile?.full_name || 'Usuário',
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      nutritionScore: sofiaAnalysis.nutritionScore,
      analysis: sofiaAnalysis.analysis,
      recommendations: sofiaAnalysis.recommendations,
      data: sofiaAnalysis.data
    }
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

// Gerar análise nutricional da Sofia
async function generateSofiaAnalysis(
  supabase: any, 
  userId: string, 
  userName: string,
  weekStart: string, 
  weekEnd: string,
  lovableApiKey: string | undefined
) {
  console.log("🥗 Sofia: Gerando análise nutricional...");
  
  const nutritionData = {
    mealsCount: 0,
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFats: 0,
    waterAverage: 0,
    topFoods: [] as string[]
  };

  try {
    // Buscar dados de nutrição
    const { data: nutritionSummary } = await supabase
      .from("daily_nutrition_summary")
      .select("*")
      .eq("user_id", userId)
      .gte("date", weekStart)
      .lte("date", weekEnd);

    if (nutritionSummary && nutritionSummary.length > 0) {
      nutritionData.mealsCount = nutritionSummary.reduce((sum: number, d: any) => sum + (d.meals_count || 0), 0);
      nutritionData.avgCalories = Math.round(
        nutritionSummary.reduce((sum: number, d: any) => sum + (d.total_calories || 0), 0) / nutritionSummary.length
      );
      nutritionData.avgProtein = Math.round(
        nutritionSummary.reduce((sum: number, d: any) => sum + (d.total_proteins || 0), 0) / nutritionSummary.length
      );
      nutritionData.avgCarbs = Math.round(
        nutritionSummary.reduce((sum: number, d: any) => sum + (d.total_carbs || 0), 0) / nutritionSummary.length
      );
      nutritionData.avgFats = Math.round(
        nutritionSummary.reduce((sum: number, d: any) => sum + (d.total_fats || 0), 0) / nutritionSummary.length
      );
    }

    // Buscar dados de água
    const { data: waterData } = await supabase
      .from("water_tracking")
      .select("amount_ml, date")
      .eq("user_id", userId)
      .gte("date", weekStart)
      .lte("date", weekEnd);

    if (waterData && waterData.length > 0) {
      const dailyTotals: Record<string, number> = {};
      waterData.forEach((entry: any) => {
        if (!dailyTotals[entry.date]) dailyTotals[entry.date] = 0;
        dailyTotals[entry.date] += entry.amount_ml;
      });
      const dailyValues = Object.values(dailyTotals);
      nutritionData.waterAverage = Math.round(
        dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length
      );
    }

  } catch (error) {
    console.log("⚠️ Erro ao buscar dados de nutrição:", error);
  }

  // Calcular score nutricional
  let nutritionScore = 50;
  if (nutritionData.avgCalories >= 1500 && nutritionData.avgCalories <= 2500) nutritionScore += 15;
  if (nutritionData.avgProtein >= 50) nutritionScore += 10;
  if (nutritionData.waterAverage >= 2000) nutritionScore += 15;
  if (nutritionData.mealsCount >= 14) nutritionScore += 10;
  nutritionScore = Math.min(100, nutritionScore);

  // Gerar análise com IA
  let analysis = '';
  let recommendations: string[] = [];

  const sofiaPrompt = `
Você é a Sofia, nutricionista pessoal que acompanha ${userName} há meses. Você conhece as preferências alimentares e o histórico nutricional do paciente.

DADOS NUTRICIONAIS DA SEMANA (${weekStart} a ${weekEnd}):
- Refeições registradas: ${nutritionData.mealsCount}
- Calorias médias: ${nutritionData.avgCalories} kcal/dia
- Proteínas: ${nutritionData.avgProtein}g/dia
- Carboidratos: ${nutritionData.avgCarbs}g/dia
- Gorduras: ${nutritionData.avgFats}g/dia
- Hidratação média: ${(nutritionData.waterAverage / 1000).toFixed(1)}L/dia
- Score Nutricional: ${nutritionScore}/100

INSTRUÇÕES:
1. Fale como nutricionista pessoal que conhece o paciente há tempo
2. Seja carinhosa, acolhedora e motivadora
3. Analise os padrões alimentares baseado nos dados
4. Elogie os pontos positivos PRIMEIRO
5. Sugira melhorias de forma gentil e prática
6. Dê 3 dicas específicas para próxima semana
7. Seja breve - máximo 200 palavras
8. NÃO use formato de lista na análise principal, apenas nas dicas

Formato:
ANÁLISE: [2-3 frases sobre a semana nutricional]
DICAS:
1. [dica prática]
2. [dica prática]
3. [dica prática]`;

  if (lovableApiKey) {
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Você é a Sofia, uma nutricionista carinhosa e motivadora." },
            { role: "user", content: sofiaPrompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse response
        const analysisMatch = content.match(/ANÁLISE:\s*([\s\S]*?)(?=DICAS:|$)/i);
        if (analysisMatch) {
          analysis = analysisMatch[1].trim();
        }
        
        const tipsMatch = content.match(/DICAS:\s*([\s\S]*)/i);
        if (tipsMatch) {
          recommendations = tipsMatch[1]
            .split(/\d+\./)
            .filter((t: string) => t.trim())
            .map((t: string) => t.trim())
            .slice(0, 3);
        }
        
        console.log("✅ Análise da Sofia gerada com sucesso");
      }
    } catch (error) {
      console.log("⚠️ Erro na análise Sofia:", error);
    }
  }

  // Fallback
  if (!analysis) {
    analysis = `${userName.split(' ')[0]}, analisando sua semana nutricional, vi que você registrou ${nutritionData.mealsCount} refeições. Sua hidratação média foi de ${(nutritionData.waterAverage / 1000).toFixed(1)}L por dia. Continue focando em uma alimentação equilibrada e consciente!`;
    recommendations = [
      "Mantenha hidratação de pelo menos 2L de água por dia",
      "Inclua mais proteínas em cada refeição principal",
      "Registre todas as suas refeições para um acompanhamento melhor"
    ];
  }

  return {
    nutritionScore,
    analysis,
    recommendations,
    data: nutritionData
  };
}

function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith("55")) cleaned = "55" + cleaned;
  return cleaned;
}

function formatReportMessage(
  userName: string, 
  report: any, 
  sofiaAnalysis: { nutritionScore: number; analysis: string; recommendations: string[] },
  weekStart: string, 
  weekEnd: string
): string {
  const firstName = userName?.split(" ")[0] || "você";
  const data = report.data || {};
  
  // Health Score
  const healthScore = report.healthScore || 0;
  const scoreEmoji = healthScore >= 80 ? "🌟" : healthScore >= 60 ? "✨" : healthScore >= 40 ? "💪" : "🎯";
  
  // Nutrition Score
  const nutritionScore = sofiaAnalysis.nutritionScore || 0;
  const nutriEmoji = nutritionScore >= 80 ? "🌟" : nutritionScore >= 60 ? "💚" : nutritionScore >= 40 ? "🌱" : "🍀";
  
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

  // Mensagem PREMIUM com DUPLA VOZ
  let message = `🏆 *RELATÓRIO SEMANAL PREMIUM*
━━━━━━━━━━━━━━━━━━━━

Olá, *${firstName}*! 👋

📅 _${formatDate(weekStart)} a ${formatDate(weekEnd)}_

━━━━━━━━━━━━━━━━━━━━

🩺 *DR. VITAL ANALISA:*

${scoreEmoji} *Health Score: ${healthScore}/100*

📊 *Seus números da semana:*
⚖️ Peso: ${weightEmoji} ${weightChange}
${waterEmoji} Hidratação: ${waterAvg}
${sleepEmoji} Sono: ${sleepAvg}
😊 Humor: ${moodAvg}
🏃 Exercícios: ${exerciseDays} dias (${exerciseMinutes}min)
🎯 Missões: ${missionsCompleted}/7`;

  if (streak > 0) {
    message += `\n🔥 Streak: ${streak} dias consecutivos!`;
  }

  // Análise do Dr. Vital
  if (report.analysis) {
    let analysisShort = report.analysis;
    if (analysisShort.length > 350) {
      analysisShort = analysisShort.substring(0, 347) + "...";
    }
    message += `\n\n📋 *Análise Médica:*\n${analysisShort}`;
  }

  message += `\n\n━━━━━━━━━━━━━━━━━━━━

🥗 *SOFIA - SUA NUTRICIONISTA:*

${nutriEmoji} *Score Nutricional: ${nutritionScore}/100*`;

  // Análise da Sofia
  if (sofiaAnalysis.analysis) {
    message += `\n\n${sofiaAnalysis.analysis}`;
  }

  // Dicas da Sofia
  if (sofiaAnalysis.recommendations && sofiaAnalysis.recommendations.length > 0) {
    message += `\n\n🌱 *Dicas para esta semana:*`;
    sofiaAnalysis.recommendations.slice(0, 3).forEach((rec, i) => {
      const shortRec = rec.length > 80 ? rec.substring(0, 77) + "..." : rec;
      message += `\n${i + 1}. ${shortRec}`;
    });
  }

  // Recomendações do Dr. Vital (máx 2)
  if (report.recommendations && report.recommendations.length > 0) {
    message += `\n\n💡 *Foco da semana (Dr. Vital):*`;
    report.recommendations.slice(0, 2).forEach((rec: string, i: number) => {
      const shortRec = rec.length > 80 ? rec.substring(0, 77) + "..." : rec;
      message += `\n${i + 1}. ${shortRec}`;
    });
  }

  message += `\n\n━━━━━━━━━━━━━━━━━━━━

✨ _Você está evoluindo!_
_Acesse o app para ver o relatório completo._

🩺 *Dr. Vital* & 💚 *Sofia*
_MaxNutrition_`;

  return message;
}
