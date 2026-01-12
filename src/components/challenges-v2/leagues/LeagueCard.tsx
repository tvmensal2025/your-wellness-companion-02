// =====================================================
// LEAGUE CARD - CARD COMPLETO DO SISTEMA DE LIGAS
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserLeague, LeagueTier } from '@/types/challenges-v2';
import { LEAGUE_CONFIG } from '@/types/challenges-v2';
import { useLeagueRanking } from '@/hooks/challenges/useChallengesV2';

interface LeagueCardProps {
  userLeague: UserLeague;
  currentUserId: string;
  className?: string;
}

export const LeagueCard: React.FC<LeagueCardProps> = ({ 
  userLeague, 
  currentUserId,
  className 
}) => {
  const { data: ranking } = useLeagueRanking(userLeague.current_league);
  const config = LEAGUE_CONFIG[userLeague.current_league];
  
  // Calcular XP necessário para próxima liga
  const nextLeague = getNextLeague(userLeague.current_league);
  const nextConfig = nextLeague ? LEAGUE_CONFIG[nextLeague] : null;
  const xpToPromote = nextConfig ? nextConfig.minXpToPromote - userLeague.weekly_xp : 0;

  // Dias restantes na semana
  const daysRemaining = getDaysRemainingInWeek();

  return (
    <div className={cn(
      "rounded-2xl p-5 bg-muted/30 border border-border/50",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Liga Semanal
        </h3>
        <span className="text-xs text-muted-foreground">
          Termina em {daysRemaining} dias
        </span>
      </div>

      {/* League Tiers */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {(Object.keys(LEAGUE_CONFIG) as LeagueTier[]).slice(0, 4).map((tier) => {
          const tierConfig = LEAGUE_CONFIG[tier];
          const isCurrentTier = tier === userLeague.current_league;
          
          return (
            <motion.div
              key={tier}
              className={cn(
                "text-center p-2 rounded-xl transition-all",
                isCurrentTier 
                  ? "border-2 shadow-lg" 
                  : "opacity-50 border border-transparent",
              )}
              style={{
                borderColor: isCurrentTier ? tierConfig.color : undefined,
                backgroundColor: isCurrentTier ? `${tierConfig.color}20` : 'rgba(0,0,0,0.2)',
                boxShadow: isCurrentTier ? `0 0 20px ${tierConfig.color}30` : undefined,
              }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl">{tierConfig.emoji}</span>
              <p className={cn(
                "text-xs mt-1",
                isCurrentTier ? "font-bold" : ""
              )} style={{ color: isCurrentTier ? tierConfig.color : undefined }}>
                {tierConfig.name}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Ranking Preview */}
      <div className="space-y-2">
        {ranking?.slice(0, 2).map((user, index) => (
          <RankingRow
            key={user.user_id}
            rank={index + 1}
            name={user.profiles?.full_name || 'Usuário'}
            avatarUrl={user.profiles?.avatar_url}
            xp={user.weekly_xp}
            isTopRank={index === 0}
          />
        ))}

        {/* Current User */}
        <RankingRow
          rank={userLeague.rank_position || 0}
          name="Você"
          xp={userLeague.weekly_xp}
          isCurrentUser
          rankChange={5} // Mock - implementar real
        />
      </div>

      {/* Promotion Info */}
      {nextConfig && xpToPromote > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Para subir para {nextConfig.name}</p>
              <p className="text-sm font-medium">
                Faltam <span className="font-bold" style={{ color: nextConfig.color }}>
                  {xpToPromote.toLocaleString()} XP
                </span>
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              Ver Ranking
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Ranking Row Component
interface RankingRowProps {
  rank: number;
  name: string;
  avatarUrl?: string;
  xp: number;
  isCurrentUser?: boolean;
  isTopRank?: boolean;
  rankChange?: number;
}

const RankingRow: React.FC<RankingRowProps> = ({
  rank,
  name,
  avatarUrl,
  xp,
  isCurrentUser,
  isTopRank,
  rankChange,
}) => (
  <motion.div
    className={cn(
      "flex items-center gap-3 p-3 rounded-xl",
      isCurrentUser && "bg-green-500/10 border border-green-500/30",
      isTopRank && !isCurrentUser && "bg-yellow-500/10 border border-yellow-500/30",
      !isCurrentUser && !isTopRank && "bg-muted/30"
    )}
    whileHover={{ scale: 1.01 }}
  >
    <span className={cn(
      "text-lg font-bold w-6",
      isTopRank && "text-yellow-400",
      isCurrentUser && "text-green-400"
    )}>
      {rank}
    </span>
    
    <div className={cn(
      "w-10 h-10 rounded-full flex items-center justify-center",
      isCurrentUser 
        ? "bg-gradient-to-br from-green-500 to-emerald-500"
        : "bg-gradient-to-br from-purple-500 to-pink-500"
    )}>
      {avatarUrl ? (
        <Avatar className="w-9 h-9">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <span className="text-sm">{isCurrentUser ? "😎" : "👤"}</span>
      )}
    </div>
    
    <div className="flex-1">
      <p className="font-medium text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">Nível 18</p>
    </div>
    
    <div className="text-right">
      <p className={cn(
        "font-bold",
        isTopRank && "text-yellow-400",
        isCurrentUser && "text-green-400"
      )}>
        {xp.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground">XP</p>
    </div>
    
    {rankChange && rankChange > 0 && (
      <div className="text-xs text-green-400 flex items-center gap-0.5">
        <TrendingUp className="w-3 h-3" />
        {rankChange}
      </div>
    )}
  </motion.div>
);

// Helpers
function getNextLeague(current: LeagueTier): LeagueTier | null {
  const order: LeagueTier[] = ['bronze', 'silver', 'gold', 'diamond', 'master'];
  const currentIndex = order.indexOf(current);
  return currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
}

function getDaysRemainingInWeek(): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
}

export default LeagueCard;
