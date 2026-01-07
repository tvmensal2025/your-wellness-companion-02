import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, TrendingDown, TrendingUp, Users, Trophy, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCommunityHealthStats } from '@/hooks/useCommunityHealthStats';
import { Skeleton } from '@/components/ui/skeleton';

export const CommunityHealthSummary: React.FC = () => {
  const { stats, topLoser, loading } = useCommunityHealthStats();

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
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: TrendingDown,
      value: stats.usersLosing.toString(),
      label: 'Emagrecendo',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: TrendingUp,
      value: stats.usersGaining.toString(),
      label: 'Ganhando',
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Percent,
      value: `${Math.abs(stats.avgBodyFatChange).toFixed(1)}%`,
      label: 'Média Gordura',
      color: stats.avgBodyFatChange <= 0 ? 'text-green-600' : 'text-orange-600',
      bgColor: stats.avgBodyFatChange <= 0 ? 'bg-green-500/10' : 'bg-orange-500/10',
    },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">Resultados da Comunidade</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${item.bgColor} rounded-xl p-3 text-center`}
            >
              <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {topLoser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  🏆 <span className="text-yellow-600">{topLoser.name}</span> perdeu{' '}
                  <span className="text-green-600 font-bold">{Math.abs(topLoser.weightLost).toFixed(1)}kg</span> este mês!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
