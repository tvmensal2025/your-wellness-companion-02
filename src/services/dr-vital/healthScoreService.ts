// =====================================================
// HEALTH SCORE SERVICE
// =====================================================
// Calcula e gerencia o Health Score do usuário
// =====================================================

import { supabase } from '@/integrations/supabase/client';

// Helper para tabelas não tipadas no schema
const fromTable = (table: string) => supabase.from(table as any);
import type {
  HealthScoreData,
  HealthScoreBreakdown,
  ScoreColor,
  HealthScoreRow,
} from '@/types/dr-vital-revolution';

// =====================================================
// CONSTANTS
// =====================================================

const SCORE_THRESHOLDS = {
  RED_MAX: 39,
  YELLOW_MAX: 69,
  GREEN_MIN: 70,
} as const;

const COMPONENT_MAX = 25;
const TOTAL_MAX = 100;

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Calcula a cor do score baseado no valor
 * Property 1: score < 40 → red, 40-69 → yellow, 70+ → green
 */
export function getScoreColor(score: number): ScoreColor {
  if (score < 0 || score > TOTAL_MAX) {
    throw new Error(`Score must be between 0 and ${TOTAL_MAX}`);
  }
  
  if (score <= SCORE_THRESHOLDS.RED_MAX) return 'red';
  if (score <= SCORE_THRESHOLDS.YELLOW_MAX) return 'yellow';
  return 'green';
}

/**
 * Calcula o Health Score total a partir do breakdown
 * Property 2: sum of components equals total score
 */
export function calculateHealthScore(breakdown: HealthScoreBreakdown): number {
  const { nutrition, exercise, sleep, mental } = breakdown;
  
  // Validate each component is within bounds
  const components = [nutrition, exercise, sleep, mental];
  for (const component of components) {
    if (component < 0 || component > COMPONENT_MAX) {
      throw new Error(`Each component must be between 0 and ${COMPONENT_MAX}`);
    }
  }
  
  return nutrition + exercise + sleep + mental;
}

/**
 * Valida se um breakdown é válido
 */
export function isValidBreakdown(breakdown: HealthScoreBreakdown): boolean {
  const { nutrition, exercise, sleep, mental } = breakdown;
  return (
    nutrition >= 0 && nutrition <= COMPONENT_MAX &&
    exercise >= 0 && exercise <= COMPONENT_MAX &&
    sleep >= 0 && sleep <= COMPONENT_MAX &&
    mental >= 0 && mental <= COMPONENT_MAX
  );
}

/**
 * Determina a tendência comparando com score anterior
 */
export function calculateTrend(
  currentScore: number,
  previousScore?: number
): 'up' | 'down' | 'stable' {
  if (previousScore === undefined) return 'stable';
  
  const diff = currentScore - previousScore;
  if (diff > 2) return 'up';
  if (diff < -2) return 'down';
  return 'stable';
}

// =====================================================
// DATA AGGREGATION FUNCTIONS
// =====================================================

/**
 * Calcula o score de nutrição baseado nos dados do usuário
 */
async function calculateNutritionScore(userId: string): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: foodAnalysis } = await supabase
    .from('food_analysis')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (!foodAnalysis || foodAnalysis.length === 0) return 12; // Default middle score
  
  // Use calories as proxy for health score if health_score column doesn't exist
  const avgHealthScore = foodAnalysis.reduce((sum, item: any) => 
    sum + ((item as any).health_score || 50), 0) / foodAnalysis.length;
  
  // Convert 0-100 to 0-25
  return Math.round((avgHealthScore / 100) * COMPONENT_MAX);
}

/**
 * Calcula o score de exercício baseado nos dados do usuário
 */
async function calculateExerciseScore(userId: string): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // Check workout sessions
  const { data: workouts } = await fromTable('workout_sessions')
    .select('id, duration_minutes')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString()) as any;
  
  if (!workouts || workouts.length === 0) return 5; // Low score for no exercise
  
  // Calculate based on frequency and duration
  const totalMinutes = workouts.reduce((sum: number, w: any) => sum + (w.duration_minutes || 30), 0);
  const avgMinutesPerDay = totalMinutes / 7;
  
  // WHO recommends 30 min/day moderate exercise
  // Score: 0-15 min = 0-10, 15-30 min = 10-20, 30+ min = 20-25
  if (avgMinutesPerDay >= 30) return 25;
  if (avgMinutesPerDay >= 15) return Math.round(10 + (avgMinutesPerDay - 15) * (10 / 15));
  return Math.round((avgMinutesPerDay / 15) * 10);
}

