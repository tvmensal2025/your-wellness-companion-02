import { DailyQuestion } from '@/types/daily-missions';

/**
 * Versão LEVE da Missão do Dia
 * - Apenas 7 perguntas essenciais (vs 17 anteriores)
 * - Linguagem mais acolhedora e humana
 * - Foco em bem-estar, não em cobrança
 */
export const dailyQuestionsLight: DailyQuestion[] = [
  // 1. CHECK-IN EMOCIONAL (1 pergunta)
  {
    id: 'mood_check',
    section: 'evening',
    question: 'Como você está se sentindo agora?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Difícil', 'Cansado', 'Ok', 'Bem', 'Ótimo'],
      emojis: ['😔', '😓', '😐', '😊', '✨']
    },
    points: 20,
    required: true,
    order: 1,
    tracking: 'mood_rating'
  },

  // 2. SONO (1 pergunta simples)
  {
    id: 'sleep_quality',
    section: 'habits',
    question: 'Dormiu bem?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Péssimo', 'Mal', 'Mais ou menos', 'Bem', 'Muito bem'],
      emojis: ['😫', '😴', '😐', '😌', '💤']
    },
    points: 15,
    required: true,
    order: 2,
    tracking: 'sleep_quality'
  },

  // 3. HIDRATAÇÃO (1 pergunta)
  {
    id: 'water_today',
    section: 'habits',
    question: 'Bebeu água suficiente hoje?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Quase nada', 'Pouco', 'Razoável', 'Bem', 'Bastante'],
      emojis: ['🏜️', '💧', '💦', '🚰', '🌊']
    },
    points: 15,
    required: true,
    order: 3,
    tracking: 'water_intake'
  },

  // 4. MOVIMENTO (1 pergunta)
  {
    id: 'moved_today',
    section: 'habits',
    question: 'Movimentou o corpo hoje?',
    type: 'yes_no',
    points: 15,
    required: true,
    order: 4,
    tracking: 'physical_activity'
  },

  // 5. ALIMENTAÇÃO (1 pergunta)
  {
    id: 'eating_feeling',
    section: 'habits',
    question: 'Como se sentiu com sua alimentação?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Pesado', 'Irregular', 'Normal', 'Leve', 'Nutritivo'],
      emojis: ['😣', '😕', '😐', '😋', '🥗']
    },
    points: 15,
    required: true,
    order: 5,
    tracking: 'food_feeling'
  },

  // 6. GRATIDÃO (1 pergunta - mais aberta)
  {
    id: 'grateful_for',
    section: 'mindset',
    question: 'Uma coisa boa de hoje?',
    type: 'multiple_choice',
    options: [
      '💚 Minha saúde',
      '👨‍👩‍👧 Pessoas que amo',
      '🎯 Algo que conquistei',
      '🧘 Um momento de paz',
      '🌟 Estar aqui, tentando'
    ],
    points: 20,
    required: true,
    order: 6,
    tracking: 'gratitude'
  },

  // 7. INTENÇÃO (1 pergunta - fechamento positivo)
  {
    id: 'tomorrow_focus',
    section: 'mindset',
    question: 'Amanhã quero focar em...',
    type: 'multiple_choice',
    options: [
      '💪 Me movimentar mais',
      '🥤 Beber mais água',
      '😴 Dormir melhor',
      '🍎 Comer com mais atenção',
      '🧠 Cuidar da mente'
    ],
    points: 20,
    required: true,
    order: 7,
    tracking: 'tomorrow_intention'
  }
];

export const getSectionTitleLight = (section: 'morning' | 'habits' | 'mindset' | 'evening') => {
  switch (section) {
    case 'evening': return 'Como você está';
    case 'habits': return 'Seu dia';
    case 'mindset': return 'Reflexão';
    case 'morning': return 'Bom dia';
    default: return '';
  }
};

// Mapeamento de respostas para valores numéricos (para tracking)
export const mapWaterResponse = (value: number): number => {
  const mapping: Record<number, number> = {
    1: 0.5,  // Quase nada
    2: 1.0,  // Pouco
    3: 1.5,  // Razoável
    4: 2.0,  // Bem
    5: 3.0   // Bastante
  };
  return mapping[value] || 0;
};

export const mapSleepResponse = (value: number): number => {
  const mapping: Record<number, number> = {
    1: 4,   // Péssimo
    2: 5,   // Mal
    3: 6,   // Mais ou menos
    4: 7,   // Bem
    5: 8    // Muito bem
  };
  return mapping[value] || 6;
};
