/**
 * CompactMealPlanModal - Orchestrator
 * Modal compacto para exibição de cardápio diário com navegação entre refeições
 * 
 * Este é o componente orchestrator que coordena todos os sub-componentes:
 * - MealCard: Exibição de refeição individual
 * - MacrosDisplay: Exibição de macronutrientes
 * - MealNavigation: Navegação entre refeições
 * - PrintButton: Funcionalidade de impressão
 * 
 * @param open - Se o modal está aberto
 * @param onOpenChange - Callback para mudança de estado do modal
 * @param dayPlan - Plano do dia com refeições
 * @param title - Título opcional do modal
 * 
 * **Validates: Requirements 1.7, 10.6**
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

// Types
import type { DayPlan } from '@/types/meal-plan';

// Hook
import { useCompactMealPlanLogic } from './hooks/useCompactMealPlanLogic';

// Sub-components
import { MealCard } from './MealCard';
import { MacrosDisplay } from './MacrosDisplay';
import { MealNavigation } from './MealNavigation';
import { PrintButton } from './PrintButton';

// ============================================================================
// Types
// ============================================================================

export interface CompactMealPlanModalProps {
  /** Se o modal está aberto */
  open: boolean;
  /** Callback para mudança de estado do modal */
  onOpenChange: (open: boolean) => void;
  /** Plano do dia com refeições */
  dayPlan: DayPlan;
  /** Título opcional do modal */
  title?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export const CompactMealPlanModal: React.FC<CompactMealPlanModalProps> = ({
  open,
  onOpenChange,
  dayPlan,
  title,
}) => {
  // Use the extracted logic hook
  const logic = useCompactMealPlanLogic({ dayPlan });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-md p-0 overflow-hidden",
          "bg-background border-border"
        )}
      >
        {/* Accessible title */}
        <DialogTitle className="sr-only">
          {title || `Cardápio do Dia ${dayPlan.day}`}
        </DialogTitle>

        {/* Header with gradient */}
        <div className={cn(
          "relative px-4 pt-4 pb-2",
          "bg-gradient-to-b from-primary/10 to-transparent"
        )}>
          {/* Title and Print Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
              <h2 className="text-lg font-bold text-foreground">
                {title || `Dia ${dayPlan.day}`}
              </h2>
            </div>
            <PrintButton 
              onPrint={logic.handlePrint}
              disabled={!logic.currentMeal}
              tooltipText="Imprimir esta refeição"
            />
          </div>

          {/* Meal Navigation */}
          <MealNavigation
            activeTab={logic.activeTab}
            onTabChange={logic.setActiveTab}
            availableMeals={logic.availableMeals}
            mealTypes={logic.mealTypes}
            hasMeal={logic.hasMeal}
            getMealConfig={logic.getMealConfig}
            onPrevious={logic.handlePrevious}
            onNext={logic.handleNext}
            currentIndex={logic.currentMealIndex}
            variant="tabs"
          />
        </div>

        {/* Content Area */}
        <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {logic.currentMeal && logic.currentMealConfig && (
              <motion.div
                key={logic.activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Meal Card */}
                <MealCard
                  meal={logic.currentMeal}
                  mealConfig={logic.currentMealConfig}
                  mealType={logic.activeTab}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!logic.currentMeal && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-4xl mb-2">🍽️</span>
              <p className="text-muted-foreground text-sm">
                Nenhuma refeição disponível
              </p>
            </div>
          )}
        </div>

        {/* Footer with Daily Totals */}
        {dayPlan.dailyTotals && (
          <div className={cn(
            "px-4 py-3 border-t border-border",
            "bg-muted/30"
          )}>
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Totais do Dia
            </p>
            <MacrosDisplay
              macros={dayPlan.dailyTotals}
              variant="compact"
              animated={false}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Exports
// ============================================================================

// Default export
export default CompactMealPlanModal;

// Re-export sub-components for flexibility
export { MealCard } from './MealCard';
export { MacrosDisplay } from './MacrosDisplay';
export { MealNavigation } from './MealNavigation';
export { PrintButton } from './PrintButton';
export { useCompactMealPlanLogic } from './hooks/useCompactMealPlanLogic';

// Types are already exported at line 41
