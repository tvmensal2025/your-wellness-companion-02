import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const { action, category, name, description, content, existingPrompt } = await req.json();

    console.log(`🤖 Gerando template: action=${action}, category=${category}`);

    let prompt = "";

    if (action === "generate") {
      prompt = `Você é um especialista em mensagens de WhatsApp para saúde e bem-estar.

CONTEXTO:
- Aplicativo: Dr. Vita (plataforma de saúde)
- Categoria do template: ${category}
- Nome: ${name || "Mensagem"}
- Descrição: ${description || "Mensagem padrão"}
${existingPrompt ? `- Instruções adicionais: ${existingPrompt}` : ""}

REGRAS IMPORTANTES:
1. Use formatação de WhatsApp: *negrito*, _itálico_
2. Use emojis de forma moderada e relevante
3. Inclua variáveis entre {{ }} quando apropriado: {{nome}}, {{streak}}, {{progresso}}, etc.
4. Máximo 500 caracteres para mensagens curtas, 1000 para relatórios
5. Tom: amigável, motivacional, profissional
6. Foque em saúde, bem-estar e hábitos saudáveis
7. Sempre termine com uma chamada para ação ou incentivo

VARIÁVEIS DISPONÍVEIS:
- {{nome}} - Nome do usuário
- {{streak}} - Dias consecutivos
- {{pontos}} - Total de pontos
- {{peso}} - Peso atual
- {{progresso}} - Percentual de progresso
- {{missoes}} - Lista de missões
- {{conquista}} - Nome da conquista
- {{meta}} - Nome da meta

CATEGORIAS:
- onboarding: Boas-vindas, primeiros passos
- engagement: Motivação, celebrações, incentivos
- report: Relatórios, análises, resumos
- reminder: Lembretes, alertas, notificações

Gere uma mensagem ${category === "report" ? "completa e informativa" : "curta e impactante"} para a categoria "${category}".

Responda APENAS com o conteúdo da mensagem, sem explicações.`;
    } else if (action === "improve") {
      prompt = `Você é um especialista em copywriting para WhatsApp.

MENSAGEM ORIGINAL:
${content}

INSTRUÇÕES:
1. Melhore esta mensagem mantendo o mesmo significado
2. Torne mais engajadora e motivacional
3. Use formatação de WhatsApp: *negrito*, _itálico_
4. Adicione ou ajuste emojis se necessário
5. Mantenha as variáveis {{ }} intactas
6. Mantenha um tom amigável e profissional
7. Não ultrapasse o tamanho original em mais de 20%

Responda APENAS com a mensagem melhorada, sem explicações.`;
    } else {
      throw new Error(`Ação inválida: ${action}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "Você é um especialista em copywriting para mensagens de WhatsApp na área de saúde e bem-estar." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro na API:", errorData);
      throw new Error(`Erro na API de IA: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content.trim();

    console.log("✅ Template gerado com sucesso");

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent 
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
