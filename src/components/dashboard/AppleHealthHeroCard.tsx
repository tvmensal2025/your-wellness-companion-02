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
      "relative overflow-hidden rounded-2xl bg-card border border-border p-4 min-[400px]:p-6 sm:p-7 shadow-sm h-full flex flex-col",
      shouldAnimate && "animate-scale-in"
    )}>
      {/* Gradient overlay - sutil */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      
      <div className="relative flex-1 flex flex-col justify-between">
        {/* Header - saudação */}
        <div className="flex items-center flex-wrap gap-1.5 mb-2 min-[400px]:mb-4 flex-shrink-0">
          <span className="text-lg min-[400px]:text-xl sm:text-2xl">{greeting.emoji}</span>
          <span className="text-muted-foreground text-sm min-[400px]:text-base sm:text-lg">{greeting.text},</span>
          <span className="text-foreground font-semibold text-base min-[400px]:text-lg sm:text-xl truncate max-w-[120px] min-[400px]:max-w-[180px]">
            {userName.split(' ')[0]}
          </span>
          <span className="text-base min-[400px]:text-lg sm:text-xl">👋</span>
        </div>

        {/* Layout principal - Ring + Peso lado a lado */}
        <div className="flex items-center justify-center gap-6 min-[400px]:gap-10 sm:gap-12 flex-1">
          {/* Ring de pontuação */}
          <div className="relative flex-shrink-0">
            <svg className="w-[100px] h-[100px] min-[400px]:w-[150px] min-[400px]:h-[150px] sm:w-[180px] sm:h-[180px] -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" className="stroke-muted" strokeWidth="6" />
              <circle 
                cx="50" cy="50" r="38" 
                fill="none" 
                stroke="url(#healthGrad)" 
                strokeWidth="6" 
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
              <span className="text-3xl min-[400px]:text-5xl sm:text-6xl font-bold text-foreground tabular-nums leading-none">
                {animatedScore}
              </span>
              <span className="text-[10px] min-[400px]:text-sm sm:text-base text-muted-foreground uppercase tracking-wide mt-1">
                pontos
              </span>
            </div>
          </div>

          {/* Peso + Badge */}
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
            <p className="text-xs min-[400px]:text-lg sm:text-xl text-muted-foreground mb-1 min-[400px]:mb-2">Peso atual</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-5xl min-[400px]:text-7xl sm:text-8xl font-light text-foreground tabular-nums leading-none tracking-tight">
                {currentWeight === 0 ? '--' : currentWeight.toFixed(1)}
              </span>
              <span className="text-lg min-[400px]:text-3xl sm:text-4xl text-muted-foreground font-light">kg</span>
            </div>
            
            {/* Badge de tendência */}
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 min-[400px]:px-6 py-1.5 min-[400px]:py-2.5 rounded-full mt-3 min-[400px]:mt-5 border",
              trend.bg
            )}>
              <TrendIcon className={cn("h-4 w-4 min-[400px]:h-6 min-[400px]:w-6", trend.color)} />
              <span className={cn("text-sm min-[400px]:text-lg font-medium tabular-nums", trend.color)}>
                {weightChange !== 0 && (weightChange > 0 ? '+' : '')}{weightChange.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between gap-2 min-[400px]:gap-4 mt-auto pt-3 min-[400px]:pt-5 border-t border-border">
          <div className="flex items-center gap-1.5 min-[400px]:gap-3">
            <div className="w-7 h-7 min-[400px]:w-12 min-[400px]:h-12 sm:w-14 sm:h-14 rounded-lg min-[400px]:rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Flame className="h-3.5 w-3.5 min-[400px]:h-6 min-[400px]:w-6 text-orange-500" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm min-[400px]:text-xl sm:text-2xl font-semibold text-foreground tabular-nums">{currentStreak}</span>
              <span className="text-[10px] min-[400px]:text-sm sm:text-base text-muted-foreground">dias</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 min-[400px]:gap-3">
            <div className="w-7 h-7 min-[400px]:w-12 min-[400px]:h-12 sm:w-14 sm:h-14 rounded-lg min-[400px]:rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="h-3.5 w-3.5 min-[400px]:h-6 min-[400px]:w-6 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm min-[400px]:text-xl sm:text-2xl font-semibold text-foreground tabular-nums">
                {weightChange < 0 ? Math.abs(weightChange).toFixed(1) : '0'}
              </span>
              <span className="text-[10px] min-[400px]:text-sm sm:text-base text-muted-foreground">kg</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 min-[400px]:gap-3">
            <div className="w-7 h-7 min-[400px]:w-12 min-[400px]:h-12 sm:w-14 sm:h-14 rounded-lg min-[400px]:rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="h-3.5 w-3.5 min-[400px]:h-6 min-[400px]:w-6 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm min-[400px]:text-xl sm:text-2xl font-semibold text-foreground tabular-nums">
                {tmb > 0 ? tmb.toLocaleString('pt-BR') : '--'}
              </span>
              <span className="text-[10px] min-[400px]:text-sm sm:text-base text-muted-foreground">kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AppleHealthHeroCard.displayName = 'AppleHealthHeroCard';
