import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NutritionAnalysis {
  id: string;
  analysis_date: string;
  analysis_time: string;
  meal_type: string;
  food_items: Array<{ name: string; quantity: number; unit: string }>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_sodium: number;
  nutrition_summary: any;
  sofia_analysis: string;
  created_at: string;
}

// food_analysis table was removed - using sofia_food_analysis instead
export const useNutritionHistory = () => {
  const [analyses, setAnalyses] = useState<NutritionAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapRecord = (record: any): NutritionAnalysis => {
    const result = record.analysis_result as any || {};
    return {
      id: record.id,
      analysis_date: (record.created_at || '').split('T')[0] || '',
      analysis_time: (record.created_at || '').split('T')[1]?.substring(0, 5) || '',
      meal_type: record.meal_type || '',
      food_items: Array.isArray(result.alimentos) 
        ? result.alimentos.map((item: any) => typeof item === 'string' 
            ? { name: item, quantity: 0, unit: 'g' } 
            : item)
        : [],
      total_calories: result.calorias_totais || 0,
      total_protein: result.proteinas || 0,
      total_carbs: result.carboidratos || 0,
      total_fat: result.gorduras || 0,
      total_fiber: result.fibras || 0,
      total_sodium: result.sodio || 0,
      nutrition_summary: result,
      sofia_analysis: result.mensagem || '',
      created_at: record.created_at
    };
  };

  const fetchAnalyses = async (limit = 20) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('sofia_food_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const mappedData = (data || []).map(mapRecord);
      setAnalyses(mappedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysesByDate = async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('sofia_food_analysis')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(mapRecord);
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sofia_food_analysis')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnalyses(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // Get daily totals for a specific date
  const getDailyTotals = (date: string) => {
    const dayAnalyses = analyses.filter(a => a.analysis_date === date);
    return dayAnalyses.reduce((acc, a) => ({
      calories: acc.calories + (a.total_calories || 0),
      protein: acc.protein + (a.total_protein || 0),
      carbs: acc.carbs + (a.total_carbs || 0),
      fat: acc.fat + (a.total_fat || 0),
      fiber: acc.fiber + (a.total_fiber || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  return {
    analyses,
    loading,
    error,
    fetchAnalyses,
    getAnalysesByDate,
    deleteAnalysis,
    getDailyTotals
  };
};

export default useNutritionHistory;
