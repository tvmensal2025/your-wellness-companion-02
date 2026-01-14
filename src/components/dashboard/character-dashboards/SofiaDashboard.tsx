/**
 * Sofia Dashboard - Foco em Nutrição
 * Dashboard personalizado com anel de calorias, macros e refeições
 * Usa dados REAIS do Supabase
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useNutritionData } from '@/hooks/useNutritionData';
import { useUserDataCache } from '@/hooks/useUserDataCache';
import { useDashboardNavigation } from '@/hooks/useDashboardNavigation';
import { Camera, Calendar, ChevronRight, Loader2 } from 'lucide-react';

interface SofiaDashboardProps {
  className?: string;
}

export function SofiaDashboard({ className }: SofiaDashboardProps) {
  const { navigate } = useDashboardNavigation();
  const { nutritionData, loading } = useNutritionData();
  const { data: userData } = useUserDataCache();
  
  const caloriePercentage = nutritionData.caloriesTarget > 0 
    ? (nutritionData.caloriesConsumed / nutritionData.caloriesTarget) * 100 
    : 0;
  const proteinPercentage = nutritionData.protein.target > 0 
    ? (nutritionData.protein.current / nutritionData.protein.target) * 100 
    : 0;
  const carbsPercentage = nutritionData.carbs.target > 0 
    ? (nutritionData.carbs.current / nutritionData.carbs.target) * 100 
    : 0;
  const fatPercentage = nutritionData.fat.target > 0 
    ? (nutritionData.fat.current / nutritionData.fat.target) * 100 
    : 0;

  // Determinar qual refeição está ativa baseado na hora
  const currentHour = new Date().getHours();
  const getActiveMeal = () => {
    if (currentHour >= 6 && currentHour < 10) return 'breakfast';
    if (currentHour >= 11 && currentHour < 14) return 'lunch';
    if (currentHour >= 15 && currentHour < 17) return 'snack';
    if (currentHour >= 18 && currentHour < 21) return 'dinner';
    return 'snack';
  };
  const activeMealId = getActiveMeal();

  // Verificar quais refeições já foram registradas
  const registeredMealTypes = new Set(nutritionData.todayMeals.map(m => m.mealType));

  const meals = [
    { id: 'breakfast', icon: '☕', name: 'Café', time: '6h-10h', registered: registeredMealTypes.has('breakfast') },
    { id: 'lunch', icon: '🍴', name: 'Almoço', time: '11h-14h', registered: registeredMealTypes.has('lunch') },
    { id: 'snack', icon: '🍎', name: 'Lanche', time: '15h-17h', registered: registeredMealTypes.has('snack') },
    { id: 'dinner', icon: '🌙', name: 'Jantar', time: '18h-21h', registered: registeredMealTypes.has('dinner') },
  ];

  const userName = userData.profile?.fullName?.split(' ')[0] || 'você';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 pb-4", className)}>
      {/* Sofia Tip Card */}
      <div className="bg-emerald-500/10 rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-lg flex-shrink-0">
          😊
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="text-emerald-400 font-medium">
              {nutritionData.mealsCompleted === 0 
                ? `Olá ${userName}! Vamos registrar sua primeira refeição?` 
                : nutritionData.mealsCompleted < 4 
                  ? `Ótimo progresso! Faltam ${4 - nutritionData.mealsCompleted} refeições.`
                  : `Parabéns ${userName}! Todas as refeições registradas! 🎉`
              }
            </span> 📸
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Envie fotos pelo WhatsApp • Sofia analisa automaticamente
          </p>
        </div>
      </div>

      {/* Calorie Ring + Stats */}
      <div className="flex items-center justify-center gap-6">
        {/* Calorie Ring */}
        <div className="relative">
          <svg className="w-36 h-36 -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/20"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={`${Math.min(caloriePercentage, 100) * 3.77} 377`}
              strokeLinecap="round"
              className="text-emerald-500 transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{nutritionData.caloriesConsumed}</span>
            <span className="text-xs text-muted-foreground">de {nutritionData.caloriesTarget} kcal</span>
            <span className="mt-1 px-2 py-0.5 bg-emerald-500 text-white text-xs font-semibold rounded-full">
              {nutritionData.caloriesRemaining} restam
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">
              {caloriePercentage < 80 ? 'Abaixo' : caloriePercentage > 110 ? 'Acima' : 'Na meta'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">🔥 {nutritionData.streak} dias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">✓ {nutritionData.mealsCompleted}/{nutritionData.totalMeals} refeições</span>
          </div>
        </div>
      </div>

      {/* Macros Row */}
      <div className="grid grid-cols-3 gap-2">
        <MacroCard 
          label="PROTEÍNA" 
          percentage={proteinPercentage} 
          current={nutritionData.protein.current} 
          target={nutritionData.protein.target}
          color="text-red-400"
        />
        <MacroCard 
          label="CARBOS" 
          percentage={carbsPercentage} 
          current={nutritionData.carbs.current} 
          target={nutritionData.carbs.target}
          color="text-amber-400"
        />
        <MacroCard 
          label="GORDURAS" 
          percentage={fatPercentage} 
          current={nutritionData.fat.current} 
          target={nutritionData.fat.target}
          color="text-blue-400"
        />
      </div>

      {/* Meals Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            🍽️ Refeições de Hoje
          </h4>
          <span className="text-xs text-muted-foreground">Toque para registrar</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {meals.map((meal) => (
            <button
              key={meal.id}
              onClick={() => navigate('/sofia-nutricional')}
              className="flex flex-col items-center min-w-[70px]"
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all relative",
                meal.registered 
                  ? "border-emerald-500 bg-emerald-500/20" 
                  : meal.id === activeMealId
                    ? "border-emerald-500/50 bg-emerald-500/10 animate-pulse"
                    : "border-transparent bg-muted/30"
              )}>
                {meal.icon}
                {meal.registered && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium mt-2">{meal.name}</span>
              <span className="text-[10px] text-muted-foreground">{meal.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Week Progress */}
      <button 
        onClick={() => navigate('/progress')}
        className="w-full bg-muted/30 rounded-xl p-4 flex items-center justify-between hover:bg-muted/40 transition-colors"
      >
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Esta Semana
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {nutritionData.weekProgress.completed}/{nutritionData.weekProgress.total} dias
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>

      {/* Quick Action - Analyze Photo */}
      <button
        onClick={() => navigate('/sofia-nutricional')}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 font-medium hover:opacity-90 transition-opacity"
      >
        <Camera className="w-5 h-5" />
        Analisar Refeição com Sofia
      </button>
    </div>
  );
}

interface MacroCardProps {
  label: string;
  percentage: number;
  current: number;
  target: number;
  color: string;
}

function MacroCard({ label, percentage, current, target, color }: MacroCardProps) {
  return (
    <div className="bg-muted/30 rounded-xl p-3 text-center">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className={cn("text-lg font-semibold", color)}>
        {Math.round(Math.min(percentage, 999))}%
      </div>
      <span className="text-xs text-muted-foreground">{current}/{target}g</span>
    </div>
  );
}

export default SofiaDashboard;