/**
 * Calcula o score de sono baseado nos dados do usuário
 */
async function calculateSleepScore(userId: string): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: sleepData } = await supabase
    .from('advanced_daily_tracking')
    .select('sleep_hours, sleep_quality')
    .eq('user_id', userId)
    .gte('tracking_date', sevenDaysAgo.toISOString().split('T')[0])
    .order('tracking_date', { ascending: false });
  
  if (!sleepData || sleepData.length === 0) return 12; // Default middle score
  
  const avgHours = sleepData.reduce((sum, d) => sum + (d.sleep_hours || 7), 0) / sleepData.length;
  const avgQuality = sleepData.reduce((sum, d) => sum + (d.sleep_quality || 50), 0) / sleepData.length;
  
  // Ideal: 7-9 hours with good quality
  let hoursScore = 0;
  if (avgHours >= 7 && avgHours <= 9) {
    hoursScore = 12.5;
  } else if (avgHours >= 6 && avgHours < 7) {
    hoursScore = 8;
  } else if (avgHours > 9 && avgHours <= 10) {
    hoursScore = 10;
  } else {
    hoursScore = 5;
  }
  
  // Quality contributes the other half
  const qualityScore = (avgQuality / 100) * 12.5;
  
  return Math.round(hoursScore + qualityScore);
}

/**
 * Calcula o score mental baseado nos dados do usuário
 */
async function calculateMentalScore(userId: string): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: trackingData } = await supabase
    .from('advanced_daily_tracking')
    .select('stress_level, energy_level')
    .eq('user_id', userId)
    .gte('tracking_date', sevenDaysAgo.toISOString().split('T')[0])
    .order('tracking_date', { ascending: false });
  
  if (!trackingData || trackingData.length === 0) return 12; // Default middle score
  
  // Stress: lower is better (1-10 scale, invert it)
  const avgStress = trackingData.reduce((sum, d) => sum + (d.stress_level || 5), 0) / trackingData.length;
  const stressScore = ((10 - avgStress) / 10) * 12.5;
  
  // Energy: higher is better (1-10 scale)
  const avgEnergy = trackingData.reduce((sum, d) => sum + (d.energy_level || 5), 0) / trackingData.length;
  const energyScore = (avgEnergy / 10) * 12.5;
  
  return Math.round(stressScore + energyScore);
}

// =====================================================
// DATABASE OPERATIONS
// =====================================================

/**
 * Busca o Health Score atual do usuário
 */
export async function getCurrentHealthScore(userId: string): Promise<HealthScoreData | null> {
  const { data, error } = await fromTable('health_scores')
    .select('*')
    .eq('user_id', userId)
    .order('calculated_at', { ascending: false })
    .limit(2) as any;
  
  if (error) {
    console.error('[HealthScoreService] Error fetching score:', error);
    throw error;
  }
  
  if (!data || data.length === 0) return null;
  
  const current = data[0] as HealthScoreRow;
  const previous = data[1] as HealthScoreRow | undefined;
  
  return {
    id: current.id,
    userId: current.user_id,
    score: current.score,
    breakdown: {
      nutrition: current.nutrition_score,
      exercise: current.exercise_score,
      sleep: current.sleep_score,
      mental: current.mental_score,
    },
    trend: calculateTrend(current.score, previous?.score),
    lastUpdated: new Date(current.calculated_at),
    previousScore: previous?.score,
  };
}

/**
 * Calcula e salva um novo Health Score
 */
