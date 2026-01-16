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
 * Handle Sofia details request
 */
export async function handleSofiaDetails(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pending: any
): Promise<void> {
  console.log("[Button] 📊 Sofia details - mostrando detalhes...");
  
  const analysis = pending?.analysis_result || {};
  const foods = analysis.detectedFoods || analysis.foods || [];
  const totalCalories = analysis.totalCalories || 0;
  const protein = analysis.totalProtein || 0;
  const carbs = analysis.totalCarbs || 0;
  const fat = analysis.totalFat || 0;
  
  let detailsText = `📊 *Detalhes Nutricionais Completos*\n\n`;
  detailsText += `🔥 *Calorias:* ${Math.round(totalCalories)} kcal\n`;
  detailsText += `💪 *Proteínas:* ${Math.round(protein)}g\n`;
  detailsText += `🍞 *Carboidratos:* ${Math.round(carbs)}g\n`;
  detailsText += `🥑 *Gorduras:* ${Math.round(fat)}g\n\n`;
  
  detailsText += `📋 *Alimentos:*\n`;
  foods.forEach((f: any, i: number) => {
    const name = f.nome || f.name || "(alimento)";
    const grams = f.quantidade ?? f.grams ?? "?";
    const kcal = f.calorias || f.calories || 0;
    detailsText += `${i + 1}. ${name} (${grams}g) - ${Math.round(kcal)} kcal\n`;
  });
  
  await sendInteractiveMessage(phone, {
    headerText: '📊 Detalhes da Análise',
    bodyText: detailsText,
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_confirm', title: '✅ Confirmar' },
      { id: 'sofia_tips', title: '💡 Dicas' },
    ],
  });
}

/**
 * Handle Sofia tips request
 */
export async function handleSofiaTips(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] 💡 Sofia tips - gerando dicas...");
  
  const tips = [
    "🥗 Inclua mais vegetais coloridos nas refeições",
    "💧 Beba água antes das refeições para melhor digestão",
    "🍎 Prefira frutas inteiras em vez de sucos",
    "🥩 Distribua proteínas ao longo do dia",
    "🌾 Escolha carboidratos integrais",
    "⏰ Evite comer 2h antes de dormir",
  ];
  
  const randomTips = tips.sort(() => Math.random() - 0.5).slice(0, 3);
  
  await sendInteractiveMessage(phone, {
    headerText: '💡 Dicas Nutricionais',
    bodyText: `Aqui vão algumas dicas para você:\n\n${randomTips.join('\n\n')}\n\n_Pequenas mudanças fazem grande diferença!_`,
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Enviar Foto' },
      { id: 'menu', title: '📋 Menu' },
    ],
  });
}

/**
 * Handle Sofia meal plan request
 */
export async function handleSofiaMealPlan(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] 🍽️ Sofia meal plan - sugestão de cardápio...");
  
  await sendInteractiveMessage(phone, {
    headerText: '🍽️ Sugestão de Cardápio',
    bodyText: `*Café da Manhã*\n☕ Café com leite desnatado\n🍞 Pão integral com queijo branco\n🍌 1 banana\n\n*Almoço*\n🍚 Arroz integral (4 col.)\n🫘 Feijão (1 concha)\n🍗 Frango grelhado (120g)\n🥗 Salada verde à vontade\n\n*Jantar*\n🥣 Sopa de legumes\n🥚 Omelete com vegetais\n\n_Adapte conforme suas necessidades!_`,
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'meal_accept', title: '✅ Aceitar' },
      { id: 'meal_change', title: '🔄 Outra opção' },
    ],
  });
}

/**
 * Handle meal accept
 */
export async function handleMealAccept(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] ✅ Meal accept...");
  
  await sendInteractiveMessage(phone, {
    headerText: '✅ Cardápio Salvo!',
    bodyText: `Ótimo! Salvei essa sugestão de cardápio para você.\n\nPosso te enviar lembretes de refeições se quiser!\n\n💡 *Dica:* Tire foto das suas refeições para eu acompanhar seu progresso.`,
    footerText: 'Sofia 🥗',
    buttons: [
      { id: 'meal_recipe', title: '📝 Ver Receitas' },
      { id: 'meal_shopping', title: '🛒 Lista Compras' },
    ],
  });
}

/**
 * Handle meal change
 */
