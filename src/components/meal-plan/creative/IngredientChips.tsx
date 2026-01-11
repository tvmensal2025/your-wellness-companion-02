import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, RefreshCw, Info } from 'lucide-react';

interface Ingredient {
  name: string;
  amount: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'other';
  calories?: number;
  canSubstitute?: boolean;
  substitutes?: string[];
}

interface IngredientChipsProps {
  ingredients: Ingredient[];
  onRemove?: (ingredient: Ingredient) => void;
  onSubstitute?: (ingredient: Ingredient, substitute: string) => void;
  editable?: boolean;
  className?: string;
}

const CATEGORY_STYLES = {
  protein: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-600 dark:text-red-400',
    icon: '🥩'
  },
  carb: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    icon: '🍞'
  },
  fat: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    icon: '🥑'
  },
  vegetable: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-600 dark:text-green-400',
    icon: '🥬'
  },
  fruit: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-600 dark:text-purple-400',
    icon: '🍎'
  },
  dairy: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    icon: '🥛'
  },
  other: {
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
    text: 'text-gray-600 dark:text-gray-400',
    icon: '🧂'
  }
};

export const IngredientChips: React.FC<IngredientChipsProps> = ({
  ingredients,
  onRemove,
  onSubstitute,
  editable = false,
  className
}) => {
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [showSubstitutes, setShowSubstitutes] = useState<string | null>(null);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <AnimatePresence>
        {ingredients.map((ingredient, index) => {
          const style = CATEGORY_STYLES[ingredient.category];
          const isExpanded = expandedIngredient === ingredient.name;
          const showingSubs = showSubstitutes === ingredient.name;

          return (
            <motion.div
              key={ingredient.name}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ delay: index * 0.03 }}
              className="relative"
            >
              <motion.button
                onClick={() => setExpandedIngredient(isExpanded ? null : ingredient.name)}
                className={cn(
                  "group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "border transition-all duration-200",
                  style.bg,
                  style.border,
                  isExpanded && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Category icon */}
                <span className="text-sm">{style.icon}</span>

                {/* Ingredient name */}
                <span className={cn("text-sm font-medium", style.text)}>
                  {ingredient.name}
                </span>

                {/* Amount */}
                <span className="text-xs text-muted-foreground">
                  ({ingredient.amount})
                </span>

                {/* Calories if available */}
                {ingredient.calories && isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    className="text-xs text-muted-foreground ml-1"
                  >
                    • {ingredient.calories}kcal
                  </motion.span>
                )}

                {/* Action buttons on hover/expand */}
                {editable && (
                  <div className={cn(
                    "flex items-center gap-1 ml-1 transition-opacity",
                    isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    {ingredient.canSubstitute && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSubstitutes(showingSubs ? null : ingredient.name);
                        }}
                        className="p-0.5 rounded-full hover:bg-background/50"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </motion.button>
                    )}
                    
                    {onRemove && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(ingredient);
                        }}
                        className="p-0.5 rounded-full hover:bg-red-500/20"
                        whileHover={{ scale: 1.2 }}
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.button>

              {/* Substitutes dropdown */}
              <AnimatePresence>
                {showingSubs && ingredient.substitutes && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 z-20 min-w-[150px] p-2 rounded-lg bg-card border border-border shadow-xl"
                  >
                    <p className="text-xs text-muted-foreground mb-2 px-1">
                      Substituir por:
                    </p>
                    <div className="space-y-1">
                      {ingredient.substitutes.map((sub) => (
                        <motion.button
                          key={sub}
                          onClick={() => {
                            onSubstitute?.(ingredient, sub);
                            setShowSubstitutes(null);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          {sub}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Legend */}
      <div className="w-full mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Legenda:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_STYLES).slice(0, 5).map(([key, style]) => (
            <div key={key} className="flex items-center gap-1">
              <span className="text-xs">{style.icon}</span>
              <span className="text-xs text-muted-foreground capitalize">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
