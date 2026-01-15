import { motion } from 'framer-motion';
import { Trophy, Scale, Target, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProgressStats } from '@/hooks/useUserProgressStats';

interface RankingSocialHeaderProps {
  userId: string | null;
  userName: string;
  avatarUrl?: string;
  rankingPosition: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export function RankingSocialHeader({
  userId,
  userName,
  avatarUrl,
  rankingPosition,
}: RankingSocialHeaderProps) {
  const { stats, loading } = useUserProgressStats(userId);

  // weightChange is negative when losing weight, positive when gaining
  const weightChange = stats?.weightChange ?? null;
  const isLosingWeight = weightChange !== null && weightChange < 0;
  const challengesCompleted = stats?.challengesCompleted ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;

  const progressItems = [
    {
      icon: Scale,
      value: weightChange !== null ? `${weightChange < 0 ? '' : '+'}${weightChange.toFixed(1)}kg` : '--',
      color: isLosingWeight ? 'text-green-500' : 'text-muted-foreground',
    },
    {
      icon: Target,
      value: challengesCompleted,
      color: 'text-purple-500',
    },
    {
      icon: Flame,
      value: currentStreak,
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
        
        <div className="relative p-4">
          {/* User Info + Position */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary/30 shadow-lg">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-lg font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-base">{userName}</h3>
                <p className="text-xs text-muted-foreground">Seu Perfil</p>
              </div>
            </div>
            
            {/* Position Badge */}
            <div className="text-center px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <Trophy className="w-5 h-5 mx-auto mb-0.5 text-yellow-500" />
              <span className="font-bold text-lg text-yellow-600">#{rankingPosition}</span>
              <span className="text-[10px] text-muted-foreground block">Posição</span>
            </div>
          </div>

          {/* Progress Summary */}
          {stats && (weightChange !== null || stats.challengesCompleted > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-6 mt-3 p-2 rounded-xl bg-muted/50"
            >
              {progressItems.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className={`font-semibold text-sm ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Motivational message */}
          {isLosingWeight && weightChange !== null && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-xs text-green-600 dark:text-green-400 mt-2 font-medium"
            >
              🎉 Você já perdeu {Math.abs(weightChange).toFixed(1)}kg! Continue assim! 💪
            </motion.p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
