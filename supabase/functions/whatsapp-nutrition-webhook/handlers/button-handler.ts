/**
 * Centralized button click handler for WhatsApp interactive messages
 */
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { UserInfo } from "../services/user-service.ts";
import { sendWhatsApp } from "../utils/whatsapp-sender.ts";
import { 
  sendInteractiveMessage, 
  sendTextMessage,
} from "../utils/whatsapp-interactive-sender.ts";

/**
 * Handle Sofia (nutrition) confirmation
 */
export async function handleSofiaConfirm(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pending: any
): Promise<void> {
  console.log("[Button] ✅ Sofia confirm - processando...");
  
  const analysis = pending.analysis_result || {};
  const foods = analysis.detectedFoods || analysis.foods || [];
  const totalCalories = analysis.totalCalories || 0;
  const foodHistoryId = analysis.food_history_id;
  
  // Atualizar food_history como confirmado
  if (foodHistoryId) {
    await supabase
      .from("food_history")
      .update({ user_confirmed: true })
      .eq("id", foodHistoryId);
  }
  
  // Marcar pendência como processada
  await supabase
    .from("whatsapp_pending_nutrition")
    .update({
      confirmed: true,
      is_processed: true,
      waiting_confirmation: false,
    })
    .eq("id", pending.id);
  
  // Enviar confirmação com botões de próxima ação
  const foodsList = foods.map((f: any) => f.nome || f.name || "(alimento)").join(", ");
  const kcalText = totalCalories > 0 ? ` (~${Math.round(totalCalories)} kcal)` : "";
  
  await sendInteractiveMessage(phone, {
    headerText: '✅ Refeição registrada!',
    bodyText: `📋 ${foodsList}${kcalText}\n\nOs dados foram salvos no seu histórico.`,
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Nova Foto' },
      { id: 'help', title: '❓ Ajuda' },
    ],
  });
}

/**
 * Handle Sofia (nutrition) edit request
 */
export async function handleSofiaEdit(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pending: any
): Promise<void> {
  console.log("[Button] ✏️ Sofia edit - entrando modo edição...");
  
  const analysis = pending.analysis_result || {};
  const foods = analysis.detectedFoods || analysis.foods || [];
  
  // Ativar modo edição
  await supabase
    .from("whatsapp_pending_nutrition")
    .update({
      waiting_edit: true,
      waiting_confirmation: false,
    })
    .eq("id", pending.id);
  
  // Formatar lista de alimentos
  const foodsList = foods
    .map((f: any, i: number) => {
      const name = f.nome || f.name || "(alimento)";
      const grams = f.quantidade ?? f.grams ?? "?";
      return `${i + 1}. ${name} (${grams}g)`;
    })
    .join("\n");
  
  await sendWhatsApp(phone,
    `✏️ *Modo edição ativado!*\n\n` +
    `📋 *Alimentos atuais:*\n${foodsList}\n\n` +
    `*Comandos disponíveis:*\n` +
    `• "trocar 1 por banana 150g"\n` +
    `• "remover 2"\n` +
    `• "adicionar maçã 100g"\n\n` +
    `Quando terminar, digite *pronto*\n\n` +
    `_Sofia 🥗_`
  );
}

/**
 * Handle Sofia (nutrition) cancel
 */
export async function handleSofiaCancel(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pending: any
): Promise<void> {
  console.log("[Button] ❌ Sofia cancel - cancelando...");
  
  const analysis = pending.analysis_result || {};
  const foodHistoryId = analysis.food_history_id;
  
  // Remover do food_history se existir
  if (foodHistoryId) {
    await supabase
      .from("food_history")
      .delete()
      .eq("id", foodHistoryId);
  }
  
  // Marcar pendência como processada/cancelada
  await supabase
    .from("whatsapp_pending_nutrition")
    .update({
      confirmed: false,
      is_processed: true,
      waiting_confirmation: false,
    })
    .eq("id", pending.id);
  
  await sendInteractiveMessage(phone, {
    headerText: '❌ Registro cancelado',
    bodyText: 'Ok! O registro foi descartado.\n\nEnvie uma nova foto quando quiser!',
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Nova Foto' },
      { id: 'help', title: '❓ Ajuda' },
    ],
  });
}

/**
 * Handle Dr. Vital (medical) analyze
 */
