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
      className="flex items-center justify-between gap-2 rounded-2xl bg-card/80 backdrop-blur-md border border-border/40 p-3 shadow-sm"
    >
      {/* Streak */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-sm">
          <Flame className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground">{currentStreak} dias</span>
          <span className="text-[9px] text-muted-foreground">Sequência</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-border/50" />

      {/* Level */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground">Nível {level}</span>
          <span className="text-[9px] text-muted-foreground">{levelTitle}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-border/50" />

      {/* XP */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-sm">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground">{totalXP.toLocaleString()}</span>
          <span className="text-[9px] text-muted-foreground">XP Total</span>
        </div>
      </div>
    </motion.div>
  );
};
