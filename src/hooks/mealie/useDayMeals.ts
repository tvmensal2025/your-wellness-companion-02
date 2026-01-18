/**
 * @file useDayMeals Hook
 * @description Hook para buscar refeições de um dia específico
 * 
 * Funcionalidade:
 * - Busca todas as refeições de uma data específica
 * - Agrupa por tipo de refeição (café, almoço, lanche, jantar)
 * - Calcula totais de calorias e macros
 * - Compara com metas do usuário
 */

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DayMeals, MealItem } from '@/types/mealie';

interface UseDayMealsReturn {
  dayMeals: DayMeals | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDayMeals(date: Date, userId?: string): UseDayMealsReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [targetCalories, setTargetCalories] = useState(2000);

  const fetchDayMeals = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dateStr = date.toISOString().split('T')[0];

      // Buscar refeições do dia
      const { data: mealsData, error: mealsError } = await supabase
        .from('sofia_food_analysis')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`)
        .order('created_at', { ascending: true });

      if (mealsError) throw mealsError;

      // Buscar meta de calorias do usuário
      // NOTA: tabela nutritional_goals não tem coluna 'status', removido filtro
      const { data: goalsData } = await supabase
        .from('nutritional_goals')
        .select('target_calories')
        .eq('user_id', userId)
        .maybeSingle();

      const targetCal = (goalsData as any)?.target_calories;
      if (targetCal && typeof targetCal === 'number') {
        setTargetCalories(targetCal);
      }

      // Formatar refeições
      const formattedMeals: MealItem[] = (mealsData || []).map((meal: any) => {
        // Extrair nome dos alimentos
        let foodNames: string[] = [];
        if (Array.isArray(meal.foods_detected)) {
          foodNames = meal.foods_detected.map((f: any) => 
            typeof f === 'string' ? f : f.nome || f.name || 'Alimento'
          );
        }

        return {
          id: meal.id,
          name: foodNames.join(', ') || 'Refeição',
          time: new Date(meal.created_at).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          calories: meal.total_calories || 0,
          protein_g: meal.total_protein || 0,
          carbs_g: meal.total_carbs || 0,
          fat_g: meal.total_fat || 0,
          image_url: meal.image_url,
        };
      });

      setMeals(formattedMeals);
    } catch (err) {
      console.error('Erro ao buscar refeições do dia:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayMeals();
  }, [date, userId]);

  const dayMeals: DayMeals | null = useMemo(() => {
    if (meals.length === 0) return null;

    // Agrupar refeições por tipo
    const breakfast: MealItem[] = [];
    const lunch: MealItem[] = [];
    const snack: MealItem[] = [];
    const dinner: MealItem[] = [];

    meals.forEach((meal) => {
      const hour = parseInt(meal.time.split(':')[0]);
      
      // Classificar por horário se não tiver meal_type
      if (hour >= 6 && hour < 10) {
        breakfast.push(meal);
      } else if (hour >= 11 && hour < 14) {
        lunch.push(meal);
      } else if (hour >= 15 && hour < 17) {
        snack.push(meal);
      } else {
        dinner.push(meal);
      }
    });

    // Calcular totais
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

    // Determinar status
    const mealsCount = meals.length;
    let status: DayMeals['status'] = 'empty';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mealDate = new Date(date);
    mealDate.setHours(0, 0, 0, 0);
    
    if (mealDate.getTime() === today.getTime()) {
      status = 'today';
    } else if (mealsCount >= 4) {
      status = 'complete';
    } else if (mealsCount > 0) {
      status = 'partial';
    }

    return {
      date,
      breakfast,
      lunch,
      snack,
      dinner,
      totalCalories,
      targetCalories,
      status,
    };
  }, [meals, date, targetCalories]);

  return {
    dayMeals,
    loading,
    error,
    refetch: fetchDayMeals,
  };
}