export async function calculateAndSaveHealthScore(userId: string): Promise<HealthScoreData> {
  // Calculate each component
  const [nutrition, exercise, sleep, mental] = await Promise.all([
    calculateNutritionScore(userId),
    calculateExerciseScore(userId),
    calculateSleepScore(userId),
    calculateMentalScore(userId),
  ]);
  
  const breakdown: HealthScoreBreakdown = { nutrition, exercise, sleep, mental };
  const score = calculateHealthScore(breakdown);
  
  // Get previous score for trend
  const previousData = await getCurrentHealthScore(userId);
  
  // Upsert today's score
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await fromTable('health_scores')
    .upsert({
      user_id: userId,
      score,
      nutrition_score: nutrition,
      exercise_score: exercise,
      sleep_score: sleep,
      mental_score: mental,
      calculated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single() as any;
  
  if (error) {
    console.error('[HealthScoreService] Error saving score:', error);
    throw error;
  }
  
  const result = data as HealthScoreRow;
  
  return {
    id: result.id,
    userId: result.user_id,
    score: result.score,
    breakdown,
    trend: calculateTrend(score, previousData?.score),
    lastUpdated: new Date(result.calculated_at),
    previousScore: previousData?.score,
  };
}

/**
 * Busca histórico de Health Scores
 */
export async function getHealthScoreHistory(
  userId: string,
  days: number = 30
): Promise<HealthScoreData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await fromTable('health_scores')
    .select('*')
    .eq('user_id', userId)
    .gte('calculated_at', startDate.toISOString())
    .order('calculated_at', { ascending: true }) as any;
  
  if (error) {
    console.error('[HealthScoreService] Error fetching history:', error);
    throw error;
  }
  
  if (!data || data.length === 0) return [];
  
  return (data as HealthScoreRow[]).map((row, index, arr) => ({
    id: row.id,
    userId: row.user_id,
    score: row.score,
    breakdown: {
      nutrition: row.nutrition_score,
      exercise: row.exercise_score,
      sleep: row.sleep_score,
      mental: row.mental_score,
    },
    trend: calculateTrend(row.score, arr[index - 1]?.score),
    lastUpdated: new Date(row.calculated_at),
    previousScore: arr[index - 1]?.score,
  }));
}

/**
 * Busca o breakdown detalhado do score
 */
export async function getScoreBreakdown(userId: string): Promise<{
  breakdown: HealthScoreBreakdown;
  details: {
    nutrition: { value: number; description: string; tips: string[] };
    exercise: { value: number; description: string; tips: string[] };
    sleep: { value: number; description: string; tips: string[] };
    mental: { value: number; description: string; tips: string[] };
  };
}> {
  const currentScore = await getCurrentHealthScore(userId);
  
  if (!currentScore) {
    // Calculate fresh if no score exists
    const newScore = await calculateAndSaveHealthScore(userId);
    return generateBreakdownDetails(newScore.breakdown);
  }
  
  return generateBreakdownDetails(currentScore.breakdown);
}

function generateBreakdownDetails(breakdown: HealthScoreBreakdown) {
  const getDescription = (value: number, max: number): string => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Bom';
    if (percentage >= 40) return 'Regular';
    return 'Precisa melhorar';
  };
  
  const getTips = (category: keyof HealthScoreBreakdown, value: number): string[] => {
    const tips: Record<keyof HealthScoreBreakdown, string[]> = {
      nutrition: [
        'Registre suas refeições diariamente',
        'Aumente o consumo de vegetais',
        'Reduza alimentos ultraprocessados',
      ],
      exercise: [
        'Faça pelo menos 30 min de exercício por dia',
        'Varie entre cardio e musculação',
        'Não fique mais de 2 dias sem se exercitar',
      ],
      sleep: [
        'Durma entre 7-9 horas por noite',
        'Mantenha horários regulares',
        'Evite telas antes de dormir',
      ],
      mental: [
        'Pratique técnicas de relaxamento',
        'Reserve tempo para hobbies',
        'Mantenha conexões sociais',
      ],
    };
    
    // Return tips if score is below 20
    return value < 20 ? tips[category] : [];
  };
  
  return {
    breakdown,
    details: {
      nutrition: {
        value: breakdown.nutrition,
        description: getDescription(breakdown.nutrition, COMPONENT_MAX),
        tips: getTips('nutrition', breakdown.nutrition),
      },
      exercise: {
        value: breakdown.exercise,
        description: getDescription(breakdown.exercise, COMPONENT_MAX),
        tips: getTips('exercise', breakdown.exercise),
      },
      sleep: {
        value: breakdown.sleep,
        description: getDescription(breakdown.sleep, COMPONENT_MAX),
        tips: getTips('sleep', breakdown.sleep),
      },
      mental: {
        value: breakdown.mental,
        description: getDescription(breakdown.mental, COMPONENT_MAX),
        tips: getTips('mental', breakdown.mental),
      },
    },
  };
}

// =====================================================
// EXPORTS
// =====================================================

export const healthScoreService = {
  getScoreColor,
  calculateHealthScore,
  isValidBreakdown,
  calculateTrend,
  getCurrentHealthScore,
  calculateAndSaveHealthScore,
  getHealthScoreHistory,
  getScoreBreakdown,
};

export default healthScoreService;
