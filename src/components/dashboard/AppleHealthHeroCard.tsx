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
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 shadow-2xl"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-violet-500/5" />
      
      {/* Content */}
      <div className="relative">
        {/* Greeting */}
        <div className="mb-5">
          <p className="text-slate-400 text-sm">{getGreeting()}</p>
          <h2 className="text-xl font-semibold text-white mt-0.5">
            {userName.split(' ')[0]}
          </h2>
        </div>

        {/* Main content grid */}
        <div className="flex items-center gap-5">
          
          {/* Apple Health Ring */}
          <div className="relative flex-shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              {/* Progress ring */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#healthGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
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
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{healthScore}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Score</span>
            </div>
          </div>

          {/* Weight info */}
          <div className="flex-1 space-y-3">
            {/* Current weight */}
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Peso atual</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-light text-white tracking-tight">
                  {currentWeight.toFixed(1)}
                </span>
                <span className="text-sm text-slate-400">kg</span>
              </div>
            </div>

            {/* Trend badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${trend.bg}`}>
              <TrendIcon className={`h-3.5 w-3.5 ${trend.color}`} />
              <span className={`text-xs font-medium ${trend.color}`}>
                {weightChange !== 0 && (weightChange > 0 ? '+' : '')}{weightChange.toFixed(1)}kg
              </span>
            </div>

            {/* Goal info */}
            {targetWeight && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Target className="h-3.5 w-3.5" />
                <span>Meta: <span className="text-white font-medium">{targetWeight}kg</span></span>
                <span className="text-slate-500">•</span>
                <span>Faltam <span className="text-emerald-400 font-medium">{weightToGo}kg</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10">
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
  <div className="text-center py-2">
    <div className={`flex items-center justify-center gap-1.5 mb-2 ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex items-baseline justify-center gap-1.5">
      <span className="text-3xl font-bold text-white">{value}</span>
      <span className="text-sm text-slate-300 font-medium">{suffix}</span>
    </div>
    <p className="text-sm text-slate-400 mt-1.5 font-medium">{label}</p>
  </div>
);
