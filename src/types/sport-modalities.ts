// ============================================
// TIPOS TYPESCRIPT - MODALIDADES ESPORTIVAS
// ============================================

export type SportModality = 
  | 'running' 
  | 'cycling' 
  | 'swimming' 
  | 'functional' 
  | 'yoga' 
  | 'martial_arts' 
  | 'trail' 
  | 'team_sports' 
  | 'racquet_sports';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export type TrainingPlanStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export type ChallengeType = 'distance' | 'duration' | 'count' | 'streak';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type WorkoutMood = 'great' | 'good' | 'ok' | 'tired' | 'bad';

export type LocationType = 'outdoor' | 'indoor' | 'track' | 'trail';

// ============================================
// INTERFACES
// ============================================

export interface UserSportModality {
  id: string;
  user_id: string;
  modality: SportModality;
  level: ExperienceLevel;
  goal?: string;
  target_event?: string;
  start_date: string;
  target_date?: string;
  is_active: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkoutDefinition {
  day: string;
  week_day?: number;
  workout_type: string;
  name: string;
  description: string;
  structure: string;
  duration_minutes: number;
  distance_km?: number;
  intensity: string;
  instructions: string[];
  warm_up?: string;
  cool_down?: string;
  notes?: string;
}

export interface WeekPlan {
  week: number;
  title: string;
  focus: string;
  workouts: WorkoutDefinition[];
  weekly_goal?: string;
  tips?: string[];
}

export interface SportTrainingPlan {
  id: string;
  user_id: string;
  modality_id?: string;
  plan_name: string;
  plan_type: string;
  duration_weeks: number;
  workouts_per_week: number;
  current_week: number;
  current_day: number;
  status: TrainingPlanStatus;
  plan_data: {
    weeks: WeekPlan[];
    description?: string;
    prerequisites?: string[];
    goals?: string[];
  };
  total_workouts: number;
  completed_workouts: number;
  completion_percentage: number;
  total_distance_km: number;
  total_duration_minutes: number;
  total_calories_burned: number;
  started_at: string;
  completed_at?: string;
  last_workout_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SportWorkoutLog {
  id: string;
  user_id: string;
  training_plan_id?: string;
  modality: SportModality;
  workout_type: string;
  workout_name?: string;
  distance_km?: number;
  duration_minutes?: number;
  calories_burned?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_pace?: string;
  avg_speed_kmh?: number;
  avg_power_watts?: number;
  normalized_power?: number;
  intensity_factor?: number;
  elevation_gain_m?: number;
  elevation_loss_m?: number;
  perceived_effort?: number;
  mood?: WorkoutMood;
  notes?: string;
  external_source?: string;
  external_id?: string;
  external_data?: Record<string, any>;
  location_type?: LocationType;
  weather_conditions?: string;
  completed_at: string;
  created_at: string;
}

export interface SportChallenge {
  id: string;
  name: string;
  description?: string;
  modality: SportModality;
  challenge_type: ChallengeType;
  goal_value: number;
  goal_unit: string;
  start_date: string;
  end_date: string;
  visibility: 'public' | 'friends' | 'private';
  badge_icon?: string;
  badge_name?: string;
  points_reward: number;
  participants_count: number;
  completions_count: number;
  created_by?: string;
  is_official: boolean;
  created_at: string;
}

export interface SportChallengeParticipation {
  id: string;
  challenge_id: string;
  user_id: string;
  current_progress: number;
  goal_progress_percentage: number;
  status: 'active' | 'completed' | 'abandoned';
  completed_at?: string;
  rank?: number;
  joined_at: string;
  last_updated_at: string;
  challenge?: SportChallenge; // Para joins
}

export interface SportAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  achievement_description?: string;
  modality?: SportModality;
  badge_icon: string;
  badge_color: string;
  achievement_data?: Record<string, any>;
  rarity: AchievementRarity;
  earned_at: string;
}

// ============================================
// TIPOS DE MODALIDADES COM METADADOS
// ============================================

export interface ModalityInfo {
  id: SportModality;
  name: string;
  icon: string;
  color: string;
  description: string;
  popular_goals: string[];
  workout_types: string[];
  metrics: string[];
  equipment?: string[];
}

export const MODALITY_INFO: Record<SportModality, ModalityInfo> = {
  running: {
    id: 'running',
    name: 'Corrida',
    icon: '🏃',
    color: '#ef4444',
    description: 'Corrida de rua, pista ou esteira',
    popular_goals: ['5K', '10K', 'Meia Maratona', 'Maratona', 'Ultra'],
    workout_types: ['easy_run', 'intervals', 'tempo_run', 'long_run', 'fartlek', 'hill_repeats'],
    metrics: ['distance', 'pace', 'heart_rate', 'cadence', 'elevation'],
    equipment: ['Tênis de corrida', 'Relógio GPS', 'Monitor cardíaco']
  },
  cycling: {
    id: 'cycling',
    name: 'Ciclismo',
    icon: '🚴',
    color: '#3b82f6',
    description: 'Ciclismo de estrada, montanha ou indoor',
    popular_goals: ['50km', '100km', 'Century Ride', 'Gran Fondo'],
    workout_types: ['endurance', 'sweet_spot', 'intervals', 'climbing', 'recovery'],
    metrics: ['distance', 'speed', 'power', 'heart_rate', 'elevation', 'cadence'],
    equipment: ['Bicicleta', 'Ciclocomputador', 'Medidor de potência']
  },
  swimming: {
    id: 'swimming',
    name: 'Natação',
    icon: '🏊',
    color: '#06b6d4',
    description: 'Natação em piscina ou águas abertas',
    popular_goals: ['1km', '5km', 'Águas Abertas', 'Triatlo'],
    workout_types: ['technique', 'endurance', 'intervals', 'open_water'],
    metrics: ['distance', 'pace', 'stroke_rate', 'SWOLF'],
    equipment: ['Óculos', 'Touca', 'Relógio aquático']
  },
  functional: {
    id: 'functional',
    name: 'Funcional/CrossFit',
    icon: '🏋️',
    color: '#f59e0b',
    description: 'Treinamento funcional e CrossFit',
    popular_goals: ['Força', 'Condicionamento', 'Competição'],
    workout_types: ['metcon', 'strength', 'gymnastics', 'wod'],
    metrics: ['reps', 'weight', 'time', 'rounds'],
    equipment: ['Barra', 'Anilhas', 'Kettlebell', 'Box']
  },
  yoga: {
    id: 'yoga',
    name: 'Yoga',
    icon: '🧘',
    color: '#8b5cf6',
    description: 'Yoga e meditação',
    popular_goals: ['Flexibilidade', 'Equilíbrio', 'Mindfulness'],
    workout_types: ['hatha', 'vinyasa', 'ashtanga', 'yin', 'restorative'],
    metrics: ['duration', 'poses', 'breath_work'],
    equipment: ['Tapete', 'Blocos', 'Cinto']
  },
  martial_arts: {
    id: 'martial_arts',
    name: 'Artes Marciais',
    icon: '🥊',
    color: '#dc2626',
    description: 'Boxe, Muay Thai, Jiu-Jitsu, MMA',
    popular_goals: ['Técnica', 'Condicionamento', 'Competição'],
    workout_types: ['technique', 'sparring', 'conditioning', 'bag_work'],
    metrics: ['rounds', 'strikes', 'heart_rate'],
    equipment: ['Luvas', 'Protetor bucal', 'Kimono']
  },
  trail: {
    id: 'trail',
    name: 'Trilha',
    icon: '⛰️',
    color: '#059669',
    description: 'Hiking, trekking e trail running',
    popular_goals: ['Trilhas Locais', 'Multi-dias', 'Ultra Trail'],
    workout_types: ['hiking', 'trail_running', 'vertical', 'ultra'],
    metrics: ['distance', 'elevation', 'time', 'terrain'],
    equipment: ['Mochila', 'Bastões', 'GPS']
  },
  team_sports: {
    id: 'team_sports',
    name: 'Esportes Coletivos',
    icon: '⚽',
    color: '#10b981',
    description: 'Futebol, vôlei, basquete, etc',
    popular_goals: ['Condicionamento', 'Técnica', 'Competição'],
    workout_types: ['practice', 'game', 'drills', 'conditioning'],
    metrics: ['duration', 'intensity', 'skills'],
    equipment: ['Bola', 'Chuteira', 'Equipamento específico']
  },
  racquet_sports: {
    id: 'racquet_sports',
    name: 'Esportes de Raquete',
    icon: '🎾',
    color: '#eab308',
    description: 'Tênis, badminton, squash',
    popular_goals: ['Técnica', 'Competição', 'Condicionamento'],
    workout_types: ['practice', 'match', 'drills', 'conditioning'],
    metrics: ['duration', 'points', 'rallies'],
    equipment: ['Raquete', 'Bola', 'Tênis específico']
  }
};

// ============================================
// TIPOS PARA FORMULÁRIOS E UI
// ============================================

export interface WorkoutPlanFormData {
  modality: SportModality;
  level: ExperienceLevel;
  goal?: string;
  target_event?: string;
  days_per_week: number;
  duration_minutes_per_session: number;
  location_preference?: 'indoor' | 'outdoor' | 'both';
  available_equipment?: string[];
  preferred_exercises?: string[];
  restricted_exercises?: string[];
  target_date?: string;
}

export interface WorkoutPlanGeneratorParams {
  modality: SportModality;
  level: ExperienceLevel;
  goal: string;
  duration_weeks: number;
  workouts_per_week: number;
  duration_minutes: number;
  user_preferences?: Record<string, any>;
}

// ============================================
// ESTATÍSTICAS E ANALYTICS
// ============================================

export interface UserSportStatistics {
  user_id: string;
  modality: SportModality;
  total_workouts: number;
  total_distance_km: number;
  total_duration_minutes: number;
  total_calories_burned: number;
  avg_effort: number;
  last_workout_date: string;
  days_since_last_workout: number;
  current_streak?: number;
  longest_streak?: number;
  personal_records?: Record<string, any>;
}

export interface ChallengeLeaderboard {
  challenge_id: string;
  user_id: string;
  current_progress: number;
  goal_progress_percentage: number;
  status: string;
  rank: number;
  user_name?: string;
  avatar_url?: string;
}


