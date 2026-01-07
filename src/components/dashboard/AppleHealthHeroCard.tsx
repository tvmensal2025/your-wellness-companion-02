import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Target, Flame, Zap } from 'lucide-react';

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

export const AppleHealthHeroCard: React.FC<AppleHealthHeroCardProps> = ({
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
  const weightToGo = targetWeight ? Math.abs(currentWeight - targetWeight).toFixed(1) : null;

  // Calcular TMB (Taxa Metabólica Basal) - Mifflin-St Jeor
  const tmb = React.useMemo(() => {
    if (!currentWeight || currentWeight === 0) return 0;
    const isMale = gender?.toLowerCase() === 'm' || gender?.toLowerCase() === 'masculino';
    if (isMale) {
      return Math.round(10 * currentWeight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * currentWeight + 6.25 * height - 5 * age - 161);
    }
  }, [currentWeight, height, age, gender]);

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
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 md:p-8 shadow-2xl"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-violet-500/5" />
      
      {/* Content */}
      <div className="relative">
        {/* Elegant Greeting */}
        <div className="mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <span className="text-slate-400 text-sm sm:text-base font-light tracking-wide">{getGreeting()},</span>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-lg sm:text-xl font-medium bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent truncate max-w-[140px] sm:max-w-none">
                {userName.split(' ')[0]}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Main content grid - Score and Weight side by side */}
        <div className="flex items-stretch gap-3 sm:gap-5">
          
          {/* Apple Health Ring - Responsive sizing */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <svg className="w-24 h-24 sm:w-32 md:w-36 sm:h-32 md:h-36 -rotate-90" viewBox="0 0 100 100">
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
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
              >
                {currentWeight === 0 ? '?' : healthScore}
              </motion.span>
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-medium">
                {currentWeight === 0 ? 'START' : 'Score'}
              </span>
            </div>
          </div>

          {/* Weight info - Responsive typography */}
          <div className="flex-1 flex flex-col justify-center space-y-2 sm:space-y-3 min-w-0">
            {/* Current weight */}
            <div>
              <p className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-1.5 tracking-wide">
                {currentWeight === 0 ? 'Comece agora' : 'Peso atual'}
              </p>
              <div className="flex items-baseline gap-1.5">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-tight"
                >
                  {currentWeight === 0 ? '--.-' : currentWeight.toFixed(1)}
                </motion.span>
                <span className="text-base sm:text-xl text-slate-400 font-light">kg</span>
              </div>
            </div>

            {/* Trend badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full w-fit ${currentWeight === 0 ? 'bg-primary/10' : trend.bg}`}
            >
              {currentWeight === 0 ? (
                <span className="text-sm sm:text-base font-medium text-primary">
                  🎯 Registre seu peso para começar
                </span>
              ) : (
                <>
                  <TrendIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${trend.color}`} />
                  <span className={`text-sm sm:text-base font-medium ${trend.color}`}>
                    {weightChange !== 0 && (weightChange > 0 ? '+' : '')}{weightChange.toFixed(1)}kg
                  </span>
                </>
              )}
            </motion.div>

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

        {/* Bottom stats row - Responsive */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
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
            icon={Zap}
            label="Em repouso"
            value={tmb > 0 ? tmb.toLocaleString('pt-BR') : '--'}
            suffix="kcal"
            color="text-amber-400"
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
  <div className="text-center py-2 sm:py-3">
    <div className={`flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5 ${color}`}>
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
    </div>
    <div className="flex items-baseline justify-center gap-1 sm:gap-2">
      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{value}</span>
      <span className="text-xs sm:text-base text-slate-300 font-medium">{suffix}</span>
    </div>
    <p className="text-xs sm:text-base text-slate-400 mt-1 sm:mt-2 font-medium truncate">{label}</p>
  </div>
);

