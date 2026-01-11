import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Sunrise, Sun, Coffee, Moon, UtensilsCrossed,
  Sparkles, ChefHat, Brain, Leaf, Heart,
  Zap, Timer, TrendingUp
} from 'lucide-react';

interface MealPlanLoadingExperienceProps {
  isLoading: boolean;
  userName?: string;
  objective?: string;
  days?: number;
  calories?: number;
  onComplete?: () => void;
  className?: string;
}

// Frases motivacionais que aparecem durante o loading
const LOADING_PHRASES = [
  { text: "Analisando suas preferências...", icon: Brain, emoji: "🧠" },
  { text: "Selecionando ingredientes frescos...", icon: Leaf, emoji: "🥬" },
  { text: "Calculando macros perfeitos...", icon: TrendingUp, emoji: "📊" },
  { text: "Equilibrando nutrientes...", icon: Heart, emoji: "💚" },
  { text: "Preparando receitas deliciosas...", icon: ChefHat, emoji: "👨‍🍳" },
  { text: "Otimizando para seu objetivo...", icon: Zap, emoji: "⚡" },
  { text: "Finalizando seu cardápio...", icon: Sparkles, emoji: "✨" }
];

// Configuração das refeições na timeline
const MEALS_CONFIG = [
  { id: 'breakfast', icon: Sunrise, label: 'Café', time: '7h', color: 'from-orange-400 to-amber-500', emoji: '🌅' },
  { id: 'lunch', icon: Sun, label: 'Almoço', time: '12h', color: 'from-green-400 to-emerald-500', emoji: '☀️' },
  { id: 'snack', icon: Coffee, label: 'Lanche', time: '15h', color: 'from-cyan-400 to-blue-500', emoji: '🍃' },
  { id: 'dinner', icon: UtensilsCrossed, label: 'Jantar', time: '19h', color: 'from-purple-400 to-violet-500', emoji: '🌆' },
  { id: 'supper', icon: Moon, label: 'Ceia', time: '21h', color: 'from-indigo-400 to-blue-600', emoji: '🌙' }
];

// Ingredientes que "caem" na animação
const FALLING_INGREDIENTS = [
  '🥗', '🍗', '🥦', '🍚', '🥕', '🍳', '🥑', '🍎', '🥛', '🍞',
  '🐟', '🥜', '🍌', '🥒', '🍅', '🧀', '🥬', '🍊', '🥚', '🌽'
];

export const MealPlanLoadingExperience: React.FC<MealPlanLoadingExperienceProps> = ({
  isLoading,
  userName = 'você',
  objective = 'seu objetivo',
  days = 7,
  calories = 2000,
  onComplete,
  className
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fallingItems, setFallingItems] = useState<Array<{ id: number; emoji: string; x: number }>>([]);

  // Ciclar frases motivacionais
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentPhraseIndex(prev => (prev + 1) % LOADING_PHRASES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Animar timeline das refeições
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setActiveMealIndex(prev => (prev + 1) % MEALS_CONFIG.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Progresso geral
  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Nunca chega a 100 até completar
        return prev + Math.random() * 3;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Ingredientes caindo
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      const newItem = {
        id: Date.now(),
        emoji: FALLING_INGREDIENTS[Math.floor(Math.random() * FALLING_INGREDIENTS.length)],
        x: Math.random() * 80 + 10 // 10% a 90% da largura
      };
      setFallingItems(prev => [...prev.slice(-15), newItem]);
    }, 400);

    return () => clearInterval(interval);
  }, [isLoading]);

  const currentPhrase = LOADING_PHRASES[currentPhraseIndex];
  const CurrentIcon = currentPhrase.icon;

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        "bg-background/98 backdrop-blur-md",
        className
      )}
      style={{ isolation: 'isolate' }}
    >
      {/* Ingredientes caindo no fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {fallingItems.map(item => (
            <motion.span
              key={item.id}
              className="absolute text-3xl"
              style={{ left: `${item.x}%` }}
              initial={{ y: -50, opacity: 0.8, rotate: 0 }}
              animate={{ y: '100vh', opacity: 0, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4, ease: 'linear' }}
            >
              {item.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Header com saudação */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            👨‍🍳
          </motion.div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Preparando seu cardápio, {userName}!
          </h2>
          <p className="text-sm text-muted-foreground">
            {days} dias • {calories} kcal/dia • {objective}
          </p>
        </motion.div>

        {/* Timeline Visual das Refeições */}
        <div className="relative mb-8">
          {/* Linha de fundo */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 via-green-400 via-cyan-400 via-purple-400 to-indigo-400"
              initial={{ width: '0%' }}
              animate={{ width: `${(activeMealIndex + 1) / MEALS_CONFIG.length * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Nós das refeições */}
          <div className="relative flex justify-between">
            {MEALS_CONFIG.map((meal, index) => {
              const Icon = meal.icon;
              const isActive = index === activeMealIndex;
              const isPast = index < activeMealIndex;

              return (
                <motion.div
                  key={meal.id}
                  className="flex flex-col items-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Nó */}
                  <motion.div
                    className={cn(
                      "relative w-12 h-12 rounded-full flex items-center justify-center",
                      "border-2 transition-all duration-300",
                      isActive 
                        ? `bg-gradient-to-br ${meal.color} border-white shadow-lg` 
                        : isPast
                          ? "bg-primary/20 border-primary"
                          : "bg-muted border-border"
                    )}
                    animate={isActive ? { 
                      scale: [1, 1.15, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(34, 197, 94, 0)',
                        '0 0 0 10px rgba(34, 197, 94, 0.3)',
                        '0 0 0 0 rgba(34, 197, 94, 0)'
                      ]
                    } : {}}
                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                  >
                    {isActive ? (
                      <motion.span
                        className="text-2xl"
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {meal.emoji}
                      </motion.span>
                    ) : (
                      <Icon className={cn(
                        "w-5 h-5",
                        isPast ? "text-primary" : "text-muted-foreground"
                      )} />
                    )}

                    {/* Checkmark para refeições passadas */}
                    {isPast && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                      >
                        <span className="text-[10px] text-primary-foreground">✓</span>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Label */}
                  <span className={cn(
                    "mt-2 text-xs font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {meal.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {meal.time}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Frase motivacional atual */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhraseIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center gap-3 mb-8 p-4 rounded-xl bg-card/50 border border-border"
          >
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {currentPhrase.emoji}
            </motion.span>
            <span className="text-sm font-medium text-foreground">
              {currentPhrase.text}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Gerando cardápio...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-emerald-500 to-cyan-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Dica */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          💡 Dica: Cardápios personalizados consideram suas restrições e preferências
        </motion.p>

        {/* Prato animado no centro (opcional, mais sutil) */}
        <motion.div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-40 h-40 rounded-full border-4 border-dashed border-primary" />
        </motion.div>
      </div>
    </motion.div>
  );
};
