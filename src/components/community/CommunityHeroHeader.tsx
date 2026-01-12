import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, TrendingUp, Crown, Flame, Users, MessageCircle, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

// Badges criativos baseados na posição (só mostra se posição <= 3)
const getRankBadge = (position: number) => {
  if (position === 0) return null;
  if (position === 1) return { icon: Crown, label: '👑 Líder', color: 'text-yellow-300', bg: 'bg-yellow-500/20' };
  if (position === 2) return { icon: Trophy, label: '🥈 Vice', color: 'text-slate-300', bg: 'bg-slate-500/20' };
  if (position === 3) return { icon: Star, label: '🥉 Top 3', color: 'text-amber-400', bg: 'bg-amber-500/20' };
  return null; // Não mostra badge para posições > 3
};

// Nível do usuário baseado em pontos
const getUserLevel = (points: number) => {
  if (points >= 5000) return { level: 'Diamante', color: 'from-cyan-400 to-blue-500', number: 10 };
  if (points >= 3000) return { level: 'Platina', color: 'from-slate-300 to-slate-500', number: 9 };
  if (points >= 2000) return { level: 'Ouro', color: 'from-yellow-400 to-amber-500', number: 8 };
  if (points >= 1500) return { level: 'Prata', color: 'from-gray-300 to-gray-500', number: 7 };
  if (points >= 1000) return { level: 'Bronze', color: 'from-orange-400 to-orange-600', number: 6 };
  if (points >= 500) return { level: 'Expert', color: 'from-purple-400 to-purple-600', number: 5 };
  if (points >= 300) return { level: 'Avançado', color: 'from-blue-400 to-blue-600', number: 4 };
  if (points >= 150) return { level: 'Intermediário', color: 'from-green-400 to-green-600', number: 3 };
  if (points >= 50) return { level: 'Iniciante', color: 'from-teal-400 to-teal-600', number: 2 };
  return { level: 'Novato', color: 'from-gray-400 to-gray-600', number: 1 };
};

// Cor da borda do avatar baseada no streak
const getAvatarBorderColor = (streak: number) => {
  if (streak >= 30) return 'ring-yellow-400 ring-4';
  if (streak >= 14) return 'ring-purple-400 ring-3';
  if (streak >= 7) return 'ring-orange-400 ring-3';
  if (streak >= 3) return 'ring-green-400 ring-2';
  return 'ring-white/40 ring-2';
};

export const CommunityHeroHeader: React.FC<CommunityHeroHeaderProps> = ({
  userName,
  userAvatar,
  userPosition,
  totalPoints,
  streakDays = 0,
  missionsCompleted = 0,
  profileViews = 0,
  unreadMessages = 0,
}) => {
  const rankBadge = getRankBadge(userPosition);
  const userLevel = getUserLevel(totalPoints);
  const avatarBorder = getAvatarBorderColor(streakDays);

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
        {/* Mobile: Layout centralizado */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3 sm:gap-4 mb-4">
          {/* Avatar with dynamic ring based on streak */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-sm" />
            <Avatar className={cn(
              "w-16 h-16 sm:w-14 sm:h-14 shadow-xl relative",
              avatarBorder
            )}>
              <AvatarImage src={userAvatar} className="object-cover" />
              <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                {userName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Level badge on avatar */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg text-[10px] font-bold text-white",
                `bg-gradient-to-br ${userLevel.color}`
              )}
            >
              {userLevel.number}
            </motion.div>
          </motion.div>
          
          {/* User info - centralizado no mobile */}
          <div className="flex-1 flex flex-col items-center sm:items-start">
            <motion.h2 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl sm:text-lg font-bold text-white"
            >
              Olá, {formatUserName(userName)}! 👋
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mt-2 flex-wrap justify-center sm:justify-start"
            >
              {/* User Level Badge */}
              <Badge className={cn(
                "text-[10px] border-0 text-white",
                `bg-gradient-to-r ${userLevel.color}`
              )}>
                Nível {userLevel.number} • {userLevel.level}
              </Badge>
              
              {/* Ranking position + badge combinado */}
              {userPosition > 0 && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-white/80" />
                  <span className="text-white/90 text-xs font-medium">#{userPosition}</span>
                  {rankBadge && (
                    <Badge className={cn(
                      "text-[10px] border-0",
                      rankBadge.bg,
                      rankBadge.color
                    )}>
                      {rankBadge.label}
                    </Badge>
                  )}
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Points badge - posição absoluta no mobile, inline no desktop */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full shadow-lg sm:absolute sm:top-4 sm:right-4 absolute top-4 right-4"
          >
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-sm font-bold text-white">{totalPoints.toLocaleString()}</span>
          </motion.div>
        </div>
        
        {/* Stats row - Improved for mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-4 gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3"
        >
          {/* Streak */}
          <div className="flex flex-col items-center gap-0.5">
            <Flame className={cn(
              "w-4 h-4",
              streakDays >= 7 ? "text-orange-400 animate-pulse" : "text-orange-300"
            )} />
            <span className="text-sm font-bold text-white">{streakDays}</span>
            <span className="text-[9px] text-white/60">Sequência</span>
          </div>
          
          {/* Missions */}
          <div className="flex flex-col items-center gap-0.5">
            <Target className="w-4 h-4 text-green-300" />
            <span className="text-sm font-bold text-white">{missionsCompleted}</span>
            <span className="text-[9px] text-white/60">Missões</span>
          </div>
          
          {/* Followers */}
          <div className="flex flex-col items-center gap-0.5">
            <Users className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-bold text-white">{profileViews}</span>
            <span className="text-[9px] text-white/60">Seguidores</span>
          </div>
          
          {/* Messages */}
          <div className="flex flex-col items-center gap-0.5 relative">
            <MessageCircle className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-bold text-white">{unreadMessages}</span>
            <span className="text-[9px] text-white/60">Mensagens</span>
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-1/4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
