// =====================================================
// TIPOS DO SISTEMA DE DESAFIOS V2
// =====================================================

// Enums
export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';
export type PowerupType = 'shield' | 'time_extend' | 'xp_boost' | 'skip_day' | 'combo_freeze';
export type DuelStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
export type ChallengeMode = 'individual' | 'flash' | 'journey' | 'team' | 'duel' | 'event';
export type ChallengeDisplayMode = 'normal' | 'featured' | 'flash';

// =====================================================
// JORNADAS ÉPICAS
// =====================================================
export interface JourneyCheckpoint {
  day: number;
  name: string;
  xp: number;
  is_boss: boolean;
  boss_target?: number; // Meta especial para boss
  completed?: boolean;
}

export interface ChallengeJourney {
  id: string;
  challenge_id: string;
  total_checkpoints: number;
  boss_days: number[];
  journey_map: JourneyCheckpoint[];
  story_intro?: string;
  story_completion?: string;
  theme: 'adventure' | 'space' | 'ocean' | 'forest' | 'mountain';
  created_at: string;
}

// =====================================================
// SISTEMA DE LIGAS
// =====================================================
export interface UserLeague {
  id: string;
  user_id: string;
  current_league: LeagueTier;
  weekly_xp: number;
  rank_position?: number;
  highest_league: LeagueTier;
  weeks_in_current_league: number;
  total_promotions: number;
  total_demotions: number;
  week_start: string;
}

export interface LeagueRanking {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  level: number;
  weekly_xp: number;
  rank_position: number;
  is_current_user?: boolean;
}

export const LEAGUE_CONFIG: Record<LeagueTier, {
  name: string;
  emoji: string;
  color: string;
  minXpToPromote: number;
  maxXpToDemote: number;
}> = {
  bronze: { name: 'Bronze', emoji: '🥉', color: '#CD7F32', minXpToPromote: 500, maxXpToDemote: 0 },
  silver: { name: 'Prata', emoji: '🥈', color: '#C0C0C0', minXpToPromote: 1000, maxXpToDemote: 200 },
  gold: { name: 'Ouro', emoji: '🥇', color: '#FFD700', minXpToPromote: 2000, maxXpToDemote: 500 },
  diamond: { name: 'Diamante', emoji: '💎', color: '#00CED1', minXpToPromote: 5000, maxXpToDemote: 1000 },
  master: { name: 'Mestre', emoji: '👑', color: '#9400D3', minXpToPromote: Infinity, maxXpToDemote: 2500 },
};

// =====================================================
// DUELOS 1V1
// =====================================================
export interface ChallengeDuel {
  id: string;
  challenger_id: string;
  opponent_id: string;
  challenge_type: string;
  target_value: number;
  unit: string;
  challenger_progress: number;
  opponent_progress: number;
  status: DuelStatus;
  winner_id?: string;
  xp_reward: number;
  badge_reward?: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  
  // Joined data
  challenger?: {
    full_name: string;
    avatar_url?: string;
  };
  opponent?: {
    full_name: string;
    avatar_url?: string;
  };
}

// =====================================================
// TIMES/CLÃS
// =====================================================
export interface ChallengeTeam {
  id: string;
  name: string;
  description?: string;
  avatar_emoji: string;
  color: string;
  leader_id: string;
  max_members: number;
  is_public: boolean;
  invite_code?: string;
  total_xp: number;
  challenges_completed: number;
  current_rank?: number;
  created_at: string;
  
  // Joined data
  members?: TeamMember[];
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'co-leader' | 'member';
  contribution_xp: number;
  joined_at: string;
  
  // Joined data
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface TeamChallenge {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  challenge_type: string;
  target_value: number;
  current_progress: number;
  unit: string;
  total_xp_reward: number;
  starts_at: string;
  ends_at: string;
  is_completed: boolean;
  completed_at?: string;
  
  // Joined data
  contributions?: TeamChallengeContribution[];
}

export interface TeamChallengeContribution {
  user_id: string;
  contribution_value: number;
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

// =====================================================
// POWER-UPS
// =====================================================
export interface UserPowerup {
  id: string;
  user_id: string;
  powerup_type: PowerupType;
  quantity: number;
  acquired_at: string;
  expires_at?: string;
}

export const POWERUP_CONFIG: Record<PowerupType, {
  name: string;
  description: string;
  emoji: string;
  color: string;
  cost_coins?: number;
}> = {
  shield: {
    name: 'Escudo',
    description: 'Protege seu streak por 1 dia',
    emoji: '🛡️',
    color: 'from-yellow-500 to-orange-500',
    cost_coins: 100,
  },
  time_extend: {
    name: '+2 Horas',
    description: 'Estende o prazo do desafio',
    emoji: '⏰',
    color: 'from-purple-500 to-pink-500',
    cost_coins: 75,
  },
  xp_boost: {
    name: '2x XP',
    description: 'Dobra o XP do próximo desafio',
    emoji: '✨',
    color: 'from-blue-500 to-cyan-500',
    cost_coins: 150,
  },
  skip_day: {
    name: 'Pular Dia',
    description: 'Pula 1 dia sem perder progresso',
    emoji: '⏭️',
    color: 'from-green-500 to-emerald-500',
    cost_coins: 200,
  },
  combo_freeze: {
    name: 'Congelar Combo',
    description: 'Mantém o multiplicador por 24h',
    emoji: '❄️',
    color: 'from-cyan-500 to-blue-500',
    cost_coins: 125,
  },
};

// =====================================================
// EVENTOS SAZONAIS
// =====================================================
export interface SeasonalEvent {
  id: string;
  name: string;
  description?: string;
  theme: string;
  banner_url?: string;
  primary_color: string;
  secondary_color: string;
  emoji: string;
  starts_at: string;
  ends_at: string;
  exclusive_rewards: EventReward[];
  total_challenges: number;
  is_active: boolean;
  created_at: string;
}

export interface EventReward {
  type: 'badge' | 'powerup' | 'xp' | 'title';
  name: string;
  icon?: string;
  value?: number;
}

export interface EventParticipation {
  id: string;
  event_id: string;
  user_id: string;
  challenges_completed: number;
  event_xp: number;
  rewards_claimed: string[];
  joined_at: string;
}

// =====================================================
// DESAFIOS RELÂMPAGO
// =====================================================
export interface FlashChallenge {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  challenge_type: string;
  target_value: number;
  unit: string;
  xp_reward: number;
  bonus_multiplier: number;
  duration_hours: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
  
