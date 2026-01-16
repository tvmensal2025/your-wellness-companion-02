import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
};

interface NutritionDataState {
  totals: { calories: number; protein: number; carbs: number; fat: number };
  targets: typeof DEFAULT_TARGETS;
  progress: { calories: number; protein: number; carbs: number; fat: number };
  mealsToday: number;
  streak: number;
  daysThisWeek: number;
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

// food_analysis table was removed - using sofia_food_analysis instead
export function useNutritionData(userId: string | undefined) {
  const [nutritionData, setNutritionData] = useState<NutritionDataState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Buscar análises de hoje from sofia_food_analysis
        const { data: todayAnalyses, error: todayError } = await supabase
          .from('sofia_food_analysis')
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
          .from('sofia_food_analysis')
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
          (acc, meal) => {
            const result = meal.analysis_result as any || {};
            return {
              calories: acc.calories + (result.calorias_totais || 0),
              protein: acc.protein + (result.proteinas || 0),
              carbs: acc.carbs + (result.carboidratos || 0),
              fat: acc.fat + (result.gorduras || 0),
            };
          },
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
          (weekData || []).map((d: any) => (d.created_at || '').split('T')[0])
        );

        // Mapear refeições de hoje
        const todayMeals = (todayAnalyses || []).map((meal: any) => {
          const result = meal.analysis_result as any || {};
          return {
            id: meal.id,
            mealType: meal.meal_type || 'snack',
            calories: result.calorias_totais || 0,
            protein: result.proteinas || 0,
            carbs: result.carboidratos || 0,
            fat: result.gorduras || 0,
            time: new Date(meal.created_at || Date.now()).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        });

        setNutritionData({
          totals,
          targets,
          progress: {
            calories: Math.min(100, Math.round((totals.calories / targets.calories) * 100)),
            protein: Math.min(100, Math.round((totals.protein / targets.protein) * 100)),
            carbs: Math.min(100, Math.round((totals.carbs / targets.carbs) * 100)),
            fat: Math.min(100, Math.round((totals.fat / targets.fat) * 100)),
          },
          mealsToday: todayMeals.length,
          streak: pointsData?.current_streak || 0,
          daysThisWeek: uniqueDays.size,
          todayMeals,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { nutritionData, loading, error };
}

export default useNutritionData;
