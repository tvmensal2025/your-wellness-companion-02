import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Scale, TrendingDown, TrendingUp, Users, Trophy, Percent, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCommunityHealthStats } from '@/hooks/useCommunityHealthStats';
import { Skeleton } from '@/components/ui/skeleton';

export const CommunityHealthSummary: React.FC = () => {
  const { stats, topLoser, loading } = useCommunityHealthStats();

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      icon: Scale,
      value: `${Math.abs(stats.totalWeightLost).toFixed(1)}kg`,
      label: 'Total Perdido',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
      iconBg: 'bg-green-500/20',
    },
    {
      icon: TrendingDown,
      value: stats.usersLosing.toString(),
      label: 'Emagrecendo',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      iconBg: 'bg-emerald-500/20',
    },
    {
      icon: TrendingUp,
      value: stats.usersGaining.toString(),
      label: 'Ganhando',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10',
      iconBg: 'bg-orange-500/20',
    },
    {
      icon: Percent,
      value: `${Math.abs(stats.avgBodyFatChange).toFixed(1)}%`,
      label: 'Média Gordura',
      color: stats.avgBodyFatChange <= 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400',
      bgColor: stats.avgBodyFatChange <= 0 ? 'bg-green-500/10' : 'bg-orange-500/10',
      iconBg: stats.avgBodyFatChange <= 0 ? 'bg-green-500/20' : 'bg-orange-500/20',
    },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden relative">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardContent className="p-4 relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm">Resultados da Comunidade</h3>
          <Flame className="w-4 h-4 text-orange-500 ml-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${item.bgColor} rounded-xl p-3 text-center backdrop-blur-sm border border-white/5`}
            >
              <div className={`w-8 h-8 mx-auto mb-1.5 rounded-full ${item.iconBg} flex items-center justify-center`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {topLoser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 p-4 bg-gradient-to-r from-yellow-500/15 via-orange-500/10 to-yellow-500/15 rounded-xl border border-yellow-500/30 backdrop-blur-sm relative overflow-hidden"
          >
            {/* Decorative shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
            
            <div className="flex items-center gap-3 relative">
              {/* Trophy icon */}
              <div className="p-2 rounded-full bg-yellow-500/20 shrink-0">
                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              
              {/* Avatar */}
              <Avatar className="w-12 h-12 ring-2 ring-yellow-500/40 shadow-lg shrink-0">
                {topLoser.avatarUrl ? (
                  <AvatarImage src={topLoser.avatarUrl} alt={topLoser.name} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-yellow-500/30 to-orange-500/30 text-yellow-700 dark:text-yellow-300 font-semibold">
                  {getInitials(topLoser.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-yellow-700/80 dark:text-yellow-400/80 font-medium mb-0.5">
                  🏆 Destaque do mês
                </p>
                <p className="font-semibold text-foreground truncate">
                  {topLoser.name}
                </p>
                <p className="text-sm">
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    -{Math.abs(topLoser.weightLost).toFixed(1)}kg
                  </span>
                  <span className="text-muted-foreground ml-1">perdidos! 🔥</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
