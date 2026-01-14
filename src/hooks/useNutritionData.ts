/**
 * useNutritionData Hook
 * Busca dados nutricionais reais do Supabase para o dashboard da Sofia
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserDataCache } from './useUserDataCache';

interface NutritionData {
  caloriesConsumed: number;
  caloriesTarget: number;
  caloriesRemaining: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  streak: number;
  mealsCompleted: number;
  totalMeals: number;
  weekProgress: { completed: number; total: number };
  todayMeals: Array<{
    id: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    time: string;
  }>;
}

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 100,
  carbs: 250,
  fat: 65,
};

export function useNutritionData() {
  const { data: userData } = useUserDataCache();
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    caloriesConsumed: 0,
    caloriesTarget: DEFAULT_TARGETS.calories,
    caloriesRemaining: DEFAULT_TARGETS.calories,
    protein: { current: 0, target: DEFAULT_TARGETS.protein },
    carbs: { current: 0, target: DEFAULT_TARGETS.carbs },
    fat: { current: 0, target: DEFAULT_TARGETS.fat },
    streak: 0,
    mealsCompleted: 0,
    totalMeals: 4,
    weekProgress: { completed: 0, total: 7 },
    todayMeals: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNutritionData = useCallback(async () => {
    const userId = userData.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Buscar análises de hoje
      const { data: todayAnalyses, error: todayError } = await supabase
        .from('food_analysis')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: true });

      if (todayError) throw todayError;

      // Buscar metas nutricionais do usuário
      const { data: nutritionGoals } = await supabase
        .from('user_goals')
        .select('goal_type, target_value')
        .eq('user_id', userId)
        .in('goal_type', ['calories', 'protein', 'carbs', 'fat'])
        .eq('status', 'active');

      // Buscar dias com registro na semana
      const { data: weekData } = await supabase
        .from('food_analysis')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', weekAgo)
        .order('created_at', { ascending: false });

      // Buscar streak de pontos
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

      // Calcular totais do dia
      const totals = (todayAnalyses || []).reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.total_calories || 0),
          protein: acc.protein + (meal.total_proteins || 0),
          carbs: acc.carbs + (meal.total_carbs || 0),
          fat: acc.fat + (meal.total_fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Processar metas
      const targets = { ...DEFAULT_TARGETS };
      (nutritionGoals || []).forEach((goal) => {
        if (goal.goal_type === 'calories') targets.calories = goal.target_value;
        if (goal.goal_type === 'protein') targets.protein = goal.target_value;
        if (goal.goal_type === 'carbs') targets.carbs = goal.target_value;
        if (goal.goal_type === 'fat') targets.fat = goal.target_value;
      });

      // Calcular dias únicos com registro na semana
      const uniqueDays = new Set(
        (weekData || []).map((d) => d.created_at.split('T')[0])
      );

      // Mapear refeições de hoje
      const todayMeals = (todayAnalyses || []).map((meal) => ({
        id: meal.id,
        mealType: meal.meal_type || 'snack',
        calories: meal.total_calories || 0,
        protein: meal.total_proteins || 0,
        carbs: meal.total_carbs || 0,
        fat: meal.total_fats || 0,
        time: new Date(meal.created_at).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));

      // Contar refeições por tipo
      const mealTypes = new Set(todayMeals.map((m) => m.mealType));

      setNutritionData({
        caloriesConsumed: Math.round(totals.calories),
        caloriesTarget: targets.calories,
        caloriesRemaining: Math.max(0, targets.calories - totals.calories),
        protein: { current: Math.round(totals.protein), target: targets.protein },
        carbs: { current: Math.round(totals.carbs), target: targets.carbs },
        fat: { current: Math.round(totals.fat), target: targets.fat },
        streak: pointsData?.current_streak || 0,
        mealsCompleted: mealTypes.size,
        totalMeals: 4,
        weekProgress: { completed: uniqueDays.size, total: 7 },
        todayMeals,
      });
    } catch (err: any) {
      console.error('Error fetching nutrition data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userData.user?.id]);

  useEffect(() => {
    fetchNutritionData();
  }, [fetchNutritionData]);

  return { nutritionData, loading, error, refresh: fetchNutritionData };
}

export default useNutritionData;
