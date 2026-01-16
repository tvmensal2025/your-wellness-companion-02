// ============================================
// 📋 BUDDY WORKOUT CONSTANTS
// Provocações e templates de desafios
// ============================================

export interface Provocation {
  id: string;
  type: 'taunt' | 'cheer' | 'challenge' | 'celebrate';
  message: string;
  emoji: string;
}

export interface ChallengeTemplate {
  type: string;
  title: string;
  description: string;
  icon: string;
  targetValue: number;
}

export const PROVOCATIONS: Provocation[] = [
  // Provocações divertidas
  { id: '1', type: 'taunt', message: 'Tá leve demais! Bora aumentar o peso! 💪', emoji: '😏' },
  { id: '2', type: 'taunt', message: 'Só isso? Achei que você era forte! 🏋️', emoji: '😤' },
  { id: '3', type: 'taunt', message: 'Meu avô levanta mais que isso! 👴', emoji: '😂' },
  { id: '4', type: 'taunt', message: 'Cadê o treino hoje? Tá com preguiça? 😴', emoji: '🦥' },
  // Incentivos
  { id: '5', type: 'cheer', message: 'Você consegue! Mais uma série! 🔥', emoji: '💪' },
  { id: '6', type: 'cheer', message: 'Tá voando! Continue assim! 🚀', emoji: '⭐' },
  { id: '7', type: 'cheer', message: 'Orgulho de treinar com você! 🤝', emoji: '❤️' },
  // Celebrações
  { id: '8', type: 'celebrate', message: 'RECORDEEE! Você é fera! 🏆', emoji: '🎉' },
  { id: '9', type: 'celebrate', message: 'Mais um treino completo! 💯', emoji: '🔥' },
  // Desafios
  { id: '10', type: 'challenge', message: 'Aposto que não faz 20 flexões! 😈', emoji: '🎯' },
  { id: '11', type: 'challenge', message: 'Quem treinar mais essa semana paga o açaí! 🍨', emoji: '🏆' },
];

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    type: 'more_workouts',
    title: 'Maratona de Treinos',
    description: 'Quem treinar mais vezes essa semana vence!',
    icon: '🏃',
    targetValue: 5,
  },
  {
    type: 'weight_increase',
    title: 'Desafio do Peso',
    description: 'Quem aumentar mais peso no supino vence!',
    icon: '🏋️',
    targetValue: 5,
  },
  {
    type: 'consistency',
    title: 'Sequência Perfeita',
    description: 'Quem mantiver mais dias seguidos treinando!',
    icon: '🔥',
    targetValue: 7,
  },
  {
    type: 'more_reps',
    title: 'Rei das Repetições',
    description: 'Quem fizer mais repetições totais na semana!',
    icon: '💪',
    targetValue: 500,
  },
];
