import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

export const useWeeklyGoalProgress = () => {
  return useQuery({
    queryKey: ['weekly-goal-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const previousWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      const previousWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

      // Buscar metas ativas do usuário
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['aprovada', 'em_progresso', 'ativo']);

      if (goalsError) throw goalsError;

      // Buscar pesagens da semana atual e anterior
      const { data: measurements, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .gte('measurement_date', previousWeekStart.toISOString().split('T')[0])
        .lte('measurement_date', weekEnd.toISOString().split('T')[0])
        .order('measurement_date', { ascending: false });

      if (measurementsError) throw measurementsError;

      // Buscar dados do Google Fit se disponível
      const { data: fitData } = await supabase
        .from('google_fit_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      // fitData pode ser null se tabela não existir ainda

      // Calcular progresso do peso
      const currentWeekMeasurements = measurements?.filter(m => 
        new Date(m.measurement_date) >= weekStart && new Date(m.measurement_date) <= weekEnd
      ) || [];
      
      const previousWeekMeasurements = measurements?.filter(m => 
        new Date(m.measurement_date) >= previousWeekStart && new Date(m.measurement_date) <= previousWeekEnd
      ) || [];

      const currentWeight = currentWeekMeasurements[0]?.peso_kg || 0;
      const previousWeight = previousWeekMeasurements[0]?.peso_kg || currentWeight;
      const weightChange = currentWeight - previousWeight;

      // Encontrar meta de peso
      const weightGoal = goals?.find(g => g.target_value && (g as any).category === 'peso') || null;
      const targetWeight = weightGoal?.target_value || currentWeight;

      // Calcular progresso de exercícios real baseado em treinos completados
      const { data: workoutData } = await supabase
        .from('workout_history')
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', weekStart.toISOString())
        .lte('completed_at', weekEnd.toISOString());
      
      // Contar dias únicos de treino
      const uniqueWorkoutDays = new Set(
        workoutData?.map(w => w.completed_at?.split('T')[0]).filter(Boolean) || []
      ).size;
      
      const exerciseDays = uniqueWorkoutDays;
      const exerciseTarget = 7; // Meta padrão de 7 dias por semana

      // Buscar hidratação real do advanced_daily_tracking
      const { data: trackingData } = await supabase
        .from('advanced_daily_tracking')
        .select('water_ml')
        .eq('user_id', user.id)
        .gte('tracking_date', weekStart.toISOString().split('T')[0])
        .lte('tracking_date', weekEnd.toISOString().split('T')[0]);
      
      // Calcular média de hidratação (meta: 2000ml = 100%)
      const avgWaterMl = trackingData?.length 
        ? trackingData.reduce((sum, t) => sum + (t.water_ml || 0), 0) / trackingData.length
        : 0;
      const hydrationProgress = Math.min(100, Math.round((avgWaterMl / 2000) * 100));

      // Calcular progresso geral baseado nas metas
      let overallProgress = 0;
      let progressCount = 0;

      // Progresso do peso (se tem meta)
      if (weightGoal) {
        const weightProgressPercent = Math.max(0, Math.min(100, 
          100 - (Math.abs(currentWeight - targetWeight) / targetWeight * 100)
        ));
        overallProgress += weightProgressPercent;
        progressCount++;
      }

      // Progresso de exercícios
      const exerciseProgressPercent = (exerciseDays / exerciseTarget) * 100;
      overallProgress += exerciseProgressPercent;
      progressCount++;

      // Progresso de hidratação
      overallProgress += hydrationProgress;
      progressCount++;

      const finalProgress = progressCount > 0 ? overallProgress / progressCount : 0;

      // Determinar tendência
      let trend: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (finalProgress >= 70 && weightChange <= 0 && exerciseProgressPercent >= 60) {
        trend = 'positive';
      } else if (finalProgress < 50 || weightChange > 1) {
        trend = 'negative';
      }

      return {
        weightProgress: {
          current: currentWeight,
          target: targetWeight,
          change: weightChange,
          unit: 'kg'
        },
        exerciseProgress: {
          completed: exerciseDays,
          target: exerciseTarget,
          unit: 'dias'
        },
        hydrationProgress: {
          current: hydrationProgress,
          target: 100,
          unit: '%'
        },
        overallProgress: finalProgress,
        trend,
        goals: goals || [],
        hasActiveGoals: (goals?.length || 0) > 0
      };
    },
    refetchInterval: 1000 * 60 * 15, // Atualizar a cada 15 minutos
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};