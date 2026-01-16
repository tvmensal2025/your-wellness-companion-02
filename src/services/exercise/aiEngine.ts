// ============================================
// 🤖 AI ENGINE SERVICE
// Motor de IA para adaptação de treinos em tempo real
// ============================================

import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';
import type {
  ContextData,
  UserAnalysis,
  WorkoutAdaptation,
  WorkoutPlan,
  AdaptedWorkout,
  RiskFactor,
  PerformanceMetric,
  UserLearningModel,
} from '@/types/advanced-exercise-system';

// ============================================
// CONSTANTS
// ============================================

const SAFE_HEART_RATE_ZONES = {
  low: { min: 50, max: 100 },
  moderate: { min: 100, max: 140 },
  high: { min: 140, max: 170 },
  max: { min: 170, max: 200 },
};

const DIFFICULTY_THRESHOLDS = {
  tooEasy: 4,
  optimal: { min: 5, max: 8 },
  tooHard: 9,
};

const INTENSITY_ADJUSTMENTS = {
  increase: 1.1, // 10% increase
  decrease: 0.9, // 10% decrease
  significant_decrease: 0.75, // 25% decrease for safety
};

// ============================================
// AI ENGINE CLASS
// ============================================

export class AIEngineService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ============================================
  // USER STATE ANALYSIS
  // ============================================

  async analyzeUserState(contextData: ContextData): Promise<UserAnalysis> {
    // Buscar dados recentes do usuário
    const [recentPerformance, learningModel, holisticData] = await Promise.all([
      this.getRecentPerformance(7),
      this.getUserLearningModel(),
      this.getRecentHolisticData(),
    ]);

    // Calcular níveis baseados nos dados
    const energyLevel = this.calculateEnergyLevel(contextData, holisticData);
    const readiness = this.calculateReadiness(contextData, recentPerformance);
    const fatigueLevel = this.calculateFatigueLevel(recentPerformance, holisticData);
    const stressLevel = contextData.stressLevel / 10;

    // Identificar fatores de risco
    const riskFactors = this.identifyRiskFactors(contextData, recentPerformance, holisticData);

    // Determinar intensidade recomendada
    const recommendedIntensity = this.determineRecommendedIntensity(
      energyLevel,
      readiness,
      fatigueLevel,
      riskFactors
    );

    // Gerar recomendações
    const recommendations = this.generateRecommendations(
      contextData,
      riskFactors,
      recommendedIntensity
    );

    // Salvar análise no banco
    const analysis: UserAnalysis = {
      energyLevel,
      readiness,
      fatigueLevel,
      stressLevel,
      recommendedIntensity,
      recommendedDurationMinutes: this.calculateRecommendedDuration(recommendedIntensity),
      riskFactors,
      recommendations,
      confidenceScore: this.calculateConfidenceScore(contextData, learningModel),
    };

    await this.saveAnalysis(analysis);

    return analysis;
  }

  // ============================================
  // WORKOUT ADAPTATION
  // ============================================

  async adaptWorkout(
    workoutPlan: WorkoutPlan,
    userState: UserAnalysis
  ): Promise<AdaptedWorkout> {
    const adaptations: WorkoutAdaptation[] = [];
    const adaptedExercises = [...workoutPlan.exercises];

    // Adaptar baseado na intensidade recomendada
    if (userState.recommendedIntensity === 'rest') {
      // Sugerir descanso completo
      return {
        ...workoutPlan,
        exercises: [],
        adaptations: [{
          id: crypto.randomUUID(),
          adaptationType: 'skip',
          originalValue: { exercises: workoutPlan.exercises },
          adaptedValue: { exercises: [] },
          reason: 'Descanso recomendado devido a fatores de risco identificados',
          triggerType: 'fatigue',
          triggerValue: { riskFactors: userState.riskFactors },
        }],
        originalPlan: workoutPlan,
        adaptationReason: 'Descanso recomendado',
      };
    }

    // Adaptar cada exercício baseado no estado do usuário
    for (let i = 0; i < adaptedExercises.length; i++) {
      const exercise = adaptedExercises[i];
      
      // Verificar se precisa adaptar intensidade
      if (userState.recommendedIntensity === 'low' && userState.fatigueLevel > 0.7) {
        const adaptation = this.createIntensityAdaptation(
          exercise,
          'intensity_decrease',
          INTENSITY_ADJUSTMENTS.significant_decrease,
          'Alta fadiga detectada'
        );
        adaptations.push(adaptation);
        adaptedExercises[i] = this.applyAdaptation(exercise, adaptation);
      } else if (userState.recommendedIntensity === 'low') {
        const adaptation = this.createIntensityAdaptation(
          exercise,
          'intensity_decrease',
          INTENSITY_ADJUSTMENTS.decrease,
          'Intensidade reduzida para recuperação'
        );
        adaptations.push(adaptation);
        adaptedExercises[i] = this.applyAdaptation(exercise, adaptation);
      }

      // Verificar riscos específicos
      for (const risk of userState.riskFactors) {
        if (risk.severity === 'high' || risk.severity === 'critical') {
          if (risk.affectedAreas?.some(area => 
            this.exerciseAffectsArea(exercise.exerciseCode, area)
          )) {
            const adaptation = this.createSwapAdaptation(
              exercise,
              risk,
              'Exercício modificado devido a risco de lesão'
            );
            if (adaptation) {
              adaptations.push(adaptation);
              adaptedExercises[i] = this.applyAdaptation(exercise, adaptation);
            }
          }
        }
      }
    }

    // Adaptar tempo de descanso se necessário
    if (userState.fatigueLevel > 0.5) {
      const restAdaptation = this.createRestAdaptation(
        workoutPlan,
        Math.ceil(userState.fatigueLevel * 30) // até 30 segundos extras
      );
      adaptations.push(restAdaptation);
    }

    return {
      ...workoutPlan,
      exercises: adaptedExercises,
      adaptations,
      originalPlan: workoutPlan,
      adaptationReason: this.summarizeAdaptations(adaptations),
    };
  }

  // ============================================
  // REAL-TIME ADAPTATION (durante o treino)
  // ============================================

  async adaptInRealTime(
    exerciseCode: string,
    currentMetrics: Partial<PerformanceMetric>
  ): Promise<WorkoutAdaptation | null> {
    // Verificar dificuldade reportada
    if (currentMetrics.difficultyRating !== undefined) {
      if (currentMetrics.difficultyRating <= DIFFICULTY_THRESHOLDS.tooEasy) {
        return {
          id: crypto.randomUUID(),
          adaptationType: 'intensity_increase',
          originalValue: { difficulty: currentMetrics.difficultyRating },
          adaptedValue: { multiplier: INTENSITY_ADJUSTMENTS.increase },
          reason: 'Exercício muito fácil - aumentando intensidade',
          triggerType: 'difficulty_rating',
          triggerValue: { rating: currentMetrics.difficultyRating },
        };
      }
      
      if (currentMetrics.difficultyRating >= DIFFICULTY_THRESHOLDS.tooHard) {
        return {
          id: crypto.randomUUID(),
          adaptationType: 'intensity_decrease',
          originalValue: { difficulty: currentMetrics.difficultyRating },
          adaptedValue: { multiplier: INTENSITY_ADJUSTMENTS.decrease },
          reason: 'Exercício muito difícil - reduzindo intensidade',
          triggerType: 'difficulty_rating',
          triggerValue: { rating: currentMetrics.difficultyRating },
        };
      }
    }

    // Verificar frequência cardíaca
    if (currentMetrics.heartRateMax !== undefined) {
      const userAge = await this.getUserAge();
      const maxSafeHR = this.calculateMaxSafeHeartRate(userAge ?? undefined);
      if (currentMetrics.heartRateMax > maxSafeHR) {
        return {
          id: crypto.randomUUID(),
          adaptationType: 'rest_extension',
          originalValue: { heartRate: currentMetrics.heartRateMax },
          adaptedValue: { extraRestSeconds: 30 },
          reason: 'Frequência cardíaca acima da zona segura - descanso estendido',
          triggerType: 'heart_rate',
          triggerValue: { heartRate: currentMetrics.heartRateMax, maxSafe: maxSafeHR },
        };
      }
    }

    // Verificar dor reportada
    if (currentMetrics.painLevel !== undefined && currentMetrics.painLevel > 3) {
      return {
        id: crypto.randomUUID(),
        adaptationType: currentMetrics.painLevel > 6 ? 'skip' : 'exercise_swap',
        originalValue: { painLevel: currentMetrics.painLevel },
        adaptedValue: { action: currentMetrics.painLevel > 6 ? 'stop' : 'modify' },
        reason: currentMetrics.painLevel > 6 
          ? 'Dor significativa - interromper exercício'
          : 'Desconforto detectado - modificar exercício',
        triggerType: 'pain',
        triggerValue: { painLevel: currentMetrics.painLevel },
      };
    }

    return null;
  }

  // ============================================
  // FEEDBACK PROCESSING & LEARNING
  // ============================================

  async processUserFeedback(
    adaptationId: string,
    accepted: boolean,
    feedback?: string,
    effectivenessRating?: number
  ): Promise<void> {
    // Atualizar adaptação com feedback
    await fromTable('ai_workout_adaptations')
      .update({
        user_accepted: accepted,
        user_feedback: feedback,
        effectiveness_rating: effectivenessRating,
      })
      .eq('id', adaptationId);

    // Atualizar modelo de aprendizado
    await this.updateLearningModel(adaptationId, accepted, effectivenessRating);
  }

  private async updateLearningModel(
    adaptationId: string,
    accepted: boolean,
    effectivenessRating?: number
  ): Promise<void> {
    // Buscar modelo atual
    const { data: model } = await fromTable('ai_user_learning_model')
      .select('*')
      .eq('user_id', this.userId)
      .maybeSingle() as any;

    const newFeedbackCount = (model?.total_feedback_count || 0) + 1;
    
    // Calcular nova acurácia do modelo
    const currentAccuracy = model?.model_accuracy || 0.5;
    const feedbackScore = accepted ? 1 : 0;
    const newAccuracy = (currentAccuracy * (newFeedbackCount - 1) + feedbackScore) / newFeedbackCount;

    // Upsert modelo
    await fromTable('ai_user_learning_model')
      .upsert({
        user_id: this.userId,
        total_feedback_count: newFeedbackCount,
        model_accuracy: newAccuracy,
        last_model_update: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async getRecentPerformance(days: number): Promise<PerformanceMetric[]> {
    // Using user_exercise_history instead of exercise_performance_metrics
    const { data } = await fromTable('user_exercise_history')
      .select('*')
      .eq('user_id', this.userId)
      .gte('completed_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: false }) as any;

    // Map user_exercise_history fields to PerformanceMetric structure
    return ((data || []) as any[]).map((d: any) => {
      const difficultyMap: Record<string, number> = { easy: 3, medium: 6, hard: 9 };
      return {
        ...d,
        createdAt: d.completed_at,
        difficultyRating: d.difficulty_level ? (difficultyMap[d.difficulty_level] || 5) : undefined,
        fatigueLevel: d.difficulty_level ? (difficultyMap[d.difficulty_level] || 5) : undefined,
      };
    }) as unknown as PerformanceMetric[];
  }

  private async getUserLearningModel(): Promise<UserLearningModel | null> {
    // Using sofia_learning instead of ai_user_learning_model
    const { data } = await fromTable('sofia_learning')
      .select('*')
      .eq('user_id', this.userId)
      .maybeSingle() as any;

    return data as unknown as UserLearningModel | null;
  }

  private async getRecentHolisticData(): Promise<Record<string, unknown> | null> {
    // Using advanced_daily_tracking instead of holistic_health_data
    const { data } = await fromTable('advanced_daily_tracking')
      .select('*')
      .eq('user_id', this.userId)
      .order('tracking_date', { ascending: false })
      .limit(7) as any;

    return data?.[0] as Record<string, unknown> || null;
  }

  private calculateEnergyLevel(
    contextData: ContextData,
    holisticData: Record<string, unknown> | null
  ): number {
    let energy = 0.5; // base

    // Ajustar baseado no sono
    if (contextData.sleepQuality) {
      energy += (contextData.sleepQuality - 5) * 0.05;
    }
    if (contextData.sleepHours) {
      if (contextData.sleepHours >= 7 && contextData.sleepHours <= 9) {
        energy += 0.1;
      } else if (contextData.sleepHours < 6) {
        energy -= 0.2;
      }
    }

    // Ajustar baseado no estresse
    energy -= (contextData.stressLevel / 10) * 0.15;

    // Ajustar baseado no horário
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 11) energy += 0.1; // manhã produtiva
    if (hour >= 14 && hour <= 16) energy -= 0.05; // pós-almoço
    if (hour >= 17 && hour <= 19) energy += 0.05; // fim de tarde

    return Math.max(0, Math.min(1, energy));
  }

  private calculateReadiness(
    contextData: ContextData,
    recentPerformance: PerformanceMetric[]
  ): number {
    let readiness = 0.5;

    // Verificar descanso desde último treino
    if (recentPerformance.length > 0) {
      const lastWorkout = new Date(recentPerformance[0].createdAt);
      const hoursSinceLastWorkout = (Date.now() - lastWorkout.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastWorkout < 12) {
        readiness -= 0.2; // muito recente
      } else if (hoursSinceLastWorkout >= 24 && hoursSinceLastWorkout <= 72) {
        readiness += 0.1; // descanso adequado
      } else if (hoursSinceLastWorkout > 168) {
        readiness -= 0.1; // muito tempo sem treinar
      }
    }

    // Verificar tendência de dificuldade
    const recentDifficulties = recentPerformance
      .slice(0, 5)
      .map(p => p.difficultyRating)
      .filter(d => d !== undefined);
    
    if (recentDifficulties.length > 0) {
      const avgDifficulty = recentDifficulties.reduce((a, b) => a + b, 0) / recentDifficulties.length;
      if (avgDifficulty > 8) readiness -= 0.15;
      if (avgDifficulty < 5) readiness += 0.1;
    }

    return Math.max(0, Math.min(1, readiness));
  }

  private calculateFatigueLevel(
    recentPerformance: PerformanceMetric[],
    holisticData: Record<string, unknown> | null
  ): number {
    let fatigue = 0.3; // base

    // Verificar volume de treino recente
    const last7Days = recentPerformance.filter(p => {
      const date = new Date(p.createdAt);
      return Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
    });

    if (last7Days.length > 5) fatigue += 0.2;
    if (last7Days.length > 7) fatigue += 0.2;

    // Verificar níveis de fadiga reportados
    const recentFatigue = recentPerformance
      .slice(0, 3)
      .map(p => p.fatigueLevel)
      .filter(f => f !== undefined);
    
    if (recentFatigue.length > 0) {
      const avgFatigue = recentFatigue.reduce((a, b) => a + b, 0) / recentFatigue.length;
      fatigue += (avgFatigue / 10) * 0.3;
    }

    // Verificar dados holísticos
    if (holisticData) {
      const sorenessLevel = holisticData.soreness_level as number | undefined;
      if (sorenessLevel && sorenessLevel > 6) {
        fatigue += 0.15;
      }
    }

    return Math.max(0, Math.min(1, fatigue));
  }

  private identifyRiskFactors(
    contextData: ContextData,
    recentPerformance: PerformanceMetric[],
    holisticData: Record<string, unknown> | null
  ): RiskFactor[] {
    const risks: RiskFactor[] = [];

    // Verificar overtraining
    const last7Days = recentPerformance.filter(p => {
      const date = new Date(p.createdAt);
      return Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
    });

    if (last7Days.length > 6) {
      risks.push({
        type: 'overtraining',
        severity: last7Days.length > 8 ? 'high' : 'moderate',
        description: 'Volume de treino muito alto nos últimos 7 dias',
      });
    }

    // Verificar sono inadequado
    if (contextData.sleepHours && contextData.sleepHours < 6) {
      risks.push({
        type: 'sleep_deprivation',
        severity: contextData.sleepHours < 5 ? 'high' : 'moderate',
        description: 'Sono insuficiente pode aumentar risco de lesão',
      });
    }

    // Verificar estresse alto
    if (contextData.stressLevel > 7) {
      risks.push({
        type: 'high_stress',
        severity: contextData.stressLevel > 8 ? 'high' : 'moderate',
        description: 'Estresse elevado pode afetar performance e recuperação',
      });
    }

    // Verificar dor recente
    const recentPain = recentPerformance
      .slice(0, 5)
      .filter(p => p.painLevel && p.painLevel > 3);
    
    if (recentPain.length > 0) {
      risks.push({
        type: 'recent_pain',
        severity: recentPain.some(p => p.painLevel && p.painLevel > 6) ? 'high' : 'moderate',
        description: 'Dor reportada em treinos recentes',
        affectedAreas: recentPain.map(p => p.exerciseCode),
      });
    }

    return risks;
  }

  private determineRecommendedIntensity(
    energyLevel: number,
    readiness: number,
    fatigueLevel: number,
    riskFactors: RiskFactor[]
  ): 'low' | 'medium' | 'high' | 'rest' {
    // Verificar riscos críticos
    if (riskFactors.some(r => r.severity === 'critical')) {
      return 'rest';
    }

    // Calcular score combinado
    const score = (energyLevel + readiness - fatigueLevel) / 2;
    
    // Penalizar por riscos
    const riskPenalty = riskFactors.reduce((acc, r) => {
      if (r.severity === 'high') return acc + 0.2;
      if (r.severity === 'moderate') return acc + 0.1;
      return acc;
    }, 0);

    const adjustedScore = score - riskPenalty;

    if (adjustedScore < 0.2) return 'rest';
    if (adjustedScore < 0.4) return 'low';
    if (adjustedScore < 0.7) return 'medium';
    return 'high';
  }

  private calculateRecommendedDuration(intensity: 'low' | 'medium' | 'high' | 'rest'): number {
    switch (intensity) {
      case 'rest': return 0;
      case 'low': return 30;
      case 'medium': return 45;
      case 'high': return 60;
    }
  }

  private generateRecommendations(
    contextData: ContextData,
    riskFactors: RiskFactor[],
    intensity: 'low' | 'medium' | 'high' | 'rest'
  ): string[] {
    const recommendations: string[] = [];

    if (intensity === 'rest') {
      recommendations.push('Hoje é um bom dia para descanso ativo ou alongamento leve');
      recommendations.push('Foque em recuperação: hidratação, sono e alimentação');
    }

    if (riskFactors.some(r => r.type === 'overtraining')) {
      recommendations.push('Considere um dia de deload ou treino mais leve');
    }

    if (riskFactors.some(r => r.type === 'sleep_deprivation')) {
      recommendations.push('Priorize o sono esta noite para melhor recuperação');
    }

    if (contextData.stressLevel > 6) {
      recommendations.push('Exercícios de respiração podem ajudar a reduzir o estresse');
    }

    if (intensity === 'high') {
      recommendations.push('Ótimo dia para treino intenso! Aproveite a energia');
    }

    return recommendations;
  }

  private calculateConfidenceScore(
    contextData: ContextData,
    learningModel: UserLearningModel | null
  ): number {
    let confidence = 0.5;

    // Mais dados = mais confiança
    if (learningModel) {
      confidence += Math.min(0.3, learningModel.totalFeedbackCount * 0.01);
      confidence = confidence * (0.5 + learningModel.modelAccuracy * 0.5);
    }

    // Dados contextuais completos aumentam confiança
    if (contextData.sleepQuality) confidence += 0.05;
    if (contextData.sleepHours) confidence += 0.05;
    if (contextData.recentPerformance.length > 0) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  private async saveAnalysis(analysis: UserAnalysis): Promise<void> {
    await fromTable('ai_user_state_analysis').insert({
      user_id: this.userId,
      energy_level: analysis.energyLevel,
      readiness_score: analysis.readiness,
      fatigue_level: analysis.fatigueLevel,
      stress_level: analysis.stressLevel,
      recommended_intensity: analysis.recommendedIntensity,
      recommended_duration_minutes: analysis.recommendedDurationMinutes,
      risk_factors: analysis.riskFactors,
      recommendations: analysis.recommendations,
      confidence_score: analysis.confidenceScore,
      model_version: '1.0.0',
    });
  }

  private async getUserAge(): Promise<number | null> {
    // Tentar buscar de user_physical_data primeiro (use idade field)
    const { data: physicalData } = await supabase
      .from('user_physical_data')
      .select('idade')
      .eq('user_id', this.userId)
      .maybeSingle();

    if (physicalData?.idade) {
      return physicalData.idade;
    }

    // Fallback: buscar de profiles.birth_date
    const { data: profileData } = await supabase
      .from('profiles')
      .select('birth_date')
      .eq('id', this.userId)
      .maybeSingle();

    if (profileData?.birth_date) {
      const birthDate = new Date(profileData.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }

    return null;
  }

  private calculateMaxSafeHeartRate(age?: number): number {
    // Fórmula: 220 - idade
    if (age && age > 0 && age < 120) {
      return 220 - age;
    }
    return 180; // valor padrão conservador se idade não disponível
  }

  private createIntensityAdaptation(
    exercise: { exerciseCode: string; sets: number; reps: string },
    type: 'intensity_increase' | 'intensity_decrease',
    multiplier: number,
    reason: string
  ): WorkoutAdaptation {
    return {
      id: crypto.randomUUID(),
      adaptationType: type,
      originalValue: { sets: exercise.sets, reps: exercise.reps },
      adaptedValue: { multiplier },
      reason,
      triggerType: 'fatigue',
      triggerValue: { multiplier },
    };
  }

  private suggestExerciseSwap(exerciseCode: string, affectedArea: string): string | null {
    // Mapeamento de exercícios alternativos por área afetada
    const alternativeExercises: Record<string, Record<string, string[]>> = {
      // Se o problema é no ombro
      'shoulder': {
        'supino_reto': ['supino_inclinado_halteres', 'crossover_baixo', 'flexao_inclinada'],
        'supino_inclinado': ['crossover_alto', 'flexao_declinada'],
        'desenvolvimento': ['elevacao_lateral_cabo', 'elevacao_frontal_leve'],
        'flexao': ['flexao_joelhos', 'supino_maquina'],
        'push_up': ['flexao_joelhos', 'supino_maquina'],
      },
      // Se o problema é no joelho
      'knee': {
        'agachamento': ['leg_press_45', 'cadeira_extensora_leve', 'agachamento_isometrico'],
        'squat': ['leg_press_45', 'cadeira_extensora_leve', 'agachamento_isometrico'],
        'leg_press': ['cadeira_extensora', 'extensao_quadril'],
        'afundo': ['step_up_baixo', 'elevacao_quadril'],
        'lunge': ['step_up_baixo', 'elevacao_quadril'],
      },
      // Se o problema é na lombar
      'lombar': {
        'levantamento_terra': ['hip_thrust', 'extensao_lombar_maquina', 'ponte_gluteo'],
        'remada_curvada': ['remada_baixa_cabo', 'remada_maquina', 'puxada_frontal'],
        'stiff': ['cadeira_flexora', 'curl_nordico_assistido'],
        'agachamento': ['leg_press', 'hack_squat'],
      },
      // Se o problema é no pulso/antebraço
      'wrist': {
        'supino_reto': ['supino_maquina', 'crossover'],
        'rosca_direta': ['rosca_maquina', 'rosca_cabo'],
        'flexao': ['flexao_punho_fechado', 'supino_maquina'],
      },
      // Se o problema é no cotovelo
      'elbow': {
        'triceps_testa': ['triceps_pulley_corda', 'triceps_maquina'],
        'rosca_direta': ['rosca_martelo', 'rosca_cabo_neutro'],
        'mergulho': ['triceps_pulley', 'triceps_banco'],
      },
      // Se o problema é no quadril
      'hip': {
        'agachamento': ['leg_press_pes_altos', 'cadeira_extensora'],
        'afundo': ['step_up', 'agachamento_goblet'],
        'stiff': ['cadeira_flexora', 'ponte_gluteo'],
        'hip_thrust': ['extensao_quadril_cabo', 'ponte_gluteo'],
      },
    };

    const normalizedCode = exerciseCode.toLowerCase().replace(/[- ]/g, '_');
    const normalizedArea = affectedArea.toLowerCase();

    // Buscar alternativas para a área afetada
    const areaAlternatives = alternativeExercises[normalizedArea];
    if (areaAlternatives && areaAlternatives[normalizedCode]) {
      const alternatives = areaAlternatives[normalizedCode];
      return alternatives[0]; // Retorna a primeira alternativa
    }

    // Buscar em áreas relacionadas
    for (const [area, exercises] of Object.entries(alternativeExercises)) {
      if (normalizedArea.includes(area) || area.includes(normalizedArea)) {
        if (exercises[normalizedCode]) {
          return exercises[normalizedCode][0];
        }
      }
    }

    return null; // Sem alternativa encontrada
  }

  private createSwapAdaptation(
    exercise: { exerciseCode: string },
    risk: RiskFactor,
    reason: string
  ): WorkoutAdaptation | null {
    // Buscar exercício alternativo baseado na área afetada
    const affectedArea = risk.affectedAreas?.[0] || '';
    const alternativeExercise = this.suggestExerciseSwap(exercise.exerciseCode, affectedArea);
    
    if (alternativeExercise) {
      return {
        id: crypto.randomUUID(),
        adaptationType: 'exercise_swap',
        originalValue: { exerciseCode: exercise.exerciseCode },
        adaptedValue: { 
          newExerciseCode: alternativeExercise,
          action: 'swap' 
        },
        reason: `${reason}. Sugestão: ${alternativeExercise.replace(/_/g, ' ')}`,
        triggerType: 'pain',
        triggerValue: { risk, alternative: alternativeExercise },
      };
    }

    // Se não encontrou alternativa, sugerir pular
    return {
      id: crypto.randomUUID(),
      adaptationType: 'skip',
      originalValue: { exerciseCode: exercise.exerciseCode },
      adaptedValue: { action: 'skip' },
      reason: `${reason}. Recomendado pular este exercício.`,
      triggerType: 'pain',
      triggerValue: { risk },
    };
  }

  private createRestAdaptation(
    workoutPlan: WorkoutPlan,
    extraSeconds: number
  ): WorkoutAdaptation {
    return {
      id: crypto.randomUUID(),
      adaptationType: 'rest_extension',
      originalValue: { restTimes: workoutPlan.exercises.map(e => e.restTime) },
      adaptedValue: { extraRestSeconds: extraSeconds },
      reason: 'Tempo de descanso estendido para melhor recuperação',
      triggerType: 'fatigue',
      triggerValue: { extraSeconds },
    };
  }

  private applyAdaptation(
    exercise: { exerciseCode: string; sets: number; reps: string; restTime: number },
    adaptation: WorkoutAdaptation
  ): typeof exercise {
    // Aplicar adaptação ao exercício
    const adapted = { ...exercise };
    
    if (adaptation.adaptationType === 'intensity_decrease') {
      const multiplier = (adaptation.adaptedValue as { multiplier: number }).multiplier;
      adapted.sets = Math.max(1, Math.floor(adapted.sets * multiplier));
    }
    
    if (adaptation.adaptationType === 'rest_extension') {
      const extraSeconds = (adaptation.adaptedValue as { extraRestSeconds: number }).extraRestSeconds;
      adapted.restTime += extraSeconds;
    }

    return adapted;
  }

  private exerciseAffectsArea(exerciseCode: string, area: string): boolean {
    // Mapeamento de exercícios para grupos musculares/áreas do corpo
    const exerciseMuscleMap: Record<string, string[]> = {
      // Peito
      'supino_reto': ['chest', 'peito', 'peitoral', 'shoulder', 'ombro', 'triceps'],
      'supino_inclinado': ['chest', 'peito', 'peitoral', 'shoulder', 'ombro', 'triceps'],
      'supino_declinado': ['chest', 'peito', 'peitoral', 'triceps'],
      'crucifixo': ['chest', 'peito', 'peitoral'],
      'crossover': ['chest', 'peito', 'peitoral'],
      'flexao': ['chest', 'peito', 'peitoral', 'shoulder', 'ombro', 'triceps', 'core'],
      'push_up': ['chest', 'peito', 'peitoral', 'shoulder', 'ombro', 'triceps', 'core'],
      
      // Costas
      'puxada_frontal': ['back', 'costas', 'dorsal', 'biceps'],
      'puxada_alta': ['back', 'costas', 'dorsal', 'biceps'],
      'remada_curvada': ['back', 'costas', 'dorsal', 'biceps', 'lombar'],
      'remada_baixa': ['back', 'costas', 'dorsal', 'biceps'],
      'remada_unilateral': ['back', 'costas', 'dorsal', 'biceps'],
      'pull_up': ['back', 'costas', 'dorsal', 'biceps'],
      'barra_fixa': ['back', 'costas', 'dorsal', 'biceps'],
      'levantamento_terra': ['back', 'costas', 'lombar', 'glutes', 'gluteo', 'legs', 'pernas'],
      
      // Ombros
      'desenvolvimento': ['shoulder', 'ombro', 'deltoid', 'triceps'],
      'elevacao_lateral': ['shoulder', 'ombro', 'deltoid'],
      'elevacao_frontal': ['shoulder', 'ombro', 'deltoid'],
      'crucifixo_inverso': ['shoulder', 'ombro', 'deltoid', 'back', 'costas'],
      'face_pull': ['shoulder', 'ombro', 'deltoid', 'back', 'costas'],
      
      // Braços
      'rosca_direta': ['biceps', 'braco', 'arm'],
      'rosca_alternada': ['biceps', 'braco', 'arm'],
      'rosca_martelo': ['biceps', 'braco', 'arm', 'forearm', 'antebraco'],
      'rosca_concentrada': ['biceps', 'braco', 'arm'],
      'triceps_pulley': ['triceps', 'braco', 'arm'],
      'triceps_testa': ['triceps', 'braco', 'arm'],
      'triceps_frances': ['triceps', 'braco', 'arm'],
      'mergulho': ['triceps', 'braco', 'arm', 'chest', 'peito'],
      
      // Pernas
      'agachamento': ['legs', 'pernas', 'quadriceps', 'glutes', 'gluteo', 'core'],
      'squat': ['legs', 'pernas', 'quadriceps', 'glutes', 'gluteo', 'core'],
      'leg_press': ['legs', 'pernas', 'quadriceps', 'glutes', 'gluteo'],
      'cadeira_extensora': ['legs', 'pernas', 'quadriceps'],
      'cadeira_flexora': ['legs', 'pernas', 'hamstring', 'posterior'],
      'stiff': ['legs', 'pernas', 'hamstring', 'posterior', 'glutes', 'gluteo', 'lombar'],
      'afundo': ['legs', 'pernas', 'quadriceps', 'glutes', 'gluteo'],
      'lunge': ['legs', 'pernas', 'quadriceps', 'glutes', 'gluteo'],
      'panturrilha': ['calves', 'panturrilha', 'legs', 'pernas'],
      'elevacao_panturrilha': ['calves', 'panturrilha', 'legs', 'pernas'],
      'hip_thrust': ['glutes', 'gluteo', 'legs', 'pernas'],
      'abdutora': ['glutes', 'gluteo', 'legs', 'pernas', 'hip', 'quadril'],
      'adutora': ['legs', 'pernas', 'hip', 'quadril', 'inner_thigh'],
      
      // Core/Abdômen
      'abdominal': ['core', 'abs', 'abdomen'],
      'crunch': ['core', 'abs', 'abdomen'],
      'prancha': ['core', 'abs', 'abdomen', 'shoulder', 'ombro'],
      'plank': ['core', 'abs', 'abdomen', 'shoulder', 'ombro'],
      'elevacao_pernas': ['core', 'abs', 'abdomen', 'hip', 'quadril'],
      'russian_twist': ['core', 'abs', 'abdomen', 'obliques'],
      'abdominal_infra': ['core', 'abs', 'abdomen', 'hip', 'quadril'],
      
      // Cardio
      'corrida': ['cardio', 'legs', 'pernas', 'calves', 'panturrilha'],
      'caminhada': ['cardio', 'legs', 'pernas'],
      'bicicleta': ['cardio', 'legs', 'pernas', 'quadriceps'],
      'eliptico': ['cardio', 'legs', 'pernas', 'arms', 'bracos'],
      'pular_corda': ['cardio', 'calves', 'panturrilha', 'shoulder', 'ombro'],
      'burpee': ['cardio', 'full_body', 'corpo_todo', 'chest', 'peito', 'legs', 'pernas'],
    };

    const normalizedCode = exerciseCode.toLowerCase().replace(/[- ]/g, '_');
    const normalizedArea = area.toLowerCase();
    
    // Buscar exercício no mapa
    const affectedAreas = exerciseMuscleMap[normalizedCode];
    if (affectedAreas) {
      return affectedAreas.some(a => 
        a.includes(normalizedArea) || normalizedArea.includes(a)
      );
    }
    
    // Fallback: verificar se o código do exercício contém a área
    return normalizedCode.includes(normalizedArea) || normalizedArea.includes(normalizedCode);
  }

  private summarizeAdaptations(adaptations: WorkoutAdaptation[]): string {
    if (adaptations.length === 0) return 'Nenhuma adaptação necessária';
    
    const types = adaptations.map(a => a.adaptationType);
    const uniqueTypes = [...new Set(types)];
    
    return `${adaptations.length} adaptação(ões): ${uniqueTypes.join(', ')}`;
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createAIEngine(userId: string): AIEngineService {
  return new AIEngineService(userId);
}

export default AIEngineService;
