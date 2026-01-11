import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Mood {
  id: string;
  emoji: string;
  label: string;
  description: string;
  color: string;
  nutritionAdjust: {
    carbsMultiplier: number;
    proteinMultiplier: number;
    caloriesAdjust: number;
  };
}

const MOODS: Mood[] = [
  {
    id: 'tired',
    emoji: '😴',
    label: 'Cansado',
    description: 'Preciso de energia',
    color: 'from-blue-400 to-indigo-500',
    nutritionAdjust: { carbsMultiplier: 1.2, proteinMultiplier: 1.0, caloriesAdjust: 100 }
  },
  {
    id: 'energetic',
    emoji: '⚡',
    label: 'Energético',
    description: 'Pronto pra ação',
    color: 'from-yellow-400 to-orange-500',
    nutritionAdjust: { carbsMultiplier: 1.0, proteinMultiplier: 1.1, caloriesAdjust: 0 }
  },
  {
    id: 'zen',
    emoji: '🧘',
    label: 'Zen',
    description: 'Leve e equilibrado',
    color: 'from-green-400 to-teal-500',
    nutritionAdjust: { carbsMultiplier: 0.9, proteinMultiplier: 1.0, caloriesAdjust: -100 }
  },
  {
    id: 'motivated',
    emoji: '💪',
    label: 'Motivado',
    description: 'Foco total',
    color: 'from-red-400 to-pink-500',
    nutritionAdjust: { carbsMultiplier: 1.1, proteinMultiplier: 1.2, caloriesAdjust: 150 }
  },
  {
    id: 'stressed',
    emoji: '😤',
    label: 'Estressado',
    description: 'Preciso relaxar',
    color: 'from-purple-400 to-violet-500',
    nutritionAdjust: { carbsMultiplier: 0.95, proteinMultiplier: 1.0, caloriesAdjust: -50 }
  },
  {
    id: 'happy',
    emoji: '😊',
    label: 'Feliz',
    description: 'Dia perfeito',
    color: 'from-pink-400 to-rose-500',
    nutritionAdjust: { carbsMultiplier: 1.0, proteinMultiplier: 1.0, caloriesAdjust: 0 }
  }
];

interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: (mood: Mood) => void;
  className?: string;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  className
}) => {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Como você está hoje?
        </h3>
        <p className="text-sm text-muted-foreground">
          Seu mood influencia as sugestões do cardápio
        </p>
      </div>

      {/* Mood Wheel */}
      <div className="relative flex justify-center">
        <div className="grid grid-cols-3 gap-3 max-w-xs">
          {MOODS.map((mood, index) => {
            const isSelected = selectedMood === mood.id;
            const isHovered = hoveredMood === mood.id;

            return (
              <motion.button
                key={mood.id}
                onClick={() => onMoodSelect(mood)}
                onMouseEnter={() => setHoveredMood(mood.id)}
                onMouseLeave={() => setHoveredMood(null)}
                className={cn(
                  "relative p-4 rounded-2xl transition-all duration-300",
                  "border-2 backdrop-blur-sm",
                  isSelected
                    ? `bg-gradient-to-br ${mood.color} border-white/50 shadow-lg shadow-${mood.color.split('-')[1]}-500/30`
                    : "bg-card/50 border-border hover:border-primary/50"
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Glow effect when selected */}
                {isSelected && (
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50 blur-xl -z-10",
                      mood.color
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                  />
                )}

                {/* Emoji */}
                <motion.span
                  className="text-3xl block mb-1"
                  animate={{
                    scale: isSelected || isHovered ? 1.2 : 1,
                    rotate: isSelected ? [0, -10, 10, 0] : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {mood.emoji}
                </motion.span>

                {/* Label */}
                <span className={cn(
                  "text-xs font-medium block",
                  isSelected ? "text-white" : "text-foreground"
                )}>
                  {mood.label}
                </span>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-xs">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Mood Description */}
      <AnimatePresence mode="wait">
        {selectedMood && (
          <motion.div
            key={selectedMood}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            {(() => {
              const mood = MOODS.find(m => m.id === selectedMood);
              if (!mood) return null;
              return (
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                  `bg-gradient-to-r ${mood.color} text-white`
                )}>
                  <span>{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.description}</span>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { MOODS };
export type { Mood };
