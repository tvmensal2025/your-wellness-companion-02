import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, Flame, Sparkles, Star, Zap, Play, 
  Trophy, Heart, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================
// DADOS MOCK
// ============================================
const MEALS = [
  { key: 'cafe', label: 'Café', emoji: '☕', color: 'from-amber-400 to-orange-500' },
  { key: 'almoco', label: 'Almoço', emoji: '🍽️', color: 'from-emerald-400 to-teal-500' },
  { key: 'lanche', label: 'Lanche', emoji: '🍎', color: 'from-pink-400 to-rose-500' },
  { key: 'jantar', label: 'Jantar', emoji: '🌙', color: 'from-indigo-400 to-purple-500' },
  { key: 'ceia', label: 'Ceia', emoji: '🌟', color: 'from-slate-400 to-slate-600' },
];

const MOCK_HISTORY = [
  { id: '1', date: 'Hoje', calories: 2150, type: 'weekly', emojis: ['☕', '🍽️', '🍎', '🌙'] },
  { id: '2', date: 'Ontem', calories: 1850, type: 'daily', emojis: ['☕', '🍽️', '🌙'] },
  { id: '3', date: '2 dias', calories: 9800, type: 'weekly', emojis: ['☕', '🍽️', '🍎', '🌙', '🌟'] },
];

