import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Zap } from 'lucide-react';
import { useUserStreak } from '@/hooks/useUserStreak';
import { useUserXP } from '@/hooks/useUserXP';

export const CompactGamificationBar: React.FC = () => {
  const { currentStreak } = useUserStreak();
  const { totalXP, level, levelTitle } = useUserXP();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-md border border-border/40 p-2 sm:p-3 shadow-sm"
    >
      {/* Streak */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-sm flex-shrink-0">
          <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] sm:text-xs font-bold text-foreground truncate">{currentStreak} dias</span>
          <span className="text-[8px] sm:text-[9px] text-muted-foreground">Sequência</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-6 sm:h-8 w-px bg-border/50 flex-shrink-0" />

      {/* Level */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm flex-shrink-0">
          <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] sm:text-xs font-bold text-foreground truncate">Nível {level}</span>
          <span className="text-[8px] sm:text-[9px] text-muted-foreground truncate">{levelTitle}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-6 sm:h-8 w-px bg-border/50 flex-shrink-0" />

      {/* XP */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-sm flex-shrink-0">
          <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] sm:text-xs font-bold text-foreground truncate">{totalXP.toLocaleString()}</span>
          <span className="text-[8px] sm:text-[9px] text-muted-foreground">XP Total</span>
        </div>
      </div>
    </motion.div>
  );
};
