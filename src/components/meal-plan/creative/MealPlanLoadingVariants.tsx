import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Sparkles, ChefHat, Utensils, Timer, 
  Flame, Leaf, Heart, Zap
} from 'lucide-react';

// ============================================
// VARIANT 1: Minimal Spinner com Frases
// ============================================
interface MinimalLoadingProps {
  isLoading: boolean;
  className?: string;
}

export const MinimalMealLoading: React.FC<MinimalLoadingProps> = ({ isLoading, className }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const phrases = [
    "Preparando ingredientes...",
    "Calculando nutrientes...",
    "Montando refeições...",
    "Quase pronto..."
  ];

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent" />
        <ChefHat className="absolute inset-0 m-auto w-6 h-6 text-primary" />
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.p
          key={phraseIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-muted-foreground"
        >
          {phrases[phraseIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

// ============================================
// VARIANT 2: Cooking Animation
// ============================================
interface CookingLoadingProps {
  isLoading: boolean;
  className?: string;
}

export const CookingMealLoading: React.FC<CookingLoadingProps> = ({ isLoading, className }) => {
  const [steam, setSteam] = useState<number[]>([]);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setSteam(prev => [...prev.slice(-5), Date.now()]);
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      {/* Panela */}
      <div className="relative">
        {/* Steam particles */}
        {steam.map((id, i) => (
          <motion.div
            key={id}
            className="absolute -top-8 text-2xl"
            style={{ left: `${20 + i * 15}%` }}
            initial={{ y: 0, opacity: 0.8 }}
            animate={{ y: -40, opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            💨
          </motion.div>
        ))}
        
        {/* Pot */}
        <motion.div
          className="text-6xl"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          🍳
        </motion.div>
        
        {/* Flame */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          <Flame className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>

      <p className="text-sm text-muted-foreground">Cozinhando seu cardápio...</p>
    </div>
  );
};

// ============================================
// VARIANT 3: Ingredients Carousel
// ============================================
interface IngredientsCarouselProps {
  isLoading: boolean;
  className?: string;
}

const INGREDIENTS = ['🥗', '🍗', '🥦', '🍚', '🥕', '🍳', '🥑', '🍎', '🥛', '🍞', '🐟', '🥜'];

export const IngredientsCarouselLoading: React.FC<IngredientsCarouselProps> = ({ isLoading, className }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % INGREDIENTS.length);
    }, 300);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 p-8", className)}>
      {/* Carousel */}
      <div className="flex items-center gap-2 overflow-hidden">
        {INGREDIENTS.map((emoji, index) => {
          const distance = Math.abs(index - activeIndex);
          const isActive = index === activeIndex;
          
          return (
            <motion.span
              key={index}
              className="text-3xl"
              animate={{
                scale: isActive ? 1.5 : Math.max(0.5, 1 - distance * 0.2),
                opacity: isActive ? 1 : Math.max(0.3, 1 - distance * 0.3)
              }}
              transition={{ duration: 0.2 }}
            >
              {emoji}
            </motion.span>
          );
        })}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1">
        {INGREDIENTS.map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              index === activeIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground">Selecionando ingredientes...</p>
    </div>
  );
};

// ============================================
// VARIANT 4: Macro Bars Filling
// ============================================
interface MacroBarsLoadingProps {
  isLoading: boolean;
  className?: string;
}

export const MacroBarsLoading: React.FC<MacroBarsLoadingProps> = ({ isLoading, className }) => {
  const [progress, setProgress] = useState({ protein: 0, carbs: 0, fat: 0, fiber: 0 });

  useEffect(() => {
    if (!isLoading) {
      setProgress({ protein: 0, carbs: 0, fat: 0, fiber: 0 });
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => ({
        protein: Math.min(100, prev.protein + Math.random() * 15),
        carbs: Math.min(100, prev.carbs + Math.random() * 12),
        fat: Math.min(100, prev.fat + Math.random() * 10),
        fiber: Math.min(100, prev.fiber + Math.random() * 8)
      }));
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const macros = [
    { name: 'Proteína', value: progress.protein, color: 'bg-red-500', icon: '🥩' },
    { name: 'Carboidratos', value: progress.carbs, color: 'bg-amber-500', icon: '🍞' },
    { name: 'Gorduras', value: progress.fat, color: 'bg-yellow-500', icon: '🥑' },
    { name: 'Fibras', value: progress.fiber, color: 'bg-green-500', icon: '🥬' }
  ];

  return (
    <div className={cn("flex flex-col gap-4 p-8 w-full max-w-xs", className)}>
      <p className="text-sm font-medium text-center text-foreground mb-2">
        Calculando macros...
      </p>
      
      {macros.map((macro) => (
        <div key={macro.name} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1">
              <span>{macro.icon}</span>
              <span className="text-muted-foreground">{macro.name}</span>
            </span>
            <span className="text-muted-foreground">{Math.round(macro.value)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", macro.color)}
              initial={{ width: 0 }}
              animate={{ width: `${macro.value}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// VARIANT 5: Plate Building Animation
// ============================================
interface PlateBuildingProps {
  isLoading: boolean;
  className?: string;
}

export const PlateBuildingLoading: React.FC<PlateBuildingProps> = ({ isLoading, className }) => {
  const [items, setItems] = useState<string[]>([]);
  const allItems = ['🥗', '🍗', '🥦', '🍚', '🥕'];

  useEffect(() => {
    if (!isLoading) {
      setItems([]);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < allItems.length) {
        setItems(prev => [...prev, allItems[index]]);
        index++;
      } else {
        setItems([]);
        index = 0;
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      {/* Plate */}
      <div className="relative w-32 h-32 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-4 border-gray-300 dark:border-gray-600 shadow-xl flex items-center justify-center">
        <div className="absolute inset-4 rounded-full border-2 border-gray-200 dark:border-gray-600" />
        
        {/* Items on plate */}
        <div className="flex flex-wrap justify-center gap-1">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0, y: -30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                className="text-2xl"
              >
                {item}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Montando seu prato...</p>
    </div>
  );
};

// ============================================
// VARIANT 6: Pulse Ring
// ============================================
interface PulseRingLoadingProps {
  isLoading: boolean;
  className?: string;
}

export const PulseRingLoading: React.FC<PulseRingLoadingProps> = ({ isLoading, className }) => {
  if (!isLoading) return null;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      <div className="relative w-24 h-24">
        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary"
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Utensils className="w-10 h-10 text-primary" />
          </motion.div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Gerando cardápio...</p>
    </div>
  );
};
