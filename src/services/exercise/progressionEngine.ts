// ============================================
// 📈 PROGRESSION ENGINE SERVICE
// Sistema de progressão adaptativa e análise de performance
// ============================================

import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';
import type {
  PerformanceMetric,
  MuscleBalance,
} from '@/types/advanced-exercise-system';

// Local types for untyped exports
interface ProgressionPlan {
  exerciseCode: string;
  currentLevel: number;
  nextTargets: any;
  recommendations: string[];
}

interface MuscleGroupProgress {
  muscleGroup: string;
  weeklyVolume: number;
  trend: string;
}

interface PlateauDetection {
  isPlateaued: boolean;
  duration: number;
  suggestions: string[];
}

interface RecoveryRecommendation {
  type: string;
  priority: string;
  description: string;
}

// ============================================
// CONSTANTS
// ============================================

const PROGRESSION_CONFIG = {
  minWorkoutsForAnalysis: 5,
  plateauThreshold: 0.05, // 5% variation = plateau
  plateauWindowDays: 14,
  recoveryFactors: {
    sleepWeight: 0.3,
    stressWeight: 0.2,
    nutritionWeight: 0.2,
    previousWorkoutWeight: 0.3,
  },
  difficultyAdjustment: {
    tooEasy: { threshold: 4, adjustment: 1.15 },
    optimal: { min: 5, max: 7 },
    tooHard: { threshold: 8, adjustment: 0.85 },
  },
};

const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'forearms', 'core', 'quadriceps', 'hamstrings',
  'glutes', 'calves', 'hip_flexors',
] as const;

// ============================================
// PROGRESSION ENGINE CLASS
// ============================================

