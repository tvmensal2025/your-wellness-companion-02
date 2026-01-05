import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Info,
  Lightbulb,
  Minus,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Trophy,
  X,
  Youtube,
} from 'lucide-react';
import { Exercise, WeeklyPlan } from '@/hooks/useExercisesLibrary';
import { RestTimer } from './RestTimer';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

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
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutStartTime] = useState(Date.now());
  const [showDetailedInstructions, setShowDetailedInstructions] = useState(false);
  const [showDetailedTips, setShowDetailedTips] = useState(false);
  const [isExerciseStarted, setIsExerciseStarted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const [exerciseSeconds, setExerciseSeconds] = useState(0);
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [exerciseFeedback, setExerciseFeedback] = useState<'facil' | 'ok' | 'dificil' | null>(null);

  const [elapsedTime, setElapsedTime] = useState(0);

  const currentExercise = workout.exercises[currentIndex];

  const totalSetsForExercise = useMemo(() => {
    const raw = currentExercise?.sets;
    const nums = (String(raw ?? '').match(/\d+/g) || [])
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n) && n > 0);
    return nums.length ? Math.max(...nums) : 3;
  }, [currentExercise?.sets]);

  const repsLabel = useMemo(() => String(currentExercise?.reps ?? '12'), [currentExercise?.reps]);

  const totalExercises = workout.exercises.length;
  const completedCount = progress.filter((p) => p.completed).length;
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
    setExerciseSeconds(0);
    setIsExerciseTimerRunning(false);
    setShowVideo(false);
    setCurrentSet(1);
    setExerciseFeedback(null);
  }, [currentIndex]);

  // Cronômetro do exercício (conta para cima)
  useEffect(() => {
    if (!isOpen || !isExerciseStarted || !isExerciseTimerRunning) return;
    const interval = setInterval(() => {
      setExerciseSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isExerciseStarted, isExerciseTimerRunning, currentIndex]);

  const handleFinishWorkout = (progressOverride?: ExerciseProgress[]) => {
    const base = progressOverride ?? progress;
    const completedIds = base.filter((p) => p.completed).map((p) => p.exerciseId);
    onComplete(completedIds);
    onClose();
  };

  // Animação de confete ao completar exercício
  const triggerSuccessAnimation = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#16a34a', '#4ade80', '#86efac'],
      scalar: 0.8,
      gravity: 1.2,
      drift: 0,
      ticks: 150,
    });
  }, []);

  const handleCompleteExercise = () => {
    const nextProgress = progress.map((p, i) =>
      i === currentIndex
        ? {
            ...p,
            completed: true,
            setsCompleted: Math.max(p.setsCompleted, totalSetsForExercise),
          }
        : p
    );

    setProgress(nextProgress);
    setIsExerciseTimerRunning(false);
    
    // Animação de sucesso
    triggerSuccessAnimation();

    // Ir direto para o próximo exercício
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishWorkout(nextProgress);
    }
  };

  const handleSkipExercise = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowTimer(false);
    }
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const getElapsedTime = () => {
    const mins = Math.floor(elapsedTime / 60);
    const secs = elapsedTime % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatExerciseTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExerciseTimer = () => setIsExerciseTimerRunning((prev) => !prev);

  const resetExerciseTimer = () => {
    setExerciseSeconds(0);
    setIsExerciseTimerRunning(false);
  };

  const handleBackToOverview = () => {
    setIsExerciseTimerRunning(false);
    setIsExerciseStarted(false);
  };

  const handleStartExercise = () => {
    setIsExerciseStarted(true);
    setExerciseSeconds(0);
    setIsExerciseTimerRunning(true);
    setCurrentSet(Math.max(1, (progress[currentIndex]?.setsCompleted ?? 0) + 1));
  };

  const handleConcludeSetOrExercise = () => {
    setProgress((prev) =>
      prev.map((p, i) =>
        i === currentIndex
          ? {
              ...p,
              setsCompleted: Math.min(totalSetsForExercise, (p.setsCompleted ?? 0) + 1),
            }
          : p
      )
    );

    if (currentSet < totalSetsForExercise) {
      toast({
        title: `Série ${currentSet} concluída!`,
        description: `Descanse ${parseRestTime(currentExercise?.rest_time)}s e siga para a próxima.`,
      });
      setCurrentSet((prev) => Math.min(totalSetsForExercise, prev + 1));
      return;
    }

    toast({ title: '✅ Exercício concluído!', description: 'Boa! Vamos para o próximo.' });
    handleCompleteExercise();
  };

  const parseRestTime = (restTime: string | number | null | undefined): number => {
    if (!restTime) return 60;
    if (typeof restTime === 'number') return restTime > 0 ? restTime : 60;
    const match = String(restTime).match(/(\d+)/);
    const parsed = match ? parseInt(match[1]) : 60;
    return parsed > 0 ? parsed : 60; // Garantir mínimo de 60s se 0 ou inválido
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
                  className="text-center space-y-6"
                >
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-600">Exercício Concluído! 💪</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Próximo: <span className="font-medium">{workout.exercises[currentIndex + 1]?.name}</span>
                    </p>
                  </div>
                  
                  <RestTimer 
                    defaultSeconds={parseRestTime(currentExercise?.rest_time)}
                    onComplete={handleTimerComplete}
                    autoStart={true}
                  />
                  
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white gap-2"
                    onClick={handleTimerComplete}
                  >
                    <SkipForward className="w-4 h-4" />
                    Ir para Próximo Exercício
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

                  {/* Player de Vídeo - Collapsible */}
                  {youtubeId && (
                    <div className="rounded-lg overflow-hidden border border-border/50">
                      <button
                        type="button"
                        onClick={() => setShowVideo(!showVideo)}
                        className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Youtube className="w-5 h-5 text-red-500" />
                          <span className="text-sm font-medium">Ver vídeo do exercício</span>
                        </div>
                        {showVideo ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {showVideo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="aspect-video">
                              <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                                title={`Vídeo: ${currentExercise.name}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {!isExerciseStarted ? (
                    <>
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
                            <p className="text-2xl font-bold">{parseRestTime(currentExercise.rest_time)}s</p>
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
                          onClick={handleStartExercise}
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
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBackToOverview}
                          className="h-8 px-2 gap-1"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Voltar
                        </Button>
                      </div>

                      {/* Timer elegante */}
                      <Card className="border-0 bg-gradient-to-br from-primary/15 to-accent/15">
                        <CardContent className="p-4 text-center space-y-3">
                          <Timer className="w-8 h-8 mx-auto text-primary" />
                          <div className="text-4xl font-bold text-primary font-mono">
                            {formatExerciseTime(exerciseSeconds)}
                          </div>

                          <div className="flex gap-2 justify-center">
                            <Button size="sm" onClick={toggleExerciseTimer} className="px-6">
                              {isExerciseTimerRunning ? (
                                <>
                                  <Pause className="w-4 h-4 mr-1" />
                                  Pausar
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-1" />
                                  Iniciar
                                </>
                              )}
                            </Button>
                            <Button size="sm" variant="outline" onClick={resetExerciseTimer}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="pt-2 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-2">Como foi?</p>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => setExerciseFeedback('facil')}
                                className={cn(
                                  "rounded-lg border p-2 text-center transition-colors",
                                  exerciseFeedback === 'facil'
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-background/50 text-muted-foreground hover:bg-muted/30"
                                )}
                              >
                                <ThumbsUp className="w-4 h-4 mx-auto mb-1" />
                                <span className="text-[10px] font-medium">Fácil</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setExerciseFeedback('ok')}
                                className={cn(
                                  "rounded-lg border p-2 text-center transition-colors",
                                  exerciseFeedback === 'ok'
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-background/50 text-muted-foreground hover:bg-muted/30"
                                )}
                              >
                                <Minus className="w-4 h-4 mx-auto mb-1" />
                                <span className="text-[10px] font-medium">OK</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setExerciseFeedback('dificil')}
                                className={cn(
                                  "rounded-lg border p-2 text-center transition-colors",
                                  exerciseFeedback === 'dificil'
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-background/50 text-muted-foreground hover:bg-muted/30"
                                )}
                              >
                                <ThumbsDown className="w-4 h-4 mx-auto mb-1" />
                                <span className="text-[10px] font-medium">Difícil</span>
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Heart Rate (placeholder) */}
                      <Card className="border-0 bg-muted/30">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Heart
                              className={cn(
                                "w-6 h-6",
                                isExerciseTimerRunning ? "text-destructive animate-pulse" : "text-muted-foreground"
                              )}
                            />
                            <div>
                              <div className="font-semibold">--</div>
                              <div className="text-xs text-muted-foreground">Frequência Cardíaca</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Série atual */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">
                            Série {currentSet} de {totalSetsForExercise}
                          </span>
                          <span className="text-muted-foreground">{repsLabel} repetições</span>
                        </div>
                        <Progress value={(currentSet / Math.max(1, totalSetsForExercise)) * 100} className="h-2" />
                      </div>

                      {/* Controles */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          disabled={currentSet <= 1}
                          onClick={() => setCurrentSet((prev) => Math.max(1, prev - 1))}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button onClick={handleConcludeSetOrExercise} className="gap-2">
                          <Check className="w-4 h-4" />
                          Concluir
                        </Button>
                        <Button
                          variant="outline"
                          disabled={currentSet >= totalSetsForExercise}
                          onClick={() => setCurrentSet((prev) => Math.min(totalSetsForExercise, prev + 1))}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
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
                            {ex.muscle_group} • {ex.sets || '3'}x{ex.reps || '12'} • {parseRestTime(ex.rest_time)}s desc
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
                    onClick={() => handleFinishWorkout()}
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