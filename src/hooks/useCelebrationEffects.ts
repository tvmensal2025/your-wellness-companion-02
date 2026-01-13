import { useState, useRef, useCallback, useEffect } from 'react';

export const useCelebrationEffects = () => {
  const [activeCelebration, setActiveCelebration] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const triggerCelebrationWithDuration = useCallback((duration: number) => {
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setActiveCelebration(true);
    
    timeoutRef.current = setTimeout(() => {
      setActiveCelebration(false);
      timeoutRef.current = null;
    }, duration);
  }, []);

  const celebrateDesafioCompletion = useCallback(() => {
    triggerCelebrationWithDuration(3000);
  }, [triggerCelebrationWithDuration]);

  const celebrateProgressUpdate = useCallback(() => {
    triggerCelebrationWithDuration(2000);
  }, [triggerCelebrationWithDuration]);

  const celebrateParticipation = useCallback(() => {
    triggerCelebrationWithDuration(1500);
  }, [triggerCelebrationWithDuration]);

  const celebrateGoalCompletion = useCallback(() => {
    triggerCelebrationWithDuration(3000);
  }, [triggerCelebrationWithDuration]);

  const triggerCelebration = useCallback((_message?: string) => {
    triggerCelebrationWithDuration(2000);
  }, [triggerCelebrationWithDuration]);

  return {
    activeCelebration,
    celebrateDesafioCompletion,
    celebrateProgressUpdate,
    celebrateParticipation,
    celebrateGoalCompletion,
    triggerCelebration
  };
};
