import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Target, Heart, Activity, Zap, Crown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AvatarHeroCardProps {
  gender: 'male' | 'female';
  currentWeight: number;
  targetWeight?: number;
  weightChange?: number;
  healthScore: number;
  level: number;
  levelTitle: string;
  currentStreak: number;
}

export const AvatarHeroCard: React.FC<AvatarHeroCardProps> = ({
  gender,
  currentWeight,
  targetWeight,
  weightChange = 0,
  healthScore,
  level,
  levelTitle,
  currentStreak
}) => {
  // Calculate progress to goal
  const startWeight = targetWeight ? currentWeight + 10 : currentWeight; // Assume 10kg goal if not set
  const progressToGoal = targetWeight 
    ? Math.min(100, Math.max(0, ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100))
    : 0;

  const weightToGo = targetWeight ? (currentWeight - targetWeight).toFixed(1) : '--';

  // Avatar colors based on gender
  const avatarConfig = {
    male: {
      gradient: 'from-blue-500 via-indigo-500 to-violet-600',
      glow: 'shadow-blue-500/30',
      ring: 'ring-blue-400/30',
      emoji: '🧔'
    },
    female: {
      gradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
      glow: 'shadow-pink-500/30',
      ring: 'ring-pink-400/30',
      emoji: '👩'
    }
  };

  const config = avatarConfig[gender];

  // Get health status color
  const getHealthColor = () => {
    if (healthScore >= 80) return 'text-emerald-500';
    if (healthScore >= 60) return 'text-green-500';
    if (healthScore >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getTrendIcon = () => {
    if (weightChange < -0.1) return <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />;
    if (weightChange > 0.1) return <TrendingUp className="h-3.5 w-3.5 text-red-500" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (weightChange < -0.1) return 'text-emerald-500 bg-emerald-500/10';
    if (weightChange > 0.1) return 'text-red-500 bg-red-500/10';
    return 'text-muted-foreground bg-muted/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card via-card to-muted/20 border border-border/40 shadow-xl"
    >
      {/* Background decoration */}
      <div className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${config.gradient} opacity-10 blur-3xl`} />
      <div className={`absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br ${config.gradient} opacity-5 blur-3xl`} />

      {/* Main content */}
      <div className="relative p-4 sm:p-5">
        <div className="flex items-center gap-4">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            {/* Avatar ring animation */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`absolute -inset-1 rounded-full bg-gradient-to-r ${config.gradient} opacity-20`}
            />
            
            {/* Main avatar */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${config.gradient} ${config.glow} shadow-lg ring-4 ${config.ring}`}
            >
              <span className="text-4xl sm:text-5xl">{config.emoji}</span>
              
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-card shadow-lg">
                <span className="text-[10px] sm:text-xs font-bold text-white">{level}</span>
              </div>
            </motion.div>

            {/* Streak indicator */}
            {currentStreak > 0 && (
              <div className="absolute -top-1 -left-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                <Zap className="h-2.5 w-2.5" />
                <span className="text-[9px] font-bold">{currentStreak}</span>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Level title */}
            <div className="flex items-center gap-2">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-muted-foreground">{levelTitle}</span>
            </div>

            {/* Current weight - main metric */}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-foreground">{currentWeight.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground font-medium">kg</span>
              
              {/* Trend badge */}
              <div className={`ml-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-[10px] font-semibold">
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Health score mini indicator */}
            <div className="flex items-center gap-2">
              <Activity className={`h-3.5 w-3.5 ${getHealthColor()}`} />
              <span className={`text-xs font-semibold ${getHealthColor()}`}>
                Score: {healthScore}
              </span>
              <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${healthScore}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full rounded-full bg-gradient-to-r ${
                    healthScore >= 60 ? 'from-emerald-500 to-green-500' : 
                    healthScore >= 40 ? 'from-amber-500 to-yellow-500' : 'from-red-500 to-orange-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Goal progress section */}
        {targetWeight && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Progresso para Meta</span>
              </div>
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{targetWeight}kg</span> meta
              </span>
            </div>
            
            <Progress value={progressToGoal} className="h-2" />
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-muted-foreground">
                {progressToGoal.toFixed(0)}% concluído
              </span>
              <span className="text-[10px] font-medium text-primary">
                Faltam {weightToGo}kg
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="relative px-4 py-3 bg-muted/30 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <StatusPill icon={Heart} label="Cardio" status="good" />
            <StatusPill icon={Activity} label="Ativo" status="warning" />
          </div>
          <div className="text-[10px] text-muted-foreground">
            Última pesagem: <span className="font-medium text-foreground">Hoje</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Mini status pill
const StatusPill: React.FC<{
  icon: React.ElementType;
  label: string;
  status: 'good' | 'warning' | 'alert';
}> = ({ icon: Icon, label, status }) => {
  const colors = {
    good: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    alert: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${colors[status]}`}>
      <Icon className="h-2.5 w-2.5" />
      <span className="text-[9px] font-medium">{label}</span>
    </div>
  );
};
