import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Sparkles, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleFitMetrics {
  steps: number;
  calories: number;
  activeMinutes: number;
  sleepHours: number;
  heartRateAvg: number;
  distance: number;
}

interface AIInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation?: string;
}

interface AIHealthAnalysisProps {
  metrics: GoogleFitMetrics;
  period: 'day' | 'week' | 'month';
  onAnalysisComplete?: (analysis: any) => void;
}

export const AIHealthAnalysis: React.FC<AIHealthAnalysisProps> = ({
  metrics,
  period,
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    insights: AIInsight[];
    recommendations: string[];
    score: number;
  } | null>(null);
  const { toast } = useToast();

  const analyzeHealth = async () => {
    setIsAnalyzing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        toast({
          title: "Faça login",
          description: "Você precisa estar logado para usar a análise de IA",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('google-fit-ai-analysis', {
        body: { metrics, period },
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.error) throw response.error;

      if (response.data?.analysis) {
        setAnalysis(response.data.analysis);
        onAnalysisComplete?.(response.data.analysis);
        toast({
          title: "✨ Análise concluída!",
          description: "Insights de saúde gerados com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro na análise de IA:', error);
      
      // Fallback: gerar análise local
      const localAnalysis = generateLocalAnalysis(metrics, period);
      setAnalysis(localAnalysis);
      onAnalysisComplete?.(localAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateLocalAnalysis = (metrics: GoogleFitMetrics, period: string) => {
    const insights: AIInsight[] = [];
    let score = 70;

    // Análise de passos
    if (metrics.steps >= 10000) {
      insights.push({
        type: 'success',
        title: '🏃 Excelente atividade física!',
        description: `${metrics.steps.toLocaleString()} passos ${period === 'day' ? 'hoje' : 'no período'}. Você superou a meta recomendada!`,
        recommendation: 'Continue mantendo esse ritmo. Considere variar os exercícios.'
      });
      score += 10;
    } else if (metrics.steps >= 7000) {
      insights.push({
        type: 'info',
        title: '👣 Bom progresso nos passos',
        description: `${metrics.steps.toLocaleString()} passos. Você está próximo da meta de 10.000!`,
        recommendation: 'Tente adicionar uma caminhada extra de 15 minutos.'
      });
      score += 5;
    } else {
      insights.push({
        type: 'warning',
        title: '⚠️ Atividade abaixo do ideal',
        description: `${metrics.steps.toLocaleString()} passos. A OMS recomenda 10.000 passos diários.`,
        recommendation: 'Comece com metas menores: 2.000 passos extras por dia.'
      });
      score -= 5;
    }

    // Análise de sono
    if (metrics.sleepHours >= 7 && metrics.sleepHours <= 9) {
      insights.push({
        type: 'success',
        title: '😴 Sono adequado',
        description: `${metrics.sleepHours.toFixed(1)}h de sono. Dentro da faixa recomendada!`,
        recommendation: 'Mantenha horários regulares para dormir e acordar.'
      });
      score += 10;
    } else if (metrics.sleepHours < 6) {
      insights.push({
        type: 'warning',
        title: '😰 Sono insuficiente',
        description: `${metrics.sleepHours.toFixed(1)}h de sono. Adultos precisam de 7-9 horas.`,
        recommendation: 'Priorize o sono: evite telas 1h antes de dormir.'
      });
      score -= 10;
    }

    // Análise de frequência cardíaca
    if (metrics.heartRateAvg > 0) {
      if (metrics.heartRateAvg >= 60 && metrics.heartRateAvg <= 100) {
        insights.push({
          type: 'success',
          title: '❤️ Frequência cardíaca normal',
          description: `${metrics.heartRateAvg} BPM média. Dentro da faixa saudável!`
        });
        score += 5;
      } else if (metrics.heartRateAvg > 100) {
        insights.push({
          type: 'warning',
          title: '⚠️ FC elevada',
          description: `${metrics.heartRateAvg} BPM. Considere técnicas de relaxamento.`,
          recommendation: 'Pratique respiração profunda e reduza cafeína.'
        });
        score -= 5;
      }
    }

    // Análise de calorias
    if (metrics.calories >= 300) {
      insights.push({
        type: 'success',
        title: '🔥 Boa queima calórica',
        description: `${metrics.calories.toLocaleString()} kcal ativas queimadas!`
      });
      score += 5;
    }

    // Limitar score entre 0 e 100
    score = Math.max(0, Math.min(100, score));

    const recommendations = [
      'Mantenha uma rotina de exercícios consistente',
      'Beba pelo menos 2L de água por dia',
      'Faça pausas para alongamento a cada 2 horas'
    ];

    if (metrics.sleepHours < 7) {
      recommendations.unshift('Priorize melhorar a qualidade do sono');
    }
    if (metrics.steps < 8000) {
      recommendations.unshift('Aumente gradualmente sua atividade diária');
    }

    const periodLabel = period === 'day' ? 'hoje' : period === 'week' ? 'esta semana' : 'este mês';

    return {
      summary: `Baseado nos seus dados de ${periodLabel}, seu score de saúde é ${score}/100. ${
        score >= 80 ? 'Você está no caminho certo!' : 
        score >= 60 ? 'Há oportunidades de melhoria.' : 
        'Foque em desenvolver hábitos mais saudáveis.'
      }`,
      insights,
      recommendations: recommendations.slice(0, 4),
      score
    };
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-warning" />;
      default: return <TrendingUp className="w-5 h-5 text-primary" />;
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge className="bg-success/10 text-success border-success/20">Ótimo</Badge>;
      case 'warning': return <Badge className="bg-warning/10 text-warning border-warning/20">Atenção</Badge>;
      default: return <Badge className="bg-primary/10 text-primary border-primary/20">Info</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-xl overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-1" />
        
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-purple-600">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold">Análise de Saúde com IA</span>
                <p className="text-sm text-muted-foreground font-normal">
                  Sofia & Dr. Vital analisam seus dados
                </p>
              </div>
            </div>
            <Button
              onClick={analyzeHealth}
              disabled={isAnalyzing}
              variant={analysis ? "outline" : "default"}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analisando...
                </>
              ) : analysis ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Reanalisar
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analisar Agora
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {!analysis && !isAnalyzing && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Pronto para análise inteligente</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Nossa IA irá analisar seus dados de atividade, sono e frequência cardíaca 
                para gerar insights personalizados e recomendações.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center"
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-lg font-medium mb-2">Analisando seus dados...</h3>
              <p className="text-muted-foreground text-sm">
                Sofia e Dr. Vital estão processando suas métricas de saúde
              </p>
            </div>
          )}

          {analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10">
                <p className="text-sm leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Insights */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">ANÁLISES</h4>
                {analysis.insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-card border"
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{insight.title}</span>
                          {getInsightBadge(insight.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        {insight.recommendation && (
                          <p className="text-sm text-primary mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {insight.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">RECOMENDAÇÕES</h4>
                <div className="grid gap-2">
                  {analysis.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <span className="text-sm">{rec}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
