// =====================================================
// ACHIEVEMENT SERVICE
// =====================================================
// Sistema de conquistas e badges
// Property 13: Achievement Unlock Persistence
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type { 
  Achievement, 
  AchievementCategory,
  HealthAchievementRow,
} from '@/types/dr-vital-revolution';

// =====================================================
// ACHIEVEMENT DEFINITIONS
// =====================================================

interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  criteria: (stats: UserStats) => boolean;
  reward?: {
    type: 'xp' | 'avatar_item' | 'badge';
    value: string | number;
  };
}

interface UserStats {
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  missionsCompleted: number;
  bossBattlesWon: number;
  daysActive: number;
  mealsLogged: number;
  workoutsCompleted: number;
  weightLost: number;
  examsAnalyzed: number;
  healthScoreAvg: number;
}

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Consistency achievements
  {
    key: 'first_mission',
    name: 'Primeira Missão',
    description: 'Complete sua primeira missão de saúde',
    icon: 'star',
    category: 'consistency',
    criteria: (stats) => stats.missionsCompleted >= 1,
  },
  {
    key: 'streak_7',
    name: 'Semana Perfeita',
    description: 'Mantenha um streak de 7 dias',
    icon: 'flame',
    category: 'consistency',
    criteria: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7,
    reward: { type: 'avatar_item', value: 'flame_badge' },
  },
  {
    key: 'streak_30',
    name: 'Mês de Ouro',
    description: 'Mantenha um streak de 30 dias',
    icon: 'crown',
    category: 'consistency',
    criteria: (stats) => stats.currentStreak >= 30 || stats.longestStreak >= 30,
    reward: { type: 'avatar_item', value: 'gold_crown' },
  },
  {
    key: 'streak_100',
    name: 'Centenário',
    description: 'Mantenha um streak de 100 dias',
    icon: 'trophy',
    category: 'consistency',
    criteria: (stats) => stats.currentStreak >= 100 || stats.longestStreak >= 100,
    reward: { type: 'avatar_item', value: 'legendary_cape' },
  },

  // Nutrition achievements
  {
    key: 'first_meal',
    name: 'Primeira Refeição',
    description: 'Registre sua primeira refeição',
    icon: 'utensils',
    category: 'nutrition',
    criteria: (stats) => stats.mealsLogged >= 1,
  },
  {
    key: 'meals_50',
    name: 'Chef Iniciante',
    description: 'Registre 50 refeições',
    icon: 'chef-hat',
    category: 'nutrition',
    criteria: (stats) => stats.mealsLogged >= 50,
  },
  {
    key: 'meals_200',
    name: 'Mestre da Nutrição',
    description: 'Registre 200 refeições',
    icon: 'award',
    category: 'nutrition',
    criteria: (stats) => stats.mealsLogged >= 200,
    reward: { type: 'avatar_item', value: 'chef_outfit' },
  },

  // Exercise achievements
  {
    key: 'first_workout',
    name: 'Primeiro Treino',
    description: 'Complete seu primeiro treino',
    icon: 'dumbbell',
    category: 'exercise',
    criteria: (stats) => stats.workoutsCompleted >= 1,
  },
  {
    key: 'workouts_20',
    name: 'Atleta Dedicado',
    description: 'Complete 20 treinos',
    icon: 'medal',
    category: 'exercise',
    criteria: (stats) => stats.workoutsCompleted >= 20,
  },
  {
    key: 'workouts_100',
    name: 'Máquina de Treino',
    description: 'Complete 100 treinos',
    icon: 'zap',
    category: 'exercise',
    criteria: (stats) => stats.workoutsCompleted >= 100,
    reward: { type: 'avatar_item', value: 'athlete_outfit' },
  },

  // Milestone achievements
  {
    key: 'level_5',
    name: 'Guerreiro da Saúde',
    description: 'Alcance o nível 5',
    icon: 'shield',
    category: 'milestones',
    criteria: (stats) => stats.currentLevel >= 5,
    reward: { type: 'avatar_item', value: 'warrior_shield' },
  },
  {
    key: 'level_10',
    name: 'Lenda da Saúde',
    description: 'Alcance o nível 10',
    icon: 'crown',
    category: 'milestones',
    criteria: (stats) => stats.currentLevel >= 10,
    reward: { type: 'avatar_item', value: 'legendary_armor' },
  },
  {
    key: 'boss_battle_1',
    name: 'Primeiro Boss',
    description: 'Derrote seu primeiro Boss Battle',
    icon: 'sword',
    category: 'milestones',
    criteria: (stats) => stats.bossBattlesWon >= 1,
  },
  {
    key: 'boss_battle_5',
    name: 'Caçador de Bosses',
    description: 'Derrote 5 Boss Battles',
    icon: 'target',
    category: 'milestones',
    criteria: (stats) => stats.bossBattlesWon >= 5,
    reward: { type: 'avatar_item', value: 'hunter_bow' },
  },
  {
    key: 'health_score_80',
    name: 'Saúde Exemplar',
    description: 'Alcance um Health Score médio de 80+',
    icon: 'heart',
    category: 'milestones',
    criteria: (stats) => stats.healthScoreAvg >= 80,
    reward: { type: 'avatar_item', value: 'golden_heart' },
  },
  {
    key: 'xp_10000',
    name: 'Veterano',
    description: 'Acumule 10.000 XP',
    icon: 'star',
    category: 'milestones',
    criteria: (stats) => stats.totalXp >= 10000,
  },
];

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Verifica e desbloqueia conquistas elegíveis
 * Property 13: Achievement SHALL be persisted with unique (user_id, achievement_key)
 */
