import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, Flame, ChevronDown, ChevronUp, Utensils } from 'lucide-react';

interface MealMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface MealCardWithVibeProps {
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'supper';
  title: string;
  description?: string;
  ingredients: string[];
  prepTime?: string;
  macros: MealMacros;
  onSwap?: () => void;
  className?: string;
}

const MEAL_VIBES = {
  breakfast: {
    gradient: 'from-orange-400 via-amber-400 to-yellow-400',
    bgGradient: 'from-orange-500/10 via-amber-500/10 to-yellow-500/10',
    borderColor: 'border-orange-500/30',
    accentColor: 'text-orange-500',
    emoji: '🌅',
    label: 'Café da Manhã',
    vibe: 'Energia para começar o dia'
  },
  lunch: {
    gradient: 'from-green-400 via-emerald-400 to-teal-400',
    bgGradient: 'from-green-500/10 via-emerald-500/10 to-teal-500/10',
    borderColor: 'border-green-500/30',
    accentColor: 'text-green-500',
    emoji: '☀️',
    label: 'Almoço',
    vibe: 'Combustível para a tarde'
  },
  snack: {
    gradient: 'from-cyan-400 via-sky-400 to-blue-400',
    bgGradient: 'from-cyan-500/10 via-sky-500/10 to-blue-500/10',
    borderColor: 'border-cyan-500/30',
    accentColor: 'text-cyan-500',
    emoji: '🍃',
    label: 'Lanche',
    vibe: 'Refresh no meio do dia'
  },
  dinner: {
    gradient: 'from-purple-400 via-violet-400 to-fuchsia-400',
    bgGradient: 'from-purple-500/10 via-violet-500/10 to-fuchsia-500/10',
    borderColor: 'border-purple-500/30',
    accentColor: 'text-purple-500',
    emoji: '🌆',
    label: 'Jantar',
    vibe: 'Encerramento nutritivo'
  },
  supper: {
    gradient: 'from-indigo-400 via-blue-500 to-slate-500',
    bgGradient: 'from-indigo-500/10 via-blue-500/10 to-slate-500/10',
    borderColor: 'border-indigo-500/30',
    accentColor: 'text-indigo-500',
    emoji: '🌙',
    label: 'Ceia',
    vibe: 'Leve para dormir bem'
  }
};

export const MealCardWithVibe: React.FC<MealCardWithVibeProps> = ({
  type,
  title,
  description,
  ingredients,
  prepTime = '15min',
  macros,
  onSwap,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const vibe = MEAL_VIBES[type];

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "border-2 transition-all duration-500",
        vibe.borderColor,
        isHovered ? "shadow-xl" : "shadow-md",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Animated gradient background */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          vibe.bgGradient
        )}
        animate={{
          backgroundPosition: isHovered ? ['0% 0%', '100% 100%'] : '0% 0%'
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
      />

      {/* Glow effect on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={cn(
              "absolute -inset-1 bg-gradient-to-r rounded-2xl blur-xl -z-10",
              vibe.gradient
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative p-4 bg-card/80 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Emoji with animation */}
            <motion.span
              className="text-3xl"
              animate={{ 
                rotate: isHovered ? [0, -10, 10, 0] : 0,
                scale: isHovered ? 1.1 : 1
              }}
              transition={{ duration: 0.5 }}
            >
              {vibe.emoji}
            </motion.span>
            
            <div>
              <h3 className={cn(
                "font-bold text-sm bg-gradient-to-r bg-clip-text text-transparent",
                vibe.gradient
              )}>
                {vibe.label}
              </h3>
              <p className="text-xs text-muted-foreground">{vibe.vibe}</p>
            </div>
          </div>

          {/* Calories badge */}
          <motion.div
            className={cn(
              "px-3 py-1 rounded-full",
              "bg-gradient-to-r text-white font-bold text-sm",
              vibe.gradient
            )}
            whileHover={{ scale: 1.05 }}
          >
            <Flame className="w-3 h-3 inline mr-1" />
            {macros.calories} kcal
          </motion.div>
        </div>

        {/* Meal title */}
        <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
          {title}
        </h4>

        {/* Macros pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { label: 'P', value: macros.protein, color: 'bg-red-500/20 text-red-600' },
            { label: 'C', value: macros.carbs, color: 'bg-amber-500/20 text-amber-600' },
            { label: 'G', value: macros.fat, color: 'bg-yellow-500/20 text-yellow-600' },
            { label: 'F', value: macros.fiber || 0, color: 'bg-green-500/20 text-green-600' }
          ].map((macro) => (
            <motion.span
              key={macro.label}
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                macro.color
              )}
              whileHover={{ scale: 1.1 }}
            >
              {macro.value}g {macro.label}
            </motion.span>
          ))}
        </div>

        {/* Prep time */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {prepTime}
          </span>
          <span className="flex items-center gap-1">
            <Utensils className="w-3 h-3" />
            {ingredients.length} ingredientes
          </span>
        </div>

        {/* Expandable ingredients */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Ver ingredientes</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-2 border-t border-border">
                <ul className="space-y-1">
                  {ingredients.map((ingredient, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full bg-gradient-to-r", vibe.gradient)} />
                      {ingredient}
                    </motion.li>
                  ))}
                </ul>

                {description && (
                  <p className="mt-3 text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                    {description}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap button */}
        {onSwap && (
          <motion.button
            onClick={onSwap}
            className={cn(
              "mt-3 w-full py-2 rounded-lg text-sm font-medium",
              "border border-dashed border-border",
              "hover:border-primary hover:bg-primary/5 transition-all"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🔄 Trocar refeição
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
