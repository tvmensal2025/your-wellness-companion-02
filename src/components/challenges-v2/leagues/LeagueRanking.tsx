// =====================================================
// LEAGUE RANKING - RANKING COMPLETO DA LIGA
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLeagueRanking } from '@/hooks/challenges/useChallengesV2';
import type { LeagueTier } from '@/types/challenges-v2';
import { LEAGUE_CONFIG } from '@/types/challenges-v2';

interface LeagueRankingProps {
  league: LeagueTier | string;
  currentUserId?: string;
  className?: string;
}

export const LeagueRanking: React.FC<LeagueRankingProps> = ({
  league,
  currentUserId,
  className,
}) => {
  const { data: ranking, isLoading } = useLeagueRanking(league as LeagueTier);
  const config = LEAGUE_CONFIG[league as LeagueTier] || LEAGUE_CONFIG.bronze;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Mock data se não houver ranking real
  const displayRanking = ranking?.length ? ranking : [
    { user_id: '1', weekly_xp: 450, profiles: { full_name: 'Maria Silva', avatar_url: null } },
    { user_id: '2', weekly_xp: 380, profiles: { full_name: 'João Pedro', avatar_url: null } },
    { user_id: '3', weekly_xp: 320, profiles: { full_name: 'Ana Costa', avatar_url: null } },
    { user_id: currentUserId || '4', weekly_xp: 280, profiles: { full_name: 'Você', avatar_url: null } },
    { user_id: '5', weekly_xp: 210, profiles: { full_name: 'Carlos Santos', avatar_url: null } },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{config.emoji}</span>
        <h3 className="font-bold">Liga {config.name}</h3>
        <span className="text-sm text-muted-foreground">
          ({displayRanking?.length || 0} participantes)
        </span>
      </div>

      {/* Ranking List */}
      {displayRanking?.map((user: any, index: number) => {
        const isCurrentUser = user.user_id === currentUserId;
        const isTop3 = index < 3;
        
        return (
          <motion.div
            key={user.user_id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all",
              isCurrentUser && "bg-primary/10 border border-primary/30",
              isTop3 && !isCurrentUser && "bg-yellow-500/5",
              !isTop3 && !isCurrentUser && "bg-muted/30"
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            {/* Rank */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
              index === 0 && "bg-yellow-500 text-yellow-950",
              index === 1 && "bg-gray-300 text-gray-700",
              index === 2 && "bg-amber-600 text-amber-100",
              index > 2 && "bg-muted text-muted-foreground"
            )}>
              {index + 1}
            </div>

            {/* Avatar */}
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.profiles?.avatar_url} />
              <AvatarFallback>
                {user.profiles?.full_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium text-sm truncate",
                isCurrentUser && "text-primary"
              )}>
                {isCurrentUser ? 'Você' : user.profiles?.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground">
                Nível {Math.floor(user.weekly_xp / 100) + 1}
              </p>
            </div>

            {/* XP */}
            <div className="text-right">
              <p className={cn(
                "font-bold",
                isTop3 && "text-yellow-500",
                isCurrentUser && !isTop3 && "text-primary"
              )}>
                {user.weekly_xp.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>

            {/* Trend (mock) */}
            <div className="w-6">
              {index < 5 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : index > displayRanking.length - 5 ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LeagueRanking;
