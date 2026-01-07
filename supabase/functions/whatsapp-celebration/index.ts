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

    console.log(`🎉 Enviando celebração: ${type} para ${userId}`);

    // Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select(`
        user_id,
        full_name,
        phone,
        user_notification_settings!inner(
          whatsapp_enabled
        )
      `)
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      throw new Error("Usuário não encontrado");
    }

    if (!user.phone) {
      throw new Error("Usuário sem telefone cadastrado");
    }

    const settings = Array.isArray(user.user_notification_settings) 
      ? user.user_notification_settings[0] 
      : user.user_notification_settings;
    if (!settings?.whatsapp_enabled) {
      return new Response(JSON.stringify({ 
        success: false, 
        reason: "WhatsApp desabilitado pelo usuário" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstName = user.full_name?.split(" ")[0] || "Campeão";
    let celebrationMessage = "";

    switch (type) {
      case "achievement":
        celebrationMessage = `🏆 *CONQUISTA DESBLOQUEADA!*

Parabéns, ${firstName}! 🎊

Você acabou de desbloquear:
${data.achievementIcon || "🌟"} *${data.achievementName || "Nova Conquista"}*

Cada conquista representa seu esforço e dedicação. Continue assim! 💪

_Acesse o app para ver todas as suas conquistas!_`;
        break;

      case "weight_milestone":
        const weightLost = Math.abs(data.weightLost || 0);
        celebrationMessage = `⚖️ *MARCO DE PESO ATINGIDO!*

${firstName}, você é incrível! 🎉

Você perdeu *${weightLost.toFixed(1)}kg*! 📉

Isso representa:
• Disciplina e consistência 💪
• Escolhas conscientes 🥗
• Compromisso com sua saúde ❤️

Celebre essa vitória! Você merece! 🎊

_Continue acompanhando seu progresso no app!_`;
        break;

      case "streak_milestone":
        const streakDays = data.streakDays || 7;
        let streakEmoji = "🔥";
        let streakMessage = "";
        
        if (streakDays >= 30) {
          streakEmoji = "👑";
          streakMessage = "Você é uma LENDA!";
        } else if (streakDays >= 14) {
          streakEmoji = "💎";
          streakMessage = "Você está IMPARÁVEL!";
        } else if (streakDays >= 7) {
          streakEmoji = "⭐";
          streakMessage = "Uma semana inteira de dedicação!";
        }

        celebrationMessage = `${streakEmoji} *${streakDays} DIAS DE STREAK!*

${firstName}, ${streakMessage} 🎉

Você manteve o foco por *${streakDays} dias consecutivos*!

Isso mostra:
• Comprometimento real 💯
• Hábitos sendo formados 🧠
• Resultados chegando 📈

Não pare agora! Cada dia conta! 🚀

_Sua jornada está no app!_`;
        break;

      case "goal_completed":
        celebrationMessage = `🎯 *META ATINGIDA!*

${firstName}, VOCÊ CONSEGUIU! 🎊🎉🏆

Você completou: *${data.goalName || "sua meta"}*

Esse é o resultado de:
• Muito esforço 💪
• Consistência 📊
• Não desistir nos dias difíceis 🌟

Você provou que é capaz! Hora de definir novos objetivos! 🚀

_Celebre e planeje seus próximos passos no app!_`;
        break;

      default:
        celebrationMessage = `🎉 *PARABÉNS, ${firstName}!*

Você está fazendo um trabalho incrível cuidando da sua saúde! Continue assim! 💪`;
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

    // Registrar log
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