export async function checkAndUnlockAchievements(
  userId: string
): Promise<Achievement[]> {
  // Get user stats
  const stats = await getUserStats(userId);
  
  // Get already unlocked achievements
  const { data: unlockedData } = await supabase
    .from('health_achievements')
    .select('achievement_key')
    .eq('user_id', userId);
  
  const unlockedKeys = new Set((unlockedData || []).map(a => a.achievement_key));
  
  // Check each achievement
  const newlyUnlocked: Achievement[] = [];
  
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedKeys.has(def.key)) continue;
    
    if (def.criteria(stats)) {
      // Unlock achievement
      const { data, error } = await supabase
        .from('health_achievements')
        .insert({
          user_id: userId,
          achievement_key: def.key,
          name: def.name,
          description: def.description,
          icon: def.icon,
          category: def.category,
        })
        .select()
        .single();
      
      if (!error && data) {
        const achievement = rowToAchievement(data as HealthAchievementRow, def);
        newlyUnlocked.push(achievement);
        
        // If achievement has avatar item reward, unlock it
        if (def.reward?.type === 'avatar_item') {
          await unlockAvatarItem(userId, def.reward.value as string);
        }
        
        // Create timeline event
        await supabase.rpc('create_timeline_event', {
          p_user_id: userId,
          p_event_type: 'achievement',
          p_title: `Conquista Desbloqueada: ${def.name}`,
          p_description: def.description,
          p_is_milestone: true,
          p_metadata: { achievement_key: def.key, reward: def.reward },
        });
      }
    }
  }
  
  return newlyUnlocked;
}

/**
 * Busca todas as conquistas do usuário (desbloqueadas e bloqueadas)
 */
export async function getAllAchievements(userId: string): Promise<Achievement[]> {
  const { data: unlockedData } = await supabase
    .from('health_achievements')
    .select('*')
    .eq('user_id', userId);
  
  const unlockedMap = new Map(
    (unlockedData || []).map(a => [a.achievement_key, a as HealthAchievementRow])
  );
  
  return ACHIEVEMENT_DEFINITIONS.map(def => {
    const unlocked = unlockedMap.get(def.key);
    if (unlocked) {
      return rowToAchievement(unlocked, def);
    }
    return {
      id: def.key,
      achievementKey: def.key,
      name: def.name,
      description: def.description,
      icon: def.icon,
      category: def.category,
      isUnlocked: false,
      reward: def.reward,
    };
  });
}

/**
 * Busca apenas conquistas desbloqueadas
 */
export async function getUnlockedAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('health_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
  
  if (error) throw error;
  
  return (data as HealthAchievementRow[]).map(row => {
    const def = ACHIEVEMENT_DEFINITIONS.find(d => d.key === row.achievement_key);
    return rowToAchievement(row, def);
  });
}

