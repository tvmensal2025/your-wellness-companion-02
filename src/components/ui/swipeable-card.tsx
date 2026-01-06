import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2, Archive, Check, Star, MoreHorizontal } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeComplete?: (direction: 'left' | 'right') => void;
  swipeThreshold?: number;
  className?: string;
  disabled?: boolean;
}

const defaultLeftActions: SwipeAction[] = [
  {
    icon: <Check className="w-5 h-5" />,
    label: 'Concluir',
    color: 'text-white',
    bgColor: 'bg-emerald-500',
    onAction: () => {},
  },
];

const defaultRightActions: SwipeAction[] = [
  {
    icon: <Trash2 className="w-5 h-5" />,
    label: 'Excluir',
    color: 'text-white',
    bgColor: 'bg-destructive',
    onAction: () => {},
  },
];

export function SwipeableCard({
  children,
  leftActions = defaultLeftActions,
  rightActions = defaultRightActions,
  onSwipeComplete,
  swipeThreshold = 100,
  className,
  disabled = false,
}: SwipeableCardProps) {
  const { lightImpact, mediumImpact } = useHaptics();
  const { shouldReduceMotion } = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef(null);
  
  const x = useMotionValue(0);
  
  // Transform for action backgrounds
  const leftActionOpacity = useTransform(x, [0, swipeThreshold], [0, 1]);
  const rightActionOpacity = useTransform(x, [-swipeThreshold, 0], [1, 0]);
  const leftActionScale = useTransform(x, [0, swipeThreshold], [0.8, 1]);
  const rightActionScale = useTransform(x, [-swipeThreshold, 0], [1, 0.8]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Check if swipe should complete
    if (Math.abs(offset) > swipeThreshold || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 'left' : 'right';
      
      mediumImpact();
      setIsRevealed(direction);
      
      // Execute action
      const actions = direction === 'left' ? leftActions : rightActions;
      if (actions.length > 0) {
        actions[0].onAction();
      }
      
      onSwipeComplete?.(direction === 'left' ? 'right' : 'left');
    } else {
      setIsRevealed(null);
    }
  }, [swipeThreshold, leftActions, rightActions, onSwipeComplete, mediumImpact]);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = Math.abs(info.offset.x);
    
    // Haptic feedback at threshold
    if (offset > swipeThreshold - 10 && offset < swipeThreshold + 10) {
      lightImpact();
    }
  }, [swipeThreshold, lightImpact]);

  if (disabled || shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)} ref={constraintsRef}>
      {/* Left action background */}
      <motion.div
        className={cn(
          "absolute inset-y-0 left-0 flex items-center justify-start pl-4",
          leftActions[0]?.bgColor || 'bg-emerald-500'
        )}
        style={{ 
          opacity: leftActionOpacity,
          width: swipeThreshold + 20,
        }}
      >
        <motion.div 
          className="flex flex-col items-center gap-1"
          style={{ scale: leftActionScale }}
        >
          <span className={leftActions[0]?.color || 'text-white'}>
            {leftActions[0]?.icon}
          </span>
          <span className={cn("text-xs font-medium", leftActions[0]?.color || 'text-white')}>
            {leftActions[0]?.label}
          </span>
        </motion.div>
      </motion.div>

      {/* Right action background */}
      <motion.div
        className={cn(
          "absolute inset-y-0 right-0 flex items-center justify-end pr-4",
          rightActions[0]?.bgColor || 'bg-destructive'
        )}
        style={{ 
          opacity: rightActionOpacity,
          width: swipeThreshold + 20,
        }}
      >
        <motion.div 
          className="flex flex-col items-center gap-1"
          style={{ scale: rightActionScale }}
        >
          <span className={rightActions[0]?.color || 'text-white'}>
            {rightActions[0]?.icon}
          </span>
          <span className={cn("text-xs font-medium", rightActions[0]?.color || 'text-white')}>
            {rightActions[0]?.label}
          </span>
        </motion.div>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        className="relative bg-card"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -swipeThreshold - 20, right: swipeThreshold + 20 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Preset action configurations
export const SwipeActions = {
  delete: (onAction: () => void): SwipeAction => ({
    icon: <Trash2 className="w-5 h-5" />,
    label: 'Excluir',
    color: 'text-white',
    bgColor: 'bg-destructive',
    onAction,
  }),
  archive: (onAction: () => void): SwipeAction => ({
    icon: <Archive className="w-5 h-5" />,
    label: 'Arquivar',
    color: 'text-white',
    bgColor: 'bg-amber-500',
    onAction,
  }),
  complete: (onAction: () => void): SwipeAction => ({
    icon: <Check className="w-5 h-5" />,
    label: 'Concluir',
    color: 'text-white',
    bgColor: 'bg-emerald-500',
    onAction,
  }),
  favorite: (onAction: () => void): SwipeAction => ({
    icon: <Star className="w-5 h-5" />,
    label: 'Favoritar',
    color: 'text-white',
    bgColor: 'bg-yellow-500',
    onAction,
  }),
  more: (onAction: () => void): SwipeAction => ({
    icon: <MoreHorizontal className="w-5 h-5" />,
    label: 'Mais',
    color: 'text-white',
    bgColor: 'bg-muted',
    onAction,
  }),
};
