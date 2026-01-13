import React from 'react';
import { cn } from '@/lib/utils';
import { SessionResultData } from './SessionCompleteFactory';
import { Logo } from '@/components/ui/logo';
import { CoachingReportData } from '@/hooks/useCoachingReport';

interface CoachingReportCardProps {
  data: SessionResultData;
  coachName?: string;
  coachTitle?: string;
  // Dados gerados por IA (opcional - se não fornecido, usa extração estática)
  aiReport?: CoachingReportData | null;
}

// Componente de Relatório Profissional de Coaching
export const CoachingReportCard: React.FC<CoachingReportCardProps> = ({
  data,
  coachName = 'Dr. Vital',
  coachTitle = 'Coach de Bem-Estar',
  aiReport
}) => {
  const firstName = data.userName?.split(' ')[0] || 'Cliente';
  const fullName = data.userName || 'Cliente';
  const reportDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Usar dados da IA se disponíveis, senão extrair estaticamente
  const insights = aiReport 
    ? convertAIReportToInsights(aiReport)
    : extractCoachingInsights(data.responses, data.sessionType, data.sessionTitle);

  // Usar metadados da IA se disponíveis
  const reportNumber = aiReport?.metadata?.reportId || generateReportNumber();
  const finalCoachName = aiReport?.metadata?.coachName || coachName;
  const finalCoachTitle = aiReport?.metadata?.coachTitle || coachTitle;

  // Obter configuração visual baseada no tipo de sessão
  const visualConfig = getSessionVisualConfig(data.sessionType, data.sessionTitle);

  return (
    <div 
      className="w-[420px] bg-white text-gray-900 overflow-hidden rounded-xl shadow-2xl"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {/* Header Elegante */}
      <div className={cn(
        "relative text-white p-6",
        visualConfig.headerGradient
      )}>
        {/* Padrão decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 border border-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border border-white/20 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10">
          {/* Logo/Marca */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center p-1">
                <Logo className="h-6 w-auto" variant="icon" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-wider text-white/90">MAXNUTRITION</div>
                <div className="text-xs text-white/60">{visualConfig.subtitle}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60">Relatório Nº</div>
              <div className="text-sm font-mono text-white/90">#{reportNumber}</div>
            </div>
          </div>

          {/* Título do Relatório */}
          <div className="border-t border-white/20 pt-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{visualConfig.icon}</span>
              <h1 className="text-xl font-bold">{visualConfig.reportTitle}</h1>
            </div>
            <h2 className="text-white/80 text-sm">{data.sessionTitle}</h2>
          </div>
        </div>
      </div>

      {/* Informações do Cliente */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cliente</div>
            <div className="font-semibold text-slate-900">{fullName}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Data</div>
            <div className="font-semibold text-slate-900">{reportDate}</div>
          </div>
        </div>
      </div>

      {/* Corpo do Relatório */}
      <div className="p-6 space-y-6">
        {/* Score Principal */}
        <div className="text-center py-4">
          <div className="inline-block relative">
            <svg className="w-28 h-28" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="6"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke={visualConfig.scoreColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(insights.overallScore / 100) * 283} 283`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900">{insights.overallScore}</span>
              <span className="text-xs text-slate-500">de 100</span>
            </div>
          </div>
          <div className="mt-2">
            <span className={cn(
              "inline-block px-3 py-1 rounded-full text-xs font-semibold",
              insights.overallScore >= 80 ? "bg-emerald-100 text-emerald-700" :
              insights.overallScore >= 60 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            )}>
              {insights.overallScore >= 80 ? 'Excelente' :
               insights.overallScore >= 60 ? 'Bom' : 'Atenção Necessária'}
            </span>
          </div>
        </div>

        {/* Seção: Análise */}
        <ReportSection title="Análise do Coach" icon="📋" accentColor={visualConfig.accentColor}>
          <p className="text-sm text-slate-700 leading-relaxed">
            {insights.analysis}
          </p>
        </ReportSection>

        {/* Seção: Pontos Fortes */}
        {insights.strengths.length > 0 && (
          <ReportSection title="Pontos Fortes Identificados" icon="✨" accentColor={visualConfig.accentColor}>
            <ul className="space-y-2">
              {insights.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-500 mt-0.5">●</span>
                  <span className="text-slate-700">{strength}</span>
                </li>
              ))}
            </ul>
          </ReportSection>
        )}

        {/* Seção: Áreas de Desenvolvimento */}
        {insights.improvements.length > 0 && (
          <ReportSection title="Áreas de Desenvolvimento" icon="🎯" accentColor={visualConfig.accentColor}>
            <ul className="space-y-2">
              {insights.improvements.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 mt-0.5">●</span>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </ReportSection>
        )}

        {/* Seção: Recomendações */}
        <ReportSection title="Recomendações Personalizadas" icon="💡" accentColor={visualConfig.accentColor}>
          <div className="space-y-3">
            {insights.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                  style={{ backgroundColor: visualConfig.accentColor }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700">{rec}</p>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* Seção: Próximos Passos */}
        <ReportSection title="Próximos Passos" icon="🚀" accentColor={visualConfig.accentColor}>
          <p className="text-sm text-slate-700 leading-relaxed">
            {insights.nextSteps}
          </p>
        </ReportSection>
      </div>

      {/* Rodapé Profissional */}
      <div className={cn("px-6 py-4 text-white", visualConfig.footerGradient)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {visualConfig.coachIcon}
            </div>
            <div>
              <div className="font-semibold text-sm">{finalCoachName}</div>
              <div className="text-xs text-white/70">{finalCoachTitle}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/70">Assinatura Digital</div>
            <div className="text-white/90 text-xs font-mono">✓ Verificado</div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 py-3 bg-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Este relatório é confidencial e destinado exclusivamente ao cliente.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          MaxNutrition © 2026 • maxnutrition.com.br
        </p>
      </div>
    </div>
  );
};

// Componente de Seção do Relatório
const ReportSection = ({ 
  title, 
  icon, 
  children,
  accentColor = '#10b981'
}: { 
  title: string; 
  icon: string; 
  children: React.ReactNode;
  accentColor?: string;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
      <span className="text-lg">{icon}</span>
      <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">{title}</h3>
    </div>
    {children}
  </div>
);

// Configuração visual por tipo de sessão
const getSessionVisualConfig = (sessionType?: string, sessionTitle?: string) => {
  const titleLower = (sessionTitle || '').toLowerCase();
  const typeLower = (sessionType || '').toLowerCase();

  // Anamnese / Saúde Completa
  if (typeLower.includes('anamnesis') || typeLower.includes('anamnese') || 
      titleLower.includes('anamnese') || titleLower.includes('saúde completa')) {
    return {
      headerGradient: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700',
      footerGradient: 'bg-gradient-to-r from-emerald-700 to-teal-700',
      accentColor: '#10b981',
      scoreColor: '#10b981',
      icon: '📋',
      coachIcon: '🩺',
      reportTitle: 'Avaliação de Saúde',
      subtitle: 'Anamnese Completa'
    };
  }

  // Roda da Vida
  if (typeLower.includes('life_wheel') || typeLower.includes('roda_vida') ||
      titleLower.includes('roda da vida')) {
    return {
      headerGradient: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700',
      footerGradient: 'bg-gradient-to-r from-blue-700 to-indigo-700',
      accentColor: '#3b82f6',
      scoreColor: '#3b82f6',
      icon: '🎯',
      coachIcon: '🧭',
      reportTitle: 'Roda da Vida',
      subtitle: 'Equilíbrio Pessoal'
    };
  }

  // Roda da Saúde
  if (typeLower.includes('health_wheel') || typeLower.includes('roda_saude') ||
      titleLower.includes('roda da saúde')) {
    return {
      headerGradient: 'bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700',
      footerGradient: 'bg-gradient-to-r from-teal-700 to-emerald-700',
      accentColor: '#14b8a6',
      scoreColor: '#14b8a6',
      icon: '🩺',
      coachIcon: '💚',
      reportTitle: 'Roda da Saúde',
      subtitle: 'Avaliação Holística'
    };
  }

  // Sabotadores Mentais
  if (typeLower.includes('saboteur') || typeLower.includes('sabotador') ||
      titleLower.includes('sabotador') || titleLower.includes('mental')) {
    return {
      headerGradient: 'bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-700',
      footerGradient: 'bg-gradient-to-r from-purple-700 to-violet-700',
      accentColor: '#8b5cf6',
      scoreColor: '#8b5cf6',
      icon: '🧠',
      coachIcon: '🔮',
      reportTitle: 'Mapa Mental',
      subtitle: 'Sabotadores Internos'
    };
  }

  // Sintomas
  if (typeLower.includes('symptoms') || typeLower.includes('sintoma') ||
      titleLower.includes('sintoma')) {
    return {
      headerGradient: 'bg-gradient-to-br from-rose-600 via-pink-600 to-red-700',
      footerGradient: 'bg-gradient-to-r from-rose-700 to-pink-700',
      accentColor: '#ec4899',
      scoreColor: '#ec4899',
      icon: '❤️',
      coachIcon: '🏥',
      reportTitle: 'Mapa de Sintomas',
      subtitle: 'Avaliação Clínica'
    };
  }

  // Reflexão Diária
  if (typeLower.includes('daily') || typeLower.includes('diario') ||
      titleLower.includes('reflexão') || titleLower.includes('diário')) {
    return {
      headerGradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600',
      footerGradient: 'bg-gradient-to-r from-amber-600 to-orange-600',
      accentColor: '#f59e0b',
      scoreColor: '#f59e0b',
      icon: '✨',
      coachIcon: '🌟',
      reportTitle: 'Reflexão do Dia',
      subtitle: 'Autoconhecimento'
    };
  }

  // Nutrição
  if (typeLower.includes('nutrition') || typeLower.includes('nutri') ||
      titleLower.includes('alimenta') || titleLower.includes('nutri')) {
    return {
      headerGradient: 'bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600',
      footerGradient: 'bg-gradient-to-r from-lime-600 to-green-600',
      accentColor: '#84cc16',
      scoreColor: '#84cc16',
      icon: '🥗',
      coachIcon: '👩‍🍳',
      reportTitle: 'Avaliação Nutricional',
      subtitle: 'Hábitos Alimentares'
    };
  }

  // Atividade Física
  if (typeLower.includes('physical') || typeLower.includes('exerc') ||
      titleLower.includes('atividade física') || titleLower.includes('exercício')) {
    return {
      headerGradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-rose-600',
      footerGradient: 'bg-gradient-to-r from-orange-600 to-red-600',
      accentColor: '#f97316',
      scoreColor: '#f97316',
      icon: '🏃',
      coachIcon: '💪',
      reportTitle: 'Avaliação Física',
      subtitle: 'Performance & Movimento'
    };
  }

  // Sono
  if (typeLower.includes('sleep') || typeLower.includes('sono') ||
      titleLower.includes('sono') || titleLower.includes('dormir')) {
    return {
      headerGradient: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700',
      footerGradient: 'bg-gradient-to-r from-indigo-700 to-purple-700',
      accentColor: '#6366f1',
      scoreColor: '#6366f1',
      icon: '😴',
      coachIcon: '🌙',
      reportTitle: 'Qualidade do Sono',
      subtitle: 'Descanso & Recuperação'
    };
  }

  // Default
  return {
    headerGradient: 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900',
    footerGradient: 'bg-gradient-to-r from-slate-800 to-slate-900',
    accentColor: '#10b981',
    scoreColor: '#10b981',
    icon: '📊',
    coachIcon: '🩺',
    reportTitle: 'Relatório de Avaliação',
    subtitle: 'Coaching de Bem-Estar'
  };
};

// Gerar número do relatório
const generateReportNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${year}${month}-${random}`;
};

// Extrair insights de coaching das respostas
const extractCoachingInsights = (
  responses: Record<string, any>,
  sessionType?: string,
  sessionTitle?: string
): {
  overallScore: number;
  analysis: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  nextSteps: string;
} => {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];
  let score = 70;

  // Detectar contexto da sessão
  const titleLower = (sessionTitle || '').toLowerCase();
  const typeLower = (sessionType || '').toLowerCase();
  
  const isSaboteurs = typeLower.includes('saboteur') || titleLower.includes('sabotador');
  const isLifeWheel = typeLower.includes('life_wheel') || titleLower.includes('roda da vida');
  const isHealthWheel = typeLower.includes('health_wheel') || titleLower.includes('roda da saúde');
  const isAnamnesis = typeLower.includes('anamnesis') || titleLower.includes('anamnese');
  const isNutrition = typeLower.includes('nutrition') || titleLower.includes('nutri');
  const isSleep = typeLower.includes('sleep') || titleLower.includes('sono');
  const isPhysical = typeLower.includes('physical') || titleLower.includes('exercício');

  // Analisar respostas
  Object.entries(responses).forEach(([key, value]) => {
    const keyLower = key.toLowerCase();
    const valueStr = String(value).toLowerCase();

    // Detectar pontos positivos
    if (valueStr.includes('sim') || valueStr.includes('ótimo') || valueStr.includes('excelente') || 
        valueStr.includes('sempre') || valueStr.includes('muito bom')) {
      score += 3;
      
      if (keyLower.includes('exerc') || keyLower.includes('ativ')) {
        strengths.push('Prática regular de atividade física');
      } else if (keyLower.includes('sono') || keyLower.includes('dorm')) {
        strengths.push('Qualidade de sono adequada');
      } else if (keyLower.includes('água') || keyLower.includes('hidrat')) {
        strengths.push('Boa hidratação diária');
      } else if (keyLower.includes('aliment') || keyLower.includes('nutri')) {
        strengths.push('Alimentação equilibrada');
      } else if (keyLower.includes('stress') || keyLower.includes('calma')) {
        strengths.push('Bom gerenciamento do estresse');
      }
    }

    // Detectar pontos de melhoria
    if (valueStr.includes('não') || valueStr.includes('ruim') || valueStr.includes('nunca') ||
        valueStr.includes('raramente') || valueStr.includes('pouco')) {
      score -= 5;

      if (keyLower.includes('exerc') || keyLower.includes('ativ')) {
        improvements.push('Aumentar frequência de atividade física');
        recommendations.push('Comece com 15 minutos de caminhada diária e aumente gradualmente');
      } else if (keyLower.includes('sono')) {
        improvements.push('Melhorar qualidade do sono');
        recommendations.push('Estabeleça uma rotina de sono consistente, evitando telas 1h antes de dormir');
      } else if (keyLower.includes('água')) {
        improvements.push('Aumentar consumo de água');
        recommendations.push('Mantenha uma garrafa de água sempre por perto e defina lembretes');
      } else if (keyLower.includes('stress') || keyLower.includes('ansie')) {
        improvements.push('Gerenciamento do estresse');
        recommendations.push('Pratique técnicas de respiração por 5 minutos ao acordar e antes de dormir');
      }
    }

    // Análise numérica (para rodas da vida/saúde)
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      if (numValue >= 8) {
        score += 2;
      } else if (numValue <= 4) {
        score -= 3;
      }
    }
  });

  // Adicionar insights específicos por tipo de sessão
  if (isSaboteurs) {
    if (strengths.length === 0) {
      strengths.push('Autoconsciência sobre padrões mentais');
      strengths.push('Disposição para identificar sabotadores');
    }
    if (recommendations.length === 0) {
      recommendations.push('Pratique a técnica PQ (Positive Intelligence) quando identificar um sabotador');
      recommendations.push('Mantenha um diário de pensamentos para rastrear padrões');
    }
  }

  if (isLifeWheel || isHealthWheel) {
    if (strengths.length === 0) {
      strengths.push('Visão holística da própria vida');
      strengths.push('Capacidade de autoavaliação');
    }
    if (recommendations.length === 0) {
      recommendations.push('Foque nas 2 áreas com menor pontuação nas próximas 4 semanas');
      recommendations.push('Defina uma meta específica para cada área prioritária');
    }
  }

  // Garantir pelo menos alguns itens
  if (strengths.length === 0) {
    strengths.push('Comprometimento em realizar a avaliação');
    strengths.push('Disposição para autoconhecimento');
  }

  if (improvements.length === 0) {
    improvements.push('Manter consistência nos hábitos saudáveis');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue monitorando seus hábitos diariamente');
    recommendations.push('Agende uma nova avaliação em 30 dias para acompanhar sua evolução');
  }

  // Limitar score
  score = Math.max(30, Math.min(100, score));

  // Gerar análise baseada no score e tipo
  let analysis = '';
  if (isSaboteurs) {
    analysis = score >= 80
      ? `Excelente trabalho de autoconhecimento! Você demonstra grande consciência sobre seus padrões mentais e está no caminho certo para neutralizar seus sabotadores internos.`
      : score >= 60
      ? `Você está desenvolvendo uma boa consciência sobre seus sabotadores mentais. Identificamos alguns padrões que, quando trabalhados, podem liberar seu potencial máximo.`
      : `Esta avaliação revelou sabotadores importantes que estão impactando seu bem-estar. Com as técnicas certas, você pode transformar esses padrões em aliados.`;
  } else if (isLifeWheel || isHealthWheel) {
    analysis = score >= 80
      ? `Sua roda está bem equilibrada! Você demonstra harmonia entre as diferentes áreas da vida, o que é fundamental para o bem-estar integral.`
      : score >= 60
      ? `Sua avaliação mostra um bom equilíbrio geral, com algumas áreas que merecem mais atenção. Pequenos ajustes podem trazer grandes resultados.`
      : `Identificamos desequilíbrios significativos em algumas áreas. Vamos trabalhar juntos para restaurar a harmonia e melhorar sua qualidade de vida.`;
  } else {
    analysis = score >= 80
      ? `Parabéns! Sua avaliação demonstra um excelente nível de autocuidado e consciência sobre sua saúde. Você está no caminho certo para alcançar seus objetivos de bem-estar.`
      : score >= 60
      ? `Sua avaliação mostra um bom progresso em várias áreas. Identificamos oportunidades específicas de melhoria que, se trabalhadas, podem elevar significativamente sua qualidade de vida.`
      : `Esta avaliação revela áreas importantes que merecem atenção. Com as orientações corretas e seu comprometimento, podemos trabalhar juntos para transformar esses desafios em conquistas.`;
  }

  const nextSteps = score >= 80
    ? `Mantenha sua rotina atual e considere desafiar-se com novas metas. Agende uma sessão de acompanhamento em 45 dias para celebrarmos sua evolução.`
    : score >= 60
    ? `Foque nas 2-3 recomendações principais nas próximas 2 semanas. Agende uma sessão de acompanhamento em 30 dias para avaliarmos seu progresso.`
    : `Vamos começar com pequenas mudanças. Escolha UMA recomendação para implementar esta semana. Agende uma sessão de acompanhamento em 15 dias para suporte contínuo.`;

  return {
    overallScore: score,
    analysis,
    strengths: [...new Set(strengths)].slice(0, 4),
    improvements: [...new Set(improvements)].slice(0, 3),
    recommendations: [...new Set(recommendations)].slice(0, 3),
    nextSteps
  };
};

export default CoachingReportCard;

// Converter dados da IA para formato de insights do componente
const convertAIReportToInsights = (aiReport: CoachingReportData): {
  overallScore: number;
  analysis: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  nextSteps: string;
} => {
  return {
    overallScore: aiReport.overallScore,
    analysis: aiReport.detailedAnalysis || aiReport.executiveSummary,
    strengths: aiReport.strengths || [],
    improvements: aiReport.areasForImprovement || [],
    recommendations: aiReport.recommendations?.map(r => 
      typeof r === 'string' ? r : `${r.title}: ${r.description}`
    ) || [],
    nextSteps: aiReport.nextSteps || aiReport.motivationalMessage || ''
  };
};
