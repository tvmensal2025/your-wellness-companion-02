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
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_MEAL_PLAN, title: '🍽️ Cardápio' },
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_TIPS, title: '💡 Dicas' },
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
    },
    ok: {
      emoji: '💪',
      text: '*Entendi!* Vamos trabalhar juntos para melhorar seu dia.\n\nQue tal registrar uma refeição saudável?',
    },
    bad: {
      emoji: '💙',
      text: '*Sinto muito que não esteja bem.*\n\nEstou aqui se precisar conversar. Lembre-se: dias difíceis passam.',
    },
  };
  
  const response = responses[feeling];
  
  return {
    type: 'button',
    body: { text: `${response.emoji} ${response.text}` },
    footer: { text: '🌿 MaxNutrition' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_NEW_PHOTO, title: '📸 Registrar Refeição' },
        { type: 'quick_reply', id: BUTTON_IDS.SOFIA_TIPS, title: '💡 Dicas do Dia' },
      ],
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
  
  // Reports
  weeklyReport: createWeeklyReport,
  
  // Errors
  errorMessage: createErrorMessage,
  
  // Menu
  mainMenu: createMainMenu,
};
