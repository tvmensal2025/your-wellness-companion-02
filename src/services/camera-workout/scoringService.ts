/**
 * Scoring Service para Camera Workout
 * Calcula pontos e XP baseado em performance
 */

export interface ScoringResult {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  xp: number;
  streakBonus: number;
  formBonus: number;
}

const POINTS_PER_REP = 10;
const GOOD_FORM_MULTIPLIER = 1.5;
const GOOD_FORM_THRESHOLD = 80; // Form score acima de 80 é considerado bom
const XP_PER_POINT = 2;

/**
 * Calcula pontos base por repetição
 */
export function calculateRepPoints(formScore: number): number {
  const basePoints = POINTS_PER_REP;
  
  // Bonus por boa forma
  if (formScore >= GOOD_FORM_THRESHOLD) {
    return Math.round(basePoints * GOOD_FORM_MULTIPLIER);
  }
  
  return basePoints;
}

/**
 * Calcula bonus de streak
 * Streak = dias consecutivos com treino
 */
export function calculateStreakBonus(streakDays: number): number {
  if (streakDays < 3) return 0;
  if (streakDays < 7) return 50;
  if (streakDays < 14) return 100;
  if (streakDays < 30) return 200;
  return 500; // 30+ dias
}

/**
 * Calcula pontuação total de uma sessão
 */
export function calculateSessionScore(
  totalReps: number,
  averageFormScore: number,
  streakDays: number = 0
): ScoringResult {
  // Pontos base
  const basePoints = totalReps * POINTS_PER_REP;
  
  // Bonus por boa forma
  let formBonus = 0;
  if (averageFormScore >= GOOD_FORM_THRESHOLD) {
    formBonus = Math.round(basePoints * (GOOD_FORM_MULTIPLIER - 1));
  }
  
  // Bonus de streak
  const streakBonus = calculateStreakBonus(streakDays);
  
  // Total
  const bonusPoints = formBonus + streakBonus;
  const totalPoints = basePoints + bonusPoints;
  
  // XP (experiência para nível geral)
  const xp = totalPoints * XP_PER_POINT;
  
  return {
    basePoints,
    bonusPoints,
    totalPoints,
    xp,
    streakBonus,
    formBonus,
  };
}

/**
 * Calcula nível baseado em XP total
 */
export function calculateLevel(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  // Fórmula: XP necessário = 100 * level^1.5
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 100;
  
  while (totalXp >= xpForNextLevel) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel = Math.round(100 * Math.pow(level, 1.5));
  }
  
  const currentLevelXp = totalXp - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const progress = (currentLevelXp / xpNeededForNext) * 100;
  
  return {
    level,
    currentLevelXp,
    nextLevelXp: xpNeededForNext,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

/**
 * Determina rank baseado em pontos totais
 */
export function getRank(totalPoints: number): {
  rank: string;
  icon: string;
  color: string;
  nextRank: string;
  pointsToNext: number;
} {
  const ranks = [
    { name: 'Iniciante', min: 0, icon: '🥉', color: 'text-amber-600' },
    { name: 'Bronze', min: 1000, icon: '🥉', color: 'text-orange-600' },
    { name: 'Prata', min: 5000, icon: '🥈', color: 'text-slate-400' },
    { name: 'Ouro', min: 15000, icon: '🥇', color: 'text-yellow-500' },
    { name: 'Platina', min: 30000, icon: '💎', color: 'text-cyan-400' },
    { name: 'Diamante', min: 50000, icon: '💠', color: 'text-blue-500' },
    { name: 'Mestre', min: 100000, icon: '👑', color: 'text-purple-500' },
    { name: 'Lenda', min: 200000, icon: '⭐', color: 'text-yellow-300' },
  ];
  
  let currentRank = ranks[0];
  let nextRank = ranks[1];
  
  for (let i = 0; i < ranks.length; i++) {
    if (totalPoints >= ranks[i].min) {
      currentRank = ranks[i];
      nextRank = ranks[i + 1] || ranks[i]; // Se já é o último, mantém
    }
  }
  
  const pointsToNext = nextRank.min - totalPoints;
  
  return {
    rank: currentRank.name,
    icon: currentRank.icon,
    color: currentRank.color,
    nextRank: nextRank.name,
    pointsToNext: Math.max(0, pointsToNext),
  };
}

/**
 * Gera mensagem motivacional baseada em performance
 */
export function getMotivationalMessage(
  totalReps: number,
  averageFormScore: number,
  isPersonalBest: boolean = false
): string {
  if (isPersonalBest) {
    return '🎉 Novo recorde pessoal! Você está incrível!';
  }
  
  if (averageFormScore >= 90) {
    return '⭐ Forma perfeita! Continue assim!';
  }
  
  if (averageFormScore >= 80) {
    return '💪 Ótima execução! Você está evoluindo!';
  }
  
  if (totalReps >= 50) {
    return '🔥 Treino intenso! Você é imparável!';
  }
  
  if (totalReps >= 30) {
    return '👏 Excelente trabalho! Continue firme!';
  }
  
  if (totalReps >= 15) {
    return '✨ Bom treino! Cada rep conta!';
  }
  
  return '🌟 Ótimo começo! Continue praticando!';
}

/**
 * Verifica se desbloqueou algum achievement
 */
export function checkAchievements(stats: {
  totalSessions: number;
  totalReps: number;
  bestFormScore: number;
  streakDays: number;
}): string[] {
  const unlockedAchievements: string[] = [];
  
  // Achievements por sessões
  if (stats.totalSessions === 1) unlockedAchievements.push('first_workout');
  if (stats.totalSessions === 10) unlockedAchievements.push('dedicated_10');
  if (stats.totalSessions === 50) unlockedAchievements.push('committed_50');
  if (stats.totalSessions === 100) unlockedAchievements.push('warrior_100');
  
  // Achievements por reps
  if (stats.totalReps >= 100) unlockedAchievements.push('century_club');
  if (stats.totalReps >= 1000) unlockedAchievements.push('thousand_reps');
  if (stats.totalReps >= 10000) unlockedAchievements.push('ten_thousand_legend');
  
  // Achievements por forma
  if (stats.bestFormScore >= 95) unlockedAchievements.push('perfect_form');
  if (stats.bestFormScore >= 90) unlockedAchievements.push('excellent_form');
  
  // Achievements por streak
  if (stats.streakDays >= 7) unlockedAchievements.push('week_warrior');
  if (stats.streakDays >= 30) unlockedAchievements.push('month_master');
  if (stats.streakDays >= 100) unlockedAchievements.push('unstoppable');
  
  return unlockedAchievements;
}

/**
 * Calcula calorias estimadas
 */
export function estimateCalories(
  totalReps: number,
  durationSeconds: number,
  exerciseType: string = 'squat'
): number {
  // Valores aproximados por tipo de exercício
  const caloriesPerRep: Record<string, number> = {
    squat: 0.5,
    pushup: 0.4,
    situp: 0.3,
    plank: 0.2, // por segundo
  };
  
  const baseCalories = totalReps * (caloriesPerRep[exerciseType] || 0.4);
  const timeBonus = durationSeconds * 0.1; // Bonus por tempo ativo
  
  return Math.round(baseCalories + timeBonus);
}
