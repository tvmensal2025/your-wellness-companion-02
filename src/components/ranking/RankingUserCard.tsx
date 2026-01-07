import { motion } from 'framer-motion';
import { Star, Flame, Target, Crown, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface RankingUserCardProps {
  position: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalPoints: number;
  streak: number;
  missionsCompleted: number;
  isCurrentUser: boolean;
  index: number;
}

export function RankingUserCard({
  position,
  userId,
  userName,
  avatarUrl,
  totalPoints,
  streak,
  missionsCompleted,
  isCurrentUser,
  index,
}: RankingUserCardProps) {
  const getPositionStyle = (pos: number) => {
    const styles: Record<number, { bg: string; border: string; badge: string }> = {
      4: { bg: 'from-indigo-500/10 to-indigo-500/5', border: 'border-indigo-500/30', badge: 'bg-indigo-500' },
      5: { bg: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-500/30', badge: 'bg-purple-500' },
      6: { bg: 'from-pink-500/10 to-pink-500/5', border: 'border-pink-500/30', badge: 'bg-pink-500' },
      7: { bg: 'from-rose-500/10 to-rose-500/5', border: 'border-rose-500/30', badge: 'bg-rose-500' },
      8: { bg: 'from-orange-500/10 to-orange-500/5', border: 'border-orange-500/30', badge: 'bg-orange-500' },
      9: { bg: 'from-teal-500/10 to-teal-500/5', border: 'border-teal-500/30', badge: 'bg-teal-500' },
      10: { bg: 'from-cyan-500/10 to-cyan-500/5', border: 'border-cyan-500/30', badge: 'bg-cyan-500' },
    };
    return styles[pos] || { bg: 'from-muted/50 to-muted/30', border: 'border-muted', badge: 'bg-muted-foreground' };
  };

  const style = getPositionStyle(position);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.08,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
      }}
      className={`
        relative overflow-hidden rounded-xl p-3 sm:p-4
        bg-gradient-to-r ${style.bg}
        border ${style.border}
        ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
        transition-all duration-300 cursor-pointer
      `}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 to-accent/5" />

      <div className="relative flex items-center gap-3">
        {/* Position Badge */}
        <div className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center 
          ${style.badge} text-white font-bold text-sm sm:text-base shadow-lg
        `}>
          {position}
        </div>

        {/* Avatar */}
        <div className="relative">
          <Avatar className={`w-10 h-10 sm:w-12 sm:h-12 border-2 ${style.border}`}>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-muted font-semibold text-muted-foreground">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Level indicator */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${style.badge} flex items-center justify-center border-2 border-background`}>
            <span className="text-[10px] text-white font-bold">
              {Math.floor(totalPoints / 100)}
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm sm:text-base truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
            {userName}
            {isCurrentUser && (
              <span className="ml-1 text-xs text-primary/70 font-normal">(Você)</span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              {missionsCompleted}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Badge */}
          {streak > 0 && (
            <motion.div
              animate={streak >= 7 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Badge 
                variant="secondary" 
                className={`
                  text-xs px-2 py-0.5 
                  ${streak >= 7 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg' 
                    : 'bg-orange-100 text-orange-700 border-orange-200'
                  }
                `}
              >
                <Flame className={`w-3 h-3 mr-1 ${streak >= 7 ? 'animate-pulse' : ''}`} />
                {streak}
              </Badge>
            </motion.div>
          )}

          {/* Points */}
          <div className="flex items-center gap-1 bg-background/80 rounded-lg px-2 py-1 shadow-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-sm text-foreground">
              {totalPoints.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
