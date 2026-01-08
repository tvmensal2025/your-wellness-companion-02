/**
 * SISTEMA DE FORMATAÇÃO RICA PARA RESPOSTAS
 * 
 * Helpers para formatar mensagens com:
 * - **Negrito** para destaque
 * - Emojis contextuais
 * - Espaçamento adequado
 * - Listas organizadas
 */

// ============ EMOJIS CONTEXTUAIS ============

export const EMOJIS = {
  // Sofia - Nutrição
  sofia: {
    avatar: '🥗',
    greeting: '💚',
    food: '🍽️',
    calories: '🔥',
    protein: '💪',
    carbs: '🍞',
    fats: '🥑',
    fiber: '🥬',
    water: '💧',
    success: '✅',
    warning: '⚠️',
    tip: '💡',
    star: '⭐',
    goal: '🎯',
    streak: '🔥',
    celebration: '🎉',
    heart: '❤️',
    sparkle: '✨',
    clock: '⏰',
    scale: '⚖️',
    fruit: '🍎',
    vegetable: '🥦',
    meat: '🍖',
    fish: '🐟',
    breakfast: '☕',
    lunch: '🍽️',
    dinner: '🌙',
    snack: '🍪',
  },
  // Dr. Vital - Médico
  drVital: {
    avatar: '🩺',
    greeting: '👋',
    exam: '📋',
    result: '📊',
    blood: '🩸',
    heart: '❤️',
    healthy: '✅',
    attention: '⚠️',
    critical: '🚨',
    medicine: '💊',
    vitamin: '💊',
    sleep: '😴',
    exercise: '🏃',
    brain: '🧠',
    bone: '🦴',
    muscle: '💪',
    recommendation: '💡',
    doctor: '👨‍⚕️',
    calendar: '📅',
    report: '📄',
    prevention: '🛡️',
    immune: '🦠',
  },
  // Gamificação
  game: {
    trophy: '🏆',
    medal: '🥇',
    fire: '🔥',
    star: '⭐',
    level: '📈',
    points: '💎',
    mission: '🎯',
    challenge: '⚔️',
    badge: '🏅',
    crown: '👑',
    rocket: '🚀',
  },
  // Comunidade
  community: {
    people: '👥',
    chat: '💬',
    like: '❤️',
    comment: '💭',
    share: '🔄',
    support: '🤝',
  },
};

// ============ FORMATAÇÃO DE TEXTO ============

/**
 * Aplica negrito ao texto (WhatsApp style)
 */
export function bold(text: string): string {
  return `*${text}*`;
}

/**
 * Aplica itálico ao texto
 */
export function italic(text: string): string {
  return `_${text}_`;
}

/**
 * Aplica tachado ao texto
 */
export function strike(text: string): string {
  return `~${text}~`;
}

/**
 * Cria uma lista numerada
 */
export function numberedList(items: string[]): string {
  return items.map((item, i) => `${i + 1}. ${item}`).join('\n');
}

/**
 * Cria uma lista com bullets
 */
export function bulletList(items: string[], bullet = '•'): string {
  return items.map(item => `${bullet} ${item}`).join('\n');
}

/**
 * Adiciona quebras de linha para espaçamento
 */
export function spacer(lines = 1): string {
  return '\n'.repeat(lines);
}

/**
 * Cria um separador visual
 */
export function separator(): string {
  return '\n━━━━━━━━━━━━━━━━━\n';
}

/**
 * Formata valor nutricional
 */
export function formatNutrition(label: string, value: number, unit: string, emoji?: string): string {
  const emojiStr = emoji ? `${emoji} ` : '';
  return `${emojiStr}${bold(label)}: ${value}${unit}`;
}

/**
 * Formata porcentagem de progresso
 */
export function formatProgress(current: number, target: number, label?: string): string {
  const percentage = Math.round((current / target) * 100);
  const bar = createProgressBar(percentage);
  const labelStr = label ? `${label}: ` : '';
  return `${labelStr}${bar} ${percentage}%`;
}

/**
 * Cria barra de progresso visual
 */
export function createProgressBar(percentage: number, length = 10): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

// ============ FORMATAÇÃO DE MENSAGENS ============

export interface FormattedMessage {
  text: string;
  personality: 'sofia' | 'drvital';
}

/**
 * Formata saudação personalizada
 */
