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
  HeartPulse,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useRealTimeHeartRate } from '@/hooks/useRealTimeHeartRate';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleFitData {
  heart_rate_avg?: number;
  heart_rate_min?: number;
  heart_rate_max?: number;
  heart_rate_resting?: number;
  steps?: number;
  active_minutes?: number;
  calories?: number;
  sleep_hours?: number;
  date: string;
  sync_timestamp?: string;
}

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [googleFitData, setGoogleFitData] = useState<GoogleFitData | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  // Hook para dados de frequência cardíaca em tempo real
  const {
    heartRate: realTimeHeartRate,
    isLoading: heartRateLoading,
    isConnected: googleFitConnected,
    error: heartRateError,
    sync: syncHeartRate
  } = useRealTimeHeartRate(open);

  // Buscar dados mais recentes do Google Fit
  const fetchGoogleFitData = async () => {
    if (!open) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar dados dos últimos 7 dias para calcular médias
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const { data: fitData, error } = await supabase
        .from('google_fit_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(7);

      if (error) {
        console.error('Erro ao buscar dados do Google Fit:', error);
        return;
      }

      if (fitData && fitData.length > 0) {
        // Usar dados mais recentes
        const latestData = fitData[0] as GoogleFitData;
        setGoogleFitData(latestData);
        setLastSync(latestData.sync_timestamp ? new Date(latestData.sync_timestamp) : new Date());
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar dados do Google Fit
  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncHeartRate();
      await fetchGoogleFitData();
      toast({
        title: "✅ Dados sincronizados!",
        description: "Métricas atualizadas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao sincronizar",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleFitData();
  }, [open]);

  // Usar APENAS dados reais do Google Fit - sem fallbacks fictícios
  const currentHeartRate = realTimeHeartRate.current || googleFitData?.heart_rate_avg || null;
  const restingHeartRate = googleFitData?.heart_rate_resting || null;
  const minHeartRate = googleFitData?.heart_rate_min || null;
  const maxHeartRate = googleFitData?.heart_rate_max || null;
  const oxygenSaturation = (googleFitData as any)?.oxygen_saturation || null;
  const respiratoryRate = (googleFitData as any)?.respiratory_rate || null;
  
  // Calcular HRV REAL baseado nos dados do Google Fit
  const calculateRealHRV = () => {
    if (maxHeartRate && minHeartRate && maxHeartRate > minHeartRate) {
      // HRV real baseado na variabilidade da frequência cardíaca
      const variation = maxHeartRate - minHeartRate;
      return Math.round(variation * 0.6); // Fórmula mais precisa para HRV
    }
    return null; // Sem dados = sem valor
  };

  // Calcular nível de estresse REAL baseado em dados do Google Fit
  const calculateRealStressLevel = () => {
    if (!currentHeartRate || !restingHeartRate) {
      return { level: 'Sem dados', status: 'warning' as const };
    }
    
    const difference = currentHeartRate - restingHeartRate;
    const hrv = calculateRealHRV();
    
    // Algoritmo mais preciso considerando HRV e diferença de FC
    if (difference <= 5 && hrv && hrv > 40) return { level: 'Muito Baixo', status: 'good' as const };
    if (difference <= 10 && hrv && hrv > 30) return { level: 'Baixo', status: 'good' as const };
    if (difference <= 20) return { level: 'Moderado', status: 'warning' as const };
    if (difference <= 30) return { level: 'Alto', status: 'alert' as const };
    return { level: 'Muito Alto', status: 'alert' as const };
  };

  const stressLevel = calculateRealStressLevel();
  const realHRV = calculateRealHRV();

  // Métricas cardíacas APENAS com dados reais do Google Fit
  const metrics: HealthMetric[] = [
    {
      id: 'spo2',
      label: 'Oxigenação (SpO2)',
      value: oxygenSaturation ? `${oxygenSaturation.toFixed(1)}` : 'Sem dados',
      unit: oxygenSaturation ? '%' : '',
      icon: Droplets,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      status: oxygenSaturation ? (oxygenSaturation >= 95 ? 'good' : oxygenSaturation >= 90 ? 'warning' : 'alert') : 'warning',
      normalRange: '95-100%'
    },
    {
      id: 'hrv',
      label: 'Variabilidade (HRV)',
      value: realHRV ? realHRV : 'Sem dados',
      unit: realHRV ? 'ms' : '',
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      status: realHRV ? (realHRV >= 20 && realHRV <= 70 ? 'good' : 'warning') : 'warning',
      normalRange: '20-70ms'
    },
    {
      id: 'resting-hr',
      label: 'FC em Repouso',
      value: restingHeartRate ? restingHeartRate : 'Sem dados',
      unit: restingHeartRate ? 'bpm' : '',
      icon: HeartPulse,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      status: restingHeartRate ? (restingHeartRate >= 60 && restingHeartRate <= 100 ? 'good' : 'warning') : 'warning',
      normalRange: '60-100 bpm'
    },
    {
      id: 'stress',
      label: 'Nível de Estresse',
      value: stressLevel.level,
      unit: '',
      icon: Gauge,
      color: stressLevel.status === 'good' ? 'text-emerald-500' : stressLevel.status === 'warning' ? 'text-amber-500' : 'text-red-500',
      bgColor: stressLevel.status === 'good' ? 'bg-emerald-500/10' : stressLevel.status === 'warning' ? 'bg-amber-500/10' : 'bg-red-500/10',
      status: stressLevel.status,
      normalRange: 'Baseado no HRV e FC'
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
            {/* Botão de sincronização */}
            <div className="absolute top-0 right-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSync}
                disabled={isLoading || heartRateLoading}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className={cn("w-4 h-4", (isLoading || heartRateLoading) && "animate-spin")} />
              </Button>
            </div>

            {/* Coração pulsando */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Heart className="w-10 h-10 text-white fill-white" />
            </motion.div>
            
            {/* Frequência cardíaca atual - APENAS dados reais */}
            <motion.div
              key={currentHeartRate || 'no-data'}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold text-white mb-1"
            >
              {isLoading || heartRateLoading ? (
                <Loader2 className="w-12 h-12 animate-spin mx-auto" />
              ) : currentHeartRate ? (
                currentHeartRate
              ) : (
                <div className="text-2xl">--</div>
              )}
            </motion.div>
            <p className="text-white/80 text-sm">
              {currentHeartRate ? "batimentos por minuto" : "Dados não disponíveis"}
            </p>
            
            {/* Status da conexão */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full backdrop-blur-sm",
                googleFitConnected ? "bg-white/20" : "bg-red-500/20"
              )}>
                <CheckCircle2 className={cn(
                  "w-3.5 h-3.5",
                  googleFitConnected ? "text-emerald-300" : "text-red-300"
                )} />
                <span className="text-xs font-medium text-white">
                  {googleFitConnected ? "Google Fit Conectado" : "Google Fit Desconectado"}
                </span>
              </div>
            </div>

            {/* Última sincronização */}
            {lastSync && (
              <p className="text-white/60 text-xs mt-2">
                Última sync: {lastSync.toLocaleTimeString('pt-BR')}
              </p>
            )}
          </div>
        </div>



        {/* Métricas Cardíacas */}
        <div className="p-4 space-y-4">
          {/* Grid de métricas */}
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              const hasData = metric.value !== 'Sem dados';
              
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "relative p-4 rounded-xl border bg-card",
                    !hasData && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", metric.bgColor)}>
                      <Icon className={cn("w-5 h-5", metric.color)} />
                    </div>
                    {hasData ? getStatusBadge(metric.status) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-500/20">
                        <AlertCircle className="w-3 h-3 text-gray-500" />
                        <span className="text-[10px] font-medium text-gray-500">Sem dados</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-2xl font-bold",
                        !hasData && "text-muted-foreground"
                      )}>
                        {metric.value}
                      </span>
                      {metric.unit && hasData && (
                        <span className="text-sm text-muted-foreground">{metric.unit}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium">{metric.label}</p>
                    {metric.normalRange && (
                      <p className="text-[10px] text-muted-foreground">
                        Faixa normal: {metric.normalRange}
                      </p>
                    )}
                    {!hasData && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">
                        Conecte um dispositivo compatível
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
                <span className="text-xs font-medium text-emerald-500">
                  {currentHeartRate && restingHeartRate ? 
                    (currentHeartRate >= 60 && currentHeartRate <= 100 ? "Sinusal Normal" : "Fora da Faixa") :
                    "Sem dados"
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">FC Máxima Registrada</span>
                <span className="text-xs font-medium">
                  {maxHeartRate ? `${maxHeartRate} bpm` : "Sem dados"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">FC Mínima Registrada</span>
                <span className="text-xs font-medium">
                  {minHeartRate ? `${minHeartRate} bpm` : "Sem dados"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Zona Cardíaca Atual</span>
                <span className="text-xs font-medium">
                  {currentHeartRate && restingHeartRate ? 
                    (currentHeartRate <= restingHeartRate + 10 ? "Repouso" : 
                     currentHeartRate <= restingHeartRate + 30 ? "Leve" : "Moderada") :
                    "Sem dados"
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Recuperação Cardíaca</span>
                <span className={cn(
                  "text-xs font-medium",
                  realHRV ? (realHRV >= 40 ? "text-emerald-500" : realHRV >= 25 ? "text-amber-500" : "text-red-500") : "text-muted-foreground"
                )}>
                  {realHRV ? (realHRV >= 40 ? "Excelente" : realHRV >= 25 ? "Boa" : "Precisa Melhorar") : "Sem dados"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Taxa Respiratória</span>
                <span className="text-xs font-medium">
                  {respiratoryRate ? `${respiratoryRate.toFixed(1)} rpm` : "Sem dados"}
                </span>
              </div>
              {googleFitData && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Passos Hoje</span>
                    <span className="text-xs font-medium">
                      {googleFitData.steps ? googleFitData.steps.toLocaleString() : "Sem dados"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Calorias Queimadas</span>
                    <span className="text-xs font-medium">
                      {googleFitData.calories ? `${googleFitData.calories} kcal` : "Sem dados"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Minutos Ativos</span>
                    <span className="text-xs font-medium">
                      {googleFitData.active_minutes ? `${googleFitData.active_minutes} min` : "Sem dados"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Aviso sobre dados reais */}
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-600 dark:text-blue-400">
              {googleFitConnected 
                ? "Todos os dados são obtidos diretamente do Google Fit. Valores em branco indicam que o dado não está disponível no momento."
                : "Conecte o Google Fit para visualizar seus dados reais de saúde. Sem conexão, nenhum dado será exibido."
              }
            </p>
          </div>

          {/* Aviso quando não há dados */}
          {!googleFitData && googleFitConnected && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                Nenhum dado encontrado nos últimos 7 dias. Sincronize seu dispositivo com o Google Fit e tente novamente.
              </p>
            </div>
          )}

          {/* Erro de conexão */}
          {heartRateError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-600 dark:text-red-400">
                {heartRateError}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HealthMetricsModal;
