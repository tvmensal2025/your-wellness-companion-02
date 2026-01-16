import React from 'react';
import { cn } from '@/lib/utils';

// Hooks
import { useChefKitchenLogic } from './hooks/useChefKitchenLogic';

// Sub-componentes locais
import { KitchenHeader } from './KitchenHeader';
import { RecipeCard } from './RecipeCard';
import { CookingAnimation } from './CookingAnimation';

// Componentes externos
import { WeeklyMealPlanModal } from '@/components/meal-plan/WeeklyMealPlanModal';
import { MealPlanSuccessEffect } from '@/components/meal-plan/MealPlanSuccessEffect';
import { MealPlanLoadingExperience } from '@/components/meal-plan/creative/MealPlanLoadingExperience';

/**
 * ChefKitchenMealPlan - Orchestrator para geração de cardápios
 * 
 * Componente principal que coordena a experiência de criação de cardápios
 * com tema de cozinha. Utiliza o padrão Orchestrator para manter o código
 * organizado e facilitar expansões futuras.
 * 
 * Sub-componentes:
 * - KitchenHeader: Cabeçalho com título e histórico
 * - RecipeCard: Configurações de objetivo, duração e preferências
 * - CookingAnimation: Animação interativa da panela
 * 
 * @example
 * ```tsx
 * <ChefKitchenMealPlan className="p-4" />
 * ```
 */

export interface ChefKitchenMealPlanProps {
  /** Classes CSS adicionais */
  className?: string;
}

export const ChefKitchenMealPlan: React.FC<ChefKitchenMealPlanProps> = ({ className }) => {
  const logic = useChefKitchenLogic();

  // Preparar dados para o modal de sucesso
  const mealPlanData = logic.generatedPlan.length > 0 ? {
    type: logic.generatedPlan.length > 1 ? 'weekly' : 'daily' as const,
    title: `Cardápio ${logic.generatedPlan.length > 1 ? 'Semanal' : 'Diário'}`,
    summary: {
      calories: Math.round(logic.generatedPlan.reduce((a, d) => a + d.dailyTotals.calories, 0) / logic.generatedPlan.length),
      protein: Math.round(logic.generatedPlan.reduce((a, d) => a + d.dailyTotals.protein, 0) / logic.generatedPlan.length),
      carbs: Math.round(logic.generatedPlan.reduce((a, d) => a + d.dailyTotals.carbs, 0) / logic.generatedPlan.length),
      fat: Math.round(logic.generatedPlan.reduce((a, d) => a + d.dailyTotals.fat, 0) / logic.generatedPlan.length),
      fiber: Math.round(logic.generatedPlan.reduce((a, d) => a + d.dailyTotals.fiber, 0) / logic.generatedPlan.length),
    }
  } : undefined;

  // Preparar dados para o modal semanal
  const weeklyMealPlan = logic.generatedPlan.map(d => ({
    ...d,
    dailyTotals: {
      calories: d.dailyTotals?.calories || 0,
      protein: d.dailyTotals?.protein || 0,
      carbs: d.dailyTotals?.carbs || 0,
      fat: d.dailyTotals?.fat || 0,
      fiber: d.dailyTotals?.fiber || 0,
    }
  }));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header com título e histórico */}
      <KitchenHeader
        isGenerating={logic.isGenerating}
        hasUserData={logic.hasUserData}
        loadingPhysical={logic.loadingPhysical}
      />

      {/* Configurações: objetivo, duração, macros e preferências */}
      <RecipeCard
        selectedObjective={logic.selectedObjective}
        onSelectObjective={logic.setSelectedObjective}
        selectedDays={logic.selectedDays}
        onSelectDays={logic.setSelectedDays}
        nutritionalGoals={logic.nutritionalGoals}
        userWeight={logic.userWeight}
        hasUserData={logic.hasUserData}
        showPreferences={logic.showPreferences}
        onTogglePreferences={logic.onTogglePreferences}
        localPreferences={logic.localPreferences}
        localRestrictions={logic.localRestrictions}
        onAddPreference={logic.handleAddPreference}
        onRemovePreference={logic.handleRemovePreference}
        onAddRestriction={logic.handleAddRestriction}
        onRemoveRestriction={logic.handleRemoveRestriction}
        newPreference={logic.newPreference}
        onNewPreferenceChange={logic.setNewPreference}
        newRestriction={logic.newRestriction}
        onNewRestrictionChange={logic.setNewRestriction}
        getObjectiveLabel={logic.getObjectiveLabel}
        getObjectiveColor={logic.getObjectiveColor}
      />

      {/* Animação da panela e botão de gerar */}
      <CookingAnimation
        selectedMeals={logic.selectedMeals}
        onToggleMeal={logic.toggleMeal}
        isGenerating={logic.isGenerating}
        selectedCount={logic.selectedCount}
        onGenerate={logic.handleGenerate}
      />

      {/* Loading Experience */}
      <MealPlanLoadingExperience
        isLoading={logic.isGenerating}
        days={logic.selectedDays}
        calories={logic.nutritionalGoals.calories}
        objective={logic.getObjectiveLabel()}
      />

      {/* Modal de resultado semanal */}
      <WeeklyMealPlanModal
        open={logic.showResultModal}
        onOpenChange={logic.setShowResultModal}
        mealPlan={weeklyMealPlan}
      />

      {/* Efeito de sucesso */}
      <MealPlanSuccessEffect
        isVisible={logic.showSuccessEffect}
        onClose={() => logic.setShowSuccessEffect(false)}
        mealPlanData={mealPlanData}
      />
    </div>
  );
};

export default ChefKitchenMealPlan;
