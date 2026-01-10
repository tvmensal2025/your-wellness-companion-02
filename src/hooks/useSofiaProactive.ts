
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProactiveInsight {
  id: string;
  type: 'correlation' | 'reminder' | 'achievement' | 'tip' | 'encouragement';
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: {
    label: string;
    route: string;
  };
}

export const useSofiaProactive = () => {
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  const analyzeUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newInsights: ProactiveInsight[] = [];

      // 1. Verificar hidratação
      const { data: waterToday } = await supabase
        .from('water_tracking')
        .select('amount_ml')
        .eq('user_id', user.id)
        .eq('date', today);

      const todayWater = waterToday?.reduce((sum, w) => sum + (w.amount_ml || 0), 0) || 0;
      const hour = new Date().getHours();

      if (hour >= 12 && todayWater < 1000) {
        newInsights.push({
          id: 'water-reminder',
          type: 'reminder',
          title: 'Hora de se hidratar! 💧',
          message: `Você bebeu apenas ${Math.round(todayWater / 250)} copos de água hoje. A meta é 8 copos!`,
          icon: '💧',
          priority: 'high',
          actionable: { label: 'Registrar água', route: '/dashboard' }
        });
      }

      // 2. Verificar sono da noite anterior
      const { data: sleepData } = await supabase
        .from('sleep_tracking')
        .select('hours_slept, sleep_quality')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (!sleepData && hour >= 10) {
        newInsights.push({
          id: 'sleep-reminder',
          type: 'reminder',
          title: 'Como foi sua noite? 😴',
          message: 'Registre suas horas de sono para eu te ajudar a melhorar seu descanso!',
          icon: '🌙',
          priority: 'medium',
          actionable: { label: 'Registrar sono', route: '/dashboard' }
        });
      }

      // 3. Correlações inteligentes
      const { data: moodData } = await supabase
        .from('mood_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', yesterday)
        .order('date', { ascending: false })
        .limit(7);

      if (moodData && moodData.length >= 3) {
        const avgEnergy = moodData.reduce((sum, m) => sum + (m.energy_level || 0), 0) / moodData.length;
        const avgStress = moodData.reduce((sum, m) => sum + (m.stress_level || 0), 0) / moodData.length;

        if (avgStress > 3.5) {
          newInsights.push({
            id: 'stress-correlation',
            type: 'correlation',
            title: 'Notei algo... 🧘',
            message: 'Seu nível de stress está elevado nos últimos dias. Que tal uma pausa para respiração?',
            icon: '🧘',
            priority: 'medium'
          });
        }

        if (avgEnergy < 3) {
          newInsights.push({
            id: 'energy-correlation',
            type: 'correlation',
            title: 'Energia baixa detectada ⚡',
            message: 'Sua energia anda baixa. Verifique se está dormindo bem e se alimentando adequadamente!',
            icon: '⚡',
            priority: 'high'
          });
        }
      }

      // 4. Verificar exercício
      const { data: exerciseData } = await supabase
        .from('exercise_tracking')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .eq('date', today);

      const todayExercise = exerciseData?.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) || 0;

      if (todayExercise === 0 && hour >= 16) {
        newInsights.push({
          id: 'exercise-reminder',
          type: 'reminder',
          title: 'Bora se movimentar? 🏃',
          message: 'Você ainda não registrou exercício hoje. Uma caminhada de 15 minutos já faz diferença!',
          icon: '🏃',
          priority: 'medium',
          actionable: { label: 'Registrar exercício', route: '/dashboard' }
        });
      }

      // 5. Conquistas pendentes
      const { data: goalsNearCompletion } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'em_progresso')
        .gte('current_value', 80); // Progresso >= 80%

      if (goalsNearCompletion && goalsNearCompletion.length > 0) {
        const goal = goalsNearCompletion[0];
        newInsights.push({
          id: 'goal-near-completion',
          type: 'encouragement',
          title: 'Você está quase lá! 🎯',
          message: `A meta "${goal.goal_title}" está ${goal.current_value}% completa. Falta pouco!`,
          icon: '🏆',
          priority: 'high',
          actionable: { label: 'Ver meta', route: '/goals' }
        });
      }

      // 6. Dica do dia baseada em dados
      const tips = [
        { condition: todayWater >= 2000, tip: 'Excelente hidratação hoje! Isso ajuda na concentração e energia. 💪' },
        { condition: sleepData?.hours_slept >= 7, tip: 'Ótimo sono! Descanso adequado melhora o metabolismo. 😊' },
        { condition: todayExercise >= 30, tip: 'Parabéns pelo exercício! Você está cuidando bem do corpo. 🌟' },
      ];

      const validTip = tips.find(t => t.condition);
      if (validTip) {
        newInsights.push({
          id: 'positive-tip',
          type: 'tip',
          title: 'Sofia observou algo bom! ✨',
          message: validTip.tip,
          icon: '✨',
          priority: 'low'
        });
      }

      // Ordenar por prioridade
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      newInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      setInsights(newInsights.slice(0, 3)); // Máximo 3 insights
      setLastCheck(new Date());
    } catch (error) {
      console.error('Erro ao analisar dados para insights:', error);
    }
  }, []);

  // Analisar ao montar e a cada 30 minutos
  useEffect(() => {
    analyzeUserData();
    const interval = setInterval(analyzeUserData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [analyzeUserData]);

  // Mostrar insight mais importante como toast
  const showTopInsight = useCallback(() => {
    if (insights.length > 0) {
      const top = insights[0];
      toast({
        title: top.title,
        description: top.message,
      });
    }
  }, [insights, toast]);

  const dismissInsight = (id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  return {
    insights,
    lastCheck,
    refreshInsights: analyzeUserData,
    showTopInsight,
    dismissInsight,
  };
};

export default useSofiaProactive;
