import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, TrendingUp, Crown, Flame, Users, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface CommunityHeroHeaderProps {
  userName: string;
  userAvatar?: string;
  userPosition: number;
  totalPoints: number;
  streakDays: number;
  missionsCompleted: number;
  profileViews?: number;
  unreadMessages?: number;
}

const formatUserName = (name: string) => {
  if (!name) return 'Usuário';
  const firstName = name.split(' ')[0];
  const formatted = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  return formatted.length > 12 ? formatted.slice(0, 12) + '.' : formatted;
};

const getRankBadge = (position: number) => {
  if (position === 1) return { icon: Crown, label: 'Líder', color: 'text-yellow-300' };
  if (position <= 3) return { icon: Star, label: 'Top 3', color: 'text-amber-300' };
  if (position <= 10) return { icon: Flame, label: 'Top 10', color: 'text-orange-300' };
  return null;
};

export const CommunityHeroHeader: React.FC<CommunityHeroHeaderProps> = ({
  userName,
  userAvatar,
  userPosition,
  totalPoints,
  streakDays = 0,
  profileViews = 0,
  unreadMessages = 0,
}) => {
  const rankBadge = getRankBadge(userPosition);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl mb-4 shadow-xl"
    >
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      
      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
      
      <div className="relative z-10 p-4 sm:p-5">
        {/* Main content */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar with ring */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-sm" />
              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-3 border-white/40 shadow-xl relative">
                <AvatarImage src={userAvatar} className="object-cover" />
                <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                  {userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {rankBadge && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-lg"
                >
                  <rankBadge.icon className={`w-4 h-4 ${rankBadge.color}`} />
                </motion.div>
              )}
            </motion.div>
            
            <div>
              <motion.h2 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg sm:text-xl font-bold text-white"
              >
                Olá, {formatUserName(userName)}! 👋
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mt-1"
              >
                <div className="flex items-center gap-1 text-white/80 text-xs sm:text-sm">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="font-medium">#{userPosition}</span>
                  <span className="text-white/60">no ranking</span>
                </div>
                {rankBadge && (
                  <Badge className="bg-white/20 text-white border-0 text-[10px]">
                    {rankBadge.label}
                  </Badge>
                )}
              </motion.div>
            </div>
          </div>
          
          {/* Points badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full shadow-lg"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 fill-yellow-300" />
            <span className="text-sm sm:text-base font-bold text-white">{totalPoints.toLocaleString()}</span>
            <span className="text-xs text-white/70 hidden sm:inline">pts</span>
          </motion.div>
        </div>
        
        {/* Stats row */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3"
        >
          <div className="flex items-center gap-1.5 text-white/90">
            <Flame className="w-4 h-4 text-orange-300" />
            <span className="text-xs sm:text-sm font-medium">{streakDays} dias</span>
            <span className="text-white/60 text-xs hidden sm:inline">de streak</span>
          </div>
          
          <div className="w-px h-4 bg-white/20" />
          
          <div className="flex items-center gap-1.5 text-white/90">
            <Users className="w-4 h-4 text-blue-300" />
            <span className="text-xs sm:text-sm font-medium">{profileViews}</span>
            <span className="text-white/60 text-xs hidden sm:inline">visualizações</span>
          </div>
          
          <div className="w-px h-4 bg-white/20" />
          
          <div className="flex items-center gap-1.5 text-white/90 relative">
            <MessageCircle className="w-4 h-4 text-green-300" />
            <span className="text-xs sm:text-sm font-medium">{unreadMessages}</span>
            <span className="text-white/60 text-xs hidden sm:inline">mensagens</span>
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
