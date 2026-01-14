import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Lovable AI endpoint - FREE (no cost per request)
const LOVABLE_AI_URL = "https://ai.lovable.dev/api/chat";

async function callLovableAI(prompt: string): Promise<string> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  
  if (!lovableApiKey) {
    console.error("LOVABLE_API_KEY not configured");
    throw new Error("LOVABLE_API_KEY not configured");
  }

  console.log("Calling Lovable AI (FREE) with Gemini 2.5 Flash...");

  const response = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${lovableApiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { 
          role: "system", 
          content: "Você é uma mentora de desenvolvimento pessoal. Retorne apenas JSON válido, sem markdown ou explicações." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Lovable AI error:", response.status, errorText);
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  console.log("Lovable AI response received successfully");
  return data.choices?.[0]?.message?.content || "";
}

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

Deno.serve(async (req) => {
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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
    const reportData = {
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

    // Use Lovable AI (FREE) to enhance the report
    if (LOVABLE_API_KEY && sabotadorScores) {
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
        const content = await callLovableAI(prompt);

        if (content) {
          // Clean potential markdown
          const cleanJson = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const aiData = JSON.parse(cleanJson);

          // Merge AI data with report
          if (aiData.introduction) reportData.introduction = aiData.introduction;
          if (aiData.missionInsights) reportData.missionInsights = aiData.missionInsights;
          if (aiData.physicalInsights) reportData.physicalInsights = aiData.physicalInsights;
          if (aiData.emotionalInsights) reportData.emotionalInsights = aiData.emotionalInsights;
          if (aiData.actionPlan && Array.isArray(aiData.actionPlan)) {
            reportData.actionPlan = aiData.actionPlan;
          }
          if (aiData.conclusion) reportData.conclusion = aiData.conclusion;

          // Update saboteur descriptions
          if (aiData.saboteurDescriptions) {
            reportData.saboteurs = reportData.saboteurs.map(sab => {
              const key = topSaboteurs.find(t => t.name === sab.name)?.key || "";
              return {
                ...sab,
                description: aiData.saboteurDescriptions[key] || sab.description,
              };
            });
          }
        }
      } catch (aiError) {
        console.error("Erro ao processar resposta do Lovable AI:", aiError);
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
