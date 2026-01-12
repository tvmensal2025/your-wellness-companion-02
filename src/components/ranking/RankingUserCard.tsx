import { motion } from 'framer-motion';
import { Star, Flame, Target, Trophy, TrendingDown, Zap, Award, Clock, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RankingUserCardProps {
  position: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalPoints: number;
  streak: number;
  missionsCompleted: number;
  isCurrentUser: boolean;
  index: number;
  weightLoss?: number | null;
  challengesCompleted?: number;
  activeGoals?: number;
  lastActivity?: string | null;
  onProfileClick?: (userId: string) => void;
}

// Função para calcular nome do nível baseado em pontos
const getLevelInfo = (points: number): { name: string; icon: typeof Zap; color: string } => {
  if (points >= 5000) return { name: 'Lenda', icon: Award, color: 'text-yellow-500' };
  if (points >= 2500) return { name: 'Mestre', icon: Trophy, color: 'text-purple-500' };
  if (points >= 1000) return { name: 'Expert', icon: Star, color: 'text-blue-500' };
  if (points >= 500) return { name: 'Avançado', icon: Zap, color: 'text-green-500' };
  if (points >= 200) return { name: 'Intermediário', icon: Target, color: 'text-orange-500' };
  return { name: 'Iniciante', icon: CheckCircle2, color: 'text-muted-foreground' };
};

// Função para verificar se usuário está ativo recentemente
const isRecentlyActive = (lastActivity: string | null | undefined): boolean => {
  if (!lastActivity) return false;
  const lastDate = new Date(lastActivity);
  const now = new Date();
  const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
  return diffHours < 24; // Ativo nas últimas 24h
};

// Função para formatar última atividade
const formatLastActivity = (lastActivity: string | null | undefined): string => {
  if (!lastActivity) return 'Sem atividade';
  const lastDate = new Date(lastActivity);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Agora';
  if (diffHours < 24) return `${diffHours}h atrás`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias`;
  return `${Math.floor(diffDays / 7)} sem`;
};

// Cor da borda do avatar baseada no streak
const getStreakBorderColor = (streak: number): string => {
  if (streak >= 30) return 'ring-4 ring-yellow-400 shadow-yellow-400/30';
  if (streak >= 14) return 'ring-3 ring-purple-400 shadow-purple-400/20';
  if (streak >= 7) return 'ring-3 ring-orange-400 shadow-orange-400/20';
  if (streak >= 3) return 'ring-2 ring-green-400';
  return '';
};

export function RankingUserCard({
  position,
  userId,
  userName,
  avatarUrl,
  totalPoints,
  streak,
  missionsCompleted,
  isCurrentUser,
  index,
  weightLoss,
  challengesCompleted = 0,
  lastActivity,
  onProfileClick,
}: RankingUserCardProps) {
  const levelInfo = getLevelInfo(totalPoints);
  const LevelIcon = levelInfo.icon;
  const recentlyActive = isRecentlyActive(lastActivity);
  const streakBorder = getStreakBorderColor(streak);

  // Estilos baseados na posição - gradientes mais distintos
  const getPositionStyle = (pos: number) => {
    const styles: Record<number, { bg: string; border: string; badge: string; glow: string }> = {
      4: { bg: 'from-indigo-500/15 to-indigo-600/5', border: 'border-indigo-500/40', badge: 'bg-gradient-to-br from-indigo-500 to-indigo-600', glow: 'shadow-indigo-500/20' },
      5: { bg: 'from-purple-500/15 to-purple-600/5', border: 'border-purple-500/40', badge: 'bg-gradient-to-br from-purple-500 to-purple-600', glow: 'shadow-purple-500/20' },
      6: { bg: 'from-pink-500/15 to-pink-600/5', border: 'border-pink-500/40', badge: 'bg-gradient-to-br from-pink-500 to-pink-600', glow: 'shadow-pink-500/20' },
      7: { bg: 'from-rose-500/15 to-rose-600/5', border: 'border-rose-500/40', badge: 'bg-gradient-to-br from-rose-500 to-rose-600', glow: 'shadow-rose-500/20' },
      8: { bg: 'from-orange-500/15 to-orange-600/5', border: 'border-orange-500/40', badge: 'bg-gradient-to-br from-orange-500 to-orange-600', glow: 'shadow-orange-500/20' },
      9: { bg: 'from-teal-500/15 to-teal-600/5', border: 'border-teal-500/40', badge: 'bg-gradient-to-br from-teal-500 to-teal-600', glow: 'shadow-teal-500/20' },
      10: { bg: 'from-cyan-500/15 to-cyan-600/5', border: 'border-cyan-500/40', badge: 'bg-gradient-to-br from-cyan-500 to-cyan-600', glow: 'shadow-cyan-500/20' },
    };
    return styles[pos] || { bg: 'from-muted/30 to-muted/10', border: 'border-border', badge: 'bg-muted-foreground', glow: '' };
  };

  const style = getPositionStyle(position);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.08,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
      }}
      onClick={() => onProfileClick?.(userId)}
      className={cn(
        "relative overflow-hidden rounded-xl p-3 sm:p-4",
        `bg-gradient-to-r ${style.bg}`,
        `border ${style.border}`,
        style.glow && `shadow-lg ${style.glow}`,
        isCurrentUser && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        "transition-all duration-300 cursor-pointer"
      )}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 to-accent/5" />

      <div className="relative flex items-center gap-3">
        {/* Position Badge - Menor, sobreposto ao avatar */}
        <div className="relative flex-shrink-0">
          {/* Avatar maior com borda baseada no streak */}
          <Avatar className={cn(
            "w-14 h-14 sm:w-16 sm:h-16 border-2 transition-all duration-300",
            style.border,
            streakBorder,
            recentlyActive && !streakBorder && "ring-2 ring-green-500 ring-offset-1 ring-offset-background"
          )}>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-muted font-semibold text-muted-foreground text-xl">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Position badge pequeno no canto */}
          <div className={cn(
            "absolute -top-1 -left-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center",
            style.badge,
            "text-white font-bold text-xs sm:text-sm shadow-md border-2 border-background"
          )}>
            {position}
          </div>
          
          {/* Indicador online/ativo */}
          {recentlyActive && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-semibold text-sm sm:text-base truncate",
              isCurrentUser ? "text-primary" : "text-foreground"
            )}>
              {userName}
            </p>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-0">
                Você
              </Badge>
            )}
          </div>
          
          {/* Level + Activity Row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Nível com ícone */}
            <span className={cn("text-xs flex items-center gap-1 font-medium", levelInfo.color)}>
              <LevelIcon className="w-3 h-3" />
              {levelInfo.name}
            </span>
            
            {/* Última atividade */}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatLastActivity(lastActivity)}
            </span>
          </div>

          {/* Stats badges row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {/* Missões */}
            <span className="text-xs text-muted-foreground flex items-center gap-0.5 bg-muted/50 px-1.5 py-0.5 rounded">
              <Target className="w-3 h-3" />
              {missionsCompleted}
            </span>
            
            {/* Weight loss badge */}
            {weightLoss !== null && weightLoss !== undefined && weightLoss > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5 bg-green-500/10 px-1.5 py-0.5 rounded">
                <TrendingDown className="w-3 h-3" />
                -{weightLoss.toFixed(1)}kg
              </span>
            )}
            
            {/* Challenges completed */}
            {challengesCompleted > 0 && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                <Trophy className="w-3 h-3" />
                {challengesCompleted}
              </span>
            )}
          </div>
        </div>

        {/* Stats Column - Right side */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {/* Points - Destaque principal */}
          <div className="flex items-center gap-1.5 bg-background/90 rounded-lg px-2.5 py-1.5 shadow-sm border border-border/50">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-sm sm:text-base text-foreground">
              {totalPoints.toLocaleString()}
            </span>
          </div>

          {/* Streak Badge */}
          {streak > 0 && (
            <motion.div
              animate={streak >= 7 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs px-2 py-0.5",
                  streak >= 7 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-md" 
                    : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30"
                )}
              >
                <Flame className={cn("w-3 h-3 mr-1", streak >= 7 && "animate-pulse")} />
                {streak}d
              </Badge>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
