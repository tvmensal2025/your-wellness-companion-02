import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Heart, Activity, TrendingDown, TrendingUp, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface VitalHealthCardProps {
  weight: number | string;
  weightChange?: string;
  waistCircumference?: number;
  heightCm?: number;
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
}

export const VitalHealthCard: React.FC<VitalHealthCardProps> = ({
  weight,
  weightChange,
  waistCircumference = 0,
  heightCm = 170,
  heartRate,
  bloodPressure
}) => {
  // Calcular RCEst (Razão Cintura-Estatura)
  const waistToHeightRatio = waistCircumference && heightCm ? waistCircumference / heightCm : 0;
  
  // Classificação de risco cardiovascular
  const getCardioRisk = (ratio: number) => {
    if (ratio === 0) return { level: 'sem dados', color: 'text-muted-foreground', bg: 'bg-muted/50', icon: Minus };
    if (ratio < 0.5) return { level: 'baixo', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 };
    if (ratio < 0.55) return { level: 'moderado', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Activity };
    if (ratio < 0.6) return { level: 'elevado', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: AlertTriangle };
    return { level: 'alto', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle };
  };

  const cardioRisk = getCardioRisk(waistToHeightRatio);
  const CardioIcon = cardioRisk.icon;

  // Trend icon
  const getTrendIcon = (change: string | undefined) => {
    if (!change || change === 'Primeiro registro') return null;
    const value = parseFloat(change.replace(/[^0-9.-]/g, ''));
    if (value < 0) return <TrendingDown className="h-3 w-3 text-emerald-500" />;
    if (value > 0) return <TrendingUp className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] bg-gradient-to-br from-card via-card to-muted/20 border border-border/40 p-4 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-md">
          <Heart className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Saúde Vital</h3>
          <p className="text-[10px] text-muted-foreground">Métricas que importam</p>
        </div>
      </div>

      {/* Main Grid - 2 cols */}
      <div className="grid grid-cols-2 gap-3">
        {/* Peso - Card Principal */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 p-3">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/10 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1">
              <Scale className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Peso</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{weight}</span>
              <span className="text-xs text-muted-foreground">kg</span>
            </div>
            {weightChange && (
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(weightChange)}
                <span className="text-[10px] text-muted-foreground">{weightChange}</span>
              </div>
            )}
          </div>
        </div>

        {/* Risco Cardiovascular */}
        <div className={`relative overflow-hidden rounded-2xl ${cardioRisk.bg} border border-border/30 p-3`}>
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-current opacity-10 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1">
              <CardioIcon className={`h-3.5 w-3.5 ${cardioRisk.color}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Risco CV</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold capitalize ${cardioRisk.color}`}>{cardioRisk.level}</span>
            </div>
            {waistToHeightRatio > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-muted-foreground">RCEst: {waistToHeightRatio.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cintura */}
        <div className="rounded-2xl bg-muted/30 border border-border/30 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Cintura</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-foreground">{waistCircumference || '--'}</span>
            <span className="text-xs text-muted-foreground">cm</span>
          </div>
        </div>

        {/* Frequência Cardíaca */}
        <div className="rounded-2xl bg-muted/30 border border-border/30 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">FC</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-foreground">{heartRate || '--'}</span>
            <span className="text-xs text-muted-foreground">bpm</span>
          </div>
        </div>
      </div>

      {/* Pressão Arterial - Full Width */}
      {bloodPressure && (
        <div className="mt-3 rounded-2xl bg-gradient-to-r from-rose-500/10 to-red-500/10 border border-rose-500/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-medium text-foreground">Pressão Arterial</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">{bloodPressure.systolic}/{bloodPressure.diastolic}</span>
              <span className="text-xs text-muted-foreground">mmHg</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
