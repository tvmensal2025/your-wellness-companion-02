// ============================================
// 🎮 GAMIFICATION SERVICE
// Sistema de pontos, conquistas e desafios
// ============================================

import { supabase } from '@/integrations/supabase/client';
import { fromTable, callRpc } from '@/lib/supabase-helpers';
import type {
  GamificationPoints,
  PointsAwarded,
  Achievement,
  UserAchievement,
  Streak,
  Challenge,
  ChallengeParticipation,
  Leaderboard,
  LeaderboardEntry,
  PerformanceMetric,
} from '@/types/advanced-exercise-system';

// ============================================
// CONSTANTS
// ============================================

const POINTS_CONFIG = {
  basePerExercise: 10,
  basePerMinute: 1,
  difficultyBonus: {
    high: 20, // difficulty >= 7
    medium: 10, // difficulty >= 5
  },
  streakMultipliers: {
    3: 1.1,
    7: 1.25,
    14: 1.5,
    30: 2.0,
  },
  personalRecordBonus: 50,
};

const XP_CONFIG = {
  basePerWorkout: 25,
  perLevel: 100, // XP necessário por nível
  levelMultiplier: 1.2, // cada nível precisa 20% mais XP
};

// ============================================
// GAMIFICATION SERVICE CLASS
// ============================================

