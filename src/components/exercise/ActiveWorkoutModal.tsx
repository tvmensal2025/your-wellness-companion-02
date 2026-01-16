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
import {
  ArrowLeft,
  Check,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  SkipForward,
  Trophy,
  Instagram,
} from 'lucide-react';
import { Volume2, VolumeX } from 'lucide-react';
import { Exercise, WeeklyPlan } from '@/hooks/useExercisesLibrary';
import { RestTimer } from './RestTimer';
import { InlineRestTimer } from './InlineRestTimer';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { useWorkoutSound } from '@/hooks/useWorkoutSound';
import { WeightInputPopup } from './WeightInputPopup';
import { WorkoutShareModal } from './WorkoutShareModal';
import { ExerciseEvolutionPopup } from './ExerciseEvolutionPopup';
import { WorkoutTimer } from './workout/WorkoutTimer';
import { ExerciseDisplay } from './workout/ExerciseDisplay';
import { ProgressTracker } from './workout/ProgressTracker';

interface ActiveWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WeeklyPlan;
  onComplete: (completedExercises: string[]) => void;
}

export interface ExerciseProgress {
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
  const { toast } = useToast();
  const { 
    soundEnabled, 
    setSoundEnabled, 
    playStartBeep, 
    playPauseBeep, 
    playCountdownBeep, 
    playSetCompleteBeep,
    playFinishBeep,
    vibrateMedium 
  } = useWorkoutSound({ enabled: true });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutStartTime] = useState(Date.now());
  const [isExerciseStarted, setIsExerciseStarted] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [pendingExerciseForWeight, setPendingExerciseForWeight] = useState<Exercise | null>(null);
  const [workoutWeights, setWorkoutWeights] = useState<Record<string, number>>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEvolutionPopup, setShowEvolutionPopup] = useState(false);
  const [evolutionExercise, setEvolutionExercise] = useState<string>('');

  const [exerciseSeconds, setExerciseSeconds] = useState(0);
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [exerciseFeedback, setExerciseFeedback] = useState<'facil' | 'ok' | 'dificil' | null>(null);
  const [showInlineRest, setShowInlineRest] = useState(false);

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

  // Timer atualizado com precisão absoluta usando requestAnimationFrame
  useEffect(() => {
    let animationFrame: number;
    
    const tick = () => {
      setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
      animationFrame = requestAnimationFrame(tick);
    };
    
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [workoutStartTime]);

  useEffect(() => {
    setProgress(workout.exercises.map(ex => ({
      exerciseId: ex.id,
      completed: false,
      setsCompleted: 0
    })));
  }, [workout]);

  // Reset detalhes ao mudar de exercício
  useEffect(() => {
    setIsExerciseStarted(false);
    setExerciseSeconds(0);
    setIsExerciseTimerRunning(false);
    setCurrentSet(1);
    setExerciseFeedback(null);
    setShowInlineRest(false);
  }, [currentIndex]);

  // Ref para armazenar timestamp de início do exercício
  const exerciseStartTimeRef = React.useRef<number | null>(null);
  const exerciseBaseSecondsRef = React.useRef<number>(0);

  // Cronômetro do exercício com precisão absoluta (conta para cima)
  useEffect(() => {
    if (!isOpen || !isExerciseStarted || !isExerciseTimerRunning) {
      // Salvar segundos atuais quando pausa
      if (exerciseStartTimeRef.current) {
        exerciseBaseSecondsRef.current = exerciseSeconds;
        exerciseStartTimeRef.current = null;
      }
      return;
    }
    
    // Iniciar/continuar contagem
    if (!exerciseStartTimeRef.current) {
      exerciseStartTimeRef.current = Date.now();
    }
    
    let animationFrame: number;
    
    const tick = () => {
      if (!exerciseStartTimeRef.current) return;
      
      const elapsed = Math.floor((Date.now() - exerciseStartTimeRef.current) / 1000);
      setExerciseSeconds(exerciseBaseSecondsRef.current + elapsed);
      animationFrame = requestAnimationFrame(tick);
    };
    
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [isOpen, isExerciseStarted, isExerciseTimerRunning]);

  // Reset refs quando muda de exercício
  useEffect(() => {
    exerciseStartTimeRef.current = null;
    exerciseBaseSecondsRef.current = 0;
  }, [currentIndex]);

  const handleFinishWorkout = (progressOverride?: ExerciseProgress[]) => {
    const base = progressOverride ?? progress;
    const completedIds = base.filter((p) => p.completed).map((p) => p.exerciseId);
    
    // Mostrar tela de parabéns
    playFinishBeep();
    setShowCongratulations(true);
    
    // Confetti grande
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#22c55e', '#16a34a', '#f97316', '#eab308', '#ec4899'],
      scalar: 1.2,
    });
    
    // Auto fechar após 8 segundos (mais tempo para celebrar!)
    setTimeout(() => {
      onComplete(completedIds);
      onClose();
    }, 8000);
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

  // Salvar exercício no histórico para análise da Sofia e Dr. Vital
  const saveExerciseToHistory = useCallback(async (
    exercise: Exercise, 
    setsCompleted: number, 
    durationSeconds: number, 
    weightOrReps?: number,
    isBodyweight?: boolean
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const defaultReps = parseInt(String(exercise.reps || '0').replace(/\D/g, '')) || 0;
      // Se for bodyweight, o valor informado são as reps; senão, usa as reps padrão do exercício
      const repsCompleted = isBodyweight && weightOrReps ? weightOrReps : defaultReps;
      const weight = isBodyweight ? undefined : weightOrReps;

      const notesText = isBodyweight 
        ? `Treino: ${workout.dayName} | Reps: ${weightOrReps || defaultReps}`
        : weight 
          ? `Treino: ${workout.dayName} | Peso: ${weight}kg` 
          : `Treino: ${workout.dayName}`;

      // Salvar no user_exercise_history (histórico detalhado)
      await supabase.from('user_exercise_history').insert({
        user_id: user.id,
        exercise_name: exercise.name,
        exercise_type: exercise.muscle_group || 'general',
        sets_completed: setsCompleted,
        reps_completed: repsCompleted,
        duration_seconds: durationSeconds,
        calories_burned: 0,
        difficulty_level: exerciseFeedback || 'ok',
        notes: notesText,
        completed_at: new Date().toISOString()
      });

      // TAMBÉM salvar em exercise_sessions (usado pelo dashboard)
      const sessionDate = new Date().toISOString().slice(0, 10);
      const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
      
      // Verificar se já existe sessão para hoje
      const { data: existingSession } = await supabase
        .from('exercise_sessions')
        .select('id, exercises, duration_minutes')
        .eq('user_id', user.id)
        .eq('session_date', sessionDate)
        .maybeSingle();

      if (existingSession) {
        // Adicionar exercício à sessão existente
        const currentExercises = existingSession.exercises || [];
        const exerciseData = {
          name: exercise.name,
          sets: setsCompleted,
          reps: repsCompleted,
          weight: weight || null,
          muscle_group: exercise.muscle_group
        };
        
        await supabase
          .from('exercise_sessions')
          .update({
            exercises: [...(Array.isArray(currentExercises) ? currentExercises : []), exerciseData],
            duration_minutes: (existingSession.duration_minutes || 0) + durationMinutes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);
      } else {
        // Criar nova sessão do dia
        await supabase.from('exercise_sessions').insert({
          user_id: user.id,
          session_date: sessionDate,
          session_type: workout.dayName || 'Treino',
          exercises: [{
            name: exercise.name,
            sets: setsCompleted,
            reps: repsCompleted,
            weight: weight || null,
            muscle_group: exercise.muscle_group
          }],
          duration_minutes: durationMinutes,
          intensity_level: exerciseFeedback || 'moderate',
          notes: notesText,
          created_at: new Date().toISOString()
        });
      }

      // SEMPRE atualizar evolução (mesmo sem peso)
      const volume = (weight || 0) * repsCompleted * setsCompleted;
      
      // Verificar se já existe registro para este exercício
      const { data: existing } = await supabase
        .from('user_workout_evolution')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_name', exercise.name)
        .maybeSingle();

      if (existing) {
        const updateData: Record<string, any> = {
          total_sets: (existing.total_sets || 0) + setsCompleted,
          last_workout_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (isBodyweight && weightOrReps && weightOrReps > 0) {
          // Para exercícios de peso corporal, salvar reps
          updateData.last_reps = weightOrReps;
          updateData.max_reps = Math.max(existing.max_reps || 0, weightOrReps);
        } else if (weight && weight > 0) {
          // Para exercícios com peso, salvar peso
          updateData.weight_kg = weight;
          updateData.max_weight_kg = Math.max(existing.max_weight_kg || 0, weight);
          updateData.max_reps = Math.max(existing.max_reps || 0, repsCompleted);
          updateData.total_volume = (Number(existing.total_volume) || 0) + volume;
          updateData.progression_trend = weight > (existing.weight_kg || 0) ? 'up' : weight < (existing.weight_kg || 0) ? 'down' : 'stable';
        }

        await supabase
          .from('user_workout_evolution')
          .update(updateData)
          .eq('id', existing.id);
      } else {
        await supabase.from('user_workout_evolution').insert({
          user_id: user.id,
          exercise_name: exercise.name,
          weight_kg: weight || null,
          max_weight_kg: weight || null,
          max_reps: repsCompleted,
          last_reps: isBodyweight ? weightOrReps : null,
          total_sets: setsCompleted,
          total_volume: volume || null,
          last_workout_date: new Date().toISOString(),
          progression_trend: 'stable'
        });
      }
    } catch (error) {
      console.error('Erro ao salvar exercício no histórico:', error);
    }
  }, [workout.dayName, exerciseFeedback]);

  // Função para lidar com peso/reps do exercício
  const handleWeightSave = async (value: number | null, isBodyweight?: boolean) => {
    if (pendingExerciseForWeight) {
      if (value !== null && !isBodyweight) {
        // Só salvar no state de weights se for peso (não reps)
        setWorkoutWeights(prev => ({
          ...prev,
          [pendingExerciseForWeight.id]: value
        }));
      }
      
      // Salvar no histórico com peso ou reps
      await saveExerciseToHistory(
        pendingExerciseForWeight, 
        totalSetsForExercise, 
        exerciseSeconds,
        value || undefined,
        isBodyweight
      );
      
      // Animação de sucesso
      triggerSuccessAnimation();

      // Ir para próximo ou finalizar
      if (currentIndex < totalExercises - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        handleFinishWorkout();
      }
      
      setPendingExerciseForWeight(null);
    }
    setShowWeightInput(false);
  };

  const handleCompleteExercise = async () => {
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
    
    // Mostrar popup de peso (opcional)
    setPendingExerciseForWeight(currentExercise);
    setShowWeightInput(true);
  };

  const handleSkipExercise = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowTimer(false);
    }
  };

  const handleTimerComplete = () => {
    // Tocar som ao voltar para o exercício
    playStartBeep();
    vibrateMedium();
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

  const toggleExerciseTimer = () => {
    setIsExerciseTimerRunning((prev) => {
      if (prev) {
        playPauseBeep();
      } else {
        playStartBeep();
      }
      return !prev;
    });
  };

  const resetExerciseTimer = () => {
    setExerciseSeconds(0);
    setIsExerciseTimerRunning(false);
  };

  const handleBackToOverview = () => {
    setIsExerciseTimerRunning(false);
    setIsExerciseStarted(false);
  };

  const handleStartExercise = async () => {
    setIsExerciseStarted(true);
    setExerciseSeconds(0);
    setIsExerciseTimerRunning(true);
    setCurrentSet(Math.max(1, (progress[currentIndex]?.setsCompleted ?? 0) + 1));
    playStartBeep();
    vibrateMedium();
    
    // Verificar se tem histórico para mostrar popup de evolução
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentExercise) {
        const { data: evolution } = await supabase
          .from('user_workout_evolution')
          .select('total_sets')
          .eq('user_id', user.id)
          .eq('exercise_name', currentExercise.name)
          .maybeSingle();
        
        // Se tiver histórico, mostrar popup brevemente
        if (evolution && (evolution.total_sets || 0) > 0) {
          setEvolutionExercise(currentExercise.name);
          setShowEvolutionPopup(true);
          // Auto-fechar após 8 segundos (mais tempo para ler)
          setTimeout(() => setShowEvolutionPopup(false), 8000);
        }
      }
    } catch (err) {
      // Ignorar erros na busca de evolução
    }
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

    playSetCompleteBeep();
    vibrateMedium();

    if (currentSet < totalSetsForExercise) {
      // Mostrar timer de descanso inline (entre séries)
      setIsExerciseTimerRunning(false);
      setShowInlineRest(true);
      return;
    }

    playFinishBeep();
    toast({ title: '✅ Exercício concluído!', description: 'Boa! Vamos para o próximo.' });
    handleCompleteExercise();
  };

  // Quando o descanso inline termina
  const handleInlineRestComplete = () => {
    setShowInlineRest(false);
    setCurrentSet((prev) => Math.min(totalSetsForExercise, prev + 1));
    setIsExerciseTimerRunning(true);
    playStartBeep();
    vibrateMedium();
  };

  const parseRestTime = (restTime: string | number | null | undefined): number => {
    if (!restTime) return 60;
    if (typeof restTime === 'number') return restTime > 0 ? restTime : 60;
    const match = String(restTime).match(/(\d+)/);
    const parsed = match ? parseInt(match[1]) : 60;
    return parsed > 0 ? parsed : 60; // Garantir mínimo de 60s se 0 ou inválido
  };

  // Tela de parabéns
  if (showCongratulations) {
    const totalTime = Math.floor(elapsedTime / 60);
    const completedExercises = progress.filter(p => p.completed).length;
    const totalSets = progress.reduce((acc, p) => acc + p.setsCompleted, 0);

    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-sm p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Treino Concluído!</DialogTitle>
            <DialogDescription>Parabéns pelo treino</DialogDescription>
          </VisuallyHidden>
          
          <div className="p-6 text-center space-y-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
            {/* Ícone animado */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
              className="mx-auto"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Mensagem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">
                🎉 Treino Concluído!
              </h2>
              <p className="text-muted-foreground">
                Você arrasou! Continue assim!
              </p>
            </motion.div>

            {/* Estatísticas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-3"
            >
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-3 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-lg font-bold">{totalTime}</p>
                  <p className="text-[10px] text-muted-foreground">minutos</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-3 text-center">
                  <Dumbbell className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-lg font-bold">{completedExercises}</p>
                  <p className="text-[10px] text-muted-foreground">exercícios</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-3 text-center">
                  <Flame className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-lg font-bold">{totalSets}</p>
                  <p className="text-[10px] text-muted-foreground">séries</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Botões de ação */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <Button
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white gap-2"
                onClick={() => setShowShareModal(true)}
              >
                <Instagram className="w-4 h-4" />
                Compartilhar no Instagram
              </Button>
            </motion.div>

            {/* Botão principal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const completedIds = progress.filter(p => p.completed).map(p => p.exerciseId);
                  onComplete(completedIds);
                  onClose();
                }}
              >
                Voltar ao Dashboard
              </Button>
            </motion.div>
          </div>

          {/* Modal de compartilhamento */}
          <WorkoutShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            stats={{
              duration: totalTime,
              exercises: completedExercises,
              sets: totalSets,
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* Popup de peso */}
      <WeightInputPopup
        isOpen={showWeightInput}
        onClose={async () => {
          // SEMPRE salvar histórico, mesmo sem peso
          if (pendingExerciseForWeight) {
            await saveExerciseToHistory(
              pendingExerciseForWeight, 
              totalSetsForExercise, 
              exerciseSeconds,
              undefined // sem peso
            );
            triggerSuccessAnimation();
            if (currentIndex < totalExercises - 1) {
              setCurrentIndex((prev) => prev + 1);
            } else {
              handleFinishWorkout();
            }
          }
          setShowWeightInput(false);
          setPendingExerciseForWeight(null);
        }}
        exerciseName={pendingExerciseForWeight?.name || ''}
        onSave={handleWeightSave}
      />
      
      {/* Popup de Evolução do Exercício */}
      <ExerciseEvolutionPopup
        isOpen={showEvolutionPopup}
        onClose={() => setShowEvolutionPopup(false)}
        exerciseName={evolutionExercise}
      />
      
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-16px)] max-w-[400px] max-h-[90vh] p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Treino Ativo - {workout.title}</DialogTitle>
          <DialogDescription>Acompanhe seu progresso durante o treino</DialogDescription>
        </VisuallyHidden>
        
        <ScrollArea className="max-h-[90vh]">
          <div className="p-3 space-y-3">
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
                    externalSoundEnabled={soundEnabled}
                    onCountdownBeep={playCountdownBeep}
                    onFinishBeep={playFinishBeep}
                  />
                  
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2"
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
                  {/* Header: Título + Badge Local + Timer + Som */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{currentExercise.name}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Botão de som */}
                      <button
                        type="button"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-1.5 rounded-full hover:bg-muted transition-colors"
                        title={soundEnabled ? 'Desativar som' : 'Ativar som'}
                      >
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{getElapsedTime()}</span>
                      </div>
                    </div>
                  </div>

                  {!isExerciseStarted ? (
                    <ExerciseDisplay
                      exercise={currentExercise}
                      onStart={handleStartExercise}
                      onShowEvolution={() => {
                        setEvolutionExercise(currentExercise.name);
                        setShowEvolutionPopup(true);
                      }}
                    />
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

                      {/* Timer Component */}
                      <WorkoutTimer
                        isRunning={isExerciseTimerRunning}
                        seconds={exerciseSeconds}
                        onToggle={toggleExerciseTimer}
                        onReset={resetExerciseTimer}
                        feedback={exerciseFeedback}
                        onFeedbackChange={setExerciseFeedback}
                      />

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

                      {/* Timer de descanso inline (entre séries) */}
                      <AnimatePresence>
                        {showInlineRest && (
                          <InlineRestTimer
                            seconds={parseRestTime(currentExercise?.rest_time)}
                            onComplete={handleInlineRestComplete}
                            onSkip={handleInlineRestComplete}
                            autoStart={true}
                            soundEnabled={soundEnabled}
                            onCountdownBeep={playCountdownBeep}
                            onFinishBeep={playStartBeep}
                            nextSetNumber={currentSet + 1}
                            totalSets={totalSetsForExercise}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Progress Tracker Component */}
            <ProgressTracker
              exercises={workout.exercises}
              progress={progress}
              currentIndex={currentIndex}
              currentSet={currentSet}
              totalSets={totalSetsForExercise}
              repsLabel={repsLabel}
              onExerciseSelect={setCurrentIndex}
              onPreviousSet={() => setCurrentSet((prev) => Math.max(1, prev - 1))}
              onNextSet={() => setCurrentSet((prev) => Math.min(totalSetsForExercise, prev + 1))}
              onConcludeSet={handleConcludeSetOrExercise}
              onCancel={onClose}
              onFinish={() => handleFinishWorkout()}
              showTimer={showTimer}
              showInlineRest={showInlineRest}
              isExerciseStarted={isExerciseStarted}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
  );
};