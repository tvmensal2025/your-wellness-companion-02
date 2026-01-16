// ============================================
// 📋 SAVED PROGRAM VIEW - ORCHESTRATOR
// Visualização de programa de treino salvo
// ============================================

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import type { Exercise } from '@/hooks/useExercisesLibrary';

// Hooks
import { useSavedProgramLogic, type SavedProgram } from './hooks/useSavedProgramLogic';

// Sub-components
import { LimitationWarning } from './LimitationWarning';
import { ProgramDayList } from './ProgramDayList';
import { ProgramHeader } from './ProgramHeader';
import { ProgramExerciseList } from './ProgramExerciseList';
import { RestDayCard } from './RestDayCard';

// ============================================
// PROPS
// ============================================

export interface SavedProgramViewProps {
  program: SavedProgram;
  onStartWorkout: (weekNumber: number, dayActivities: string[], resolvedExercises?: Exercise[]) => void;
  onCompleteWorkout: () => void;
  onExerciseClick?: (exercise: Exercise) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const SavedProgramView: React.FC<SavedProgramViewProps> = ({
  program,
  onStartWorkout,
  onCompleteWorkout,
  onExerciseClick,
}) => {
  const logic = useSavedProgramLogic({ program });

  // Empty state
  if (logic.weeks.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-700 dark:text-amber-300">
            Programa sem plano semanal detalhado. 
            Considere criar um novo programa personalizado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 overflow-hidden max-w-full">
      {/* Aviso de Limitação */}
      {logic.limitation && (
        <LimitationWarning limitation={logic.limitation} />
      )}
      
      {/* Seletor de Dias */}
      <ProgramDayList
        weekDays={logic.weekDays}
        selectedDay={logic.selectedDay}
        onSelectDay={logic.setSelectedDay}
      />

      {/* Conteúdo do Dia Selecionado */}
      <AnimatePresence mode="wait">
        {logic.selectedDay && (
          <motion.div
            key={logic.selectedDay.dayNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {logic.selectedDay.isRestDay ? (
              <RestDayCard day={logic.selectedDay} />
            ) : (
              <div className="space-y-3 sm:space-y-4 overflow-hidden">
                {/* Header do Treino */}
                <ProgramHeader
                  day={logic.selectedDay}
                  weekNumber={logic.currentWeek}
                  exerciseCount={logic.dayExercises.length || logic.selectedDay.activities.length}
                  onStartWorkout={onStartWorkout}
                  exercises={logic.dayExercises}
                />

                {/* Lista de Exercícios */}
                <ProgramExerciseList
                  exercises={logic.dayExercises}
                  isLoading={logic.libraryLoading}
                  activitiesCount={logic.selectedDay.activities.length}
                  onExerciseClick={onExerciseClick}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Re-export para compatibilidade
export default SavedProgramView;

// Export types
export type { SavedProgram, DayPlan, WeekActivity } from './hooks/useSavedProgramLogic';
