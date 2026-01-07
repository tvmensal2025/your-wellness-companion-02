import { motion } from 'framer-motion';
import { Users, UserPlus, Trophy, Scale, Target, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProgressStats } from '@/hooks/useUserProgressStats';

interface RankingSocialHeaderProps {
  userId: string | null;
  userName: string;
  avatarUrl?: string;
  rankingPosition: number;
}

export function RankingSocialHeader({
  userId,
  userName,
  avatarUrl,
  rankingPosition,
}: RankingSocialHeaderProps) {
  const { stats, loading } = useUserProgressStats(userId);

  const statItems = [
    {
      icon: Users,
      value: stats?.followersCount || 0,
      label: 'Seguidores',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: UserPlus,
      value: stats?.followingCount || 0,
      label: 'Seguindo',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Trophy,
      value: `#${rankingPosition}`,
      label: 'Posição',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  // weightChange is negative when losing weight, positive when gaining
  const weightChange = stats?.weightChange ?? null;
  const isLosingWeight = weightChange !== null && weightChange < 0;
  const challengesCompleted = stats?.challengesCompleted ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;

  const progressItems = [
    {
      icon: Scale,
      value: weightChange !== null ? `${weightChange < 0 ? '' : '+'}${weightChange.toFixed(1)}kg` : '--',
      label: 'Peso',
      color: isLosingWeight ? 'text-green-500' : 'text-muted-foreground',
    },
    {
      icon: Target,
      value: challengesCompleted,
      label: 'Desafios',
      color: 'text-purple-500',
    },
    {
      icon: Flame,
      value: currentStreak,
      label: 'Streak',
      color: 'text-orange-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full" />
        
        <div className="relative p-4 sm:p-6">
          {/* User Info */}
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-primary/30 shadow-lg">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">{userName}</h3>
              <p className="text-sm text-muted-foreground">Seu Perfil Social</p>
            </div>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {statItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`text-center p-3 rounded-xl ${item.bgColor} border border-transparent hover:border-primary/20 transition-all cursor-pointer`}
              >
                <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
                <span className="font-bold text-lg block">{item.value}</span>
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Progress Summary */}
          {stats && (weightChange !== null || stats.challengesCompleted > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4 p-3 rounded-xl bg-muted/50 border border-muted"
            >
              {progressItems.map((item, index) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className={`font-semibold text-sm ${item.color}`}>{item.value}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{item.label}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Motivational message */}
          {isLosingWeight && weightChange !== null && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-sm text-green-600 dark:text-green-400 mt-3 font-medium"
            >
              🎉 Você já perdeu {Math.abs(weightChange).toFixed(1)}kg! Continue assim! 💪
            </motion.p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
