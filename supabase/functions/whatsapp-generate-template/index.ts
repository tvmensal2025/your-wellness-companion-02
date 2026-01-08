import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Vozes do MaxNutrition (inline para evitar problemas de import)
const SOFIA = {
  nome: "Sofia",
  emoji: "💚",
  especialidade: "Nutrição e Emagrecimento Consciente",
  assinatura: "Com carinho,\nSofia 💚\n_MaxNutrition_",
};

const DR_VITAL = {
  nome: "Dr. Vital",
  emoji: "🩺",
  especialidade: "Saúde, Prevenção e Consciência Corporal",
  assinatura: "Dr. Vital 🩺\n_MaxNutrition_",
};

function detectVoice(category: string) {
  const drVitalCategories = ["saude", "health", "medico", "medical", "prevencao", "prevention", "relatorio", "report", "analise", "analysis"];
  const categoryLower = category?.toLowerCase() || "";
  
  if (drVitalCategories.some(cat => categoryLower.includes(cat))) {
    return DR_VITAL;
  }
  return SOFIA;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    
    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY não configurada");
    }

    const { action, category, name, description, content, existingPrompt, voice: voiceOverride } = await req.json();

    console.log(`🤖 Gerando template: action=${action}, category=${category}`);

    // Detectar voz baseado na categoria ou usar override
    const voice = voiceOverride === "dr_vital" ? DR_VITAL : 
                  voiceOverride === "sofia" ? SOFIA : 
                  detectVoice(category || "");

    console.log(`🎭 Voz selecionada: ${voice.nome}`);

    let prompt = "";

    if (action === "generate") {
      const voicePrompt = voice.nome === "Sofia" 
        ? `Você é a SOFIA, nutricionista virtual do MaxNutrition.

PERSONALIDADE:
- Amiga próxima e acolhedora
- Motivacional sem ser forçada
- Empática e compreensiva
- Celebra cada pequena vitória

TOM DE VOZ:
- Linguagem simples e direta
- Como uma amiga conversando
- Positivo e encorajador
- NUNCA usa culpa, medo ou cobrança

EMOJIS: Use livremente (💚 🌟 ✨ 🎉 💪 😊)

ASSINATURA: Sempre terminar com:
"Com carinho,
Sofia 💚
_MaxNutrition_"`
        : `Você é o DR. VITAL, médico virtual do MaxNutrition.

PERSONALIDADE:
- Autoridade tranquila
- Profissional mas acessível
- Focado em prevenção e bem-estar
- Reforça hábitos saudáveis

TOM DE VOZ:
- Claro e direto
- Firme mas gentil
- Baseado em dados quando disponíveis
- Reforça constância e responsabilidade

EMOJIS: Use discretamente (🩺 ⚕️ 📊)

ASSINATURA: Sempre terminar com:
"Dr. Vital 🩺
_MaxNutrition_"`;

      prompt = `${voicePrompt}

CONTEXTO DO TEMPLATE:
- Categoria: ${category || "geral"}
- Nome: ${name || "Mensagem"}
- Descrição: ${description || "Mensagem padrão"}
${existingPrompt ? `- Instruções adicionais: ${existingPrompt}` : ""}

REGRAS OBRIGATÓRIAS:
1. ⚠️ SEMPRE iniciar com o nome do cliente em negrito: *{{nome}}*
2. Use formatação de WhatsApp: *negrito*, _itálico_
3. Use emojis de forma adequada à voz
4. Máximo 400 caracteres para mensagens curtas, 800 para relatórios
5. NUNCA use culpa, ameaça ou medo
6. SEMPRE reforce constância, progresso e autocuidado
7. SEMPRE termine com a assinatura correta

VARIÁVEIS DISPONÍVEIS:
- {{nome}} - Nome do usuário (OBRIGATÓRIO no início)
- {{streak}} - Dias consecutivos
- {{pontos}} - Total de pontos
- {{peso}} - Peso atual
- {{progresso}} - Percentual de progresso
- {{conquista}} - Nome da conquista
- {{meta}} - Nome da meta

Gere uma mensagem ${category === "report" ? "informativa" : "motivacional"} seguindo TODAS as regras acima.
Responda APENAS com o conteúdo da mensagem, sem explicações.`;

    } else if (action === "improve") {
      prompt = `Você é especialista em copywriting para WhatsApp do MaxNutrition.

MENSAGEM ORIGINAL:
${content}

VOZ A USAR: ${voice.nome} (${voice.especialidade})

INSTRUÇÕES:
1. ⚠️ A mensagem DEVE iniciar com *{{nome}}* (nome em negrito)
2. Melhore a mensagem mantendo o mesmo significado
3. Torne mais engajadora e ${voice.nome === "Sofia" ? "acolhedora" : "profissional"}
4. Use formatação de WhatsApp: *negrito*, _itálico_
5. Adicione ou ajuste emojis conforme a voz
6. Mantenha as variáveis {{ }} intactas
7. Mantenha tom positivo e motivacional
8. NUNCA use culpa, ameaça ou medo
9. Termine com a assinatura correta:
${voice.assinatura}

Responda APENAS com a mensagem melhorada, sem explicações.`;

    } else {
      throw new Error(`Ação inválida: ${action}`);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro na API:", errorData);
      throw new Error(`Erro na API do Google Gemini: ${response.status}`);
    }

    const data = await response.json();
    let generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
    if (!generatedContent) {
      throw new Error("Resposta vazia do Gemini");
    }

    // Garantir que começa com *{{nome}}*
    if (!generatedContent.startsWith("*{{nome}}*") && !generatedContent.startsWith("*{nome}*")) {
      // Verificar se tem alguma variação e corrigir
      generatedContent = generatedContent.replace(/^\*?(\{\{?nome\}?\}?)\*?,?\s*/i, "*{{nome}}*, ");
      
      // Se ainda não começa corretamente, adicionar
      if (!generatedContent.startsWith("*{{nome}}*")) {
        generatedContent = `*{{nome}}*, ${generatedContent}`;
      }
    }

    console.log(`✅ Template gerado com sucesso (Voz: ${voice.nome})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent,
        voice: voice.nome,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Erro:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
