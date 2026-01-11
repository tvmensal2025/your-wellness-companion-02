import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, ChefHat, Flame, Utensils } from 'lucide-react';

interface PrepStep {
  step: number;
  instruction: string;
  duration?: string;
  icon?: string;
}

interface ChefModeAnimationProps {
  recipeName: string;
  totalTime: string;
  steps: PrepStep[];
  utensils: string[];
  isActive?: boolean;
  onComplete?: () => void;
  className?: string;
}

const UTENSIL_ICONS: Record<string, string> = {
  'panela': '🍳',
  'frigideira': '🍳',
  'forno': '🔥',
  'microondas': '📡',
  'liquidificador': '🥤',
  'batedeira': '🥄',
  'faca': '🔪',
  'tábua': '🪵',
  'colher': '🥄',
  'espátula': '🥄',
  'air fryer': '🌀',
  'fogão': '🔥',
  'geladeira': '❄️',
  'default': '🍴'
};

export const ChefModeAnimation: React.FC<ChefModeAnimationProps> = ({
  recipeName,
  totalTime,
  steps,
  utensils,
  isActive = false,
  onComplete,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timerProgress, setTimerProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Parse total time to seconds
  const parseTime = (time: string): number => {
    const match = time.match(/(\d+)/);
    return match ? parseInt(match[1]) * 60 : 300; // default 5 min
  };

  const totalSeconds = parseTime(totalTime);
  const secondsPerStep = totalSeconds / steps.length;

  useEffect(() => {
    if (!isPlaying || !isActive) return;

    const interval = setInterval(() => {
      setTimerProgress((prev) => {
        const newProgress = prev + 1;
        
        // Check if we should advance to next step
        const stepThreshold = ((currentStep + 1) / steps.length) * 100;
        if (newProgress >= stepThreshold && currentStep < steps.length - 1) {
          setCurrentStep((s) => s + 1);
        }

        if (newProgress >= 100) {
          setIsPlaying(false);
          onComplete?.();
          return 100;
        }

        return newProgress;
      });
    }, (totalSeconds * 10)); // Simulate faster for demo

    return () => clearInterval(interval);
  }, [isPlaying, isActive, currentStep, steps.length, totalSeconds]);

  const getUtensilIcon = (utensil: string): string => {
    const key = utensil.toLowerCase();
    return UTENSIL_ICONS[key] || UTENSIL_ICONS['default'];
  };

  return (
    <div className={cn("relative p-6 rounded-2xl bg-card border border-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
            className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <ChefHat className="w-6 h-6 text-primary" />
          </motion.div>
          <div>
            <h3 className="font-bold text-foreground">{recipeName}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {totalTime}
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => setIsPlaying(!isPlaying)}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-all",
            isPlaying
              ? "bg-red-500 text-white"
              : "bg-primary text-primary-foreground"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? 'Pausar' : 'Iniciar'}
        </motion.button>
      </div>

      {/* Circular Timer */}
      <div className="relative w-40 h-40 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={440}
            strokeDashoffset={440 - (440 * timerProgress) / 100}
            initial={{ strokeDashoffset: 440 }}
            animate={{ strokeDashoffset: 440 - (440 * timerProgress) / 100 }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={currentStep}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-foreground"
          >
            {currentStep + 1}/{steps.length}
          </motion.span>
          <span className="text-xs text-muted-foreground">passo</span>
        </div>
      </div>

      {/* Current Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-muted/50 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <motion.span
              className="text-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0, repeatDelay: 2 }}
            >
              {steps[currentStep]?.icon || '👨‍🍳'}
            </motion.span>
            <div>
              <p className="font-medium text-foreground">
                {steps[currentStep]?.instruction}
              </p>
              {steps[currentStep]?.duration && (
                <p className="text-sm text-muted-foreground mt-1">
                  ⏱️ {steps[currentStep].duration}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Steps Progress */}
      <div className="flex gap-1 mb-6">
        {steps.map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "flex-1 h-1.5 rounded-full transition-colors",
              index < currentStep
                ? "bg-primary"
                : index === currentStep
                  ? "bg-primary/50"
                  : "bg-muted"
            )}
            animate={{
              scale: index === currentStep ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.5, repeat: index === currentStep && isPlaying ? Infinity : 0 }}
          />
        ))}
      </div>

      {/* Utensils */}
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <Utensils className="w-3 h-3" />
          Utensílios necessários:
        </p>
        <div className="flex flex-wrap gap-2">
          {utensils.map((utensil, index) => (
            <motion.div
              key={utensil}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border"
            >
              <span>{getUtensilIcon(utensil)}</span>
              <span className="text-sm text-foreground">{utensil}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Flame animation when cooking */}
      {isPlaying && (
        <motion.div
          className="absolute bottom-4 right-4"
          animate={{ 
            y: [0, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Flame className="w-8 h-8 text-orange-500" />
        </motion.div>
      )}
    </div>
  );
};
