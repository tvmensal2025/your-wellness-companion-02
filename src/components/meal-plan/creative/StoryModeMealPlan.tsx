import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, X, Clock, Flame, Check } from 'lucide-react';

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'supper';
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  emoji: string;
  ingredients: string[];
  imageUrl?: string;
}

interface StoryModeMealPlanProps {
  meals: Meal[];
  onComplete?: () => void;
  onMealComplete?: (mealId: string) => void;
  className?: string;
}

const MEAL_BACKGROUNDS = {
  breakfast: 'from-orange-400 via-amber-300 to-yellow-200',
  lunch: 'from-green-400 via-emerald-300 to-teal-200',
  snack: 'from-cyan-400 via-sky-300 to-blue-200',
  dinner: 'from-purple-400 via-violet-300 to-fuchsia-200',
  supper: 'from-indigo-400 via-blue-400 to-slate-300'
};

const MEAL_LABELS = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
  supper: 'Ceia'
};

export const StoryModeMealPlan: React.FC<StoryModeMealPlanProps> = ({
  meals,
  onComplete,
  onMealComplete,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());

  const currentMeal = meals[currentIndex];
  const isLastStory = currentIndex === meals.length - 1;

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (!isLastStory) {
            goToNext();
          } else {
            onComplete?.();
          }
          return 0;
        }
        return prev + 2; // 5 seconds per story (100/2 = 50 intervals * 100ms)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, isLastStory]);

  const goToNext = useCallback(() => {
    if (currentIndex < meals.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    }
  }, [currentIndex, meals.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      goToPrev();
    } else if (x > (width * 2) / 3) {
      goToNext();
    } else {
      setIsPaused((prev) => !prev);
    }
  };

  const markAsComplete = () => {
    setCompletedMeals((prev) => new Set([...prev, currentMeal.id]));
    onMealComplete?.(currentMeal.id);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className={cn("relative w-full max-w-md mx-auto", className)}>
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
        {meals.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
          >
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: index < currentIndex 
                  ? '100%' 
                  : index === currentIndex 
                    ? `${progress}%` 
                    : '0%'
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Story container */}
      <div
        className="relative aspect-[9/16] rounded-3xl overflow-hidden cursor-pointer"
        onClick={handleTap}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
            className={cn(
              "absolute inset-0 bg-gradient-to-b",
              MEAL_BACKGROUNDS[currentMeal.type]
            )}
          >
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-6 pt-16">
              {/* Header */}
              <div className="text-white">
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium opacity-80"
                >
                  {MEAL_LABELS[currentMeal.type]}
                </motion.span>
              </div>

              {/* Center - Emoji and title */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="text-8xl mb-4"
                >
                  {currentMeal.emoji}
                </motion.span>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white text-center mb-2"
                >
                  {currentMeal.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 text-center text-sm max-w-[80%]"
                >
                  {currentMeal.description}
                </motion.p>
              </div>

              {/* Bottom info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                {/* Macros */}
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <span className="text-white font-bold">{currentMeal.calories}</span>
                    <span className="text-white/60 text-xs block">kcal</span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl">🥩</span>
                    <span className="text-white font-bold block">{currentMeal.protein}g</span>
                    <span className="text-white/60 text-xs">proteína</span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl">🍞</span>
                    <span className="text-white font-bold block">{currentMeal.carbs}g</span>
                    <span className="text-white/60 text-xs">carbos</span>
                  </div>
                  <div className="text-center">
                    <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <span className="text-white font-bold">{currentMeal.prepTime}</span>
                    <span className="text-white/60 text-xs block">preparo</span>
                  </div>
                </div>

                {/* Ingredients preview */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-white/60 text-xs mb-2">Ingredientes principais:</p>
                  <p className="text-white text-sm">
                    {currentMeal.ingredients.slice(0, 3).join(' • ')}
                    {currentMeal.ingredients.length > 3 && ` +${currentMeal.ingredients.length - 3}`}
                  </p>
                </div>

                {/* Complete button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsComplete();
                  }}
                  className={cn(
                    "w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                    completedMeals.has(currentMeal.id)
                      ? "bg-green-500 text-white"
                      : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check className="w-5 h-5" />
                  {completedMeals.has(currentMeal.id) ? 'Concluído!' : 'Marcar como feito'}
                </motion.button>
              </motion.div>
            </div>

            {/* Pause indicator */}
            <AnimatePresence>
              {isPaused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-2 h-8 bg-white rounded-full" />
                      <div className="w-2 h-8 bg-white rounded-full" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation hints */}
      <div className="flex justify-between mt-4 px-4 text-xs text-muted-foreground">
        <span>← Anterior</span>
        <span>Toque para pausar</span>
        <span>Próximo →</span>
      </div>
    </div>
  );
};
