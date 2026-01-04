import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award } from 'lucide-react';
import { useRealRanking } from '@/hooks/useRealRanking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const LiveRankingCard: React.FC = () => {
  const { data, isLoading } = useRealRanking();
  
  const ranking = data?.ranking?.map((user, index) => ({
    id: user.id,
    position: index + 1,
    name: user.name,
    avatar: user.avatar,
    xp: user.totalXP,
    level: user.level,
    streak: user.streak,
    isMe: user.isCurrentUser,
    change: 0 // TODO: calcular mudança de posição
  })) || [];
  
  const myPosition = data?.currentUserRank ? {
    position: data.currentUserRank,
    name: ranking.find(u => u.isMe)?.name || 'Você',
    avatar: ranking.find(u => u.isMe)?.avatar,
    xp: ranking.find(u => u.isMe)?.xp || 0,
    xpToNext: ranking[data.currentUserRank - 2]?.xp - (ranking.find(u => u.isMe)?.xp || 0) || 0
  } : null;
  
  const loading = isLoading;

  if (loading) {
    return (
      <div className="rounded-2xl bg-card/80 backdrop-blur-md border border-border/40 p-4 animate-pulse">
        <div className="h-6 bg-muted/30 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted/20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
  };

  const getPositionChange = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card/80 backdrop-blur-md border border-border/40 p-4 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
            <Trophy className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Ranking Semanal</h3>
            <p className="text-xs text-muted-foreground">Top 5 da comunidade</p>
          </div>
        </div>
        
        {myPosition && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Você:</span>
            <span className="text-sm font-bold text-primary">#{myPosition.position}</span>
          </div>
        )}
      </div>

      {/* Ranking List */}
      <div className="space-y-2">
        {ranking.slice(0, 5).map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 rounded-xl p-2.5 transition-all ${
              user.isMe 
                ? 'bg-primary/10 border border-primary/20' 
                : 'bg-muted/20 hover:bg-muted/30'
            }`}
          >
            {/* Position */}
            <div className="flex h-8 w-8 items-center justify-center">
              {getPositionIcon(user.position)}
            </div>

            {/* Avatar */}
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white text-sm">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium truncate ${user.isMe ? 'text-primary' : 'text-foreground'}`}>
                  {user.isMe ? 'Você' : user.name}
                </span>
                {user.isMe && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                    EU
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Nível {user.level}</span>
                <span>•</span>
                <span>{user.streak} 🔥</span>
              </div>
            </div>

            {/* XP & Change */}
            <div className="text-right">
              <span className="font-bold text-foreground">{user.xp.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ml-1">XP</span>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                {getPositionChange(user.change)}
                {user.change !== 0 && (
                  <span className={`text-xs ${user.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {Math.abs(user.change)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* My Position if not in top 5 */}
      {myPosition && myPosition.position > 5 && (
        <>
          <div className="my-3 flex items-center gap-2">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">...</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-xl p-2.5 bg-primary/10 border border-primary/20"
          >
            <div className="flex h-8 w-8 items-center justify-center">
              <span className="text-sm font-bold text-primary">#{myPosition.position}</span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/30">
              <AvatarImage src={myPosition.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white text-sm">
                {myPosition.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <span className="font-medium text-primary">Você</span>
              <p className="text-xs text-muted-foreground">
                {myPosition.xpToNext} XP para subir
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold text-foreground">{myPosition.xp.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ml-1">XP</span>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
