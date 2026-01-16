// ============================================
// 📋 PROGRAM HEADER
// Cabeçalho do programa com título e ações
// ============================================

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Dumbbell, Play } from 'lucide-react';
import type { DayPlan } from './hooks/useSavedProgramLogic';
import type { Exercise } from '@/hooks/useExercisesLibrary';

interface ProgramHeaderProps {
  day: DayPlan;
  weekNumber: number;
  exerciseCount: number;
  onStartWorkout: (weekNumber: number, activities: string[], exercises?: Exercise[]) => void;
  exercises: Exercise[];
}

export const ProgramHeader: React.FC<ProgramHeaderProps> = ({
  day,
  weekNumber,
  exerciseCount,
  onStartWorkout,
  exercises,
}) => {
  return (
    <Card className="border-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <CardContent className="p-2.5 sm:p-3 md:p-4 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
            <Badge className="bg-white/20 border-0 text-white text-xs sm:text-sm px-3 py-1">
              {day.dayName}
            </Badge>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{day.title}</h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {day.muscleGroups.slice(0, 3).map((group) => (
                <Badge key={group} variant="outline" className="bg-white/10 border-white/30 text-white text-[10px] sm:text-xs capitalize px-2 sm:px-3 py-0.5">
                  {group}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right space-y-1 sm:space-y-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-sm sm:text-base">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">{exerciseCount} ex</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-sm sm:text-base">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">~{exerciseCount * 4}m</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onStartWorkout(weekNumber, day.activities, exercises)}
          className="w-full mt-3 sm:mt-4 bg-white text-emerald-600 hover:bg-white/90 font-semibold h-9 sm:h-10 text-sm shadow-md"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" fill="currentColor" />
          Começar Treino
        </Button>
      </CardContent>
    </Card>
  );
};
