// =====================================================
// USE DAILY NUTRITION TRACKING HOOK
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NutritionalGoals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  water_ml: number;
}

interface DailySummary {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  water_ml: number;
  meals_count: number;
}

const defaultGoals: NutritionalGoals = {
  calories: 2000,
  protein_g: 150,
  carbs_g: 250,
  fats_g: 65,
  fiber_g: 25,
  water_ml: 2000,
};

const emptySummary: DailySummary = {
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fats_g: 0,
  fiber_g: 0,
  water_ml: 0,
  meals_count: 0,
};

export function useDailyNutritionTracking() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<NutritionalGoals>(defaultGoals);
  const [dailySummary, setDailySummary] = useState<DailySummary>(emptySummary);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await fromTable('nutritional_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setGoals({
          calories: (data as any).calories_target || defaultGoals.calories,
          protein_g: (data as any).protein_target || defaultGoals.protein_g,
          carbs_g: (data as any).carbs_target || defaultGoals.carbs_g,
          fats_g: (data as any).fats_target || defaultGoals.fats_g,
          fiber_g: (data as any).fiber_target || defaultGoals.fiber_g,
          water_ml: (data as any).water_target || defaultGoals.water_ml,
        });
      }
    } catch (error) {
      console.error('Error fetching nutritional goals:', error);
    }
  }, [user?.id]);

  const fetchDailySummary = useCallback(async () => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch food history for today
      const { data: foodData } = await supabase
        .from('food_history')
        .select('total_calories, total_proteins, total_carbs, total_fats, total_fiber')
        .eq('user_id', user.id)
        .eq('meal_date', today)
        .is('deleted_at', null);

      // Fetch water tracking for today
      const { data: waterData } = await fromTable('water_tracking')
        .select('amount_ml')
        .eq('user_id', user.id)
        .eq('date', today);

      const meals = foodData || [];
      const water = waterData || [];

      setDailySummary({
        calories: meals.reduce((sum, m) => sum + ((m as any).total_calories || 0), 0),
        protein_g: meals.reduce((sum, m) => sum + ((m as any).total_proteins || 0), 0),
        carbs_g: meals.reduce((sum, m) => sum + ((m as any).total_carbs || 0), 0),
        fats_g: meals.reduce((sum, m) => sum + ((m as any).total_fats || 0), 0),
        fiber_g: meals.reduce((sum, m) => sum + ((m as any).total_fiber || 0), 0),
        water_ml: water.reduce((sum, w) => sum + ((w as any).amount_ml || 0), 0),
        meals_count: meals.length,
      });
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchGoals(), fetchDailySummary()]);
      setLoading(false);
    };
    load();
  }, [fetchGoals, fetchDailySummary]);

  const getProgress = (current: number, target: number): number => {
    if (target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const addWater = async (amount: number) => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      await fromTable('water_tracking').insert({
        user_id: user.id,
        date: today,
        amount_ml: amount,
        created_at: new Date().toISOString(),
      });

      setDailySummary(prev => ({
        ...prev,
        water_ml: prev.water_ml + amount,
      }));

      toast.success(`+${amount}ml de água registrado!`);
    } catch (error) {
      console.error('Error adding water:', error);
      toast.error('Erro ao registrar água');
    }
  };

  const addMeal = async (data: {
    meal_type: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    fiber_g?: number;
    foods?: string[];
  }) => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase.from('food_history').insert({
        user_id: user.id,
        meal_date: today,
        meal_type: data.meal_type,
        total_calories: data.calories,
        total_proteins: data.protein_g,
        total_carbs: data.carbs_g,
        total_fats: data.fats_g,
        total_fiber: data.fiber_g || 0,
        food_items: data.foods ? data.foods.map(f => ({ name: f })) : [],
        source: 'manual',
        created_at: new Date().toISOString(),
      });

      await fetchDailySummary();
      toast.success('Refeição registrada!');
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Erro ao registrar refeição');
    }
  };

  return {
    goals,
    dailySummary,
    loading,
    getProgress,
    addWater,
    addMeal,
    refetch: async () => {
      await Promise.all([fetchGoals(), fetchDailySummary()]);
    },
  };
}

export default useDailyNutritionTracking;