export async function handleVitalAnalyze(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pendingMedical: any
): Promise<void> {
  console.log("[Button] 🔬 Vital analyze - iniciando análise...");
  
  const imagesCount = pendingMedical.images_count || 1;
  
  // Atualizar status para processing
  await supabase
    .from("whatsapp_pending_medical")
    .update({
      status: "processing",
      confirmed: true,
      waiting_confirmation: false,
    })
    .eq("id", pendingMedical.id);
  
  // Enviar mensagem de início
  await sendWhatsApp(phone,
    `🔬 *Iniciando análise de ${imagesCount} ${imagesCount > 1 ? 'imagens' : 'imagem'}...*\n\n` +
    `⏱️ Tempo estimado: 2-5 minutos\n\n` +
    `Vou te avisar quando estiver pronto! 📊\n\n` +
    `_Dr. Vital 🩺_`
  );
  
  // Disparar análise
  try {
    await supabase.functions.invoke("analyze-medical-batch", {
      body: {
        batchId: pendingMedical.id,
        userId: user.id,
        phone: phone,
      },
    });
  } catch (error) {
    console.error("[Button] Erro ao invocar analyze-medical-batch:", error);
  }
}

/**
 * Handle Dr. Vital (medical) add more images
 */
export async function handleVitalMore(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pendingMedical: any
): Promise<void> {
  console.log("[Button] ➕ Vital more - aguardando mais imagens...");
  
  // Atualizar status para collecting
  await supabase
    .from("whatsapp_pending_medical")
    .update({
      status: "collecting",
      waiting_confirmation: false,
    })
    .eq("id", pendingMedical.id);
  
  await sendWhatsApp(phone,
    `📤 *Ok! Aguardando mais fotos...*\n\n` +
    `Envie as próximas páginas ou exames.\n\n` +
    `Quando terminar, digite *PRONTO*.\n\n` +
    `_Dr. Vital 🩺_`
  );
}

/**
 * Handle Dr. Vital (medical) cancel
 */
export async function handleVitalCancel(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pendingMedical: any
): Promise<void> {
  console.log("[Button] ❌ Vital cancel - cancelando...");
  
  await supabase
    .from("whatsapp_pending_medical")
    .update({
      status: "cancelled",
      is_processed: true,
    })
    .eq("id", pendingMedical.id);
  
  await sendInteractiveMessage(phone, {
    headerText: '❌ Análise cancelada',
    bodyText: 'Ok! As imagens foram descartadas.\n\nQuando quiser, envie novas fotos de exames!',
    footerText: 'Dr. Vital 🩺',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Novo Exame' },
      { id: 'help', title: '❓ Ajuda' },
    ],
  });
}

/**
 * Handle Dr. Vital wait
 */
export async function handleVitalWait(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pendingMedical: any
): Promise<void> {
  console.log("[Button] ⏳ Vital wait - continuando aguardo...");
  
  await sendWhatsApp(phone,
    `⏳ *Ok! Continuando a análise...*\n\n` +
    `Te aviso assim que estiver pronto!\n\n` +
    `_Dr. Vital 🩺_`
  );
}

/**
 * Handle Dr. Vital retry
 */
export async function handleVitalRetry(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pendingMedical: any
): Promise<void> {
  console.log("[Button] 🔄 Vital retry - reiniciando análise...");
  
  await supabase
    .from("whatsapp_pending_medical")
    .update({
      status: "processing",
      confirmed: true,
    })
    .eq("id", pendingMedical.id);
  
  await sendWhatsApp(phone,
    `🔄 *Reiniciando análise...*\n\n` +
    `⏱️ Aguarde 2-5 minutos.\n\n` +
    `_Dr. Vital 🩺_`
  );
  
  try {
    await supabase.functions.invoke("analyze-medical-batch", {
      body: {
        batchId: pendingMedical.id,
        userId: user.id,
        phone: phone,
      },
    });
  } catch (error) {
    console.error("[Button] Erro ao reiniciar análise:", error);
  }
}

/**
 * Handle new photo request
 */
export async function handleNewPhoto(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] 📸 New photo - solicitando foto...");
  
  await sendWhatsApp(phone,
    `📸 *Envie sua foto!*\n\n` +
    `🍽️ *Refeição* → analiso calorias\n` +
    `🩺 *Exame* → analiso resultados\n\n` +
    `_Sofia 🥗 | Dr. Vital 🩺_`
  );
}

