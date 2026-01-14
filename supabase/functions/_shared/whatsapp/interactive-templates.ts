// ============================================
// Interactive Message Templates
// All WhatsApp button/list templates for Sofia, Dr. Vital, etc.
// ============================================

import { InteractiveContent, ButtonAction, ListAction } from './types.ts';

// ============================================
// Button IDs - Centralized Constants
// ============================================

export const BUTTON_IDS = {
  // Sofia - Food Analysis
  SOFIA_CONFIRM: 'sofia_confirm',
  SOFIA_EDIT: 'sofia_edit',
  SOFIA_DETAILS: 'sofia_details',
  SOFIA_NEW_PHOTO: 'sofia_new_photo',
  SOFIA_MEAL_PLAN: 'sofia_meal_plan',
  SOFIA_TIPS: 'sofia_tips',
  
  // Dr. Vital - Exam Analysis
  VITAL_UNDERSTOOD: 'vital_understood',
  VITAL_QUESTION: 'vital_question',
  VITAL_FULL_REPORT: 'vital_full_report',
  VITAL_SCHEDULE: 'vital_schedule',
  VITAL_SHARE: 'vital_share',
  
  // Daily Check-in
  FEELING_GREAT: 'feeling_great',
  FEELING_OK: 'feeling_ok',
  FEELING_BAD: 'feeling_bad',
  
  // Meal Plan
  MEAL_ACCEPT: 'meal_accept',
  MEAL_CHANGE: 'meal_change',
  MEAL_RECIPE: 'meal_recipe',
  MEAL_SHOPPING: 'meal_shopping',
  
  // Water Tracking
  WATER_250ML: 'water_250ml',
  WATER_500ML: 'water_500ml',
  WATER_NOT_YET: 'water_not_yet',
  WATER_VIEW_PROGRESS: 'water_view_progress',
  
  // Weekly Weighing
  WEIGH_NOW: 'weigh_now',
  WEIGH_LATER: 'weigh_later',
  WEIGH_VIEW_EVOLUTION: 'weigh_view_evolution',
  
  // General
  YES: 'yes',
  NO: 'no',
  HELP: 'help',
  MENU: 'menu',
} as const;


// ============================================
// SOFIA - Food Analysis Templates
// ============================================

export function createSofiaAnalysisComplete(data: {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  mealType?: string;
}): InteractiveContent {
  const foodList = data.foods.slice(0, 5).join(', ');
  const scoreEmoji = data.healthScore >= 80 ? '🟢' : data.healthScore >= 60 ? '🟡' : '🔴';
  
  return {
    type: 'button',
    header: { text: '🍽️ Análise Concluída!' },
    body: {
      text: `*Alimentos identificados:*\n${foodList}\n\n` +
            `📊 *Resumo Nutricional:*\n` +
            `• Calorias: ${data.calories} kcal\n` +
            `• Proteínas: ${data.protein}g\n` +
            `• Carboidratos: ${data.carbs}g\n` +
            `• Gorduras: ${data.fat}g\n\n` +
            `${scoreEmoji} Pontuação: ${data.healthScore}/100`,
    },
    footer: { text: '🌿 Sofia - Sua Nutricionista IA' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_CONFIRM, title: '✅ Confirmar' },
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_EDIT, title: '✏️ Corrigir' },
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_DETAILS, title: '📊 Detalhes' },
      ],
    },
  };
}

export function createSofiaPostConfirm(): InteractiveContent {
  return {
    type: 'button',
    body: {
      text: '✅ *Análise salva com sucesso!*\n\n' +
            'Os dados foram registrados no seu histórico nutricional.\n\n' +
            'O que deseja fazer agora?',
    },
    footer: { text: '🌿 Sofia' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_NEW_PHOTO, title: '📸 Nova Foto' },
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_TIPS, title: '💡 Dica do Dia' },
        { type: 'quick_reply', id: BUTTON_IDS.MENU, title: '📋 Menu' },
      ],
    },
  };
}

export function createSofiaEditPrompt(): InteractiveContent {
  return {
    type: 'button',
    body: {
      text: '✏️ *Vamos corrigir a análise!*\n\n' +
            'Me diga o que precisa ser ajustado:\n\n' +
            '_Exemplos:_\n' +
            '• "A porção de arroz era maior, uns 200g"\n' +
            '• "Não tinha feijão, era lentilha"\n' +
            '• "Faltou contar o suco de laranja"',
    },
    footer: { text: '🌿 Sofia' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_CONFIRM, title: '✅ Está certo assim' },
      ],
    },
  };
}


