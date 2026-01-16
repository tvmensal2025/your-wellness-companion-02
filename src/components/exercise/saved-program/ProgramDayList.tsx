// ============================================
// 📅 PROGRAM DAY LIST
// Lista de dias da semana para seleção
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dumbbell, Flame, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayPlan } from './hooks/useSavedProgramLogic';

interface ProgramDayListProps {
  weekDays: DayPlan[];
  selectedDay: DayPlan | null;
  onSelectDay: (day: DayPlan) => void;
}

export const ProgramDayList: React.FC<ProgramDayListProps> = ({
  weekDays,
  selectedDay,
  onSelectDay,
}) => {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-1.5 sm:gap-2 pb-2">
        {weekDays.map((day) => (
          <motion.button
            key={day.dayNumber}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectDay(day)}
            className={cn(
              "flex-shrink-0 px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 min-w-[52px] sm:min-w-[80px]",
              day.isToday && "ring-2 ring-emerald-500 ring-offset-1 sm:ring-offset-2",
              selectedDay?.dayNumber === day.dayNumber
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white shadow-lg"
                : day.isRestDay
                  ? "bg-muted/50 border-border/50 text-muted-foreground"
                  : "bg-card border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            )}
          >
            <div className="text-center">
              <p className={cn(
                "text-[10px] sm:text-xs font-medium uppercase tracking-wide",
                selectedDay?.dayNumber === day.dayNumber ? "text-white/80" : "text-muted-foreground"
              )}>
                {day.shortName}
              </p>
              <div className="flex items-center justify-center mt-0.5 sm:mt-1">
                {day.isRestDay ? (
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : day.isToday ? (
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                ) : (
                  <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </div>
              {day.isToday && (
                <Badge className="mt-0.5 sm:mt-1 text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0 bg-white/20 text-white border-0">
                  HOJE
                </Badge>
              )}
            </div>
          </motion.button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
