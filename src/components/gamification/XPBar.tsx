import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Sparkles } from 'lucide-react';
import { useUserXP } from '@/hooks/useUserXP';

export const XPBar: React.FC = () => {
  const { level, levelTitle, currentXP, xpToNextLevel, xpProgress, xpGained, loading } = useUserXP();

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* XP Gained Animation */}
      <AnimatePresence>
        {xpGained && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute right-0 -top-2 z-10 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-white shadow-lg"
          >
            <Sparkles className="h-4 w-4" />
            <span className="font-bold">+{xpGained} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {/* Level Badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-violet-500 to-purple-600 shadow-lg shadow-primary/30"
        >
          <span className="text-xl font-bold text-white">{level}</span>
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </motion.div>
        </motion.div>

        {/* XP Progress */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-foreground">{levelTitle}</span>
            <span className="text-xs text-muted-foreground">
              {currentXP} / {xpToNextLevel} XP
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/30">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-violet-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </div>

          {/* Next level indicator */}
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span>{xpToNextLevel - currentXP} XP para Nível {level + 1}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
