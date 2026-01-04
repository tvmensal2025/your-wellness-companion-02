import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Moon, 
  Zap,
  Target,
  Award,
  AlertTriangle,
  CheckCircle
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

interface HealthExecutiveSummaryProps {
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

export const HealthExecutiveSummary: React.FC<HealthExecutiveSummaryProps> = ({
  data,
  period,
  userGoals
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-8 text-center">
          <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado.</p>
        </CardContent>
      </Card>
    );
  }

  // Calcular métricas agregadas
  const totalSteps = data.reduce((acc, d) => acc + (d.steps || 0), 0);
  const totalCalories = data.reduce((acc, d) => acc + (d.calories_active || 0), 0);
  const totalActiveMinutes = data.reduce((acc, d) => acc + (d.active_minutes || 0), 0);
  const avgSleepHours = data.reduce((acc, d) => acc + (d.sleep_hours || 0), 0) / Math.max(data.length, 1);
  const avgHeartRate = data.filter(d => d.heart_rate_avg).reduce((acc, d) => acc + (d.heart_rate_avg || 0), 0) / Math.max(data.filter(d => d.heart_rate_avg).length, 1);

  // Calcular score de saúde
  const calculateHealthScore = () => {
    let score = 50;
    
    // Pontuação por passos (até +20)
    const stepsRatio = totalSteps / (userGoals.stepsGoal * data.length);
    score += Math.min(stepsRatio * 20, 20);
    
    // Pontuação por sono (até +15)
    if (avgSleepHours >= 7 && avgSleepHours <= 9) {
      score += 15;
    } else if (avgSleepHours >= 6) {
      score += 8;
    }
    
    // Pontuação por minutos ativos (até +10)
    const activeRatio = totalActiveMinutes / (userGoals.activeMinutesGoal * data.length);
    score += Math.min(activeRatio * 10, 10);
    
    // Pontuação por frequência cardíaca (até +5)
    if (avgHeartRate >= 60 && avgHeartRate <= 100) {
      score += 5;
    }
    
    return Math.min(Math.round(score), 100);
  };

  const healthScore = calculateHealthScore();

  // Determinar insights
  const insights = [];
  
  if (totalSteps >= userGoals.stepsGoal * data.length) {
    insights.push({ type: 'success', icon: CheckCircle, text: 'Meta de passos alcançada!' });
  } else if (totalSteps >= userGoals.stepsGoal * data.length * 0.7) {
    insights.push({ type: 'info', icon: Target, text: 'Você está próximo da meta de passos' });
  } else {
    insights.push({ type: 'warning', icon: AlertTriangle, text: 'Aumente sua atividade física' });
  }

  if (avgSleepHours >= 7) {
    insights.push({ type: 'success', icon: Moon, text: 'Sono adequado mantido' });
  } else if (avgSleepHours >= 6) {
    insights.push({ type: 'info', icon: Moon, text: 'Sono aceitável, pode melhorar' });
  } else {
    insights.push({ type: 'warning', icon: Moon, text: 'Sono insuficiente detectado' });
  }

  if (avgHeartRate > 0 && avgHeartRate <= 80) {
    insights.push({ type: 'success', icon: Heart, text: 'Frequência cardíaca excelente' });
  } else if (avgHeartRate > 80 && avgHeartRate <= 100) {
    insights.push({ type: 'info', icon: Heart, text: 'FC normal, continue monitorando' });
  }

  const periodLabel = period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês';

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    if (score >= 40) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10 p-1" />
        
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-emerald-600">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold">Resumo Executivo de Saúde</span>
                <p className="text-sm text-muted-foreground font-normal">{periodLabel}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl border ${getScoreBg(healthScore)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(healthScore)}`}>{healthScore}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Métricas principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-muted-foreground">Passos</span>
              </div>
              <p className="text-xl font-bold text-emerald-700">{totalSteps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round((totalSteps / (userGoals.stepsGoal * data.length)) * 100)}% da meta
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-muted-foreground">Calorias</span>
              </div>
              <p className="text-xl font-bold text-orange-700">{totalCalories.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">kcal queimadas</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-violet-600" />
                <span className="text-xs text-muted-foreground">Sono Médio</span>
              </div>
              <p className="text-xl font-bold text-violet-700">{avgSleepHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">por noite</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <span className="text-xs text-muted-foreground">FC Média</span>
              </div>
              <p className="text-xl font-bold text-rose-700">{Math.round(avgHeartRate) || '—'}</p>
              <p className="text-xs text-muted-foreground">BPM</p>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">INSIGHTS RÁPIDOS</h4>
            <div className="grid gap-2">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' :
                    insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                    'bg-blue-500/5 border-blue-500/20'
                  }`}
                >
                  <insight.icon className={`w-4 h-4 ${
                    insight.type === 'success' ? 'text-emerald-600' :
                    insight.type === 'warning' ? 'text-amber-600' :
                    'text-blue-600'
                  }`} />
                  <span className="text-sm">{insight.text}</span>
                  <Badge 
                    variant="outline" 
                    className={`ml-auto text-xs ${
                      insight.type === 'success' ? 'border-emerald-500/30 text-emerald-600' :
                      insight.type === 'warning' ? 'border-amber-500/30 text-amber-600' :
                      'border-blue-500/30 text-blue-600'
                    }`}
                  >
                    {insight.type === 'success' ? 'Ótimo' : insight.type === 'warning' ? 'Atenção' : 'Info'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
