import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Ingredient {
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit';
  emoji: string;
}

interface PlateAssemblyAnimationProps {
  isGenerating: boolean;
  ingredients?: Ingredient[];
  calories?: number;
  targetCalories?: number;
  className?: string;
}

const CATEGORY_COLORS = {
  protein: { bg: 'bg-red-500', particle: '#ef4444', label: 'Proteína' },
  carb: { bg: 'bg-amber-500', particle: '#f59e0b', label: 'Carboidrato' },
  fat: { bg: 'bg-yellow-400', particle: '#facc15', label: 'Gordura' },
  vegetable: { bg: 'bg-green-500', particle: '#22c55e', label: 'Vegetal' },
  fruit: { bg: 'bg-purple-500', particle: '#a855f7', label: 'Fruta' }
};

const SAMPLE_INGREDIENTS: Ingredient[] = [
  { name: 'Frango', category: 'protein', emoji: '🍗' },
  { name: 'Arroz', category: 'carb', emoji: '🍚' },
  { name: 'Brócolis', category: 'vegetable', emoji: '🥦' },
  { name: 'Azeite', category: 'fat', emoji: '🫒' },
  { name: 'Batata', category: 'carb', emoji: '🥔' },
  { name: 'Ovo', category: 'protein', emoji: '🥚' },
  { name: 'Tomate', category: 'vegetable', emoji: '🍅' },
  { name: 'Abacate', category: 'fat', emoji: '🥑' },
  { name: 'Banana', category: 'fruit', emoji: '🍌' },
  { name: 'Salmão', category: 'protein', emoji: '🐟' }
];

export const PlateAssemblyAnimation: React.FC<PlateAssemblyAnimationProps> = ({
  isGenerating,
  ingredients = SAMPLE_INGREDIENTS,
  calories = 0,
  targetCalories = 2000,
  className
}) => {
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(0);
  const [plateIngredients, setPlateIngredients] = useState<Ingredient[]>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  // Animate ingredients falling into plate
  useEffect(() => {
    if (!isGenerating) {
      setCurrentIngredientIndex(0);
      setPlateIngredients([]);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIngredientIndex(prev => {
        const nextIndex = (prev + 1) % ingredients.length;
        
        // Add ingredient to plate
        setPlateIngredients(current => {
          if (current.length >= 6) return current.slice(1).concat(ingredients[nextIndex]);
          return [...current, ingredients[nextIndex]];
        });

        // Create particles
        const newParticles = Array.from({ length: 5 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: CATEGORY_COLORS[ingredients[nextIndex].category].particle
        }));
        setParticles(prev => [...prev.slice(-20), ...newParticles]);

        return nextIndex;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isGenerating, ingredients]);

  const fillPercentage = Math.min((calories / targetCalories) * 100, 100);

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Falling Ingredient */}
      <AnimatePresence mode="wait">
        {isGenerating && (
          <motion.div
            key={currentIngredientIndex}
            initial={{ y: -50, opacity: 0, scale: 0.5 }}
            animate={{ y: 80, opacity: 1, scale: 1 }}
            exit={{ y: 120, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.6, ease: "easeIn" }}
            className="absolute top-0 text-4xl z-10"
          >
            {ingredients[currentIngredientIndex]?.emoji}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plate */}
      <div className="relative mt-24">
        {/* Plate shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-4 bg-black/20 rounded-full blur-md" />
        
        {/* Plate base */}
        <motion.div
          className="relative w-48 h-48 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-4 border-gray-300 dark:border-gray-600 shadow-xl overflow-hidden"
          animate={{ scale: isGenerating ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.5, repeat: isGenerating ? Infinity : 0 }}
        >
          {/* Plate inner ring */}
          <div className="absolute inset-4 rounded-full border-2 border-gray-200 dark:border-gray-600" />
          
          {/* Fill indicator (calories) */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/30 to-primary/10"
            initial={{ height: 0 }}
            animate={{ height: `${fillPercentage}%` }}
            transition={{ duration: 0.5 }}
          />

          {/* Ingredients on plate */}
          <div className="absolute inset-8 flex flex-wrap items-center justify-center gap-1">
            <AnimatePresence>
              {plateIngredients.map((ingredient, index) => (
                <motion.span
                  key={`${ingredient.name}-${index}`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-2xl"
                >
                  {ingredient.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Particles */}
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: particle.color }}
              initial={{ 
                x: `${particle.x}%`, 
                y: `${particle.y}%`,
                scale: 1,
                opacity: 1 
              }}
              animate={{ 
                y: `${particle.y + 30}%`,
                scale: 0,
                opacity: 0 
              }}
              transition={{ duration: 1 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Macro indicators */}
      <div className="flex gap-4 mt-6">
        {Object.entries(CATEGORY_COLORS).slice(0, 4).map(([key, value]) => (
          <motion.div
            key={key}
            className="flex items-center gap-1"
            animate={{
              scale: plateIngredients.some(i => i.category === key) ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <div className={cn("w-3 h-3 rounded-full", value.bg)} />
            <span className="text-xs text-muted-foreground">{value.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Calories counter */}
      {isGenerating && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-2xl font-bold text-primary">
            <motion.span
              key={calories}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {Math.round(fillPercentage)}%
            </motion.span>
          </div>
          <div className="text-xs text-muted-foreground">do prato montado</div>
        </motion.div>
      )}

      {/* Loading text */}
      {isGenerating && (
        <motion.p
          className="mt-4 text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Montando seu cardápio perfeito...
        </motion.p>
      )}
    </div>
  );
};
