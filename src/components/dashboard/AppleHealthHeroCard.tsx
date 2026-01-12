import React, { memo, useMemo, useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Minus, Flame, Zap } from 'lucide-react';
import { useSafeAnimation } from '@/hooks/useSafeAnimation';
import { cn } from '@/lib/utils';

interface AppleHealthHeroCardProps {
  currentWeight: number;
  targetWeight?: number;
  weightChange?: number;
  healthScore: number;
  currentStreak: number;
  userName?: string;
  height?: number;
  age?: number;
  gender?: string;
}

export const AppleHealthHeroCard: React.FC<AppleHealthHeroCardProps> = memo(({
  currentWeight,
  targetWeight,
  weightChange = 0,
  healthScore,
  currentStreak,
  userName = 'Usuário',
  height = 170,
  age = 30,
  gender = 'F'
}) => {
  const { shouldAnimate } = useSafeAnimation();
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) {
      setAnimatedScore(healthScore);
      return;
    }
    
    const duration = 800;
    const steps = 20;
    const increment = healthScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= healthScore) {
        setAnimatedScore(healthScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [healthScore, shouldAnimate]);

  // TMB (Taxa Metabólica Basal)
  const tmb = useMemo(() => {
    if (!currentWeight || currentWeight === 0) return 0;
    const isMale = gender?.toLowerCase() === 'm' || gender?.toLowerCase() === 'masculino';
    return Math.round(isMale 
      ? 10 * currentWeight + 6.25 * height - 5 * age + 5
      : 10 * currentWeight + 6.25 * height - 5 * age - 161
    );
  }, [currentWeight, height, age, gender]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Bom dia', emoji: '☀️' };
    if (hour < 18) return { text: 'Boa tarde', emoji: '🌤️' };
    return { text: 'Boa noite', emoji: '✨' };
  }, []);

  const trend = useMemo(() => {
    if (weightChange < -0.1) return {
      icon: TrendingDown,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/20 border-emerald-500/30'
    };
    if (weightChange > 0.1) return {
      icon: TrendingUp,
      color: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-500/20 border-rose-500/30'
    };
    return {
      icon: Minus,
      color: 'text-muted-foreground',
      bg: 'bg-muted/50 border-border'
    };
  }, [weightChange]);

  const TrendIcon = trend.icon;

  // Ring progress
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (Math.min(100, healthScore) / 100) * circumference;
  
  const ringColor = useMemo(() => {
    if (healthScore >= 80) return { start: '#34D399', end: '#818CF8' };
    if (healthScore >= 60) return { start: '#FBBF24', end: '#EF4444' };
    return { start: '#94A3B8', end: '#475569' };
  }, [healthScore]);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 shadow-sm",
      shouldAnimate && "animate-scale-in"
    )}>
      {/* Gradient overlay - sutil */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      
      <div className="relative">
        {/* Header - saudação */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">{greeting.emoji}</span>
            <span className="text-muted-foreground text-sm sm:text-base">{greeting.text},</span>
            <span className="text-foreground font-semibold text-base sm:text-lg truncate max-w-[120px]">
              {userName.split(' ')[0]}
            </span>
            <span className="text-base sm:text-lg">👋</span>
          </div>
        </div>

        {/* Layout principal - Ring + Peso lado a lado */}
        <div className="flex items-center gap-5 sm:gap-6">
          {/* Ring de pontuação - MAIOR */}
          <div className="relative flex-shrink-0">
            <svg className="w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" className="stroke-muted" strokeWidth="7" />
              <circle 
                cx="50" cy="50" r="38" 
                fill="none" 
                stroke="url(#healthGrad)" 
                strokeWidth="7" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={ringColor.start} />
                  <stop offset="100%" stopColor={ringColor.end} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums leading-none">
                {animatedScore}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
                pontos
              </span>
            </div>
          </div>

          {/* Peso + Badge - centralizado - MAIOR */}
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Peso atual</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl sm:text-6xl font-light text-foreground tabular-nums leading-none tracking-tight">
                {currentWeight === 0 ? '--' : currentWeight.toFixed(1)}
              </span>
              <span className="text-lg sm:text-xl text-muted-foreground font-light">kg</span>
            </div>
            
            {/* Badge de tendência */}
            <div className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full mt-2 border",
              trend.bg
            )}>
              <TrendIcon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", trend.color)} />
              <span className={cn("text-xs sm:text-sm font-medium tabular-nums", trend.color)}>
                {weightChange !== 0 && (weightChange > 0 ? '+' : '')}{weightChange.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Stats row - com labels descritivos - MAIOR */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-semibold text-foreground tabular-nums">{currentStreak}</span>
              <span className="text-xs sm:text-sm text-muted-foreground">dias</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-semibold text-foreground tabular-nums">
                {weightChange < 0 ? Math.abs(weightChange).toFixed(1) : '0'}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">kg perdido</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-semibold text-foreground tabular-nums">
                {tmb > 0 ? tmb.toLocaleString('pt-BR') : '--'}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AppleHealthHeroCard.displayName = 'AppleHealthHeroCard';
