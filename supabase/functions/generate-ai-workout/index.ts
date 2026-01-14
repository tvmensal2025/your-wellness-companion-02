import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserAnswers {
  level: string;
  experience: string;
  time: string;
  frequency: string;
  location: string;
  goal: string;
  limitation: string;
  gender: string;
  bodyFocus: string;
  ageGroup: string;
  specialCondition: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json() as { answers: UserAnswers };
    
    console.log('📊 Gerando treino personalizado com IA para:', {
      gender: answers.gender,
      ageGroup: answers.ageGroup,
      level: answers.level,
      location: answers.location,
      goal: answers.goal,
      bodyFocus: answers.bodyFocus
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Construir prompt detalhado baseado nas respostas
    const genderInfo = answers.gender === 'feminino' 
      ? 'mulher - enfatizar glúteos, pernas, posterior de coxa. Usar referências de Tay Training, Carol Borba'
      : answers.gender === 'masculino'
      ? 'homem - enfatizar peito, costas, ombros, braços. Usar referências de Leandro Twin, Renato Cariani'
      : 'pessoa - treino equilibrado para todo o corpo';

    const ageInfo = {
      'jovem': '18-30 anos - pode treinar intensamente, boa recuperação',
      'adulto': '31-50 anos - intensidade moderada-alta, equilibrar com vida',
      'meia_idade': '51-65 anos - foco em saúde, evitar impacto excessivo',
      'senior': '66+ anos - exercícios suaves, foco em mobilidade e equilíbrio'
    }[answers.ageGroup] || 'adulto';

    const locationInfo = {
      'casa_sem': 'treinar em casa SEM equipamentos - usar peso corporal, móveis (cadeira, mesa, escada, parede)',
      'casa_com': 'treinar em casa COM equipamentos - halteres, elásticos, banco',
      'academia': 'treinar na academia - usar máquinas, barras, halteres, cabos'
    }[answers.location] || 'casa_sem';

    const limitationInfo = answers.limitation !== 'nenhuma' 
      ? `ATENÇÃO: tem limitação de ${answers.limitation}. Adaptar TODOS os exercícios para evitar essa região.`
      : 'Sem limitações físicas.';

    const specialInfo = answers.specialCondition !== 'nenhuma'
      ? `CONDIÇÃO ESPECIAL: ${answers.specialCondition}. Adaptar intensidade e exercícios.`
      : '';

    const bodyFocusInfo = {
      'gluteos_pernas': 'FOCO: Glúteos e pernas - priorizar ponte glútea, agachamentos, afundos, elevação pélvica',
      'abdomen_core': 'FOCO: Abdômen e core - priorizar pranchas, dead bug, russian twist, abdominais',
      'bracos_ombros': 'FOCO: Braços e ombros - priorizar rosca, tríceps, desenvolvimento, elevações',
      'costas_postura': 'FOCO: Costas e postura - priorizar remadas, puxadas, superman, bird dog',
      'peito': 'FOCO: Peito - priorizar supino, flexões, crucifixo, crossover',
      'corpo_equilibrado': 'FOCO: Corpo todo equilibrado - distribuir igualmente'
    }[answers.bodyFocus] || 'corpo_equilibrado';

    const systemPrompt = `Você é um personal trainer expert que cria programas de treino personalizados.
Você conhece as metodologias dos melhores canais de fitness:
- Leandro Twin: treino técnico, científico, hipertrofia
- Renato Cariani: treino intenso, motivacional
- Laércio Refundini: treino estruturado ABCDE
- Sérgio Bertoluci: treino funcional em casa
- Tay Training: treino feminino, foco glúteos
- Carol Borba: cardio e HIIT feminino
- Dra Lili Aranda: exercícios suaves para iniciantes/idosos

Responda APENAS com JSON válido, sem markdown.`;

    const userPrompt = `Crie um programa de treino de 4 semanas para:

PERFIL:
- Gênero: ${genderInfo}
- Idade: ${ageInfo}
- Nível: ${answers.level} (experiência: ${answers.experience})
- Local: ${locationInfo}
- Objetivo: ${answers.goal}
- ${bodyFocusInfo}
- Tempo disponível: ${answers.time} minutos por treino
- Frequência: ${answers.frequency}
- ${limitationInfo}
${specialInfo}

Retorne um JSON com esta estrutura EXATA:
{
  "title": "Nome criativo do programa",
  "subtitle": "Subtítulo descritivo",
  "duration": "4 semanas",
  "frequency": "Xvezes por semana",
  "time": "XX-XX minutos",
  "description": "Descrição motivacional do programa",
  "weekPlan": [
    {
      "week": 1,
      "activities": [
        "DIA - FOCO: Exercício1 SxR | Exercício2 SxR | Exercício3 SxR",
        "DIA - FOCO: Exercício1 SxR | Exercício2 SxR"
      ],
      "days": "Seg, Qua, Sex"
    }
  ]
}

REGRAS:
1. Cada semana deve ter progressão de dificuldade
2. Exercícios devem ser específicos e com séries/repetições claras (ex: 3x12)
3. Adaptar para limitações mencionadas
4. Usar emojis no início dos dias (🏋️ 🔥 💪 🍑 🎯)
5. Incluir aquecimento e alongamento quando apropriado
6. Se for casa sem equipamentos, usar APENAS peso corporal e móveis`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API de IA:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit excedido. Tente novamente em alguns segundos." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Créditos insuficientes. Entre em contato com o suporte." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    console.log("📝 Resposta da IA recebida, processando...");

    // Limpar a resposta (remover markdown se houver)
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Tentar parsear o JSON
    let program;
    try {
      program = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Erro ao parsear JSON:", parseError);
      console.log("Conteúdo recebido:", cleanContent.substring(0, 500));
      throw new Error("Formato de resposta inválido da IA");
    }

    console.log("✅ Programa gerado com sucesso:", program.title);

    return new Response(JSON.stringify({ 
      success: true, 
      program,
      tokensUsed: data.usage?.total_tokens 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro ao gerar treino:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
