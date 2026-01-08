import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NutritionGoals {
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fats_g: number;
  target_fiber_g: number;
  target_water_ml: number;
}

export interface DailyNutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water_ml: number;
  meals: {
    breakfast: MealSummary | null;
    lunch: MealSummary | null;
    snack: MealSummary | null;
    dinner: MealSummary | null;
  };
}

export interface MealSummary {
  id: string;
  meal_type: string;
  total_calories: number;
  total_proteins: number;
  total_carbs: number;
  total_fats: number;
  food_items: any[];
  photo_url?: string;
  created_at: string;
}

const DEFAULT_GOALS: NutritionGoals = {
  target_calories: 2000,
  target_protein_g: 120,
  target_carbs_g: 220,
  target_fats_g: 65,
  target_fiber_g: 25,
  target_water_ml: 2000,
};

export const useDailyNutritionTracking = (date?: Date) => {
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
  const [dailySummary, setDailySummary] = useState<DailyNutritionSummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water_ml: 0,
    meals: { breakfast: null, lunch: null, snack: null, dinner: null },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDate = date || new Date();
  const dateString = targetDate.toISOString().split('T')[0];

  const loadGoals = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('nutritional_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setGoals({
          target_calories: data.target_calories || DEFAULT_GOALS.target_calories,
          target_protein_g: data.target_protein_g || DEFAULT_GOALS.target_protein_g,
          target_carbs_g: data.target_carbs_g || DEFAULT_GOALS.target_carbs_g,
          target_fats_g: data.target_fats_g || DEFAULT_GOALS.target_fats_g,
          target_fiber_g: data.target_fiber_g || DEFAULT_GOALS.target_fiber_g,
          target_water_ml: data.target_water_ml || DEFAULT_GOALS.target_water_ml,
        });
      }
    } catch (err) {
      console.error('Erro ao carregar metas:', err);
    }
  }, []);

  const loadDailySummary = useCallback(async (userId: string) => {
    try {
      // Carregar tracking do dia
      const { data: trackingData, error: trackingError } = await supabase
        .from('nutrition_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateString);

      if (trackingError) throw trackingError;

      // Organizar por tipo de refeição
      const meals: DailyNutritionSummary['meals'] = {
        breakfast: null,
        lunch: null,
        snack: null,
        dinner: null,
      };

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalFiber = 0;
      let totalWater = 0;

      if (trackingData) {
        trackingData.forEach((entry) => {
          const mealType = entry.meal_type as keyof typeof meals;
          
          if (meals[mealType] === undefined) return;

          const mealSummary: MealSummary = {
            id: entry.id,
            meal_type: entry.meal_type || '',
            total_calories: entry.total_calories || 0,
            total_proteins: entry.total_proteins || 0,
            total_carbs: entry.total_carbs || 0,
            total_fats: entry.total_fats || 0,
            food_items: Array.isArray(entry.food_items) ? entry.food_items : [],
            photo_url: entry.photo_url || undefined,
            created_at: entry.created_at || '',
          };

          // Se já existe uma refeição do tipo, soma os valores
          if (meals[mealType]) {
            meals[mealType]!.total_calories += mealSummary.total_calories;
            meals[mealType]!.total_proteins += mealSummary.total_proteins;
            meals[mealType]!.total_carbs += mealSummary.total_carbs;
            meals[mealType]!.total_fats += mealSummary.total_fats;
            meals[mealType]!.food_items.push(...mealSummary.food_items);
          } else {
            meals[mealType] = mealSummary;
          }

          totalCalories += mealSummary.total_calories;
          totalProtein += mealSummary.total_proteins;
          totalCarbs += mealSummary.total_carbs;
          totalFat += mealSummary.total_fats;
          totalWater += entry.water_ml || 0;
          totalFiber += entry.total_fiber || 0;
        });
      }

      setDailySummary({
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        fiber: totalFiber,
        water_ml: totalWater,
        meals,
      });
    } catch (err) {
      console.error('Erro ao carregar resumo diário:', err);
      setError('Erro ao carregar dados nutricionais');
    }
  }, [dateString]);

  const addWater = useCallback(async (ml: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Verificar se já existe registro de água hoje
      const { data: existing } = await supabase
        .from('nutrition_tracking')
        .select('id, water_ml')
        .eq('user_id', user.id)
        .eq('date', dateString)
        .eq('meal_type', 'water')
        .maybeSingle();

      if (existing) {
        // Atualizar
        const newWater = (existing.water_ml || 0) + ml;
        await supabase
          .from('nutrition_tracking')
          .update({ water_ml: newWater, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        // Criar novo
        await supabase
          .from('nutrition_tracking')
          .insert({
            user_id: user.id,
            date: dateString,
            meal_type: 'water',
            water_ml: ml,
            total_calories: 0,
            total_proteins: 0,
            total_carbs: 0,
            total_fats: 0,
          });
      }

      setDailySummary(prev => ({
        ...prev,
        water_ml: prev.water_ml + ml,
      }));

      toast.success(`+${ml}ml de água registrado! 💧`);
    } catch (err) {
      console.error('Erro ao adicionar água:', err);
      toast.error('Erro ao registrar água');
    }
  }, [dateString]);

  const addMeal = useCallback(async (
    mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner',
    foodItems: any[],
    macros: { calories: number; protein: number; carbs: number; fat: number; fiber?: number },
    photoUrl?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('nutrition_tracking')
        .insert({
          user_id: user.id,
          date: dateString,
          meal_type: mealType,
          food_items: foodItems,
          total_calories: macros.calories,
          total_proteins: macros.protein,
          total_carbs: macros.carbs,
          total_fats: macros.fat,
          total_fiber: macros.fiber || 0,
          photo_url: photoUrl,
        });

      if (error) throw error;

      // Recarregar dados
      await loadDailySummary(user.id);
      toast.success('Refeição registrada! 🍽️');
    } catch (err) {
      console.error('Erro ao adicionar refeição:', err);
      toast.error('Erro ao registrar refeição');
    }
  }, [dateString, loadDailySummary]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      await Promise.all([
        loadGoals(user.id),
        loadDailySummary(user.id),
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [loadGoals, loadDailySummary]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  return {
    goals,
    dailySummary,
    loading,
    error,
    addWater,
    addMeal,
    refresh,
    getProgress,
  };
};
