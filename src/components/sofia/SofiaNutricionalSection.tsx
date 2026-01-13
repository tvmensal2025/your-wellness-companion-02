import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChefHat, Utensils, Apple } from 'lucide-react';
import { MealPlanGeneratorModalV2 } from '@/components/nutrition-tracking/MealPlanGeneratorModalV2';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';

import { MealPlanHistoryModal } from '@/components/meal-plan/MealPlanHistoryModal';
import { MealPlanSuccessEffect } from '@/components/meal-plan/MealPlanSuccessEffect';
import { ChefKitchenMealPlan } from '@/components/meal-plan/ChefKitchenMealPlan';

import { useMealPlanGeneratorV2 } from '@/hooks/useMealPlanGeneratorV2';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { SmartSupplementsSection } from '@/components/sofia/SmartSupplementsSection';
import { SofiaNutricionalRedesigned } from '@/components/sofia/SofiaNutricionalRedesigned';
import { SectionLoader } from '@/components/ui/animated-loader';

interface SofiaNutricionalSectionProps {
  /** Se true, não renderiza o header (para uso dentro do dashboard) */
  embedded?: boolean;
}

export const SofiaNutricionalSection: React.FC<SofiaNutricionalSectionProps> = ({ embedded = false }) => {
  const {
    meals,
    goals,
    loading,
    error,
    getDailyNutrition,
    getNutritionStats,
    updateGoals
  } = useNutritionTracking();
  
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const {
    showSuccessEffect,
    setShowSuccessEffect,
    generatedPlan
  } = useMealPlanGeneratorV2();
  
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('meudia');
  const [showMealPlanGenerator, setShowMealPlanGenerator] = useState(false);

  const [selectedMeals, setSelectedMeals] = useState({
    'café da manhã': true,
    'almoço': true,
    'lanche': true,
    'jantar': true,
    'ceia': false
  });

  const toggleMealSelection = (mealType: string) => {
    setSelectedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType as keyof typeof prev]
    }));
  };

  useEffect(() => {
    const getUser = async () => {
      setUserLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[SofiaNutricionalSection] User loaded:', user?.id);
      setUser(user);
      setUserLoading(false);
    };
    getUser();
  }, []);

  const handleGenerateMealPlan = () => {
    const hasSelectedMeals = Object.values(selectedMeals).some(selected => selected);
    if (!hasSelectedMeals) {
      alert('Selecione pelo menos uma refeição para gerar o cardápio.');
      return;
    }
    setShowMealPlanGenerator(true);
  };

  const currentNutrition = getDailyNutrition(selectedDate);
  const stats = getNutritionStats();

  if (loading || userLoading) {
    return <SectionLoader text="Carregando nutrição..." />;
  }

  return (
    <div className="space-y-4">
      {/* Header - apenas quando NÃO está embedded */}
      {!embedded && (
        <div className="space-y-1 px-1">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
            Sofia Nutricional
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Seu assistente inteligente para nutrição
          </p>
        </div>
      )}

      {/* Tabs principais - 3 tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 gap-1 bg-muted/50 p-1.5 rounded-xl">
          <TabsTrigger 
            value="meudia" 
            className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2.5 sm:py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-600 font-medium"
          >
            <Apple className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Meu Dia</span>
            <span className="sm:hidden">Dia</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tracker" 
            className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2.5 sm:py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-600 font-medium"
          >
            <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Nutrição</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger 
            value="generator" 
            className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2.5 sm:py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-600 font-medium"
          >
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Cardápios</span>
            <span className="sm:hidden">Menu</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Meu Dia - Novo Design com Metabolismo Personalizado */}
        <TabsContent value="meudia" className="space-y-4 mt-4">
          <SofiaNutricionalRedesigned userId={user?.id} />
        </TabsContent>

        {/* Tab Nutrição - Apenas Suplementos */}
        <TabsContent value="tracker" className="space-y-4 mt-4">
          <SmartSupplementsSection maxProducts={4} showTitle={true} />
        </TabsContent>

        {/* Tab Cardápios - PREMIUM */}
        <TabsContent value="generator" className="mt-4">
          <ChefKitchenMealPlan />
        </TabsContent>

      </Tabs>

      {/* Modal do Gerador (mantido para compatibilidade) */}
      <MealPlanGeneratorModalV2 
        open={showMealPlanGenerator} 
        onOpenChange={setShowMealPlanGenerator} 
        selectedMeals={selectedMeals} 
      />

      {/* Success Effect */}
      <MealPlanSuccessEffect 
        isVisible={showSuccessEffect} 
        onClose={() => {
          setShowSuccessEffect(false);
          setActiveTab('generator');
        }} 
        mealPlanData={generatedPlan.length > 0 ? {
          type: generatedPlan.length > 1 ? 'weekly' : 'daily',
          title: `Cardápio ${generatedPlan.length > 1 ? 'Semanal' : 'Diário'} - ${new Date().toLocaleDateString('pt-BR')}`,
          summary: {
            calories: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.calories, 0) / generatedPlan.length),
            protein: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.protein, 0) / generatedPlan.length),
            carbs: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.carbs, 0) / generatedPlan.length),
            fat: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.fat, 0) / generatedPlan.length),
            fiber: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.fiber, 0) / generatedPlan.length)
          }
        } : undefined} 
      />
    </div>
  );
};
