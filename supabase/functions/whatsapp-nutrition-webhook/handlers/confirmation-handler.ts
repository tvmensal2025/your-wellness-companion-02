import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { UserInfo } from "../services/user-service.ts";
import { PendingNutrition, updateFoodHistoryConfirmation } from "../services/pending-service.ts";
import { sendWhatsApp } from "../utils/whatsapp-sender.ts";
import { 
  sendInteractiveMessage, 
  sendPostConfirmation,
  sendTextMessage,
} from "../utils/whatsapp-interactive-sender.ts";
import {
  detectMealType,
  formatMealType,
  isClearPending,
  parseEditCommand,
  isAlmostConfirmation,
} from "../utils/message-utils.ts";
import { interpretUserIntent } from "../services/intent-service.ts";
import { getDailyTotal } from "../services/user-service.ts";
import { handleSmartResponseWithPending } from "./text-handler.ts";

/**
 * Handle direct confirmation (1, sim, etc)
 */
export async function handleDirectConfirm(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pending: PendingNutrition
): Promise<void> {
  console.log("[Confirmation] ✅ Confirmação DIRETA detectada");

  const analysis = pending.analysis_result || {};
  const foodHistoryId = analysis.food_history_id;

  const detectedFoods =
    analysis.detectedFoods ||
    analysis.foods ||
    analysis.foods_detected ||
    analysis.raw?.sofia_analysis?.foods_detected ||
    [];

  // Call sofia-deterministic for exact calculation
  const { data: deterministicResult } = await supabase.functions.invoke(
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

  const nutritionData = deterministicResult?.nutrition_data || {
    total_kcal: analysis.totalCalories || 0,
    total_proteina: 0,
    total_carbo: 0,
    total_gordura: 0,
  };

  // Update food_history as CONFIRMED
  if (foodHistoryId) {
    await updateFoodHistoryConfirmation(supabase, foodHistoryId, true, detectedFoods, nutritionData);
  }

  // Atualizar nutrition_tracking existente para status 'confirmed' ou criar novo
  const today = new Date().toISOString().split("T")[0];
  const existingTrackingId = analysis.nutrition_tracking_id;
  
  let tracking: any = null;
  
  if (existingTrackingId) {
    // Atualizar registro existente (criado como pendente)
    const { data: updatedTracking, error: updateError } = await supabase
      .from("nutrition_tracking")
      .update({
        total_calories: nutritionData.total_kcal || 0,
        total_proteins: nutritionData.total_proteina || 0,
        total_carbs: nutritionData.total_carbo || 0,
        total_fats: nutritionData.total_gordura || 0,
        total_fiber: nutritionData.total_fibra || 0,
        food_items: detectedFoods,
        notes: "Confirmado via WhatsApp",
        status: "confirmed",
      })
      .eq("id", existingTrackingId)
      .select()
      .single();
    
    if (!updateError) {
      tracking = updatedTracking;
      console.log("[Confirmation] ✅ nutrition_tracking atualizado para confirmed:", existingTrackingId);
    }
  }
  
  // Se não tinha registro pendente, criar novo
  if (!tracking) {
    const { data: newTracking } = await supabase
      .from("nutrition_tracking")
      .insert({
        user_id: user.id,
        date: today,
        meal_type: pending.meal_type || detectMealType(),
        total_calories: nutritionData.total_kcal || 0,
        total_proteins: nutritionData.total_proteina || 0,
        total_carbs: nutritionData.total_carbo || 0,
        total_fats: nutritionData.total_gordura || 0,
        total_fiber: nutritionData.total_fibra || 0,
        food_items: detectedFoods,
        photo_url: pending.image_url,
        notes: "Registrado via WhatsApp",
        status: "confirmed",
      })
      .select()
      .single();
    
    tracking = newTracking;
  }

  // Update pending as processed
  await supabase
    .from("whatsapp_pending_nutrition")
    .update({
      waiting_confirmation: false,
      confirmed: true,
      is_processed: true,
      nutrition_tracking_id: tracking?.id,
    })
    .eq("id", pending.id);

  const dailyTotal = await getDailyTotal(supabase, user.id);

  // Send confirmation with interactive buttons for next actions
  await sendTextMessage(
    phone,
    `✅ *Refeição registrada!*\n\n` +
      `🍽️ ${formatMealType(pending.meal_type || detectMealType())}: *${Math.round(nutritionData.total_kcal)} kcal*\n\n` +
      `📊 Total do dia: *${Math.round(dailyTotal)} kcal*\n\n` +
      `Continue assim! 💪`
  );
  
  // Send post-confirmation buttons
  await sendPostConfirmation(phone);
}

/**
 * Handle direct cancel (2, não, etc)
 */
export async function handleDirectCancel(
  supabase: SupabaseClient,
  phone: string,
  pending: PendingNutrition
): Promise<void> {
  console.log("[Confirmation] ❌ Cancelamento DIRETO detectado");

  const analysis = pending.analysis_result || {};
  const foodHistoryId = analysis.food_history_id;
  const nutritionTrackingId = analysis.nutrition_tracking_id;

  if (foodHistoryId) {
    await supabase
      .from("food_history")
      .update({ user_notes: "Cancelado pelo usuário" })
      .eq("id", foodHistoryId);
  }

  // Atualizar nutrition_tracking para status 'cancelled'
  if (nutritionTrackingId) {
    await supabase
      .from("nutrition_tracking")
      .update({ 
        status: "cancelled",
        notes: "Cancelado pelo usuário via WhatsApp" 
      })
      .eq("id", nutritionTrackingId);
    
    console.log("[Confirmation] ✅ nutrition_tracking atualizado para cancelled:", nutritionTrackingId);
  }

  await supabase
    .from("whatsapp_pending_nutrition")
    .update({
      waiting_confirmation: false,
      confirmed: false,
      is_processed: true,
    })
    .eq("id", pending.id);

  await sendInteractiveMessage(phone, {
    headerText: '❌ Registro cancelado!',
    bodyText: 'Envie uma nova foto quando quiser!',
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Nova Foto' },
      { id: 'help', title: '❓ Ajuda' },
    ],
  });
}

