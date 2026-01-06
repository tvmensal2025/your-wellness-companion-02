import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Target, Flame, ArrowUpRight } from 'lucide-react';

interface AppleHealthHeroCardProps {
  currentWeight: number;
  targetWeight?: number;
  weightChange?: number;
  healthScore: number;
  currentStreak: number;
  userName?: string;
}

export const AppleHealthHeroCard: React.FC<AppleHealthHeroCardProps> = ({
  currentWeight,
  targetWeight,
  weightChange = 0,
  healthScore,
  currentStreak,
  userName = 'Usuário'
}) => {
  const progressToGoal = targetWeight 
    ? Math.min(100, Math.max(0, ((currentWeight - targetWeight) / 10) * 100))
    : 0;

  const weightToGo = targetWeight ? Math.abs(currentWeight - targetWeight).toFixed(1) : null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getTrendInfo = () => {
    if (weightChange < -0.1) return { 
      icon: TrendingDown, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      text: 'Perdendo peso'
    };
    if (weightChange > 0.1) return { 
      icon: TrendingUp, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10',
      text: 'Ganhando peso'
    };
    return { 
      icon: Minus, 
      color: 'text-muted-foreground', 
      bg: 'bg-muted',
      text: 'Estável'
    };
  };

  const trend = getTrendInfo();
  const TrendIcon = trend.icon;

  // Ring progress component (Apple style)
  const ringPercentage = Math.min(100, Math.max(0, healthScore));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (ringPercentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-5 shadow-2xl"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-violet-500/5" />
      
      {/* Content */}
      <div className="relative">
        {/* Elegant Greeting */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-slate-400 text-xs sm:text-sm font-light tracking-wide">{getGreeting()},</span>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-base sm:text-lg font-medium bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
                {userName.split(' ')[0]}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Main content grid - Score and Weight side by side */}
        <div className="flex items-stretch gap-2 sm:gap-4">
          
          {/* Apple Health Ring - Responsive sizing */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 sm:w-28 md:w-32 sm:h-28 md:h-32 -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="8"
              />
              {/* Progress ring */}
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#healthGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 - (ringPercentage / 100) * 2 * Math.PI * 42 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="50%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content - Responsive */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white"
              >
                {healthScore}
              </motion.span>
              <span className="text-[9px] sm:text-[11px] text-slate-400 uppercase tracking-widest font-medium">Score</span>
            </div>
          </div>

          {/* Weight info - Responsive typography */}
          <div className="flex-1 flex flex-col justify-center space-y-1.5 sm:space-y-2 min-w-0">
            {/* Current weight */}
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1 tracking-wide">Peso atual</p>
              <div className="flex items-baseline gap-1">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight"
                >
                  {currentWeight.toFixed(1)}
                </motion.span>
                <span className="text-sm sm:text-lg text-slate-400 font-light">kg</span>
              </div>
            </div>

            {/* Trend badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full w-fit ${trend.bg}`}
            >
              <TrendIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${trend.color}`} />
              <span className={`text-xs sm:text-sm font-medium ${trend.color}`}>
                {weightChange !== 0 && (weightChange > 0 ? '+' : '')}{weightChange.toFixed(1)}kg
              </span>
            </motion.div>

            {/* Goal info */}
            {targetWeight && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 flex-wrap">
                <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500 flex-shrink-0" />
                <span className="truncate">Meta: <span className="text-white font-medium">{targetWeight}kg</span></span>
                <span className="text-slate-600 hidden xs:inline">•</span>
                <span className="truncate hidden xs:inline">Faltam <span className="text-emerald-400 font-medium">{weightToGo}kg</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom stats row - Responsive */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-5 pt-3 sm:pt-5 border-t border-white/10">
          <StatItem 
            icon={Flame}
            label="Sequência"
            value={currentStreak}
            suffix="dias"
            color="text-orange-400"
          />
          <StatItem 
            icon={TrendingDown}
            label="Total perdido"
            value={weightChange < 0 ? Math.abs(weightChange).toFixed(1) : '0'}
            suffix="kg"
            color="text-emerald-400"
          />
          <StatItem 
            icon={ArrowUpRight}
            label="Progresso"
            value={Math.round(100 - progressToGoal)}
            suffix="%"
            color="text-cyan-400"
          />
        </div>
      </div>
    </motion.div>
  );
};

const StatItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  suffix: string;
  color: string;
}> = ({ icon: Icon, label, value, suffix, color }) => (
  <div className="text-center py-1 sm:py-2">
    <div className={`flex items-center justify-center gap-1 sm:gap-1.5 mb-1 sm:mb-2 ${color}`}>
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
    <div className="flex items-baseline justify-center gap-0.5 sm:gap-1.5">
      <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{value}</span>
      <span className="text-[10px] sm:text-sm text-slate-300 font-medium">{suffix}</span>
    </div>
    <p className="text-[10px] sm:text-sm text-slate-400 mt-0.5 sm:mt-1.5 font-medium truncate">{label}</p>
  </div>
);