export function createSofiaDetails(data: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  healthScore: number;
  tips?: string[];
}): InteractiveContent {
  let detailsText = `📊 *Detalhes Nutricionais Completos*\n\n` +
                    `🔥 *Calorias:* ${data.calories} kcal\n` +
                    `💪 *Proteínas:* ${data.protein}g\n` +
                    `🍞 *Carboidratos:* ${data.carbs}g\n` +
                    `🥑 *Gorduras:* ${data.fat}g\n`;
  
  if (data.fiber) detailsText += `🌾 *Fibras:* ${data.fiber}g\n`;
  if (data.sodium) detailsText += `🧂 *Sódio:* ${data.sodium}mg\n`;
  
  detailsText += `\n⭐ *Pontuação:* ${data.healthScore}/100`;
  
  if (data.tips && data.tips.length > 0) {
    detailsText += `\n\n💡 *Dicas:*\n`;
    data.tips.slice(0, 3).forEach(tip => {
      detailsText += `• ${tip}\n`;
    });
  }
  
  return {
    type: 'button',
    body: { text: detailsText },
    footer: { text: '🌿 Sofia' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_CONFIRM, title: '✅ Confirmar' },
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_NEW_PHOTO, title: '📸 Nova Foto' },
      ],
    },
  };
}

// ============================================
// DR. VITAL - Exam Analysis Templates
// ============================================

export function createVitalAnalysisComplete(data: {
  examType: string;
  summary: string;
  alertLevel: 'normal' | 'attention' | 'urgent';
  mainFindings?: string[];
}): InteractiveContent {
  const alertEmoji = data.alertLevel === 'normal' ? '🟢' : 
                     data.alertLevel === 'attention' ? '🟡' : '🔴';
  const alertText = data.alertLevel === 'normal' ? 'Tudo dentro do esperado' :
                    data.alertLevel === 'attention' ? 'Alguns pontos de atenção' : 
                    'Requer avaliação médica';
  
  let bodyText = `🔬 *Análise de ${data.examType} Concluída!*\n\n` +
                 `${alertEmoji} *Status:* ${alertText}\n\n` +
                 `📋 *Resumo:*\n${data.summary}`;
  
  if (data.mainFindings && data.mainFindings.length > 0) {
    bodyText += `\n\n📌 *Principais achados:*\n`;
    data.mainFindings.slice(0, 3).forEach(finding => {
      bodyText += `• ${finding}\n`;
    });
  }
  
  return {
    type: 'button',
    header: { text: '🩺 Dr. Vital - Resultado' },
    body: { text: bodyText },
    footer: { text: '⚕️ Dr. Vital - Seu Assistente de Saúde' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.VITAL_UNDERSTOOD, title: '✅ Entendi' },
        { type: 'quick_reply', id: BUTTON_IDS.VITAL_QUESTION, title: '❓ Perguntar' },
        { type: 'quick_reply', id: BUTTON_IDS.VITAL_FULL_REPORT, title: '📋 Relatório' },
      ],
    },
  };
}


export function createVitalFullReport(data: {
  examType: string;
  detailedAnalysis: string;
  recommendations?: string[];
}): InteractiveContent {
  let bodyText = `📋 *Relatório Completo - ${data.examType}*\n\n` +
                 `${data.detailedAnalysis}`;
  
  if (data.recommendations && data.recommendations.length > 0) {
    bodyText += `\n\n💡 *Recomendações:*\n`;
    data.recommendations.slice(0, 4).forEach(rec => {
      bodyText += `• ${rec}\n`;
    });
  }
  
  bodyText += `\n\n⚠️ _Este relatório é informativo. Consulte sempre seu médico._`;
  
  return {
    type: 'button',
    body: { text: bodyText },
    footer: { text: '⚕️ Dr. Vital' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.VITAL_QUESTION, title: '❓ Perguntar' },
        { type: 'quick_reply', id: BUTTON_IDS.VITAL_SHARE, title: '📤 Compartilhar' },
      ],
    },
  };
}

export function createVitalQuestionPrompt(): InteractiveContent {
  return {
    type: 'button',
    body: {
      text: '❓ *Pode fazer sua pergunta!*\n\n' +
            'Estou aqui para esclarecer qualquer dúvida sobre seu exame.\n\n' +
            '_Exemplos de perguntas:_\n' +
            '• "O que significa colesterol LDL alto?"\n' +
            '• "Preciso me preocupar com esse resultado?"\n' +
            '• "Que alimentos devo evitar?"\n\n' +
            '⚠️ _Minhas respostas são informativas. Para orientações específicas, consulte seu médico._',
    },
    footer: { text: '⚕️ Dr. Vital' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.VITAL_UNDERSTOOD, title: '✅ Entendi' },
        { type: 'quick_reply', id: BUTTON_IDS.MENU, title: '📋 Menu' },
      ],
    },
  };
}

