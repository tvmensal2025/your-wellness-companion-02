// ============================================
// 🧠 LEARNING SERVICE
// Sistema de aprendizado e feedback contínuo
// ============================================

import { supabase } from '@/integrations/supabase/client';
import type {
  UserFeedback,
  ExercisePreference,
  LearningInsight,
  ABTestVariant,
} from '@/types/advanced-exercise-system';

// Type for raw database responses (tables not yet in generated types)
type DbRecord = Record<string, unknown>;

// ============================================
// CONSTANTS
// ============================================

const LEARNING_CONFIG = {
  minFeedbackForLearning: 10,
  preferenceDecayDays: 30,
  skipThreshold: 3, // Skips antes de considerar "não gosta"
  modificationThreshold: 2, // Modificações antes de ajustar
  confidenceThreshold: 0.7,
};

// ============================================
// LEARNING SERVICE CLASS
// ============================================

export class LearningService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ============================================
  // FEEDBACK COLLECTION
  // ============================================

  async submitExerciseFeedback(
    exerciseCode: string,
    feedback: {
      rating: number; // 1-5
      difficulty: number; // 1-10
      enjoyment: number; // 1-5
      wouldRepeat: boolean;
      comment?: string;
      tags?: string[];
    }
  ): Promise<UserFeedback> {
    // Use type assertion since table is in migration but not in generated types
    const { data, error } = await (supabase as any)
      .from('exercise_user_feedback')
      .insert({
        user_id: this.userId,
        exercise_code: exerciseCode,
        feedback_type: 'exercise',
        rating: feedback.rating,
        difficulty_perceived: feedback.difficulty,
        enjoyment_level: feedback.enjoyment,
        would_repeat: feedback.wouldRepeat,
        comment: feedback.comment,
        tags: feedback.tags,
      })
      .select()
      .single();

    if (error) throw error;

    const record = data as DbRecord;

    // Atualizar preferências baseado no feedback
    await this.updatePreferencesFromFeedback(exerciseCode, feedback);

    return {
      id: record.id as string,
      exerciseCode: record.exercise_code as string,
      type: record.feedback_type as string,
      rating: record.rating as number,
      difficulty: record.difficulty_perceived as number,
      enjoyment: record.enjoyment_level as number,
      wouldRepeat: record.would_repeat as boolean,
      comment: record.comment as string | undefined,
      tags: record.tags as string[] | undefined,
      createdAt: new Date(record.created_at as string),
    };
  }

  async submitWorkoutFeedback(
    workoutId: string,
    feedback: {
      overallRating: number;
      energyAfter: number;
      durationSatisfaction: number;
      wouldRepeat: boolean;
      suggestions?: string;
    }
  ): Promise<void> {
    await (supabase as any).from('exercise_workout_feedback').insert({
      user_id: this.userId,
      workout_id: workoutId,
      overall_rating: feedback.overallRating,
      energy_after: feedback.energyAfter,
      duration_satisfaction: feedback.durationSatisfaction,
      would_repeat: feedback.wouldRepeat,
      suggestions: feedback.suggestions,
    });

    // Processar feedback para aprendizado
    await this.processWorkoutFeedback(workoutId, feedback);
  }

  async recordSkip(exerciseCode: string, reason?: string): Promise<void> {
    await (supabase as any).from('exercise_skip_records').insert({
      user_id: this.userId,
      exercise_code: exerciseCode,
      reason,
    });

    // Verificar se deve atualizar preferências
    const skipCount = await this.getSkipCount(exerciseCode);
    if (skipCount >= LEARNING_CONFIG.skipThreshold) {
      await this.markAsDisliked(exerciseCode);
    }
  }

  async recordModification(
    exerciseCode: string,
    modificationType: string,
    originalValue: unknown,
    newValue: unknown
  ): Promise<void> {
    await (supabase as any).from('exercise_modification_records').insert({
      user_id: this.userId,
      exercise_code: exerciseCode,
      modification_type: modificationType,
      original_value: originalValue,
      new_value: newValue,
    });

    // Aprender com modificações
    await this.learnFromModification(exerciseCode, modificationType, newValue);
  }

  // ============================================
  // PREFERENCE LEARNING
  // ============================================

  async getPreferences(): Promise<ExercisePreference[]> {
    const { data } = await (supabase as any)
      .from('exercise_user_preferences_learned')
      .select('*')
      .eq('user_id', this.userId)
      .order('confidence', { ascending: false });

    return ((data as DbRecord[]) || []).map(p => ({
      exerciseCode: p.exercise_code as string,
      muscleGroup: p.muscle_group as string | undefined,
      preferenceScore: p.preference_score as number,
      confidence: p.confidence as number,
      lastUpdated: new Date(p.updated_at as string),
      factors: p.factors as Record<string, unknown> | undefined,
    }));
  }

  async getExercisePreference(exerciseCode: string): Promise<ExercisePreference | null> {
    const { data } = await (supabase as any)
      .from('exercise_user_preferences_learned')
      .select('*')
      .eq('user_id', this.userId)
      .eq('exercise_code', exerciseCode)
      .single();

    if (!data) return null;

    const record = data as DbRecord;
    return {
      exerciseCode: record.exercise_code as string,
      muscleGroup: record.muscle_group as string | undefined,
      preferenceScore: record.preference_score as number,
      confidence: record.confidence as number,
      lastUpdated: new Date(record.updated_at as string),
      factors: record.factors as Record<string, unknown> | undefined,
    };
  }

  private async updatePreferencesFromFeedback(
    exerciseCode: string,
    feedback: {
      rating: number;
      enjoyment: number;
      wouldRepeat: boolean;
    }
  ): Promise<void> {
    // Calcular score de preferência
    const preferenceScore = this.calculatePreferenceScore(feedback);

    // Buscar preferência existente
    const existing = await this.getExercisePreference(exerciseCode);

    if (existing) {
      // Atualizar com média ponderada
      const newScore = (existing.preferenceScore * existing.confidence + preferenceScore) / 
        (existing.confidence + 1);
      const newConfidence = Math.min(1, existing.confidence + 0.1);

      await (supabase as any)
        .from('exercise_user_preferences_learned')
        .update({
          preference_score: newScore,
          confidence: newConfidence,
          factors: {
            ...existing.factors,
            lastRating: feedback.rating,
            lastEnjoyment: feedback.enjoyment,
          },
        })
        .eq('user_id', this.userId)
        .eq('exercise_code', exerciseCode);
    } else {
      // Criar nova preferência
      await (supabase as any).from('exercise_user_preferences_learned').insert({
        user_id: this.userId,
        exercise_code: exerciseCode,
        preference_score: preferenceScore,
        confidence: 0.3,
        factors: {
          initialRating: feedback.rating,
          initialEnjoyment: feedback.enjoyment,
          wouldRepeat: feedback.wouldRepeat,
        },
      });
    }
  }

  private calculatePreferenceScore(feedback: {
    rating: number;
    enjoyment: number;
    wouldRepeat: boolean;
  }): number {
    // Score de 0 a 1
    const ratingScore = (feedback.rating - 1) / 4; // 1-5 -> 0-1
    const enjoymentScore = (feedback.enjoyment - 1) / 4;
    const repeatScore = feedback.wouldRepeat ? 1 : 0;

    return ratingScore * 0.4 + enjoymentScore * 0.4 + repeatScore * 0.2;
  }

  private async getSkipCount(exerciseCode: string): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { count } = await (supabase as any)
      .from('exercise_skip_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .eq('exercise_code', exerciseCode)
      .gte('created_at', thirtyDaysAgo.toISOString());

    return count || 0;
  }

  private async markAsDisliked(exerciseCode: string): Promise<void> {
    await (supabase as any)
      .from('exercise_user_preferences_learned')
      .upsert({
        user_id: this.userId,
        exercise_code: exerciseCode,
        preference_score: 0.1,
        confidence: 0.8,
        factors: { reason: 'multiple_skips' },
      }, {
        onConflict: 'user_id,exercise_code',
      });
  }

  private async learnFromModification(
    exerciseCode: string,
    modificationType: string,
    newValue: unknown
  ): Promise<void> {
    // Buscar modificações anteriores do mesmo tipo
    const { data: modifications } = await (supabase as any)
      .from('exercise_modification_records')
      .select('new_value')
      .eq('user_id', this.userId)
      .eq('exercise_code', exerciseCode)
      .eq('modification_type', modificationType)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!modifications || modifications.length < LEARNING_CONFIG.modificationThreshold) {
      return;
    }

    // Detectar padrão (ex: sempre reduz séries)
    const pattern = this.detectModificationPattern((modifications as DbRecord[]).map(m => m.new_value));
    
    if (pattern) {
      await (supabase as any).from('exercise_learned_patterns').upsert({
        user_id: this.userId,
        exercise_code: exerciseCode,
        pattern_type: modificationType,
        pattern_value: pattern,
        confidence: 0.7,
      }, {
        onConflict: 'user_id,exercise_code,pattern_type',
      });
    }
  }

  private detectModificationPattern(values: unknown[]): unknown | null {
    if (values.length < 2) return null;

    // Verificar se todos os valores são iguais ou seguem tendência
    const numericValues = values.filter(v => typeof v === 'number') as number[];
    
    if (numericValues.length === values.length) {
      const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const variance = numericValues.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / numericValues.length;
      
      // Se variância baixa, retornar média como padrão
      if (variance < 1) {
        return Math.round(avg);
      }
    }

    return null;
  }

  private async processWorkoutFeedback(
    workoutId: string,
    feedback: {
      overallRating: number;
      energyAfter: number;
      durationSatisfaction: number;
    }
  ): Promise<void> {
    // Buscar exercícios do treino
    const { data: workout } = await (supabase as any)
      .from('exercise_workout_history')
      .select('exercises')
      .eq('id', workoutId)
      .single();

    if (!workout?.exercises) return;

    // Atualizar preferências de todos os exercícios do treino
    const exercises = workout.exercises as Array<{ code: string }>;
    
    for (const exercise of exercises) {
      const existing = await this.getExercisePreference(exercise.code);
      
      if (existing) {
        // Ajustar levemente baseado no feedback geral
        const adjustment = (feedback.overallRating - 3) * 0.05;
        const newScore = Math.max(0, Math.min(1, existing.preferenceScore + adjustment));

        await (supabase as any)
          .from('exercise_user_preferences_learned')
          .update({ preference_score: newScore })
          .eq('user_id', this.userId)
          .eq('exercise_code', exercise.code);
      }
    }
  }

  // ============================================
  // INSIGHTS & RECOMMENDATIONS
  // ============================================

  async generateInsights(): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Buscar dados para análise
    const [preferences, feedback, skips] = await Promise.all([
      this.getPreferences(),
      this.getRecentFeedback(30),
      this.getRecentSkips(30),
    ]);

    // Insight: Exercícios favoritos
    const favorites = preferences
      .filter(p => p.preferenceScore > 0.7 && p.confidence > 0.5)
      .slice(0, 5);

    if (favorites.length > 0) {
      insights.push({
        type: 'favorites',
        title: 'Seus Exercícios Favoritos',
        description: `Você demonstra preferência por: ${favorites.map(f => f.exerciseCode).join(', ')}`,
        confidence: Math.min(...favorites.map(f => f.confidence)),
        actionable: true,
        recommendation: 'Incluímos mais desses exercícios nos seus treinos.',
      });
    }

    // Insight: Exercícios evitados
    const avoided = preferences
      .filter(p => p.preferenceScore < 0.3 && p.confidence > 0.5)
      .slice(0, 3);

    if (avoided.length > 0) {
      insights.push({
        type: 'avoided',
        title: 'Exercícios que Você Evita',
        description: `Notamos que você tende a pular: ${avoided.map(a => a.exerciseCode).join(', ')}`,
        confidence: Math.min(...avoided.map(a => a.confidence)),
        actionable: true,
        recommendation: 'Podemos substituir por alternativas similares.',
      });
    }

    // Insight: Padrão de dificuldade
    const avgDifficulty = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + (f.difficulty || 5), 0) / feedback.length
      : 5;

    if (avgDifficulty > 7) {
      insights.push({
        type: 'difficulty',
        title: 'Treinos Muito Intensos',
        description: 'Seus treinos estão sendo percebidos como muito difíceis.',
        confidence: 0.7,
        actionable: true,
        recommendation: 'Considere reduzir a intensidade para melhor recuperação.',
      });
    } else if (avgDifficulty < 4) {
      insights.push({
        type: 'difficulty',
        title: 'Treinos Podem Ser Mais Desafiadores',
        description: 'Você está achando os treinos fáceis demais.',
        confidence: 0.7,
        actionable: true,
        recommendation: 'Podemos aumentar a intensidade progressivamente.',
      });
    }

    // Insight: Consistência de feedback
    if (feedback.length >= 10) {
      const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
      
      if (avgRating >= 4) {
        insights.push({
          type: 'satisfaction',
          title: 'Alta Satisfação com Treinos',
          description: `Sua avaliação média é ${avgRating.toFixed(1)}/5. Excelente!`,
          confidence: 0.8,
          actionable: false,
        });
      }
    }

    return insights;
  }

  private async getRecentFeedback(days: number): Promise<UserFeedback[]> {
    const { data } = await (supabase as any)
      .from('exercise_user_feedback')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    return ((data as DbRecord[]) || []).map(f => ({
      id: f.id as string,
      exerciseCode: f.exercise_code as string,
      type: f.feedback_type as string,
      rating: f.rating as number,
      difficulty: f.difficulty_perceived as number | undefined,
      enjoyment: f.enjoyment_level as number | undefined,
      wouldRepeat: f.would_repeat as boolean | undefined,
      comment: f.comment as string | undefined,
      tags: f.tags as string[] | undefined,
      createdAt: new Date(f.created_at as string),
    }));
  }

  private async getRecentSkips(days: number): Promise<Array<{ exerciseCode: string; reason?: string }>> {
    const { data } = await (supabase as any)
      .from('exercise_skip_records')
      .select('exercise_code, reason')
      .eq('user_id', this.userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    return ((data as DbRecord[]) || []).map(d => ({
      exerciseCode: d.exercise_code as string,
      reason: d.reason as string | undefined,
    }));
  }

  // ============================================
  // RECOMMENDATION EXPLANATIONS
  // ============================================

  async explainRecommendation(
    exerciseCode: string,
    context: 'workout' | 'alternative' | 'progression'
  ): Promise<{
    reasons: string[];
    confidence: number;
    dataPoints: number;
  }> {
    const reasons: string[] = [];
    let confidence = 0.5;
    let dataPoints = 0;

    // Buscar preferência
    const preference = await this.getExercisePreference(exerciseCode);
    if (preference) {
      dataPoints++;
      if (preference.preferenceScore > 0.6) {
        reasons.push('Você demonstrou gostar deste exercício anteriormente');
        confidence += 0.1;
      }
    }

    // Buscar feedback recente
    const { data: feedback } = await (supabase as any)
      .from('exercise_user_feedback')
      .select('rating, enjoyment_level')
      .eq('user_id', this.userId)
      .eq('exercise_code', exerciseCode)
      .order('created_at', { ascending: false })
      .limit(5);

    if (feedback && feedback.length > 0) {
      dataPoints += feedback.length;
      const feedbackRecords = feedback as DbRecord[];
      const avgRating = feedbackRecords.reduce((sum, f) => sum + (f.rating as number), 0) / feedbackRecords.length;
      if (avgRating >= 4) {
        reasons.push(`Sua avaliação média é ${avgRating.toFixed(1)}/5`);
        confidence += 0.15;
      }
    }

    // Buscar padrões aprendidos
    const { data: patterns } = await (supabase as any)
      .from('exercise_learned_patterns')
      .select('pattern_type, pattern_value')
      .eq('user_id', this.userId)
      .eq('exercise_code', exerciseCode);

    if (patterns && patterns.length > 0) {
      dataPoints += patterns.length;
      reasons.push('Ajustamos baseado nos seus padrões de modificação');
      confidence += 0.1;
    }

    // Contexto específico
    if (context === 'progression') {
      reasons.push('Este exercício se encaixa na sua progressão atual');
    } else if (context === 'alternative') {
      reasons.push('Alternativa similar ao exercício que você pulou');
    }

    if (reasons.length === 0) {
      reasons.push('Recomendação baseada no seu perfil de treino');
    }

    return {
      reasons,
      confidence: Math.min(0.95, confidence),
      dataPoints,
    };
  }

  // ============================================
  // A/B TESTING
  // ============================================

  async getActiveTests(): Promise<ABTestVariant[]> {
    const { data } = await (supabase as any)
      .from('exercise_ab_tests')
      .select(`
        *,
        user_variant:exercise_ab_test_assignments!inner(variant)
      `)
      .eq('is_active', true)
      .eq('exercise_ab_test_assignments.user_id', this.userId);

    return ((data as DbRecord[]) || []).map(t => ({
      testId: t.id as string,
      testName: t.name as string,
      variant: ((t.user_variant as DbRecord)?.variant as string) || 'control',
      startDate: new Date(t.start_date as string),
      endDate: t.end_date ? new Date(t.end_date as string) : undefined,
    }));
  }

  async recordTestInteraction(
    testId: string,
    interactionType: string,
    value?: number
  ): Promise<void> {
    await (supabase as any).from('exercise_ab_test_interactions').insert({
      test_id: testId,
      user_id: this.userId,
      interaction_type: interactionType,
      value,
    });
  }

  // ============================================
  // MODEL ACCURACY
  // ============================================

  async getModelAccuracy(): Promise<{
    overallAccuracy: number;
    predictionCount: number;
    recentTrend: 'improving' | 'stable' | 'declining';
  }> {
    const { data } = await (supabase as any)
      .from('ai_user_learning_model')
      .select('model_accuracy, total_feedback_count')
      .eq('user_id', this.userId)
      .single();

    if (!data) {
      return {
        overallAccuracy: 0.5,
        predictionCount: 0,
        recentTrend: 'stable',
      };
    }

    const record = data as DbRecord;

    // Calcular tendência baseada em feedback recente
    const recentFeedback = await this.getRecentFeedback(7);
    const acceptedCount = recentFeedback.filter(f => f.rating >= 4).length;
    const acceptanceRate = recentFeedback.length > 0 
      ? acceptedCount / recentFeedback.length 
      : 0.5;

    const modelAccuracy = record.model_accuracy as number;
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (acceptanceRate > modelAccuracy + 0.1) trend = 'improving';
    else if (acceptanceRate < modelAccuracy - 0.1) trend = 'declining';

    return {
      overallAccuracy: modelAccuracy,
      predictionCount: record.total_feedback_count as number,
      recentTrend: trend,
    };
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createLearningService(userId: string): LearningService {
  return new LearningService(userId);
}

export default LearningService;
