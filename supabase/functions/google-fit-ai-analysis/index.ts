import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/utils/cors.ts";

interface GoogleFitMetrics {
  steps: number;
  calories: number;
  activeMinutes: number;
  sleepHours: number;
  heartRateAvg: number;
  distance: number;
}

interface AIInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metrics, period } = await req.json() as { 
      metrics: GoogleFitMetrics; 
      period: 'day' | 'week' | 'month';
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      // Retornar análise local se não houver API key
      return new Response(
        JSON.stringify({ 
          success: true, 
          analysis: generateLocalAnalysis(metrics, period) 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const periodLabel = period === 'day' ? 'hoje' : period === 'week' ? 'esta semana' : 'este mês';
    
    const prompt = `Você é Sofia, uma assistente de saúde inteligente. Analise os seguintes dados de atividade física e saúde coletados ${periodLabel}:

MÉTRICAS:
- Passos: ${metrics.steps.toLocaleString()}
- Calorias ativas: ${metrics.calories} kcal
- Minutos ativos: ${metrics.activeMinutes} min
- Horas de sono (média): ${metrics.sleepHours.toFixed(1)}h
- Frequência cardíaca média: ${metrics.heartRateAvg} BPM
- Distância percorrida: ${(metrics.distance / 1000).toFixed(2)} km

METAS RECOMENDADAS:
- Passos: 10.000/dia
- Sono: 7-8 horas/noite
- Minutos ativos: 30 min/dia
- Hidratação: 2L água/dia

Forneça uma análise completa em formato JSON com a seguinte estrutura:
{
  "summary": "resumo geral em 2-3 frases",
  "insights": [
    {
      "type": "success|warning|info",
      "title": "título curto com emoji",
      "description": "descrição detalhada",
      "recommendation": "recomendação acionável"
    }
  ],
  "recommendations": ["lista de 3-4 recomendações práticas"],
  "score": número de 0 a 100 representando a saúde geral
}

Seja motivador, mas honesto. Use emojis nos títulos.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é Sofia, uma assistente de saúde carinhosa e motivadora. Responda sempre em JSON válido." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status, await response.text());
      return new Response(
        JSON.stringify({ 
          success: true, 
          analysis: generateLocalAnalysis(metrics, period) 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          analysis: generateLocalAnalysis(metrics, period) 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tentar parsear o JSON da resposta
    let analysis;
    try {
      // Extrair JSON da resposta (pode vir com texto antes/depois)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = generateLocalAnalysis(metrics, period);
      }
    } catch {
      analysis = generateLocalAnalysis(metrics, period);
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in google-fit-ai-analysis:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function generateLocalAnalysis(metrics: GoogleFitMetrics, period: string) {
  const insights: AIInsight[] = [];
  let score = 70;

  // Análise de passos
  const stepsPerDay = period === 'day' ? metrics.steps : 
                      period === 'week' ? metrics.steps / 7 : metrics.steps / 30;
  
  if (stepsPerDay >= 10000) {
    insights.push({
      type: 'success',
      title: '🏃 Excelente atividade física!',
      description: `${metrics.steps.toLocaleString()} passos. Você superou a meta recomendada de 10.000 passos!`,
      recommendation: 'Continue mantendo esse ritmo. Considere variar os exercícios para trabalhar diferentes grupos musculares.'
    });
    score += 10;
  } else if (stepsPerDay >= 7000) {
    insights.push({
      type: 'info',
      title: '👣 Bom progresso nos passos',
      description: `${metrics.steps.toLocaleString()} passos. Você está próximo da meta de 10.000!`,
      recommendation: 'Tente adicionar uma caminhada extra de 15-20 minutos ao seu dia.'
    });
    score += 5;
  } else {
    insights.push({
      type: 'warning',
      title: '⚠️ Atividade abaixo do ideal',
      description: `${metrics.steps.toLocaleString()} passos. A OMS recomenda 10.000 passos diários.`,
      recommendation: 'Comece com metas menores: adicione 2.000 passos extras por dia.'
    });
    score -= 5;
  }

  // Análise de sono
  if (metrics.sleepHours >= 7 && metrics.sleepHours <= 9) {
    insights.push({
      type: 'success',
      title: '😴 Sono adequado',
      description: `${metrics.sleepHours.toFixed(1)} horas de sono. Você está dentro da faixa recomendada de 7-9 horas!`,
      recommendation: 'Mantenha horários regulares para dormir e acordar, mesmo nos fins de semana.'
    });
    score += 10;
  } else if (metrics.sleepHours < 6) {
    insights.push({
      type: 'warning',
      title: '😰 Sono insuficiente',
      description: `${metrics.sleepHours.toFixed(1)} horas de sono. Adultos precisam de 7-9 horas por noite.`,
      recommendation: 'Priorize o sono: evite telas 1 hora antes de dormir e mantenha o quarto escuro.'
    });
    score -= 10;
  } else {
    insights.push({
      type: 'info',
      title: '💤 Sono pode melhorar',
      description: `${metrics.sleepHours.toFixed(1)} horas. Um pouco abaixo do ideal.`,
      recommendation: 'Tente dormir 30 minutos mais cedo esta noite.'
    });
  }

  // Análise de frequência cardíaca
  if (metrics.heartRateAvg > 0) {
    if (metrics.heartRateAvg >= 60 && metrics.heartRateAvg <= 100) {
      insights.push({
        type: 'success',
        title: '❤️ Frequência cardíaca normal',
        description: `${metrics.heartRateAvg} BPM em média. Seu coração está batendo em um ritmo saudável!`
      });
      score += 5;
    } else if (metrics.heartRateAvg > 100) {
      insights.push({
        type: 'warning',
        title: '⚠️ Frequência cardíaca elevada',
        description: `${metrics.heartRateAvg} BPM. Considere técnicas de relaxamento.`,
        recommendation: 'Pratique respiração profunda, reduza cafeína e considere consultar um médico se persistir.'
      });
      score -= 5;
    }
  }

  // Análise de calorias
  if (metrics.calories >= 300) {
    insights.push({
      type: 'success',
      title: '🔥 Boa queima calórica',
      description: `${metrics.calories.toLocaleString()} kcal ativas queimadas! Excelente gasto energético.`
    });
    score += 5;
  }

  // Limitar score entre 0 e 100
  score = Math.max(0, Math.min(100, score));

  const recommendations = [
    'Mantenha uma rotina consistente de exercícios',
    'Beba pelo menos 2 litros de água por dia',
    'Faça pausas para alongamento a cada 2 horas',
    'Inclua variedade na sua alimentação'
  ];

  if (metrics.sleepHours < 7) {
    recommendations.unshift('Priorize melhorar a qualidade e duração do sono');
  }
  if (stepsPerDay < 8000) {
    recommendations.unshift('Aumente gradualmente sua atividade física diária');
  }

  const periodLabel = period === 'day' ? 'hoje' : period === 'week' ? 'esta semana' : 'este mês';

  return {
    summary: `Baseado nos seus dados de ${periodLabel}, seu score de saúde é ${score}/100. ${
      score >= 80 ? 'Parabéns! Você está no caminho certo para uma vida saudável!' : 
      score >= 60 ? 'Você está bem, mas há oportunidades de melhoria.' : 
      'Atenção! Foque em desenvolver hábitos mais saudáveis.'
    }`,
    insights,
    recommendations: recommendations.slice(0, 4),
    score
  };
}
