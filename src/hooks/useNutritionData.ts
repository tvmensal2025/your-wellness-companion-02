import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
};

export interface NutritionDataState {
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
  // Aliases for compatibility with dashboards
  caloriesConsumed: number;
  caloriesTarget: number;
  caloriesRemaining: number;
  mealsCompleted: number;
  totalMeals: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  weekProgress: { completed: number; total: number };
}

const DEFAULT_STATE: NutritionDataState = {
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  targets: DEFAULT_TARGETS,
  progress: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  mealsToday: 0,
  streak: 0,
  daysThisWeek: 0,
  todayMeals: [],
  // Aliases
  caloriesConsumed: 0,
  caloriesTarget: DEFAULT_TARGETS.calories,
  caloriesRemaining: DEFAULT_TARGETS.calories,
  mealsCompleted: 0,
  totalMeals: 4,
  protein: { current: 0, target: DEFAULT_TARGETS.protein },
  carbs: { current: 0, target: DEFAULT_TARGETS.carbs },
  fat: { current: 0, target: DEFAULT_TARGETS.fat },
  weekProgress: { completed: 0, total: 7 },
};

// food_analysis table was removed - using sofia_food_analysis instead
export function useNutritionData(userId?: string) {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;
  
  const [nutritionData, setNutritionData] = useState<NutritionDataState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveUserId) {
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
          .eq('user_id', effectiveUserId)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)
          .order('created_at', { ascending: true });

        if (todayError) throw todayError;

        // Buscar metas nutricionais do usuário
        const { data: nutritionGoals } = await supabase
          .from('user_goals')
          .select('goal_type, target_value')
          .eq('user_id', effectiveUserId)
          .in('goal_type', ['calories', 'protein', 'carbs', 'fat'])
          .eq('status', 'active');

        // Buscar dias com registro na semana
        const { data: weekData } = await supabase
          .from('sofia_food_analysis')
          .select('created_at')
          .eq('user_id', effectiveUserId)
          .gte('created_at', weekAgo)
          .order('created_at', { ascending: false });

        // Buscar streak de pontos
        const { data: pointsData } = await supabase
          .from('user_points')
          .select('current_streak')
          .eq('user_id', effectiveUserId)
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

        const mealsCount = todayMeals.length;
        const streak = pointsData?.current_streak || 0;
        const daysThisWeek = uniqueDays.size;

        setNutritionData({
          totals,
          targets,
          progress: {
            calories: Math.min(100, Math.round((totals.calories / targets.calories) * 100)),
            protein: Math.min(100, Math.round((totals.protein / targets.protein) * 100)),
            carbs: Math.min(100, Math.round((totals.carbs / targets.carbs) * 100)),
            fat: Math.min(100, Math.round((totals.fat / targets.fat) * 100)),
          },
          mealsToday: mealsCount,
          streak,
          daysThisWeek,
          todayMeals,
          // Aliases for compatibility
          caloriesConsumed: totals.calories,
          caloriesTarget: targets.calories,
          caloriesRemaining: Math.max(0, targets.calories - totals.calories),
          mealsCompleted: mealsCount,
          totalMeals: 4,
          protein: { current: totals.protein, target: targets.protein },
          carbs: { current: totals.carbs, target: targets.carbs },
          fat: { current: totals.fat, target: targets.fat },
          weekProgress: { completed: daysThisWeek, total: 7 },
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [effectiveUserId]);

  return { nutritionData, loading, error };
}

export default useNutritionData;
