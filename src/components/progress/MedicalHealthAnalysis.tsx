import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Heart, 
  Moon, 
  Activity,
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface GoogleFitData {
  date: string;
  steps?: number;
  calories_active?: number;
  active_minutes?: number;
  heart_rate_avg?: number;
  heart_rate_min?: number;
  heart_rate_max?: number;
  sleep_hours?: number;
  distance_km?: number;
  weight_kg?: number;
}

interface MedicalHealthAnalysisProps {
  data: GoogleFitData[];
  period: 'day' | 'week' | 'month';
  userGoals: {
    stepsGoal: number;
    sleepGoal: number;
    activeMinutesGoal: number;
    caloriesGoal: number;
    heartRateGoal?: number;
    weightGoal?: number;
  };
}

interface MedicalFinding {
  category: string;
  icon: React.ComponentType<any>;
  status: 'normal' | 'attention' | 'alert';
  title: string;
  description: string;
  recommendation?: string;
  value?: string;
  reference?: string;
}

export const MedicalHealthAnalysis: React.FC<MedicalHealthAnalysisProps> = ({
  data,
  period,
  userGoals
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-8 text-center">
          <Stethoscope className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">Nenhum dado disponível para análise avançada.</p>
        </CardContent>
      </Card>
    );
  }

  // Calcular métricas
  const avgSteps = data.reduce((acc, d) => acc + (d.steps || 0), 0) / data.length;
  const avgSleep = data.reduce((acc, d) => acc + (d.sleep_hours || 0), 0) / data.length;
  const avgActiveMinutes = data.reduce((acc, d) => acc + (d.active_minutes || 0), 0) / data.length;
  const hrData = data.filter(d => d.heart_rate_avg);
  const avgHeartRate = hrData.reduce((acc, d) => acc + (d.heart_rate_avg || 0), 0) / Math.max(hrData.length, 1);
  const minHeartRate = hrData.length > 0 ? Math.min(...hrData.map(d => d.heart_rate_min || d.heart_rate_avg || 999)) : 0;
  const maxHeartRate = hrData.length > 0 ? Math.max(...hrData.map(d => d.heart_rate_max || d.heart_rate_avg || 0)) : 0;

  // Gerar findings médicos
  const findings: MedicalFinding[] = [];

  // Análise de Atividade Física
  if (avgSteps >= 10000) {
    findings.push({
      category: 'Atividade Física',
      icon: Activity,
      status: 'normal',
      title: 'Nível de atividade excelente',
      description: `Média de ${Math.round(avgSteps).toLocaleString()} passos/dia atende às recomendações da OMS.`,
      value: `${Math.round(avgSteps).toLocaleString()} passos`,
      reference: 'Ref: OMS recomenda 10.000 passos/dia'
    });
  } else if (avgSteps >= 7500) {
    findings.push({
      category: 'Atividade Física',
      icon: Activity,
      status: 'normal',
      title: 'Atividade física adequada',
      description: `Média de ${Math.round(avgSteps).toLocaleString()} passos/dia. Próximo da meta ideal.`,
      recommendation: 'Adicione 2.500 passos extras para atingir o ideal.',
      value: `${Math.round(avgSteps).toLocaleString()} passos`,
      reference: 'Ref: OMS recomenda 10.000 passos/dia'
    });
  } else if (avgSteps >= 5000) {
    findings.push({
      category: 'Atividade Física',
      icon: Activity,
      status: 'attention',
      title: 'Atividade física moderada',
      description: `Média de ${Math.round(avgSteps).toLocaleString()} passos/dia está abaixo do recomendado.`,
      recommendation: 'Considere aumentar gradualmente sua atividade diária.',
      value: `${Math.round(avgSteps).toLocaleString()} passos`,
      reference: 'Ref: OMS recomenda 10.000 passos/dia'
    });
  } else {
    findings.push({
      category: 'Atividade Física',
      icon: Activity,
      status: 'alert',
      title: 'Sedentarismo detectado',
      description: `Média de ${Math.round(avgSteps).toLocaleString()} passos/dia indica baixa atividade física.`,
      recommendation: 'Inicie caminhadas curtas e aumente progressivamente.',
      value: `${Math.round(avgSteps).toLocaleString()} passos`,
      reference: 'Ref: OMS recomenda 10.000 passos/dia'
    });
  }

  // Análise de Sono
  if (avgSleep >= 7 && avgSleep <= 9) {
    findings.push({
      category: 'Qualidade do Sono',
      icon: Moon,
      status: 'normal',
      title: 'Duração de sono adequada',
      description: `Média de ${avgSleep.toFixed(1)} horas por noite está dentro da faixa recomendada.`,
      value: `${avgSleep.toFixed(1)}h`,
      reference: 'Ref: Adultos devem dormir 7-9h por noite'
    });
  } else if (avgSleep >= 6 && avgSleep < 7) {
    findings.push({
      category: 'Qualidade do Sono',
      icon: Moon,
      status: 'attention',
      title: 'Sono ligeiramente insuficiente',
      description: `Média de ${avgSleep.toFixed(1)} horas está um pouco abaixo do ideal.`,
      recommendation: 'Tente dormir 30-60 minutos mais cedo.',
      value: `${avgSleep.toFixed(1)}h`,
      reference: 'Ref: Adultos devem dormir 7-9h por noite'
    });
  } else if (avgSleep < 6) {
    findings.push({
      category: 'Qualidade do Sono',
      icon: Moon,
      status: 'alert',
      title: 'Privação de sono',
      description: `Média de ${avgSleep.toFixed(1)} horas pode afetar sua saúde e cognição.`,
      recommendation: 'Priorize o sono. Considere consultar um especialista.',
      value: `${avgSleep.toFixed(1)}h`,
      reference: 'Ref: Adultos devem dormir 7-9h por noite'
    });
  } else if (avgSleep > 9) {
    findings.push({
      category: 'Qualidade do Sono',
      icon: Moon,
      status: 'attention',
      title: 'Sono prolongado',
      description: `Média de ${avgSleep.toFixed(1)} horas é acima do típico.`,
      recommendation: 'Sono excessivo pode indicar outras condições. Monitore.',
      value: `${avgSleep.toFixed(1)}h`,
      reference: 'Ref: Adultos devem dormir 7-9h por noite'
    });
  }

  // Análise de Frequência Cardíaca
  if (avgHeartRate > 0) {
    if (avgHeartRate >= 60 && avgHeartRate <= 80) {
      findings.push({
        category: 'Saúde Cardiovascular',
        icon: Heart,
        status: 'normal',
        title: 'Frequência cardíaca de repouso excelente',
        description: `FC média de ${Math.round(avgHeartRate)} BPM indica boa condição cardiovascular.`,
        value: `${Math.round(avgHeartRate)} BPM`,
        reference: 'Ref: FC repouso normal: 60-100 BPM'
      });
    } else if (avgHeartRate > 80 && avgHeartRate <= 100) {
      findings.push({
        category: 'Saúde Cardiovascular',
        icon: Heart,
        status: 'normal',
        title: 'Frequência cardíaca normal',
        description: `FC média de ${Math.round(avgHeartRate)} BPM está dentro da faixa normal.`,
        recommendation: 'Exercícios aeróbicos podem ajudar a reduzir a FC de repouso.',
        value: `${Math.round(avgHeartRate)} BPM`,
        reference: 'Ref: FC repouso normal: 60-100 BPM'
      });
    } else if (avgHeartRate > 100) {
      findings.push({
        category: 'Saúde Cardiovascular',
        icon: Heart,
        status: 'alert',
        title: 'Frequência cardíaca elevada',
        description: `FC média de ${Math.round(avgHeartRate)} BPM está acima do normal.`,
        recommendation: 'Consulte um médico para avaliação cardiovascular.',
        value: `${Math.round(avgHeartRate)} BPM`,
        reference: 'Ref: FC repouso normal: 60-100 BPM'
      });
    } else if (avgHeartRate < 60 && avgHeartRate > 40) {
      findings.push({
        category: 'Saúde Cardiovascular',
        icon: Heart,
        status: 'normal',
        title: 'Bradicardia (FC baixa)',
        description: `FC média de ${Math.round(avgHeartRate)} BPM - comum em atletas.`,
        value: `${Math.round(avgHeartRate)} BPM`,
        reference: 'Ref: FC baixa é normal em pessoas muito ativas'
      });
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'attention': return <Info className="w-5 h-5 text-amber-600" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': 
        return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">Normal</Badge>;
      case 'attention': 
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">Atenção</Badge>;
      case 'alert': 
        return <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/20">Alerta</Badge>;
      default: 
        return <Badge variant="outline">—</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 p-1" />
        
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold">Análise Médica Profissional</span>
              <p className="text-sm text-muted-foreground font-normal">
                Avaliação baseada em {data.length} dia(s) de dados
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Aviso médico */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Esta análise é informativa e não substitui avaliação médica profissional. 
                Consulte sempre um profissional de saúde para diagnósticos e tratamentos.
              </span>
            </p>
          </div>

          {/* Findings */}
          <div className="space-y-3">
            {findings.map((finding, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${
                  finding.status === 'normal' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  finding.status === 'attention' ? 'bg-amber-500/5 border-amber-500/20' :
                  'bg-rose-500/5 border-rose-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(finding.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{finding.title}</span>
                        {getStatusBadge(finding.status)}
                      </div>
                      {finding.value && (
                        <span className="text-sm font-bold text-foreground">{finding.value}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{finding.description}</p>
                    {finding.recommendation && (
                      <p className="text-sm text-primary mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {finding.recommendation}
                      </p>
                    )}
                    {finding.reference && (
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">{finding.reference}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Variabilidade FC se disponível */}
          {hrData.length > 0 && minHeartRate > 0 && maxHeartRate > 0 && (
            <div className="p-4 rounded-xl bg-muted/50 border">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Variabilidade da Frequência Cardíaca
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">{Math.round(minHeartRate)}</p>
                  <p className="text-xs text-muted-foreground">FC Mínima</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">{Math.round(avgHeartRate)}</p>
                  <p className="text-xs text-muted-foreground">FC Média</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-rose-600">{Math.round(maxHeartRate)}</p>
                  <p className="text-xs text-muted-foreground">FC Máxima</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