export async function handleMealChange(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] 🔄 Meal change...");
  
  await sendWhatsApp(phone,
    `🔄 *Ok! Vou sugerir outra opção...*\n\n` +
    `Me conta suas preferências:\n` +
    `• Vegetariano?\n` +
    `• Low carb?\n` +
    `• Alguma restrição?\n\n` +
    `_Sofia 🥗_`
  );
}

/**
 * Handle meal recipe
 */
export async function handleMealRecipe(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] 📝 Meal recipe...");
  
  await sendWhatsApp(phone,
    `📝 *Receita: Frango Grelhado com Ervas*\n\n` +
    `⏱️ Tempo: 25 min\n\n` +
    `🥗 *Ingredientes:*\n` +
    `• 120g peito de frango\n` +
    `• 1 colher de azeite\n` +
    `• Sal, pimenta, alecrim\n` +
    `• 1 limão\n\n` +
    `👨‍🍳 *Modo de Preparo:*\n` +
    `1. Tempere o frango\n` +
    `2. Aqueça a frigideira\n` +
    `3. Grelhe 5min cada lado\n` +
    `4. Finalize com limão\n\n` +
    `_Sofia 🥗_`
  );
}

/**
 * Handle meal shopping list
 */
export async function handleMealShopping(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] 🛒 Meal shopping...");
  
  await sendWhatsApp(phone,
    `🛒 *Lista de Compras Semanal*\n\n` +
    `🥬 *Hortifruti:*\n` +
    `• Alface, tomate, cenoura\n` +
    `• Banana, maçã, limão\n` +
    `• Cebola, alho\n\n` +
    `🥩 *Proteínas:*\n` +
    `• Peito de frango (500g)\n` +
    `• Ovos (1 dúzia)\n` +
    `• Queijo branco (200g)\n\n` +
    `🌾 *Carboidratos:*\n` +
    `• Arroz integral (1kg)\n` +
    `• Feijão (500g)\n` +
    `• Pão integral\n\n` +
    `_Sofia 🥗_`
  );
}

/**
 * Handle Dr. Vital understood
 */
export async function handleVitalUnderstood(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] ✅ Vital understood...");
  
  await sendInteractiveMessage(phone, {
    headerText: '✅ Ótimo!',
    bodyText: `Fico feliz que você entendeu!\n\nLembre-se: estou aqui se tiver mais dúvidas.\n\n⚠️ _Para orientações específicas, consulte seu médico._`,
    footerText: 'Dr. Vital 🩺',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Novo Exame' },
      { id: 'menu', title: '📋 Menu' },
    ],
  });
}

/**
 * Handle Dr. Vital question
 */
export async function handleVitalQuestion(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] ❓ Vital question...");
  
  await sendWhatsApp(phone,
    `❓ *Pode fazer sua pergunta!*\n\n` +
    `Estou aqui para esclarecer qualquer dúvida sobre seu exame.\n\n` +
    `_Exemplos de perguntas:_\n` +
    `• "O que significa colesterol LDL alto?"\n` +
    `• "Preciso me preocupar com esse resultado?"\n` +
    `• "Que alimentos devo evitar?"\n\n` +
    `⚠️ _Minhas respostas são informativas. Para orientações específicas, consulte seu médico._\n\n` +
    `_Dr. Vital 🩺_`
  );
}

/**
 * Handle Dr. Vital full report
 */
export async function handleVitalFullReport(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pendingMedical: any
): Promise<void> {
  console.log("[Button] 📋 Vital full report...");
  
  const analysis = pendingMedical?.analysis_result || {};
  const summary = analysis.summary || 'Análise não disponível';
  const recommendations = analysis.recommendations || [];
  
  let reportText = `📋 *Relatório Completo*\n\n`;
  reportText += summary + `\n\n`;
  
  if (recommendations.length > 0) {
    reportText += `💡 *Recomendações:*\n`;
    recommendations.slice(0, 4).forEach((rec: string) => {
      reportText += `• ${rec}\n`;
    });
  }
  
  reportText += `\n⚠️ _Este relatório é informativo. Consulte sempre seu médico._`;
  
  await sendInteractiveMessage(phone, {
    headerText: '📋 Relatório Completo',
    bodyText: reportText,
    footerText: 'Dr. Vital 🩺',
    buttons: [
      { id: 'vital_question', title: '❓ Perguntar' },
      { id: 'vital_share', title: '📤 Compartilhar' },
    ],
  });
}

