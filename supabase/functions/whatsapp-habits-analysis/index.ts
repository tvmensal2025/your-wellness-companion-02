import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, answers, totalPoints, streakDays, questions } = await req.json();

    console.log("📊 Recebido pedido de análise de hábitos:", { userId, totalPoints, streakDays });

    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, phone, whatsapp_enabled")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("❌ Erro ao buscar perfil:", profileError);
      throw new Error("Usuário não encontrado");
    }

    if (!profile.phone) {
      throw new Error("Usuário sem telefone cadastrado");
    }

    const firstName = profile.first_name || "Amigo(a)";
    const phone = profile.phone.replace(/\D/g, "");

    console.log(`👤 Usuário: ${firstName}, Telefone: ${phone}`);

    // Formatar respostas para o prompt
    const answersFormatted = questions
      ? questions.map((q: { id: string; question: string }) => {
          const answer = answers[q.id];
          return `- ${q.question}: ${answer || 'Não respondido'}`;
        }).join('\n')
      : Object.entries(answers || {})
          .map(([key, value]) => `- ${key}: ${value}`)
          .join('\n');

    // Gerar análise com Gemini via Lovable AI
    const systemPrompt = `Você é o Dr. Vital, médico especialista em saúde integrativa e medicina preventiva do Instituto dos Sonhos.

PERSONA:
- Tom: Profissional, acolhedor, objetivo
- Usa linguagem clara e empática
- Oferece insights médicos sobre hábitos diários
- Máximo 3 emojis na mensagem toda
- Sempre positivo, focando em melhorias práticas
- Conecta hábitos com impactos na saúde física

ANÁLISE DAS MISSÕES DIÁRIAS:
- Identifique 1-2 pontos de ATENÇÃO nos hábitos reportados
- Dê UMA recomendação prática de saúde
- Relacione os hábitos com bem-estar físico

FORMATO OBRIGATÓRIO PARA WHATSAPP:
- Inicie SEMPRE com: *${firstName}*, vi suas reflexões de hoje! 👨‍⚕️
- Use *texto* para negrito (WhatsApp)
- Use _texto_ para itálico (WhatsApp)
- Separe parágrafos com linha em branco
- Máximo 150 palavras
- NÃO inclua assinatura (será adicionada automaticamente)
- NÃO use markdown com ## ou outros formatos

EXEMPLO DE ESTRUTURA:
*${firstName}*, vi suas reflexões de hoje! 👨‍⚕️

Notei que você dormiu menos de 6 horas e relatou cansaço. Do ponto de vista _fisiológico_, isso afeta a produção de hormônios como leptina e cortisol.

*Ponto de atenção:* O sono insuficiente pode aumentar a fome e dificultar o controle de peso.

Minha recomendação: tente estabelecer um horário fixo para dormir, mesmo aos finais de semana.

Continue registrando seus hábitos - a consistência transforma! ✨`;

    const userPrompt = `Crie uma mensagem WhatsApp para ${firstName} baseada nas reflexões diárias.

RESPOSTAS DO DIA:
${answersFormatted}

ESTATÍSTICAS:
- Pontos ganhos hoje: ${totalPoints}
- Dias de sequência (streak): ${streakDays || 1}

IMPORTANTE:
- Use *asteriscos* para negrito
- Use _underlines_ para itálico
- Separe parágrafos com linha em branco
- Comece com *${firstName}*, vi suas reflexões de hoje! 👨‍⚕️
- Máximo 3 emojis
- Foque em 1-2 pontos de atenção dos hábitos
- Dê UMA recomendação prática
- Termine com encorajamento`;

    console.log("🤖 Gerando análise com Gemini...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("❌ Erro Gemini:", errorText);
      throw new Error("Erro ao gerar análise");
    }

    const aiData = await aiResponse.json();
    let analysisMessage = aiData.choices?.[0]?.message?.content || "";

    console.log("📝 Análise gerada:", analysisMessage.substring(0, 100) + "...");

    // Adicionar assinatura
    analysisMessage += `\n\nCom dedicação à sua saúde,\n*Dr. Vital* 🩺\n_Instituto dos Sonhos_`;

    // Gerar imagem PNG do resumo
    console.log("🖼️ Gerando imagem do resumo...");

    const imagePrompt = `Gere uma imagem de resumo de hábitos diários com:

DADOS:
- Nome: ${firstName}
- Pontos do dia: +${totalPoints}
- Streak: ${streakDays || 1} dias
- Missões: ${questions?.length || Object.keys(answers).length} completadas

DESIGN:
- Estilo moderno e clean
- Cores: gradiente de azul escuro para roxo
- Ícone de médico ou estetoscópio sutil
- Título: "Reflexões do Dia"
- Subtítulo: "Análise Dr. Vital"
- Mostrar pontos e streak em destaque
- Formato vertical para WhatsApp
- Logo Instituto dos Sonhos no rodapé`;

    let imageBase64 = null;
    try {
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: imagePrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (imageUrl && imageUrl.includes("base64")) {
          imageBase64 = imageUrl.split(",")[1];
          console.log("✅ Imagem gerada com sucesso");
        }
      }
    } catch (imgError) {
      console.error("⚠️ Erro ao gerar imagem (continuando sem imagem):", imgError);
    }

    // Enviar mensagem de texto via Evolution API
    console.log("📤 Enviando mensagem via Evolution API...");

    const textResponse = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: {
        apikey: EVOLUTION_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: phone,
        text: analysisMessage,
        delay: 1000,
      }),
    });

    const textData = await textResponse.json();
    console.log("📤 Resposta texto:", textResponse.ok, JSON.stringify(textData));

    // Enviar imagem se gerada
    let imageData = null;
    if (imageBase64) {
      console.log("📸 Enviando imagem...");

      const imgResponse = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: {
          apikey: EVOLUTION_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: phone,
          mediatype: "image",
          media: imageBase64,
          fileName: `reflexoes-${Date.now()}.png`,
          caption: "📊 Suas Reflexões do Dia - Dr. Vital",
          delay: 2000,
        }),
      });

      imageData = await imgResponse.json();
      console.log("📸 Imagem enviada:", imgResponse.ok);
    }

    // Log no banco
    await supabase.from("ai_system_logs").insert({
      user_id: userId,
      operation: "whatsapp_habits_analysis",
      service_name: "evolution_api",
      status: "success",
      details: {
        totalPoints,
        streakDays,
        answersCount: Object.keys(answers || {}).length,
        imageGenerated: !!imageBase64,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Análise enviada com sucesso!",
        textSent: textResponse.ok,
        imageSent: !!imageBase64,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Erro na função:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
