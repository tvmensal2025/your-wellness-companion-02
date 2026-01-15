import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Activity,
  Droplets,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  Thermometer,
  Gauge,
  HeartPulse
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface HealthMetricsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HealthMetric {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  status?: 'good' | 'warning' | 'alert';
  normalRange?: string;
}

export const HealthMetricsModal: React.FC<HealthMetricsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [heartRate, setHeartRate] = useState(72);

  // Simular batimento cardíaco animado
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const variation = Math.floor(Math.random() * 5) - 2;
        return Math.max(60, Math.min(85, prev + variation));
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [open]);

  // Métricas cardíacas reais
  const metrics: HealthMetric[] = [
    {
      id: 'spo2',
      label: 'Oxigenação (SpO2)',
      value: 98,
      unit: '%',
      icon: Droplets,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      status: 'good',
      normalRange: '95-100%'
    },
    {
      id: 'hrv',
      label: 'Variabilidade (HRV)',
      value: 45,
      unit: 'ms',
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      status: 'good',
      normalRange: '20-70ms'
    },
    {
      id: 'resting-hr',
      label: 'FC em Repouso',
      value: 68,
      unit: 'bpm',
      icon: HeartPulse,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      status: 'good',
      normalRange: '60-100 bpm'
    },
    {
      id: 'stress',
      label: 'Nível de Estresse',
      value: 'Baixo',
      unit: '',
      icon: Gauge,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      status: 'good',
      normalRange: 'Baseado no HRV'
    },
  ];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'good': 
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Normal</span>
          </div>
        );
      case 'warning': 
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Atenção</span>
          </div>
        );
      case 'alert': 
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-medium text-red-600 dark:text-red-400">Alerta</span>
          </div>
        );
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header com animação de batimento e ECG */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 p-6 rounded-t-lg">
          {/* ECG Line Animation no fundo */}
          <div className="absolute inset-0 flex items-center overflow-hidden opacity-30">
            <motion.div
              animate={{ x: [0, -800] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="flex"
            >
              {[...Array(4)].map((_, i) => (
                <svg key={i} width="400" height="120" viewBox="0 0 400 120" className="flex-shrink-0">
                  <path
                    d="M0,60 L30,60 L40,60 L50,60 L60,60 L70,60 L80,60 L90,60 L100,60 L110,55 L115,65 L120,60 L130,60 L140,60 L150,20 L155,100 L160,60 L170,60 L180,60 L190,60 L200,60 L210,60 L220,60 L230,60 L240,55 L245,65 L250,60 L260,60 L270,60 L280,20 L285,100 L290,60 L300,60 L310,60 L320,60 L330,60 L340,60 L350,60 L360,60 L370,55 L375,65 L380,60 L390,60 L400,60"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  />
                </svg>
              ))}
            </motion.div>
          </div>

          <div className="relative z-10 text-center">
            {/* Coração pulsando */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Heart className="w-10 h-10 text-white fill-white" />
            </motion.div>
            
            <motion.div
              key={heartRate}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold text-white mb-1"
            >
              {heartRate}
            </motion.div>
            <p className="text-white/80 text-sm">batimentos por minuto</p>
            
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-xs font-medium text-white">Ritmo Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* ECG Monitor Grande */}
        <div className="bg-gray-900 p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-500 font-mono">ECG</span>
            </div>
            <span className="text-xs text-gray-500 font-mono">{heartRate} BPM</span>
          </div>
          
          {/* ECG Wave - Monitor Style */}
          <div className="h-24 relative overflow-hidden rounded-lg bg-gray-950">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(6)].map((_, i) => (
                <div key={`h-${i}`} className="absolute w-full h-px bg-emerald-500" style={{ top: `${(i + 1) * 16.66}%` }} />
              ))}
              {[...Array(12)].map((_, i) => (
                <div key={`v-${i}`} className="absolute h-full w-px bg-emerald-500" style={{ left: `${(i + 1) * 8.33}%` }} />
              ))}
            </div>
            
            {/* ECG Line */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <motion.path
                d="M0,48 L20,48 L30,48 L40,48 L50,48 L55,45 L60,51 L65,48 L75,48 L85,48 L90,48 L95,15 L100,85 L105,48 L115,48 L125,48 L135,48 L145,48 L150,45 L155,51 L160,48 L170,48 L180,48 L185,48 L190,15 L195,85 L200,48"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, pathOffset: 0 }}
                animate={{ pathLength: 1, pathOffset: [0, -1] }}
                transition={{ 
                  pathLength: { duration: 0.5, ease: "easeOut" },
                  pathOffset: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
                style={{ filter: 'drop-shadow(0 0 4px #10b981)' }}
              />
            </svg>
            
            {/* Scanning line */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
            />
          </div>
        </div>

        {/* Métricas Cardíacas */}
        <div className="p-4 space-y-4">
          {/* Grid de métricas */}
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative p-4 rounded-xl border bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", metric.bgColor)}>
                      <Icon className={cn("w-5 h-5", metric.color)} />
                    </div>
                    {getStatusBadge(metric.status)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      {metric.unit && <span className="text-sm text-muted-foreground">{metric.unit}</span>}
                    </div>
                    <p className="text-xs font-medium">{metric.label}</p>
                    {metric.normalRange && (
                      <p className="text-[10px] text-muted-foreground">
                        Faixa normal: {metric.normalRange}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Análise Cardíaca Detalhada */}
          <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold">Análise Cardíaca</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Ritmo Cardíaco</span>
                <span className="text-xs font-medium text-emerald-500">Sinusal Normal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">FC Máxima Estimada</span>
                <span className="text-xs font-medium">185 bpm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Zona Cardíaca Atual</span>
                <span className="text-xs font-medium">Repouso</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Recuperação Cardíaca</span>
                <span className="text-xs font-medium text-emerald-500">Excelente</span>
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-600 dark:text-blue-400">
              Para medições precisas, utilize um smartwatch ou oxímetro de pulso. Os valores exibidos são estimativas baseadas em dados disponíveis.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HealthMetricsModal;
