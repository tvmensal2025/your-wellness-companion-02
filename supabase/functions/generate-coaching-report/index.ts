import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoachingReportRequest {
  userId: string;
  sessionId: string;
  sessionType: string;
  sessionTitle: string;
  responses: Record<string, any>;
  questions?: Array<{ id: string; question: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiKey = Deno.env.get('GEMINI_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body: CoachingReportRequest = await req.json();
    
    const { userId, sessionId, sessionType, sessionTitle, responses, questions } = body;

    // 1. Buscar dados do usuário para personalização
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, birth_date')
      .eq('user_id', userId)
      .single();

    const { data: physicalData } = await supabase
      .from('user_physical_data')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const userName = profile?.full_name || 'Cliente';
    const firstName = userName.split(' ')[0];

    // 2. Formatar respostas para o prompt
    const formattedResponses = formatResponses(responses, questions);

    // 3. Gerar prompt específico por tipo de sessão
    const systemPrompt = getSystemPrompt(sessionType, firstName);
    const userPrompt = getUserPrompt(sessionType, sessionTitle, formattedResponses, physicalData);

    // 4. Chamar Gemini para gerar análise
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini');
    }

    // 5. Parsear resposta JSON da IA
    let report;
    try {
      report = JSON.parse(generatedText);
    } catch {
      // Se não for JSON válido, criar estrutura padrão
      report = createFallbackReport(generatedText, firstName, sessionTitle);
    }

    // 6. Adicionar metadados
    const finalReport = {
      ...report,
      metadata: {
        reportId: generateReportId(),
        generatedAt: new Date().toISOString(),
        sessionId,
        sessionType,
        sessionTitle,
        clientName: userName,
        coachName: 'Dr. Vital',
        coachTitle: getCoachTitle(sessionType)
      }
    };

    // 7. Salvar relatório no banco (opcional)
    await supabase
      .from('coaching_reports')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        report_data: finalReport,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id,session_id' });

    return new Response(
      JSON.stringify({ success: true, report: finalReport }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating coaching report:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Formatar respostas para o prompt
function formatResponses(
  responses: Record<string, any>, 
  questions?: Array<{ id: string; question: string }>
): string {
  const lines: string[] = [];
  
  Object.entries(responses).forEach(([key, value]) => {
    const question = questions?.find(q => q.id === key)?.question || key.replace(/_/g, ' ');
    lines.push(`- ${question}: ${value}`);
  });
  
  return lines.join('\n');
}

// System prompt por tipo de sessão
function getSystemPrompt(sessionType: string, clientName: string): string {
  const basePrompt = `Você é Dr. Vital, um coach de bem-estar altamente qualificado da MaxNutrition. 
Você está gerando um relatório profissional de coaching para ${clientName}.

REGRAS IMPORTANTES:
1. Seja empático, profissional e motivador
2. Use o nome do cliente para personalizar
3. Baseie-se APENAS nas respostas fornecidas
4. Não invente dados que não foram informados
5. Seja específico nas recomendações
6. Use linguagem acessível mas profissional

Responda SEMPRE em formato JSON com a seguinte estrutura:
{
  "overallScore": número de 0 a 100,
  "scoreLabel": "Excelente" | "Bom" | "Regular" | "Atenção Necessária",
  "executiveSummary": "Resumo executivo em 2-3 frases",
  "detailedAnalysis": "Análise detalhada em 3-4 parágrafos",
  "strengths": ["array de 3-4 pontos fortes identificados"],
  "areasForImprovement": ["array de 2-3 áreas para desenvolver"],
  "recommendations": [
    {
      "priority": 1,
      "title": "Título da recomendação",
      "description": "Descrição detalhada",
      "actionSteps": ["Passo 1", "Passo 2"],
      "timeframe": "Prazo sugerido"
    }
  ],
  "nextSteps": "Próximos passos sugeridos",
  "motivationalMessage": "Mensagem motivacional personalizada"
}`;

  const typeSpecificPrompts: Record<string, string> = {
    anamnesis: `${basePrompt}

CONTEXTO: Esta é uma Anamnese Completa de Saúde.
FOCO: Avaliar histórico de saúde, hábitos de vida, fatores de risco e oportunidades de prevenção.
ABORDAGEM: Médica preventiva, sem fazer diagnósticos, apenas orientações gerais.`,

    life_wheel: `${basePrompt}

CONTEXTO: Esta é uma avaliação da Roda da Vida (12 pilares).
FOCO: Avaliar equilíbrio entre as diferentes áreas da vida.
ABORDAGEM: Life coaching, identificando áreas fortes e oportunidades de crescimento.
PILARES: Carreira, Finanças, Saúde, Relacionamentos, Família, Social, Crescimento Pessoal, Lazer, Físico, Espiritualidade, Contribuição, Ambiente.`,

    health_wheel: `${basePrompt}

CONTEXTO: Esta é uma avaliação da Roda da Saúde.
FOCO: Avaliar sintomas e funcionamento dos sistemas corporais.
ABORDAGEM: Saúde preventiva, identificando padrões e sugerindo cuidados.`,

    saboteurs: `${basePrompt}

CONTEXTO: Esta é uma avaliação de Sabotadores Mentais (baseado em Inteligência Positiva).
FOCO: Identificar padrões mentais limitantes e estratégias de superação.
ABORDAGEM: Coaching mental, com empatia e foco em transformação.
SABOTADORES: Crítico, Controlador, Perfeccionista, Hiper-realizador, Prestativo, Vítima, Hipervigilante, Inquieto, Evitador, Hiper-racional.`,

    daily_reflection: `${basePrompt}

CONTEXTO: Esta é uma Reflexão Diária de bem-estar.
FOCO: Avaliar humor, energia, gratidão e conquistas do dia.
ABORDAGEM: Coaching positivo, celebrando progressos e incentivando consistência.`,

    symptoms: `${basePrompt}

CONTEXTO: Esta é uma avaliação de Sintomas de Saúde.
FOCO: Mapear sintomas frequentes e ocasionais, identificar padrões.
ABORDAGEM: Saúde preventiva, sugerindo quando buscar profissional.`
  };

  return typeSpecificPrompts[sessionType] || basePrompt;
}

// User prompt com dados da sessão
function getUserPrompt(
  sessionType: string, 
  sessionTitle: string, 
  formattedResponses: string,
  physicalData?: any
): string {
  let context = `SESSÃO: ${sessionTitle}\n\nRESPOSTAS DO CLIENTE:\n${formattedResponses}`;

  if (physicalData) {
    context += `\n\nDADOS FÍSICOS DO CLIENTE:
- Peso: ${physicalData.peso_atual_kg || 'Não informado'} kg
- Altura: ${physicalData.altura_cm || 'Não informado'} cm
- IMC: ${physicalData.imc || 'Não calculado'}
- Nível de Atividade: ${physicalData.nivel_atividade || 'Não informado'}`;
  }

  context += `\n\nGere um relatório profissional de coaching baseado nessas informações.`;

  return context;
}

// Título do coach por tipo
function getCoachTitle(sessionType: string): string {
  const titles: Record<string, string> = {
    anamnesis: 'Especialista em Saúde Preventiva',
    life_wheel: 'Life Coach',
    health_wheel: 'Coach de Saúde',
    saboteurs: 'Coach de Inteligência Emocional',
    daily_reflection: 'Coach de Bem-Estar',
    symptoms: 'Especialista em Saúde',
    default: 'Coach de Bem-Estar'
  };
  return titles[sessionType] || titles.default;
}

// Gerar ID do relatório
function generateReportId(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `MN${year}${month}-${random}`;
}

// Fallback se JSON falhar
function createFallbackReport(text: string, clientName: string, sessionTitle: string) {
  return {
    overallScore: 70,
    scoreLabel: 'Bom',
    executiveSummary: `Análise da sessão "${sessionTitle}" para ${clientName}.`,
    detailedAnalysis: text,
    strengths: ['Comprometimento com o autoconhecimento', 'Disposição para mudança'],
    areasForImprovement: ['Continuar monitorando hábitos'],
    recommendations: [{
      priority: 1,
      title: 'Acompanhamento contínuo',
      description: 'Continue realizando suas sessões regularmente',
      actionSteps: ['Agende próxima sessão em 30 dias'],
      timeframe: '30 dias'
    }],
    nextSteps: 'Agende uma sessão de acompanhamento para avaliar seu progresso.',
    motivationalMessage: `${clientName}, você está no caminho certo! Continue assim.`
  };
}
