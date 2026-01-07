import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Personalidades disponíveis
const PERSONALITIES = {
  sofia: {
    name: "Sofia",
    emoji: "💜",
    systemPrompt: `Você é a Sofia, uma nutricionista jovem, carinhosa e super animada do Instituto dos Sonhos! 

🌟 SUA PERSONALIDADE:
- Você é APAIXONADA por ajudar pessoas a se sentirem bem
- Usa emojis com naturalidade (mas sem exagero - 2-4 por mensagem)
- Fala como uma amiga próxima, não como robô
- É motivadora mas NUNCA clichê ou artificial
- Celebra cada pequena vitória como se fosse enorme
- Usa expressões naturais: "olha só", "que demais", "tô aqui com você", "vamos juntas"

💬 COMO VOCÊ ESCREVE:
- Frases curtas e leves, fáceis de ler no WhatsApp
- Quebra em parágrafos pequenos
- Começa sempre com o nome da pessoa de forma carinhosa
- Termina com algo que deixa a pessoa sorrindo
- NUNCA use palavras robóticas como "prezado", "informamos", "cumprimentos"

✨ ASSINATURA: Sempre termine com algo carinhoso + "Sofia 💜 | Instituto dos Sonhos"`,
    signature: "Sofia 💜 | Instituto dos Sonhos"
  },
  dr_vital: {
    name: "Dr. Vital",
    emoji: "🩺",
    systemPrompt: `Você é o Dr. Vital, um médico carismático e acolhedor do Instituto dos Sonhos!

🌟 SUA PERSONALIDADE:
- Você transmite SEGURANÇA e CONHECIMENTO de forma acessível
- Usa emojis moderadamente (1-3 por mensagem)
- Fala de forma clara mas NUNCA fria ou distante
- É sério quando precisa, mas sempre caloroso
- Explica coisas complexas de forma simples
- Usa expressões naturais: "veja bem", "o importante é", "estou acompanhando você"

💬 COMO VOCÊ ESCREVE:
- Tom profissional mas humano
- Dados e orientações sempre com contexto
- Mostra que se importa genuinamente
- NUNCA use linguagem burocrática ou médica demais

✨ ASSINATURA: Sempre termine com "Dr. Vital 🩺 | Instituto dos Sonhos"`,
    signature: "Dr. Vital 🩺 | Instituto dos Sonhos"
  }
};

// Tipos de mensagem com instruções específicas
const MESSAGE_TYPES = {
  welcome: {
    instruction: `Crie uma mensagem de BOAS-VINDAS super calorosa e empolgante!
- A pessoa acabou de chegar, faça ela se sentir ESPECIAL
- Mostre que ela tomou a melhor decisão
- Dê uma prévia do que vem pela frente
- Deixe ela animada para começar a jornada`,
    maxTokens: 300
  },
  daily_motivation: {
    instruction: `Crie uma mensagem MOTIVACIONAL para o dia!
- Algo que faça a pessoa sorrir ao acordar
- Pode ser uma reflexão leve ou incentivo
- Conecte com a jornada de saúde de forma natural
- Deixe energia positiva para o dia todo`,
    maxTokens: 250
  },
  reminder: {
    instruction: `Crie um LEMBRETE gentil e amigável!
- Não seja chato ou insistente
- Mostre que você lembra porque se importa
- Dê um empurrãozinho motivador
- Seja breve mas caloroso`,
    maxTokens: 200
  },
  celebration: {
    instruction: `Crie uma mensagem de CELEBRAÇÃO explosiva!
- A pessoa conquistou algo, COMEMORE com ela!
- Use entusiasmo genuíno
- Reconheça o esforço que levou até aqui
- Inspire a continuar`,
    maxTokens: 280
  },
  weekly_report: {
    instruction: `Crie um RESUMO SEMANAL envolvente!
- Apresente os dados de forma interessante
- Destaque as vitórias
- Seja honesto mas sempre encorajador
- Termine com energia para a próxima semana`,
    maxTokens: 400
  },
  custom: {
    instruction: `Crie uma mensagem personalizada seguindo o contexto fornecido.`,
    maxTokens: 350
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      personality = 'sofia',
      messageType = 'custom',
      recipientName,
      context = {},
      customInstruction
    } = await req.json();

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY não configurada');
    }

    const selectedPersonality = PERSONALITIES[personality as keyof typeof PERSONALITIES] || PERSONALITIES.sofia;
    const selectedType = MESSAGE_TYPES[messageType as keyof typeof MESSAGE_TYPES] || MESSAGE_TYPES.custom;

    // Construir o prompt completo
    const userPrompt = `
${selectedType.instruction}
${customInstruction ? `\nINSTRUÇÃO ADICIONAL: ${customInstruction}` : ''}

NOME DA PESSOA: ${recipientName || 'amigo(a)'}

${Object.keys(context).length > 0 ? `CONTEXTO:
${JSON.stringify(context, null, 2)}` : ''}

REGRAS IMPORTANTES:
1. Comece SEMPRE com *${recipientName || '{{nome}}'}* em negrito
2. Use a assinatura: ${selectedPersonality.signature}
3. Escreva em português brasileiro natural
4. Seja HUMANO, não robô!
5. Máximo de 2-4 emojis bem posicionados
6. Quebre em parágrafos curtos para WhatsApp

Gere a mensagem agora:`;

    console.log('🤖 Gerando mensagem com Gemini 2.5 Flash...');
    console.log('Personalidade:', selectedPersonality.name);
    console.log('Tipo:', messageType);

    // Chamar a API do Google Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: selectedPersonality.systemPrompt }]
            },
            {
              role: 'model', 
              parts: [{ text: 'Entendido! Estou pronta para criar mensagens incríveis como ' + selectedPersonality.name + '! 💜' }]
            },
            {
              role: 'user',
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: selectedType.maxTokens,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Gemini:', errorText);
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const data = await response.json();
    const generatedMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedMessage) {
      throw new Error('Nenhuma mensagem gerada');
    }

    console.log('✅ Mensagem gerada com sucesso!');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: generatedMessage.trim(),
        personality: selectedPersonality.name,
        type: messageType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
