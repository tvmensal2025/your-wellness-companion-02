import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProgramData {
  title: string;
  subtitle: string;
  duration: string;
  frequency: string;
  time: string;
  description: string;
  level: string;
  experience?: string;
  location: string;
  goal: string;
  limitation: string;
  weekPlan: any[];
}

interface SavedProgram {
  id: string;
  user_id: string;
  modality_id?: string;
  plan_name: string;
  plan_type?: string;
  duration_weeks: number;
  workouts_per_week: number;
  current_week: number;
  current_day: number;
  status: 'active' | 'completed' | 'paused';
  plan_data: {
    description: string;
    goal: string;
    level: string;
    location: string;
    weeks: Array<{
      week: number;
      activities: string[];
      days: string;
    }>;
  };
  total_workouts: number;
  completed_workouts: number;
  completion_percentage?: number;
  total_distance_km?: number;
  total_duration_minutes?: number;
  total_calories_burned?: number;
  last_workout_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface WorkoutLog {
  id: string;
  user_id: string;
  plan_id: string;
  workout_name: string | null;
  exercises_completed: any | null;
  duration_minutes: number | null;
  calories_burned: number | null;
  notes: string | null;
  rating: number | null;
  created_at: string;
}

const parseWorkoutsPerWeek = (input: string): number => {
  const nums = (input.match(/\d+/g) || [])
    .map((n) => parseInt(n, 10))
    .filter((n) => !Number.isNaN(n));

  if (nums.length === 0) return 3;
  return nums.length === 1 ? nums[0] : nums[nums.length - 1];
};

export const useExerciseProgram = (userId: string | undefined) => {
  const [programs, setPrograms] = useState<SavedProgram[]>([]);
  const [activeProgram, setActiveProgram] = useState<SavedProgram | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar programas do usuário
  const fetchPrograms = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('sport_training_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const normalized = (data as any[] | null)?.map((p: any) => ({
        ...p,
        // Garantir compatibilidade entre colunas antigas e novas
        plan_name: p.plan_name || p.name,
        plan_data: p.plan_data || p.exercises || p.planData,
      })) || [];

      setPrograms(normalized as any);
      
      // Buscar programa ativo (status === 'active')
      const active = normalized.find((p: any) => p.status === 'active');
      setActiveProgram(active || null);
    } catch (error) {
      console.error('Erro ao buscar programas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar logs de treino do programa ativo
  const fetchWorkoutLogs = async (planId: string) => {
    if (!userId) return;

    try {
      // @ts-ignore - Ignorar erro de tipo profundo do Supabase
      const result: any = await supabase
        .from('sport_workout_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('plan_id', planId)
        .order('created_at', { ascending: false });

      if (result.error) throw result.error;

      setWorkoutLogs(result.data || []);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  // Salvar novo programa
  const saveProgram = async (programData: ProgramData) => {
    console.log('🔵 INICIANDO SALVAMENTO DO PROGRAMA:', programData.title);
    
    if (!userId) {
      console.error('❌ ERRO: Usuário não logado');
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar o programa",
        variant: "destructive"
      });
      return null;
    }

    console.log('✅ Usuário autenticado:', userId);

    try {
      console.log('📝 Pausando programas anteriores...');
      // Pausar programas anteriores
      const { error: updateError } = await supabase
        .from('sport_training_plans')
        .update({ status: 'paused' })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (updateError) {
        console.warn('⚠️ Aviso ao pausar programas anteriores:', updateError);
      } else {
        console.log('✅ Programas anteriores pausados');
      }

      // Extrair duração em semanas
      const durationWeeks = parseInt(programData.duration.split(' ')[0]) || 4;
      console.log('📊 Duração extraída:', durationWeeks, 'semanas');
      
      const frequency = parseWorkoutsPerWeek(programData.frequency);
      const totalWorkouts = durationWeeks * frequency;

      console.log('📋 Dados do programa:', {
        duration_weeks: durationWeeks,
        workouts_per_week: frequency,
        total_workouts: totalWorkouts,
        level: programData.level,
        goal: programData.goal
      });

      // Estrutura plan_data correta
      const planData = {
        description: programData.description,
        goal: programData.goal,
        level: programData.level,
        location: programData.location,
        weeks: programData.weekPlan.map((week: any) => ({
          week: week.week,
          activities: week.activities,
          days: week.days
        }))
      };

      // Criar novo programa
      console.log('💾 Inserindo novo programa no Supabase...');
      const { data, error } = await supabase
        .from('sport_training_plans')
        .insert([{
          user_id: userId,
          name: programData.title,
          sport_type: 'custom',
          difficulty: programData.level,
          duration_weeks: durationWeeks,
          workouts_per_week: frequency,
          current_week: 1,
          status: 'active',
          exercises: planData,
          total_workouts: totalWorkouts,
          completed_workouts: 0,
          goal: programData.goal
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ ERRO ao inserir programa:', error);
        throw error;
      }

      console.log('✅ PROGRAMA SALVO COM SUCESSO!', data);

      toast({
        title: "Programa Salvo! 🎉",
        description: `${programData.title} foi salvo com sucesso. Bora começar!`,
        duration: 5000
      });

      // Atualizar lista de programas
      console.log('🔄 Atualizando lista de programas...');
      await fetchPrograms();
      console.log('✅ Lista atualizada!');

      return data;
    } catch (error) {
      console.error('❌ ERRO FATAL ao salvar programa:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o programa. Verifique o console para mais detalhes.",
        variant: "destructive",
        duration: 7000
      });
      return null;
    }
  };

  // Marcar treino como completo
  const completeWorkout = async (
    planId: string,
    weekNumber: number,
    dayNumber: number,
    workoutType: string,
    exercises: any
  ) => {
    console.log('🔵 MARCANDO TREINO COMO COMPLETO:', { planId, weekNumber, dayNumber, workoutType });
    
    if (!userId) {
      console.error('❌ Usuário não logado');
      return false;
    }

    try {
      // Registrar log do treino
      console.log('💾 Inserindo log de treino no Supabase...');
      const { error: logError } = await supabase
        .from('sport_workout_logs')
        .insert({
          user_id: userId,
          plan_id: planId,
          workout_name: workoutType,
          exercises_completed: {
            ...exercises,
            week_number: weekNumber,
            day_number: dayNumber,
          },
        });

      if (logError) {
        console.error('❌ ERRO ao inserir log:', logError);
        throw logError;
      }
      
      console.log('✅ Log de treino inserido com sucesso!');

      // Atualizar contador de treinos completos
      console.log('📊 Buscando dados do programa...');
      const { data: plan } = await supabase
        .from('sport_training_plans')
        .select('completed_workouts, total_workouts, current_week, duration_weeks, workouts_per_week')
        .eq('id', planId)
        .single();

      if (plan) {
        const newCompletedWorkouts = (plan.completed_workouts || 0) + 1;
        const workoutsPerWeek = Math.min(Math.max(plan.workouts_per_week || 3, 1), 7);
        const shouldAdvanceWeek = newCompletedWorkouts % workoutsPerWeek === 0;
        const newWeek = shouldAdvanceWeek && plan.current_week < plan.duration_weeks
          ? plan.current_week + 1
          : plan.current_week;

        // Verificar se completou o programa
        const isCompleted = newCompletedWorkouts >= plan.total_workouts;

        console.log('📈 Atualizando progresso:', {
          completedWorkouts: `${plan.completed_workouts} → ${newCompletedWorkouts}`,
          currentWeek: `${plan.current_week} → ${newWeek}`,
          shouldAdvanceWeek,
          isCompleted
        });

        const { error: updateError } = await supabase
          .from('sport_training_plans')
           .update({
             completed_workouts: newCompletedWorkouts,
             current_week: newWeek,
             status: isCompleted ? 'completed' : 'active',
             completed_at: isCompleted ? new Date().toISOString() : null,
             updated_at: new Date().toISOString()
           })
          .eq('id', planId);

        if (updateError) {
          console.error('❌ ERRO ao atualizar programa:', updateError);
          throw updateError;
        }

        console.log('✅ Programa atualizado com sucesso!');

        if (isCompleted) {
          console.log('🏆 PROGRAMA CONCLUÍDO!');
          toast({
            title: "Programa Completo! 🎉🏆",
            description: "Parabéns! Você completou todo o programa!",
            duration: 7000
          });
        } else {
          console.log(`✅ Treino ${newCompletedWorkouts}/${plan.total_workouts} completo`);
          toast({
            title: "Treino Completo! ✅",
            description: `Treino marcado como completo. ${plan.total_workouts - newCompletedWorkouts} treinos restantes!`,
            duration: 5000
          });
        }
      }

      // Atualizar dados
      console.log('🔄 Atualizando lista de programas e logs...');
      await fetchPrograms();
      await fetchWorkoutLogs(planId);
      console.log('✅ Dados atualizados!');

      return true;
    } catch (error) {
      console.error('❌ ERRO FATAL ao marcar treino:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o treino como completo",
        variant: "destructive"
      });
      return false;
    }
  };

  // Pausar programa
  const pauseProgram = async (planId: string) => {
    try {
      await supabase
        .from('sport_training_plans')
        .update({ status: 'paused' })
        .eq('id', planId);

      toast({
        title: "Programa Pausado",
        description: "Você pode retomar quando quiser!"
      });

      await fetchPrograms();
    } catch (error) {
      console.error('Erro ao pausar programa:', error);
    }
  };

  // Retomar programa
  const resumeProgram = async (planId: string) => {
    try {
      // Pausar outros programas ativos
      await supabase
        .from('sport_training_plans')
        .update({ status: 'paused' })
        .eq('user_id', userId)
        .eq('status', 'active');

      // Ativar este programa
      await supabase
        .from('sport_training_plans')
        .update({ status: 'active' })
        .eq('id', planId);

      toast({
        title: "Programa Retomado! 💪",
        description: "Vamos continuar de onde paramos!"
      });

      await fetchPrograms();
    } catch (error) {
      console.error('Erro ao retomar programa:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPrograms();
    }
  }, [userId]);

  useEffect(() => {
    if (activeProgram) {
      fetchWorkoutLogs(activeProgram.id);
    }
  }, [activeProgram]);

  return {
    programs,
    activeProgram,
    workoutLogs,
    loading,
    saveProgram,
    completeWorkout,
    pauseProgram,
    resumeProgram,
    refreshPrograms: fetchPrograms
  };
};
