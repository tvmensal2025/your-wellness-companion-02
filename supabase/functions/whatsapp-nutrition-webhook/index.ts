import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhook = await req.json();
    console.log("[WhatsApp Nutrition] Webhook recebido:", JSON.stringify(webhook).slice(0, 500));

    // Ignorar eventos que não são mensagens (o provedor pode enviar formatos diferentes)
    const event = String(webhook.event || "").toLowerCase();
    const isUpsert = event === "messages.upsert" || event === "messages_upsert";
    if (!isUpsert) {
      console.log("[WhatsApp Nutrition] Evento ignorado:", webhook.event);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // Ignorar mensagens enviadas por nós
    if (webhook.data?.key?.fromMe) {
      console.log("[WhatsApp Nutrition] Mensagem própria ignorada");
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // Extrair dados da mensagem
    const remoteJid = webhook.data?.key?.remoteJid || "";
    const phone = remoteJid.replace("@s.whatsapp.net", "").replace("@g.us", "");
    const message = webhook.data?.message || {};
    const pushName = webhook.data?.pushName || "Usuário";

    console.log(`[WhatsApp Nutrition] Mensagem de ${phone} (${pushName})`);

    // Encontrar usuário pelo telefone
    const user = await findUserByPhone(phone);
    if (!user) {
      console.log("[WhatsApp Nutrition] Usuário não encontrado para telefone:", phone);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    console.log(`[WhatsApp Nutrition] Usuário encontrado: ${user.id}`);

    // Verificar se há análise pendente de confirmação
    const pending = await getPendingConfirmation(user.id);

    // Extrair texto da mensagem
    const messageText = extractText(message);

    if (pending?.waiting_confirmation && messageText) {
      // Usuário está respondendo SIM/NÃO
      console.log("[WhatsApp Nutrition] Processando confirmação:", messageText);
      await handleConfirmation(user, pending, messageText, phone);
    } else if (hasImage(message)) {
      // Nova foto - analisar com Sofia
      console.log("[WhatsApp Nutrition] Processando imagem...");
      await processImage(user, phone, message, webhook);
    } else if (messageText) {
      // Texto descrevendo refeição
      console.log("[WhatsApp Nutrition] Processando texto:", messageText);
      await processText(user, phone, messageText);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// =============== FUNÇÕES AUXILIARES ===============

async function findUserByPhone(phone: string): Promise<{ id: string; email: string } | null> {
  // Limpar telefone
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("55")) {
    cleanPhone = cleanPhone.substring(2);
  }

  // Buscar na tabela profiles
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, email, phone")
    .or(`phone.ilike.%${cleanPhone}%,phone.ilike.%${phone}%`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[WhatsApp Nutrition] Erro ao buscar usuário:", error);
    return null;
  }

  if (data) {
    return { id: data.user_id, email: data.email };
  }

  return null;
}

async function getPendingConfirmation(userId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("whatsapp_pending_nutrition")
    .select("*")
    .eq("user_id", userId)
    .eq("waiting_confirmation", true)
    .eq("is_processed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[WhatsApp Nutrition] Erro ao buscar pendente:", error);
    return null;
  }

  return data;
}

function extractText(message: any): string {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    ""
  ).trim();
}

function hasImage(message: any): boolean {
  return !!message.imageMessage;
}

function isConfirmationPositive(text: string): boolean {
  const positive = ["sim", "s", "yes", "y", "ok", "1", "✅", "confirmo", "confirma", "certo", "isso"];
  return positive.includes(text.toLowerCase().trim());
}

function isConfirmationNegative(text: string): boolean {
  const negative = ["não", "nao", "n", "no", "❌", "errado", "incorreto", "0"];
  return negative.includes(text.toLowerCase().trim());
}

function detectMealType(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "cafe_da_manha";
  if (hour >= 10 && hour < 12) return "lanche_manha";
  if (hour >= 12 && hour < 15) return "almoco";
  if (hour >= 15 && hour < 18) return "lanche_tarde";
  if (hour >= 18 && hour < 21) return "jantar";
  return "ceia";
}

function formatMealType(mealType: string): string {
  const types: Record<string, string> = {
    cafe_da_manha: "☕ Café da Manhã",
    lanche_manha: "🍎 Lanche da Manhã",
    almoco: "🍽️ Almoço",
    lanche_tarde: "🥤 Lanche da Tarde",
    jantar: "🌙 Jantar",
    ceia: "🌃 Ceia",
  };
  return types[mealType] || mealType;
}

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.error("[WhatsApp Nutrition] Evolution API não configurada");
    return;
  }

  let formattedPhone = phone.replace(/\D/g, "");
  if (!formattedPhone.startsWith("55")) {
    formattedPhone = "55" + formattedPhone;
  }

  try {
    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
        delay: 1200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[WhatsApp Nutrition] Erro ao enviar mensagem:", errorData);
    } else {
      console.log("[WhatsApp Nutrition] Mensagem enviada com sucesso");
    }
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao enviar WhatsApp:", error);
  }
}

