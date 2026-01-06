import { useCallback, useRef, useState } from 'react';
import { useHaptics } from './useHaptics';

interface LongPressConfig {
  delay?: number;
  onLongPress: () => void;
  onPress?: () => void;
  onPressStart?: () => void;
  onPressEnd?: () => void;
  hapticFeedback?: boolean;
  moveTolerance?: number;
}

interface LongPressHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
}

interface UseLongPressReturn {
  handlers: LongPressHandlers;
  isPressed: boolean;
  isLongPressed: boolean;
  pressProgress: number;
}

export function useLongPress(config: LongPressConfig): UseLongPressReturn {
  const {
    delay = 500,
    onLongPress,
    onPress,
    onPressStart,
    onPressEnd,
    hapticFeedback = true,
    moveTolerance = 10,
  } = config;

  const { mediumImpact, heavyImpact } = useHaptics();
  const [isPressed, setIsPressed] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startPress = useCallback((x: number, y: number) => {
    startPosRef.current = { x, y };
    isLongPressRef.current = false;
    setIsPressed(true);
    setIsLongPressed(false);
    setPressProgress(0);
    onPressStart?.();

    // Progress animation
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / delay, 1);
      setPressProgress(progress);
    }, 16);

    // Long press timer
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsLongPressed(true);
      if (hapticFeedback) heavyImpact();
      onLongPress();
      clearTimers();
    }, delay);
  }, [delay, onPressStart, onLongPress, hapticFeedback, heavyImpact, clearTimers]);

  const endPress = useCallback(() => {
    clearTimers();
    
    if (!isLongPressRef.current && isPressed) {
      // Regular tap
      if (hapticFeedback) mediumImpact();
      onPress?.();
    }

    setIsPressed(false);
    setIsLongPressed(false);
    setPressProgress(0);
    onPressEnd?.();
  }, [clearTimers, isPressed, hapticFeedback, mediumImpact, onPress, onPressEnd]);

  const cancelPress = useCallback(() => {
    clearTimers();
    setIsPressed(false);
    setIsLongPressed(false);
    setPressProgress(0);
  }, [clearTimers]);

  const checkMove = useCallback((x: number, y: number) => {
    const deltaX = Math.abs(x - startPosRef.current.x);
    const deltaY = Math.abs(y - startPosRef.current.y);
    if (deltaX > moveTolerance || deltaY > moveTolerance) {
      cancelPress();
    }
  }, [moveTolerance, cancelPress]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPress(touch.clientX, touch.clientY);
  }, [startPress]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    checkMove(touch.clientX, touch.clientY);
  }, [checkMove]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    endPress();
  }, [endPress]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startPress(e.clientX, e.clientY);
  }, [startPress]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    endPress();
  }, [endPress]);

  const onMouseLeave = useCallback((e: React.MouseEvent) => {
    cancelPress();
  }, [cancelPress]);

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
    },
    isPressed,
    isLongPressed,
    pressProgress,
  };
}
