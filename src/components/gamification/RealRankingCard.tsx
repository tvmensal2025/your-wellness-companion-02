import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Crown, Medal, Trophy, Flame, Star, UserPlus, UserCheck } from 'lucide-react';
import { useRealRanking } from '@/hooks/useRealRanking';
import { useFollow } from '@/hooks/useFollow';

export const RealRankingCard: React.FC = () => {
  const { data, isLoading, refetch } = useRealRanking();
  const { isFollowing, toggleFollow } = useFollow();

  const handleFollow = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFollow(userId);
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { ranking, currentUserRank } = data || { ranking: [], currentUserRank: 0 };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
            {position}
          </span>
        );
    }
  };

  const getRankBg = (position: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-primary/10 border-primary/30';
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/10 to-slate-400/10 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-amber-600/30';
      default:
        return 'bg-card border-border/50';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-primary" />
          Ranking da Comunidade
        </CardTitle>
        {currentUserRank > 0 && (
          <p className="text-sm text-muted-foreground">
            Você está em <span className="font-bold text-primary">#{currentUserRank}</span> lugar
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {ranking.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum usuário no ranking ainda</p>
          </div>
        ) : (
          ranking.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${getRankBg(
                index + 1,
                user.isCurrentUser
              )}`}
            >
              <div className="flex-shrink-0 w-8 flex justify-center">
                {getRankIcon(index + 1)}
              </div>

              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium truncate text-sm">
                    {user.name}
                    {user.isCurrentUser && (
                      <span className="text-primary ml-1">(você)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Nv. {user.level}
                  </span>
                  {user.streak > 0 && (
                    <span className="flex items-center gap-1 text-orange-500">
                      <Flame className="w-3 h-3" />
                      {user.streak}
                    </span>
                  )}
                  {user.currentWeight && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      {user.currentWeight.toFixed(1)} kg
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right mr-2">
                <div className="font-bold text-sm">{user.totalXP.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>

              {!user.isCurrentUser && (
                <Button
                  size="sm"
                  variant={isFollowing(user.id) ? "secondary" : "default"}
                  className="h-8 px-2 min-w-[32px]"
                  onClick={(e) => handleFollow(user.id, e)}
                >
                  {isFollowing(user.id) ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </Button>
              )}
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RealRankingCard;
