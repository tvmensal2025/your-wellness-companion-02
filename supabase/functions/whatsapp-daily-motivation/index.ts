import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Aceitar userId opcional para envio manual
    let targetUserId: string | null = null;
    try {
      const body = await req.json();
      targetUserId = body?.userId || null;
    } catch {
      // Sem body = execução via cron para todos usuários
    }

    console.log("🌅 Iniciando envio de mensagens motivacionais...");

    // Buscar usuários elegíveis
    let query = supabase
      .from("profiles")
      .select(`
        user_id,
        full_name,
        phone,
        user_notification_settings!inner(
          whatsapp_enabled,
          whatsapp_daily_motivation
        )
      `)
      .not("phone", "is", null);

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error("Erro ao buscar usuários:", usersError);
      throw usersError;
    }

    const eligibleUsers = users?.filter((u: any) => {
      const settings = Array.isArray(u.user_notification_settings) 
        ? u.user_notification_settings[0] 
        : u.user_notification_settings;
      return settings?.whatsapp_enabled && settings?.whatsapp_daily_motivation;
    }) || [];

    console.log(`📱 ${eligibleUsers.length} usuários elegíveis para mensagem motivacional`);

    const results: any[] = [];

    for (const user of eligibleUsers) {
      try {
        console.log(`\n👤 Processando: ${user.full_name}`);

        // Buscar dados recentes do usuário para personalização
        const today = new Date().toISOString().split("T")[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        // Peso recente
        const { data: weightData } = await supabase
          .from("weight_measurements")
          .select("peso_kg, measurement_date")
          .eq("user_id", user.user_id)
          .gte("measurement_date", weekAgo)
          .order("measurement_date", { ascending: false })
          .limit(2);

        // Missões e streak
        const { data: missionData } = await supabase
          .from("daily_mission_sessions")
          .select("is_completed, streak_days, total_points")
          .eq("user_id", user.user_id)
          .gte("date", weekAgo)
          .order("date", { ascending: false })
          .limit(7);

        // Humor recente
        const { data: moodData } = await supabase
          .from("mood_tracking")
          .select("day_rating, energy_level")
          .eq("user_id", user.user_id)
          .gte("date", weekAgo)
          .order("date", { ascending: false })
          .limit(3);

        // Conquistas recentes
        const { data: achievements } = await supabase
          .from("conquistas_do_usuário")
          .select("nome_conquista, data_desbloqueio")
          .eq("user_id", user.user_id)
          .gte("data_desbloqueio", weekAgo)
          .limit(3);

        // Preparar contexto para IA
        const weightChange = weightData && weightData.length >= 2 
          ? (weightData[0].peso_kg - weightData[1].peso_kg).toFixed(1)
          : null;
        
        const streak = missionData?.[0]?.streak_days || 0;
        const missionsCompleted = missionData?.filter((m: any) => m.is_completed).length || 0;
        const avgMood = moodData?.length 
          ? (moodData.reduce((sum: number, m: any) => sum + m.day_rating, 0) / moodData.length).toFixed(1)
          : null;

        // Gerar mensagem personalizada com IA
        let motivationalMessage = "";

        if (LOVABLE_API_KEY) {
          const prompt = `Você é o Dr. Vital, assistente de saúde carinhoso e motivacional.

DADOS DO USUÁRIO ${user.full_name}:
- Streak atual: ${streak} dias consecutivos
- Missões completadas esta semana: ${missionsCompleted}/7
- Variação de peso: ${weightChange ? `${weightChange}kg` : "não registrado"}
- Humor médio: ${avgMood ? `${avgMood}/10` : "não registrado"}
- Conquistas recentes: ${achievements?.map((a: any) => a.nome_conquista).join(", ") || "nenhuma"}

INSTRUÇÕES:
1. Crie uma mensagem motivacional CURTA (máx 300 caracteres)
2. Use 1-2 emojis relevantes
3. Mencione algo específico dos dados (se disponível)
4. Seja caloroso e pessoal
5. Termine com incentivo para o dia
6. NÃO use asteriscos para negrito
7. Use formato de WhatsApp: _itálico_, não *negrito*

Responda APENAS com a mensagem, sem introduções.`;

          try {
            const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  { role: "system", content: "Você é o Dr. Vital, assistente de saúde motivacional." },
                  { role: "user", content: prompt }
                ],
                temperature: 0.8,
                max_tokens: 200
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              motivationalMessage = aiData.choices[0].message.content.trim();
            }
          } catch (aiError) {
            console.error("Erro na IA:", aiError);
          }
        }

        // Fallback se IA falhar
        if (!motivationalMessage) {
          const greetings = [
            `🌅 Bom dia, ${user.full_name?.split(" ")[0]}!`,
            `☀️ Olá, ${user.full_name?.split(" ")[0]}!`,
            `🌻 Bom dia, guerreiro(a)!`
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
            motivationalMessage += `\n\n🔥 ${streak} dias de streak! Não quebre hoje!`;
          }
        }

        // Enviar mensagem via Evolution API
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

        // Registrar log
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

        // Delay entre envios para evitar rate limiting
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
