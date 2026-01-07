import { motion } from 'framer-motion';
import { Trophy, Target, Flame, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChallengesCompletedCardProps {
  challengesCompleted: number;
  activeChallenges: number;
  activeGoals: number;
  completedGoals: number;
  currentStreak: number;
  bestStreak: number;
}

export function ChallengesCompletedCard({
  challengesCompleted,
  activeChallenges,
  activeGoals,
  completedGoals,
  currentStreak,
  bestStreak,
}: ChallengesCompletedCardProps) {
  const stats = [
    {
      icon: Trophy,
      value: challengesCompleted,
      label: 'Desafios Concluídos',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Target,
      value: activeChallenges,
      label: 'Desafios Ativos',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Star,
      value: completedGoals,
      label: 'Metas Alcançadas',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Flame,
      value: currentStreak,
      label: 'Streak Atual',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  // Generate achievement badges based on stats
  const badges = [];
  if (challengesCompleted >= 10) badges.push({ icon: '🏆', label: 'Veterano' });
  if (challengesCompleted >= 5) badges.push({ icon: '💪', label: 'Dedicado' });
  if (currentStreak >= 30) badges.push({ icon: '🔥', label: '30 Dias' });
  if (currentStreak >= 7) badges.push({ icon: '⚡', label: 'Semana Perfeita' });
  if (bestStreak >= 14) badges.push({ icon: '📆', label: 'Consistente' });
  if (completedGoals >= 3) badges.push({ icon: '🎯', label: 'Focado' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="border-primary/20 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-yellow-500/5 to-transparent">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Conquistas & Desafios
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-xl ${stat.bgColor} text-center`}
              >
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <span className="font-bold text-xl block">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground leading-tight block">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Best Streak */}
          {bestStreak > 0 && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-muted-foreground">Melhor streak:</span>
              <span className="font-bold text-orange-500">{bestStreak} dias</span>
            </div>
          )}

          {/* Achievement Badges */}
          {badges.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Conquistas Desbloqueadas</span>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Badge variant="secondary" className="gap-1">
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Active Goals */}
          {activeGoals > 0 && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{activeGoals} meta(s) em progresso</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
