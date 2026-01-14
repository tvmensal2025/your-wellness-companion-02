/**
 * CardioPointsCard Component
 * Exibe pontos cardio diários com progress ring e gamificação
 * 
 * Validates: Requirements 3.5, 3.6, 3.8
 */

import React, { memo, useState, useEffect } from 'react';
import { Zap, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCardioPoints } from '@/hooks/cardio/useCardioPoints';

interface CardioPointsCardProps {
  className?: string;
  dailyGoal?: number;
  compact?: boolean;
}

export const CardioPointsCard: React.FC<CardioPointsCardProps> = memo(({
  className,
  dailyGoal = 150,
  compact = false,
}) => {
  const {
    todayPoints,
    progressPercent,
    comparison,
    comparisonText,
    progressColor,
    isLoading,
    goalReached,
    zoneBreakdown,
  } = useCardioPoints({ dailyGoal });

  const [showCelebration, setShowCelebration] = useState(false);

  // Animação de celebração quando atinge a meta
  useEffect(() => {
    if (goalReached) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [goalReached]);

  // Ícone de comparação
  const ComparisonIcon = {
    up: TrendingUp,
    down: TrendingDown,
    same: Minus,
  }[comparison.trend];

  // Progress ring
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Skeleton loader
  if (isLoading) {
    return (
      <div className={cn(
        "bg-muted/30 animate-pulse",
        compact ? "rounded-xl p-3" : "rounded-2xl p-4",
        className
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className={cn("bg-muted rounded", compact ? "h-4 w-20" : "h-5 w-28")} />
          <div className={cn("bg-muted rounded", compact ? "h-3 w-12" : "h-4 w-16")} />
        </div>
        <div className={cn("bg-muted rounded-full mx-auto", compact ? "w-14 h-14" : "w-20 h-20")} />
      </div>
    );
  }

  // Versão compacta - layout horizontal, expande verticalmente
  if (compact) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl p-3 border border-amber-500/30 flex flex-col justify-center",
        className
      )}>
        <div className="flex items-center gap-3 w-full">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="38" 
                fill="none" 
                className="stroke-muted/30" 
                strokeWidth="12" 
              />
              <circle 
                cx="50" cy="50" r="38" 
                fill="none" 
                stroke="url(#pointsGradientCompact)" 
                strokeWidth="12" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="pointsGradientCompact" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-500">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="text-xs font-medium flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Pontos Cardio
              </h4>
              <span className={cn(
                "text-[10px]",
                comparison.trend === 'up' && "text-emerald-500",
                comparison.trend === 'down' && "text-red-500",
                comparison.trend === 'same' && "text-muted-foreground"
              )}>
                {comparisonText}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-500 tabular-nums">
                {todayPoints}
              </span>
              <span className="text-xs text-muted-foreground">/ {dailyGoal} pts</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl p-4 border border-amber-500/30 relative overflow-hidden",
      className
    )}>
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-500/20 backdrop-blur-sm z-10 animate-fade-in">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-2 animate-bounce" />
            <p className="text-lg font-bold text-amber-500">Meta Atingida! 🎉</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Pontos Cardio
        </h4>
        <div className={cn(
          "flex items-center gap-1 text-xs",
          comparison.trend === 'up' && "text-emerald-500",
          comparison.trend === 'down' && "text-red-500",
          comparison.trend === 'same' && "text-muted-foreground"
        )}>
          <ComparisonIcon className="w-3 h-3" />
          {comparisonText}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <div className="relative flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle 
              cx="50" cy="50" r="38" 
              fill="none" 
              className="stroke-muted/30" 
              strokeWidth="8" 
            />
            {/* Progress circle */}
            <circle 
              cx="50" cy="50" r="38" 
              fill="none" 
              stroke="url(#pointsGradient)" 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="pointsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-amber-500 tabular-nums">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Points Display */}
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-3xl font-bold tabular-nums", progressColor)}>
              {todayPoints}
            </span>
            <span className="text-sm text-muted-foreground">/ {dailyGoal}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            pontos hoje
          </p>
          
          {/* Zone breakdown mini */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-[10px] text-muted-foreground">{zoneBreakdown.fatBurn}m</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-[10px] text-muted-foreground">{zoneBreakdown.cardio}m</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] text-muted-foreground">{zoneBreakdown.peak}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Points explanation */}
      <div className="mt-3 pt-3 border-t border-amber-500/20">
        <p className="text-[10px] text-muted-foreground">
          🔥 Queima: 1pt/min • 💪 Cardio: 2pts/min • ⚡ Pico: 3pts/min
        </p>
      </div>
    </div>
  );
});

CardioPointsCard.displayName = 'CardioPointsCard';

export default CardioPointsCard;
