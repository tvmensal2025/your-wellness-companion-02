import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SOFIA - Voz para motivação diária
const SOFIA_PROMPT = `Você é a SOFIA, nutricionista virtual do Instituto dos Sonhos.

PERSONALIDADE:
- Amiga próxima e acolhedora
- Motivacional sem ser forçada
- Empática e compreensiva
- Celebra cada pequena vitória

TOM DE VOZ:
- Linguagem simples e direta
- Como uma amiga conversando pelo WhatsApp
- Positivo e encorajador
- NUNCA usa culpa, medo ou cobrança

FORMATO DA MENSAGEM:
1. ⚠️ SEMPRE iniciar com o nome em negrito: *Nome*,
2. Mensagem curta (máx 250 caracteres)
3. Use 2-3 emojis relevantes (💚 🌟 ✨ 💪 😊 ☀️)
4. Mencione algo específico dos dados (se disponível)
5. Termine com incentivo para o dia
6. SEMPRE terminar com assinatura:

Com carinho,
Sofia 💚
_Instituto dos Sonhos_

PROIBIDO:
- Asteriscos duplos para negrito (use apenas *texto*)
- Cobranças ou culpa
- Mensagens longas
- Tom médico/técnico`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      throw new Error("Evolution API não configurada");
    }

    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY não configurada");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    let targetUserId: string | null = null;
    try {
      const body = await req.json();
      targetUserId = body?.userId || null;
    } catch {
      // Sem body = execução via cron
    }

    console.log("🌅 Sofia: Iniciando envio de mensagens motivacionais...");

    // Buscar usuários elegíveis
    let settingsQuery = supabase
      .from("user_notification_settings")
      .select("user_id, whatsapp_enabled, whatsapp_daily_motivation")
      .eq("whatsapp_enabled", true)
      .eq("whatsapp_daily_motivation", true);

    if (targetUserId) {
      settingsQuery = settingsQuery.eq("user_id", targetUserId);
    }

    const { data: settingsRows, error: settingsError } = await settingsQuery;

    if (settingsError) {
      console.error("Erro ao buscar configurações:", settingsError);
      throw new Error(settingsError.message);
    }

    const eligibleUserIds = (settingsRows || []).map((s: any) => s.user_id).filter(Boolean);

    if (eligibleUserIds.length === 0) {
      console.log("📱 0 usuários elegíveis");
      return new Response(
        JSON.stringify({ success: true, processed: 0, sent: 0, results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let profilesQuery = supabase
      .from("profiles")
      .select("user_id, full_name, phone")
      .in("user_id", eligibleUserIds)
      .not("phone", "is", null);

    if (targetUserId) {
      profilesQuery = profilesQuery.eq("user_id", targetUserId);
    }

    const { data: users, error: usersError } = await profilesQuery;

    if (usersError) {
      throw new Error(usersError.message);
    }

    const eligibleUsers = users || [];
    console.log(`📱 ${eligibleUsers.length} usuários elegíveis`);

    const results: any[] = [];

    for (const user of eligibleUsers) {
      try {
        console.log(`\n👤 Processando: ${user.full_name}`);

        const firstName = user.full_name?.split(" ")[0] || "você";
        const today = new Date().toISOString().split("T")[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        // Buscar dados para personalização
        const { data: weightData } = await supabase
          .from("weight_measurements")
          .select("peso_kg, measurement_date")
          .eq("user_id", user.user_id)
          .gte("measurement_date", weekAgo)
          .order("measurement_date", { ascending: false })
          .limit(2);

        const { data: missionData } = await supabase
          .from("daily_mission_sessions")
          .select("is_completed, streak_days, total_points")
          .eq("user_id", user.user_id)
          .gte("date", weekAgo)
          .order("date", { ascending: false })
          .limit(7);

        const { data: moodData } = await supabase
          .from("mood_tracking")
          .select("day_rating, energy_level")
          .eq("user_id", user.user_id)
          .gte("date", weekAgo)
          .order("date", { ascending: false })
          .limit(3);

        const { data: achievements } = await supabase
          .from("conquistas_do_usuário")
          .select("nome_conquista, data_desbloqueio")
          .eq("user_id", user.user_id)
          .gte("data_desbloqueio", weekAgo)
          .limit(3);

        // Calcular dados
        const weightChange = weightData && weightData.length >= 2 
          ? (weightData[0].peso_kg - weightData[1].peso_kg).toFixed(1)
          : null;
        
        const streak = missionData?.[0]?.streak_days || 0;
        const missionsCompleted = missionData?.filter((m: any) => m.is_completed).length || 0;
        const avgMood = moodData?.length 
          ? (moodData.reduce((sum: number, m: any) => sum + m.day_rating, 0) / moodData.length).toFixed(1)
          : null;

        // Gerar mensagem com Sofia
        let motivationalMessage = "";

        const contextPrompt = `${SOFIA_PROMPT}

DADOS DO USUÁRIO *${firstName}*:
- Streak atual: ${streak} dias consecutivos
- Missões completadas esta semana: ${missionsCompleted}/7
- Variação de peso: ${weightChange ? `${weightChange}kg` : "não registrado"}
- Humor médio: ${avgMood ? `${avgMood}/10` : "não registrado"}
- Conquistas recentes: ${achievements?.map((a: any) => a.nome_conquista).join(", ") || "nenhuma"}

Crie uma mensagem de bom dia PERSONALIZADA para *${firstName}*.
Use os dados acima para tornar a mensagem especial.

Responda APENAS com a mensagem, iniciando com *${firstName}*,`;

        try {
          const aiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_AI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: contextPrompt }] }],
                generationConfig: {
                  temperature: 0.8,
                  maxOutputTokens: 300,
                },
              }),
            }
          );

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            motivationalMessage = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
            
            // Garantir que começa com nome em negrito
            if (!motivationalMessage.startsWith(`*${firstName}*`)) {
              motivationalMessage = `*${firstName}*, ${motivationalMessage.replace(/^\*?[^,*]+\*?,?\s*/i, "")}`;
            }
            
            console.log("✅ Mensagem gerada pela Sofia");
          } else {
            console.error("Erro Gemini:", await aiResponse.text());
          }
        } catch (aiError) {
          console.error("Erro na IA:", aiError);
        }

        // Fallback se IA falhar
        if (!motivationalMessage) {
          const greetings = [
            `*${firstName}*, bom dia! ☀️`,
            `*${firstName}*, olá! 🌟`,
            `*${firstName}*, bom dia, guerreiro(a)! 💪`
          ];
          
          const motivations = [
            "Hoje é um novo dia para cuidar de você!",
            "Cada pequeno passo te aproxima do seu objetivo.",
            "Sua saúde agradece cada escolha consciente.",
            "Você está no caminho certo. Continue assim!"
          ];

          const greeting = greetings[Math.floor(Math.random() * greetings.length)];
          const motivation = motivations[Math.floor(Math.random() * motivations.length)];
          
          motivationalMessage = `${greeting}\n\n${motivation}`;
          
          if (streak > 0) {
            motivationalMessage += `\n\n🔥 ${streak} dias de streak! Você está arrasando!`;
          }
          
          motivationalMessage += `\n\nCom carinho,\nSofia 💚\n_Instituto dos Sonhos_`;
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
            text: motivationalMessage,
            delay: 1200,
          }),
        });

        const evolutionData = await evolutionResponse.json();

        await supabase.from("whatsapp_evolution_logs").insert({
          user_id: user.user_id,
          phone: phone,
          message_type: "daily_motivation",
          message_content: motivationalMessage,
          evolution_response: evolutionData,
          status: evolutionResponse.ok ? "sent" : "failed",
          error_message: evolutionResponse.ok ? null : JSON.stringify(evolutionData),
        });

        results.push({
          userId: user.user_id,
          name: user.full_name,
          success: evolutionResponse.ok,
          message: motivationalMessage.substring(0, 50) + "...",
        });

        console.log(`✅ Mensagem enviada para ${user.full_name}`);
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (userError) {
        console.error(`❌ Erro ao processar ${user.full_name}:`, userError);
        results.push({
          userId: user.user_id,
          name: user.full_name,
          success: false,
          error: userError instanceof Error ? userError.message : "Erro desconhecido",
        });
      }
    }

    console.log(`\n📊 Resumo: ${results.filter(r => r.success).length}/${results.length} mensagens enviadas`);

    return new Response(JSON.stringify({ 
      success: true, 
      processed: results.length,
      sent: results.filter(r => r.success).length,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Erro geral:", error);
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
