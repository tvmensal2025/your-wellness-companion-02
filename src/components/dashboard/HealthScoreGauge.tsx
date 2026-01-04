import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Activity, Moon, Droplets, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HealthScoreGaugeProps {
  score: number; // 0-100
  previousScore?: number;
  loading?: boolean;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  previousScore,
  loading = false
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animate score on mount/change
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);

    // Celebration if score improved significantly
    if (previousScore && score > previousScore && score - previousScore >= 5) {
      setShowCelebration(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.3 },
        colors: ['#22c55e', '#10b981', '#14b8a6', '#06b6d4']
      });
      setTimeout(() => setShowCelebration(false), 3000);
    }

    return () => clearTimeout(timer);
  }, [score, previousScore]);

  // Get color based on score
  const getScoreColor = (s: number) => {
    if (s >= 80) return { gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-500', label: 'Excelente', bg: 'bg-emerald-500' };
    if (s >= 60) return { gradient: 'from-green-500 to-emerald-500', text: 'text-green-500', label: 'Bom', bg: 'bg-green-500' };
    if (s >= 40) return { gradient: 'from-amber-500 to-yellow-500', text: 'text-amber-500', label: 'Atenção', bg: 'bg-amber-500' };
    if (s >= 20) return { gradient: 'from-orange-500 to-amber-500', text: 'text-orange-500', label: 'Alerta', bg: 'bg-orange-500' };
    return { gradient: 'from-red-500 to-rose-500', text: 'text-red-500', label: 'Crítico', bg: 'bg-red-500' };
  };

  const scoreInfo = getScoreColor(score);
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Score change indicator
  const scoreChange = previousScore ? score - previousScore : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-2xl sm:rounded-[28px] bg-gradient-to-br from-card via-card to-muted/30 border border-border/40 p-3 sm:p-5 shadow-xl overflow-hidden"
    >
      {/* Background glow effect */}
      <div className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${scoreInfo.gradient} opacity-20 blur-3xl`} />
      <div className={`absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br ${scoreInfo.gradient} opacity-10 blur-3xl`} />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${scoreInfo.gradient} shadow-lg`}>
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">Score de Saúde</h3>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Atualizado agora</p>
          </div>
        </div>

        {/* Trend indicator */}
        {scoreChange !== null && scoreChange !== 0 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              scoreChange > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            }`}
          >
            {scoreChange > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="text-[10px] font-semibold">
              {scoreChange > 0 ? '+' : ''}{scoreChange.toFixed(0)}
            </span>
          </motion.div>
        )}
      </div>

      {/* Main Gauge - Responsivo */}
      <div className="relative flex items-center justify-center py-2 sm:py-4">
        <svg className="w-full max-w-[200px] h-auto" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
          {/* Background arc */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Animated progress arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (animatedScore / 100) * 251.2 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            filter="url(#glow)"
          />

          {/* Score markers */}
          {[0, 25, 50, 75, 100].map((marker, i) => {
            const angle = -180 + (marker / 100) * 180;
            const rad = (angle * Math.PI) / 180;
            const x = 100 + 95 * Math.cos(rad);
            const y = 100 + 95 * Math.sin(rad);
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[8px]"
              >
                {marker}
              </text>
            );
          })}
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 sm:pt-6">
          <motion.div
            key={animatedScore}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex flex-col items-center"
          >
            <span className={`text-4xl sm:text-5xl font-black ${scoreInfo.text}`}>
              {Math.round(animatedScore)}
            </span>
            <span className={`text-xs sm:text-sm font-semibold ${scoreInfo.text} mt-0.5 sm:mt-1`}>
              {scoreInfo.label}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-[28px]"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.2, 1] }}
              className="flex flex-col items-center gap-2"
            >
              <Sparkles className="h-10 w-10 text-amber-500" />
              <span className="text-lg font-bold text-foreground">Parabéns!</span>
              <span className="text-sm text-muted-foreground">Seu score melhorou!</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom status indicators */}
      <div className="relative grid grid-cols-3 gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        <StatusIndicator
          label="Peso"
          status={score >= 60 ? 'good' : score >= 40 ? 'warning' : 'alert'}
          icon={Scale}
        />
        <StatusIndicator
          label="Sono"
          status={score >= 70 ? 'good' : score >= 45 ? 'warning' : 'alert'}
          icon={Moon}
        />
        <StatusIndicator
          label="Hidratação"
          status={score >= 50 ? 'good' : score >= 30 ? 'warning' : 'alert'}
          icon={Droplets}
        />
      </div>
    </motion.div>
  );
};

// Mini status indicator
const StatusIndicator: React.FC<{
  label: string;
  status: 'good' | 'warning' | 'alert';
  icon: React.FC<{ className?: string }>;
}> = ({ label, status, icon: IconComponent }) => {
  const statusConfig = {
    good: { color: 'bg-emerald-500', text: 'text-emerald-500' },
    warning: { color: 'bg-amber-500', text: 'text-amber-500' },
    alert: { color: 'bg-red-500', text: 'text-red-500' }
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-col items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-muted/30">
      <div className={`flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 rounded-full ${config.color}/20`}>
        <IconComponent className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${config.text}`} />
      </div>
      <span className="text-[8px] sm:text-[9px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
};
