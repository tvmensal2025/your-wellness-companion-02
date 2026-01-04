import React from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Flame, 
  Droplets, 
  Moon, 
  TrendingUp,
  Activity,
  Target,
  Zap,
  ChevronRight,
  Sparkles,
  Heart
} from 'lucide-react';


// Premium Hero Card - Glassmorphism style
export const PremiumHeroCard: React.FC<{
  weight?: number | string;
  calories?: number;
  water?: number;
  sleep?: number;
  weightChange?: string;
}> = ({ weight, calories, water, sleep, weightChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary via-primary/95 to-violet-600 p-5 text-white shadow-2xl"
    >
      {/* Animated orbs */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-violet-300/20 blur-2xl" />
      <div className="absolute right-1/3 top-1/2 h-20 w-20 rounded-full bg-white/5 blur-xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md shadow-inner">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-sm font-semibold">Resumo de Hoje</span>
            <p className="text-[11px] text-white/60">Atualizado agora</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <HeroStat 
            icon={Scale} 
            label="Peso" 
            value={weight ? `${weight}` : '--'} 
            unit="kg"
            subtext={weightChange || 'Primeiro registro'}
          />
          <HeroStat 
            icon={Flame} 
            label="Calorias" 
            value={calories ? `${calories}` : '--'} 
            unit="kcal"
          />
          <HeroStat 
            icon={Droplets} 
            label="Água" 
            value={water ? `${(water/1000).toFixed(1)}` : '--'} 
            unit="L"
          />
          <HeroStat 
            icon={Moon} 
            label="Sono" 
            value={sleep ? `${sleep}` : '--'} 
            unit="h"
          />
        </div>
      </div>
    </motion.div>
  );
};

const HeroStat: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  subtext?: string;
}> = ({ icon: Icon, label, value, unit, subtext }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
      <Icon className="h-5 w-5 text-white/90" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] text-white/60 uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold tracking-tight">{value}</span>
        <span className="text-xs text-white/50">{unit}</span>
      </div>
      {subtext && <p className="text-[10px] text-white/40 truncate">{subtext}</p>}
    </div>
  </div>
);

// Premium Health Score Circle
export const PremiumHealthRing: React.FC<{
  score: number;
  label?: string;
}> = ({ score = 75, label = "Score" }) => {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10B981';
    if (s >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const color = getScoreColor(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="relative flex flex-col items-center justify-center rounded-[24px] bg-card/80 backdrop-blur-md p-4 border border-border/40 shadow-lg"
    >
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/20"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <TrendingUp className="h-3 w-3 text-emerald-500" />
        <span>+5 pts</span>
      </div>
    </motion.div>
  );
};

// Premium Weekly Mini Bars
export const PremiumWeeklyMini: React.FC<{
  days?: { day: string; value: number }[];
  exerciseDays?: number;
  hydrationProgress?: number;
}> = ({ days, exerciseDays = 3, hydrationProgress = 65 }) => {
  const defaultDays = [
    { day: 'S', value: 90 },
    { day: 'T', value: 100 },
    { day: 'Q', value: 70 },
    { day: 'Q', value: 50 },
    { day: 'S', value: 0 },
    { day: 'S', value: 0 },
    { day: 'D', value: 0 },
  ];

  const displayDays = days || defaultDays;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-[24px] bg-card/80 backdrop-blur-md border border-border/40 p-4 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Semana</h3>
          <p className="text-[10px] text-muted-foreground">{exerciseDays}/7 dias ativos</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Target className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Mini bar chart */}
      <div className="flex justify-between items-end gap-1.5 h-14 mb-3">
        {displayDays.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-10 bg-muted/30 rounded-full overflow-hidden flex flex-col-reverse">
              <motion.div
                className={`w-full rounded-full ${day.value > 0 ? 'bg-gradient-to-t from-primary to-primary/70' : 'bg-muted/40'}`}
                initial={{ height: 0 }}
                animate={{ height: `${day.value}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
              />
            </div>
            <span className={`text-[9px] font-medium ${day.value > 0 ? 'text-primary' : 'text-muted-foreground/60'}`}>
              {day.day}
            </span>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-center pt-2 border-t border-border/30">
        <div>
          <span className="text-sm font-bold text-foreground">{hydrationProgress}%</span>
          <p className="text-[9px] text-muted-foreground">Hidratação</p>
        </div>
        <div>
          <span className="text-sm font-bold text-foreground">{exerciseDays}/7</span>
          <p className="text-[9px] text-muted-foreground">Exercícios</p>
        </div>
        <div>
          <span className="text-sm font-bold text-emerald-500">Bom</span>
          <p className="text-[9px] text-muted-foreground">Status</p>
        </div>
      </div>
    </motion.div>
  );
};

// Premium Quick Action - Apenas Peso (manual), resto vem do Google Fit
export const PremiumQuickActions: React.FC<{
  onAddWeight: () => void;
  delay?: number;
}> = ({ onAddWeight, delay = 0.2 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center"
    >
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onAddWeight}
        className="group flex flex-col items-center gap-2"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 transition-all duration-200 group-active:scale-95">
          <Scale className="h-7 w-7 text-white" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Registrar Peso</span>
      </motion.button>
    </motion.div>
  );
};

// Premium Feature Card
export const PremiumFeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient: string;
  shadowColor: string;
  onClick?: () => void;
}> = ({ icon: Icon, title, subtitle, gradient, shadowColor, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 text-left text-white shadow-xl ${shadowColor}`}
  >
    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
    
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/10">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-[15px]">{title}</h4>
          <p className="text-[11px] text-white/70">{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-white/50" />
    </div>
  </motion.button>
);

// Compact Daily Stats
export const PremiumDailyStats: React.FC<{
  exerciseMinutes: number;
  waterLiters: number;
  sleepHours: number;
}> = ({ exerciseMinutes, waterLiters, sleepHours }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35 }}
    className="grid grid-cols-3 gap-2"
  >
    <StatPill icon={Activity} value={`${exerciseMinutes}min`} label="Exercício" color="text-orange-500" bg="bg-orange-500/10" />
    <StatPill icon={Droplets} value={`${waterLiters}L`} label="Água" color="text-cyan-500" bg="bg-cyan-500/10" />
    <StatPill icon={Zap} value={`${sleepHours}h`} label="Sono" color="text-violet-500" bg="bg-violet-500/10" />
  </motion.div>
);

const StatPill: React.FC<{
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
  bg: string;
}> = ({ icon: Icon, value, label, color, bg }) => (
  <div className={`flex flex-col items-center rounded-2xl ${bg} backdrop-blur-sm border border-border/30 py-3 px-2`}>
    <Icon className={`h-5 w-5 ${color} mb-1`} />
    <span className="text-base font-bold text-foreground">{value}</span>
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </div>
);
