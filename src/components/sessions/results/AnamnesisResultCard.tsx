import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Heart, Activity, Droplets, Moon, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionResultData } from './SessionCompleteFactory';

interface AnamnesisResultCardProps {
  data: SessionResultData;
  config: {
    emoji: string;
    color: string;
    gradient: string;
  };
}

// Extrair métricas das respostas
const extractMetrics = (responses: Record<string, any>) => {
  const metrics = {
    imc: null as number | null,
    activityLevel: 'Não informado',
    sleepHours: null as number | null,
    waterIntake: null as number | null,
    riskFactors: [] as string[],
    strengths: [] as string[]
  };

  // Analisar respostas para extrair métricas
  Object.entries(responses).forEach(([key, value]) => {
    const keyLower = key.toLowerCase();
    const valueStr = String(value).toLowerCase();

    // IMC
    if (keyLower.includes('imc') || keyLower.includes('peso')) {
      const num = parseFloat(String(value));
      if (!isNaN(num) && num > 10 && num < 50) metrics.imc = num;
    }

    // Atividade física
    if (keyLower.includes('atividade') || keyLower.includes('exerc')) {
      if (valueStr.includes('sedent') || valueStr.includes('não')) {
        metrics.activityLevel = 'Sedentário';
        metrics.riskFactors.push('Sedentarismo');
      } else if (valueStr.includes('leve') || valueStr.includes('pouco')) {
        metrics.activityLevel = 'Leve';
      } else if (valueStr.includes('moder')) {
        metrics.activityLevel = 'Moderado';
        metrics.strengths.push('Atividade física regular');
      } else if (valueStr.includes('intens') || valueStr.includes('muito')) {
        metrics.activityLevel = 'Intenso';
        metrics.strengths.push('Atividade física intensa');
      }
    }

    // Sono
    if (keyLower.includes('sono') || keyLower.includes('dorm')) {
      const hours = parseFloat(String(value));
      if (!isNaN(hours) && hours > 0 && hours < 24) {
        metrics.sleepHours = hours;
        if (hours >= 7 && hours <= 9) {
          metrics.strengths.push('Sono adequado');
        } else {
          metrics.riskFactors.push('Sono inadequado');
        }
      }
    }

    // Água
    if (keyLower.includes('água') || keyLower.includes('hidrat') || keyLower.includes('litro')) {
      const liters = parseFloat(String(value));
      if (!isNaN(liters) && liters > 0 && liters < 10) {
        metrics.waterIntake = liters;
        if (liters >= 2) {
          metrics.strengths.push('Boa hidratação');
        } else {
          metrics.riskFactors.push('Baixa hidratação');
        }
      }
    }

    // Fatores de risco
    if (keyLower.includes('diabetes') && (valueStr.includes('sim') || valueStr.includes('yes'))) {
      metrics.riskFactors.push('Histórico familiar diabetes');
    }
    if (keyLower.includes('pressão') && (valueStr.includes('sim') || valueStr.includes('alta'))) {
      metrics.riskFactors.push('Pressão alta');
    }
    if (keyLower.includes('fuma') && (valueStr.includes('sim') || valueStr.includes('yes'))) {
      metrics.riskFactors.push('Tabagismo');
    }
    if (keyLower.includes('álcool') && (valueStr.includes('frequent') || valueStr.includes('muito'))) {
      metrics.riskFactors.push('Consumo de álcool');
    }
  });

  return metrics;
};

export const AnamnesisResultCard: React.FC<AnamnesisResultCardProps> = ({ data, config }) => {
  const metrics = extractMetrics(data.responses);
  const firstName = data.userName?.split(' ')[0] || 'Você';

  // Calcular score geral
  const calculateScore = () => {
    let score = 70; // Base
    score += metrics.strengths.length * 10;
    score -= metrics.riskFactors.length * 8;
    return Math.max(0, Math.min(100, score));
  };

  const overallScore = calculateScore();

  return (
    <Card className="border-0 shadow-xl bg-card overflow-hidden">
      {/* Header com gradiente */}
      <div className={cn("p-5 text-white bg-gradient-to-r", config.gradient)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Perfil de Saúde</h2>
            <p className="text-white/80 text-sm">{firstName}, aqui está seu resumo</p>
          </div>
          <div className="text-4xl">{config.emoji}</div>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Score Geral */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-4"
        >
          <div className="relative inline-block">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/30"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke={config.color}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 352' }}
                animate={{ strokeDasharray: `${(overallScore / 100) * 352} 352` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-bold text-foreground"
                >
                  {overallScore}%
                </motion.span>
                <p className="text-xs text-muted-foreground">Score Geral</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-4 gap-2">
          <MetricBox
            icon={<Activity className="w-4 h-4" />}
            label="IMC"
            value={metrics.imc ? metrics.imc.toFixed(1) : '--'}
            color="text-blue-500"
            delay={0.3}
          />
          <MetricBox
            icon={<TrendingUp className="w-4 h-4" />}
            label="Atividade"
            value={metrics.activityLevel.substring(0, 3)}
            color="text-orange-500"
            delay={0.4}
          />
          <MetricBox
            icon={<Moon className="w-4 h-4" />}
            label="Sono"
            value={metrics.sleepHours ? `${metrics.sleepHours}h` : '--'}
            color="text-indigo-500"
            delay={0.5}
          />
          <MetricBox
            icon={<Droplets className="w-4 h-4" />}
            label="Água"
            value={metrics.waterIntake ? `${metrics.waterIntake}L` : '--'}
            color="text-cyan-500"
            delay={0.6}
          />
        </div>

        {/* Pontos de Atenção */}
        {metrics.riskFactors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-semibold text-red-700 dark:text-red-400 text-sm">
                Pontos de Atenção
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metrics.riskFactors.map((factor, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs"
                >
                  {factor}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pontos Fortes */}
        {metrics.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-green-700 dark:text-green-400 text-sm">
                Pontos Fortes
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metrics.strengths.map((strength, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs"
                >
                  {strength}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mensagem Motivacional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center p-4 rounded-xl bg-muted/50"
        >
          <p className="text-sm text-muted-foreground">
            {overallScore >= 80
              ? '🌟 Excelente! Continue cuidando da sua saúde assim!'
              : overallScore >= 60
              ? '💪 Bom trabalho! Pequenas melhorias farão grande diferença.'
              : '🌱 Cada passo conta! Vamos juntos melhorar sua saúde.'}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};

// Componente auxiliar para métricas
const MetricBox = ({
  icon,
  label,
  value,
  color,
  delay
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="text-center p-3 rounded-xl bg-muted/50"
  >
    <div className={cn("mx-auto mb-1", color)}>{icon}</div>
    <div className="text-lg font-bold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </motion.div>
);