// ============================================
// DAILY CHECK-IN Templates
// ============================================

export function createDailyCheckin(userName?: string): InteractiveContent {
  const greeting = userName ? `Bom dia, ${userName}!` : 'Bom dia!';
  
  return {
    type: 'button',
    header: { text: `☀️ ${greeting}` },
    body: {
      text: 'Como você está se sentindo hoje?\n\n' +
            'Seu bem-estar é importante para acompanharmos sua jornada de saúde.',
    },
    footer: { text: '🌿 MaxNutrition' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.FEELING_GREAT, title: '😊 Ótimo!' },
        { type: 'quick_reply', id: BUTTON_IDS.FEELING_OK, title: '😐 Normal' },
        { type: 'quick_reply', id: BUTTON_IDS.FEELING_BAD, title: '😔 Não muito bem' },
      ],
    },
  };
}

export function createCheckinResponse(feeling: 'great' | 'ok' | 'bad'): InteractiveContent {
  const responses = {
    great: {
      emoji: '🎉',
      text: '*Que maravilha!* Continue assim!\n\nSeu corpo agradece os cuidados que você tem dado a ele.',
      buttons: [
        { type: 'quick_reply' as const, id: BUTTON_IDS.SOFIA_NEW_PHOTO, title: '📸 Registrar Refeição' },
        { type: 'quick_reply' as const, id: BUTTON_IDS.MENU, title: '📋 Menu' },
      ],
    },
    ok: {
      emoji: '💪',
      text: '*Entendi!* Vamos trabalhar juntos para melhorar seu dia.\n\nQue tal começar com uma boa hidratação?',
      buttons: [
        { type: 'quick_reply' as const, id: BUTTON_IDS.WATER_250ML, title: '💧 Beber água' },
        { type: 'quick_reply' as const, id: BUTTON_IDS.SOFIA_TIPS, title: '💡 Dicas do Dia' },
      ],
    },
    bad: {
      emoji: '💙',
      text: '*Sinto muito que não esteja bem.*\n\nEstou aqui se precisar conversar. Lembre-se: dias difíceis passam.\n\nPosso te ajudar com algo?',
      buttons: [
        { type: 'quick_reply' as const, id: BUTTON_IDS.VITAL_QUESTION, title: '💬 Conversar' },
        { type: 'quick_reply' as const, id: BUTTON_IDS.MENU, title: '📋 Menu' },
      ],
    },
  };
  
  const response = responses[feeling];
  
  return {
    type: 'button',
    body: { text: `${response.emoji} ${response.text}` },
    footer: { text: '🌿 MaxNutrition' },
    action: {
      buttons: response.buttons,
    },
  };
}


// ============================================
// MEAL PLAN Templates
// ============================================

export function createMealPlanSuggestion(data: {
  mealType: string;
  mealName: string;
  calories: number;
  description: string;
  ingredients?: string[];
}): InteractiveContent {
  let bodyText = `🍽️ *Sugestão para ${data.mealType}*\n\n` +
                 `*${data.mealName}*\n` +
                 `🔥 ${data.calories} kcal\n\n` +
                 `${data.description}`;
  
  if (data.ingredients && data.ingredients.length > 0) {
    bodyText += `\n\n🥗 *Ingredientes:*\n`;
    data.ingredients.slice(0, 5).forEach(ing => {
      bodyText += `• ${ing}\n`;
    });
  }
  
  return {
    type: 'button',
    body: { text: bodyText },
    footer: { text: '🌿 Sofia' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.MEAL_ACCEPT, title: '✅ Aceitar' },
        { type: 'quick_reply', id: BUTTON_IDS.MEAL_CHANGE, title: '🔄 Outra opção' },
        { type: 'quick_reply', id: BUTTON_IDS.MEAL_RECIPE, title: '📝 Receita' },
      ],
    },
  };
}

export function createMealRecipe(data: {
  mealName: string;
  prepTime: string;
  ingredients: string[];
  steps: string[];
}): InteractiveContent {
  let bodyText = `📝 *Receita: ${data.mealName}*\n` +
                 `⏱️ Tempo: ${data.prepTime}\n\n` +
                 `🥗 *Ingredientes:*\n`;
  
  data.ingredients.forEach(ing => {
    bodyText += `• ${ing}\n`;
  });
  
  bodyText += `\n👨‍🍳 *Modo de Preparo:*\n`;
  data.steps.forEach((step, i) => {
    bodyText += `${i + 1}. ${step}\n`;
  });
  
  return {
    type: 'button',
    body: { text: bodyText },
    footer: { text: '🌿 Sofia' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.MEAL_SHOPPING, title: '🛒 Lista de Compras' },
        { type: 'quick_reply', id: BUTTON_IDS.MEAL_CHANGE, title: '🔄 Outra receita' },
      ],
    },
  };
}