/**
 * Handle direct edit request (3, editar, etc)
 */
export async function handleDirectEdit(
  supabase: SupabaseClient,
  phone: string,
  pending: PendingNutrition
): Promise<void> {
  console.log("[Confirmation] ✏️ Edição DIRETA detectada");

  const analysis = pending.analysis_result || {};
  const pendingFoods = analysis.detectedFoods || analysis.foods || [];

  await supabase
    .from("whatsapp_pending_nutrition")
    .update({ waiting_edit: true })
    .eq("id", pending.id);

  const numberedList = pendingFoods
    .map((f: any, i: number) => {
      const name = f.nome || f.name || f.alimento || "(alimento)";
      const grams = f.quantidade ?? f.grams ?? f.g ?? "?";
      return `*${i + 1}.* ${name} (${grams}g)`;
    })
    .join("\n");

  await sendTextMessage(
    phone,
    `✏️ *Modo edição*\n\n` +
      `Itens detectados:\n\n${numberedList}\n\n` +
      `───────────────\n\n` +
      `Me diga o que quer alterar:\n\n` +
      `📝 _"Adiciona uma banana"_\n` +
      `🗑️ _"Tira o arroz"_\n` +
      `🔄 _"Era macarrão, não arroz"_\n\n` +
      `Responda *PRONTO* quando terminar\n\n` +
      `_Sofia 🥗_`
  );
}

/**
 * Handle direct clear pending (4, finalizar, etc)
 */
export async function handleDirectClear(
  supabase: SupabaseClient,
  phone: string,
  pending: PendingNutrition
): Promise<void> {
  console.log("[Confirmation] 🧹 Limpando pendência por solicitação do usuário");

  const analysis = pending.analysis_result || {};
  const foodHistoryId = analysis.food_history_id;

  if (foodHistoryId) {
    await supabase
      .from("food_history")
      .update({ user_notes: "Descartado pelo usuário" })
      .eq("id", foodHistoryId);
  }

  await supabase
    .from("whatsapp_pending_nutrition")
    .update({
      waiting_confirmation: false,
      waiting_edit: false,
      confirmed: false,
      is_processed: true,
      status: "cleared_by_user",
    })
    .eq("id", pending.id);

  await sendInteractiveMessage(phone, {
    headerText: '✅ Pendência finalizada!',
    bodyText: 'Agora você pode continuar normalmente. 💚',
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Nova Foto' },
      { id: 'sofia_meal_plan', title: '🍽️ Cardápio' },
    ],
  });
}

