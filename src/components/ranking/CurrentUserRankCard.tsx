import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CurrentUserRankCardProps {
  position: number;
  userName: string;
  avatarUrl?: string;
  totalPoints: number;
  streak: number;
  pointsToNextRank?: number;
  trend?: 'up' | 'down' | 'same';
  positionChange?: number;
}

export function CurrentUserRankCard({
  position,
  userName,
  avatarUrl,
  totalPoints,
  streak,
  pointsToNextRank = 0,
  trend = 'same',
  positionChange = 0,
}: CurrentUserRankCardProps) {
  const trendIcons = {
    up: <TrendingUp className="w-4 h-4 text-green-500" />,
    down: <TrendingDown className="w-4 h-4 text-red-500" />,
    same: <Minus className="w-4 h-4 text-muted-foreground" />,
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    same: 'text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative overflow-hidden"
    >
      {/* Animated background pulse */}
      <motion.div
        animate={{ 
          scale: [1, 1.02, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl"
      />

      <div className="relative bg-gradient-to-r from-primary/10 via-background to-accent/10 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-4">
          {/* Position Badge */}
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
            >
              <span className="text-xl font-bold text-primary-foreground">#{position}</span>
            </motion.div>
            
            {/* Trend indicator */}
            <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border-2 flex items-center justify-center ${trend === 'up' ? 'border-green-500' : trend === 'down' ? 'border-red-500' : 'border-muted'}`}>
              {trendIcons[trend]}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10 border-2 border-primary/30">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  {userName}
                  <span className="text-xs text-primary font-normal">(Você)</span>
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    {totalPoints.toLocaleString()} pts
                  </span>
                  {streak > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="text-orange-500">🔥</span>
                      {streak} dias
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trend Change */}
          {positionChange !== 0 && (
            <div className={`text-right ${trendColors[trend]}`}>
              <span className="text-sm font-semibold">
                {positionChange > 0 ? `+${positionChange}` : positionChange}
              </span>
              <p className="text-[10px]">posições</p>
            </div>
          )}
        </div>

        {/* Points to next rank */}
        {pointsToNextRank > 0 && position > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 pt-3 border-t border-primary/20"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" />
                Para subir para #{position - 1}
              </span>
              <span className="font-semibold text-primary">
                +{pointsToNextRank.toLocaleString()} pts
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalPoints / (totalPoints + pointsToNextRank)) * 100)}%` }}
                transition={{ duration: 1, delay: 1 }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
