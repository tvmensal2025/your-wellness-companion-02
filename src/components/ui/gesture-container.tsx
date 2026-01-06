import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface GestureContainerProps {
  children: React.ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  direction?: 'horizontal' | 'vertical';
  loop?: boolean;
  className?: string;
  containerClassName?: string;
  indicators?: boolean;
  indicatorClassName?: string;
}

export function GestureContainer({
  children,
  currentIndex,
  onIndexChange,
  direction = 'horizontal',
  loop = false,
  className,
  containerClassName,
  indicators = true,
  indicatorClassName,
}: GestureContainerProps) {
  const { shouldReduceMotion } = useReducedMotion();
  const [dragDirection, setDragDirection] = useState(0);
  const totalItems = React.Children.count(children);

  const goToNext = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      onIndexChange(currentIndex + 1);
    } else if (loop) {
      onIndexChange(0);
    }
  }, [currentIndex, totalItems, loop, onIndexChange]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else if (loop) {
      onIndexChange(totalItems - 1);
    }
  }, [currentIndex, totalItems, loop, onIndexChange]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const velocity = direction === 'horizontal' ? info.velocity.x : info.velocity.y;
    const offset = direction === 'horizontal' ? info.offset.x : info.offset.y;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset < 0 || velocity < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    setDragDirection(0);
  }, [direction, goToNext, goToPrev]);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = direction === 'horizontal' ? info.offset.x : info.offset.y;
    setDragDirection(offset);
  }, [direction]);

  const variants = {
    enter: (dir: number) => ({
      x: direction === 'horizontal' ? (dir > 0 ? -300 : 300) : 0,
      y: direction === 'vertical' ? (dir > 0 ? -300 : 300) : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      y: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: direction === 'horizontal' ? (dir < 0 ? -300 : 300) : 0,
      y: direction === 'vertical' ? (dir < 0 ? -300 : 300) : 0,
      opacity: 0,
    }),
  };

  return (
    <div className={cn("relative", containerClassName)}>
      <div className={cn("overflow-hidden", className)}>
        <AnimatePresence initial={false} custom={dragDirection} mode="wait">
          <motion.div
            key={currentIndex}
            custom={dragDirection}
            variants={shouldReduceMotion ? undefined : variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              y: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag={direction === 'horizontal' ? 'x' : 'y'}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="w-full h-full"
          >
            {React.Children.toArray(children)[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      {indicators && totalItems > 1 && (
        <div 
          className={cn(
            "flex justify-center gap-2 mt-4",
            indicatorClassName
          )}
        >
          {Array.from({ length: totalItems }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => onIndexChange(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200 touch-target",
                idx === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Ir para item ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Simple horizontal scroll container with snap
interface SnapScrollProps {
  children: React.ReactNode;
  className?: string;
  gap?: number;
}

export function SnapScroll({ children, className, gap = 16 }: SnapScrollProps) {
  return (
    <div
      className={cn(
        "flex overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-scroll",
        "-mx-4 px-4",
        className
      )}
      style={{ gap }}
    >
      {React.Children.map(children, (child, index) => (
        <div className="snap-center shrink-0 first:pl-0 last:pr-4">
          {child}
        </div>
      ))}
    </div>
  );
}

// Tabs with gesture navigation
interface GestureTabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function GestureTabs({ tabs, activeTab, onTabChange, className }: GestureTabsProps) {
  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

  const handleIndexChange = (index: number) => {
    onTabChange(tabs[index].id);
  };

  return (
    <div className={className}>
      {/* Tab headers */}
      <div className="flex border-b border-border mb-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors touch-target",
              tab.id === activeTab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Swipeable content */}
      <GestureContainer
        currentIndex={currentIndex}
        onIndexChange={handleIndexChange}
        indicators={false}
      >
        {tabs.map((tab) => (
          <div key={tab.id}>{tab.content}</div>
        ))}
      </GestureContainer>
    </div>
  );
}
