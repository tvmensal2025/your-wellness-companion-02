import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { UserInfo } from "../services/user-service.ts";
import { sendWhatsApp } from "../utils/whatsapp-sender.ts";
import { detectMealType, formatMealType } from "../utils/message-utils.ts";
import {
  saveToFoodHistory,
  updateFoodHistoryConfirmation,
} from "../services/pending-service.ts";
import { getDailyTotal } from "../services/user-service.ts";

/**
 * Handle AI-powered smart response
 */
export async function handleSmartResponse(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  text: string
): Promise<void> {
  try {
    console.log("[SmartResponse] Chamando IA inteligente...");

    // Check if this is first message today
    const today = new Date().toISOString().split("T")[0];
    const { data: todayMessages } = await supabase
      .from("whatsapp_message_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("message_type", "outbound")
      .gte("sent_at", today)
      .limit(1);

    const isFirstMessageToday = !todayMessages || todayMessages.length === 0;

    const { data: aiResponse, error } = await supabase.functions.invoke(
      "whatsapp-ai-assistant",
      {
        body: {
          userId: user.id,
          message: text,
          conversationHistory: [],
          isFirstMessage: isFirstMessageToday,
        },
      }
    );

    if (error) {
      console.error("[SmartResponse] Erro na IA:", error);
      await sendWhatsApp(
        phone,
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

    // Avoid duplicate signature
    const hasSignature =
      responseText.includes("_Sofia") || responseText.includes("_Dr. Vital");
    const personality = aiResponse?.personality || "sofia";
    const signature = hasSignature
      ? ""
      : personality === "drvital"
      ? "\n\n_Dr. Vital 🩺_"
      : "\n\n_Sofia 🥗_";

    await sendWhatsApp(phone, responseText + signature);

    console.log("[SmartResponse] Resposta IA enviada:", responseText.slice(0, 100));
  } catch (error) {
    console.error("[SmartResponse] Erro na resposta inteligente:", error);
    await sendWhatsApp(
      phone,
      "Oi! 👋 Estou aqui para ajudar com sua nutrição!\n\n" +
        "📸 Envie uma foto da refeição\n" +
        "✍️ Ou descreva o que comeu\n\n" +
        "_Sofia 🥗_"
    );
  }
}

/**
 * Handle smart response with pending nutrition reminder
 */
export async function handleSmartResponseWithPending(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  text: string,
  pendingFoods: any[]
): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data: todayMessages } = await supabase
      .from("whatsapp_message_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("message_type", "outbound")
      .gte("sent_at", today)
      .limit(1);

    const isFirstMessageToday = !todayMessages || todayMessages.length === 0;

    const { data: aiResponse } = await supabase.functions.invoke(
      "whatsapp-ai-assistant",
      {
        body: {
          userId: user.id,
          message: text,
          conversationHistory: [],
          isFirstMessage: isFirstMessageToday,
        },
      }
    );

    let responseText = aiResponse?.response || "Estou aqui para ajudar! 💚";

    // Remove existing signature to add consolidated one
    responseText = responseText
      .replace(/\n*_Sofia 🥗_\s*$/g, "")
      .replace(/\n*_Dr\. Vital 🩺_\s*$/g, "");

    // Create pending reminder
    const foodsList = pendingFoods
      .slice(0, 4)
      .map((f: any) => f.nome || f.name)
      .join(", ");
    const pendingReminder =
      pendingFoods.length > 0
        ? `\n\n───────────────\n\n` +
          `⚠️ *Pendência ativa*\n\n` +
          `📋 ${foodsList}${pendingFoods.length > 4 ? "..." : ""}\n\n` +
          `Escolha uma opção:\n\n` +
          `*1* ✅ Confirmar\n` +
          `*2* ❌ Cancelar\n` +
          `*3* ✏️ Editar\n` +
          `*4* 🔄 Limpar pendência\n\n` +
          `_Sofia 🥗_`
        : "\n\n_Sofia 🥗_";

    await sendWhatsApp(phone, responseText + pendingReminder);

    console.log("[SmartResponse] Resposta IA com pendência enviada");
  } catch (error) {
    console.error("[SmartResponse] Erro na resposta com pendência:", error);
    await handleSmartResponse(supabase, user, phone, text);
  }
}

/**
 * Process text message for food analysis
 */
/**
 * Main handler for text messages
 */
export async function handleTextMessage(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  text: string
): Promise<void> {
  try {
    // Try to analyze as food first
    const wasFood = await processTextForFood(supabase, user, phone, text);
    if (!wasFood) {
      // Fall back to smart response
      await handleSmartResponse(supabase, user, phone, text);
    }
  } catch (error) {
    console.error("[TextHandler] Erro:", error);
    await handleSmartResponse(supabase, user, phone, text);
  }
}

/**
 * Process text message for food analysis
 */
async function processTextForFood(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  text: string
): Promise<boolean> {
  try {
    // Call AI to analyze text for food
    const { data: analysis, error } = await supabase.functions.invoke(
      "sofia-text-analysis",
      {
        body: {
          text,
          userId: user.id,
          contextType: "meal_log",
        },
      }
    );

    if (error || !analysis) {
      console.log("[TextHandler] Análise falhou, usando resposta inteligente");
      return false;
    }

    const foods = analysis.detected_foods || analysis.foods || [];
    if (foods.length === 0) {
      return false;
    }

    const totalCalories =
      analysis.nutrition_data?.total_kcal || analysis.total_kcal || 0;
    const mealType = detectMealType();

    // Save to food history immediately
    const foodHistoryId = await saveToFoodHistory(
      supabase,
      user.id,
      mealType,
      null, // no photo
      foods,
      { total_kcal: totalCalories },
      JSON.stringify(analysis).slice(0, 5000),
      false,
      "whatsapp_text"
    );

    console.log("[TextHandler] Refeição (texto) salva IMEDIATAMENTE:", foodHistoryId);

    const foodsList = foods
      .map((f: any) => `• ${f.name || f.nome} (${f.grams || f.quantidade || "?"}g)`)
      .join("\n");

    const confirmMessage =
      `🍽️ *Entendi! Você comeu:*\n\n` +
      `${foodsList}\n\n` +
      `📊 *Total estimado: ~${Math.round(totalCalories)} kcal*\n\n` +
      `───────────────\n\n` +
      `*Está correto?* Escolha:\n\n` +
      `*1* ✅ Confirmar\n` +
      `*2* ❌ Cancelar\n` +
      `*3* ✏️ Editar\n\n` +
      `_Sofia 🥗_`;

    await sendWhatsApp(phone, confirmMessage);

    // Clear old pendings
    await supabase
      .from("whatsapp_pending_nutrition")
      .delete()
      .eq("user_id", user.id)
      .eq("waiting_confirmation", true);

    // Create new pending
    await supabase.from("whatsapp_pending_nutrition").insert({
      user_id: user.id,
      phone: phone,
      meal_type: mealType,
      analysis_result: { detectedFoods: foods, totalCalories, food_history_id: foodHistoryId },
      waiting_confirmation: true,
      waiting_edit: false,
      confirmed: null,
      is_processed: false,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

    return true;
  } catch (error) {
    console.error("[TextHandler] Erro ao processar texto:", error);
    return false;
  }
}
