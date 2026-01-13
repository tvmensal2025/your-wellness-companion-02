import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CoachingReportData {
  overallScore: number;
  scoreLabel: string;
  executiveSummary: string;
  detailedAnalysis: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: Array<{
    priority: number;
    title: string;
    description: string;
    actionSteps: string[];
    timeframe: string;
  }>;
  nextSteps: string;
  motivationalMessage: string;
  metadata?: {
    reportId: string;
    generatedAt: string;
    sessionId: string;
    sessionType: string;
    sessionTitle: string;
    clientName: string;
    coachName: string;
    coachTitle: string;
  };
}

interface GenerateReportParams {
  userId: string;
  sessionId: string;
  sessionType: string;
  sessionTitle: string;
  responses: Record<string, any>;
  questions?: Array<{ id: string; question: string }>;
}

interface UseCoachingReportReturn {
  report: CoachingReportData | null;
  isLoading: boolean;
  error: string | null;
  generateReport: (params: GenerateReportParams) => Promise<CoachingReportData | null>;
  fetchCachedReport: (userId: string, sessionId: string) => Promise<CoachingReportData | null>;
}

export const useCoachingReport = (): UseCoachingReportReturn => {
  const [report, setReport] = useState<CoachingReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar relatório em cache (já gerado anteriormente)
  const fetchCachedReport = useCallback(async (
    userId: string, 
    sessionId: string
  ): Promise<CoachingReportData | null> => {
    try {
      const { data, error: fetchError } = await (supabase
        .from('coaching_reports' as any)
        .select('report_data')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .single() as unknown as Promise<{ data: { report_data: CoachingReportData } | null; error: any }>);

      if (fetchError || !data) {
        return null;
      }

      const cachedReport = data.report_data as CoachingReportData;
      setReport(cachedReport);
      return cachedReport;
    } catch {
      return null;
    }
  }, []);

  // Gerar novo relatório via edge function
  const generateReport = useCallback(async (
    params: GenerateReportParams
  ): Promise<CoachingReportData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Primeiro, verificar se já existe em cache
      const cached = await fetchCachedReport(params.userId, params.sessionId);
      if (cached) {
        setIsLoading(false);
        return cached;
      }

      // Chamar edge function para gerar
      const { data, error: fnError } = await supabase.functions.invoke(
        'generate-coaching-report',
        {
          body: params
        }
      );

      if (fnError) {
        throw new Error(fnError.message || 'Erro ao gerar relatório');
      }

      if (!data?.success || !data?.report) {
        throw new Error(data?.error || 'Resposta inválida da IA');
      }

      const generatedReport = data.report as CoachingReportData;
      setReport(generatedReport);
      return generatedReport;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao gerar relatório de coaching:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCachedReport]);

  return {
    report,
    isLoading,
    error,
    generateReport,
    fetchCachedReport
  };
};

// Fallback para quando a IA não está disponível
export const generateFallbackReport = (
  responses: Record<string, any>,
  sessionType: string,
  sessionTitle: string,
  userName: string
): CoachingReportData => {
  const firstName = userName?.split(' ')[0] || 'Cliente';
  
  // Calcular score básico baseado nas respostas
  let score = 70;
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  Object.entries(responses).forEach(([key, value]) => {
    const valueStr = String(value).toLowerCase();
    
    if (valueStr.includes('sim') || valueStr.includes('ótimo') || valueStr.includes('excelente')) {
      score += 3;
      if (key.includes('exerc')) strengths.push('Prática regular de atividade física');
      if (key.includes('sono')) strengths.push('Qualidade de sono adequada');
      if (key.includes('água')) strengths.push('Boa hidratação');
    }
    
    if (valueStr.includes('não') || valueStr.includes('ruim') || valueStr.includes('nunca')) {
      score -= 5;
      if (key.includes('exerc')) improvements.push('Aumentar atividade física');
      if (key.includes('sono')) improvements.push('Melhorar qualidade do sono');
    }
  });

  score = Math.max(30, Math.min(100, score));

  return {
    overallScore: score,
    scoreLabel: score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : 'Atenção Necessária',
    executiveSummary: `${firstName}, sua avaliação "${sessionTitle}" foi concluída com sucesso. Identificamos pontos importantes para seu desenvolvimento.`,
    detailedAnalysis: `Com base nas suas respostas, podemos observar um perfil ${score >= 70 ? 'positivo' : 'com oportunidades de melhoria'} em relação aos aspectos avaliados. Continue monitorando seus hábitos e buscando evolução constante.`,
    strengths: strengths.length > 0 ? strengths : ['Comprometimento com autoconhecimento', 'Disposição para mudança'],
    areasForImprovement: improvements.length > 0 ? improvements : ['Manter consistência nos hábitos'],
    recommendations: [{
      priority: 1,
      title: 'Acompanhamento Contínuo',
      description: 'Continue realizando suas avaliações regularmente para acompanhar sua evolução.',
      actionSteps: ['Agende próxima sessão em 30 dias', 'Revise suas metas semanalmente'],
      timeframe: '30 dias'
    }],
    nextSteps: 'Agende uma sessão de acompanhamento para avaliar seu progresso e ajustar suas metas.',
    motivationalMessage: `${firstName}, você está no caminho certo! Cada passo conta na sua jornada de bem-estar. 💪`
  };
};
