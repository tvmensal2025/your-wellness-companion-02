import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
  ChevronUp,
  Youtube,
  Info,
  Lightbulb
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

// Extrair ID do YouTube
const extractYouTubeId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
};

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
  const [showDetailedInstructions, setShowDetailedInstructions] = useState(false);
  const [showDetailedTips, setShowDetailedTips] = useState(false);

  const currentExercise = workout.exercises[currentIndex];
  const totalExercises = workout.exercises.length;
  const completedCount = progress.filter(p => p.completed).length;
  const progressPercentage = (completedCount / totalExercises) * 100;

  // YouTube ID para embed
  const youtubeId = useMemo(() => 
    extractYouTubeId(currentExercise?.youtube_url), 
    [currentExercise?.youtube_url]
  );

  // Resumo das instruções (primeiros 80 caracteres de cada)
  const instructionsSummary = useMemo(() => {
    if (!currentExercise?.instructions?.length) return '';
    return currentExercise.instructions
      .slice(0, 2)
      .map((s, i) => `${i + 1}. ${s.slice(0, 60)}${s.length > 60 ? '...' : ''}`)
      .join(' ');
  }, [currentExercise]);

  // Resumo das dicas
  const tipsSummary = useMemo(() => {
    if (!currentExercise?.tips) return '';
    const tips = currentExercise.tips;
    return tips.slice(0, 100) + (tips.length > 100 ? '...' : '');
  }, [currentExercise]);

  useEffect(() => {
    setProgress(workout.exercises.map(ex => ({
      exerciseId: ex.id,
      completed: false,
      setsCompleted: 0
    })));
  }, [workout]);

  // Reset detalhes ao mudar de exercício
  useEffect(() => {
    setShowDetailedInstructions(false);
    setShowDetailedTips(false);
  }, [currentIndex]);

  const handleCompleteExercise = () => {
    setProgress(prev => prev.map((p, i) => 
      i === currentIndex ? { ...p, completed: true } : p
    ));
    
    if (currentIndex < totalExercises - 1) {
      setShowTimer(true);
    } else {
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
            <Badge className="bg-white/20 border-0 text-xs">
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
                  className="space-y-3"
                >
                  {/* Header do exercício - compacto */}
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-1 bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 text-xs">
                        Exercício {currentIndex + 1} de {totalExercises}
                      </Badge>
                      <h2 className="text-lg font-bold">{currentExercise.name}</h2>
                      <p className="text-xs text-muted-foreground capitalize">
                        {currentExercise.muscle_group}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-500">
                        {currentExercise.sets || '3'}x{currentExercise.reps || '12'}
                      </p>
                      {currentExercise.rest_time && (
                        <p className="text-xs text-muted-foreground">
                          {currentExercise.rest_time}s descanso
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Descrição curta */}
                  {currentExercise.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {currentExercise.description}
                    </p>
                  )}

                  {/* Instruções - Resumo com botão para expandir */}
                  {currentExercise.instructions && currentExercise.instructions.length > 0 && (
                    <Card className="border border-border/50 bg-muted/30">
                      <CardContent className="p-3">
                        <button
                          onClick={() => setShowDetailedInstructions(!showDetailedInstructions)}
                          className="w-full flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">Como fazer</span>
                            <Badge variant="outline" className="text-xs">
                              {currentExercise.instructions.length} passos
                            </Badge>
                          </div>
                          {showDetailedInstructions ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {!showDetailedInstructions ? (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-muted-foreground mt-2 line-clamp-2"
                            >
                              {instructionsSummary}
                            </motion.p>
                          ) : (
                            <motion.ol
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-xs text-muted-foreground mt-3 space-y-2 list-decimal list-inside"
                            >
                              {currentExercise.instructions.map((step, i) => (
                                <li key={i} className="leading-relaxed">{step}</li>
                              ))}
                            </motion.ol>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  )}

                  {/* Dicas - Resumo com botão para expandir */}
                  {currentExercise.tips && (
                    <Card className="border border-border/50 bg-amber-50/50 dark:bg-amber-950/20">
                      <CardContent className="p-3">
                        <button
                          onClick={() => setShowDetailedTips(!showDetailedTips)}
                          className="w-full flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium">Dica do Personal</span>
                          </div>
                          {showDetailedTips ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {!showDetailedTips ? (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-muted-foreground mt-2 line-clamp-2"
                            >
                              {tipsSummary}
                            </motion.p>
                          ) : (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-xs text-muted-foreground mt-3 leading-relaxed"
                            >
                              {currentExercise.tips}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  )}

                  {/* Player de Vídeo Embutido */}
                  {youtubeId && (
                    <div className="rounded-lg overflow-hidden border border-border/50">
                      <div className="aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                          title={`Vídeo: ${currentExercise.name}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleSkipExercise}
                    >
                      <SkipForward className="w-4 h-4 mr-1" />
                      Pular
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      onClick={handleCompleteExercise}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Concluir
                    </Button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Lista de exercícios - mais compacta */}
            <div className="pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Todos os exercícios
              </p>
              <div className="space-y-1">
                {workout.exercises.map((ex, i) => {
                  const isCompleted = progress[i]?.completed;
                  const isCurrent = i === currentIndex;

                  return (
                    <button
                      key={ex.id}
                      onClick={() => !showTimer && setCurrentIndex(i)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all text-sm",
                        isCurrent && "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800",
                        isCompleted && "bg-green-50 dark:bg-green-950/30",
                        !isCurrent && !isCompleted && "hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        isCompleted ? "bg-green-500 text-white" : isCurrent ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className={cn(
                        "flex-1 text-xs truncate",
                        isCompleted && "line-through text-muted-foreground"
                      )}>
                        {ex.name}
                      </span>
                      {isCurrent && !showTimer && (
                        <ChevronRight className="w-3 h-3 text-orange-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
              <X className="w-4 h-4 mr-1" />
              Cancelar Treino
            </Button>
            {completedCount === totalExercises && (
              <Button 
                size="sm"
                onClick={handleFinishWorkout}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Trophy className="w-4 h-4 mr-1" />
                Finalizar Treino
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};