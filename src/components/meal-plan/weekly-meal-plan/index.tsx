/**
 * WeeklyMealPlanModal - Orchestrator
 * Modal para exibição de cardápio semanal com visão geral e detalhes por dia
 * **Validates: Requirements 2.5, 10.6**
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarDays, Printer, Sparkles } from 'lucide-react';
import type { DayPlan } from '@/types/meal-plan';
import { useWeeklyPlanLogic } from './hooks/useWeeklyPlanLogic';
import { WeeklyOverview } from './WeeklyOverview';
import { DaySelector } from './DaySelector';
import { CompactMealPlanModal } from '@/components/meal-plan/compact-meal-plan';

export interface WeeklyMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlan: DayPlan[];
  title?: string;
}

export const WeeklyMealPlanModal: React.FC<WeeklyMealPlanModalProps> = ({
  open, onOpenChange, mealPlan, title = "Cardápio Semanal",
}) => {
  const logic = useWeeklyPlanLogic({ mealPlan, title, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "w-[95vw] max-w-3xl h-[90vh] flex flex-col p-0 gap-0",
        "bg-background/95 backdrop-blur-xl"
      )}>
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Header */}
        <div className="flex-shrink-0 p-4 pr-12 border-b bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <CalendarDays className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h2 className="font-bold text-xl flex items-center gap-2 text-foreground">
                  {title}
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mealPlan.length} dias • Plano personalizado
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logic.handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <WeeklyOverview macros={logic.avgMacros} />
          {mealPlan.map((dayPlan, index) => (
            <motion.div 
              key={dayPlan.day} 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }}
            >
              <DaySelector
                dayPlan={dayPlan}
                isExpanded={logic.expandedDays.includes(dayPlan.day)}
                onToggle={() => logic.toggleDay(dayPlan.day)}
                onViewDetailed={() => logic.openDayDetail(dayPlan)}
                getDayName={logic.getDayName}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 border-t bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" />
            Cardápio gerado por Sofia Nutricional
            <Sparkles className="w-3 h-3 text-primary" />
          </p>
        </div>
      </DialogContent>

      {/* Day Detail Modal */}
      {logic.selectedDayForCompact && (
        <CompactMealPlanModal
          open={logic.compactModalOpen}
          onOpenChange={logic.setCompactModalOpen}
          dayPlan={logic.selectedDayForCompact}
        />
      )}
    </Dialog>
  );
};

export default WeeklyMealPlanModal;
export { WeeklyOverview, CircularProgress } from './WeeklyOverview';
export { DaySelector } from './DaySelector';
export { useWeeklyPlanLogic } from './hooks/useWeeklyPlanLogic';