// ============================================
// LAYOUT 1: COZINHA DO CHEF 🍳
// ============================================
export const ChefKitchenLayout: React.FC = () => {
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['cafe', 'almoco', 'jantar']);
  const [flameIntensity, setFlameIntensity] = useState(7);
  const [isPotBoiling, setIsPotBoiling] = useState(false);

  const toggleMeal = (key: string) => {
    setSelectedMeals(prev => 
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  return (
    <div className="relative min-h-[500px] rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />

      <div className="relative p-6 space-y-6">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl"
          >
            <ChefHat className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold">Cozinha do Chef</h2>
            <p className="text-sm text-muted-foreground">Arraste os ingredientes para a panela</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {MEALS.map((meal) => {
            const isSelected = selectedMeals.includes(meal.key);
            return (
              <motion.button
                key={meal.key}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleMeal(meal.key)}
                className={cn(
                  "relative p-3 rounded-2xl transition-all",
                  isSelected 
                    ? "bg-white dark:bg-slate-700 shadow-xl ring-2 ring-amber-400" 
                    : "bg-white/50 dark:bg-slate-800/50"
                )}
              >
                <motion.span 
                  className="text-3xl block"
                  animate={isSelected ? { y: [0, -10, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {meal.emoji}
                </motion.span>
                <span className="text-[10px] font-medium mt-1 block">{meal.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="relative flex justify-center py-8">
          <div className="absolute bottom-0 flex gap-1">
            {Array.from({ length: flameIntensity }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ scaleY: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.3 + Math.random() * 0.3 }}
                className="w-4 h-8 bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-300 rounded-full origin-bottom"
              />
            ))}
          </div>

          <motion.div
            animate={isPotBoiling ? { y: [0, -3, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="relative z-10"
          >
            <div className="w-40 h-28 bg-gradient-to-b from-slate-600 to-slate-800 rounded-b-[50%] rounded-t-lg shadow-2xl flex items-center justify-center">
              <div className="flex flex-wrap justify-center gap-1 p-2">
                {selectedMeals.map((key) => {
                  const meal = MEALS.find(m => m.key === key);
                  return <span key={key} className="text-2xl">{meal?.emoji}</span>;
                })}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground">Dias:</span>
          <div className="flex gap-1">
            {[1, 3, 7].map((days) => (
              <motion.button
                key={days}
                whileTap={{ scale: 0.9 }}
                onClick={() => setFlameIntensity(days)}
                className={cn(
                  "px-4 py-2 rounded-xl font-bold transition-all",
                  flameIntensity === days
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <Flame className={cn("w-4 h-4 inline mr-1", flameIntensity === days && "animate-pulse")} />
                {days}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsPotBoiling(!isPotBoiling)}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-xl flex items-center justify-center gap-3"
        >
          <ChefHat className="w-6 h-6" />
          {isPotBoiling ? "Cozinhando..." : "Começar a Cozinhar!"}
          <Sparkles className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};


// ============================================
// LAYOUT 2: STORIES DE COMIDA 📱
// ============================================
export const FoodStoriesLayout: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['cafe', 'almoco']);
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  const toggleMeal = (key: string) => {
    setSelectedMeals(prev => prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]);
  };

  return (
    <div className="relative min-h-[500px] rounded-3xl overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 opacity-50" />
      
      <div className="relative p-4 space-y-4">
        <div className="flex gap-3 overflow-x-auto pb-2 px-2">
          {days.map((day, idx) => {
            const isSelected = selectedDay === idx;
            return (
              <motion.button
                key={day}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(idx)}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div className={cn(
                  "w-16 h-16 rounded-full p-0.5",
                  isSelected ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" : "bg-slate-700"
                )}>
                  <div className="w-full h-full rounded-full flex items-center justify-center text-2xl bg-black">
                    {idx <= 2 ? ['☕', '🍽️', '🌙'][idx % 3] : '➕'}
                  </div>
                </div>
                <span className={cn("text-xs", isSelected ? "text-white font-bold" : "text-slate-400")}>{day}</span>
              </motion.button>
            );
          })}
        </div>

        <motion.div 
          key={selectedDay}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-[9/14] max-h-[300px] mx-auto rounded-3xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl mb-4">📅</motion.div>
            <h3 className="text-white text-xl font-bold mb-2">{days[selectedDay]}feira</h3>
          </div>

          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div className="flex justify-center gap-2 flex-wrap">
              {MEALS.map((meal) => {
                const isSelected = selectedMeals.includes(meal.key);
                return (
                  <motion.button
                    key={meal.key}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleMeal(meal.key)}
                    className={cn("px-3 py-2 rounded-full backdrop-blur-md transition-all", isSelected ? "bg-white text-black" : "bg-white/20 text-white")}
                  >
                    <span className="mr-1">{meal.emoji}</span>
                    <span className="text-xs font-medium">{meal.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-xl"
        >
          <Sparkles className="w-5 h-5 inline mr-2" />
          Criar Story Nutricional
        </motion.button>
      </div>
    </div>
  );
};

// ============================================
// LAYOUT 3: SLOT MACHINE 🎰
// ============================================
export const SlotMachineLayout: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [slots, setSlots] = useState(['☕', '🍽️', '🌙']);
  const [coins, setCoins] = useState(2150);
  const allEmojis = ['☕', '🍽️', '🍎', '🌙', '🌟', '🥗', '🍳', '🥩'];

  const spin = () => {
    setIsSpinning(true);
    let spins = 0;
    const interval = setInterval(() => {
      setSlots([
        allEmojis[Math.floor(Math.random() * allEmojis.length)],
        allEmojis[Math.floor(Math.random() * allEmojis.length)],
        allEmojis[Math.floor(Math.random() * allEmojis.length)],
      ]);
      spins++;
      if (spins > 15) {
        clearInterval(interval);
        setIsSpinning(false);
        setCoins(prev => prev + Math.floor(Math.random() * 500));
      }
    }, 100);
  };

  return (
    <div className="relative min-h-[500px] rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-red-900 via-red-800 to-black" />

      <div className="relative p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg">
              <span className="text-xl">🎰</span>
            </div>
            <div>
              <h2 className="text-white font-bold">Slot Nutricional</h2>
              <p className="text-amber-300 text-xs">Gire para ganhar!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
            <span className="text-2xl">🪙</span>
            <span className="text-amber-400 font-bold text-lg">{coins}</span>
            <span className="text-amber-400/60 text-xs">kcal</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xs">
          <div className="absolute -inset-3 bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl" />
          <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-4">
            <div className="bg-black rounded-xl p-4 mb-4">
              <div className="flex justify-center gap-2">
                {slots.map((emoji, idx) => (
                  <motion.div
                    key={idx}
                    animate={isSpinning ? { y: [0, -20, 0] } : {}}
                    transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.1 }}
                    className="w-20 h-24 bg-gradient-to-b from-white to-slate-200 rounded-lg flex items-center justify-center shadow-inner"
                  >
                    <span className="text-5xl">{emoji}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={spin}
              disabled={isSpinning}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl rounded-xl shadow-lg disabled:opacity-50"
            >
              {isSpinning ? "🎲" : "🎰 GIRAR!"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export para UltraCreativeLayoutsPreview
export const UltraCreativeLayoutsPreview: React.FC = () => {
  return <ChefKitchenLayout />;
};
