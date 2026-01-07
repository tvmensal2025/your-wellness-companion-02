import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, TrendingUp } from 'lucide-react';
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
  const formatted = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  return formatted.length > 12 ? formatted.slice(0, 12) + '.' : formatted;
};

export const CommunityHeroHeader: React.FC<CommunityHeroHeaderProps> = ({
  userName,
  userAvatar,
  userPosition,
  totalPoints,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 p-4 mb-4 shadow-lg"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-11 h-11 border-2 border-white/30 shadow-lg">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-white/20 text-white font-bold text-lg">
              {userName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold text-white">
              Olá, {formatUserName(userName)}! 👋
            </h2>
            <div className="flex items-center gap-1.5 text-white/80 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>#{userPosition} no ranking</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full">
          <Star className="w-4 h-4 text-yellow-300" />
          <span className="text-sm font-semibold text-white">{totalPoints} pts</span>
        </div>
      </div>
    </motion.div>
  );
};
