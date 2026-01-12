import { motion } from 'framer-motion';
import { Crown, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PodiumUser {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  total_points: number;
  position: number;
}

interface RankingPodiumProps {
  topThree: PodiumUser[];
  currentUserId?: string;
  onUserClick?: (userId: string) => void;
}

export function RankingPodium({ topThree, currentUserId, onUserClick }: RankingPodiumProps) {
  if (topThree.length < 3) return null;

  const first = topThree.find(u => u.position === 1);
  const second = topThree.find(u => u.position === 2);
  const third = topThree.find(u => u.position === 3);

  if (!first || !second || !third) return null;

  const getAnimationDelay = (position: number) => {
    if (position === 1) return 0;
    if (position === 2) return 0.15;
    return 0.3;
  };

  const renderPodiumItem = (user: PodiumUser, position: number) => {
    const isCurrentUser = user.user_id === currentUserId;
    const isFirst = position === 1;
    const isSecond = position === 2;
    
    const heights = {
      1: 'h-28 sm:h-32',
      2: 'h-20 sm:h-24',
      3: 'h-16 sm:h-20',
    };

    const gradients = {
      1: 'from-yellow-400 via-yellow-500 to-amber-600',
      2: 'from-slate-300 via-slate-400 to-slate-500',
      3: 'from-amber-600 via-amber-700 to-orange-800',
    };

    const glows = {
      1: 'shadow-[0_0_30px_rgba(234,179,8,0.5)]',
      2: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]',
      3: 'shadow-[0_0_20px_rgba(217,119,6,0.4)]',
    };

    const avatarSizes = {
      1: 'w-24 h-24 sm:w-28 sm:h-28',
      2: 'w-16 h-16 sm:w-20 sm:h-20',
      3: 'w-16 h-16 sm:w-20 sm:h-20',
    };

    const borderColors = {
      1: 'border-yellow-400',
      2: 'border-slate-400',
      3: 'border-amber-600',
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: getAnimationDelay(position),
          duration: 0.5,
          type: 'spring',
          bounce: 0.4,
        }}
        onClick={() => onUserClick?.(user.user_id)}
        className={`flex flex-col items-center cursor-pointer hover:scale-105 transition-transform ${isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3'}`}
      >
        {/* Avatar Section */}
        <div className="relative mb-2">
          {isFirst && (
            <motion.div
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 z-10"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 fill-yellow-400 drop-shadow-lg" />
                </motion.div>
                <div className="absolute inset-0 animate-pulse">
                  <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-300 opacity-50" />
                </div>
              </div>
            </motion.div>
          )}
          
          <Avatar className={`${avatarSizes[position as 1|2|3]} border-4 ${borderColors[position as 1|2|3]} ${glows[position as 1|2|3]} ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className={`bg-gradient-to-br ${gradients[position as 1|2|3]} text-white font-bold text-lg`}>
              {user.user_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {!isFirst && (
            <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${gradients[position as 1|2|3]} flex items-center justify-center ${glows[position as 1|2|3]}`}>
              <Medal className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Name */}
        <p className={`font-semibold text-xs sm:text-sm text-center truncate max-w-[80px] sm:max-w-[100px] ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
          {user.user_name}
          {isCurrentUser && <span className="text-[10px] block text-primary/70">(Você)</span>}
        </p>

        {/* Points */}
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs sm:text-sm font-bold bg-gradient-to-r ${gradients[position as 1|2|3]} bg-clip-text text-transparent`}>
            {user.total_points.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground">pts</span>
        </div>

        {/* Pedestal */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: position === 1 ? 0.3 : position === 2 ? 0.45 : 0.6, duration: 0.4 }}
          className={`w-20 sm:w-24 ${heights[position as 1|2|3]} mt-2 rounded-t-xl bg-gradient-to-b ${gradients[position as 1|2|3]} ${glows[position as 1|2|3]} origin-bottom flex items-start justify-center pt-2`}
        >
          <span className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg">
            {position}º
          </span>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="relative py-6 px-2">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Podium Container */}
      <div className="relative flex justify-center items-end gap-2 sm:gap-4">
        {renderPodiumItem(second, 2)}
        {renderPodiumItem(first, 1)}
        {renderPodiumItem(third, 3)}
      </div>
    </div>
  );
}