async function getDailyTotal(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("nutrition_tracking")
    .select("calories")
    .eq("user_id", userId)
    .eq("date", today);

  if (error) {
    console.error("[WhatsApp Nutrition] Erro ao buscar total diário:", error);
    return 0;
  }

  return data?.reduce((sum, item) => sum + (item.calories || 0), 0) || 0;
}

// =============== PROCESSAMENTO DE IMAGEM ===============

async function processImage(user: { id: string }, phone: string, message: any, webhook: any): Promise<void> {
  try {
    const contentTypeHint = message?.imageMessage?.mimetype || "image/jpeg";

    const uploadBytesToStorage = async (bytes: Uint8Array, contentType: string): Promise<string | null> => {
      const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      const fileName = `whatsapp/${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(fileName, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), { contentType, upsert: true });

      if (uploadError) {
        console.error("[WhatsApp Nutrition] Erro no upload:", uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(fileName);
      return urlData.publicUrl || null;
    };

    const base64ToBytes = (base64: string): Uint8Array => {
      const clean = base64.includes(",") ? base64.split(",")[1] : base64;
      const bin = atob(clean);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    };

    const uploadBase64ToStorage = async (base64: string, contentType: string): Promise<string | null> => {
      const ct = base64.startsWith("data:") ? base64.slice(5, base64.indexOf(";")) : contentType;
      return uploadBytesToStorage(base64ToBytes(base64), ct || contentType);
    };

    const tryGetBase64FromEvolution = async (): Promise<string | null> => {
      if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) return null;

      try {
        const base64Response = await fetch(
          `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${EVOLUTION_INSTANCE}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: EVOLUTION_API_KEY,
            },
            body: JSON.stringify({
              message: {
                key: webhook.data?.key,
                message: webhook.data?.message,
              },
            }),
          }
        );

        if (!base64Response.ok) {
          console.error("[WhatsApp Nutrition] getBase64FromMedia falhou:", await base64Response.text());
          return null;
        }

        const payload = await base64Response.json();
        return payload?.base64 || payload?.data?.base64 || null;
      } catch (e) {
        console.error("[WhatsApp Nutrition] Erro no getBase64FromMedia:", e);
        return null;
      }
    };

    const uploadFromUrlToStorage = async (url: string, contentType: string): Promise<string | null> => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error("[WhatsApp Nutrition] Falha ao baixar mídia:", res.status, await res.text());
          return null;
        }
        const ct = res.headers.get("content-type") || contentType;
        const bytes = new Uint8Array(await res.arrayBuffer());
        return uploadBytesToStorage(bytes, ct);
      } catch (e) {
        console.error("[WhatsApp Nutrition] Erro ao baixar mídia:", e);
        return null;
      }
    };

    let imageUrl: string | null = null;

    // 1) Base64 direto do webhook (o lugar varia conforme a config)
    const directBase64 =
      webhook?.data?.message?.imageMessage?.base64 ??
      webhook?.data?.message?.base64 ??
      message?.imageMessage?.base64 ??
      message?.base64;

    if (directBase64) {
      console.log("[WhatsApp Nutrition] Base64 veio no webhook");
      imageUrl = await uploadBase64ToStorage(directBase64, contentTypeHint);
    }

    // 2) Buscar base64 via Evolution (mais confiável que URL do WhatsApp)
    if (!imageUrl) {
      console.log("[WhatsApp Nutrition] Base64 não veio no webhook; tentando via Evolution...");
      const evoBase64 = await tryGetBase64FromEvolution();
      if (evoBase64) {
        imageUrl = await uploadBase64ToStorage(evoBase64, contentTypeHint);
      }
    }

    // 3) Último fallback: baixar URL e subir para o storage
    if (!imageUrl) {
      const mediaUrl = message?.imageMessage?.mediaUrl || message?.imageMessage?.url;
      if (mediaUrl) {
        console.log("[WhatsApp Nutrition] Fallback: baixando URL da mídia");
        imageUrl = await uploadFromUrlToStorage(mediaUrl, contentTypeHint);
      }
    }

    if (!imageUrl) {
      console.error("[WhatsApp Nutrition] Não foi possível obter a imagem");
      await sendWhatsApp(phone, "❌ Não consegui processar sua foto. Tente enviar novamente!");
      return;
    }

    console.log("[WhatsApp Nutrition] URL pública da imagem:", imageUrl);

    // Chamar sofia-image-analysis
    const { data: analysis, error: analysisError } = await supabase.functions.invoke("sofia-image-analysis", {
      body: {
        imageUrl,
        userId: user.id,
        userContext: { currentMeal: detectMealType() },
      },
    });

    if (analysisError || !analysis) {
      console.error("[WhatsApp Nutrition] Erro na análise:", analysisError);
      await sendWhatsApp(phone, "❌ Erro ao analisar sua foto. Tente novamente!");
      return;
    }

    console.log("[WhatsApp Nutrition] Análise completa:", JSON.stringify(analysis).slice(0, 500));

    // Formatar lista de alimentos
    const detectedFoods = analysis.detectedFoods || analysis.foods || [];
    if (detectedFoods.length === 0) {
      await sendWhatsApp(phone, "🤔 Não consegui identificar alimentos na foto. Tente enviar uma foto mais clara do prato!");
      return;
    }

    const foodsList = detectedFoods
      .map((f: any) => `• ${f.nome || f.name} (${f.quantidade || f.grams || "?"}g)`)
      .join("\n");

    const totalCalories = analysis.totalCalories || analysis.total_kcal || 0;

    const confirmMessage =
      `🍽️ *Analisei sua refeição!*\n\n` +
      `${foodsList}\n\n` +
      `📊 *Total estimado: ~${Math.round(totalCalories)} kcal*\n\n` +
      `Está correto? Responda:\n` +
      `✅ *SIM* para confirmar\n` +
      `❌ *NÃO* para corrigir`;

    await sendWhatsApp(phone, confirmMessage);

    // Salvar análise pendente
    const { error: insertError } = await supabase.from("whatsapp_pending_nutrition").upsert(
      {
        user_id: user.id,
        phone: phone,
        meal_type: detectMealType(),
        image_url: imageUrl,
        analysis_result: analysis,
        waiting_confirmation: true,
        confirmed: null,
        is_processed: false,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      },
      {
        onConflict: "user_id",
      }
    );

    if (insertError) {
      console.error("[WhatsApp Nutrition] Erro ao salvar pendente:", insertError);
    }
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao processar imagem:", error);
    await sendWhatsApp(phone, "❌ Ocorreu um erro. Tente novamente!");
  }
}
// =============== PROCESSAMENTO DE TEXTO ===============

