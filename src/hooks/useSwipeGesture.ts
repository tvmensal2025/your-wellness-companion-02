import { useState, useRef, useCallback, TouchEvent } from 'react';
import { useHaptics } from './useHaptics';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

interface SwipeConfig {
  threshold?: number;
  velocityThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: (direction: SwipeDirection) => void;
  hapticFeedback?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  isSwiping: boolean;
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

interface UseSwipeGestureReturn {
  handlers: SwipeHandlers;
  swipeDirection: SwipeDirection;
  swipeDistance: { x: number; y: number };
  isSwiping: boolean;
  swipeProgress: number;
}

export function useSwipeGesture(config: SwipeConfig = {}): UseSwipeGestureReturn {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeEnd,
    hapticFeedback = true,
  } = config;

  const { lightImpact } = useHaptics();
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const [swipeDistance, setSwipeDistance] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const stateRef = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
  });

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: true,
    };
    setIsSwiping(true);
    onSwipeStart?.();
  }, [onSwipeStart]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!stateRef.current.isSwiping) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - stateRef.current.startX;
    const deltaY = touch.clientY - stateRef.current.startY;

    stateRef.current.currentX = touch.clientX;
    stateRef.current.currentY = touch.clientY;

    setSwipeDistance({ x: deltaX, y: deltaY });

    // Calculate progress based on threshold
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const maxDelta = Math.max(absX, absY);
    const progress = Math.min(maxDelta / threshold, 1);
    setSwipeProgress(progress);

    // Determine direction during swipe
    if (absX > absY) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(deltaY > 0 ? 'down' : 'up');
    }
  }, [threshold]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!stateRef.current.isSwiping) return;

    const deltaX = stateRef.current.currentX - stateRef.current.startX;
    const deltaY = stateRef.current.currentY - stateRef.current.startY;
    const deltaTime = Date.now() - stateRef.current.startTime;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Calculate velocity
    const velocityX = absX / deltaTime;
    const velocityY = absY / deltaTime;

    let direction: SwipeDirection = null;

    // Check if swipe meets threshold or velocity requirements
    const meetsThreshold = absX > threshold || absY > threshold;
    const meetsVelocity = velocityX > velocityThreshold || velocityY > velocityThreshold;

    if (meetsThreshold || meetsVelocity) {
      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
        if (direction === 'left' && onSwipeLeft) {
          if (hapticFeedback) lightImpact();
          onSwipeLeft();
        } else if (direction === 'right' && onSwipeRight) {
          if (hapticFeedback) lightImpact();
          onSwipeRight();
        }
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
        if (direction === 'up' && onSwipeUp) {
          if (hapticFeedback) lightImpact();
          onSwipeUp();
        } else if (direction === 'down' && onSwipeDown) {
          if (hapticFeedback) lightImpact();
          onSwipeDown();
        }
      }
    }

    // Reset state
    stateRef.current.isSwiping = false;
    setIsSwiping(false);
    setSwipeDistance({ x: 0, y: 0 });
    setSwipeProgress(0);
    setSwipeDirection(null);

    onSwipeEnd?.(direction);
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeEnd, hapticFeedback, lightImpact]);

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    swipeDirection,
    swipeDistance,
    isSwiping,
    swipeProgress,
  };
}
