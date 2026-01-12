// =====================================================
// ACHIEVEMENT CARD - CARD DE CONQUISTA
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserAchievementV2 } from '@/types/challenges-v2';

interface AchievementCardProps {
  achievement: UserAchievementV2;
  className?: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  className,
}) => {
  return (
    <motion.div
      className={cn(
        "p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10",
        "border border-yellow-500/20",
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          {achievement.icon || '🏆'}
        </motion.div>
        
        <div className="flex-1">
          <h4 className="font-bold">{achievement.title}</h4>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-yellow-500">+{achievement.xp_earned}</p>
          <p className="text-xs text-muted-foreground">XP</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementCard;
