import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Gift, CheckCircle, ChevronRight } from 'lucide-react';
import { useFlashChallenge } from '@/hooks/useFlashChallenge';
import { Progress } from '@/components/ui/progress';

export const FlashChallengeCard: React.FC = () => {
  const { challenge, loading, timeRemaining, progress, percentComplete } = useFlashChallenge();

  if (loading || !challenge) return null;

  const isCompleted = percentComplete >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl p-4 ${
        isCompleted 
          ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30'
          : 'bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-500/10 border border-amber-500/30'
      }`}
    >
      {/* Glow Animation */}
      {!isCompleted && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30"
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-bold text-foreground">Desafio Relâmpago</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{timeRemaining}</span>
              </div>
            </div>
          </div>

          {/* Reward Badge */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 ${
              isCompleted 
                ? 'bg-emerald-500/20 text-emerald-600'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
            }`}
          >
            <Gift className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">
              {isCompleted ? 'Completo!' : `+${challenge.xp_reward} XP`}
            </span>
          </motion.div>
        </div>

        {/* Challenge Content */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{challenge.emoji || '⚡'}</span>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{challenge.title}</h4>
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium text-foreground">
              {progress} / {challenge.target_value}
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${
                isCompleted 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Completed State */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 py-2"
            >
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold text-emerald-600">Desafio Completado!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