async function processText(user: { id: string }, phone: string, text: string): Promise<void> {
  try {
    // Verificar se é uma descrição de refeição (contém palavras-chave de alimentos)
    const foodKeywords = ["comi", "almocei", "jantei", "tomei", "bebi", "arroz", "feijão", "carne", "frango", "salada", "pão", "café", "leite"];
    const isFood = foodKeywords.some((k) => text.toLowerCase().includes(k));

    if (!isFood) {
      // Mensagem genérica - talvez o usuário está só conversando
      console.log("[WhatsApp Nutrition] Texto não parece ser sobre comida:", text);
      return;
    }

    // Chamar sofia-deterministic para extrair alimentos do texto
    const { data: analysis, error: analysisError } = await supabase.functions.invoke("sofia-deterministic", {
      body: {
        user_input: text,
        user_id: user.id,
        analysis_type: "text_extraction",
      },
    });

    if (analysisError || !analysis) {
      console.error("[WhatsApp Nutrition] Erro na análise de texto:", analysisError);
      return;
    }

    const foods = analysis.detected_foods || analysis.foods || [];
    if (foods.length === 0) {
      await sendWhatsApp(phone, "🤔 Não consegui identificar os alimentos. Pode descrever melhor ou enviar uma foto?");
      return;
    }

    const foodsList = foods
      .map((f: any) => `• ${f.name || f.nome} (${f.grams || f.quantidade || "?"}g)`)
      .join("\n");

    const totalCalories = analysis.nutrition_data?.total_kcal || analysis.total_kcal || 0;

    const confirmMessage = 
      `🍽️ *Entendi! Você comeu:*\n\n` +
      `${foodsList}\n\n` +
      `📊 *Total estimado: ~${Math.round(totalCalories)} kcal*\n\n` +
      `Está correto? Responda:\n` +
      `✅ *SIM* para confirmar\n` +
      `❌ *NÃO* para corrigir`;

    await sendWhatsApp(phone, confirmMessage);

    // Salvar análise pendente
    await supabase.from("whatsapp_pending_nutrition").upsert({
      user_id: user.id,
      phone: phone,
      meal_type: detectMealType(),
      analysis_result: { detectedFoods: foods, totalCalories },
      waiting_confirmation: true,
      confirmed: null,
      is_processed: false,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }, {
      onConflict: "user_id",
    });

  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao processar texto:", error);
  }
}