/**
 * Handle Dr. Vital share
 */
export async function handleVitalShare(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] 📤 Vital share...");
  
  await sendWhatsApp(phone,
    `📤 *Compartilhar Relatório*\n\n` +
    `Você pode acessar o relatório completo no app:\n\n` +
    `📱 Abra o app MaxNutrition\n` +
    `📊 Vá em "Meus Exames"\n` +
    `📄 Clique em "Exportar PDF"\n\n` +
    `_Dr. Vital 🩺_`
  );
}

/**
 * Handle Menu request
 */
export async function handleMenu(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] 📋 Menu...");
  
  await sendInteractiveMessage(phone, {
    headerText: '📋 Menu Principal',
    bodyText: `O que você gostaria de fazer?\n\n` +
              `📸 *Analisar Refeição* - Envie foto da comida\n` +
              `🩺 *Analisar Exame* - Envie foto do exame\n` +
              `💧 *Registrar Água* - Acompanhe hidratação\n` +
              `⚖️ *Registrar Peso* - Monitore evolução\n` +
              `📊 *Ver Resumo* - Seu progresso`,
    footerText: 'MaxNutrition',
    buttons: [
      { id: 'sofia_new_photo', title: '📸 Enviar Foto' },
      { id: 'water_250ml', title: '💧 +250ml Água' },
    ],
  });
}

/**
 * Handle water view progress
 */
export async function handleWaterViewProgress(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string
): Promise<void> {
  console.log("[Button] 💧 Water view progress...");
  
  // Buscar dados de água do dia
  const today = new Date().toISOString().split('T')[0];
  const { data: waterData } = await supabase
    .from('daily_water_intake')
    .select('amount_ml')
    .eq('user_id', user.id)
    .gte('intake_date', today)
    .single();
  
  const currentMl = waterData?.amount_ml || 0;
  const goalMl = 2500;
  const percent = Math.round((currentMl / goalMl) * 100);
  const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
  
  await sendInteractiveMessage(phone, {
    headerText: '💧 Progresso de Hidratação',
    bodyText: `*Hoje:*\n\n${bar} ${percent}%\n\n💧 ${currentMl}ml / ${goalMl}ml\n\n${percent >= 100 ? '🎉 Meta atingida! Parabéns!' : percent >= 50 ? '💪 Bom progresso! Continue assim!' : '⏰ Lembre-se de beber mais água!'}`,
    footerText: 'MaxNutrition',
    buttons: [
      { id: 'water_250ml', title: '🥤 +250ml' },
      { id: 'water_500ml', title: '🫗 +500ml' },
    ],
  });
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
  
  // Sofia - Detalhes, Dicas, Meal Plan
  if (buttonId === "sofia_details") {
    await handleSofiaDetails(supabase, user, phone, pending);
    return true;
  }
  
  if (buttonId === "sofia_tips") {
    await handleSofiaTips(supabase, user, phone);
    return true;
  }
  
  if (buttonId === "sofia_meal_plan") {
    await handleSofiaMealPlan(supabase, user, phone);
    return true;
  }
  
  // Meal Plan buttons
  if (buttonId === "meal_accept") {
    await handleMealAccept(supabase, user, phone);
    return true;
  }
  
  if (buttonId === "meal_change") {
    await handleMealChange(supabase, user, phone);
    return true;
  }
  
  if (buttonId === "meal_recipe") {
    await handleMealRecipe(supabase, user, phone);
    return true;
  }
  
  if (buttonId === "meal_shopping") {
    await handleMealShopping(supabase, user, phone);
    return true;
  }
  
  // Dr. Vital buttons
  if (buttonId === "vital_understood") {
    await handleVitalUnderstood(supabase, user, phone);
    return true;
  }
  
  if (buttonId === "vital_question") {
    await handleVitalQuestion(supabase, user, phone);
    return true;
  }
  
  if (buttonId === "vital_full_report" && pendingMedical) {
    await handleVitalFullReport(supabase, user, phone, pendingMedical);
    return true;
  }
  
  if (buttonId === "vital_share") {
    await handleVitalShare(supabase, user, phone);
    return true;
  }
  
  // Menu
  if (buttonId === "menu") {
    await handleMenu(supabase, user, phone);
    return true;
  }
  
  // Water progress
  if (buttonId === "water_view_progress") {
    await handleWaterViewProgress(supabase, user, phone);
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
