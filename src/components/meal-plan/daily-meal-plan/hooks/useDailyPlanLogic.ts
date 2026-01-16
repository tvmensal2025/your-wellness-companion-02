import { useState, useCallback } from 'react';
import { exportPNG } from '@/lib/exporters';
import { openDetailedMealPlanHTML, convertMealieToDetailedFormat } from '@/utils/exportMealPlanDetailedHTML';
import { generateExampleMealPlan } from '@/utils/mealPlanExampleData';

interface Meal {
  title: string;
  description: string;
  preparo?: string;
  ingredients: string[];
  practicalSuggestion?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
}

interface DayPlan {
  day: number;
  dailyTotals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    snack?: Meal;
    dinner?: Meal;
    supper?: Meal;
  };
}

interface UseDailyPlanLogicProps {
  dayPlan: DayPlan;
}

interface UseDailyPlanLogicReturn {
  compactModalOpen: boolean;
  setCompactModalOpen: (open: boolean) => void;
  handleDownloadPDF: () => Promise<void>;
  handleDownloadPNG: () => Promise<void>;
  handleOpenDetailed: () => void;
  handleTestDetailed: () => void;
}

/**
 * Hook para lógica do DailyMealPlanModal
 * 
 * Gerencia:
 * - Estado do modal compacto
 * - Handlers de exportação (PDF, PNG, HTML)
 * 
 * @param props - Props contendo o dayPlan
 * @returns Objeto com estado e handlers
 */
export const useDailyPlanLogic = ({ dayPlan }: UseDailyPlanLogicProps): UseDailyPlanLogicReturn => {
  const [compactModalOpen, setCompactModalOpen] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    const { exportMealPlanToPDF } = await import('@/utils/exportMealPlanPDF');
    
    const pdfData = {
      userName: 'Usuário',
      dateLabel: `Cardápio Diário - Dia ${dayPlan.day} - ${new Date().toLocaleDateString('pt-BR')}`,
      targetCaloriesKcal: dayPlan.dailyTotals?.calories || 2000,
      guaranteed: false,
      meals: {
        breakfast: dayPlan.meals.breakfast ? {
          name: dayPlan.meals.breakfast.title,
          calories_kcal: dayPlan.meals.breakfast.macros.calories,
          ingredients: dayPlan.meals.breakfast.ingredients.map(ing => ({
            name: ing,
            quantity: 1,
            unit: 'porção'
          })),
          notes: dayPlan.meals.breakfast.description,
          homemade_measure: dayPlan.meals.breakfast.practicalSuggestion || ''
        } : undefined,
        
        lunch: dayPlan.meals.lunch ? {
          name: dayPlan.meals.lunch.title,
          calories_kcal: dayPlan.meals.lunch.macros.calories,
          ingredients: dayPlan.meals.lunch.ingredients.map(ing => ({
            name: ing,
            quantity: 1,
            unit: 'porção'
          })),
          notes: dayPlan.meals.lunch.description,
          homemade_measure: dayPlan.meals.lunch.practicalSuggestion || ''
        } : undefined,
        
        afternoon_snack: dayPlan.meals.snack ? {
          name: dayPlan.meals.snack.title,
          calories_kcal: dayPlan.meals.snack.macros.calories,
          ingredients: dayPlan.meals.snack.ingredients.map(ing => ({
            name: ing,
            quantity: 1,
            unit: 'porção'
          })),
          notes: dayPlan.meals.snack.description,
          homemade_measure: dayPlan.meals.snack.practicalSuggestion || ''
        } : undefined,
        
        dinner: dayPlan.meals.dinner ? {
          name: dayPlan.meals.dinner.title,
          calories_kcal: dayPlan.meals.dinner.macros.calories,
          ingredients: dayPlan.meals.dinner.ingredients.map(ing => ({
            name: ing,
            quantity: 1,
            unit: 'porção'
          })),
          notes: dayPlan.meals.dinner.description,
          homemade_measure: dayPlan.meals.dinner.practicalSuggestion || ''
        } : undefined,
        
        supper: dayPlan.meals.supper ? {
          name: dayPlan.meals.supper.title,
          calories_kcal: dayPlan.meals.supper.macros.calories,
          ingredients: dayPlan.meals.supper.ingredients.map(ing => ({
            name: ing,
            quantity: 1,
            unit: 'porção'
          })),
          notes: dayPlan.meals.supper.description,
          homemade_measure: dayPlan.meals.supper.practicalSuggestion || ''
        } : undefined
      }
    };
    
    await exportMealPlanToPDF(pdfData);
  }, [dayPlan]);

  const handleDownloadPNG = useCallback(async () => {
    const element = document.getElementById('daily-meal-plan-content');
    if (element) {
      await exportPNG(element, `plano-alimentar-dia-${dayPlan.day}.png`);
    }
  }, [dayPlan.day]);

  const handleOpenDetailed = useCallback(() => {
    try {
      const detailedPlan = convertMealieToDetailedFormat([dayPlan]);
      openDetailedMealPlanHTML(detailedPlan);
    } catch (error) {
      console.error('Erro ao abrir HTML detalhado:', error);
    }
  }, [dayPlan]);

  const handleTestDetailed = useCallback(() => {
    try {
      const examplePlan = generateExampleMealPlan();
      openDetailedMealPlanHTML(examplePlan);
    } catch (error) {
      console.error('Erro ao testar HTML detalhado:', error);
    }
  }, []);

  return {
    compactModalOpen,
    setCompactModalOpen,
    handleDownloadPDF,
    handleDownloadPNG,
    handleOpenDetailed,
    handleTestDetailed,
  };
};

export type { DayPlan, Meal, UseDailyPlanLogicReturn };
