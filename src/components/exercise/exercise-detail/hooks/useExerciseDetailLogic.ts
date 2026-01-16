// ============================================
// 🎯 USE EXERCISE DETAIL LOGIC
// Lógica de navegação entre steps do exercício
// ============================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeHeartRate } from '@/hooks/useRealTimeHeartRate';
import { extractYouTubeId, formatDifficulty } from '@/lib/exercise-format';

export type Step = 'overview' | 'instructions' | 'execution';

// Helpers
function asText(input: unknown): string {
  if (input == null) return '';
  if (Array.isArray(input)) return input.filter(Boolean).join(' ');
  return String(input);
}

function asStringList(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String).filter(Boolean);
  return [String(input)].filter(Boolean);
}

function createSummary(description: string, maxLength = 120): string {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  const trimmed = description.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  return trimmed.substring(0, lastSpace > 80 ? lastSpace : maxLength) + '...';
}

interface UseExerciseDetailLogicProps {
  isOpen: boolean;
  exerciseData: any;
  onClose: () => void;
}

export function useExerciseDetailLogic({ isOpen, exerciseData, onClose }: UseExerciseDetailLogicProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [currentStep, setCurrentStep] = useState<Step>('overview');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [showDetailedInstructions, setShowDetailedInstructions] = useState(false);
  const [showDetailedTips, setShowDetailedTips] = useState(false);

  // Parsed data
  const exerciseId = useMemo(() => exerciseData?.id || '', [exerciseData]);
  const name = useMemo(() => asText(exerciseData?.name) || 'Exercício', [exerciseData]);
  const description = useMemo(
    () => asText(exerciseData?.descricao ?? exerciseData?.description),
    [exerciseData]
  );
  const descriptionSummary = useMemo(() => createSummary(description), [description]);

  const sets = useMemo(() => asText(exerciseData?.series ?? exerciseData?.sets) || '3', [exerciseData]);
  const reps = useMemo(() => asText(exerciseData?.repeticoes ?? exerciseData?.reps) || '12', [exerciseData]);
  const rest = useMemo(
    () => asText(exerciseData?.descanso ?? exerciseData?.rest_time) || '60s',
    [exerciseData]
  );

  const totalSets = useMemo(() => {
    const nums = (sets.match(/\d+/g) || [])
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n) && n > 0);
    return nums.length ? Math.max(...nums) : 3;
  }, [sets]);

  const instructions = useMemo(
    () => asStringList(exerciseData?.instrucoes ?? exerciseData?.instructions),
    [exerciseData]
  );

  const tips = useMemo(() => asStringList(exerciseData?.dicas ?? exerciseData?.tips), [exerciseData]);

  const videoUrl = useMemo(
    () =>
      asText(
        exerciseData?.youtubeUrl ??
          exerciseData?.youtube_url ??
          exerciseData?.video_url ??
          exerciseData?.videoUrl
      ),
    [exerciseData]
  );

  const videoId = useMemo(() => extractYouTubeId(videoUrl), [videoUrl]);

  const difficultyRaw = useMemo(
    () => asText(exerciseData?.nivel ?? exerciseData?.difficulty),
    [exerciseData]
  );
  const difficulty = useMemo(() => formatDifficulty(difficultyRaw), [difficultyRaw]);

  // Heart rate
  const heartRate = useRealTimeHeartRate(isOpen && currentStep === 'execution');

  // Summaries
  const instructionsSummary = useMemo(() => {
    if (instructions.length === 0) return '';
    const firstSteps = instructions.slice(0, 2);
    return firstSteps.map((step, i) => `${i + 1}. ${step}`).join(' ');
  }, [instructions]);

  const tipsSummary = useMemo(() => {
    if (tips.length === 0) return '';
    return tips[0];
  }, [tips]);

  // Reset on open
  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep('overview');
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setCurrentSet(1);
    setShowDetailedInstructions(false);
    setShowDetailedTips(false);
  }, [isOpen, name]);

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Actions
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const toggleTimer = useCallback(() => setIsTimerRunning((prev) => !prev), []);
  
  const resetTimer = useCallback(() => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
  }, []);

  const startExecution = useCallback(() => {
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setCurrentSet(1);
    setCurrentStep('execution');
    if (heartRate.isConnected) heartRate.sync();
  }, [heartRate]);

  const goToOverview = useCallback(() => setCurrentStep('overview'), []);
  const goToInstructions = useCallback(() => setCurrentStep('instructions'), []);

  const prevSet = useCallback(() => {
    setCurrentSet((prev) => Math.max(1, prev - 1));
  }, []);

  const nextSet = useCallback(() => {
    setCurrentSet((prev) => Math.min(totalSets, prev + 1));
  }, [totalSets]);

  const completeSet = useCallback(() => {
    if (currentSet < totalSets) {
      toast({
        title: `Série ${currentSet} concluída!`,
        description: `Descanse ${rest} e siga para a próxima.`,
      });
      setCurrentSet((prev) => Math.min(totalSets, prev + 1));
      return;
    }
    toast({ title: '✅ Exercício concluído!', description: 'Boa! Vamos para o próximo.' });
    onClose();
  }, [currentSet, totalSets, rest, toast, onClose]);

  const connectGoogleFit = useCallback(() => {
    navigate('/google-fit-oauth?auto=1');
  }, [navigate]);

  return {
    // State
    currentStep,
    timerSeconds,
    isTimerRunning,
    currentSet,
    showDetailedInstructions,
    showDetailedTips,
    
    // Parsed data
    exerciseId,
    name,
    description,
    descriptionSummary,
    sets,
    reps,
    rest,
    totalSets,
    instructions,
    tips,
    videoId,
    difficultyRaw,
    difficulty,
    instructionsSummary,
    tipsSummary,
    
    // Heart rate
    heartRate,
    
    // Actions
    formatTime,
    toggleTimer,
    resetTimer,
    startExecution,
    goToOverview,
    goToInstructions,
    prevSet,
    nextSet,
    completeSet,
    connectGoogleFit,
    setShowDetailedInstructions,
    setShowDetailedTips,
  };
}

export type ExerciseDetailLogicReturn = ReturnType<typeof useExerciseDetailLogic>;