// ============================================
// WELCOME & ONBOARDING Templates
// ============================================

export function createWelcomeMessage(userName?: string): InteractiveContent {
  const name = userName || 'você';
  
  return {
    type: 'button',
    header: { text: '🌿 Bem-vindo ao MaxNutrition!' },
    body: {
      text: `Olá, ${name}! 👋\n\n` +
            `Sou a *Sofia*, sua nutricionista virtual, e estou aqui para te ajudar a ter uma alimentação mais saudável!\n\n` +
            `📸 *Envie uma foto* da sua refeição e eu analiso os nutrientes\n` +
            `🩺 *Envie um exame* e o Dr. Vital explica os resultados\n` +
            `💬 *Pergunte* qualquer dúvida sobre nutrição\n\n` +
            `Por onde quer começar?`,
    },
    footer: { text: '🌿 MaxNutrition' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_NEW_PHOTO, title: '📸 Analisar Refeição' },
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_MEAL_PLAN, title: '🍽️ Ver Cardápio' },
        { type: 'quick_reply', id: BUTTON_IDS.HELP, title: '❓ Ajuda' },
      ],
    },
  };
}

export function createHelpMenu(): InteractiveContent {
  return {
    type: 'list',
    header: { text: '❓ Central de Ajuda' },
    body: {
      text: 'Escolha uma opção para saber mais sobre como posso te ajudar:',
    },
    footer: { text: '🌿 MaxNutrition' },
    action: {
      label: 'Ver Opções',
      sections: [
        {
          title: '🍽️ Nutrição',
          rows: [
            { id: 'help_photo', title: '📸 Como analisar refeição', description: 'Envie foto e receba análise' },
            { id: 'help_meal_plan', title: '🍽️ Cardápio semanal', description: 'Receba sugestões personalizadas' },
            { id: 'help_tips', title: '💡 Dicas nutricionais', description: 'Orientações para seu dia' },
          ],
        },
        {
          title: '🩺 Saúde',
          rows: [
            { id: 'help_exam', title: '🔬 Analisar exames', description: 'Envie foto do exame' },
            { id: 'help_tracking', title: '📊 Acompanhamento', description: 'Veja seu progresso' },
          ],
        },
      ],
    },
  };
}


// ============================================
// WEEKLY REPORT Templates
// ============================================

export function createWeeklyReport(data: {
  userName?: string;
  totalCalories: number;
  avgCalories: number;
  mealsLogged: number;
  healthScoreAvg: number;
  topFoods?: string[];
  improvement?: string;
}): InteractiveContent {
  const scoreEmoji = data.healthScoreAvg >= 80 ? '🟢' : data.healthScoreAvg >= 60 ? '🟡' : '🔴';
  
  let bodyText = `📊 *Relatório Semanal*\n`;
  if (data.userName) bodyText += `👤 ${data.userName}\n`;
  bodyText += `\n`;
  
  bodyText += `🔥 *Calorias totais:* ${data.totalCalories.toLocaleString()} kcal\n`;
  bodyText += `📈 *Média diária:* ${data.avgCalories} kcal\n`;
  bodyText += `🍽️ *Refeições registradas:* ${data.mealsLogged}\n`;
  bodyText += `${scoreEmoji} *Pontuação média:* ${data.healthScoreAvg}/100\n`;
  
  if (data.topFoods && data.topFoods.length > 0) {
    bodyText += `\n🏆 *Alimentos mais consumidos:*\n`;
    data.topFoods.slice(0, 3).forEach((food, i) => {
      bodyText += `${i + 1}. ${food}\n`;
    });
  }
  
  if (data.improvement) {
    bodyText += `\n💡 *Dica da semana:*\n${data.improvement}`;
  }
  
  return {
    type: 'button',
    header: { text: '📅 Sua Semana' },
    body: { text: bodyText },
    footer: { text: '🌿 MaxNutrition' },
    action: {
      buttons: [
        { type: 'quick_reply', id: 'report_details', title: '📊 Ver Detalhes' },
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_MEAL_PLAN, title: '🍽️ Novo Cardápio' },
      ],
    },
  };
}

