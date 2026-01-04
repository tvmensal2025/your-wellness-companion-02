import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Activity, 
  Scale, 
  Heart,
  TrendingUp,
  Moon,
  Droplets,
  X
} from 'lucide-react';

interface HealthAlert {
  id: string;
  type: 'weight' | 'waist' | 'heart' | 'sleep' | 'water' | 'activity';
  severity: 'warning' | 'alert' | 'info';
  message: string;
  shortMessage: string;
}

interface MiniHealthAlertsProps {
  alerts: HealthAlert[];
  onDismiss?: (id: string) => void;
}

const alertIcons = {
  weight: Scale,
  waist: Activity,
  heart: Heart,
  sleep: Moon,
  water: Droplets,
  activity: TrendingUp
};

const severityColors = {
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-500',
    pulse: 'bg-amber-500'
  },
  alert: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
    pulse: 'bg-red-500'
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-500',
    pulse: 'bg-blue-500'
  }
};

export const MiniHealthAlerts: React.FC<MiniHealthAlertsProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Compact alert badges for multiple alerts */}
      {alerts.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type];
            const colors = severityColors[alert.severity];
            
            return (
              <motion.div
                key={alert.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${colors.bg} border ${colors.border} cursor-pointer`}
              >
                {/* Pulse animation for urgent alerts */}
                {alert.severity === 'alert' && (
                  <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${colors.pulse} animate-ping`} />
                )}
                <span className={`relative h-2 w-2 rounded-full ${colors.pulse}`} />
                <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
                <span className={`text-[10px] font-medium ${colors.text}`}>{alert.shortMessage}</span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Expanded alert card for single important alert */}
      {alerts.length === 1 && (
        <AnimatePresence>
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type];
            const colors = severityColors[alert.severity];
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`relative overflow-hidden rounded-2xl ${colors.bg} border ${colors.border} p-3`}
              >
                {/* Pulse effect */}
                {alert.severity === 'alert' && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`absolute top-3 left-3 h-4 w-4 rounded-full ${colors.pulse}`}
                  />
                )}
                
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${colors.bg} border ${colors.border}`}>
                    <Icon className={`h-4 w-4 ${colors.text}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${colors.text}`}>
                        {alert.severity === 'alert' ? 'Atenção' : alert.severity === 'warning' ? 'Aviso' : 'Info'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                  </div>
                  
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="p-1 rounded-full hover:bg-muted/50 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

// Hook to generate alerts based on health data
export const useHealthAlerts = (data: {
  weight?: number;
  previousWeight?: number;
  waistCircumference?: number;
  heightCm?: number;
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
}): HealthAlert[] => {
  const alerts: HealthAlert[] = [];

  // Weight alerts
  if (data.weight && data.previousWeight) {
    const change = data.weight - data.previousWeight;
    if (change > 2) {
      alerts.push({
        id: 'weight-increase',
        type: 'weight',
        severity: 'warning',
        message: `Você ganhou ${change.toFixed(1)}kg desde a última pesagem. Vamos ajustar a alimentação?`,
        shortMessage: `+${change.toFixed(1)}kg`
      });
    }
  }

  // Waist alerts
  if (data.waistCircumference && data.heightCm) {
    const ratio = data.waistCircumference / data.heightCm;
    if (ratio >= 0.6) {
      alerts.push({
        id: 'waist-high',
        type: 'waist',
        severity: 'alert',
        message: 'Sua relação cintura/estatura indica risco cardiovascular elevado. Priorize atividade física.',
        shortMessage: 'Risco CV Alto'
      });
    } else if (ratio >= 0.55) {
      alerts.push({
        id: 'waist-moderate',
        type: 'waist',
        severity: 'warning',
        message: 'Atenção à medida da cintura. Reduza carboidratos refinados.',
        shortMessage: 'Cintura ⚠️'
      });
    }
  }

  // Heart rate alerts
  if (data.heartRate) {
    if (data.heartRate > 100) {
      alerts.push({
        id: 'hr-high',
        type: 'heart',
        severity: 'warning',
        message: 'Frequência cardíaca elevada em repouso. Tente técnicas de relaxamento.',
        shortMessage: 'FC Alta'
      });
    }
  }

  // Blood pressure alerts
  if (data.bloodPressure) {
    if (data.bloodPressure.systolic >= 140 || data.bloodPressure.diastolic >= 90) {
      alerts.push({
        id: 'bp-high',
        type: 'heart',
        severity: 'alert',
        message: 'Pressão arterial elevada. Consulte seu médico e reduza o sal.',
        shortMessage: 'PA Elevada'
      });
    } else if (data.bloodPressure.systolic >= 130 || data.bloodPressure.diastolic >= 85) {
      alerts.push({
        id: 'bp-moderate',
        type: 'heart',
        severity: 'warning',
        message: 'Pressão limítrofe. Mantenha hábitos saudáveis.',
        shortMessage: 'PA ⚠️'
      });
    }
  }

  return alerts;
};
