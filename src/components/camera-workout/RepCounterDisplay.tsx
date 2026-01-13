/**
 * 🔢 RepCounterDisplay - Contador de repetições visual
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

interface RepCounterDisplayProps {
  currentReps: number;
  targetReps: number;
  isValidRep?: boolean;
  partialReps?: number;
  formScore?: number;
}

export function RepCounterDisplay({
  currentReps,
  targetReps,
  isValidRep = false,
  partialReps = 0,
  formScore = 0,
}: RepCounterDisplayProps) {
  const progress = Math.min(100, (currentReps / targetReps) * 100);
  const isComplete = currentReps >= targetReps;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-background/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg"
    >
      {/* Contador principal */}
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReps}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-center"
          >
            <span className={cn(
              "text-5xl font-bold",
              isComplete ? "text-emerald-500" : "text-foreground"
            )}>
              {currentReps}
            </span>
            <span className="text-2xl text-muted-foreground">/{targetReps}</span>
          </motion.div>
        </AnimatePresence>

        {/* Indicador de rep válida */}
        <AnimatePresence>
          {isValidRep && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barra de progresso */}
      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            isComplete ? "bg-emerald-500" : "bg-primary"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        />
      </div>

      {/* Info adicional */}
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Forma: {Math.round(formScore)}%</span>
        {partialReps > 0 && (
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {partialReps} parciais
          </span>
        )}
      </div>
    </motion.div>
  );
}
