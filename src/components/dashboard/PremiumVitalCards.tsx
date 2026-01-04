import React from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Activity, 
  Heart, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  Target,
  Flame,
  Sparkles
} from 'lucide-react';

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  gradient: string;
  status?: 'good' | 'warning' | 'alert' | 'neutral';
  motivationalMessage?: string;
  medicalNote?: string;
  sparklineData?: number[];
}

const PremiumMetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  trendValue,
  gradient,
  status = 'neutral',
  motivationalMessage,
  medicalNote,
  sparklineData
}) => {
  const statusColors = {
    good: 'border-emerald-500/30 shadow-emerald-500/10',
    warning: 'border-amber-500/30 shadow-amber-500/10',
    alert: 'border-red-500/30 shadow-red-500/10',
    neutral: 'border-border/40'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'down' ? 'text-emerald-500' : trend === 'up' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br from-card via-card to-muted/20 border ${statusColors[status]} p-4 shadow-lg`}
    >
      {/* Gradient overlay */}
      <div className={`absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      
      {/* Sparkline background */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`sparkline-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={generateSparklinePath(sparklineData)}
              fill={`url(#sparkline-${label})`}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
          </div>
          
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              {trendValue && <span className="text-[10px] font-semibold">{trendValue}</span>}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-3xl font-black text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground font-medium">{unit}</span>
        </div>

        {/* Messages */}
        {(motivationalMessage || medicalNote) && (
          <div className="space-y-1 mt-3 pt-3 border-t border-border/30">
            {medicalNote && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                {medicalNote}
              </p>
            )}
            {motivationalMessage && (
              <p className="text-[10px] font-medium text-primary flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {motivationalMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Generate sparkline SVG path
const generateSparklinePath = (data: number[]): string => {
  if (data.length === 0) return '';
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 40 - ((value - min) / range) * 35;
    return `${x},${y}`;
  });
  
  return `M ${points.join(' L ')} L 100,40 L 0,40 Z`;
};

// Main component that displays all vital cards
interface PremiumVitalCardsProps {
  weight: number | string;
  weightChange?: string;
  waistCircumference?: number;
  heightCm?: number;
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  weightHistory?: number[];
  waistHistory?: number[];
}

export const PremiumVitalCards: React.FC<PremiumVitalCardsProps> = ({
  weight,
  weightChange,
  waistCircumference = 0,
  heightCm = 170,
  heartRate,
  bloodPressure,
  weightHistory = [],
  waistHistory = []
}) => {
  // Parse weight change
  const parseWeightTrend = (change: string | undefined): { trend: 'up' | 'down' | 'stable'; value: string } => {
    if (!change || change === 'Primeiro registro') return { trend: 'stable', value: '' };
    const numValue = parseFloat(change.replace(/[^0-9.-]/g, ''));
    if (numValue < 0) return { trend: 'down', value: change };
    if (numValue > 0) return { trend: 'up', value: change };
    return { trend: 'stable', value: change };
  };

  // Waist-to-height ratio analysis
  const waistToHeightRatio = waistCircumference && heightCm ? waistCircumference / heightCm : 0;
  const getWaistStatus = (ratio: number): 'good' | 'warning' | 'alert' | 'neutral' => {
    if (ratio === 0) return 'neutral';
    if (ratio < 0.5) return 'good';
    if (ratio < 0.55) return 'warning';
    return 'alert';
  };

  const weightTrend = parseWeightTrend(weightChange);
  const waistStatus = getWaistStatus(waistToHeightRatio);

  // Generate motivational messages
  const getWeightMessage = () => {
    if (weightTrend.trend === 'down') return 'Você está no caminho certo! 💪';
    if (weightTrend.trend === 'up') return 'Mantenha o foco, você consegue!';
    return 'Constância é a chave do sucesso!';
  };

  const getWaistMessage = () => {
    if (waistStatus === 'good') return 'Excelente! Continue assim! 🌟';
    if (waistStatus === 'warning') return 'Pequenos ajustes fazem grande diferença!';
    if (waistStatus === 'alert') return 'Vamos juntos melhorar esse indicador!';
    return 'Registre sua medida para acompanhar';
  };

  const getWaistMedicalNote = () => {
    if (waistStatus === 'good') return 'RCEst saudável - Risco cardiovascular baixo';
    if (waistStatus === 'warning') return 'RCEst moderado - Atenção preventiva';
    if (waistStatus === 'alert') return 'RCEst elevado - Priorize atividade física';
    return '';
  };

  return (
    <div className="space-y-3">
      {/* Weight Card - Featured */}
      <PremiumMetricCard
        icon={Scale}
        label="Peso Atual"
        value={weight}
        unit="kg"
        trend={weightTrend.trend}
        trendValue={weightTrend.value}
        gradient="from-violet-600 to-purple-700"
        status={weightTrend.trend === 'down' ? 'good' : weightTrend.trend === 'up' ? 'warning' : 'neutral'}
        motivationalMessage={getWeightMessage()}
        sparklineData={weightHistory}
      />

      {/* Grid for secondary metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Waist Card */}
        <PremiumMetricCard
          icon={Activity}
          label="Cintura"
          value={waistCircumference || '--'}
          unit="cm"
          gradient="from-amber-500 to-orange-600"
          status={waistStatus}
          medicalNote={getWaistMedicalNote()}
          motivationalMessage={getWaistMessage()}
          sparklineData={waistHistory}
        />

        {/* Heart Rate or Goal Card */}
        {heartRate ? (
          <PremiumMetricCard
            icon={Heart}
            label="FC"
            value={heartRate}
            unit="bpm"
            gradient="from-rose-500 to-red-600"
            status={heartRate > 100 ? 'warning' : heartRate < 60 ? 'warning' : 'good'}
          />
        ) : (
          <PremiumMetricCard
            icon={Target}
            label="Meta"
            value="--"
            unit="kg"
            gradient="from-teal-500 to-cyan-600"
            status="neutral"
            motivationalMessage="Defina sua meta!"
          />
        )}
      </div>

      {/* Blood Pressure Card - Full Width */}
      {bloodPressure && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-rose-500/10 via-red-500/5 to-pink-500/10 border border-rose-500/20 p-4"
        >
          <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-rose-500/20 blur-2xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Pressão Arterial</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {bloodPressure.systolic < 120 && bloodPressure.diastolic < 80 
                    ? '✓ Normal' 
                    : bloodPressure.systolic < 140 
                      ? '⚠️ Atenção'
                      : '🚨 Elevada'}
                </p>
              </div>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground">{bloodPressure.systolic}</span>
              <span className="text-lg text-muted-foreground">/</span>
              <span className="text-2xl font-black text-foreground">{bloodPressure.diastolic}</span>
              <span className="text-xs text-muted-foreground ml-1">mmHg</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
