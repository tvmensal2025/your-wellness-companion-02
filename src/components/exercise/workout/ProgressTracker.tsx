import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Check, 
  ChevronRight, 
  Dumbbell,
  X,
  Trophy,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Exercise } from '@/hooks/useExercisesLibrary';
import { cn } from '@/lib/utils';

interface ExerciseProgress {
  exerciseId: string;
  completed: boolean;
  setsCompleted: number;
}

interface ProgressTrackerProps {
  exercises: Exercise[];
  progress: ExerciseProgress[];
  currentIndex: number;
  currentSet: number;
  totalSets: number;
  repsLabel: string;
  onExerciseSelect: (index: number) => void;
  onPreviousSet: () => void;
  onNextSet: () => void;
  onConcludeSet: () => void;
  onCancel: () => void;
  onFinish?: () => void;
  showTimer: boolean;
  showInlineRest: boolean;
  isExerciseStarted: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  exercises,
  progress,
  currentIndex,
  currentSet,
  totalSets,
  repsLabel,
  onExerciseSelect,
  onPreviousSet,
  onNextSet,
  onConcludeSet,
  onCancel,
  onFinish,
  showTimer,
  showInlineRest,
  isExerciseStarted
}) => {
  const completedCount = progress.filter((p) => p.completed).length;
  const totalExercises = exercises.length;
  const progressPercentage = (completedCount / totalExercises) * 100;

  return (
    <div className="space-y-4">
      {/* Série atual - só mostra quando exercício está iniciado */}
      {isExerciseStarted && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">
              Série {currentSet} de {totalSets}
            </span>
            <span className="text-muted-foreground">{repsLabel} repetições</span>
          </div>
          <Progress value={(currentSet / Math.max(1, totalSets)) * 100} className="h-2" />
        </div>
      )}

      {/* Controles de série - só mostra quando exercício está iniciado e não está em descanso */}
      {isExerciseStarted && !showInlineRest && (
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            disabled={currentSet <= 1}
            onClick={onPreviousSet}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button onClick={onConcludeSet} className="gap-2">
            <Check className="w-4 h-4" />
            Concluir
          </Button>
          <Button
            variant="outline"
            disabled={currentSet >= totalSets}
            onClick={onNextSet}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Lista de Exercícios do Dia */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Exercícios do Dia
          </span>
        </div>
        <div className="space-y-2">
          {exercises.map((ex, i) => {
            const isCompleted = progress[i]?.completed;
            const isCurrent = i === currentIndex;

            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => !showTimer && onExerciseSelect(i)}
                  disabled={showTimer}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left",
                    isCurrent 
                      ? "bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700" 
                      : isCompleted 
                        ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                        : "bg-muted/30 border border-border/50 hover:bg-muted/50"
                  )}
                >
                  {/* Número/Check */}
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                    isCurrent 
                      ? "bg-emerald-500 text-white" 
                      : isCompleted 
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-xs truncate",
                      isCompleted && "line-through text-muted-foreground"
                    )}>
                      {ex.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {ex.muscle_group} • {ex.sets || '3'}x{ex.reps || '12'}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    {isCompleted ? (
                      <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓</Badge>
                    ) : isCurrent ? (
                      <ChevronRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer: Progresso e Finalizar */}
      <div className="pt-4 border-t border-border/50 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progresso do treino</span>
          <span className="font-medium">{completedCount}/{totalExercises} exercícios</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
          {completedCount === totalExercises && onFinish && (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={onFinish}
            >
              <Trophy className="w-4 h-4 mr-1" />
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
