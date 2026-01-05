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
  const [isExerciseStarted, setIsExerciseStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentExercise = workout.exercises[currentIndex];
  const totalExercises = workout.exercises.length;
  const completedCount = progress.filter(p => p.completed).length;
  const progressPercentage = (completedCount / totalExercises) * 100;

  // Timer atualizado a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

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
    setIsExerciseStarted(false);
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
    const mins = Math.floor(elapsedTime / 60);
    const secs = elapsedTime % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExercise = () => {
    setIsExerciseStarted(true);
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
        
        <ScrollArea className="max-h-[90vh]">
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
                  className="space-y-4"
                >
                  {/* Header: Título + Badge Local + Timer */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{currentExercise.name}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        🏠 {currentExercise.location === 'gym' ? 'Academia' : 'Em Casa'}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{getElapsedTime()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  {currentExercise.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentExercise.description}
                    </p>
                  )}

                  {/* Player de Vídeo */}
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

                  {/* Stats Cards: Séries, Repetições, Descanso */}
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="border border-border/50">
                      <CardContent className="p-3 text-center">
                        <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <p className="text-2xl font-bold">{currentExercise.sets || '3'}</p>
                        <p className="text-xs text-muted-foreground">Séries</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-border/50">
                      <CardContent className="p-3 text-center">
                        <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                          <Dumbbell className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold">{currentExercise.reps || '12'}</p>
                        <p className="text-xs text-muted-foreground">Repetições</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-border/50">
                      <CardContent className="p-3 text-center">
                        <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold">{currentExercise.rest_time || '60'}s</p>
                        <p className="text-xs text-muted-foreground">Descanso</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Dificuldade */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dificuldade</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize",
                        currentExercise.difficulty === 'easy' && "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
                        currentExercise.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
                        currentExercise.difficulty === 'hard' && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                      )}
                    >
                      {currentExercise.difficulty === 'easy' ? 'Fácil' : 
                       currentExercise.difficulty === 'intermediate' ? 'Intermediário' : 
                       currentExercise.difficulty === 'hard' ? 'Difícil' : 'Normal'}
                    </Badge>
                  </div>

                  {/* Botões: Instruções e Começar */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailedInstructions(!showDetailedInstructions)}
                      className="gap-2"
                    >
                      <Info className="w-4 h-4" />
                      Instruções
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white gap-2"
                      onClick={handleCompleteExercise}
                    >
                      <Play className="w-4 h-4" />
                      Começar
                    </Button>
                  </div>

                  {/* Instruções expandidas */}
                  <AnimatePresence>
                    {showDetailedInstructions && currentExercise.instructions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Card className="border border-border/50 bg-muted/30">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Info className="w-4 h-4 text-orange-500" />
                              <span className="font-medium">Como fazer</span>
                            </div>
                            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                              {currentExercise.instructions.map((step, i) => (
                                <li key={i} className="leading-relaxed">{step}</li>
                              ))}
                            </ol>
                            {currentExercise.tips && (
                              <div className="pt-3 border-t border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <Lightbulb className="w-4 h-4 text-amber-500" />
                                  <span className="font-medium text-sm">Dica do Personal</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{currentExercise.tips}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Lista de Exercícios do Dia */}
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Exercícios do Dia
                </span>
              </div>
              <div className="space-y-2">
                {workout.exercises.map((ex, i) => {
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
                        onClick={() => !showTimer && setCurrentIndex(i)}
                        disabled={showTimer}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                          isCurrent 
                            ? "bg-orange-100 dark:bg-orange-950 border border-orange-300 dark:border-orange-700" 
                            : isCompleted 
                              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                              : "bg-muted/30 border border-border/50 hover:bg-muted/50"
                        )}
                      >
                        {/* Número/Check */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                          isCurrent 
                            ? "bg-orange-500 text-white" 
                            : isCompleted 
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                        )}>
                          {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium text-sm truncate",
                            isCompleted && "line-through text-muted-foreground"
                          )}>
                            {ex.name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {ex.muscle_group} • {ex.sets || '3'}x{ex.reps || '12'} • {ex.rest_time || '60'}s desc
                          </p>
                        </div>

                        {/* Status/Arrow */}
                        <div className="shrink-0">
                          {isCompleted ? (
                            <Badge className="bg-green-500 text-white text-xs">Concluído</Badge>
                          ) : isCurrent ? (
                            <ChevronRight className="w-5 h-5 text-orange-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
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
                <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
                {completedCount === totalExercises && (
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={handleFinishWorkout}
                  >
                    <Trophy className="w-4 h-4 mr-1" />
                    Finalizar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};