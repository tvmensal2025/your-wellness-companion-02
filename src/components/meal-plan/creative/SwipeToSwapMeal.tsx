import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Check, X, RefreshCw } from 'lucide-react';

interface MealOption {
  id: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  emoji: string;
  prepTime: string;
}

interface SwipeToSwapMealProps {
  currentMeal: MealOption;
  alternatives: MealOption[];
  onSelect: (meal: MealOption) => void;
  onKeepCurrent: () => void;
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'supper';
  className?: string;
}

const SWIPE_THRESHOLD = 100;

export const SwipeToSwapMeal: React.FC<SwipeToSwapMealProps> = ({
  currentMeal,
  alternatives,
  onSelect,
  onKeepCurrent,
  mealType,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [swapCount, setSwapCount] = useState(0);

  const allOptions = [currentMeal, ...alternatives];
  const displayedMeal = allOptions[currentIndex];

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      // Swipe right - previous
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + allOptions.length) % allOptions.length);
      setSwapCount(prev => prev + 1);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      // Swipe left - next
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % allOptions.length);
      setSwapCount(prev => prev + 1);
    }
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % allOptions.length);
    setSwapCount(prev => prev + 1);
  };

  const goToPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + allOptions.length) % allOptions.length);
    setSwapCount(prev => prev + 1);
  };

  const handleSelect = () => {
    if (currentIndex === 0) {
      onKeepCurrent();
    } else {
      onSelect(displayedMeal);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8
    })
  };

  return (
    <div className={cn("relative", className)}>
      {/* Swap counter badge */}
      {swapCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 z-20 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          {swapCount}x
        </motion.div>
      )}

      {/* Navigation arrows */}
      <div className="absolute inset-y-0 left-0 flex items-center z-10">
        <motion.button
          onClick={goToPrev}
          className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg -ml-4"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center z-10">
        <motion.button
          onClick={goToNext}
          className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg -mr-4"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Card container */}
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className={cn(
              "relative p-6 rounded-2xl cursor-grab active:cursor-grabbing",
              "bg-gradient-to-br from-card to-card/80",
              "border-2",
              currentIndex === 0 
                ? "border-primary/50 shadow-lg shadow-primary/20" 
                : "border-border"
            )}
          >
            {/* Current indicator */}
            {currentIndex === 0 && (
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                Atual
              </div>
            )}

            {/* Alternative indicator */}
            {currentIndex > 0 && (
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground text-xs font-medium">
                Alternativa {currentIndex}
              </div>
            )}

            {/* Meal content */}
            <div className="text-center pt-4">
              <motion.span
                className="text-5xl block mb-3"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                {displayedMeal.emoji}
              </motion.span>

              <h3 className="font-bold text-lg text-foreground mb-2">
                {displayedMeal.title}
              </h3>

              <div className="flex justify-center gap-4 mb-4">
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary">
                    {displayedMeal.calories}
                  </span>
                  <span className="text-xs text-muted-foreground block">kcal</span>
                </div>
              </div>

              {/* Macros */}
              <div className="flex justify-center gap-3">
                <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-600 text-xs">
                  {displayedMeal.protein}g P
                </span>
                <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 text-xs">
                  {displayedMeal.carbs}g C
                </span>
                <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 text-xs">
                  {displayedMeal.fat}g G
                </span>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                ⏱️ {displayedMeal.prepTime}
              </p>
            </div>

            {/* Swipe hint */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="text-xs text-muted-foreground">
                ← Deslize para ver opções →
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {allOptions.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex 
                ? "bg-primary w-6" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <motion.button
          onClick={() => {
            setCurrentIndex(0);
            onKeepCurrent();
          }}
          className="flex-1 py-3 rounded-xl border border-border hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <X className="w-4 h-4" />
          Manter original
        </motion.button>
        
        <motion.button
          onClick={handleSelect}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2",
            currentIndex === 0
              ? "bg-primary text-primary-foreground"
              : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Check className="w-4 h-4" />
          {currentIndex === 0 ? 'Confirmar' : 'Trocar'}
        </motion.button>
      </div>
    </div>
  );
};
