import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Saboteur descriptions for context
const saboteurInfo: Record<string, { name: string; defaultDesc: string }> = {
  critico: { name: "Crítico", defaultDesc: "Tendência a julgar a si mesmo e aos outros de forma severa." },
  insistente: { name: "Insistente", defaultDesc: "Necessidade de perfeição e controle excessivo." },
  prestativo: { name: "Prestativo", defaultDesc: "Foco excessivo em agradar os outros, negligenciando suas próprias necessidades." },
  hiperrealizador: { name: "Hiper-realizador", defaultDesc: "Busca constante por conquistas para validação pessoal." },
  vitima: { name: "Vítima", defaultDesc: "Tendência a se sentir injustiçado ou a buscar atenção através do sofrimento." },
  hiperracional: { name: "Hiper-racional", defaultDesc: "Foco excessivo em análise lógica, negligenciando emoções." },
  hipervigilante: { name: "Hipervigilante", defaultDesc: "Ansiedade constante sobre possíveis perigos e problemas." },
  inquieto: { name: "Inquieto", defaultDesc: "Busca constante por novidades, dificuldade em se satisfazer com o presente." },
  controlador: { name: "Controlador", defaultDesc: "Necessidade de estar no comando e dificuldade em delegar." },
  esquivo: { name: "Esquivo", defaultDesc: "Tendência a evitar conflitos e situações desconfortáveis." },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    // Fetch saboteur test results
    const { data: sabotadorResult } = await supabase
      .from("daily_responses")
      .select("answer, created_at")
      .eq("user_id", userId)
      .eq("section", "saboteurs_results")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let sabotadorScores: Record<string, number> | null = null;

    if (sabotadorResult?.answer) {
      try {
        sabotadorScores = JSON.parse(sabotadorResult.answer as string);
      } catch (_) {
        sabotadorScores = null;
      }
    }

    // Fetch mission data
    const { data: missions } = await supabase
      .from("daily_mission_sessions")
      .select("is_completed, total_points, streak_days, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(7);

    // Fetch physical data
    const { data: physicalData } = await supabase
      .from("dados_físicos_do_usuário")
      .select("altura_cm, peso_atual_kg, sexo, data_nascimento, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch bioimpedance
    const { data: bioData } = await supabase
      .from("bioimpedance_analysis")
      .select("analysis_result, health_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch emotional data
    const { data: emotionalData } = await supabase
      .from("chat_emotional_analysis")
      .select("sentiment_score, stress_level, energy_level, emotions_detected, emotional_topics, week_start")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build mission summary
    const missionSummary = missions && missions.length > 0
      ? {
          dias: missions.length,
          completadas: missions.filter((m) => m.is_completed).length,
          pontosTotais: missions.reduce((sum, m) => sum + (m.total_points || 0), 0),
          streakAtual: missions[0]?.streak_days || 0,
        }
      : null;

    // Get top 3 saboteurs
    const topSaboteurs = sabotadorScores
      ? Object.entries(sabotadorScores)
          .map(([key, score]) => ({
            key,
            name: saboteurInfo[key]?.name || key,
            score: Number(score),
            description: "",
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
      : [];

    const hoje = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Default report data
    let reportData = {
      title: "Relatório de Autoconhecimento",
      date: hoje,
      introduction: "Parabéns por dar esse passo importante de autoconhecimento! Este relatório apresenta uma análise personalizada dos seus sabotadores internos e como eles se conectam com seus hábitos e bem-estar.",
      saboteurs: topSaboteurs.map(s => ({
        name: s.name,
        score: s.score,
        description: saboteurInfo[s.key]?.defaultDesc || "Padrão comportamental identificado no seu teste.",
      })),
      missionSummary,
      missionInsights: "",
      physicalInsights: "",
      emotionalInsights: "",
      actionPlan: [] as string[],
      conclusion: "Lembre-se: reconhecer seus sabotadores é o primeiro passo para a transformação. Você tem o poder de escolher respostas mais positivas a cada dia.",
    };

    // Use GPT to enhance the report
    if (OPENAI_API_KEY && sabotadorScores) {
      const prompt = `Você é uma mentora de desenvolvimento pessoal especializada em sabotadores internos.

Analise os dados abaixo e retorne um JSON com os campos especificados:

[TESTE DE SABOTADORES - Scores 0-100]
${JSON.stringify(sabotadorScores)}

[TOP 3 SABOTADORES]
${JSON.stringify(topSaboteurs)}

[MISSÃO DO DIA - ÚLTIMOS 7 DIAS]
${JSON.stringify(missionSummary)}

[DADOS FÍSICOS]
${JSON.stringify(physicalData)}

[BIOIMPEDÂNCIA]
${JSON.stringify(bioData)}

[HUMOR E EMOÇÕES]
${JSON.stringify(emotionalData)}

RETORNE APENAS um JSON válido com esta estrutura:
{
  "introduction": "Texto de 2-3 frases acolhedor celebrando o passo de autoconhecimento",
  "saboteurDescriptions": {
    "${topSaboteurs[0]?.key || 'critico'}": "Descrição detalhada de 3-4 frases sobre como este sabotador se manifesta na vida da pessoa, com exemplos práticos",
    "${topSaboteurs[1]?.key || 'insistente'}": "Descrição detalhada de 3-4 frases",
    "${topSaboteurs[2]?.key || 'prestativo'}": "Descrição detalhada de 3-4 frases"
  },
  "missionInsights": "Texto de 3-4 frases conectando os sabotadores identificados com os hábitos e missões diárias do usuário, explicando como um afeta o outro",
  "physicalInsights": "Texto de 2-3 frases analisando os dados físicos disponíveis (IMC, peso, altura, bioimpedância) e conectando com os sabotadores. Se não houver dados, retorne string vazia",
  "emotionalInsights": "Texto de 2-3 frases analisando o estado emocional (sentimentos detectados, nível de estresse, energia) e conectando com os sabotadores. Se não houver dados, retorne string vazia",
  "actionPlan": [
    "Ação 1 específica e concreta para combater o sabotador principal",
    "Ação 2 específica e concreta",
    "Ação 3 específica e concreta",
    "Ação 4 específica e concreta",
    "Ação 5 específica e concreta"
  ],
  "conclusion": "Frase motivacional de 2-3 sentenças de encerramento, encorajando a pessoa a continuar sua jornada"
}

IMPORTANTE: 
- Retorne APENAS o JSON, sem markdown ou explicações.
- Seja específico e personalizado com base nos dados fornecidos.
- Se physicalData ou emotionalData estiverem vazios/null, retorne string vazia para physicalInsights/emotionalInsights.`;

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "Você retorna apenas JSON válido, sem markdown ou explicações adicionais.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1200,
          }),
        });

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content as string | undefined;

        if (content) {
          // Clean potential markdown
          const cleanJson = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const gptData = JSON.parse(cleanJson);

          // Merge GPT data with report
          if (gptData.introduction) reportData.introduction = gptData.introduction;
          if (gptData.missionInsights) reportData.missionInsights = gptData.missionInsights;
          if (gptData.physicalInsights) reportData.physicalInsights = gptData.physicalInsights;
          if (gptData.emotionalInsights) reportData.emotionalInsights = gptData.emotionalInsights;
          if (gptData.actionPlan && Array.isArray(gptData.actionPlan)) {
            reportData.actionPlan = gptData.actionPlan;
          }
          if (gptData.conclusion) reportData.conclusion = gptData.conclusion;

          // Update saboteur descriptions
          if (gptData.saboteurDescriptions) {
            reportData.saboteurs = reportData.saboteurs.map(sab => {
              const key = topSaboteurs.find(t => t.name === sab.name)?.key || "";
              return {
                ...sab,
                description: gptData.saboteurDescriptions[key] || sab.description,
              };
            });
          }
        }
      } catch (gptError) {
        console.error("Erro ao processar resposta do GPT:", gptError);
        // Continue with default data
      }
    }

    // Return structured data for PDF generation
    return new Response(JSON.stringify({ reportData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de sabotadores:", error);
    return new Response(JSON.stringify({ error: "Erro interno ao gerar relatório" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
