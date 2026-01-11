import React, { memo, useMemo, useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Minus, Target, Flame, Zap, Sparkles } from 'lucide-react';
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

// Memoized StatItem - tamanho equilibrado
const StatItem = memo<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  suffix: string;
  color: string;
  bgColor: string;
  delay?: number;
}>(({ icon: Icon, label, value, suffix, color, bgColor, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={cn(
        "text-center py-1.5 sm:py-2 transition-all duration-500 transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      {/* Ícone */}
      <div className={cn(
        "flex items-center justify-center mx-auto mb-1 w-10 h-10 sm:w-11 sm:h-11 rounded-xl",
        bgColor
      )}>
        <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", color)} />
      </div>
      <div className="flex items-baseline justify-center gap-0.5">
        <span className="text-lg sm:text-xl font-bold text-white tabular-nums">{value}</span>
        <span className="text-xs sm:text-sm text-slate-400 font-medium">{suffix}</span>
      </div>
      <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{label}</p>
    </div>
  );
});

StatItem.displayName = 'StatItem';

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
  const [showPulse, setShowPulse] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animação de contagem do score
  useEffect(() => {
    if (!shouldAnimate) {
      setAnimatedScore(healthScore);
      return;
    }
    
    const duration = 1000;
    const steps = 30;
    const increment = healthScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= healthScore) {
        setAnimatedScore(healthScore);
        clearInterval(timer);
        // Pulso quando atinge meta alta
        if (healthScore >= 70) {
          setShowPulse(true);
          setTimeout(() => setShowPulse(false), 1000);
        }
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [healthScore, shouldAnimate]);

  const weightToGo = useMemo(() => 
    targetWeight ? Math.abs(currentWeight - targetWeight).toFixed(1) : null,
    [currentWeight, targetWeight]
  );

  // Calcular TMB (Taxa Metabólica Basal) - Mifflin-St Jeor
  const tmb = useMemo(() => {
    if (!currentWeight || currentWeight === 0) return 0;
    const isMale = gender?.toLowerCase() === 'm' || gender?.toLowerCase() === 'masculino';
    if (isMale) {
      return Math.round(10 * currentWeight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * currentWeight + 6.25 * height - 5 * age - 161);
    }
  }, [currentWeight, height, age, gender]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const greetingEmoji = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 18) return '🌤️';
    return '✨';
  }, []);

  const trend = useMemo(() => {
    if (weightChange < -0.1) return {
      icon: TrendingDown,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20 border border-emerald-500/30',
      text: 'Perdendo peso',
      glow: 'shadow-emerald-500/20'
    };
    if (weightChange > 0.1) return {
      icon: TrendingUp,
      color: 'text-rose-400',
      bg: 'bg-rose-500/20 border border-rose-500/30',
      text: 'Ganhando peso',
      glow: 'shadow-rose-500/20'
    };
    return {
      icon: Minus,
      color: 'text-slate-400',
      bg: 'bg-slate-500/20 border border-slate-500/30',
      text: 'Estável',
      glow: ''
    };
  }, [weightChange]);

  const TrendIcon = trend.icon;

  // Ring progress
  const ringPercentage = Math.min(100, Math.max(0, healthScore));
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (ringPercentage / 100) * circumference;
  
  // Cor do ring baseada no score
  const ringColor = useMemo(() => {
    if (healthScore >= 80) return { start: '#34D399', mid: '#22D3EE', end: '#818CF8' };
    if (healthScore >= 60) return { start: '#FBBF24', mid: '#F59E0B', end: '#EF4444' };
    return { start: '#94A3B8', mid: '#64748B', end: '#475569' };
  }, [healthScore]);

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-5 md:p-8 shadow-2xl",
        shouldAnimate && "animate-scale-in"
      )}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-violet-500/5" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 right-8 w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse" />
        <div className="absolute top-12 right-16 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-20 left-8 w-1 h-1 bg-violet-400/30 rounded-full animate-pulse delay-500" />
      </div>
      
      {/* Content */}
      <div className="relative">
        {/* Greeting - BEM LEGÍVEL */}
        <div className="mb-2 sm:mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 text-base sm:text-lg font-light">
              {greetingEmoji} {greeting}!
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-2xl sm:text-3xl bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent truncate max-w-[180px] sm:max-w-none font-bold">
              {userName.split(' ')[0]}
            </span>
            <span className="text-xl sm:text-2xl">👋</span>
          </div>
        </div>

        {/* Main content grid - Score and Weight side by side */}
        <div className="flex items-stretch gap-2 sm:gap-4">
          
          {/* Apple Health Ring - tamanho legível */}
          <div className={cn(
            "relative flex-shrink-0 flex items-center justify-center transition-transform duration-300",
            showPulse && "scale-105"
          )}>
            {/* Glow effect when score is high */}
            {healthScore >= 70 && (
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            )}
            
            <svg className="w-28 h-28 sm:w-32 md:w-40 sm:h-32 md:h-40 -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              
              {/* Progress ring */}
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                fill="none" 
                stroke="url(#healthGradient)" 
                strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: healthScore >= 70 ? 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.5))' : 'none'
                }}
              />
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={ringColor.start} />
                  <stop offset="50%" stopColor={ringColor.mid} />
                  <stop offset="100%" stopColor={ringColor.end} />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
                {currentWeight === 0 ? '?' : animatedScore}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-medium">
                {currentWeight === 0 ? 'START' : 'Score'}
              </span>
            </div>
          </div>

          {/* Weight info */}
          <div className="flex-1 flex-col space-y-1.5 sm:space-y-2 min-w-0 flex items-center justify-center">
            <div>
              <p className="text-xs sm:text-sm text-slate-400 mb-0.5 tracking-wide">
                {currentWeight === 0 ? 'Comece agora' : 'Peso atual'}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-light text-white tracking-tight tabular-nums">
                  {currentWeight === 0 ? '--.-' : currentWeight.toFixed(1)}
                </span>
                <span className="text-base sm:text-lg text-slate-400 font-light">kg</span>
              </div>
            </div>

            {/* Trend badge with glow */}
            <div className={cn(
              "inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full w-fit transition-all duration-300",
              currentWeight === 0 ? 'bg-primary/10 border border-primary/30' : trend.bg,
              trend.glow && `shadow-lg ${trend.glow}`
            )}>
              {currentWeight === 0 ? (
                <span className="text-xs sm:text-sm font-medium text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Registre seu peso
                </span>
              ) : (
                <>
                  <TrendIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", trend.color)} />
                  <span className={cn("text-sm sm:text-base font-semibold tabular-nums", trend.color)}>
                    {weightChange !== 0 && (weightChange > 0 ? '+' : '')}{weightChange.toFixed(1)}kg
                  </span>
                </>
              )}
            </div>

            {/* Goal info */}
            {targetWeight && (
              <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-400 mt-1 sm:mt-1.5 flex-wrap">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 flex-shrink-0" />
                <span className="truncate">Meta: <span className="text-white font-medium">{targetWeight}kg</span></span>
                <span className="text-slate-600 hidden xs:inline">•</span>
                <span className="truncate hidden xs:inline">Faltam <span className="text-emerald-400 font-medium">{weightToGo}kg</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom stats row - compacto */}
        <div className="grid grid-cols-3 gap-1 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
          <StatItem 
            icon={Flame} 
            label="Sequência" 
            value={currentStreak} 
            suffix="dias" 
            color="text-orange-400" 
            bgColor="bg-orange-500/20"
            delay={100}
          />
          <StatItem 
            icon={TrendingDown} 
            label="Total perdido" 
            value={weightChange < 0 ? Math.abs(weightChange).toFixed(1) : '0'} 
            suffix="kg" 
            color="text-emerald-400" 
            bgColor="bg-emerald-500/20"
            delay={200}
          />
          <StatItem 
            icon={Zap} 
            label="Em repouso" 
            value={tmb > 0 ? tmb.toLocaleString('pt-BR') : '--'} 
            suffix="kcal" 
            color="text-amber-400" 
            bgColor="bg-amber-500/20"
            delay={300}
          />
        </div>
      </div>
    </div>
  );
});

AppleHealthHeroCard.displayName = 'AppleHealthHeroCard';
