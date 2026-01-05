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
  Lightbulb,
  Timer,
  Activity
} from 'lucide-react';
import { Exercise, WeeklyPlan } from '@/hooks/useExercisesLibrary';
import { RestTimer } from './RestTimer';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  timeSpentSeconds: number;
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [exerciseStartTime, setExerciseStartTime] = useState<number | null>(null);
  const [isSyncingGoogleFit, setIsSyncingGoogleFit] = useState(false);

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
      setsCompleted: 0,
      timeSpentSeconds: 0
    })));
  }, [workout]);

  // Timer do exercício atual
  useEffect(() => {
    if (isExerciseStarted && !isPaused && !showTimer) {
      const interval = setInterval(() => {
        setExerciseTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isExerciseStarted, isPaused, showTimer]);

  // Reset detalhes ao mudar de exercício
  useEffect(() => {
    setShowDetailedInstructions(false);
    setShowDetailedTips(false);
    setIsExerciseStarted(false);
    setExerciseTime(0);
    setExerciseStartTime(null);
  }, [currentIndex]);

  const handleCompleteExercise = () => {
    // Salvar tempo gasto no exercício atual
    setProgress(prev => prev.map((p, i) => 
      i === currentIndex ? { ...p, completed: true, timeSpentSeconds: exerciseTime } : p
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

  // Função para sincronizar com Google Fit
  const syncWithGoogleFit = useCallback(async (totalMinutes: number, totalCalories: number) => {
    try {
      setIsSyncingGoogleFit(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.log('Usuário não autenticado para sync Google Fit');
        return;
      }

      // Verificar se o usuário tem Google Fit conectado
      const { data: fitToken } = await supabase
        .from('google_fit_tokens')
        .select('access_token')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!fitToken?.access_token) {
        console.log('Google Fit não conectado');
        return;
      }

      // Chamar edge function para registrar o treino
      const { error } = await supabase.functions.invoke('google-fit-sync', {
        body: {
          action: 'sync',
          workout_data: {
            type: 'strength_training',
            duration_minutes: totalMinutes,
            calories_burned: totalCalories,
            exercises_completed: progress.filter(p => p.completed).length,
            total_exercises: workout.exercises.length,
            workout_name: workout.title,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('Erro ao sincronizar com Google Fit:', error);
      } else {
        toast({
          title: "📊 Google Fit",
          description: "Treino sincronizado com sucesso!",
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar Google Fit:', error);
    } finally {
      setIsSyncingGoogleFit(false);
    }
  }, [progress, workout, toast]);

  const handleFinishWorkout = async () => {
    const completedIds = progress.filter(p => p.completed).map(p => p.exerciseId);
    const totalTimeSeconds = progress.reduce((acc, p) => acc + p.timeSpentSeconds, 0) + elapsedTime;
    const totalMinutes = Math.round(totalTimeSeconds / 60);
    
    // Estimar calorias (aproximadamente 5-8 calorias por minuto de treino de força)
    const estimatedCalories = Math.round(totalMinutes * 6.5);
    
    // Tentar sincronizar com Google Fit
    await syncWithGoogleFit(totalMinutes, estimatedCalories);
    
    onComplete(completedIds);
    onClose();
  };

  const getElapsedTime = () => {
    const mins = Math.floor(elapsedTime / 60);
    const secs = elapsedTime % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseTime = () => {
    const mins = Math.floor(exerciseTime / 60);
    const secs = exerciseTime % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExercise = () => {
    setIsExerciseStarted(true);
    setExerciseStartTime(Date.now());
  };

  const handlePauseExercise = () => {
    setIsPaused(!isPaused);
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

                  {/* Player de Vídeo - sempre visível se disponível */}
                  {youtubeId ? (
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
                  ) : (
                    <div className="aspect-video rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Youtube className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Vídeo não disponível</p>
                      </div>
                    </div>
                  )}

                  {/* Timer do exercício atual */}
                  {isExerciseStarted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                            <Timer className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tempo do exercício</p>
                            <p className="text-3xl font-bold font-mono text-orange-500">{getExerciseTime()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePauseExercise}
                            className={cn(
                              "rounded-full",
                              isPaused && "border-orange-500 text-orange-500"
                            )}
                          >
                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
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

                  {/* Dificuldade + Google Fit Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity className="w-3 h-3" />
                      <span>Google Fit</span>
                    </div>
                  </div>

                  {/* Botões: Instruções e Começar/Concluir */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailedInstructions(!showDetailedInstructions)}
                      className="gap-2"
                    >
                      <Info className="w-4 h-4" />
                      Instruções
                    </Button>
                    {!isExerciseStarted ? (
                      <Button
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white gap-2"
                        onClick={handleStartExercise}
                      >
                        <Play className="w-4 h-4" />
                        Começar
                      </Button>
                    ) : (
                      <Button
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white gap-2"
                        onClick={handleCompleteExercise}
                      >
                        <Check className="w-4 h-4" />
                        Concluir
                      </Button>
                    )}
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