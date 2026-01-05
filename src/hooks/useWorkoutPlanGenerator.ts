import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  SportTrainingPlan,
  WorkoutPlanGeneratorParams,
  SportModality,
  UserSportModality
} from '@/types/sport-modalities';
import { COUCH_TO_5K } from '@/data/workout-programs/couch-to-5k';

export const useWorkoutPlanGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState<SportTrainingPlan | null>(null);
  const [userModalities, setUserModalities] = useState<UserSportModality[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar modalidades do usuário
  const loadUserModalities = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_sport_modalities')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserModalities(data as any || []);
    } catch (error) {
      console.error('Erro ao carregar modalidades:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar plano ativo
  const loadActivePlan = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sport_training_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setActivePlan(data as any);
    } catch (error) {
      console.error('Erro ao carregar plano ativo:', error);
    }
  }, []);

  useEffect(() => {
    loadUserModalities();
    loadActivePlan();
  }, [loadUserModalities, loadActivePlan]);

  // Adicionar modalidade
  const addModality = async (
    modality: SportModality,
    level: string,
    goal?: string,
    targetEvent?: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      const { error } = await supabase
        .from('user_sport_modalities')
        .insert({
          user_id: user.id,
          modality,
          level,
          goal,
          target_event: targetEvent,
          is_active: true
        });

      if (error) throw error;

      toast.success('Modalidade adicionada com sucesso!');
      await loadUserModalities();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar modalidade:', error);
      toast.error('Erro ao adicionar modalidade');
      return false;
    }
  };

  // Gerar plano de treino
  const generateWorkoutPlan = async (
    params: WorkoutPlanGeneratorParams
  ): Promise<SportTrainingPlan | null> => {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return null;
      }

      const modalityRecord = userModalities.find(
        m => m.modality === params.modality && m.is_active
      );

      let planData;
      
      if (params.modality === 'running' && params.level === 'beginner') {
        planData = {
          weeks: COUCH_TO_5K.weeks,
          description: COUCH_TO_5K.description,
          prerequisites: COUCH_TO_5K.prerequisites,
          goals: [COUCH_TO_5K.target_goal]
        };
      } else {
        planData = generateBasicPlan(params);
      }

      const totalWorkouts = params.duration_weeks * params.workouts_per_week;

      const { data: newPlan, error } = await supabase
        .from('sport_training_plans')
        .insert({
          user_id: user.id,
          name: getPlanName(params),
          modality: params.modality,
          sport_type: params.modality,
          goal: params.goal,
          difficulty: params.level,
          duration_weeks: params.duration_weeks,
          workouts_per_week: params.workouts_per_week,
          current_week: 1,
          status: 'active',
          exercises: planData,
          total_workouts: totalWorkouts,
          completed_workouts: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Plano de treino gerado com sucesso! 🎉');
      setActivePlan(newPlan as any);
      
      return newPlan as any;
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      toast.error('Erro ao gerar plano de treino');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Registrar treino completado
  const logWorkout = async (
    workoutData: any
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      if (!activePlan?.id) {
        toast.error('Nenhum plano ativo para registrar o treino');
        return false;
      }

      const { error } = await supabase
        .from('sport_workout_logs')
        .insert({
          user_id: user.id,
          plan_id: activePlan.id,
          workout_name: workoutData?.workout_name || workoutData?.name || 'Treino',
          exercises_completed:
            workoutData?.exercises_completed || workoutData?.exercises || workoutData || {},
          duration_minutes: workoutData?.duration_minutes ?? null,
          calories_burned: workoutData?.calories_burned ?? null,
          notes: workoutData?.notes ?? null,
          rating: workoutData?.rating ?? null,
        });

      if (error) throw error;

      toast.success('Treino registrado! 💪');
      await loadActivePlan();
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar treino:', error);
      toast.error('Erro ao registrar treino');
      return false;
    }
  };

  // Atualizar progresso do plano
  const updatePlanProgress = async (
    planId: string,
    newWeek: number,
    newDay: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sport_training_plans')
        .update({
          current_week: newWeek,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;

      await loadActivePlan();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      return false;
    }
  };

  // Pausar plano
  const pausePlan = async (planId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sport_training_plans')
        .update({ status: 'paused' })
        .eq('id', planId);

      if (error) throw error;

      toast.success('Plano pausado');
      await loadActivePlan();
      return true;
    } catch (error) {
      console.error('Erro ao pausar plano:', error);
      toast.error('Erro ao pausar plano');
      return false;
    }
  };

  // Retomar plano
  const resumePlan = async (planId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sport_training_plans')
        .update({ status: 'active' })
        .eq('id', planId);

      if (error) throw error;

      toast.success('Plano retomado!');
      await loadActivePlan();
      return true;
    } catch (error) {
      console.error('Erro ao retomar plano:', error);
      toast.error('Erro ao retomar plano');
      return false;
    }
  };

  // Completar plano
  const completePlan = async (planId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sport_training_plans')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;

      toast.success('🎉 Parabéns! Você completou o programa! 🏆');
      await loadActivePlan();
      return true;
    } catch (error) {
      console.error('Erro ao completar plano:', error);
      toast.error('Erro ao completar plano');
      return false;
    }
  };

  return {
    isGenerating,
    activePlan,
    userModalities,
    loading,
    addModality,
    generateWorkoutPlan,
    logWorkout,
    updatePlanProgress,
    pausePlan,
    resumePlan,
    completePlan,
    loadUserModalities,
    loadActivePlan
  };
};

// Funções auxiliares

function getPlanName(params: WorkoutPlanGeneratorParams): string {
  const modalityNames: Record<SportModality, string> = {
    running: 'Corrida',
    cycling: 'Ciclismo',
    swimming: 'Natação',
    functional: 'Funcional',
    yoga: 'Yoga',
    martial_arts: 'Artes Marciais',
    trail: 'Trilha',
    team_sports: 'Esportes Coletivos',
    racquet_sports: 'Esportes de Raquete'
  };

  const levelNames = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
    elite: 'Elite'
  };

  if (params.modality === 'running' && params.level === 'beginner') {
    return 'Do Sofá aos 5K';
  }

  return `${modalityNames[params.modality]} - ${levelNames[params.level]}`;
}

function generateBasicPlan(params: WorkoutPlanGeneratorParams) {
  // Gerar plano básico para outras modalidades
  // Esta função pode ser expandida ou conectada com IA no futuro
  
  const weeks = [];
  
  for (let week = 1; week <= params.duration_weeks; week++) {
    const workouts = [];
    
    for (let day = 1; day <= params.workouts_per_week; day++) {
      workouts.push({
        day: `Treino ${day}`,
        week_day: day,
        workout_type: 'general',
        name: `Treino ${day} - Semana ${week}`,
        description: `Treino ${day} da semana ${week}`,
        structure: `${params.duration_minutes} minutos de ${params.modality}`,
        duration_minutes: params.duration_minutes,
        intensity: week <= 2 ? 'Leve' : week <= 4 ? 'Moderada' : 'Intensa',
        instructions: [
          'Aqueça bem antes de começar',
          'Mantenha a técnica correta',
          'Hidrate-se adequadamente',
          'Alongue após o treino'
        ]
      });
    }
    
    weeks.push({
      week,
      title: `Semana ${week}`,
      focus: week <= 2 ? 'Adaptação' : week <= 4 ? 'Progressão' : 'Consolidação',
      workouts
    });
  }
  
  return {
    weeks,
    description: `Programa de ${params.duration_weeks} semanas`,
    prerequisites: ['Liberação médica'],
    goals: [params.goal]
  };
}



