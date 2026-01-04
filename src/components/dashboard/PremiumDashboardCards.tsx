import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Target, Droplets, Activity, TrendingUp, TrendingDown, Minus, Heart, Flame, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  delay?: number;
}

export const PremiumMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  change,
  icon: Icon,
  gradient,
  iconBg,
  delay = 0
}) => {
  const getTrendIcon = () => {
    if (!change || change === 0) return <Minus className="w-3 h-3" />;
    return change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (!change || change === 0) return 'text-muted-foreground';
    return change > 0 ? 'text-red-500' : 'text-emerald-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        
        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${iconBg}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          
          <h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
          
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{value}</span>
            {unit && <span className="text-lg text-white/70">{unit}</span>}
          </div>
          
          {subtitle && (
            <p className="text-xs text-white/60 mt-2">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface BodyMetricsCardProps {
  imc: number | string;
  imcClass: string;
  muscleMass?: number;
  metabolism?: number;
  fatPercentage?: number;
  visceralFat?: number;
  metabolicAge?: number;
  delay?: number;
}

export const PremiumBodyMetricsCard: React.FC<BodyMetricsCardProps> = ({
  imc,
  imcClass,
  muscleMass,
  metabolism,
  fatPercentage,
  visceralFat,
  metabolicAge,
  delay = 0
}) => {
  const getImcColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'abaixo do peso': return 'bg-yellow-500';
      case 'normal': return 'bg-emerald-500';
      case 'sobrepeso': return 'bg-orange-500';
      case 'obesidade': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-teal-500 to-cyan-600">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        
        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-white/20">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${getImcColor(imcClass)}`}>
              {imcClass}
            </span>
          </div>
          
          <h3 className="text-sm font-medium text-white/80 mb-1">Métricas Corporais</h3>
          
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-bold text-white">{imc}</span>
            <span className="text-lg text-white/70">IMC</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetricItem label="Massa Magra" value={muscleMass ? `${muscleMass.toFixed(1)}kg` : 'N/A'} color="text-emerald-200" />
            <MetricItem label="Metabolismo" value={metabolism ? `${Math.round(metabolism)}` : 'N/A'} color="text-orange-200" />
            <MetricItem label="Gordura" value={fatPercentage ? `${fatPercentage.toFixed(1)}%` : 'N/A'} color="text-yellow-200" />
            <MetricItem label="Idade Met." value={metabolicAge ? `${metabolicAge}` : 'N/A'} color="text-blue-200" />
          </div>
          
          {visceralFat !== undefined && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <MetricItem label="Gordura Visceral" value={visceralFat ? `${visceralFat}` : 'N/A'} color="text-pink-200" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const MetricItem: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="text-center">
    <span className={`text-lg font-bold ${color}`}>{value}</span>
    <p className="text-xs text-white/60">{label}</p>
  </div>
);

interface WeeklyProgressCardProps {
  progress: number;
  exerciseDays: number;
  hydrationProgress: number;
  weightChange: number;
  totalExerciseMinutes?: number;
  delay?: number;
}

export const PremiumWeeklyProgressCard: React.FC<WeeklyProgressCardProps> = ({
  progress,
  exerciseDays,
  hydrationProgress,
  weightChange,
  totalExerciseMinutes = 0,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="col-span-full"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Progresso Semanal</h3>
                <p className="text-xs text-white/60">Continue assim!</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-white">{progress}%</span>
            </div>
          </div>

          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <motion.div 
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2 }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <ProgressItem 
              icon={<Activity className="w-4 h-4" />} 
              label="Exercícios" 
              value={`${exerciseDays}/7`}
              subValue={`${totalExerciseMinutes}min`}
            />
            <ProgressItem 
              icon={<Droplets className="w-4 h-4" />} 
              label="Hidratação" 
              value={`${hydrationProgress}%`}
            />
            <ProgressItem 
              icon={<Scale className="w-4 h-4" />} 
              label="Peso" 
              value={`${weightChange > 0 ? '+' : ''}${weightChange}kg`}
            />
            <ProgressItem 
              icon={<Heart className="w-4 h-4" />} 
              label="Saúde" 
              value="Bom"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProgressItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  subValue?: string;
}> = ({ icon, label, value, subValue }) => (
  <div className="text-center">
    <div className="flex justify-center mb-1 text-white/80">{icon}</div>
    <span className="text-sm font-bold text-white">{value}</span>
    {subValue && <span className="text-xs text-white/60 block">{subValue}</span>}
    <p className="text-xs text-white/60">{label}</p>
  </div>
);

interface QuickActionsProps {
  onAddWeight: () => void;
  onAddExercise: () => void;
  delay?: number;
}

export const PremiumQuickActions: React.FC<QuickActionsProps> = ({
  onAddWeight,
  onAddExercise,
  delay = 0
}) => {
  const actions = [
    { icon: Scale, label: 'Registrar Peso', color: 'from-blue-500 to-indigo-600', onClick: onAddWeight },
    { icon: Activity, label: 'Adicionar Exercício', color: 'from-green-500 to-emerald-600', onClick: onAddExercise },
    { icon: Droplets, label: 'Registrar Água', color: 'from-cyan-500 to-blue-600', onClick: () => {} },
    { icon: Moon, label: 'Registrar Sono', color: 'from-purple-500 to-violet-600', onClick: () => {} },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="col-span-full"
    >
      <Card className="border-0 shadow-lg bg-card">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Ações Rápidas</h3>
          <div className="grid grid-cols-4 gap-2">
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                onClick={action.onClick}
                className={`flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <action.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
