import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Check, 
  X,
  Dumbbell,
  Clock,
  Flame,
  Trophy,
  ChevronRight,
  Youtube
} from 'lucide-react';
import { Exercise, WeeklyPlan } from '@/hooks/useExercisesLibrary';
import { RestTimer } from './RestTimer';
import { cn } from '@/lib/utils';

interface ActiveWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WeeklyPlan;
  onComplete: (completedExercises: string[]) => void;
}

interface ExerciseProgress {
  exerciseId: string;
  completed: boolean;
  setsCompleted: number;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  isOpen,
  onClose,
  workout,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutStartTime] = useState(Date.now());

  const currentExercise = workout.exercises[currentIndex];
  const totalExercises = workout.exercises.length;
  const completedCount = progress.filter(p => p.completed).length;
  const progressPercentage = (completedCount / totalExercises) * 100;

  useEffect(() => {
    // Inicializar progresso
    setProgress(workout.exercises.map(ex => ({
      exerciseId: ex.id,
      completed: false,
      setsCompleted: 0
    })));
  }, [workout]);

  const handleCompleteExercise = () => {
    setProgress(prev => prev.map((p, i) => 
      i === currentIndex ? { ...p, completed: true } : p
    ));
    
    if (currentIndex < totalExercises - 1) {
      setShowTimer(true);
    } else {
      // Treino completo!
      handleFinishWorkout();
    }
  };

  const handleSkipExercise = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowTimer(false);
    }
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFinishWorkout = () => {
    const completedIds = progress.filter(p => p.completed).map(p => p.exerciseId);
    onComplete(completedIds);
    onClose();
  };

  const getElapsedTime = () => {
    const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseRestTime = (restTime: string | null): number => {
    if (!restTime) return 60;
    const match = restTime.match(/(\d+)/);
    return match ? parseInt(match[1]) : 60;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Treino Ativo - {workout.title}</DialogTitle>
          <DialogDescription>Acompanhe seu progresso durante o treino</DialogDescription>
        </VisuallyHidden>
        {/* Header com progresso */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge className="bg-white/20 border-0">
              {workout.dayName} - {workout.title}
            </Badge>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{getElapsedTime()}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{completedCount}/{totalExercises} exercícios</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-white/20"
            />
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-4">
            <AnimatePresence mode="wait">
              {showTimer ? (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Descanse agora! 💪</h3>
                    <p className="text-sm text-muted-foreground">
                      Próximo: {workout.exercises[currentIndex + 1]?.name}
                    </p>
                  </div>
                  <RestTimer 
                    defaultSeconds={parseRestTime(currentExercise?.rest_time)}
                    onComplete={handleTimerComplete}
                    autoStart={true}
                  />
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleTimerComplete}
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Pular Descanso
                  </Button>
                </motion.div>
              ) : currentExercise ? (
                <motion.div
                  key={currentExercise.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Exercício Atual */}
                  <Card className="border-2 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className="mb-2 bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                            Exercício {currentIndex + 1} de {totalExercises}
                          </Badge>
                          <h2 className="text-xl font-bold">{currentExercise.name}</h2>
                          <p className="text-sm text-muted-foreground capitalize">
                            {currentExercise.muscle_group}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-500">
                            {currentExercise.sets || '3'}x{currentExercise.reps || '12'}
                          </p>
                          {currentExercise.rest_time && (
                            <p className="text-xs text-muted-foreground">
                              {currentExercise.rest_time} descanso
                            </p>
                          )}
                        </div>
                      </div>

                      {currentExercise.description && (
                        <p className="text-sm text-muted-foreground">
                          {currentExercise.description}
                        </p>
                      )}

                      {currentExercise.instructions && currentExercise.instructions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Como fazer:</p>
                          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            {currentExercise.instructions.slice(0, 4).map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {currentExercise.youtube_url && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(currentExercise.youtube_url!, '_blank')}
                        >
                          <Youtube className="w-4 h-4 mr-2 text-red-500" />
                          Ver Vídeo Demonstrativo
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Ações */}
                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleSkipExercise}
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      Pular
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      onClick={handleCompleteExercise}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Concluir
                    </Button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Lista de exercícios */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Todos os exercícios
              </p>
              <div className="space-y-2">
                {workout.exercises.map((ex, i) => {
                  const isCompleted = progress[i]?.completed;
                  const isCurrent = i === currentIndex;

                  return (
                    <button
                      key={ex.id}
                      onClick={() => !showTimer && setCurrentIndex(i)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                        isCurrent && "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800",
                        isCompleted && "bg-green-50 dark:bg-green-950/30",
                        !isCurrent && !isCompleted && "hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        isCompleted ? "bg-green-500 text-white" : isCurrent ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className={cn(
                        "flex-1 text-sm",
                        isCompleted && "line-through text-muted-foreground"
                      )}>
                        {ex.name}
                      </span>
                      {isCurrent && !showTimer && (
                        <ChevronRight className="w-4 h-4 text-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar Treino
            </Button>
            {completedCount === totalExercises && (
              <Button 
                onClick={handleFinishWorkout}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Finalizar Treino
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
