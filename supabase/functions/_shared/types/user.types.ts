/**
 * Shared user-related types for edge functions
 */

export interface UserProfile {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  height?: number;
  city?: string;
  state?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPhysicalData {
  id: string;
  user_id: string;
  altura_cm?: number;
  peso_atual_kg?: number;
  data_nascimento?: string;
  sexo?: string;
  tipo_sanguineo?: string;
}

export interface UserNutritionGoals {
  id: string;
  user_id: string;
  target_calories?: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fats_g?: number;
  target_fiber_g?: number;
  target_water_ml?: number;
  goal_type?: string;
  status?: string;
}

export interface UserAnamnese {
  id: string;
  user_id: string;
  current_weight?: number;
  height_cm?: number;
  activity_level?: string;
  health_conditions?: string[];
  dietary_restrictions?: string[];
  goals?: string[];
  medications?: string[];
  allergies?: string[];
}

export interface UserContext {
  profile: UserProfile | null;
  physicalData: UserPhysicalData | null;
  nutritionGoals: UserNutritionGoals | null;
  anamnese: UserAnamnese | null;
}

/**
 * Check if user has a specific role
 */
export interface UserRole {
  user_id: string;
  role: "user" | "admin" | "nutritionist" | "premium";
}
