import React from 'react';
import { DrVitalDailyCard } from './cards/DrVitalDailyCard';
import { DrVitalLifeWheelCard } from './cards/DrVitalLifeWheelCard';
import { DrVitalSaboteursCard } from './cards/DrVitalSaboteursCard';
import { DrVitalHealthCard } from './cards/DrVitalHealthCard';

export interface DrVitalCardProps {
  userName: string;
  analysis: string;
  recommendation: string;
  totalPoints: number;
  streakDays: number;
  sessionTitle?: string;
}

export const getSessionTypeFromTitle = (title: string, type?: string): string => {
  const titleLower = title.toLowerCase();
  const typeLower = (type || '').toLowerCase();
  
  // Check type first
  if (typeLower.includes('life_wheel') || typeLower.includes('health_wheel')) {
    return 'life_wheel';
  }
  if (typeLower.includes('saboteur') || typeLower.includes('sabotador')) {
    return 'saboteurs';
  }
  if (typeLower.includes('anamnesis') || typeLower.includes('health') || typeLower.includes('anamnese')) {
    return 'health';
  }
  
  // Then check title
  if (titleLower.includes('roda') || titleLower.includes('wheel') || titleLower.includes('pilar')) {
    return 'life_wheel';
  }
  if (titleLower.includes('sabotador') || titleLower.includes('saboteur') || titleLower.includes('mental')) {
    return 'saboteurs';
  }
  if (titleLower.includes('saúde') || titleLower.includes('anamnese') || titleLower.includes('sintoma') || titleLower.includes('health')) {
    return 'health';
  }
  
  return 'daily';
};

export const DrVitalCardFactory: React.FC<DrVitalCardProps & { sessionType?: string }> = ({
  userName,
  analysis,
  recommendation,
  totalPoints,
  streakDays,
  sessionTitle,
  sessionType = 'daily'
}) => {
  const props = { userName, analysis, recommendation, totalPoints, streakDays, sessionTitle };
  
  switch (sessionType) {
    case 'life_wheel':
      return <DrVitalLifeWheelCard {...props} />;
    case 'saboteurs':
      return <DrVitalSaboteursCard {...props} />;
    case 'health':
      return <DrVitalHealthCard {...props} />;
    default:
      return <DrVitalDailyCard {...props} />;
  }
};

export const getPromptForSessionType = (sessionType: string): string => {
  const prompts: Record<string, string> = {
    life_wheel: `Você é Dr. Vital, especialista em equilíbrio de vida do Instituto dos Sonhos.
Analise as respostas da Roda da Vida do paciente considerando os 12 pilares:
1. Identifique áreas fortes (notas altas) e celebre
2. Identifique áreas de atenção (notas baixas) com empatia
3. Analise o EQUILÍBRIO geral entre as áreas
4. Sugira qual pilar deve ser priorizado para maior impacto

Use emojis como 🎯🌟💼❤️🧠🏃‍♂️💰🎨 para cada área.
Seja motivador e mostre que pequenas mudanças fazem grande diferença.`,

    saboteurs: `Você é Dr. Vital, especialista em inteligência emocional do Instituto dos Sonhos.
Analise os sabotadores mentais identificados nas respostas do paciente:
1. Identifique os 2-3 sabotadores mais presentes
2. Explique brevemente como eles afetam a vida do paciente
3. Mostre gatilhos comuns que ativam esses sabotadores
4. Dê estratégias práticas de superação

Use emojis como 🧠🎭⚡🛡️💪 para ilustrar.
Seja acolhedor - sabotadores são parte de ser humano, não defeitos.`,

    health: `Você é Dr. Vital, médico preventivo do Instituto dos Sonhos.
Analise o histórico de saúde do paciente considerando:
1. Fatores de risco identificados
2. Hábitos que impactam a saúde (positivos e negativos)
3. Sintomas ou condições relatadas
4. Medidas preventivas recomendadas

Use emojis como 💚🩺❤️💪🥗😴 para ilustrar.
Seja cuidadoso e empático - saúde é assunto sensível.
NÃO faça diagnósticos, apenas orientações gerais.`,

    daily: `Você é Dr. Vital, um médico carinhoso e motivador do Instituto dos Sonhos.
Analise as reflexões diárias do paciente considerando:
1. Padrões de sono e descanso
2. Níveis de energia e hidratação
3. Estado emocional e mental
4. Hábitos de autocuidado

Use emojis como 💧😴⚡🏃‍♂️🙏💚 para ilustrar.
Seja caloroso, use o nome do paciente, e surpreenda com insights úteis!`
  };

  return prompts[sessionType] || prompts.daily;
};
