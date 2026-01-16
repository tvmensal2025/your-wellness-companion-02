/**
 * DaySelector - Componente de seleção de dias da semana
 * @module DaySelector
 * @requirements 2.3
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, Flame, ChefHat } from 'lucide-react';
import type { DayPlan, Meal } from '@/types/meal-plan';

// Configuração visual das refeições
const MEAL_CONFIG = {
  breakfast: { emoji: '🌅', label: 'Café', fullLabel: 'CAFÉ DA MANHÃ', gradient: 'from-orange-500 to-amber-500', textColor: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-l-orange-500', time: '07:00' },
  lunch: { emoji: '☀️', label: 'Almoço', fullLabel: 'ALMOÇO', gradient: 'from-green-500 to-emerald-500', textColor: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-l-green-500', time: '12:00' },
  snack: { emoji: '🍃', label: 'Lanche', fullLabel: 'LANCHE', gradient: 'from-cyan-500 to-sky-500', textColor: 'text-cyan-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-l-cyan-500', time: '15:30' },
  dinner: { emoji: '🌆', label: 'Jantar', fullLabel: 'JANTAR', gradient: 'from-purple-500 to-violet-500', textColor: 'text-purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-l-purple-500', time: '19:00' },
  supper: { emoji: '🌙', label: 'Ceia', fullLabel: 'CEIA', gradient: 'from-indigo-500 to-blue-500', textColor: 'text-indigo-500', bgColor: 'bg-indigo-500/10', borderColor: 'border-l-indigo-500', time: '21:00' }
} as const;

type MealConfigKey = keyof typeof MEAL_CONFIG;
const MEAL_TYPES: MealConfigKey[] = ['breakfast', 'lunch', 'snack', 'dinner', 'supper'];

// MiniDayTimeline - Timeline visual horizontal das refeições
interface MiniDayTimelineProps { meals: DayPlan['meals']; }

const MiniDayTimeline: React.FC<MiniDayTimelineProps> = ({ meals }) => (
  <div className="flex items-center gap-1 py-2">
    {MEAL_TYPES.map((type, index) => {
      const meal = meals[type];
      const config = MEAL_CONFIG[type];
      const hasMeal = !!meal;
      return (
        <React.Fragment key={type}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group cursor-pointer flex flex-col items-center"
          >
            <span className="text-[9px] text-muted-foreground mb-1">{config.time}</span>
            <motion.div
              whileHover={{ scale: 1.2 }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                hasMeal ? `bg-gradient-to-br ${config.gradient} shadow-lg` : "bg-muted/50 border-2 border-dashed border-muted-foreground/30"
              )}
            >
              <span className={cn("text-lg", !hasMeal && "opacity-30")}>{config.emoji}</span>
            </motion.div>
            <span className={cn("text-[10px] mt-1 font-medium", hasMeal ? config.textColor : "text-muted-foreground/50")}>
              {config.label}
            </span>
            {hasMeal && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-primary whitespace-nowrap">{meal.macros.calories} kcal</span>
              </div>
            )}
          </motion.div>
          {index < MEAL_TYPES.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 min-w-4 max-w-8 mt-3",
              hasMeal && meals[MEAL_TYPES[index + 1]] ? "bg-gradient-to-r from-primary/50 to-primary/30" : "bg-muted/30"
            )} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// MealCard - Card de refeição expandido
interface MealCardProps { meal: Meal; type: MealConfigKey; index: number; }

const MealCard: React.FC<MealCardProps> = ({ meal, type, index }) => {
  const config = MEAL_CONFIG[type];
  const shortDesc = meal.practicalSuggestion || meal.description || meal.ingredients.slice(0, 3).join(', ');
  const truncatedDesc = shortDesc.length > 80 ? shortDesc.substring(0, 80) + '...' : shortDesc;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn("p-3 rounded-xl border-l-4 hover:shadow-md transition-shadow", config.borderColor, config.bgColor)}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.emoji}</span>
          <div className="flex flex-col">
            <span className={cn("font-bold text-xs uppercase tracking-wide", config.textColor)}>{config.fullLabel}</span>
            <span className="text-[10px] text-muted-foreground">{config.time}</span>
          </div>
        </div>
        <motion.div
          className={cn("px-2.5 py-1 rounded-full text-xs font-bold text-white shadow", `bg-gradient-to-r ${config.gradient}`)}
          whileHover={{ scale: 1.05 }}
        >
          <Flame className="w-3 h-3 inline mr-1" />{meal.macros.calories} kcal
        </motion.div>
      </div>
      <h4 className="font-semibold text-sm text-foreground mb-1">{meal.title}</h4>
      <p className="text-xs text-muted-foreground line-clamp-2">{truncatedDesc}</p>
      <div className="flex gap-2 mt-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 font-medium">{meal.macros.protein}g P</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">{meal.macros.carbs}g C</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 font-medium">{meal.macros.fat}g G</span>
      </div>
    </motion.div>
  );
};

// DaySelector - Componente principal
export interface DaySelectorProps {
  dayPlan: DayPlan;
  isExpanded: boolean;
  onToggle: () => void;
  onViewDetailed: () => void;
  getDayName: (day: number) => string;
  className?: string;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  dayPlan, isExpanded, onToggle, onViewDetailed, getDayName, className,
}) => {
  const mealsCount = Object.values(dayPlan.meals).filter(Boolean).length;

  return (
    <motion.div 
      layout 
      className={cn(
        "rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden",
        isExpanded && "shadow-lg border-primary/30",
        className
      )}
    >
      {/* Header - Clicável */}
      <button onClick={onToggle} className="w-full p-4 flex flex-col hover:bg-muted/30 transition-colors">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30"
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <span className="text-2xl font-bold text-primary-foreground">{dayPlan.day}</span>
            </motion.div>
            <div className="text-left">
              <h3 className="font-bold text-lg text-foreground">{getDayName(dayPlan.day)}</h3>
              <p className="text-sm text-muted-foreground">
                {mealsCount} refeições
                {dayPlan.dailyTotals && <span className="text-primary font-semibold ml-1">• {dayPlan.dailyTotals.calories} kcal</span>}
              </p>
            </div>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="p-2 rounded-full bg-muted/50">
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
        <div className="mt-3 w-full overflow-x-auto">
          <MiniDayTimeline meals={dayPlan.meals} />
        </div>
      </button>

      {/* Conteúdo expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              {MEAL_TYPES.map((type, i) => {
                const meal = dayPlan.meals[type];
                return meal ? <MealCard key={type} meal={meal} type={type} index={i} /> : null;
              })}
              <Button 
                onClick={(e) => { e.stopPropagation(); onViewDetailed(); }} 
                className="w-full gap-2 mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
              >
                <ChefHat className="w-4 h-4" />
                Ver Receitas Completas
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DaySelector;
