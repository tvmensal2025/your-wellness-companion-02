/**
 * RESPOSTAS DETERMINÍSTICAS DE FALLBACK
 * 
 * Usadas quando TODOS os provedores de IA falham.
 * Garante que o usuário NUNCA fique sem resposta.
 */

export interface FallbackContext {
  nome?: string;
  hora?: number;
  personality?: 'sofia' | 'drvital';
}

function getSaudacao(hora?: number): string {
  const h = hora ?? new Date().getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

// ============ RESPOSTAS DA SOFIA ============

export const SOFIA_FALLBACKS = {
  greeting: (ctx: FallbackContext) => 
    `${getSaudacao(ctx.hora)}, ${ctx.nome || 'querido(a)'}! 👋\n\n` +
    `Sou a Sofia, sua nutricionista virtual! Como posso te ajudar hoje?\n\n` +
    `📸 Envie uma foto da sua refeição\n` +
    `✍️ Ou me conte o que você comeu\n` +
    `💬 Podemos conversar sobre nutrição\n\n` +
    `_Sofia 🥗_`,

  imageReceived: (ctx: FallbackContext) =>
    `${ctx.nome || 'Querido(a)'}, recebi sua foto! 📸\n\n` +
    `Estou analisando... isso pode levar alguns segundinhos.\n\n` +
    `_Sofia 🥗_`,

  analysisInProgress: (ctx: FallbackContext) =>
    `Calma, ${ctx.nome || 'amor'}! Ainda estou analisando sua foto. 🔍\n\n` +
    `Em breve te mando o resultado!\n\n` +
    `_Sofia 🥗_`,

  technicalError: (ctx: FallbackContext) =>
    `${ctx.nome || 'Querido(a)'}, tive um probleminha técnico 😅\n\n` +
    `Mas não se preocupe! Pode me descrever o que você comeu que eu registro pra você.\n\n` +
    `Ou tente enviar a foto novamente em alguns minutinhos.\n\n` +
    `_Sofia 🥗_`,

  mealConfirmed: (ctx: FallbackContext) =>
    `Ótimo, ${ctx.nome || 'amor'}! ✅ Sua refeição foi registrada!\n\n` +
    `Continue assim, você está no caminho certo! 💪\n\n` +
    `_Sofia 🥗_`,

  mealCancelled: (ctx: FallbackContext) =>
    `Entendi, ${ctx.nome || 'querido(a)'}! ❌ Cancelei esse registro.\n\n` +
    `Quando quiser, me mande outra foto ou descrição!\n\n` +
    `_Sofia 🥗_`,

  waterRegistered: (amount: number, total: number, ctx: FallbackContext) =>
    `💧 Anotado, ${ctx.nome || 'amor'}!\n\n` +
    `+${amount}ml registrado. Total hoje: ${total}ml\n\n` +
    `${total >= 2000 ? 'Parabéns! Meta de água atingida! 🎉' : 'Continue hidratando! 💪'}\n\n` +
    `_Sofia 🥗_`,

  weightRegistered: (weight: number, ctx: FallbackContext) =>
    `⚖️ Peso registrado: ${weight}kg\n\n` +
    `Mantenha a consistência nos registros, ${ctx.nome || 'amor'}! 📊\n\n` +
    `_Sofia 🥗_`,

  genericHelp: (ctx: FallbackContext) =>
    `${ctx.nome || 'Querido(a)'}, estou aqui pra te ajudar! 💚\n\n` +
    `Posso te ajudar com:\n` +
    `• 📸 Análise de fotos de refeições\n` +
    `• 💧 Registro de água\n` +
    `• ⚖️ Registro de peso\n` +
    `• 💬 Dúvidas sobre nutrição\n\n` +
    `O que prefere fazer agora?\n\n` +
    `_Sofia 🥗_`,

  rateLimited: (ctx: FallbackContext) =>
    `${ctx.nome || 'Amor'}, estou um pouquinho ocupada! 😅\n\n` +
    `Me manda de novo em 1 minutinho? 🙏\n\n` +
    `_Sofia 🥗_`,

  paymentRequired: (ctx: FallbackContext) =>
    `${ctx.nome || 'Querido(a)'}, preciso de uma pausa técnica. 🔧\n\n` +
    `Tenta de novo mais tarde? 💚\n\n` +
    `_Sofia 🥗_`,
};

// ============ RESPOSTAS DO DR. VITAL ============

export const DRVITAL_FALLBACKS = {
  greeting: (ctx: FallbackContext) =>
    `${getSaudacao(ctx.hora)}, ${ctx.nome || 'paciente'}! 🩺\n\n` +
    `Sou o Dr. Vital, seu assistente de saúde!\n\n` +
    `📸 Envie fotos de exames para análise\n` +
    `💬 Ou me pergunte sobre saúde\n\n` +
    `_Dr. Vital 🩺_`,

  imageReceived: (ctx: FallbackContext) =>
    `${ctx.nome || 'Paciente'}, recebi sua foto de exame! 📋\n\n` +
    `Vou analisar com cuidado. Isso pode levar alguns minutos.\n\n` +
    `_Dr. Vital 🩺_`,

  analysisInProgress: (ctx: FallbackContext) =>
    `${ctx.nome || 'Paciente'}, ainda estou analisando seus exames. 🔬\n\n` +
    `Análises médicas requerem atenção - aguarde um momento.\n\n` +
    `_Dr. Vital 🩺_`,

  technicalError: (ctx: FallbackContext) =>
    `${ctx.nome || 'Paciente'}, tive um problema técnico na análise. 🔧\n\n` +
    `Por favor, tente enviar os exames novamente em alguns minutos.\n\n` +
    `Se precisar de orientação urgente, procure atendimento presencial.\n\n` +
    `_Dr. Vital 🩺_`,

  analysisComplete: (ctx: FallbackContext) =>
    `${ctx.nome || 'Paciente'}, a análise dos seus exames está pronta! ✅\n\n` +
    `Acesse o relatório completo no link que enviei.\n\n` +
    `Lembre-se: para decisões médicas, consulte sempre um profissional.\n\n` +
    `_Dr. Vital 🩺_`,

  analysisCancelled: (ctx: FallbackContext) =>
    `❌ Análise cancelada, ${ctx.nome || 'paciente'}.\n\n` +
    `Quando quiser, envie novas fotos de exames!\n\n` +
    `_Dr. Vital 🩺_`,

  symptomRegistered: (location: string, ctx: FallbackContext) =>
    `🩺 Registrado: ${location}\n\n` +
    `${ctx.nome || 'Paciente'}, estou acompanhando seus sintomas.\n\n` +
    `Se a dor persistir ou piorar, procure atendimento médico.\n\n` +
    `_Dr. Vital 🩺_`,

  genericHelp: (ctx: FallbackContext) =>
    `${ctx.nome || 'Paciente'}, como posso ajudar? 🩺\n\n` +
    `• 📋 Análise de exames laboratoriais\n` +
    `• 📊 Interpretação de resultados\n` +
    `• 💊 Orientações gerais de saúde\n\n` +
    `⚠️ Lembre-se: não substituo consulta presencial.\n\n` +
    `_Dr. Vital 🩺_`,

  urgentAdvice: (ctx: FallbackContext) =>
    `⚠️ ${ctx.nome || 'Paciente'}, baseado no que você descreveu:\n\n` +
    `🚨 *RECOMENDO BUSCAR ATENDIMENTO MÉDICO*\n\n` +
    `Alguns sintomas requerem avaliação presencial urgente.\n` +
    `Procure uma UPA ou emergência se necessário.\n\n` +
    `_Dr. Vital 🩺_`,

  rateLimited: (ctx: FallbackContext) =>
    `${ctx.nome || 'Paciente'}, estou com muitos atendimentos no momento. 📋\n\n` +
    `Por favor, aguarde 1 minuto e tente novamente.\n\n` +
    `_Dr. Vital 🩺_`,

  paymentRequired: (ctx: FallbackContext) =>
    `${ctx.nome || 'Paciente'}, estou em manutenção técnica. 🔧\n\n` +
    `Tente novamente mais tarde.\n\n` +
    `_Dr. Vital 🩺_`,
};

// ============ FUNÇÃO HELPER ============

export function getFallbackResponse(
  type: string,
  personality: 'sofia' | 'drvital' = 'sofia',
  ctx: FallbackContext = {}
): string {
  const fallbacks = personality === 'drvital' ? DRVITAL_FALLBACKS : SOFIA_FALLBACKS;
  
  switch (type) {
    case 'greeting':
      return fallbacks.greeting(ctx);
    case 'image_received':
      return fallbacks.imageReceived(ctx);
    case 'analysis_in_progress':
      return fallbacks.analysisInProgress(ctx);
    case 'technical_error':
      return fallbacks.technicalError(ctx);
    case 'generic_help':
      return fallbacks.genericHelp(ctx);
    case 'rate_limited':
      return fallbacks.rateLimited(ctx);
    case 'payment_required':
      return fallbacks.paymentRequired(ctx);
    default:
      return fallbacks.genericHelp(ctx);
  }
}

// ============ DETECÇÃO DE TIPO DE MENSAGEM ============

export function detectMessageType(message: string): string {
  const lower = message.toLowerCase().trim();
  
  // Saudações
  if (/^(oi|olá|ola|hey|e ai|eai|bom dia|boa tarde|boa noite|opa|fala)/.test(lower)) {
    return 'greeting';
  }
  
  // Ajuda
  if (/^(ajuda|help|como|o que|menu|opcoes|opções)/.test(lower)) {
    return 'generic_help';
  }
  
  // Confirmações
  if (/^(sim|s|ok|isso|confirmo|1|certo)$/.test(lower)) {
    return 'confirmation_positive';
  }
  
  // Negações
  if (/^(não|nao|n|cancela|2|nope)$/.test(lower)) {
    return 'confirmation_negative';
  }
  
  return 'general';
}
