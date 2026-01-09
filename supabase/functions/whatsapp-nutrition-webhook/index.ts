import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Services
import { findUserByPhone, UserInfo } from "./services/user-service.ts";
import { getPendingConfirmation, getPendingMedical, checkAndClearExpiredPending } from "./services/pending-service.ts";
import { interpretUserIntent } from "./services/intent-service.ts";

// Handlers
import { handleTextMessage } from "./handlers/text-handler.ts";
import { handleConfirmation } from "./handlers/confirmation-handler.ts";
import { handleEdit } from "./handlers/edit-handler.ts";
import { handleMedicalResponse, processMedicalImage } from "./handlers/medical-handler.ts";
import { processAndUploadImage } from "./handlers/image-upload.ts";

// Utils
import {
  extractText,
  hasImage,
  isConfirmationPositive,
  detectMealType,
} from "./utils/message-utils.ts";
import { sendWhatsApp } from "./utils/whatsapp-sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhook = await req.json();
    console.log("[WhatsApp] Webhook recebido:", JSON.stringify(webhook).slice(0, 500));

    // Validar evento
    const event = String(webhook.event || "").toLowerCase();
    const isUpsert = event === "messages.upsert" || event === "messages_upsert";
    if (!isUpsert) {
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // Ignorar mensagem própria
    if (webhook.data?.key?.fromMe) {
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // Extrair dados
    const key = webhook.data?.key || {};
    const jid = key.remoteJidAlt || key.remoteJid || "";

    // Ignorar grupos
    if (jid.includes("@g.us")) {
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    const phone = String(jid)
      .replace("@s.whatsapp.net", "")
      .replace("@lid", "")
      .replace(/\D/g, "");

    const message = webhook.data?.message || {};
    const pushName = webhook.data?.pushName || "Usuário";

    console.log(`[WhatsApp] Mensagem de ${phone} (${pushName})`);

    // Buscar usuário
    const user = await findUserByPhone(supabase, phone);
    if (!user) {
      console.log("[WhatsApp] Usuário não encontrado:", phone);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // Buscar pendências
    const pending = await getPendingConfirmation(supabase, user.id);
    const messageText = extractText(message);

    // Verificar pendência expirada
    if (!pending && messageText) {
      const hasExpired = await checkAndClearExpiredPending(supabase, user.id, phone);
      if (hasExpired && isConfirmationPositive(messageText)) {
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }
    }

    const pendingMedical = await getPendingMedical(supabase, user.id);

    // ROTEAMENTO DE MENSAGENS

    // 1. Modo edição ativo
    if (pending?.waiting_edit && messageText) {
      await handleEdit(supabase, user, pending, messageText, phone);
    }
    // 2. Aguardando confirmação nutricional
    else if (pending?.waiting_confirmation && messageText) {
      const analysis = pending.analysis_result || {};
      const pendingFoods = analysis.detectedFoods || analysis.foods || [];
      const lower = messageText.toLowerCase().trim();

      // Verificar respostas diretas
      const directConfirm = ["1", "sim", "s", "ok", "confirmo", "confirma", "certo", "isso"].includes(lower);
      const directCancel = ["2", "não", "nao", "n", "cancela", "cancelar", "nope"].includes(lower);
      const directEdit = ["3", "editar", "edita", "corrigir", "mudar", "alterar"].includes(lower);
      const directClear = ["4", "finalizar", "limpar", "clear", "descartar"].includes(lower);

      if (directConfirm || directCancel || directEdit || directClear) {
        await handleConfirmation(supabase, user, pending, messageText, phone);
      } else {
        // Para mensagens complexas, usar IA
        const intent = await interpretUserIntent(supabase, messageText, "awaiting_confirmation", pendingFoods);

        if (["confirm", "cancel", "edit", "add_food", "remove_food", "replace_food", "clear_pending"].includes(intent.intent)) {
          await handleConfirmation(supabase, user, pending, messageText, phone);
        } else {
          await handleSmartResponseWithPending(user, phone, messageText, pendingFoods);
        }
      }
    }
    // 3. Pendência médica ativa
    else if (pendingMedical && messageText) {
      const isExpired = pendingMedical.expires_at && new Date(pendingMedical.expires_at) < new Date();

      if (isExpired) {
        await supabase
          .from("whatsapp_pending_medical")
          .update({ is_processed: true, status: "expired" })
          .eq("id", pendingMedical.id);

        await handleTextMessage(supabase, user, phone, messageText);
      } else if (pendingMedical.status === "processing") {
        await sendWhatsApp(phone,
          "⏳ *Ainda estou analisando seus exames*\n\n" +
          "Aguarde só mais um momento, assim que terminar eu envio o relatório completo.\n\n" +
          "_Dr. Vital 🩺_"
        );
      } else {
        await handleMedicalResponse(supabase, user, pendingMedical, messageText, phone);
      }
    }
    // 4. Imagem recebida
    else if (hasImage(message)) {
      await processImage(user, phone, message, webhook);
    }
    // 5. Texto sem pendência
    else if (messageText) {
      const lower = messageText.toLowerCase().trim();
      const isConfirmResponse = ["1", "2", "3", "4", "sim", "não", "nao", "s", "n", "ok", "pronto", "confirmo", "cancela"].includes(lower);

      if (isConfirmResponse) {
        await sendWhatsApp(phone,
          "✅ *Entendi!*\n\n" +
          "📸 Envie uma foto de refeição ou exame para eu analisar.\n\n" +
          "_Sofia 🥗 | Dr. Vital 🩺_"
        );
      } else {
        await handleTextMessage(supabase, user, phone, messageText);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (error) {
    console.error("[WhatsApp] Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// Funções auxiliares

async function processImage(user: UserInfo, phone: string, message: any, webhook: any): Promise<void> {
  try {
    const imageUrl = await processAndUploadImage(supabase, user.id, message, webhook);

    if (!imageUrl) {
      await sendWhatsApp(phone, "❌ Não consegui processar sua foto. Tente enviar novamente!");
      return;
    }

    // Detectar tipo de imagem
    const { data: imageTypeResult } = await supabase.functions.invoke("detect-image-type", {
      body: { imageUrl }
    });

    const imageType = imageTypeResult?.type || "OTHER";

    if (imageType === "FOOD") {
      await processFoodImage(user, phone, imageUrl);
    } else if (imageType === "MEDICAL") {
      await processMedicalImage(supabase, user, phone, imageUrl);
    } else {
      // Verificar se tem lote médico ativo
      const { data: activeMedicalBatch } = await supabase
        .from("whatsapp_pending_medical")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_processed", false)
        .in("status", ["collecting", "awaiting_confirm"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeMedicalBatch) {
        await processMedicalImage(supabase, user, phone, imageUrl);
      } else {
        await sendWhatsApp(phone,
          "📸 Recebi sua foto!\n\n" +
          "Para análise *nutricional*, envie fotos de refeições 🍽️\n" +
          "Para análise de *exames*, envie fotos de resultados 🩺\n\n" +
          "_Sofia 🥗_"
        );
      }
    }
  } catch (error) {
    console.error("[WhatsApp] Erro ao processar imagem:", error);
    await sendWhatsApp(phone, "❌ Erro ao processar sua foto. Tente novamente!");
  }
}

async function processFoodImage(user: UserInfo, phone: string, imageUrl: string): Promise<void> {
  try {
    const { data: analysis, error: analysisError } = await supabase.functions.invoke("sofia-image-analysis", {
      body: {
        imageUrl,
        userId: user.id,
        userContext: { currentMeal: detectMealType() },
      },
    });

    if (analysisError || !analysis) {
      await sendWhatsApp(phone, "❌ Erro ao analisar sua foto. Tente novamente!");
      return;
    }

    const normalizedFoods =
      analysis?.detectedFoods ??
      analysis?.foods ??
      analysis?.foods_detected ??
      analysis?.sofia_analysis?.foods_detected ??
      [];

    const detectedFoods = Array.isArray(normalizedFoods) ? normalizedFoods : [];

    if (detectedFoods.length === 0) {
      await sendWhatsApp(phone, "🤔 Não consegui identificar alimentos na foto. Tente enviar uma foto mais clara!");
      return;
    }

    const totalCalories =
      analysis?.totalCalories ??
      analysis?.total_kcal ??
      analysis?.nutrition_data?.total_kcal ??
      0;

    const mealType = detectMealType();

    // Salvar em food_history
    const foodHistoryId = await saveToFoodHistory(
      user.id,
      mealType,
      imageUrl,
      detectedFoods,
      { total_kcal: totalCalories, confidence: analysis?.confidence || 0.8 },
      JSON.stringify(analysis).slice(0, 5000),
      false,
      "whatsapp"
    );

    // Formatar mensagem
    const foodsList = detectedFoods
      .map((f: any) => {
        const name = f.nome || f.name || f.alimento || "(alimento)";
        const grams = f.quantidade ?? f.grams ?? f.g ?? "?";
        return `• ${name} (${grams}g)`;
      })
      .join("\n");

    const kcalLine = totalCalories && Number(totalCalories) > 0
      ? `📊 *Total estimado: ~${Math.round(Number(totalCalories))} kcal*\n\n`
      : "";

    const confirmMessage =
      `🍽️ *Analisei sua refeição!*\n\n` +
      `${foodsList}\n\n` +
      kcalLine +
      `───────────────\n\n` +
      `*Está correto?* Escolha:\n\n` +
      `*1* ✅ Confirmar\n` +
      `*2* ❌ Cancelar\n` +
      `*3* ✏️ Editar\n\n` +
      `_Sofia 🥗_`;

    await sendWhatsApp(phone, confirmMessage);

    // Limpar pendentes antigos e criar novo
    await supabase
      .from("whatsapp_pending_nutrition")
      .delete()
      .eq("user_id", user.id)
      .eq("waiting_confirmation", true);

    await supabase.from("whatsapp_pending_nutrition").insert({
      user_id: user.id,
      phone: phone,
      meal_type: mealType,
      image_url: imageUrl,
      analysis_result: {
        detectedFoods,
        totalCalories: Number(totalCalories) || null,
        raw: analysis,
        food_history_id: foodHistoryId,
      },
      waiting_confirmation: true,
      waiting_edit: false,
      confirmed: null,
      is_processed: false,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

  } catch (error) {
    console.error("[WhatsApp] Erro ao processar imagem de comida:", error);
    await sendWhatsApp(phone, "❌ Erro ao analisar sua foto. Tente novamente!");
  }
}

async function saveToFoodHistory(
  userId: string,
  mealType: string,
  photoUrl: string | null,
  foodItems: any[],
  nutritionData: any,
  aiAnalysis: string | null,
  confirmed: boolean = false,
  source: string = "whatsapp"
): Promise<string | null> {
  try {
    const now = new Date();
    const mealDate = now.toISOString().split("T")[0];
    const mealTime = now.toTimeString().split(" ")[0];

    const { data, error } = await supabase
      .from("food_history")
      .insert({
        user_id: userId,
        meal_date: mealDate,
        meal_time: mealTime,
        meal_type: mealType,
        photo_url: photoUrl,
        food_items: foodItems,
        total_calories: nutritionData?.total_kcal || nutritionData?.totalCalories || 0,
        total_proteins: nutritionData?.total_proteina || nutritionData?.proteins || 0,
        total_carbs: nutritionData?.total_carbo || nutritionData?.carbs || 0,
        total_fats: nutritionData?.total_gordura || nutritionData?.fats || 0,
        total_fiber: nutritionData?.total_fibra || nutritionData?.fiber || 0,
        source: source,
        confidence_score: nutritionData?.confidence || null,
        user_confirmed: confirmed,
        ai_analysis: aiAnalysis,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[WhatsApp] Erro ao salvar food_history:", error);
      return null;
    }

    return data.id;
  } catch (e) {
    console.error("[WhatsApp] Erro ao salvar food_history:", e);
    return null;
  }
}

async function handleSmartResponse(user: UserInfo, phone: string, text: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: todayMessages } = await supabase
      .from("whatsapp_message_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("message_type", "outbound")
      .gte("sent_at", today)
      .limit(1);

    const isFirstMessageToday = !todayMessages || todayMessages.length === 0;

    const { data: aiResponse, error } = await supabase.functions.invoke("whatsapp-ai-assistant", {
      body: {
        userId: user.id,
        message: text,
        conversationHistory: [],
        isFirstMessage: isFirstMessageToday,
      },
    });

    if (error) {
      console.error("[WhatsApp] Erro na IA:", error);
      await sendWhatsApp(phone,
        `Oi! 👋 Tive um probleminha técnico, mas estou aqui!\n\n` +
        `Como posso te ajudar?\n\n` +
        `📸 *Foto de refeição* → analiso calorias\n` +
        `🩺 *Foto de exame* → analiso resultados\n` +
        `💬 *Me conta o que comeu* → registro pra você\n\n` +
        `_Sofia 💚_`
      );
      return;
    }

    const responseText = aiResponse?.response || "Estou aqui para ajudar! 💚";
    const hasSignature = responseText.includes("_Sofia") || responseText.includes("_Dr. Vital");
    const personality = aiResponse?.personality || 'sofia';
    const signature = hasSignature ? "" : (personality === 'drvital'
      ? "\n\n_Dr. Vital 🩺_"
      : "\n\n_Sofia 🥗_");

    await sendWhatsApp(phone, responseText + signature);

  } catch (error) {
    console.error("[WhatsApp] Erro na resposta inteligente:", error);
    await sendWhatsApp(phone,
      "Oi! 👋 Estou aqui para ajudar com sua nutrição!\n\n" +
      "📸 Envie uma foto da refeição\n" +
      "✍️ Ou descreva o que comeu\n\n" +
      "_Sofia 🥗_"
    );
  }
}

async function handleSmartResponseWithPending(
  user: UserInfo,
  phone: string,
  text: string,
  pendingFoods: any[]
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: todayMessages } = await supabase
      .from("whatsapp_message_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("message_type", "outbound")
      .gte("sent_at", today)
      .limit(1);

    const isFirstMessageToday = !todayMessages || todayMessages.length === 0;

    const { data: aiResponse } = await supabase.functions.invoke("whatsapp-ai-assistant", {
      body: {
        userId: user.id,
        message: text,
        conversationHistory: [],
        isFirstMessage: isFirstMessageToday,
      },
    });

    let responseText = aiResponse?.response || "Estou aqui para ajudar! 💚";
    responseText = responseText.replace(/\n*_Sofia 🥗_\s*$/g, '').replace(/\n*_Dr\. Vital 🩺_\s*$/g, '');

    const foodsList = pendingFoods.slice(0, 4).map((f: any) => f.nome || f.name).join(", ");
    const pendingReminder = pendingFoods.length > 0
      ? `\n\n───────────────\n\n` +
        `⚠️ *Pendência ativa*\n\n` +
        `📋 ${foodsList}${pendingFoods.length > 4 ? '...' : ''}\n\n` +
        `Escolha uma opção:\n\n` +
        `*1* ✅ Confirmar\n` +
        `*2* ❌ Cancelar\n` +
        `*3* ✏️ Editar\n` +
        `*4* 🔄 Limpar pendência\n\n` +
        `_Sofia 🥗_`
      : "\n\n_Sofia 🥗_";

    await sendWhatsApp(phone, responseText + pendingReminder);

  } catch (error) {
    console.error("[WhatsApp] Erro na resposta com pendência:", error);
    await handleSmartResponse(user, phone, text);
  }
}
