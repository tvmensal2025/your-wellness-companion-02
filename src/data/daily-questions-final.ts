import { DailyQuestion } from '@/types/daily-missions';

export const dailyQuestionsFinal: DailyQuestion[] = [
  // SEÇÃO 1: COMO FOI SEU DIA
  {
    id: 'day_rating',
    section: 'evening',
    question: 'Como foi seu dia hoje?',
    type: 'star_scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito ruim', 'Ruim', 'Normal', 'Bom', 'Excelente'],
      stars: true
    },
    points: 20,
    required: true,
    order: 1,
    tracking: 'day_rating'
  },
  {
    id: 'evening_energy',
    section: 'evening',
    question: 'Como está sua energia agora?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Esgotado', 'Cansado', 'Normal', 'Bem', 'Energizado'],
      emojis: ['😩', '😓', '😐', '😌', '✨']
    },
    points: 15,
    required: true,
    order: 2,
    tracking: 'evening_energy'
  },
  {
    id: 'body_feeling',
    section: 'evening',
    question: 'Como seu corpo está se sentindo?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Pesado', 'Tenso', 'Normal', 'Leve', 'Ótimo'],
      emojis: ['😫', '😣', '😐', '😊', '💪']
    },
    points: 15,
    required: true,
    order: 3,
    tracking: 'body_feeling'
  },
  {
    id: 'day_highlight',
    section: 'evening',
    question: 'Qual foi o destaque do seu dia?',
    type: 'multiple_choice',
    options: [
      'Momento com família/amigos',
      'Conquista no trabalho',
      'Cuidei da minha saúde',
      'Tive tempo para mim',
      'Aprendi algo novo',
      'Nada especial hoje'
    ],
    points: 15,
    required: true,
    order: 4,
    tracking: 'day_highlight'
  },
  {
    id: 'peace_moments',
    section: 'evening',
    question: 'Você teve momentos de paz hoje?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Nenhum', 'Poucos', 'Alguns', 'Vários', 'Muitos'],
      emojis: ['😔', '😕', '😐', '🧘', '✨']
    },
    points: 15,
    required: true,
    order: 5,
    tracking: 'peace_moments'
  },
  {
    id: 'tomorrow_motivation',
    section: 'evening',
    question: 'Quão motivado você está para amanhã?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Zero', 'Pouco', 'Médio', 'Bastante', 'Total'],
      emojis: ['😴', '😕', '😐', '😃', '🔥']
    },
    points: 15,
    required: true,
    order: 6,
    tracking: 'tomorrow_motivation'
  },

  // SEÇÃO 2: HÁBITOS DO DIA
  {
    id: 'sleep_hours',
    section: 'habits',
    question: 'Quantas horas você dormiu ontem à noite?',
    type: 'multiple_choice',
    options: [
      '4h ou menos',
      '5h',
      '6h',
      '7h',
      '8h ou mais'
    ],
    points: 20,
    required: true,
    order: 7,
    tracking: 'sleep_hours'
  },
  {
    id: 'water_intake',
    section: 'habits',
    question: 'Quanto de água você bebeu hoje?',
    type: 'multiple_choice',
    options: [
      'Menos de 500ml',
      '1L',
      '2L',
      '3L ou mais'
    ],
    points: 15,
    required: true,
    order: 8,
    tracking: 'water_intake'
  },
  {
    id: 'physical_activity',
    section: 'habits',
    question: 'Praticou atividade física hoje?',
    type: 'yes_no',
    points: 15,
    required: true,
    order: 9,
    tracking: 'physical_activity'
  },
  {
    id: 'food_plan',
    section: 'habits',
    question: 'Seguiu seu plano alimentar hoje?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Não segui', 'Pouco', 'Mais ou menos', 'Quase tudo', 'Segui 100%'],
      emojis: ['😔', '😕', '😐', '😊', '🎯']
    },
    points: 20,
    required: true,
    order: 10,
    tracking: 'food_plan'
  },
  {
    id: 'evening_meals',
    section: 'habits',
    question: 'Como foram suas refeições hoje?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Péssimas', 'Ruins', 'Regulares', 'Boas', 'Excelentes'],
      emojis: ['😔', '😕', '😐', '😊', '🤩']
    },
    points: 15,
    required: true,
    order: 11,
    tracking: 'evening_meals'
  },
  {
    id: 'rest_enough',
    section: 'habits',
    question: 'Você descansou o suficiente hoje?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Nada', 'Pouco', 'Razoável', 'Bem', 'Muito bem'],
      emojis: ['😩', '😓', '😐', '😌', '😴']
    },
    points: 15,
    required: true,
    order: 12,
    tracking: 'rest_enough'
  },
  {
    id: 'stress_level',
    section: 'habits',
    question: 'Como está seu nível de estresse hoje?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'],
      emojis: ['😌', '🙂', '😐', '😟', '😰']
    },
    points: 15,
    required: true,
    order: 13,
    tracking: 'stress_level'
  },

  // SEÇÃO 3: REFLEXÃO & GRATIDÃO
  {
    id: 'gratitude',
    section: 'mindset',
    question: 'Pelo que você é grato hoje?',
    type: 'multiple_choice',
    options: [
      'Minha saúde',
      'Minha família',
      'Meu trabalho',
      'Meu corpo',
      'Meus amigos',
      'Outro'
    ],
    points: 15,
    required: true,
    order: 14,
    tracking: 'gratitude'
  },
  {
    id: 'small_victory',
    section: 'mindset',
    question: 'Qual foi sua conquista hoje?',
    type: 'multiple_choice',
    options: [
      'Mantive minha rotina',
      'Treinei/me exercitei',
      'Comi de forma saudável',
      'Fui produtivo no trabalho',
      'Descansei bem',
      'Cuidei da minha mente'
    ],
    points: 20,
    required: true,
    order: 15,
    tracking: 'small_victory'
  },
  {
    id: 'evening_goals_achieved',
    section: 'mindset',
    question: 'Conseguiu cumprir suas metas de hoje?',
    type: 'multiple_choice',
    options: [
      'Sim, todas',
      'A maioria',
      'Algumas',
      'Poucas',
      'Nenhuma'
    ],
    points: 20,
    required: true,
    order: 16,
    tracking: 'goals_achieved'
  },
  {
    id: 'tomorrow_intention',
    section: 'mindset',
    question: 'Qual sua intenção para amanhã?',
    type: 'multiple_choice',
    options: [
      'Cuidar de mim',
      'Estar presente',
      'Ser mais ativo',
      'Comer melhor',
      'Descansar mais'
    ],
    points: 15,
    required: true,
    order: 17,
    tracking: 'tomorrow_intention'
  }
];

export const getQuestionsBySectionFinal = (section: 'morning' | 'habits' | 'mindset' | 'evening') => {
  return dailyQuestionsFinal
    .filter(q => q.section === section)
    .sort((a, b) => a.order - b.order);
};

export const getSectionTitleFinal = (section: 'morning' | 'habits' | 'mindset' | 'evening') => {
  switch (section) {
    case 'evening': return '🌙 COMO FOI SEU DIA';
    case 'habits': return '💪 HÁBITOS DO DIA';
    case 'mindset': return '🧠 REFLEXÃO & GRATIDÃO';
    case 'morning': return '🌅 RITUAL DA MANHÃ';
    default: return '';
  }
};

// Funções para calcular dados de tracking
export const calculateWaterIntake = (answer: string): number => {
  switch (answer) {
    case 'Menos de 500ml': return 0.5;
    case '1L': return 1.0;
    case '2L': return 2.0;
    case '3L ou mais': return 3.0;
    default: return 0;
  }
};

export const calculateSleepHours = (answer: string): number => {
  switch (answer) {
    case '4h ou menos': return 4;
    case '5h': return 5;
    case '6h': return 6;
    case '7h': return 7;
    case '8h ou mais': return 8;
    default: return 0;
  }
};