/**
 * Handle ambiguous confirmation attempt
 */
export async function handleAmbiguousConfirmation(phone: string): Promise<void> {
  await sendInteractiveMessage(phone, {
    headerText: '🤔 Não entendi...',
    bodyText: 'Escolha uma opção:',
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_confirm', title: '✅ Confirmar' },
      { id: 'sofia_edit', title: '✏️ Corrigir' },
      { id: 'sofia_cancel', title: '❌ Cancelar' },
    ],
  });
}

/**
 * Main confirmation handler - routes to appropriate sub-handler
 */
export async function handleConfirmation(
  supabase: SupabaseClient,
  user: UserInfo,
  pending: PendingNutrition,
  messageText: string,
  phone: string
): Promise<void> {
  const lower = messageText.toLowerCase().trim();
  const analysis = pending.analysis_result || {};
  const pendingFoods = analysis.detectedFoods || analysis.foods || [];

  // Direct confirm
  if (["1", "sim", "s", "ok", "confirmo", "confirma", "certo", "isso", "yes", "y"].includes(lower)) {
    await handleDirectConfirm(supabase, user, phone, pending);
    return;
  }

  // Direct cancel
  if (["2", "não", "nao", "n", "cancela", "cancelar", "nope", "no"].includes(lower)) {
    await handleDirectCancel(supabase, phone, pending);
    return;
  }

  // Direct edit
  if (["3", "editar", "edita", "corrigir", "mudar", "alterar", "edit"].includes(lower)) {
    await handleDirectEdit(supabase, phone, pending);
    return;
  }

  // Direct clear
  if (isClearPending(lower)) {
    await handleDirectClear(supabase, phone, pending);
    return;
  }

  // For complex messages, use AI
  const intent = await interpretUserIntent(supabase, messageText, "awaiting_confirmation", pendingFoods);
  
  if (intent.intent === "confirm") {
    await handleDirectConfirm(supabase, user, phone, pending);
  } else if (intent.intent === "cancel") {
    await handleDirectCancel(supabase, phone, pending);
  } else if (intent.intent === "edit") {
    await handleDirectEdit(supabase, phone, pending);
  } else if (intent.intent === "add_food" && intent.details?.newFood) {
    await handleAddFood(supabase, phone, pending, intent.details.newFood, pendingFoods);
  } else if (intent.intent === "remove_food") {
    await handleRemoveFood(supabase, phone, pending, intent.details, pendingFoods);
  } else if (intent.intent === "replace_food" && intent.details?.newFood) {
    await handleReplaceFood(supabase, phone, pending, intent.details, pendingFoods);
  } else {
    // Check if it looks like an almost-confirmation
    if (isAlmostConfirmation(lower)) {
      await handleAmbiguousConfirmation(phone);
    } else {
      // Let AI respond with pending reminder
      await handleSmartResponseWithPending(supabase, user, phone, messageText, pendingFoods);
    }
  }
}

/**
 * Handle add food intent
 */
async function handleAddFood(
  supabase: SupabaseClient,
  phone: string,
  pending: PendingNutrition,
  newFood: { name: string; grams: number },
  pendingFoods: any[]
): Promise<void> {
  const food = {
    nome: newFood.name,
    quantidade: newFood.grams || 100,
    name: newFood.name,
    grams: newFood.grams || 100
  };
  
  const updatedFoods = [...pendingFoods, food];
  const analysis = pending.analysis_result || {};
  const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
  const foodHistoryId = analysis.food_history_id;
  
  await supabase
    .from("whatsapp_pending_nutrition")
    .update({ analysis_result: updatedAnalysis })
    .eq("id", pending.id);

  if (foodHistoryId) {
    await supabase
      .from("food_history")
      .update({ food_items: updatedFoods })
      .eq("id", foodHistoryId);
  }
  
  const foodsList = updatedFoods
    .map((f: any) => `• ${f.nome || f.name} (${f.quantidade ?? f.grams ?? "?"}g)`)
    .join("\n");
  
  await sendTextMessage(phone, `✅ *Adicionado!*\n\nLista atualizada:\n\n${foodsList}`);
  
  await sendInteractiveMessage(phone, {
    bodyText: '*Está correto?*',
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_confirm', title: '✅ Confirmar' },
      { id: 'sofia_edit', title: '✏️ Editar mais' },
      { id: 'sofia_cancel', title: '❌ Cancelar' },
    ],
  });
}

