/**
 * @file useWeeklyPlan Hook
 * @description Hook para buscar e processar dados do plano semanal de refeições
 * 
 * Funcionalidade:
 * - Busca refeições dos últimos 7 dias
 * - Calcula status de cada dia (completo, parcial, vazio)
 * - Identifica o dia atual
 * - Retorna array de 7 dias com indicadores visuais
 */

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { WeekDay, WeeklyPlan } from '@/types/mealie';

interface UseWeeklyPlanReturn {
  weeklyPlan: WeeklyPlan | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWeeklyPlan(userId?: string): UseWeeklyPlanReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekData, setWeekData] = useState<WeekDay[]>([]);

  // Calcular início e fim da semana (domingo a sábado)
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = domingo, 6 = sábado
    
    // Início da semana (domingo)
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    
    // Fim da semana (sábado)
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { startDate: start, endDate: end };
  }, []);

  const fetchWeekData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const days: WeekDay[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buscar dados para cada dia da semana
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
        const dayNumber = date.getDate();

        // Buscar refeições do dia
        const { data: meals, error: mealsError } = await supabase
          .from('sofia_food_analysis')
          .select('total_calories, meal_type')
          .eq('user_id', userId)
          .gte('created_at', `${dateStr}T00:00:00`)
          .lte('created_at', `${dateStr}T23:59:59`);

        if (mealsError) {
          console.error(`Erro ao buscar refeições de ${dateStr}:`, mealsError);
          continue;
        }

        // Calcular totais
        const mealsCount = meals?.length || 0;
        const totalCalories = meals?.reduce((sum, m) => sum + (m.total_calories || 0), 0) || 0;

        // Determinar status do dia
        let status: WeekDay['status'] = 'empty';
        
        // Verificar se é hoje
        const isToday = date.toDateString() === today.toDateString();
        if (isToday) {
          status = 'today';
        } else if (mealsCount >= 4) {
          status = 'complete';
        } else if (mealsCount > 0) {
          status = 'partial';
        }

        days.push({
          date,
          dayOfWeek,
          dayNumber,
          mealsCount,
          calories: totalCalories,
          status,
        });
      }

      setWeekData(days);
    } catch (err) {
      console.error('Erro ao buscar dados semanais:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekData();
  }, [userId, startDate, endDate]);

  const weeklyPlan: WeeklyPlan | null = useMemo(() => {
    if (weekData.length === 0) return null;

    const completedDays = weekData.filter(d => d.status === 'complete').length;

    return {
      startDate,
      endDate,
      days: weekData,
      completedDays,
      totalDays: 7,
    };
  }, [weekData, startDate, endDate]);

  return {
    weeklyPlan,
    loading,
    error,
    refetch: fetchWeekData,
  };
}