// =============== PROCESSAMENTO DE CONFIRMAÇÃO ===============

async function handleConfirmation(
  user: { id: string },
  pending: any,
  messageText: string,
  phone: string
): Promise<void> {
  try {
    if (isConfirmationPositive(messageText)) {
      console.log("[WhatsApp Nutrition] Confirmação positiva recebida");

      // Extrair alimentos da análise pendente
      const analysis = pending.analysis_result || {};
      const detectedFoods = analysis.detectedFoods || analysis.foods || [];

      // Chamar sofia-deterministic para cálculo exato
      const { data: deterministicResult, error: deterministicError } = await supabase.functions.invoke(
        "sofia-deterministic",
        {
          body: {
            detected_foods: detectedFoods.map((f: any) => ({
              name: f.nome || f.name,
              grams: f.quantidade || f.grams || 100,
            })),
            user_id: user.id,
            analysis_type: "nutritional_sum",
          },
        }
      );

      if (deterministicError) {
        console.error("[WhatsApp Nutrition] Erro no cálculo:", deterministicError);
      }

      const nutritionData = deterministicResult?.nutrition_data || {
        total_kcal: analysis.totalCalories || 0,
        total_proteina: 0,
        total_carbo: 0,
        total_gordura: 0,
      };

      // Salvar em nutrition_tracking
      const today = new Date().toISOString().split("T")[0];
      const { data: tracking, error: trackingError } = await supabase
        .from("nutrition_tracking")
        .insert({
          user_id: user.id,
          date: today,
          meal_type: pending.meal_type || detectMealType(),
          source: "whatsapp",
          calories: nutritionData.total_kcal,
          protein_g: nutritionData.total_proteina,
          carbs_g: nutritionData.total_carbo,
          fat_g: nutritionData.total_gordura,
          fiber_g: nutritionData.total_fibra || 0,
          notes: `Registrado via WhatsApp`,
        })
        .select()
        .single();

      if (trackingError) {
        console.error("[WhatsApp Nutrition] Erro ao salvar tracking:", trackingError);
        await sendWhatsApp(phone, "❌ Erro ao registrar. Tente novamente!");
        return;
      }

      // Atualizar pendente como processado
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({
          waiting_confirmation: false,
          confirmed: true,
          is_processed: true,
          nutrition_tracking_id: tracking?.id,
        })
        .eq("id", pending.id);

      // Buscar total do dia
      const dailyTotal = await getDailyTotal(user.id);

      // Responder com sucesso
      const successMessage =
        `✅ *Refeição registrada!*\n\n` +
        `${formatMealType(pending.meal_type || detectMealType())}: ${Math.round(nutritionData.total_kcal)} kcal\n` +
        `📊 Total do dia: ${Math.round(dailyTotal)} kcal\n\n` +
        `Continue assim! 💪`;

      await sendWhatsApp(phone, successMessage);

    } else if (isConfirmationNegative(messageText)) {
      console.log("[WhatsApp Nutrition] Confirmação negativa recebida");

      // Limpar pendente
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({
          waiting_confirmation: false,
          confirmed: false,
        })
        .eq("id", pending.id);

      // Pedir correção
      await sendWhatsApp(
        phone,
        `Sem problemas! 📝\n\n` +
        `Me conta o que estava errado:\n` +
        `📸 Manda outra foto\n` +
        `✍️ Ou descreve o que comeu`
      );
    } else {
      // Resposta não reconhecida
      await sendWhatsApp(
        phone,
        `🤔 Não entendi sua resposta.\n\n` +
        `Responda *SIM* para confirmar ou *NÃO* para corrigir.`
      );
    }
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao processar confirmação:", error);
    await sendWhatsApp(phone, "❌ Ocorreu um erro. Tente novamente!");
  }
}