// ============================================
// ERROR & FALLBACK Templates
// ============================================

export function createErrorMessage(errorType: 'image_unclear' | 'no_food' | 'processing' | 'generic'): InteractiveContent {
  const messages = {
    image_unclear: {
      text: '😅 *Ops! Não consegui ver bem a imagem.*\n\n' +
            'Dicas para uma foto melhor:\n' +
            '• Boa iluminação\n' +
            '• Comida centralizada\n' +
            '• Sem muito desfoque\n\n' +
            'Tente novamente?',
    },
    no_food: {
      text: '🤔 *Hmm, não identifiquei alimentos nessa imagem.*\n\n' +
            'Certifique-se de que a foto mostra claramente a refeição.\n\n' +
            'Quer tentar com outra foto?',
    },
    processing: {
      text: '⏳ *Estou processando sua solicitação...*\n\n' +
            'Isso pode levar alguns segundos. Por favor, aguarde.',
    },
    generic: {
      text: '😓 *Desculpe, algo deu errado.*\n\n' +
            'Estamos trabalhando para resolver. Tente novamente em alguns instantes.',
    },
  };
  
  const message = messages[errorType];
  
  return {
    type: 'button',
    body: { text: message.text },
    footer: { text: '🌿 Sofia' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_NEW_PHOTO, title: '📸 Nova Foto' },
        { type: 'quick_reply', id: BUTTON_IDS.HELP, title: '❓ Ajuda' },
      ],
    },
  };
}

// ============================================
// WATER TRACKING Templates
// ============================================

export function createWaterReminder(data: {
  userName?: string;
  totalToday: number;
  goal: number;
}): InteractiveContent {
  const remaining = Math.max(0, data.goal - data.totalToday);
  const percentage = Math.min(100, Math.round((data.totalToday / data.goal) * 100));
  const progressBar = generateProgressBar(percentage);
  const greeting = data.userName ? `${data.userName}, ` : '';
  
  return {
    type: 'button',
    header: { text: '💧 Hora de Hidratar!' },
    body: {
      text: `${greeting}já bebeu água? 💦\n\n` +
            `📊 *Seu progresso hoje:*\n` +
            `${progressBar} ${percentage}%\n\n` +
            `💧 Consumido: ${data.totalToday}ml\n` +
            `🎯 Meta: ${data.goal}ml\n` +
            `📉 Faltam: ${remaining}ml\n\n` +
            `Registre agora! 👇`,
    },
    footer: { text: '🌿 Sofia - MaxNutrition' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.WATER_250ML, title: '💧 Bebi 250ml' },
        { type: 'quick_reply', id: BUTTON_IDS.WATER_500ML, title: '💧 Bebi 500ml' },
        { type: 'quick_reply', id: BUTTON_IDS.WATER_NOT_YET, title: '❌ Ainda não' },
      ],
    },
  };
}

export function createWaterConfirmation(data: {
  amount: number;
  totalToday: number;
  goal: number;
}): InteractiveContent {
  const percentage = Math.min(100, Math.round((data.totalToday / data.goal) * 100));
  const progressBar = generateProgressBar(percentage);
  const remaining = Math.max(0, data.goal - data.totalToday);
  
  let celebrationText = '';
  if (percentage >= 100) {
    celebrationText = '\n\n🎉 *PARABÉNS!* Meta atingida! Continue assim!';
  } else if (percentage >= 75) {
    celebrationText = '\n\n💪 Quase lá! Falta pouco!';
  } else if (percentage >= 50) {
    celebrationText = '\n\n👍 Ótimo progresso! Continue hidratando!';
  }
  
  return {
    type: 'button',
    body: {
      text: `✅ *+${data.amount}ml registrado!*\n\n` +
            `💧 *Total hoje:* ${data.totalToday}ml / ${data.goal}ml\n` +
            `${progressBar} ${percentage}%\n` +
            (remaining > 0 ? `📉 Faltam: ${remaining}ml` : '') +
            celebrationText,
    },
    footer: { text: '🌿 Sofia' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.WATER_250ML, title: '💧 +250ml' },
        { type: 'quick_reply', id: BUTTON_IDS.WATER_VIEW_PROGRESS, title: '📊 Ver Semana' },
      ],
    },
  };
}

