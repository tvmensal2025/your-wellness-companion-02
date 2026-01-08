import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, ChefHat, Zap, Clock, Utensils, Apple, Plus, Droplets, Coffee, UtensilsCrossed, Cookie, Moon } from 'lucide-react';
import { MealPlanGeneratorModalV2 } from '@/components/nutrition-tracking/MealPlanGeneratorModalV2';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';

import { MealPlanHistoryModal } from '@/components/meal-plan/MealPlanHistoryModal';
import { MealPlanSuccessEffect } from '@/components/meal-plan/MealPlanSuccessEffect';

import { useMealPlanGeneratorV2 } from '@/hooks/useMealPlanGeneratorV2';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { PersonalizedSupplementsCard } from '@/components/sofia/PersonalizedSupplementsCard';
import { useDailyNutritionTracking } from '@/hooks/useDailyNutritionTracking';

interface SofiaNutricionalSectionProps {
  /** Se true, não renderiza o header (para uso dentro do dashboard) */
  embedded?: boolean;
}

// Componente Meu Dia - Diário alimentar compacto
const MeuDiaContent: React.FC<{ goals: { calories: number; protein: number; carbs: number; fat: number } }> = ({ goals }) => {
  const { dailySummary, loading, addWater, goals: nutritionGoals } = useDailyNutritionTracking();

  const mealTypes = [
    { key: 'cafe_da_manha', label: 'Café da Manhã', icon: Coffee, time: '07:00' },
    { key: 'almoco', label: 'Almoço', icon: UtensilsCrossed, time: '12:00' },
    { key: 'lanche', label: 'Lanche', icon: Cookie, time: '16:00' },
    { key: 'jantar', label: 'Jantar', icon: Moon, time: '19:00' },
  ];

  const caloriesConsumed = dailySummary?.calories || 0;
  const proteinConsumed = dailySummary?.protein || 0;
  const carbsConsumed = dailySummary?.carbs || 0;
  const fatConsumed = dailySummary?.fat || 0;
  const waterMl = dailySummary?.water_ml || 0;

  const targetCalories = nutritionGoals?.target_calories || goals.calories;
  const calorieProgress = Math.min((caloriesConsumed / targetCalories) * 100, 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progresso de Calorias */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Calorias Hoje</span>
            <span className="text-lg font-bold text-emerald-600">
              {caloriesConsumed.toFixed(0)} / {targetCalories}
            </span>
          </div>
          <Progress value={calorieProgress} className="h-3 bg-emerald-100 dark:bg-emerald-900" />
          
          {/* Macros */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 bg-white/60 dark:bg-black/20 rounded-lg">
              <div className="text-sm font-bold text-orange-600">{proteinConsumed.toFixed(0)}g</div>
              <div className="text-xs text-muted-foreground">Proteína</div>
            </div>
            <div className="text-center p-2 bg-white/60 dark:bg-black/20 rounded-lg">
              <div className="text-sm font-bold text-blue-600">{carbsConsumed.toFixed(0)}g</div>
              <div className="text-xs text-muted-foreground">Carbos</div>
            </div>
            <div className="text-center p-2 bg-white/60 dark:bg-black/20 rounded-lg">
              <div className="text-sm font-bold text-yellow-600">{fatConsumed.toFixed(0)}g</div>
              <div className="text-xs text-muted-foreground">Gordura</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refeições do Dia */}
      <Card className="bg-card border">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Apple className="w-4 h-4 text-emerald-600" />
            Refeições de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-2">
            {mealTypes.map((meal) => {
              const Icon = meal.icon;
              return (
                <div
                  key={meal.key}
                  className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{meal.label}</p>
                      <p className="text-xs text-muted-foreground">{meal.time}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground italic">
                    Converse com Sofia para registrar
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3">
            💬 Diga à Sofia o que você comeu e ela registra automaticamente!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

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
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
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

        {/* Tab Meu Dia - Diário Alimentar */}
        <TabsContent value="meudia" className="space-y-4 mt-4">
          <MeuDiaContent goals={goals} />
        </TabsContent>

        {/* Tab Nutrição */}
        <TabsContent value="tracker" className="space-y-4 mt-4">
          <PersonalizedSupplementsCard />

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

        {/* Tab Cardápios */}
        <TabsContent value="generator" className="space-y-4 mt-4">
          <Card className="bg-card shadow-sm border">
            <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <ChefHat className="w-4 h-4 text-emerald-600" />
                Gerador de Cardápios IA
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Crie cardápios personalizados baseados nas suas metas.
                </p>
                
                {/* Seleção de Refeições - grid responsivo */}
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground">Refeições:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(selectedMeals).map(([meal, selected]) => (
                      <div
                        key={meal}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all text-xs ${
                          selected 
                            ? 'bg-emerald-50 border border-emerald-200' 
                            : 'bg-muted/50 border border-transparent hover:bg-muted'
                        }`}
                        onClick={() => toggleMealSelection(meal)}
                      >
                        <div className={`w-3 h-3 rounded-full ${selected ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}>
                          {selected && <div className="w-full h-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>}
                        </div>
                        <span className={`capitalize truncate ${selected ? 'text-emerald-700 font-medium' : 'text-muted-foreground'}`}>
                          {meal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateMealPlan} 
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Gerar Cardápio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Cardápios */}
          <Card className="bg-card shadow-sm border">
            <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Clock className="w-4 h-4 text-emerald-600" />
                Cardápios Salvos
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <MealPlanHistoryModal />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Modal do Gerador */}
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
