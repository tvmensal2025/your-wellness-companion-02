import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
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

    // Buscar último resultado consolidado do teste de sabotadores
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

    // Missão do dia / hábitos recentes
    const { data: missions } = await supabase
      .from("daily_mission_sessions")
      .select("is_completed, total_points, streak_days, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(7);

    // Dados físicos
    const { data: physicalData } = await supabase
      .from("dados_físicos_do_usuário")
      .select("altura_cm, peso_atual_kg, sexo, data_nascimento, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Bioimpedância
    const { data: bioData } = await supabase
      .from("bioimpedance_analysis")
      .select("analysis_result, health_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Humor e emoções (chat emocional)
    const { data: emotionalData } = await supabase
      .from("chat_emotional_analysis")
      .select("sentiment_score, stress_level, energy_level, emotions_detected, emotional_topics, week_start")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const resumoMissao = missions && missions.length > 0
      ? {
          dias: missions.length,
          completadas: missions.filter((m) => m.is_completed).length,
          pontosTotais: missions.reduce((sum, m) => sum + (m.total_points || 0), 0),
          streakAtual: missions[0]?.streak_days || 0,
        }
      : null;

    const hoje = new Date().toISOString().split("T")[0];

    let htmlBody = `<section>
  <h1>Relatório Especial dos Seus Sabotadores</h1>
  <p>Relatório gerado em ${hoje}. Este é um resumo automático do seu teste de sabotadores combinado com dados do seu comportamento recente no app.</p>
</section>`;

    if (OPENAI_API_KEY && sabotadorScores) {
      const prompt = `Você é uma mentora de desenvolvimento pessoal altamente especializada em sabotadores internos, hábitos e mudança comportamental.

Crie um RELATÓRIO EM HTML (apenas o corpo em HTML, sem tag <html> ou <body>) em português do Brasil, acolhedor e motivador, com tom humano e personalizado.

Use os dados abaixo para criar o conteúdo:

[TESTE DE SABOTADORES]
Scores por sabotador (0-100): ${JSON.stringify(sabotadorScores)}

[MISSÃO DO DIA E HÁBITOS RECENTES]
${JSON.stringify(resumoMissao)}

[DADOS FÍSICOS]
${JSON.stringify(physicalData)}

[BIOIMPEDÂNCIA]
${JSON.stringify(bioData)}

[HUMOR E EMOÇÕES]
${JSON.stringify(emotionalData)}

INSTRUÇÕES DE ESCRITA:
- Comece com um título forte e uma breve introdução celebrando o passo de autoconhecimento.
- Explique de forma simples o que significam, em geral, scores altos e baixos de sabotadores.
- Destaque de 1 a 3 sabotadores principais, explicando o impacto deles no dia a dia e os padrões mais comuns.
- Conecte os sabotadores com hábitos e missão do dia (consistência, pontos, streak).
- Se existirem, conecte com dados físicos/bioimpedância e emoções (ex.: estresse, energia, saúde).
- Termine com um bloco chamado "Plano de Ação Prático" com 3 a 5 passos concretos para os próximos 7 dias.
- Use subtítulos (<h2>, <h3>), parágrafos, listas (<ul>, <li>) e destaques em <strong> quando fizer sentido.
- NÃO peça para a pessoa consultar o app; fale como se o relatório fosse autônomo.
- NÃO inclua tags <html>, <head> ou <body>, apenas o conteúdo interno em HTML bem estruturado.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "Você é uma mentora de desenvolvimento pessoal que escreve relatórios em HTML bonitos, acolhedores e práticos.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1400,
        }),
      });

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content as string | undefined;

      if (content) {
        htmlBody = content;
      }
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Relatório de Sabotadores</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 24px; background: #0f172a; color: #e5e7eb; }
    main { max-width: 800px; margin: 0 auto; background: rgba(15,23,42,0.9); border-radius: 16px; padding: 32px; box-shadow: 0 25px 50px rgba(15,23,42,0.7); border: 1px solid rgba(148,163,184,0.3); }
    h1, h2, h3 { color: #e0f2fe; }
    h1 { font-size: 2rem; margin-bottom: 0.75rem; }
    h2 { font-size: 1.4rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    h3 { font-size: 1.1rem; margin-top: 1rem; margin-bottom: 0.4rem; }
    p { line-height: 1.6; margin-bottom: 0.9rem; color: #cbd5f5; }
    ul { padding-left: 1.2rem; margin-bottom: 1rem; }
    li { margin-bottom: 0.4rem; }
    strong { color: #facc15; }
    .tagline { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.08em; color: #a5b4fc; margin-bottom: 1rem; }
    .badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; background: rgba(59,130,246,0.15); color: #bfdbfe; margin-bottom: 1rem; }
    footer { margin-top: 1.5rem; font-size: 0.8rem; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <main>
    <div class="tagline">Relatório Personalizado de Autoconhecimento</div>
    <div class="badge">Sabotadores • Hábitos • Emoções</div>
    ${htmlBody}
    <footer>
      <p>Este relatório foi gerado automaticamente a partir das suas interações no aplicativo.</p>
    </footer>
  </main>
</body>
</html>`;

    return new Response(JSON.stringify({ html: fullHtml }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de sabotadores em HTML:", error);
    return new Response(JSON.stringify({ error: "Erro interno ao gerar relatório" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