export class ProgressionEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ============================================
  // PERFORMANCE TRACKING
  // ============================================

  async recordPerformance(metric: Omit<PerformanceMetric, 'id' | 'createdAt'>): Promise<PerformanceMetric> {
    const { data, error } = await supabase
      .from('exercise_performance_metrics')
      .insert({
        user_id: this.userId,
        exercise_code: metric.exerciseCode,
        sets_completed: metric.setsCompleted,
        reps_completed: metric.repsCompleted,
        weight_used: metric.weightUsed,
        duration_seconds: metric.durationSeconds,
        difficulty_rating: metric.difficultyRating,
        fatigue_level: metric.fatigueLevel,
        pain_level: metric.painLevel,
        heart_rate_avg: metric.heartRateAvg,
        heart_rate_max: metric.heartRateMax,
        notes: metric.notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Atualizar progressão do grupo muscular
    await this.updateMuscleGroupProgress(metric.exerciseCode);

    return {
      id: data.id,
      exerciseCode: data.exercise_code,
      setsCompleted: data.sets_completed,
      repsCompleted: data.reps_completed,
      weightUsed: data.weight_used,
      durationSeconds: data.duration_seconds,
      difficultyRating: data.difficulty_rating,
      fatigueLevel: data.fatigue_level,
      painLevel: data.pain_level,
      heartRateAvg: data.heart_rate_avg,
      heartRateMax: data.heart_rate_max,
      notes: data.notes,
      createdAt: new Date(data.created_at),
    };
  }

  async getPerformanceHistory(
    exerciseCode?: string,
    days: number = 30
  ): Promise<PerformanceMetric[]> {
    let query = supabase
      .from('exercise_performance_metrics')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (exerciseCode) {
      query = query.eq('exercise_code', exerciseCode);
    }

    const { data } = await query;

    return (data || []).map(p => ({
      id: p.id,
      exerciseCode: p.exercise_code,
      setsCompleted: p.sets_completed,
      repsCompleted: p.reps_completed,
      weightUsed: p.weight_used,
      durationSeconds: p.duration_seconds,
      difficultyRating: p.difficulty_rating,
      fatigueLevel: p.fatigue_level,
      painLevel: p.pain_level,
      heartRateAvg: p.heart_rate_avg,
      heartRateMax: p.heart_rate_max,
      notes: p.notes,
      createdAt: new Date(p.created_at),
    }));
  }

  // ============================================
  // DIFFICULTY ADAPTATION
  // ============================================

  async calculateAdaptedDifficulty(exerciseCode: string): Promise<{
    currentDifficulty: number;
    recommendedDifficulty: number;
    adjustment: number;
    reason: string;
  }> {
    const history = await this.getPerformanceHistory(exerciseCode, 14);
    
    if (history.length < PROGRESSION_CONFIG.minWorkoutsForAnalysis) {
      return {
        currentDifficulty: 5,
        recommendedDifficulty: 5,
        adjustment: 0,
        reason: 'Dados insuficientes para adaptação',
      };
    }

    // Calcular média de dificuldade reportada
    const avgDifficulty = history
      .filter(h => h.difficultyRating !== undefined)
      .reduce((sum, h) => sum + (h.difficultyRating || 0), 0) / history.length;

    let adjustment = 0;
    let reason = 'Dificuldade ideal';

    if (avgDifficulty < PROGRESSION_CONFIG.difficultyAdjustment.tooEasy.threshold) {
      adjustment = PROGRESSION_CONFIG.difficultyAdjustment.tooEasy.adjustment - 1;
      reason = 'Exercício muito fácil - aumentando intensidade';
    } else if (avgDifficulty > PROGRESSION_CONFIG.difficultyAdjustment.tooHard.threshold) {
      adjustment = PROGRESSION_CONFIG.difficultyAdjustment.tooHard.adjustment - 1;
      reason = 'Exercício muito difícil - reduzindo intensidade';
    }

    return {
      currentDifficulty: avgDifficulty,
      recommendedDifficulty: Math.max(1, Math.min(10, avgDifficulty * (1 + adjustment))),
      adjustment,
      reason,
    };
  }

  // ============================================
  // PLATEAU DETECTION
  // ============================================

  async detectPlateau(exerciseCode?: string): Promise<PlateauDetection[]> {
    const plateaus: PlateauDetection[] = [];
    const exercisesToCheck = exerciseCode 
      ? [exerciseCode] 
      : await this.getActiveExercises();

    for (const code of exercisesToCheck) {
      const history = await this.getPerformanceHistory(code, PROGRESSION_CONFIG.plateauWindowDays);
      
      if (history.length < PROGRESSION_CONFIG.minWorkoutsForAnalysis) continue;

      // Analisar tendência de peso/reps
      const weights = history.map(h => h.weightUsed).filter(w => w !== undefined) as number[];
      const reps = history.map(h => h.repsCompleted).filter(r => r !== undefined) as number[];

      if (weights.length >= 3) {
        const weightVariation = this.calculateVariation(weights);
        if (weightVariation < PROGRESSION_CONFIG.plateauThreshold) {
          plateaus.push({
            exerciseCode: code,
            metric: 'weight',
            duration: PROGRESSION_CONFIG.plateauWindowDays,
            currentValue: weights[0],
            suggestions: this.generatePlateauSuggestions('weight', code),
          });
        }
      }

      if (reps.length >= 3) {
        const repsVariation = this.calculateVariation(reps);
        if (repsVariation < PROGRESSION_CONFIG.plateauThreshold) {
          plateaus.push({
            exerciseCode: code,
            metric: 'reps',
            duration: PROGRESSION_CONFIG.plateauWindowDays,
            currentValue: reps[0],
            suggestions: this.generatePlateauSuggestions('reps', code),
          });
        }
      }
    }

    return plateaus;
  }

  private calculateVariation(values: number[]): number {
    if (values.length < 2) return 1;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    return Math.sqrt(variance) / avg;
  }

  private generatePlateauSuggestions(metric: string, exerciseCode: string): string[] {
    const suggestions: string[] = [];
    
    if (metric === 'weight') {
      suggestions.push('Tente técnicas de intensificação como drop sets');
      suggestions.push('Aumente o tempo sob tensão (cadência mais lenta)');
      suggestions.push('Considere uma semana de deload');
    } else if (metric === 'reps') {
      suggestions.push('Experimente variações do exercício');
      suggestions.push('Adicione pausa no ponto de maior tensão');
      suggestions.push('Revise sua técnica com foco na contração');
    }

    suggestions.push('Verifique sua nutrição e recuperação');
    return suggestions;
  }

  // ============================================
  // MUSCLE GROUP BALANCE
  // ============================================

  async getMuscleGroupProgress(): Promise<MuscleGroupProgress[]> {
    const { data } = await supabase
      .from('exercise_muscle_group_progress')
      .select('*')
      .eq('user_id', this.userId);

    return (data || []).map(mg => ({
      muscleGroup: mg.muscle_group,
      totalVolume: mg.total_volume,
      weeklyVolume: mg.weekly_volume,
      lastTrainedAt: mg.last_trained_at ? new Date(mg.last_trained_at) : undefined,
      progressScore: mg.progress_score,
      balanceScore: mg.balance_score,
    }));
  }

  async detectMuscleImbalances(): Promise<{
    imbalances: Array<{
      strongerGroup: string;
      weakerGroup: string;
      ratio: number;
      recommendation: string;
    }>;
    overallBalance: number;
  }> {
    const progress = await this.getMuscleGroupProgress();
    const imbalances: Array<{
      strongerGroup: string;
      weakerGroup: string;
      ratio: number;
      recommendation: string;
    }> = [];

    // Pares de músculos antagonistas
    const antagonistPairs = [
      ['chest', 'back'],
      ['biceps', 'triceps'],
      ['quadriceps', 'hamstrings'],
    ];

    for (const [group1, group2] of antagonistPairs) {
      const prog1 = progress.find(p => p.muscleGroup === group1);
      const prog2 = progress.find(p => p.muscleGroup === group2);

      if (prog1 && prog2 && prog1.weeklyVolume && prog2.weeklyVolume) {
        const ratio = prog1.weeklyVolume / prog2.weeklyVolume;
        
        if (ratio > 1.5 || ratio < 0.67) {
          const stronger = ratio > 1 ? group1 : group2;
          const weaker = ratio > 1 ? group2 : group1;
          
          imbalances.push({
            strongerGroup: stronger,
            weakerGroup: weaker,
            ratio: ratio > 1 ? ratio : 1 / ratio,
            recommendation: `Aumente o volume de ${weaker} para equilibrar com ${stronger}`,
          });
        }
      }
    }

    // Calcular score geral de equilíbrio
    const balanceScores = progress.map(p => p.balanceScore || 0.5);
    const overallBalance = balanceScores.length > 0
      ? balanceScores.reduce((a, b) => a + b, 0) / balanceScores.length
      : 0.5;

    return { imbalances, overallBalance };
  }

  private async updateMuscleGroupProgress(exerciseCode: string): Promise<void> {
    // Buscar grupos musculares do exercício
    const muscleGroups = await this.getExerciseMuscleGroups(exerciseCode);
    
    for (const group of muscleGroups) {
      await supabase.rpc('update_muscle_group_progress', {
        p_user_id: this.userId,
        p_muscle_group: group,
      });
    }
  }

  private async getExerciseMuscleGroups(exerciseCode: string): Promise<string[]> {
    // Mapeamento simplificado - em produção, buscar do banco
    const muscleMap: Record<string, string[]> = {
      'supino-reto': ['chest', 'triceps', 'shoulders'],
      'supino-inclinado': ['chest', 'triceps', 'shoulders'],
      'crucifixo': ['chest'],
      'remada-curvada': ['back', 'biceps'],
      'puxada-frontal': ['back', 'biceps'],
      'desenvolvimento': ['shoulders', 'triceps'],
      'rosca-direta': ['biceps'],
      'triceps-pulley': ['triceps'],
      'agachamento': ['quadriceps', 'glutes', 'hamstrings'],
      'leg-press': ['quadriceps', 'glutes'],
      'stiff': ['hamstrings', 'glutes', 'back'],
    };

    return muscleMap[exerciseCode] || ['core'];
  }

  // ============================================
  // RECOVERY OPTIMIZATION
  // ============================================

  async calculateRecoveryRecommendation(): Promise<RecoveryRecommendation> {
    // Buscar dados recentes
    const [recentWorkouts, holisticData] = await Promise.all([
      this.getPerformanceHistory(undefined, 7),
      this.getRecentHolisticData(),
    ]);

    // Calcular fatores de recuperação
    const workoutLoad = this.calculateWorkoutLoad(recentWorkouts);
    const sleepScore = holisticData?.sleepQuality || 5;
    const stressScore = 10 - (holisticData?.stressLevel || 5);
    const nutritionScore = holisticData?.nutritionScore || 5;

    // Score de recuperação ponderado
    const recoveryScore = (
      sleepScore * PROGRESSION_CONFIG.recoveryFactors.sleepWeight +
      stressScore * PROGRESSION_CONFIG.recoveryFactors.stressWeight +
      nutritionScore * PROGRESSION_CONFIG.recoveryFactors.nutritionWeight +
      (10 - workoutLoad) * PROGRESSION_CONFIG.recoveryFactors.previousWorkoutWeight
    );

    // Determinar tempo de descanso recomendado
    let restHours = 24;
    if (recoveryScore < 4) restHours = 72;
    else if (recoveryScore < 6) restHours = 48;
    else if (recoveryScore < 8) restHours = 36;

    // Gerar recomendações
    const recommendations: string[] = [];
    if (sleepScore < 6) recommendations.push('Priorize 7-9 horas de sono');
    if (stressScore < 5) recommendations.push('Pratique técnicas de relaxamento');
    if (nutritionScore < 6) recommendations.push('Aumente proteína e hidratação');
    if (workoutLoad > 7) recommendations.push('Considere um dia de descanso ativo');

    return {
      recoveryScore: recoveryScore / 10,
      recommendedRestHours: restHours,
      readyForIntenseWorkout: recoveryScore >= 7,
      recommendations,
      factors: {
        sleep: sleepScore / 10,
        stress: stressScore / 10,
        nutrition: nutritionScore / 10,
        workoutLoad: workoutLoad / 10,
      },
    };
  }

  private calculateWorkoutLoad(workouts: PerformanceMetric[]): number {
    if (workouts.length === 0) return 0;

    // Calcular carga baseada em volume e intensidade
    const totalLoad = workouts.reduce((sum, w) => {
      const volume = (w.setsCompleted || 0) * (w.repsCompleted || 0);
      const intensity = (w.difficultyRating || 5) / 10;
      return sum + volume * intensity;
    }, 0);

    // Normalizar para escala 0-10
    return Math.min(10, totalLoad / 100);
  }

  private async getRecentHolisticData(): Promise<{
    sleepQuality: number;
    stressLevel: number;
    nutritionScore: number;
  } | null> {
    const { data } = await supabase
      .from('holistic_health_data')
      .select('sleep_quality, stress_level, nutrition_score')
      .eq('user_id', this.userId)
      .order('tracking_date', { ascending: false })
      .limit(1)
      .single();

    if (!data) return null;

    return {
      sleepQuality: data.sleep_quality || 5,
      stressLevel: data.stress_level || 5,
      nutritionScore: data.nutrition_score || 5,
    };
  }

  // ============================================
  // PROGRESSION PLAN
  // ============================================

  async generateProgressionPlan(
    goalType: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss',
    weeks: number = 8
  ): Promise<ProgressionPlan> {
    const currentPerformance = await this.getPerformanceHistory(undefined, 30);
    const muscleProgress = await this.getMuscleGroupProgress();
    const plateaus = await this.detectPlateau();

    // Calcular baseline
    const baseline = this.calculateBaseline(currentPerformance);

    // Gerar fases do plano
    const phases = this.generatePhases(goalType, weeks, baseline);

    // Identificar exercícios prioritários
    const priorityExercises = this.identifyPriorityExercises(
      muscleProgress,
      plateaus,
      goalType
    );

    return {
      goalType,
      durationWeeks: weeks,
      phases,
      priorityExercises,
      weeklyTargets: this.generateWeeklyTargets(goalType, weeks),
      adaptationRules: this.getAdaptationRules(goalType),
    };
  }

  private calculateBaseline(performance: PerformanceMetric[]): {
    avgVolume: number;
    avgIntensity: number;
    avgFrequency: number;
  } {
    if (performance.length === 0) {
      return { avgVolume: 0, avgIntensity: 5, avgFrequency: 0 };
    }

    const totalVolume = performance.reduce((sum, p) => 
      sum + (p.setsCompleted || 0) * (p.repsCompleted || 0), 0);
    
    const avgIntensity = performance
      .filter(p => p.difficultyRating)
      .reduce((sum, p) => sum + (p.difficultyRating || 0), 0) / performance.length;

    // Calcular frequência (treinos por semana)
    const uniqueDays = new Set(
      performance.map(p => p.createdAt.toISOString().split('T')[0])
    ).size;
    const weeks = 4; // últimas 4 semanas
    const avgFrequency = uniqueDays / weeks;

    return {
      avgVolume: totalVolume / performance.length,
      avgIntensity,
      avgFrequency,
    };
  }

  private generatePhases(
    goalType: string,
    weeks: number,
    baseline: { avgVolume: number; avgIntensity: number; avgFrequency: number }
  ): Array<{
    name: string;
    weeks: number;
    focus: string;
    volumeMultiplier: number;
    intensityTarget: number;
  }> {
    const phases = [];
    
    if (goalType === 'strength') {
      phases.push(
        { name: 'Adaptação', weeks: 2, focus: 'Técnica e base', volumeMultiplier: 0.8, intensityTarget: 6 },
        { name: 'Acumulação', weeks: 3, focus: 'Volume progressivo', volumeMultiplier: 1.2, intensityTarget: 7 },
        { name: 'Intensificação', weeks: 2, focus: 'Cargas máximas', volumeMultiplier: 0.9, intensityTarget: 9 },
        { name: 'Realização', weeks: 1, focus: 'Teste de força', volumeMultiplier: 0.6, intensityTarget: 10 }
      );
    } else if (goalType === 'hypertrophy') {
      phases.push(
        { name: 'Preparação', weeks: 2, focus: 'Conexão mente-músculo', volumeMultiplier: 0.9, intensityTarget: 6 },
        { name: 'Volume', weeks: 4, focus: 'Alto volume', volumeMultiplier: 1.3, intensityTarget: 7 },
        { name: 'Intensidade', weeks: 2, focus: 'Técnicas avançadas', volumeMultiplier: 1.0, intensityTarget: 8 }
      );
    } else {
      phases.push(
        { name: 'Base', weeks: Math.ceil(weeks / 3), focus: 'Construir resistência', volumeMultiplier: 1.0, intensityTarget: 5 },
        { name: 'Desenvolvimento', weeks: Math.ceil(weeks / 3), focus: 'Progressão gradual', volumeMultiplier: 1.2, intensityTarget: 6 },
        { name: 'Pico', weeks: Math.floor(weeks / 3), focus: 'Performance máxima', volumeMultiplier: 1.1, intensityTarget: 7 }
      );
    }

    return phases;
  }

  private identifyPriorityExercises(
    muscleProgress: MuscleGroupProgress[],
    plateaus: PlateauDetection[],
    goalType: string
  ): string[] {
    const priorities: string[] = [];

    // Adicionar exercícios em plateau
    plateaus.forEach(p => {
      if (!priorities.includes(p.exerciseCode)) {
        priorities.push(p.exerciseCode);
      }
    });

    // Adicionar grupos musculares fracos
    const weakGroups = muscleProgress
      .filter(mg => (mg.balanceScore || 0.5) < 0.4)
      .map(mg => mg.muscleGroup);

    // Mapear grupos para exercícios
    const groupExercises: Record<string, string[]> = {
      chest: ['supino-reto', 'supino-inclinado'],
      back: ['remada-curvada', 'puxada-frontal'],
      shoulders: ['desenvolvimento', 'elevacao-lateral'],
      quadriceps: ['agachamento', 'leg-press'],
      hamstrings: ['stiff', 'mesa-flexora'],
    };

    weakGroups.forEach(group => {
      const exercises = groupExercises[group] || [];
      exercises.forEach(ex => {
        if (!priorities.includes(ex)) priorities.push(ex);
      });
    });

    return priorities.slice(0, 5);
  }

  private generateWeeklyTargets(
    goalType: string,
    weeks: number
  ): Array<{ week: number; volumeTarget: number; intensityTarget: number }> {
    const targets = [];
    
    for (let week = 1; week <= weeks; week++) {
      const progress = week / weeks;
      let volumeTarget = 100;
      let intensityTarget = 5;

      if (goalType === 'strength') {
        volumeTarget = 100 - progress * 30; // Volume diminui
        intensityTarget = 5 + progress * 4; // Intensidade aumenta
      } else if (goalType === 'hypertrophy') {
        volumeTarget = 100 + progress * 30; // Volume aumenta
        intensityTarget = 6 + progress * 2;
      } else {
        volumeTarget = 100 + progress * 20;
        intensityTarget = 5 + progress * 2;
      }

      targets.push({
        week,
        volumeTarget: Math.round(volumeTarget),
        intensityTarget: Math.round(intensityTarget * 10) / 10,
      });
    }

    return targets;
  }

  private getAdaptationRules(goalType: string): string[] {
    const rules = [
      'Ajustar automaticamente se dificuldade < 4 ou > 8',
      'Reduzir volume em 20% se fadiga > 7 por 3 dias',
      'Aumentar descanso se frequência cardíaca não recuperar',
    ];

    if (goalType === 'strength') {
      rules.push('Priorizar aumento de carga sobre repetições');
      rules.push('Manter séries entre 3-5 reps para força máxima');
    } else if (goalType === 'hypertrophy') {
      rules.push('Manter tempo sob tensão de 40-60 segundos por série');
      rules.push('Variar exercícios a cada 4-6 semanas');
    }

    return rules;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async getActiveExercises(): Promise<string[]> {
    const { data } = await supabase
      .from('exercise_performance_metrics')
      .select('exercise_code')
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const codes = (data || []).map(d => d.exercise_code);
    return [...new Set(codes)];
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createProgressionEngine(userId: string): ProgressionEngine {
  return new ProgressionEngine(userId);
}

export default ProgressionEngine;
