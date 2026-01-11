import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, ChefHat, Zap, Clock, Utensils, Apple } from 'lucide-react';
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

        {/* Tab Nutrição */}
        <TabsContent value="tracker" className="space-y-4 mt-4">
          <SmartSupplementsSection maxProducts={4} showTitle={true} />

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Resumo diário */}
            <Card className="bg-card shadow-sm border">
              <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Target className="w-4 h-4 text-emerald-600" />
                  Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span>Calorias</span>
                    <span className="font-semibold">
                      {currentNutrition.totalCalories.toFixed(0)}/{goals.calories}
                    </span>
                  </div>
                  <Progress value={currentNutrition.totalCalories / goals.calories * 100} className="h-2" />
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-orange-600">{currentNutrition.totalProtein.toFixed(0)}g</div>
                      <div className="text-muted-foreground">Proteína</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{currentNutrition.totalCarbs.toFixed(0)}g</div>
                      <div className="text-muted-foreground">Carbos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{currentNutrition.totalFat.toFixed(0)}g</div>
                      <div className="text-muted-foreground">Gordura</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas semanais */}
            <Card className="bg-card shadow-sm border">
              <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Semana
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span>Média calorias</span>
                    <span className="font-semibold">{stats.averageCalories.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dias registrados</span>
                    <span className="font-semibold">7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aderência</span>
                    <span className="font-semibold text-emerald-600">
                      {(stats.averageCalories / goals.calories * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
