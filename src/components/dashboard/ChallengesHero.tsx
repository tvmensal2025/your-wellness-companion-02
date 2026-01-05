import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Zap } from 'lucide-react';

interface ChallengesHeroProps {
  totalChallenges: number;
  activeChallenges: number;
  totalPoints: number;
  streak: number;
}

export const ChallengesHero: React.FC<ChallengesHeroProps> = ({
  totalChallenges,
  activeChallenges,
  totalPoints,
  streak
}) => {
  const stats = [
    { icon: Target, value: activeChallenges, label: 'Ativos', color: 'from-emerald-500 to-teal-500' },
    { icon: Trophy, value: totalPoints, label: 'Pontos', color: 'from-amber-500 to-orange-500' },
    { icon: Flame, value: streak, label: 'Dias', color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border/50 p-6 mb-6"
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25"
          >
            <Zap className="w-6 h-6 text-primary-foreground" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Seus Desafios</h2>
            <p className="text-sm text-muted-foreground">
              {totalChallenges > 0 
                ? `${totalChallenges} desafios disponíveis para você` 
                : 'Comece seu primeiro desafio hoje!'
              }
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="relative group"
            >
              <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3 border border-border/50 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-sm`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <motion.p 
                  className="text-2xl font-bold text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Motivational message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border-l-2 border-primary"
        >
          <p className="text-sm text-muted-foreground">
            {streak > 0 
              ? `🔥 Incrível! Você está em uma sequência de ${streak} dias!`
              : '💪 Complete desafios diários para manter sua sequência!'
            }
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