export function createWaterNotYetResponse(): InteractiveContent {
  return {
    type: 'button',
    body: {
      text: '⏰ *Tudo bem!*\n\n' +
            'Vou te lembrar novamente em breve.\n\n' +
            '💡 *Dica:* Deixe uma garrafa de água sempre por perto!\n\n' +
            'Hidratação é essencial para:\n' +
            '• 🧠 Concentração\n' +
            '• 💪 Energia\n' +
            '• ✨ Pele saudável',
    },
    footer: { text: '🌿 Sofia' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.WATER_250ML, title: '💧 Beber agora' },
        { type: 'quick_reply', id: BUTTON_IDS.MENU, title: '📋 Menu' },
      ],
    },
  };
}

export function createWaterWeeklyProgress(data: {
  weekData: { day: string; amount: number }[];
  avgDaily: number;
  goal: number;
  bestDay: string;
}): InteractiveContent {
  let weekText = '📊 *Consumo da Semana:*\n\n';
  
  data.weekData.forEach(day => {
    const percentage = Math.round((day.amount / data.goal) * 100);
    const emoji = percentage >= 100 ? '✅' : percentage >= 50 ? '🟡' : '🔴';
    weekText += `${emoji} ${day.day}: ${day.amount}ml (${percentage}%)\n`;
  });
  
  weekText += `\n📈 *Média diária:* ${data.avgDaily}ml\n`;
  weekText += `🏆 *Melhor dia:* ${data.bestDay}`;
  
  const avgPercentage = Math.round((data.avgDaily / data.goal) * 100);
  let tipText = '';
  if (avgPercentage < 50) {
    tipText = '\n\n💡 Tente aumentar aos poucos!';
  } else if (avgPercentage >= 100) {
    tipText = '\n\n🎉 Excelente! Continue assim!';
  }
  
  return {
    type: 'button',
    header: { text: '💧 Seu Progresso Semanal' },
    body: { text: weekText + tipText },
    footer: { text: '🌿 Sofia - MaxNutrition' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.WATER_250ML, title: '💧 Registrar agora' },
        { type: 'quick_reply', id: BUTTON_IDS.MENU, title: '📋 Menu' },
      ],
    },
  };
}

// ============================================
// WEEKLY WEIGHING Templates
// ============================================

export function createWeeklyWeighingReminder(data: {
  userName?: string;
  lastWeight?: number;
  lastWaist?: number;
  daysSinceLastWeighing: number;
}): InteractiveContent {
  const greeting = data.userName ? `${data.userName}, ` : '';
  
  let lastDataText = '';
  if (data.lastWeight) {
    lastDataText = `\n📊 *Última medição:*\n`;
    lastDataText += `⚖️ Peso: ${data.lastWeight}kg\n`;
    if (data.lastWaist) {
      lastDataText += `📏 Cintura: ${data.lastWaist}cm\n`;
    }
    lastDataText += `📅 Há ${data.daysSinceLastWeighing} dias\n`;
  }
  
  return {
    type: 'button',
    header: { text: '⚖️ Hora da Pesagem Semanal!' },
    body: {
      text: `${greeting}é dia de atualizar seus dados! 📊\n` +
            lastDataText +
            `\nAcompanhar seu progresso semanalmente ajuda a:\n` +
            `• 📈 Identificar tendências\n` +
            `• 🎯 Ajustar estratégias\n` +
            `• 💪 Manter motivação\n\n` +
            `Vamos registrar?`,
    },
    footer: { text: '🩺 Dr. Vital - MaxNutrition' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.WEIGH_NOW, title: '⚖️ Registrar Agora' },
        { type: 'quick_reply', id: BUTTON_IDS.WEIGH_LATER, title: '⏰ Lembrar Amanhã' },
      ],
    },
  };
}

export function createWeighingPromptWeight(): InteractiveContent {
  return {
    type: 'button',
    body: {
      text: '⚖️ *Qual seu peso atual?*\n\n' +
            'Digite apenas o número em kg.\n\n' +
            '_Exemplos:_\n' +
            '• 72.5\n' +
            '• 68\n' +
            '• 85.3\n\n' +
            '💡 *Dica:* Pese-se sempre no mesmo horário, de preferência pela manhã em jejum.',
    },
    footer: { text: '🩺 Dr. Vital' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.WEIGH_LATER, title: '⏰ Fazer depois' },
      ],
    },
  };
}

export function createWeighingPromptWaist(weight: number): InteractiveContent {
  return {
    type: 'button',
    body: {
      text: `✅ *Peso registrado: ${weight}kg*\n\n` +
            '📏 *Agora a circunferência da cintura!*\n\n' +
            'Meça na altura do umbigo e digite em cm.\n\n' +
            '_Exemplos:_\n' +
            '• 85\n' +
            '• 92.5\n' +
            '• 78\n\n' +
            '💡 *Dica:* Use uma fita métrica flexível, sem apertar.',
    },
    footer: { text: '🩺 Dr. Vital' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.WEIGH_LATER, title: '⏭️ Pular cintura' },
      ],
    },
  };
}

