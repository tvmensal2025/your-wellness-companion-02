/**
 * MealCard - Componente de card de refeição individual
 * Exibe título, macros, ingredientes e modo de preparo com animações
 * 
 * @param meal - Dados da refeição
 * @param mealConfig - Configuração visual da refeição (cores, emoji, etc)
 * 
 * **Validates: Requirements 1.3**
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Leaf, ChefHat, Flame, Clock, ChevronLeft, Lightbulb } from 'lucide-react';
import type { Meal, MealConfig, MealType } from '@/types/meal-plan';

// ============================================================================
// Types
// ============================================================================

export interface MealCardProps {
  meal: Meal;
  mealConfig: MealConfig;
  mealType: MealType;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Limpa ingredientes duplicados */
const cleanIngredients = (ingredients: string[]): string[] => 
  ingredients.map(ing => ing.replace(/\s*\([^)]+\)\s*\([^)]+\)$/, m => m.split(') (')[0] + ')'));

/** Formata modo de preparo em passos */
const parsePreparoSteps = (meal: Meal): Array<{ title: string | null; text: string }> => {
  const text = meal.modoPreparoElegante || meal.preparo || meal.description || '';
  return text.split(/\d+\.\s*/).filter(s => s.trim()).map(step => {
    const [title, ...rest] = step.split(':');
    const hasTitle = rest.length > 0 && title.length < 30;
    return { title: hasTitle ? title.trim() : null, text: hasTitle ? rest.join(':').trim() : step.trim() };
  });
};

// ============================================================================
// Sub-components
// ============================================================================

/** Botão colapsável reutilizável */
const CollapsibleButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  colorClass: string;
}> = ({ isOpen, onClick, icon, label, badge, colorClass }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-2 p-2.5 rounded-xl border transition-colors",
      `border-${colorClass}-500/20 bg-${colorClass}-500/5 hover:bg-${colorClass}-500/10`
    )}
  >
    {icon}
    <span className="font-medium text-sm text-foreground">{label}</span>
    {badge && <span className="ml-auto">{badge}</span>}
    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className={badge ? '' : 'ml-auto'}>
      <ChevronLeft className="w-4 h-4 text-muted-foreground -rotate-90" />
    </motion.div>
  </button>
);

/** Lista de itens numerados */
const NumberedList: React.FC<{
  items: Array<{ title?: string | null; text: string }>;
  colorClass: string;
  gradientFrom?: string;
  gradientTo?: string;
}> = ({ items, colorClass, gradientFrom, gradientTo }) => (
  <div className={cn(
    "p-3 rounded-xl border space-y-0",
    `bg-gradient-to-b from-${colorClass}-500/5 to-transparent border-${colorClass}-500/10`
  )}>
    {items.map((item, idx) => (
      <div key={idx} className={cn(
        "flex items-start gap-3 py-2",
        idx !== items.length - 1 && `border-b border-${colorClass}-500/10`
      )}>
        <span className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center",
          gradientFrom && gradientTo ? `bg-gradient-to-br ${gradientFrom} ${gradientTo}` : `bg-${colorClass}-500`
        )}>
          {idx + 1}
        </span>
        <div className="flex-1">
          {item.title && (
            <span className={`text-xs font-semibold text-${colorClass}-600 dark:text-${colorClass}-400 block mb-0.5`}>
              {item.title}
            </span>
          )}
          <span className="text-xs text-foreground/90 leading-relaxed">{item.text}</span>
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const MealCard: React.FC<MealCardProps> = ({ meal, mealConfig, className }) => {
  const [showIngredients, setShowIngredients] = useState(false);
  const [showPreparo, setShowPreparo] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const ingredients = cleanIngredients(meal.ingredients);
  const preparoSteps = parsePreparoSteps(meal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn("space-y-2", className)}
    >
      {/* Header com título e calorias */}
      <div className={cn("rounded-xl p-3 bg-gradient-to-br", mealConfig.bgGradient)}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <motion.div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r text-white font-medium text-xs",
            mealConfig.gradient
          )}>
            <span>{mealConfig.emoji}</span>
            <span>{mealConfig.label}</span>
          </motion.div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur">
            <Flame className="w-3 h-3 text-orange-500" />
            <span className="font-bold text-sm">{meal.macros.calories}</span>
            <span className="text-[10px] text-muted-foreground">kcal</span>
          </div>
        </div>
        <h3 className="text-base font-bold text-foreground leading-tight">{meal.title}</h3>
      </div>

      {/* Macros resumidos */}
      <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-muted/30">
        <div className="flex items-center gap-1">
          <span className="text-sm">💪</span>
          <span className="text-xs font-semibold text-foreground">{meal.macros.protein}g</span>
          <span className="text-[10px] text-muted-foreground">prot</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">⚡</span>
          <span className="text-xs font-semibold text-foreground">{meal.macros.carbs}g</span>
          <span className="text-[10px] text-muted-foreground">carb</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">🥑</span>
          <span className="text-xs font-semibold text-foreground">{meal.macros.fat}g</span>
          <span className="text-[10px] text-muted-foreground">gord</span>
        </div>
        {meal.macros.fiber !== undefined && meal.macros.fiber > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-sm">🥬</span>
            <span className="text-xs font-semibold text-foreground">{meal.macros.fiber}g</span>
            <span className="text-[10px] text-muted-foreground">fibra</span>
          </div>
        )}
      </div>

      {/* Ingredientes */}
      <CollapsibleButton
        isOpen={showIngredients}
        onClick={() => setShowIngredients(!showIngredients)}
        icon={<Leaf className="w-4 h-4 text-green-500" />}
        label="Ingredientes"
        badge={<span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{ingredients.length}</span>}
        colorClass="green"
      />
      <AnimatePresence>
        {showIngredients && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <NumberedList items={ingredients.map(text => ({ text }))} colorClass="green" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modo de Preparo */}
      <CollapsibleButton
        isOpen={showPreparo}
        onClick={() => setShowPreparo(!showPreparo)}
        icon={<ChefHat className="w-4 h-4 text-amber-500" />}
        label="Modo de Preparo"
        badge={<span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" />15min</span>}
        colorClass="amber"
      />
      <AnimatePresence>
        {showPreparo && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {preparoSteps.length > 0 ? (
              <NumberedList items={preparoSteps} colorClass="amber" gradientFrom="from-amber-500" gradientTo="to-orange-500" />
            ) : (
              <div className="p-3 rounded-xl bg-gradient-to-b from-amber-500/5 to-transparent border border-amber-500/10">
                <p className="text-xs text-foreground/90">{meal.modoPreparoElegante || meal.preparo || meal.description || 'Instruções não disponíveis'}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dica Prática (opcional) */}
      {meal.practicalSuggestion && (
        <>
          <CollapsibleButton
            isOpen={showSuggestion}
            onClick={() => setShowSuggestion(!showSuggestion)}
            icon={<Lightbulb className="w-4 h-4 text-purple-500" />}
            label="Dica Prática"
            colorClass="purple"
          />
          <AnimatePresence>
            {showSuggestion && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-3 rounded-xl bg-gradient-to-b from-purple-500/5 to-transparent border border-purple-500/10">
                  <p className="text-xs text-foreground/90 leading-relaxed">{meal.practicalSuggestion}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default MealCard;
