import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimerDisplayProps {
  seconds: number;
  progress: number;
  isLow: boolean;
  isComplete: boolean;
  showPulse: boolean;
  showProgress?: boolean;
  variant?: 'full' | 'compact' | 'inline' | 'mini';
  formatTime: (s: number) => string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  seconds,
  progress,
  isLow,
  isComplete,
  showPulse,
  showProgress = true,
  variant = 'full',
  formatTime,
}) => {
  // Versão inline - display menor
  if (variant === 'inline') {
    return (
      <div className="relative">
        {showProgress && (
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/20"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={isLow ? "#ef4444" : isComplete ? "#22c55e" : "#10b981"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
              transform="rotate(-90 50 50)"
              animate={{ scale: showPulse ? 1.05 : 1 }}
              transition={{ duration: 0.15 }}
            />
          </svg>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={isComplete ? 'done' : seconds}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute inset-0 flex items-center justify-center font-mono font-bold",
              !showProgress && "relative",
              isLow && "text-red-500",
              isComplete && "text-green-500",
              !isLow && !isComplete && "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isComplete ? (
              <span className="text-xl">GO! 💪</span>
            ) : (
              <span className="text-3xl">{seconds}</span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Versão full - display completo com anel de progresso
  return (
    <div className="relative flex items-center justify-center py-4">
      {/* Progress Ring */}
      {showProgress && (
        <svg className="absolute w-36 h-36" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isLow ? "#ef4444" : isComplete ? "#22c55e" : "url(#timerGradient)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            transform="rotate(-90 50 50)"
            initial={false}
            animate={{ 
              strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
              scale: showPulse ? 1.05 : 1
            }}
            transition={{ duration: 0.3 }}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Time Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isComplete ? 'complete' : seconds}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "text-5xl font-bold font-mono z-10",
            isLow && "text-red-500",
            isComplete && "text-green-500",
            !isLow && !isComplete && "text-foreground"
          )}
        >
          {isComplete ? (
            <motion.div 
              className="flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <Zap className="w-10 h-10 mb-1" />
              <span className="text-2xl">VAMOS!</span>
            </motion.div>
          ) : (
            formatTime(seconds)
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
