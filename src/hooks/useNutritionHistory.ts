
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  state?: string;
}

// Interface que mapeia para o schema real da tabela food_analysis
interface FoodAnalysisRecord {
  id: string;
  created_at: string;
  user_id: string;
  meal_type: string | null;
  food_items: string[] | null;
  image_url: string | null;
  total_calories: number | null;
  total_proteins: number | null;
  total_carbs: number | null;
  total_fats: number | null;
  nutrition_analysis: any;
  recommendations: string | null;
  health_rating: number | null;
}

interface NutritionAnalysis {
  id: string;
  analysis_date: string;
  analysis_time: string;
  meal_type: string;
  food_items: FoodItem[];
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

export const useNutritionHistory = () => {
  const [analyses, setAnalyses] = useState<NutritionAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = async (limit = 20) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('food_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Mapear dados do banco para a interface NutritionAnalysis
      const mappedData: NutritionAnalysis[] = (data || []).map((record: FoodAnalysisRecord) => ({
        id: record.id,
        analysis_date: record.created_at?.split('T')[0] || '',
        analysis_time: record.created_at?.split('T')[1]?.substring(0, 5) || '',
        meal_type: record.meal_type || '',
        food_items: Array.isArray(record.food_items) 
          ? record.food_items.map(item => typeof item === 'string' 
              ? { name: item, quantity: 0, unit: 'g' } 
              : item)
          : [],
        total_calories: record.total_calories || 0,
        total_protein: record.total_proteins || 0,
        total_carbs: record.total_carbs || 0,
        total_fat: record.total_fats || 0,
        total_fiber: 0,
        total_sodium: 0,
        nutrition_summary: record.nutrition_analysis,
        sofia_analysis: record.recommendations || '',
        created_at: record.created_at
      }));

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
        .from('food_analysis')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear dados do banco para a interface NutritionAnalysis
      const mappedData: NutritionAnalysis[] = (data || []).map((record: FoodAnalysisRecord) => ({
        id: record.id,
        analysis_date: record.created_at?.split('T')[0] || '',
        analysis_time: record.created_at?.split('T')[1]?.substring(0, 5) || '',
        meal_type: record.meal_type || '',
        food_items: Array.isArray(record.food_items) 
          ? record.food_items.map(item => typeof item === 'string' 
              ? { name: item, quantity: 0, unit: 'g' } 
              : item)
          : [],
        total_calories: record.total_calories || 0,
        total_protein: record.total_proteins || 0,
        total_carbs: record.total_carbs || 0,
        total_fat: record.total_fats || 0,
        total_fiber: 0,
        total_sodium: 0,
        nutrition_summary: record.nutrition_analysis,
        sofia_analysis: record.recommendations || '',
        created_at: record.created_at
      }));

      return mappedData;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getDailyTotals = (date: string) => {
    const dayAnalyses = analyses.filter(a => a.analysis_date === date);
    
    return dayAnalyses.reduce((totals, analysis) => ({
      calories: totals.calories + analysis.total_calories,
      protein: totals.protein + analysis.total_protein,
      carbs: totals.carbs + analysis.total_carbs,
      fat: totals.fat + analysis.total_fat,
      fiber: totals.fiber + analysis.total_fiber,
      sodium: totals.sodium + analysis.total_sodium
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0
    });
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_analysis')
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

  useEffect(() => {
    fetchAnalyses();
  }, []);

  return {
    analyses,
    loading,
    error,
    fetchAnalyses,
    getAnalysesByDate,
    getDailyTotals,
    deleteAnalysis
  };
};