/**
 * Handle remove food intent
 */
async function handleRemoveFood(
  supabase: SupabaseClient,
  phone: string,
  pending: PendingNutrition,
  details: any,
  pendingFoods: any[]
): Promise<void> {
  let updatedFoods = [...pendingFoods];
  
  if (details?.foodIndex !== undefined && details.foodIndex >= 0 && details.foodIndex < updatedFoods.length) {
    updatedFoods.splice(details.foodIndex, 1);
  } else if (details?.newFood?.name) {
    const nameToRemove = details.newFood.name.toLowerCase();
    updatedFoods = updatedFoods.filter((f: any) => {
      const foodName = (f.nome || f.name || "").toLowerCase();
      return !foodName.includes(nameToRemove);
    });
  }
  
  const analysis = pending.analysis_result || {};
  const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
  const foodHistoryId = analysis.food_history_id;
  
  await supabase
    .from("whatsapp_pending_nutrition")
    .update({ analysis_result: updatedAnalysis })
    .eq("id", pending.id);

  if (foodHistoryId) {
    await supabase
      .from("food_history")
      .update({ food_items: updatedFoods })
      .eq("id", foodHistoryId);
  }
  
  const foodsList = updatedFoods
    .map((f: any) => `• ${f.nome || f.name} (${f.quantidade ?? f.grams ?? "?"}g)`)
    .join("\n");
  
  await sendTextMessage(phone, `🗑️ *Removido!*\n\nLista atualizada:\n\n${foodsList || "_lista vazia_"}`);
  
  await sendInteractiveMessage(phone, {
    bodyText: '*Está correto?*',
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_confirm', title: '✅ Confirmar' },
      { id: 'sofia_edit', title: '✏️ Editar mais' },
      { id: 'sofia_cancel', title: '❌ Cancelar' },
    ],
  });
}

/**
 * Handle replace food intent
 */
async function handleReplaceFood(
  supabase: SupabaseClient,
  phone: string,
  pending: PendingNutrition,
  details: any,
  pendingFoods: any[]
): Promise<void> {
  const updatedFoods = [...pendingFoods];
  const indexToReplace = details.foodIndex ?? 0;
  
  if (indexToReplace >= 0 && indexToReplace < updatedFoods.length) {
    updatedFoods[indexToReplace] = {
      nome: details.newFood.name,
      quantidade: details.newFood.grams || 100,
      name: details.newFood.name,
      grams: details.newFood.grams || 100
    };
  }
  
  const analysis = pending.analysis_result || {};
  const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
  const foodHistoryId = analysis.food_history_id;
  
  await supabase
    .from("whatsapp_pending_nutrition")
    .update({ analysis_result: updatedAnalysis })
    .eq("id", pending.id);

  if (foodHistoryId) {
    await supabase
      .from("food_history")
      .update({ food_items: updatedFoods })
      .eq("id", foodHistoryId);
  }
  
  const foodsList = updatedFoods
    .map((f: any) => `• ${f.nome || f.name} (${f.quantidade ?? f.grams ?? "?"}g)`)
    .join("\n");
  
  await sendTextMessage(phone, `🔄 *Substituído!*\n\nLista atualizada:\n\n${foodsList}`);
  
  await sendInteractiveMessage(phone, {
    bodyText: '*Está correto?*',
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_confirm', title: '✅ Confirmar' },
      { id: 'sofia_edit', title: '✏️ Editar mais' },
      { id: 'sofia_cancel', title: '❌ Cancelar' },
    ],
  });
}
