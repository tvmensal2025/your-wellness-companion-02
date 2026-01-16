import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseTimerLogicProps {
  initialSeconds: number;
  autoStart?: boolean;
  variant?: 'full' | 'compact' | 'inline' | 'mini';
  onComplete?: () => void;
  onCountdownTick?: (seconds: number) => void;
}

export interface UseTimerLogicReturn {
  seconds: number;
  isRunning: boolean;
  progress: number;
  isLow: boolean;
  isComplete: boolean;
  showPulse: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  adjustTime: (delta: number) => void;
  setPreset: (seconds: number) => void;
  formatTime: (s: number) => string;
}

export const useTimerLogic = ({
  initialSeconds,
  autoStart = false,
  variant = 'full',
  onComplete,
  onCountdownTick,
}: UseTimerLogicProps): UseTimerLogicReturn => {
  // Estado do timer
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [showPulse, setShowPulse] = useState(false);
  
  // Refs para precisão do timer
  const startTimestampRef = useRef<number | null>(null);
  const pausedSecondsRef = useRef<number>(initialSeconds);
  const animationFrameRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const hasCompletedRef = useRef<boolean>(false);

  // Valores computados
  const progress = (seconds / initialSeconds) * 100;
  const isLow = seconds <= 3 && seconds > 0;
  const isComplete = seconds === 0;

  // Formatar tempo
  const formatTime = useCallback((s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Lógica principal do timer
  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    if (!startTimestampRef.current) {
      startTimestampRef.current = Date.now();
      hasCompletedRef.current = false;
    }

    const tick = () => {
      if (!startTimestampRef.current || hasCompletedRef.current) return;

      const elapsed = (Date.now() - startTimestampRef.current) / 1000;
      const remaining = Math.max(0, Math.ceil(pausedSecondsRef.current - elapsed));
      
      setSeconds(remaining);

      // Timer completou
      if (remaining <= 0 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setIsRunning(false);
        startTimestampRef.current = null;
        
        // Auto-completar após delay baseado na variante
        const delay = variant === 'mini' ? 500 : variant === 'compact' ? 800 : 1500;
        setTimeout(() => {
          onComplete?.();
        }, delay);
        return;
      }

      // Callback nos últimos 3 segundos
      if (remaining <= 3 && remaining > 0 && remaining !== lastBeepSecondRef.current) {
        lastBeepSecondRef.current = remaining;
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), variant === 'mini' ? 100 : 200);
        onCountdownTick?.(remaining);
      }

      if (remaining > 0) {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, variant, onComplete, onCountdownTick]);

  // Auto-start
  useEffect(() => {
    if (autoStart && !isRunning && seconds > 0) {
      setIsRunning(true);
    }
  }, [autoStart]);

  // Toggle timer (play/pause)
  const toggleTimer = useCallback(() => {
    if (seconds === 0) {
      pausedSecondsRef.current = initialSeconds;
      setSeconds(initialSeconds);
      lastBeepSecondRef.current = null;
      hasCompletedRef.current = false;
    }
    
    if (isRunning) {
      pausedSecondsRef.current = seconds;
      startTimestampRef.current = null;
    } else {
      startTimestampRef.current = Date.now();
    }
    
    setIsRunning(!isRunning);
  }, [seconds, isRunning, initialSeconds]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setSeconds(initialSeconds);
    pausedSecondsRef.current = initialSeconds;
    startTimestampRef.current = null;
    lastBeepSecondRef.current = null;
    hasCompletedRef.current = false;
  }, [initialSeconds]);

  // Ajustar tempo
  const adjustTime = useCallback((delta: number) => {
    if (isRunning) return;
    const maxTime = variant === 'mini' ? 120 : 300;
    const newSeconds = Math.max(5, Math.min(maxTime, seconds + delta));
    setSeconds(newSeconds);
    pausedSecondsRef.current = newSeconds;
  }, [isRunning, seconds, variant]);

  // Definir preset
  const setPreset = useCallback((presetSeconds: number) => {
    if (isRunning) return;
    setSeconds(presetSeconds);
    pausedSecondsRef.current = presetSeconds;
  }, [isRunning]);

  return {
    seconds,
    isRunning,
    progress,
    isLow,
    isComplete,
    showPulse,
    toggleTimer,
    resetTimer,
    adjustTime,
    setPreset,
    formatTime,
  };
};