/**
 * Busca conquistas por categoria
 */
export async function getAchievementsByCategory(
  userId: string,
  category: AchievementCategory
): Promise<Achievement[]> {
  const all = await getAllAchievements(userId);
  return all.filter(a => a.category === category);
}

/**
 * Verifica se uma conquista específica está desbloqueada
 */
export async function isAchievementUnlocked(
  userId: string,
  achievementKey: string
): Promise<boolean> {
  const { data } = await supabase
    .from('health_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_key', achievementKey)
    .single();
  
  return !!data;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getUserStats(userId: string): Promise<UserStats> {
  // Fetch all relevant data in parallel
  const [
    streakData,
    missionsData,
    bossBattlesData,
    mealsData,
    workoutsData,
    healthScoresData,
  ] = await Promise.all([
    supabase.from('health_streaks').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('health_missions').select('id').eq('user_id', userId).eq('is_completed', true),
    supabase.from('health_missions').select('id').eq('user_id', userId).eq('type', 'boss_battle').eq('is_completed', true),
    supabase.from('food_analysis').select('id').eq('user_id', userId),
    supabase.from('workout_sessions').select('id').eq('user_id', userId),
    supabase.from('health_scores').select('score').eq('user_id', userId).order('calculated_at', { ascending: false }).limit(30),
  ]);

  const streak = streakData.data;
  const avgHealthScore = healthScoresData.data && healthScoresData.data.length > 0
    ? healthScoresData.data.reduce((sum, s) => sum + s.score, 0) / healthScoresData.data.length
    : 0;

  return {
    totalXp: streak?.total_xp_earned || 0,
    currentLevel: streak?.current_level || 1,
    currentStreak: streak?.current_streak || 0,
    longestStreak: streak?.longest_streak || 0,
    missionsCompleted: missionsData.data?.length || 0,
    bossBattlesWon: bossBattlesData.data?.length || 0,
    daysActive: 0, // Would need to calculate from activity logs
    mealsLogged: mealsData.data?.length || 0,
    workoutsCompleted: workoutsData.data?.length || 0,
    weightLost: 0, // Would need to calculate from weight history
    examsAnalyzed: 0, // Would need to count from medical_exams
    healthScoreAvg: Math.round(avgHealthScore),
  };
}

async function unlockAvatarItem(userId: string, itemId: string): Promise<void> {
  // Get current unlocked items
  const { data: avatar } = await supabase
    .from('avatar_customizations')
    .select('unlocked_items')
    .eq('user_id', userId)
    .single();

  const currentItems: string[] = avatar?.unlocked_items || ['default'];
  
  if (!currentItems.includes(itemId)) {
    const updatedItems = [...currentItems, itemId];
    
    await supabase
      .from('avatar_customizations')
      .upsert({
        user_id: userId,
        unlocked_items: updatedItems,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
  }
}

function rowToAchievement(
  row: HealthAchievementRow,
  def?: AchievementDefinition
): Achievement {
  return {
    id: row.id,
    achievementKey: row.achievement_key,
    name: row.name,
    description: row.description || '',
    icon: row.icon || 'star',
    category: row.category,
    unlockedAt: new Date(row.unlocked_at),
    isUnlocked: true,
    reward: def?.reward,
  };
}

// =====================================================
// EXPORTS
// =====================================================

// Alias functions for hook compatibility
export const getUserAchievements = getUnlockedAchievements;
export const getAvailableAchievements = async (): Promise<Achievement[]> => {
  return ACHIEVEMENT_DEFINITIONS.map(def => ({
    id: def.key,
    achievementKey: def.key,
    name: def.name,
    description: def.description,
    icon: def.icon,
    category: def.category,
    isUnlocked: false,
    reward: def.reward,
  }));
};

export const achievementService = {
  checkAndUnlockAchievements,
  getAllAchievements,
  getUnlockedAchievements,
  getAchievementsByCategory,
  isAchievementUnlocked,
  getUserAchievements,
  getAvailableAchievements,
  ACHIEVEMENT_DEFINITIONS,
};

export default achievementService;
