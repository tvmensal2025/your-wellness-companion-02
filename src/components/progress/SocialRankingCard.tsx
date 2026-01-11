import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Trophy, TrendingUp, TrendingDown, Minus, 
  Crown, Medal, Award, Users, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  position: number;
  previousPosition?: number;
  isCurrentUser?: boolean;
  streak?: number;
}

interface SocialRankingCardProps {
  users: RankingUser[];
  currentUserId?: string;
  title?: string;
  onViewAll?: () => void;
}

const POSITION_STYLES: Record<number, { icon: React.ElementType; color: string; bg: string }> = {
  1: { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  2: { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  3: { icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/10' },
};

export const SocialRankingCard: React.FC<SocialRankingCardProps> = ({
  users,
  currentUserId,
  title = "Ranking Semanal",
  onViewAll
}) => {
  const sortedUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => b.points - a.points)
      .map((user, index) => ({
        ...user,
        position: index + 1,
        isCurrentUser: user.id === currentUserId
      }));
  }, [users, currentUserId]);

  const currentUserRank = sortedUsers.find(u => u.isCurrentUser);
  const nextUser = currentUserRank 
    ? sortedUsers.find(u => u.position === currentUserRank.position - 1)
    : null;
  const pointsToNext = nextUser ? nextUser.points - (currentUserRank?.points || 0) : 0;

  const getPositionChange = (user: RankingUser) => {
    if (!user.previousPosition) return null;
    const change = user.previousPosition - user.position;
    if (change > 0) return { direction: 'up', value: change };
    if (change < 0) return { direction: 'down', value: Math.abs(change) };
    return { direction: 'same', value: 0 };
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <span className="font-semibold">{title}</span>
              <p className="text-xs text-muted-foreground">{users.length} participantes</p>
            </div>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {sortedUsers.slice(0, 5).map((user, index) => {
            const positionStyle = POSITION_STYLES[user.position];
            const change = getPositionChange(user);
            const PositionIcon = positionStyle?.icon || Users;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-xl transition-all",
                  user.isCurrentUser 
                    ? "bg-primary/10 border border-primary/30 ring-2 ring-primary/20" 
                    : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                {/* Posição */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                  positionStyle?.bg || "bg-muted",
                  positionStyle?.color || "text-muted-foreground"
                )}>
                  {user.position <= 3 ? (
                    <PositionIcon className="w-4 h-4" />
                  ) : (
                    user.position
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="w-9 h-9 border-2 border-background">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs font-medium">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-medium text-sm truncate",
                      user.isCurrentUser && "text-primary"
                    )}>
                      {user.isCurrentUser ? 'VOCÊ' : user.name}
                    </p>
                    {user.streak && user.streak >= 7 && (
                      <span className="text-xs">🔥</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user.points.toLocaleString()} pts
                  </p>
                </div>

                {/* Mudança de posição */}
                {change && (
                  <div className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    change.direction === 'up' && "text-emerald-500",
                    change.direction === 'down' && "text-red-500",
                    change.direction === 'same' && "text-muted-foreground"
                  )}>
                    {change.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                    {change.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                    {change.direction === 'same' && <Minus className="w-3 h-3" />}
                    {change.value > 0 && change.value}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mensagem motivacional */}
        {currentUserRank && nextUser && pointsToNext > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
          >
            <p className="text-xs text-center">
              <span className="font-medium text-primary">
                Faltam {pointsToNext.toLocaleString()} pts
              </span>
              {' '}para ultrapassar{' '}
              <span className="font-medium">{nextUser.name}</span>!
            </p>
          </motion.div>
        )}

        {currentUserRank?.position === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 text-center"
          >
            <p className="text-sm font-medium text-yellow-600">
              👑 Você é o líder! Continue assim!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialRankingCard;