/**
 * Handle help request
 */
export async function handleHelp(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] ❓ Help - enviando ajuda...");
  
  await sendWhatsApp(phone,
    `👋 *Olá! Como posso ajudar?*\n\n` +
    `📸 *Enviar foto de refeição*\n` +
    `→ Analiso calorias e nutrientes\n\n` +
    `🩺 *Enviar foto de exame*\n` +
    `→ Analiso resultados médicos\n\n` +
    `💬 *Perguntar sobre nutrição*\n` +
    `→ Respondo suas dúvidas\n\n` +
    `📊 *"Meu resumo"*\n` +
    `→ Mostro seu progresso\n\n` +
    `_Sofia 🥗 | Dr. Vital 🩺_`
  );
}

/**
 * Handle feeling responses
 */
export async function handleFeeling(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  feeling: "great" | "ok" | "bad"
): Promise<void> {
  console.log(`[Button] 😊 Feeling ${feeling}...`);
  
  const responses = {
    great: `💚 *Que ótimo!* Fico feliz em saber!\n\nContinue assim! Se precisar de algo, estou aqui.\n\n_Sofia 🥗_`,
    ok: `😊 *Bom saber!*\n\nSe quiser conversar ou precisar de dicas, é só chamar!\n\n_Sofia 🥗_`,
    bad: `💜 *Sinto muito que não está bem...*\n\nQuer me contar o que está acontecendo? Estou aqui para ouvir e ajudar!\n\n_Sofia 🥗_`,
  };
  
  await sendWhatsApp(phone, responses[feeling]);
}

/**
 * Generic button handler - routes to specific handlers
 */
export async function handleButtonClick(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  buttonId: string,
  pending?: any,
  pendingMedical?: any
): Promise<boolean> {
  console.log(`[Button] 🔘 Processando botão: ${buttonId}`);
  
  // Sofia - Nutrição
  if (buttonId === "sofia_confirm" && pending?.waiting_confirmation) {
    await handleSofiaConfirm(supabase, user, phone, pending);
    return true;
  }
  
  if (buttonId === "sofia_edit" && pending?.waiting_confirmation) {
    await handleSofiaEdit(supabase, user, phone, pending);
    return true;
  }
  
  if (buttonId === "sofia_cancel" && pending) {
    await handleSofiaCancel(supabase, user, phone, pending);
    return true;
  }
  
  // Dr. Vital - Médico
  if (buttonId === "vital_analyze" && pendingMedical) {
    await handleVitalAnalyze(supabase, user, phone, pendingMedical);
    return true;
  }
  
  if (buttonId === "vital_more" && pendingMedical) {
    await handleVitalMore(supabase, user, phone, pendingMedical);
    return true;
  }
  
  if (buttonId === "vital_cancel" && pendingMedical) {
    await handleVitalCancel(supabase, user, phone, pendingMedical);
    return true;
  }
  
  if (buttonId === "vital_wait" && pendingMedical) {
    await handleVitalWait(supabase, user, phone, pendingMedical);
    return true;
  }
  
  if (buttonId === "vital_retry" && pendingMedical) {
    await handleVitalRetry(supabase, user, phone, pendingMedical);
    return true;
  }
  
  // Generic buttons (no pending required)
  if (buttonId === "sofia_new_photo") {
    await handleNewPhoto(supabase, user, phone);
    return true;
  }
  
  if (buttonId === "help") {
    await handleHelp(supabase, user, phone);
    return true;
  }
  
  if (buttonId === "feeling_great") {
    await handleFeeling(supabase, user, phone, "great");
    return true;
  }
  
  if (buttonId === "feeling_ok") {
    await handleFeeling(supabase, user, phone, "ok");
    return true;
  }
  
  if (buttonId === "feeling_bad") {
    await handleFeeling(supabase, user, phone, "bad");
    return true;
  }
  
  // Botão não reconhecido
  console.log(`[Button] ⚠️ Botão não reconhecido: ${buttonId}`);
  await sendInteractiveMessage(phone, {
    headerText: '🤔 Não entendi',
    bodyText: 'Desculpe, não reconheci esse comando.\n\nComo posso ajudar?',
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Enviar Foto' },
      { id: 'help', title: '❓ Ajuda' },
    ],
  });
  
  return false;
}
