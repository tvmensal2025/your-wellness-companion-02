import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, AlertTriangle } from 'lucide-react';
import { useUserStreak } from '@/hooks/useUserStreak';

export const StreakBar: React.FC = () => {
  const { currentStreak, bestStreak, isActiveToday, streakExpiresIn, loading } = useUserStreak();

  if (loading) return null;

  const isUrgent = !isActiveToday && streakExpiresIn < 6;
  const flameSize = Math.min(24 + currentStreak * 2, 40);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-3 ${
        isUrgent 
          ? 'bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 border border-red-500/30' 
          : 'bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20'
      }`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent animate-pulse" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Flame Icon with Animation */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: isActiveToday ? [0, 5, -5, 0] : 0
            }}
            transition={{ 
              repeat: Infinity, 
              duration: isActiveToday ? 0.5 : 2,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <Flame 
              className={`${isActiveToday ? 'text-orange-500' : 'text-muted-foreground/50'}`} 
              size={flameSize}
              fill={isActiveToday ? '#f97316' : 'transparent'}
            />
            {currentStreak >= 7 && (
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </motion.div>
            )}
          </motion.div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
              <span className="text-sm text-muted-foreground">
                {currentStreak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Recorde: {bestStreak} dias
            </p>
          </div>
        </div>

        {/* Status / Urgência */}
        <AnimatePresence mode="wait">
          {isActiveToday ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1.5"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600">Ativo hoje!</span>
            </motion.div>
          ) : isUrgent ? (
            <motion.div
              key="urgent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs font-medium text-red-500">
                {streakExpiresIn}h restantes!
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1.5"
            >
              <span className="text-xs font-medium text-amber-600">
                Registre algo hoje!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Streak milestones */}
      {currentStreak > 0 && (
        <div className="mt-3 flex gap-1">
          {[7, 14, 30, 60, 100].map((milestone) => (
            <div
              key={milestone}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                currentStreak >= milestone 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-400' 
                  : 'bg-muted/30'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