  // Computed
  time_remaining?: string;
  participants_count?: number;
}

export interface FlashChallengeParticipation {
  id: string;
  flash_challenge_id: string;
  user_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string;
  joined_at: string;
}

// =====================================================
// CONQUISTAS V2
// =====================================================
export interface UserAchievementV2 {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description?: string;
  icon?: string;
  related_challenge_id?: string;
  related_duel_id?: string;
  related_event_id?: string;
  xp_earned: number;
  achieved_at: string;
}

// =====================================================
// DESAFIO INDIVIDUAL EXPANDIDO
// =====================================================
export interface IndividualChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string; // Coluna real do banco (não usar 'category')
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme' | 'facil' | 'medio' | 'dificil';
  challenge_mode?: ChallengeMode;
  
  // Display mode (onde aparece)
  display_mode?: ChallengeDisplayMode; // 'normal' | 'featured' | 'flash'
  display_priority?: number;
  featured_until?: string;
  
  // Metas
  target_value?: number;
  duration_days?: number;
  daily_log_target?: number;
  daily_log_unit?: string;
  
  // Recompensas
  xp_reward?: number;
  points_reward?: number;
  badge_icon?: string;
  badge_name?: string;
  
  // Combo
  combo_enabled?: boolean;
  max_combo_multiplier?: number;
  
  // Jornada (se aplicável)
  journey_id?: string;
  journey?: ChallengeJourney;
  
  // Evento (se aplicável)
  event_id?: string;
  
  is_active: boolean;
  is_featured?: boolean;
  is_group_challenge?: boolean;
  team_only?: boolean;
  
  created_at: string;
}

export interface IndividualParticipation {
  id: string;
  user_id: string;
  challenge_id: string;
  
  // Progresso
  progress: number;
  target_value?: number;
  current_streak?: number;
  best_streak?: number;
  
  // Combo
  combo_multiplier?: number;
  combo_days?: number;
  
  // Jornada
  journey_checkpoint?: number;
  boss_defeated?: boolean;
  
  // Power-ups usados
  powerups_used?: string[];
  
  // Status
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
  
  // Joined data - Supabase retorna 'challenges' mas mapeamos para 'challenge'
  challenge?: IndividualChallenge;
  challenges?: IndividualChallenge; // Alias do Supabase (não usar diretamente)
}

// =====================================================
// HELPERS E UTILS
// =====================================================
export const DIFFICULTY_CONFIG = {
  easy: { label: 'Fácil', color: 'bg-green-500', emoji: '⭐' },
  medium: { label: 'Médio', color: 'bg-yellow-500', emoji: '🎯' },
  hard: { label: 'Difícil', color: 'bg-orange-500', emoji: '🔥' },
  extreme: { label: 'Extremo', color: 'bg-red-500', emoji: '💀' },
} as const;

export const DISPLAY_MODE_CONFIG: Record<ChallengeDisplayMode, {
  label: string;
  description: string;
  emoji: string;
}> = {
  normal: { 
    label: 'Normal', 
    description: 'Aparece na aba de desafios',
    emoji: '📋'
  },
  featured: { 
    label: 'Destaque', 
    description: 'Aparece no popup/sino de alertas',
    emoji: '🔔'
  },
  flash: { 
    label: 'Relâmpago', 
    description: 'Desafio urgente com timer',
    emoji: '⚡'
  },
};

export const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  exercicio: { label: 'Exercício', emoji: '🏃', color: 'from-orange-500 to-red-500' },
  nutricao: { label: 'Nutrição', emoji: '🥗', color: 'from-green-500 to-emerald-500' },
  hidratacao: { label: 'Hidratação', emoji: '💧', color: 'from-blue-500 to-cyan-500' },
  sono: { label: 'Sono', emoji: '😴', color: 'from-indigo-500 to-purple-500' },
  mindfulness: { label: 'Mindfulness', emoji: '🧘', color: 'from-purple-500 to-pink-500' },
  jejum: { label: 'Jejum', emoji: '⏰', color: 'from-amber-500 to-orange-500' },
  medicao: { label: 'Medição', emoji: '📏', color: 'from-teal-500 to-cyan-500' },
  passos: { label: 'Passos', emoji: '👟', color: 'from-lime-500 to-green-500' },
};

// Função para calcular tempo restante
export function calculateTimeRemaining(endDate: string): string {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const diff = end - now;
  
  if (diff <= 0) return 'Expirado';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}min`;
}

// Função para calcular progresso percentual
export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
