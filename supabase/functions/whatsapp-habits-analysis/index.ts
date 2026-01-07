import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

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
    const { userId, imageBase64, totalPoints, streakDays } = await req.json();

    console.log("📸 Recebido pedido para enviar print:", { userId, totalPoints, streakDays });

    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    if (!imageBase64) {
      throw new Error("imageBase64 é obrigatório");
    }

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

    // Montar legenda simples
    const caption = `📊 *Reflexões do Dia*\n\n✨ +${totalPoints} pontos\n🔥 ${streakDays || 1} dias de sequência\n\n_${firstName}, continue assim!_\n\n— *Dr. Vital* 🩺\n_Instituto dos Sonhos_`;

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
        fileName: `reflexoes-${Date.now()}.png`,
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
      operation: "whatsapp_habits_screenshot",
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
        message: "Print enviado via WhatsApp!",
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
