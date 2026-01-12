// =====================================================
// LEAGUE BADGE - BADGE DA LIGA DO USUÁRIO
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserLeague } from '@/types/challenges-v2';
import { LEAGUE_CONFIG } from '@/types/challenges-v2';

interface LeagueBadgeProps {
  league: UserLeague;
  className?: string;
  showRank?: boolean;
}

export const LeagueBadge: React.FC<LeagueBadgeProps> = ({ 
  league, 
  className,
  showRank = true 
}) => {
  const config = LEAGUE_CONFIG[league.current_league] || LEAGUE_CONFIG.bronze;

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-muted/50 backdrop-blur-sm border border-border/50",
        className
      )}
      whileHover={{ scale: 1.05 }}
    >
      <motion.span
        className="text-2xl"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
      >
        {config.emoji}
      </motion.span>
      
      <div>
        <p className="text-xs text-muted-foreground">Liga</p>
        <p 
          className="text-sm font-bold"
          style={{ color: config.color }}
        >
          {config.name}
        </p>
      </div>
    </motion.div>
  );
};

export default LeagueBadge;
