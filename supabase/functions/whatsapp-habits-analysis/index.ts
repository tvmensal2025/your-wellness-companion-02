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

function normalizeWhatsAppNumber(input: string) {
  let phone = (input || "").replace(/\D/g, "").replace(/^0+/, "");
  if (phone.length === 10 || phone.length === 11) {
    phone = `55${phone}`;
  }
  return phone;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, imageBase64, totalPoints, streakDays, answers, questions, action } = await req.json();

    console.log("📥 Recebido pedido:", { userId, action, totalPoints, streakDays });

    // Se a ação for gerar análise, usa IA
    if (action === "generate-analysis") {
      if (!answers || !questions) {
        throw new Error("answers e questions são obrigatórios para gerar análise");
      }

      console.log("🤖 Gerando análise com Lovable AI...");

      // Criar cliente Supabase para buscar nome do usuário
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", userId)
        .maybeSingle();

      const userName = profile?.full_name?.split(' ')[0] || "Amigo(a)";

      // Formatar respostas para o prompt
      const formattedAnswers = questions.map((q: any) => {
        const answer = answers[q.id] || "Não respondido";
        return `- ${q.question}: ${answer}`;
      }).join('\n');

      const prompt = `Você é Dr. Vital, um médico carinhoso, motivador e especialista em saúde preventiva do Instituto dos Sonhos.

O paciente ${userName} completou suas reflexões diárias. Analise as respostas e gere uma análise personalizada.

RESPOSTAS DO PACIENTE:
${formattedAnswers}

PONTUAÇÃO: ${totalPoints} pontos
SEQUÊNCIA: ${streakDays} dias consecutivos

INSTRUÇÕES:
1. Gere uma ANÁLISE (máximo 150 palavras) interpretando cada resposta com insights médicos acolhedores. Use emojis relevantes (💧😴⚡🏃‍♂️🙏).
2. Gere uma RECOMENDAÇÃO (máximo 50 palavras) com uma dica prática e motivacional para amanhã.

FORMATO DE RESPOSTA (JSON):
{
  "analysis": "sua análise aqui com emojis",
  "recommendation": "sua recomendação aqui"
}

Seja caloroso, use o nome do paciente, e surpreenda com insights úteis!`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("❌ Erro Lovable AI:", aiResponse.status, errorText);
        throw new Error(`Erro ao gerar análise: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";

      console.log("✅ Resposta IA:", content);

      // Parse JSON da resposta
      let analysis = "";
      let recommendation = "";

      try {
        // Extrair JSON da resposta (pode vir com markdown)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          analysis = parsed.analysis || "";
          recommendation = parsed.recommendation || "";
        }
      } catch (parseError) {
        console.error("⚠️ Erro ao parsear JSON, usando resposta direta");
        analysis = content;
        recommendation = "Continue mantendo suas reflexões diárias!";
      }

      return new Response(
        JSON.stringify({
          success: true,
          userName,
          analysis,
          recommendation,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ação padrão: enviar imagem via WhatsApp
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    if (!imageBase64) {
      throw new Error("imageBase64 é obrigatório");
    }

    console.log("📸 Enviando print via WhatsApp...");

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("❌ Erro ao buscar perfil:", profileError);
      throw new Error("Usuário não encontrado");
    }

    if (!profile.phone) {
      throw new Error("Usuário sem telefone cadastrado");
    }

    const firstName = profile.full_name?.split(' ')[0] || "Amigo(a)";
    const phone = normalizeWhatsAppNumber(profile.phone);

    console.log(`👤 Usuário: ${firstName}, Telefone: ${phone}`);

    // Legenda para a imagem
    const caption = `🩺 *Dr. Vital - Análise Personalizada*\n\n✨ +${totalPoints} pontos hoje!\n🔥 ${streakDays || 1} dias de sequência\n\n_${firstName}, sua análise completa está acima!_\n\n— *Instituto dos Sonhos* 💚`;

    // Enviar imagem via Evolution API
    console.log("📤 Enviando imagem via Evolution API...");

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
        fileName: `dr-vital-analise-${Date.now()}.png`,
        caption: caption,
        delay: 1000,
      }),
    });

    let responseData: any = null;
    try {
      responseData = await imgResponse.json();
    } catch {
      responseData = await imgResponse.text();
    }

    console.log("📤 Resposta Evolution:", imgResponse.ok, JSON.stringify(responseData));

    // Verificar se o número existe no WhatsApp
    const exists = responseData?.response?.message?.[0]?.exists;
    if (!imgResponse.ok || exists === false) {
      throw new Error(
        exists === false
          ? "Seu número não foi encontrado no WhatsApp. Verifique o DDI (ex: 5511999999999)."
          : "Falha ao enviar para o WhatsApp. Tente novamente."
      );
    }

    // Log no banco
    await supabase.from("ai_system_logs").insert({
      user_id: userId,
      operation: "whatsapp_dr_vital_analysis",
      service_name: "evolution_api",
      status: "success",
      details: {
        totalPoints,
        streakDays,
        imageSize: imageBase64.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Análise do Dr. Vital enviada via WhatsApp!",
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