export class GamificationService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ============================================
  // POINTS SYSTEM
  // ============================================

  async awardWorkoutPoints(
    durationMinutes: number,
    exercisesCompleted: number,
    avgDifficulty: number,
    isPersonalRecord: boolean = false
  ): Promise<PointsAwarded> {
    // Calcular pontos base
    const basePoints = 
      (exercisesCompleted * POINTS_CONFIG.basePerExercise) +
      (durationMinutes * POINTS_CONFIG.basePerMinute);

    // Calcular bônus
    let bonusPoints = 0;
    if (avgDifficulty >= 7) {
      bonusPoints += POINTS_CONFIG.difficultyBonus.high;
    } else if (avgDifficulty >= 5) {
      bonusPoints += POINTS_CONFIG.difficultyBonus.medium;
    }
    if (isPersonalRecord) {
      bonusPoints += POINTS_CONFIG.personalRecordBonus;
    }

    // Buscar streak atual para multiplicador
    const streak = await this.getStreak();
    let multiplier = 1.0;
    if (streak) {
      for (const [days, mult] of Object.entries(POINTS_CONFIG.streakMultipliers).reverse()) {
        if (streak.currentStreak >= parseInt(days)) {
          multiplier = mult;
          break;
        }
      }
    }

    // Calcular total
    const totalPoints = Math.floor((basePoints + bonusPoints) * multiplier);
    const xpEarned = XP_CONFIG.basePerWorkout + Math.floor(totalPoints / 10);

    // Salvar pontos
    await this.savePoints(totalPoints, xpEarned, 'workout_complete');

    // Atualizar streak
    await this.updateStreak();

    // Verificar conquistas
    await this.checkAchievements();

    return {
      basePoints,
      bonusPoints,
      multiplier,
      totalPoints,
      xpEarned,
      reason: this.generatePointsReason(avgDifficulty, isPersonalRecord, multiplier),
      sourceType: 'workout_complete',
    };
  }

  private async savePoints(
    points: number,
    xp: number,
    sourceType: string,
    sourceId?: string
  ): Promise<void> {
    // Inserir histórico
    await fromTable('exercise_points_history').insert({
      user_id: this.userId,
      points_earned: points,
      xp_earned: xp,
      source_type: sourceType,
      source_id: sourceId,
      base_points: points,
      multiplier: 1.0,
    });

    // Atualizar totais
    const { data: current } = await fromTable('exercise_gamification_points')
      .select('*')
      .eq('user_id', this.userId)
      .maybeSingle() as any;

    const newTotalPoints = (current?.total_points || 0) + points;
    const newWeeklyPoints = (current?.weekly_points || 0) + points;
    const newMonthlyPoints = (current?.monthly_points || 0) + points;
    const newXp = (current?.current_xp || 0) + xp;
    
    // Calcular nível
    const { level, remainingXp, xpToNext } = this.calculateLevel(
      (current?.current_level || 1),
      newXp
    );

    await fromTable('exercise_gamification_points').upsert({
      user_id: this.userId,
      total_points: newTotalPoints,
      weekly_points: newWeeklyPoints,
      monthly_points: newMonthlyPoints,
      current_level: level,
      current_xp: remainingXp,
      xp_to_next_level: xpToNext,
    }, {
      onConflict: 'user_id',
    });
  }

  private calculateLevel(
    currentLevel: number,
    totalXp: number
  ): { level: number; remainingXp: number; xpToNext: number } {
    let level = currentLevel;
    let xp = totalXp;
    let xpNeeded = Math.floor(XP_CONFIG.perLevel * Math.pow(XP_CONFIG.levelMultiplier, level - 1));

    while (xp >= xpNeeded) {
      xp -= xpNeeded;
      level++;
      xpNeeded = Math.floor(XP_CONFIG.perLevel * Math.pow(XP_CONFIG.levelMultiplier, level - 1));
    }

    return {
      level,
      remainingXp: xp,
      xpToNext: xpNeeded,
    };
  }

  private generatePointsReason(
    difficulty: number,
    isPersonalRecord: boolean,
    multiplier: number
  ): string {
    const parts: string[] = ['Treino completo'];
    
    if (difficulty >= 7) parts.push('bônus de dificuldade alta');
    if (isPersonalRecord) parts.push('recorde pessoal');
    if (multiplier > 1) parts.push(`multiplicador de streak x${multiplier}`);
    
    return parts.join(' + ');
  }

  // ============================================
  // STREAK SYSTEM
  // ============================================

  async getStreak(): Promise<Streak | null> {
    const { data } = await fromTable('exercise_streaks')
      .select('*')
      .eq('user_id', this.userId)
      .maybeSingle() as any;

    if (!data) return null;

    return {
      userId: data.user_id,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      streakStartDate: data.streak_start_date ? new Date(data.streak_start_date) : undefined,
      lastWorkoutDate: data.last_workout_date ? new Date(data.last_workout_date) : undefined,
      freezeAvailable: data.freeze_available,
      freezeUsedAt: data.freeze_used_at ? new Date(data.freeze_used_at) : undefined,
    };
  }

  async updateStreak(): Promise<Streak> {
    // Usar função do banco de dados
    await callRpc('update_exercise_streak', { p_user_id: this.userId });
    
    const streak = await this.getStreak();
    return streak!;
  }

  async useStreakFreeze(): Promise<boolean> {
    const streak = await this.getStreak();
    
    if (!streak || !streak.freezeAvailable) {
      return false;
    }

    await fromTable('exercise_streaks')
      .update({
        freeze_available: false,
        freeze_used_at: new Date().toISOString(),
      })
      .eq('user_id', this.userId);

    return true;
  }

  // ============================================
  // ACHIEVEMENTS SYSTEM
  // ============================================

  async getAchievements(): Promise<UserAchievement[]> {
    const { data } = await fromTable('exercise_user_achievements')
      .select(`
        *,
        achievement:exercise_achievements(*)
      `)
      .eq('user_id', this.userId) as any;

    return (data || []).map((ua: any) => ({
      id: ua.id,
      achievementId: ua.achievement_id,
      achievement: ua.achievement ? {
        id: ua.achievement.id,
        code: ua.achievement.code,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category,
        rarity: ua.achievement.rarity,
        pointsReward: ua.achievement.points_reward,
        xpReward: ua.achievement.xp_reward,
        unlocks: ua.achievement.unlocks,
        unlockCriteria: ua.achievement.unlock_criteria,
        isActive: ua.achievement.is_active,
      } : undefined,
      progress: ua.progress,
      maxProgress: ua.max_progress,
      isCompleted: ua.is_completed,
      startedAt: new Date(ua.started_at),
      completedAt: ua.completed_at ? new Date(ua.completed_at) : undefined,
    }));
  }

  async checkAchievements(): Promise<Achievement[]> {
    // Usar função do banco de dados
    const { data } = await callRpc('check_exercise_achievements', {
      p_user_id: this.userId,
    });

    return (data || []) as Achievement[];
  }

  async getAllAchievements(): Promise<Achievement[]> {
    const { data } = await fromTable('exercise_achievements')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('rarity') as any;

    return (data || []).map((a: any) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      description: a.description,
      icon: a.icon,
      category: a.category,
      rarity: a.rarity,
      pointsReward: a.points_reward,
      xpReward: a.xp_reward,
      unlocks: a.unlocks,
      unlockCriteria: a.unlock_criteria,
      isActive: a.is_active,
    }));
  }

  // ============================================
  // CHALLENGES SYSTEM
  // ============================================

  async getActiveChallenges(): Promise<Challenge[]> {
    const { data } = await fromTable('exercise_challenges')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .order('end_date') as any;

    return (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      challengeType: c.challenge_type,
      startDate: new Date(c.start_date),
      endDate: new Date(c.end_date),
      goalType: c.goal_type,
      goalValue: c.goal_value,
      pointsReward: c.points_reward,
      xpReward: c.xp_reward,
      difficultyLevel: c.difficulty_level,
      minLevelRequired: c.min_level_required,
      isActive: c.is_active,
      maxParticipants: c.max_participants,
    }));
  }

  async joinChallenge(challengeId: string): Promise<ChallengeParticipation> {
    const { data, error } = await fromTable('exercise_challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: this.userId,
        current_progress: 0,
        is_completed: false,
      })
      .select()
      .single() as any;

    if (error) throw error;

    return {
      id: data.id,
      challengeId: data.challenge_id,
      currentProgress: data.current_progress,
      isCompleted: data.is_completed,
      joinedAt: new Date(data.joined_at),
    };
  }

  async updateChallengeProgress(
    challengeId: string,
    progressIncrement: number
  ): Promise<ChallengeParticipation | null> {
    const { data: participation } = await fromTable('exercise_challenge_participants')
      .select('*, challenge:exercise_challenges(*)')
      .eq('challenge_id', challengeId)
      .eq('user_id', this.userId)
      .maybeSingle() as any;

    if (!participation) return null;

    const newProgress = participation.current_progress + progressIncrement;
    const isCompleted = newProgress >= participation.challenge?.goal_value;

    await fromTable('exercise_challenge_participants')
      .update({
        current_progress: newProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', participation.id);

    if (isCompleted && !participation.is_completed) {
      await this.savePoints(
        participation.challenge?.points_reward || 0,
        participation.challenge?.xp_reward || 0,
        'challenge',
        challengeId
      );
    }

    return {
      id: participation.id,
      challengeId: participation.challenge_id,
      currentProgress: newProgress,
      isCompleted,
      joinedAt: new Date(participation.joined_at),
      completedAt: isCompleted ? new Date() : undefined,
    };
  }

  async getMyChallenges(): Promise<ChallengeParticipation[]> {
    const { data } = await fromTable('exercise_challenge_participants')
      .select(`*, challenge:exercise_challenges(*)`)
      .eq('user_id', this.userId)
      .order('joined_at', { ascending: false }) as any;

    return (data || []).map((p: any) => ({
      id: p.id,
      challengeId: p.challenge_id,
      challenge: p.challenge ? {
        id: p.challenge.id,
        title: p.challenge.title,
        description: p.challenge.description,
        challengeType: p.challenge.challenge_type,
        startDate: new Date(p.challenge.start_date),
        endDate: new Date(p.challenge.end_date),
        goalType: p.challenge.goal_type,
        goalValue: p.challenge.goal_value,
        pointsReward: p.challenge.points_reward,
        xpReward: p.challenge.xp_reward,
        difficultyLevel: p.challenge.difficulty_level,
        minLevelRequired: p.challenge.min_level_required,
        isActive: p.challenge.is_active,
      } : undefined,
      currentProgress: p.current_progress,
      isCompleted: p.is_completed,
      rankPosition: p.rank_position,
      joinedAt: new Date(p.joined_at),
      completedAt: p.completed_at ? new Date(p.completed_at) : undefined,
    }));
  }

  // ============================================
  // LEADERBOARD SYSTEM
  // ============================================

  async getLeaderboard(
    type: 'weekly' | 'monthly' | 'all_time' = 'weekly',
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    const pointsColumn = type === 'weekly' 
      ? 'weekly_points' 
      : type === 'monthly' 
        ? 'monthly_points' 
        : 'total_points';

    const { data } = await supabase
      .from('exercise_gamification_points')
      .select(`
        user_id,
        ${pointsColumn},
        current_level,
        profiles:user_id(full_name, avatar_url)
      `)
      .order(pointsColumn, { ascending: false })
      .limit(limit);

    return (data || []).map((entry, index) => ({
      rank: index + 1,
      userId: entry.user_id,
      userName: (entry.profiles as { full_name?: string })?.full_name || 'Usuário',
      avatarUrl: (entry.profiles as { avatar_url?: string })?.avatar_url,
      points: entry[pointsColumn] || 0,
      level: entry.current_level || 1,
      isCurrentUser: entry.user_id === this.userId,
    }));
  }

  async getMyRank(type: 'weekly' | 'monthly' | 'all_time' = 'weekly'): Promise<number> {
    const pointsColumn = type === 'weekly' 
      ? 'weekly_points' 
      : type === 'monthly' 
        ? 'monthly_points' 
        : 'total_points';

    // Buscar pontos do usuário
    const { data: myPoints } = await supabase
      .from('exercise_gamification_points')
      .select(pointsColumn)
      .eq('user_id', this.userId)
      .single();

    if (!myPoints) return 0;

    // Contar quantos usuários têm mais pontos
    const { count } = await supabase
      .from('exercise_gamification_points')
      .select('*', { count: 'exact', head: true })
      .gt(pointsColumn, myPoints[pointsColumn] || 0);

    return (count || 0) + 1;
  }

  async getMyStats(): Promise<GamificationPoints | null> {
    const { data } = await supabase
      .from('exercise_gamification_points')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (!data) return null;

    return {
      userId: data.user_id,
      totalPoints: data.total_points,
      weeklyPoints: data.weekly_points,
      monthlyPoints: data.monthly_points,
      currentLevel: data.current_level,
      currentXp: data.current_xp,
      xpToNextLevel: data.xp_to_next_level,
    };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async resetWeeklyPoints(): Promise<void> {
    await supabase
      .from('exercise_gamification_points')
      .update({ weekly_points: 0 })
      .neq('weekly_points', 0);
  }

  async resetMonthlyPoints(): Promise<void> {
    await supabase
      .from('exercise_gamification_points')
      .update({ monthly_points: 0 })
      .neq('monthly_points', 0);
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createGamificationService(userId: string): GamificationService {
  return new GamificationService(userId);
}

export default GamificationService;
