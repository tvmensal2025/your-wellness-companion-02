import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommunityHeroHeaderProps {
  userName: string;
  userAvatar?: string;
  userPosition: number;
  totalPoints: number;
  streakDays: number;
  missionsCompleted: number;
}

export const CommunityHeroHeader: React.FC<CommunityHeroHeaderProps> = ({
  userName,
  userAvatar,
  userPosition,
  totalPoints,
  streakDays,
  missionsCompleted
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 dark:from-primary/20 dark:via-primary/10 dark:to-accent/20 border border-primary/20 p-4 sm:p-6 mb-4 sm:mb-6"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* User greeting */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-primary/30 shadow-lg">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {userName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Olá, {userName?.split(' ')[0] || 'Usuário'}! 👋
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="secondary" 
                className="bg-primary/20 text-primary border-0 text-xs sm:text-sm"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                #{userPosition} no ranking
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-full border border-orange-500/20"
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {streakDays} dias
            </span>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full border border-yellow-500/20"
          >
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              {totalPoints.toLocaleString()} pts
            </span>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/20"
          >
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {missionsCompleted} missões
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