export function formatGreeting(name: string, personality: 'sofia' | 'drvital'): string {
  const emoji = personality === 'sofia' ? EMOJIS.sofia.greeting : EMOJIS.drVital.greeting;
  const avatar = personality === 'sofia' ? EMOJIS.sofia.avatar : EMOJIS.drVital.avatar;
  const title = personality === 'sofia' ? 'Sofia' : 'Dr. Vital';
  
  return `${avatar} ${bold(title)} ${emoji}\n\nOlá, ${bold(name)}!`;
}

/**
 * Formata seção com título
 */
export function formatSection(title: string, content: string, emoji?: string): string {
  const emojiStr = emoji ? `${emoji} ` : '';
  return `\n${emojiStr}${bold(title)}\n${content}`;
}

/**
 * Formata card de refeição
 */
export function formatMealCard(
  mealType: string,
  foods: Array<{ name: string; grams: number; calories: number }>,
  totalCalories: number
): string {
  const mealEmojis: Record<string, string> = {
    cafe_da_manha: '☕',
    lanche_manha: '🍎',
    almoco: '🍽️',
    lanche_tarde: '🥤',
    jantar: '🌙',
    ceia: '🌃',
  };
  
  const emoji = mealEmojis[mealType] || '🍽️';
  const mealNames: Record<string, string> = {
    cafe_da_manha: 'Café da Manhã',
    lanche_manha: 'Lanche da Manhã',
    almoco: 'Almoço',
    lanche_tarde: 'Lanche da Tarde',
    jantar: 'Jantar',
    ceia: 'Ceia',
  };
  
  const mealName = mealNames[mealType] || mealType;
  
  const foodList = foods.map(f => 
    `• ${f.name} ${italic(`(${f.grams}g)`)} - ${f.calories}kcal`
  ).join('\n');
  
  return `${emoji} ${bold(mealName)}\n${foodList}\n\n${EMOJIS.sofia.calories} ${bold('Total')}: ${totalCalories}kcal`;
}

/**
 * Formata resultado de exame
 */
export function formatExamResult(
  examName: string,
  value: number,
  unit: string,
  reference: { min: number; max: number },
  status: 'normal' | 'attention' | 'critical'
): string {
  const statusEmojis = {
    normal: EMOJIS.drVital.healthy,
    attention: EMOJIS.drVital.attention,
    critical: EMOJIS.drVital.critical,
  };
  
  const statusLabels = {
    normal: 'Normal',
    attention: 'Atenção',
    critical: 'Crítico',
  };
  
  return `${statusEmojis[status]} ${bold(examName)}: ${value} ${unit}\n   Ref: ${reference.min}-${reference.max} ${unit} (${statusLabels[status]})`;
}

/**
 * Formata resumo de streak
 */
export function formatStreak(days: number, isActive: boolean): string {
  if (!isActive || days === 0) {
    return `${EMOJIS.game.fire} Streak: ${bold('0 dias')} - Comece hoje!`;
  }
  
  const fireEmojis = Math.min(days, 5);
  const fires = EMOJIS.game.fire.repeat(fireEmojis);
  
  return `${fires} Streak: ${bold(`${days} dias`)} consecutivos!`;
}

/**
 * Formata card de meta
 */
export function formatGoalCard(
  title: string,
  current: number,
  target: number,
  unit: string,
  emoji?: string
): string {
  const percentage = Math.round((current / target) * 100);
  const bar = createProgressBar(percentage);
  const emojiStr = emoji || EMOJIS.sofia.goal;
  
  return `${emojiStr} ${bold(title)}\n${bar} ${percentage}%\n${current}/${target} ${unit}`;
}

/**
 * Formata dica/recomendação
 */
export function formatTip(text: string, personality: 'sofia' | 'drvital'): string {
  const emoji = personality === 'sofia' ? EMOJIS.sofia.tip : EMOJIS.drVital.recommendation;
  return `\n${emoji} ${bold('Dica')}: ${text}`;
}

/**
 * Formata assinatura final
 */
export function formatSignature(personality: 'sofia' | 'drvital', motivational?: string): string {
  const emoji = personality === 'sofia' ? EMOJIS.sofia.sparkle : EMOJIS.drVital.heart;
  const name = personality === 'sofia' ? 'Sofia' : 'Dr. Vital';
  const heart = personality === 'sofia' ? '💚' : '💙';
  
  const motivation = motivational ? `\n\n${italic(motivational)}` : '';
  
  return `${motivation}\n\n${emoji} ${name} ${heart}`;
}

// ============ DETECÇÃO DE PERSONALIDADE ============

