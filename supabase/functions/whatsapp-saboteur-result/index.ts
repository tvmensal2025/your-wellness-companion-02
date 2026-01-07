import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SaboteurResultPayload {
  userId: string;
  scores: Record<string, number>;
  topSaboteurs: Array<{ name: string; score: number; emoji: string }>;
  overallScore: number;
  overallLevel: string;
  imageBase64?: string;
}

// DR. VITAL - Voz para análise de sabotadores (profissional e acolhedor)
const DR_VITAL_SABOTEUR = {
  assinatura: "Com respeito e dedicação,\nDr. Vital 🩺\n_Instituto dos Sonhos_",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      throw new Error("Evolution API não configurada");
    }

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const payload: SaboteurResultPayload = await req.json();
    const { userId, scores, topSaboteurs, overallScore, overallLevel, imageBase64 } = payload;

    if (!userId || !scores || !topSaboteurs) {
      throw new Error("userId, scores e topSaboteurs são obrigatórios");
    }

    console.log(`🧠 Dr. Vital analisando sabotadores para ${userId}`);

    // Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      throw new Error("Usuário não encontrado");
    }

    if (!user.phone) {
      throw new Error("Usuário sem telefone cadastrado");
    }

    const firstName = user.full_name?.split(" ")[0] || "você";

    // Gerar mensagem personalizada do Dr. Vital usando IA
    const saboteursList = topSaboteurs
      .slice(0, 3)
      .map((s, i) => `${i + 1}. ${s.emoji} ${s.name}: ${s.score.toFixed(0)}%`)
      .join("\n");

    const systemPrompt = `Você é o Dr. Vital, médico especialista em saúde integrativa e comportamental do Instituto dos Sonhos.

PERSONA:
- Tom: Profissional, acolhedor, mas objetivo
- Usa linguagem clara e empática
- Oferece insights médicos/comportamentais sobre os sabotadores
- Máximo 2 emojis por mensagem
- Sempre positivo, focando em oportunidades de crescimento
- Conecta os sabotadores mentais com impactos na saúde física

FORMATO OBRIGATÓRIO:
- Inicie com *{{nome}}* (nome em negrito)
- Use _itálico_ para termos técnicos
- Use *negrito* para destaques importantes
- Máximo 180 palavras
- NÃO inclua assinatura (será adicionada automaticamente)`;

    const userPrompt = `Crie uma mensagem para ${firstName} que acabou de completar o Teste de Sabotadores Mentais.

RESULTADOS:
- Score Geral: ${overallScore.toFixed(0)}% (Nível: ${overallLevel})
- Top 3 Sabotadores:
${saboteursList}

A mensagem deve:
1. Parabenizar pela coragem de fazer o teste
2. Dar um insight médico/comportamental sobre o sabotador #1
3. Explicar brevemente como esse sabotador pode impactar a saúde física
4. Oferecer UMA recomendação prática
5. Encorajar o progresso`;

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
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      console.error("Erro na IA:", await aiResponse.text());
      throw new Error("Falha ao gerar mensagem com IA");
    }

    const aiData = await aiResponse.json();
    let drVitalMessage = aiData.choices?.[0]?.message?.content || "";

    // Adicionar assinatura
    drVitalMessage = `${drVitalMessage.trim()}\n\n${DR_VITAL_SABOTEUR.assinatura}`;

    // Enviar mensagem de texto primeiro
    const phone = formatPhone(user.phone);
    
    const textResponse = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: phone,
        text: drVitalMessage,
        delay: 1000,
      }),
    });

    const textData = await textResponse.json();
    console.log("📤 Mensagem de texto enviada:", textResponse.ok);

    // Se tiver imagem, enviar também
    let imageData = null;
    if (imageBase64) {
      console.log("📸 Enviando imagem do relatório...");
      
      const imageResponse = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: phone,
          mediatype: "image",
          media: imageBase64,
          fileName: `relatorio-sabotadores-${Date.now()}.png`,
          caption: "📊 Seu Relatório de Sabotadores Mentais",
          delay: 2000,
        }),
      });

      imageData = await imageResponse.json();
      console.log("📸 Imagem enviada:", imageResponse.ok);
    }

    // Log no banco
    await supabase.from("whatsapp_evolution_logs").insert({
      user_id: userId,
      phone: phone,
      message_type: "saboteur_result",
      message_content: drVitalMessage,
      evolution_response: { text: textData, image: imageData },
      status: textResponse.ok ? "sent" : "failed",
      error_message: textResponse.ok ? null : JSON.stringify(textData),
    });

    console.log(`✅ Resultado de sabotadores enviado: ${user.full_name}`);

    return new Response(JSON.stringify({ 
      success: textResponse.ok,
      userId,
      voice: "Dr. Vital",
      messageSent: true,
      imageSent: !!imageBase64,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith("55")) cleaned = "55" + cleaned;
  return cleaned;
}
