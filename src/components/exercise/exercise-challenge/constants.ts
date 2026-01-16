// ============================================
// EXERCISE CHALLENGE CONSTANTS
// ============================================

export const EXERCISE_OPTIONS = [
  { value: 'agachamento', label: 'Agachamento', emoji: '🦵' },
  { value: 'flexao', label: 'Flexão', emoji: '💪' },
  { value: 'polichinelo', label: 'Polichinelo', emoji: '⭐' },
  { value: 'abdominal', label: 'Abdominal', emoji: '🔥' },
  { value: 'burpee', label: 'Burpee', emoji: '🏃' },
  { value: 'prancha', label: 'Prancha (seg)', emoji: '🧘' },
  { value: 'lunges', label: 'Avanço', emoji: '🦿' },
  { value: 'mountain_climber', label: 'Mountain Climber', emoji: '⛰️' },
  { value: 'jumping_jack', label: 'Jumping Jack', emoji: '🌟' },
  { value: 'supino', label: 'Supino (kg)', emoji: '🏋️' },
] as const;

export const CHALLENGE_TYPES = [
  { value: 'max_reps', label: 'Máximo de repetições', description: 'Quem fizer mais em 1 minuto' },
  { value: 'first_to', label: 'Primeiro a chegar', description: 'Quem completar X primeiro' },
  { value: 'timed', label: 'Tempo fixo', description: 'Quem fizer mais no tempo' },
] as const;

export type ExerciseOption = typeof EXERCISE_OPTIONS[number];
export type ChallengeTypeOption = typeof CHALLENGE_TYPES[number];