export function createWeighingComplete(data: {
  weight: number;
  waist?: number;
  previousWeight?: number;
  previousWaist?: number;
  analysis?: string;
}): InteractiveContent {
  let variationText = '';
  
  if (data.previousWeight) {
    const weightDiff = data.weight - data.previousWeight;
    const weightEmoji = weightDiff < 0 ? '📉' : weightDiff > 0 ? '📈' : '➡️';
    const weightSign = weightDiff > 0 ? '+' : '';
    variationText += `${weightEmoji} Peso: ${weightSign}${weightDiff.toFixed(1)}kg\n`;
  }
  
  if (data.waist && data.previousWaist) {
    const waistDiff = data.waist - data.previousWaist;
    const waistEmoji = waistDiff < 0 ? '📉' : waistDiff > 0 ? '📈' : '➡️';
    const waistSign = waistDiff > 0 ? '+' : '';
    variationText += `${waistEmoji} Cintura: ${waistSign}${waistDiff.toFixed(1)}cm\n`;
  }
  
  let bodyText = `✅ *Dados registrados com sucesso!*\n\n` +
                 `⚖️ *Peso:* ${data.weight}kg\n`;
  
  if (data.waist) {
    bodyText += `📏 *Cintura:* ${data.waist}cm\n`;
  }
  
  if (variationText) {
    bodyText += `\n📊 *Variação desde última medição:*\n${variationText}`;
  }
  
  if (data.analysis) {
    bodyText += `\n🩺 *Dr. Vital diz:*\n${data.analysis}`;
  }
  
  return {
    type: 'button',
    header: { text: '✅ Pesagem Registrada!' },
    body: { text: bodyText },
    footer: { text: '🩺 Dr. Vital - MaxNutrition' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.WEIGH_VIEW_EVOLUTION, title: '📊 Ver Evolução' },
        { type: 'quick_reply', id: BUTTON_IDS.MENU, title: '📋 Menu' },
      ],
    },
  };
}

export function createWeighingEvolution(data: {
  history: { date: string; weight: number; waist?: number }[];
  startWeight: number;
  currentWeight: number;
  totalLoss: number;
  avgWaist?: number;
}): InteractiveContent {
  let historyText = '📊 *Últimas 4 semanas:*\n\n';
  
  data.history.slice(0, 4).forEach(entry => {
    historyText += `📅 ${entry.date}: ${entry.weight}kg`;
    if (entry.waist) {
      historyText += ` | 📏 ${entry.waist}cm`;
    }
    historyText += '\n';
  });
  
  const lossEmoji = data.totalLoss < 0 ? '🎉' : data.totalLoss > 0 ? '📈' : '➡️';
  const lossText = data.totalLoss < 0 ? 'perdeu' : data.totalLoss > 0 ? 'ganhou' : 'manteve';
  
  historyText += `\n${lossEmoji} *Resultado:* Você ${lossText} ${Math.abs(data.totalLoss).toFixed(1)}kg`;
  
  // Análise contextual
  let analysisText = '';
  if (data.totalLoss < -1) {
    analysisText = '\n\n💪 Ótimo progresso! Continue assim!';
  } else if (data.totalLoss > 1) {
    analysisText = '\n\n💡 Vamos ajustar a estratégia?';
  } else {
    analysisText = '\n\n✅ Peso estável é bom sinal!';
  }
  
  return {
    type: 'button',
    header: { text: '📈 Sua Evolução' },
    body: { text: historyText + analysisText },
    footer: { text: '🩺 Dr. Vital - MaxNutrition' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.VITAL_QUESTION, title: '❓ Tirar dúvida' },
        { type: 'quick_reply', id: BUTTON_IDS.MENU, title: '📋 Menu' },
      ],
    },
  };
}

export function createWeighingLaterResponse(): InteractiveContent {
  return {
    type: 'button',
    body: {
      text: '⏰ *Tudo bem!*\n\n' +
            'Vou te lembrar amanhã pela manhã.\n\n' +
            '💡 *Dica:* O melhor momento para se pesar é:\n' +
            '• 🌅 Pela manhã\n' +
            '• 🚿 Após ir ao banheiro\n' +
            '• 🍽️ Antes do café da manhã\n' +
            '• 👕 Com roupas leves',
    },
    footer: { text: '🩺 Dr. Vital' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.WEIGH_NOW, title: '⚖️ Registrar agora' },
        { type: 'quick_reply', id: BUTTON_IDS.MENU, title: '📋 Menu' },
      ],
    },
  };
}

