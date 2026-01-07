import { motion } from 'framer-motion';
import { Users, Target, Trophy, Flame } from 'lucide-react';

interface RankingStatsProps {
  totalMembers: number;
  totalMissions: number;
  totalPoints: number;
  avgStreak: number;
}

export function RankingStats({ totalMembers, totalMissions, totalPoints, avgStreak }: RankingStatsProps) {
  const stats = [
    { 
      icon: Users, 
      value: totalMembers, 
      label: 'Membros',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    { 
      icon: Target, 
      value: totalMissions, 
      label: 'Missões',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
    },
    { 
      icon: Trophy, 
      value: totalPoints.toLocaleString(), 
      label: 'Pontos',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    { 
      icon: Flame, 
      value: avgStreak, 
      label: 'Média Streak',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
          className={`${stat.bgColor} rounded-xl p-3 text-center border border-primary/10`}
        >
          <div className={`w-8 h-8 mx-auto rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
            <stat.icon className="w-4 h-4 text-white" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
