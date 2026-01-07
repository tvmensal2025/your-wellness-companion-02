import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CelebrationType = "achievement" | "weight_milestone" | "streak_milestone" | "goal_completed";

interface CelebrationPayload {
  userId: string;
  type: CelebrationType;
  data: {
    achievementName?: string;
    achievementIcon?: string;
    weightLost?: number;
    streakDays?: number;
    goalName?: string;
  };
}

// SOFIA - Voz para celebrações (calorosa e empolgada)
const SOFIA_CELEBRATION = {
  assinatura: "Com carinho,\nSofia 💚\n_Instituto dos Sonhos_",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      throw new Error("Evolution API não configurada");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const payload: CelebrationPayload = await req.json();
    const { userId, type, data } = payload;

    if (!userId || !type) {
      throw new Error("userId e type são obrigatórios");
    }

    console.log(`🎉 Sofia celebrando: ${type} para ${userId}`);

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

    // Verificar configuração do WhatsApp
    const { data: settings, error: settingsError } = await supabase
      .from("user_notification_settings")
      .select("whatsapp_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (settingsError) {
      throw new Error(settingsError.message);
    }

    if (!settings?.whatsapp_enabled) {
      return new Response(
        JSON.stringify({ success: false, reason: "WhatsApp desabilitado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firstName = user.full_name?.split(" ")[0] || "você";
    let celebrationMessage = "";

    // TODAS as celebrações são feitas pela SOFIA (mais calorosa)
    switch (type) {
      case "achievement":
        celebrationMessage = `*${firstName}*, VOCÊ CONSEGUIU! 🏆

${data.achievementIcon || "🌟"} *Conquista Desbloqueada:*
_${data.achievementName || "Nova Conquista"}_

Cada conquista representa seu esforço e dedicação. Eu sabia que você conseguiria! ✨

Celebre essa vitória, você merece! 🎉

${SOFIA_CELEBRATION.assinatura}`;
        break;

      case "weight_milestone":
        const weightLost = Math.abs(data.weightLost || 0);
        celebrationMessage = `*${firstName}*, que notícia maravilhosa! ⚖️

Você perdeu *${weightLost.toFixed(1)}kg*! 📉

Isso representa:
💪 Disciplina e consistência
🥗 Escolhas conscientes
❤️ Amor próprio em ação

Estou tão orgulhosa de você! Cada quilo representa uma vitória sobre velhos hábitos. 🌟

_O Dr. Vital também mandou parabéns!_ 🩺

${SOFIA_CELEBRATION.assinatura}`;
        break;

      case "streak_milestone":
        const streakDays = data.streakDays || 7;
        let streakEmoji = "🔥";
        let streakMessage = "";
        
        if (streakDays >= 30) {
          streakEmoji = "👑";
          streakMessage = "Você é uma LENDA! 30 dias de pura dedicação!";
        } else if (streakDays >= 14) {
          streakEmoji = "💎";
          streakMessage = "Duas semanas IMPARÁVEIS! Você está brilhando!";
        } else if (streakDays >= 7) {
          streakEmoji = "⭐";
          streakMessage = "Uma semana inteira de dedicação! Que orgulho!";
        } else {
          streakMessage = `${streakDays} dias consecutivos! Continue assim!`;
        }

        celebrationMessage = `*${firstName}*, ${streakEmoji} *${streakDays} DIAS DE STREAK!*

${streakMessage}

Você está provando que é capaz de:
💯 Manter o compromisso
🧠 Criar novos hábitos
📈 Construir resultados reais

Não pare agora! Cada dia conta! 🚀

${SOFIA_CELEBRATION.assinatura}`;
        break;

      case "goal_completed":
        celebrationMessage = `*${firstName}*, PARABÉNS! 🎯🎊🏆

Você completou: *${data.goalName || "sua meta"}*

Esse é o resultado de:
💪 Muito esforço
📊 Consistência diária
🌟 Não desistir nos dias difíceis

Eu sempre soube que você conseguiria! Agora é hora de celebrar e definir novos objetivos ainda maiores! 🚀

_Estou aqui para te acompanhar na próxima jornada!_

${SOFIA_CELEBRATION.assinatura}`;
        break;

      default:
        celebrationMessage = `*${firstName}*, PARABÉNS! 🎉

Você está fazendo um trabalho incrível cuidando da sua saúde!

Cada passo conta, cada escolha importa. Orgulho de você! ✨

${SOFIA_CELEBRATION.assinatura}`;
    }

    // Enviar mensagem
    const phone = formatPhone(user.phone);
    
    const evolutionResponse = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: phone,
        text: celebrationMessage,
        delay: 1000,
      }),
    });

    const evolutionData = await evolutionResponse.json();

    await supabase.from("whatsapp_evolution_logs").insert({
      user_id: userId,
      phone: phone,
      message_type: `celebration_${type}`,
      message_content: celebrationMessage,
      evolution_response: evolutionData,
      status: evolutionResponse.ok ? "sent" : "failed",
      error_message: evolutionResponse.ok ? null : JSON.stringify(evolutionData),
    });

    console.log(`✅ Celebração enviada: ${user.full_name} (${type})`);

    return new Response(JSON.stringify({ 
      success: evolutionResponse.ok,
      type,
      userId,
      voice: "Sofia",
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
