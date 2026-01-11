import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sun, Sunrise, Moon, Coffee, UtensilsCrossed } from 'lucide-react';

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'supper';
  title: string;
  calories: number;
  time: string;
  emoji: string;
}

interface DayTimelineProps {
  meals: Meal[];
  onMealClick?: (meal: Meal) => void;
  selectedMealId?: string;
  className?: string;
}

const MEAL_CONFIG = {
  breakfast: {
    icon: Sunrise,
    label: 'Café',
    gradient: 'from-orange-400 to-yellow-500',
    bgGradient: 'from-orange-500/20 to-yellow-500/20',
    time: '7h',
    position: 0
  },
  lunch: {
    icon: Sun,
    label: 'Almoço',
    gradient: 'from-green-400 to-emerald-500',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
    time: '12h',
    position: 25
  },
  snack: {
    icon: Coffee,
    label: 'Lanche',
    gradient: 'from-cyan-400 to-blue-500',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    time: '15h',
    position: 50
  },
  dinner: {
    icon: UtensilsCrossed,
    label: 'Jantar',
    gradient: 'from-purple-400 to-violet-500',
    bgGradient: 'from-purple-500/20 to-violet-500/20',
    time: '19h',
    position: 75
  },
  supper: {
    icon: Moon,
    label: 'Ceia',
    gradient: 'from-indigo-400 to-blue-600',
    bgGradient: 'from-indigo-500/20 to-blue-600/20',
    time: '21h',
    position: 100
  }
};

export const DayTimeline: React.FC<DayTimelineProps> = ({
  meals,
  onMealClick,
  selectedMealId,
  className
}) => {
  const [hoveredMeal, setHoveredMeal] = useState<string | null>(null);

  return (
    <div className={cn("relative py-8", className)}>
      {/* Timeline background gradient */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-orange-200 via-green-200 via-cyan-200 via-purple-200 to-indigo-200 dark:from-orange-900/30 dark:via-green-900/30 dark:via-cyan-900/30 dark:via-purple-900/30 dark:to-indigo-900/30" />
      
      {/* Sun/Moon journey indicator */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50"
        initial={{ left: '0%' }}
        animate={{ left: '100%' }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Time markers */}
      <div className="relative flex justify-between px-4">
        {meals.map((meal, index) => {
          const config = MEAL_CONFIG[meal.type];
          const Icon = config.icon;
          const isSelected = selectedMealId === meal.id;
          const isHovered = hoveredMeal === meal.id;

          return (
            <motion.div
              key={meal.id}
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Time label */}
              <span className="text-xs text-muted-foreground mb-2">
                {meal.time || config.time}
              </span>

              {/* Meal node */}
              <motion.button
                onClick={() => onMealClick?.(meal)}
                onMouseEnter={() => setHoveredMeal(meal.id)}
                onMouseLeave={() => setHoveredMeal(null)}
                className={cn(
                  "relative w-14 h-14 rounded-full flex items-center justify-center",
                  "border-2 transition-all duration-300 cursor-pointer",
                  isSelected || isHovered
                    ? `bg-gradient-to-br ${config.gradient} border-white shadow-lg`
                    : `bg-gradient-to-br ${config.bgGradient} border-border hover:border-primary/50`
                )}
                whileHover={{ scale: 1.15, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glow effect */}
                {(isSelected || isHovered) && (
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-full bg-gradient-to-br blur-md -z-10",
                      config.gradient
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.5, scale: 1.2 }}
                  />
                )}

                {/* Emoji or Icon */}
                <span className="text-2xl">{meal.emoji}</span>

                {/* Pulse animation for selected */}
                {isSelected && (
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-full border-2",
                      `border-${config.gradient.split('-')[1]}-500`
                    )}
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Meal info tooltip */}
              <AnimatePresence>
                {(isSelected || isHovered) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className={cn(
                      "absolute top-full mt-3 px-3 py-2 rounded-lg",
                      "bg-card border border-border shadow-xl",
                      "min-w-[120px] text-center z-10"
                    )}
                  >
                    <p className="text-xs font-medium text-foreground truncate">
                      {meal.title}
                    </p>
                    <p className={cn(
                      "text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      config.gradient
                    )}>
                      {meal.calories} kcal
                    </p>
                    
                    {/* Arrow */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-l border-t border-border rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Meal type label */}
              <span className={cn(
                "mt-2 text-xs font-medium transition-colors",
                isSelected || isHovered ? "text-foreground" : "text-muted-foreground"
              )}>
                {config.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Connection lines between meals */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)', height: '4px' }}>
        <defs>
          <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="25%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="75%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