// ============================================
// HELP Templates
// ============================================

export function createHelpResponse(): InteractiveContent {
  return {
    type: 'button',
    header: { text: '❓ Como posso ajudar?' },
    body: {
      text: '🌿 *Olá! Sou a Sofia, sua nutricionista virtual.*\n\n' +
            'Posso te ajudar com:\n\n' +
            '📸 *Analisar refeições* - Envie uma foto\n' +
            '🔬 *Interpretar exames* - Envie foto do exame\n' +
            '🍽️ *Sugerir cardápios* - Personalizado pra você\n' +
            '💧 *Lembrar de beber água*\n' +
            '⚖️ *Acompanhar peso semanal*\n\n' +
            'Envie uma foto ou escolha uma opção!',
    },
    footer: { text: '🌿 Sofia - MaxNutrition' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_NEW_PHOTO, title: '📸 Enviar Foto' },
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_MEAL_PLAN, title: '🍽️ Ver Cardápio' },
        { type: 'quick_reply', id: BUTTON_IDS.MENU, title: '📋 Menu Completo' },
      ],
    },
  };
}

// Helper function for progress bar
function generateProgressBar(percentage: number): string {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// ============================================
// MAIN MENU Template
// ============================================

export function createMainMenu(): InteractiveContent {
  return {
    type: 'list',
    header: { text: '🌿 MaxNutrition' },
    body: {
      text: 'Olá! Como posso te ajudar hoje?\n\nEscolha uma opção abaixo:',
    },
    footer: { text: 'Sua saúde em primeiro lugar' },
    action: {
      label: '📋 Ver Menu',
      sections: [
        {
          title: '🍽️ Nutrição com Sofia',
          rows: [
            { id: 'menu_analyze', title: '📸 Analisar Refeição', description: 'Envie foto e receba análise nutricional' },
            { id: 'menu_meal_plan', title: '🍽️ Cardápio Semanal', description: 'Sugestões personalizadas' },
            { id: 'menu_tips', title: '💡 Dicas do Dia', description: 'Orientações nutricionais' },
          ],
        },
        {
          title: '🩺 Saúde com Dr. Vital',
          rows: [
            { id: 'menu_exam', title: '🔬 Analisar Exame', description: 'Envie foto do exame médico' },
            { id: 'menu_health_tips', title: '❤️ Dicas de Saúde', description: 'Orientações gerais' },
          ],
        },
        {
          title: '📊 Acompanhamento',
          rows: [
            { id: 'menu_progress', title: '📈 Meu Progresso', description: 'Veja sua evolução' },
            { id: 'menu_history', title: '📅 Histórico', description: 'Refeições anteriores' },
          ],
        },
      ],
    },
  };
}

// ============================================
// Export all templates
// ============================================

export const InteractiveTemplates = {
  // Sofia
  sofiaAnalysisComplete: createSofiaAnalysisComplete,
  sofiaPostConfirm: createSofiaPostConfirm,
  sofiaEditPrompt: createSofiaEditPrompt,
  sofiaDetails: createSofiaDetails,
  
  // Dr. Vital
  vitalAnalysisComplete: createVitalAnalysisComplete,
  vitalFullReport: createVitalFullReport,
  vitalQuestionPrompt: createVitalQuestionPrompt,
  
  // Daily Check-in
  dailyCheckin: createDailyCheckin,
  checkinResponse: createCheckinResponse,
  
  // Meal Plan
  mealPlanSuggestion: createMealPlanSuggestion,
  mealRecipe: createMealRecipe,
  
  // Welcome & Help
  welcomeMessage: createWelcomeMessage,
  helpMenu: createHelpMenu,
  helpResponse: createHelpResponse,
  
  // Water Tracking
  waterReminder: createWaterReminder,
  waterConfirmation: createWaterConfirmation,
  waterNotYetResponse: createWaterNotYetResponse,
  waterWeeklyProgress: createWaterWeeklyProgress,
  
  // Weekly Weighing
  weeklyWeighingReminder: createWeeklyWeighingReminder,
  weighingPromptWeight: createWeighingPromptWeight,
  weighingPromptWaist: createWeighingPromptWaist,
  weighingComplete: createWeighingComplete,
  weighingEvolution: createWeighingEvolution,
  weighingLaterResponse: createWeighingLaterResponse,
  
  // Reports
  weeklyReport: createWeeklyReport,
  
  // Errors
  errorMessage: createErrorMessage,
  
  // Menu
  mainMenu: createMainMenu,
};
