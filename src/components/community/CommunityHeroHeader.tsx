import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Target, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommunityHeroHeaderProps {
  userName: string;
  userAvatar?: string;
  userPosition: number;
  totalPoints: number;
  streakDays: number;
  missionsCompleted: number;
}

const formatUserName = (name: string) => {
  if (!name) return 'Usuário';
  const firstName = name.split(' ')[0];
  // Capitalize first letter, limit to 12 chars
  const formatted = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  return formatted.length > 12 ? formatted.slice(0, 12) + '.' : formatted;
};

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
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent border-0 p-5 sm:p-6 mb-4 sm:mb-6 shadow-xl"
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      
      {/* Sparkle decorations */}
      <Sparkles className="absolute top-4 right-4 w-5 h-5 text-white/30 animate-pulse" />
      <Sparkles className="absolute bottom-6 right-12 w-4 h-4 text-white/20 animate-pulse delay-300" />
      
      <div className="relative z-10">
        {/* User greeting */}
        <div className="flex items-center gap-4 mb-5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-3 border-white/30 shadow-xl ring-2 ring-white/20">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                {userName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-lg" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
              Olá, {formatUserName(userName)}! 👋
            </h2>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mt-1.5"
            >
              <Badge 
                className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs sm:text-sm backdrop-blur-sm shadow-sm"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                #{userPosition} no ranking
              </Badge>
            </motion.div>
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 shadow-lg cursor-default"
          >
            <div className="w-7 h-7 rounded-full bg-orange-400/30 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-300" />
            </div>
            <span className="text-sm font-semibold text-white">
              {streakDays} dias
            </span>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 shadow-lg cursor-default"
          >
            <div className="w-7 h-7 rounded-full bg-yellow-400/30 flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-300" />
            </div>
            <span className="text-sm font-semibold text-white">
              {totalPoints.toLocaleString()} pts
            </span>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 shadow-lg cursor-default"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-400/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-300" />
            </div>
            <span className="text-sm font-semibold text-white">
              {missionsCompleted} missões
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