const MEDICAL_KEYWORDS = [
  'exame', 'exames', 'médico', 'medico', 'médica', 'medica',
  'remédio', 'remedio', 'remédios', 'remedios', 'medicamento', 'medicamentos',
  'pressão', 'pressao', 'arterial', 'diabetes', 'diabete',
  'doença', 'doenca', 'doenças', 'doencas', 'sintoma', 'sintomas',
  'dor', 'dores', 'consulta', 'laboratório', 'laboratorio',
  'resultado', 'resultados', 'hemograma', 'glicose', 'colesterol',
  'triglicerídeos', 'triglicerideos', 'triglicerides',
  'vitamina', 'vitaminas', 'deficiência', 'deficiencia',
  'anemia', 'tireoide', 'tireóide', 'hormônio', 'hormonio', 'hormônios', 'hormonios',
  'coração', 'coracao', 'cardíaco', 'cardiaco', 'cardiovascular',
  'fígado', 'figado', 'hepatico', 'hepático', 'rim', 'rins', 'renal',
  'sangue', 'urina', 'fezes', 'biópsia', 'biopsia',
  'ultrassom', 'ultrassonografia', 'raio-x', 'raio x', 'tomografia', 'ressonância', 'ressonancia',
  'cirurgia', 'operação', 'operacao', 'tratamento', 'terapia',
  'infecção', 'infeccao', 'inflamação', 'inflamacao',
  'alergia', 'alergias', 'intolerância', 'intolerancia',
  'diagnóstico', 'diagnostico', 'prognóstico', 'prognostico',
  'prevenção', 'prevencao', 'preventivo', 'check-up', 'checkup',
];

const NUTRITION_KEYWORDS = [
  'comida', 'comidas', 'comer', 'comi', 'comendo', 'calorias', 'caloria',
  'dieta', 'dietas', 'refeição', 'refeicao', 'refeições', 'refeicoes',
  'alimento', 'alimentos', 'alimentação', 'alimentacao',
  'peso', 'emagrecer', 'emagrecimento', 'engordar', 'gordura',
  'proteína', 'proteina', 'proteínas', 'proteinas',
  'carboidrato', 'carboidratos', 'carbo', 'carbos',
  'gorduras', 'lipídios', 'lipidios', 'fibra', 'fibras',
  'nutriente', 'nutrientes', 'nutricional', 'nutrição', 'nutricao',
  'café da manhã', 'cafe da manha', 'almoço', 'almoco', 'jantar', 'lanche',
  'fruta', 'frutas', 'verdura', 'verduras', 'legume', 'legumes',
  'carne', 'carnes', 'peixe', 'peixes', 'frango', 'ovo', 'ovos',
  'arroz', 'feijão', 'feijao', 'macarrão', 'macarrao', 'pão', 'pao',
  'leite', 'queijo', 'iogurte', 'lacteo', 'lácteo',
  'açúcar', 'acucar', 'doce', 'doces', 'sobremesa',
  'sal', 'sódio', 'sodio', 'tempero', 'temperos',
  'receita', 'receitas', 'cardápio', 'cardapio', 'menu',
  'hidratação', 'hidratacao', 'água', 'agua', 'beber',
  'suplemento', 'suplementos', 'whey', 'creatina',
  'metabolismo', 'metabólico', 'metabolico', 'imc', 'índice de massa',
  'fome', 'saciedade', 'apetite', 'compulsão', 'compulsao',
];

/**
 * Detecta qual personalidade deve responder baseado no conteúdo da mensagem
 */
export function detectPersonality(message: string): 'sofia' | 'drvital' {
  const lowerMessage = message.toLowerCase();
  
  // Contar palavras-chave de cada categoria
  let medicalScore = 0;
  let nutritionScore = 0;
  
  for (const keyword of MEDICAL_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      medicalScore++;
    }
  }
  
  for (const keyword of NUTRITION_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      nutritionScore++;
    }
  }
  
  // Se tiver mais palavras médicas, usar Dr. Vital
  // Se empatar ou tiver mais nutrição, usar Sofia (default)
  if (medicalScore > nutritionScore && medicalScore > 0) {
    return 'drvital';
  }
  
  return 'sofia';
}

/**
 * Retorna o nome da personalidade para exibição
 */
export function getPersonalityName(personality: 'sofia' | 'drvital'): string {
  return personality === 'sofia' ? 'Sofia 🥗' : 'Dr. Vital 🩺';
}

/**
 * Retorna o avatar emoji da personalidade
 */
export function getPersonalityAvatar(personality: 'sofia' | 'drvital'): string {
  return personality === 'sofia' ? EMOJIS.sofia.avatar : EMOJIS.drVital.avatar;
}
