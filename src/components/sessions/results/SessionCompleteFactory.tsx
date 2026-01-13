import React, { useRef, useState } from 'react';
import { AnamnesisResultCard } from './AnamnesisResultCard';
import { LifeWheelResultCard } from './LifeWheelResultCard';
import { SaboteursResultCard } from './SaboteursResultCard';
import { SymptomsResultCard } from './SymptomsResultCard';
import { DailyReflectionResultCard } from './DailyReflectionResultCard';
import { GenericResultCard } from './GenericResultCard';
import { AICoachingReportWrapper } from './AICoachingReportWrapper';
import { ShareToWhatsAppButton } from './ShareToWhatsAppButton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles } from 'lucide-react';

export interface SessionResultData {
  sessionId: string;
  sessionTitle: string;
  sessionType: string;
  userId: string;
  userName?: string;
  responses: Record<string, any>;
  score?: number;
  completedAt: string;
  streakDays?: number;
  totalPoints?: number;
}

interface SessionCompleteFactoryProps {
  data: SessionResultData;
  onContinue?: () => void;
  showWhatsAppShare?: boolean;
  defaultView?: 'gamified' | 'professional';
}

// Detectar tipo de sessão pelo título ou tipo
export const detectSessionType = (title: string, type?: string): string => {
  const titleLower = (title || '').toLowerCase();
  const typeLower = (type || '').toLowerCase();

  // Verificar tipo primeiro
  if (typeLower.includes('life_wheel') || typeLower.includes('roda_vida')) return 'life_wheel';
  if (typeLower.includes('health_wheel') || typeLower.includes('roda_saude')) return 'health_wheel';
  if (typeLower.includes('saboteur') || typeLower.includes('sabotador')) return 'saboteurs';
  if (typeLower.includes('symptoms') || typeLower.includes('sintoma')) return 'symptoms';
  if (typeLower.includes('anamnesis') || typeLower.includes('anamnese')) return 'anamnesis';
  if (typeLower.includes('daily') || typeLower.includes('diario')) return 'daily_reflection';
  if (typeLower.includes('goal') || typeLower.includes('meta')) return 'goal_setting';

  // Verificar título
  if (titleLower.includes('roda da vida') || titleLower.includes('life wheel')) return 'life_wheel';
  if (titleLower.includes('roda da saúde') || titleLower.includes('health wheel')) return 'health_wheel';
  if (titleLower.includes('sabotador') || titleLower.includes('mental')) return 'saboteurs';
  if (titleLower.includes('sintoma') || titleLower.includes('symptom')) return 'symptoms';
  if (titleLower.includes('anamnese') || titleLower.includes('saúde completa')) return 'anamnesis';
  if (titleLower.includes('reflexão') || titleLower.includes('diário')) return 'daily_reflection';
  if (titleLower.includes('objetivo') || titleLower.includes('meta')) return 'goal_setting';
  if (titleLower.includes('atividade física') || titleLower.includes('exercício')) return 'physical_activity';
  if (titleLower.includes('hidratação') || titleLower.includes('água')) return 'hydration';
  if (titleLower.includes('sono') || titleLower.includes('sleep')) return 'sleep';
  if (titleLower.includes('alimenta') || titleLower.includes('nutri')) return 'nutrition';
  if (titleLower.includes('motivação') || titleLower.includes('energia')) return 'motivation';
  if (titleLower.includes('rotina') || titleLower.includes('hábito')) return 'routine';

  return 'generic';
};

// Configuração de celebração por tipo
const celebrationConfig: Record<string, {
  emoji: string;
  color: string;
  gradient: string;
  confettiColors: string[];
  message: string;
}> = {
  life_wheel: {
    emoji: '🎯',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    confettiColors: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'],
    message: 'Sua Roda da Vida está mais equilibrada!'
  },
  health_wheel: {
    emoji: '🩺',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    confettiColors: ['#10b981', '#14b8a6', '#06b6d4', '#22c55e'],
    message: 'Avaliação de saúde completa!'
  },
  saboteurs: {
    emoji: '🧠',
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-violet-600',
    confettiColors: ['#8b5cf6', '#a855f7', '#c084fc', '#7c3aed'],
    message: 'Você conhece melhor sua mente agora!'
  },
  symptoms: {
    emoji: '❤️',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    confettiColors: ['#ec4899', '#f472b6', '#fb7185', '#f43f5e'],
    message: 'Mapa de sintomas registrado!'
  },
  anamnesis: {
    emoji: '📋',
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-600',
    confettiColors: ['#22c55e', '#10b981', '#14b8a6', '#34d399'],
    message: 'Perfil de saúde completo!'
  },
  daily_reflection: {
    emoji: '✨',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    confettiColors: ['#f59e0b', '#fbbf24', '#f97316', '#fb923c'],
    message: 'Reflexão do dia registrada!'
  },
  goal_setting: {
    emoji: '🎯',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    confettiColors: ['#06b6d4', '#0ea5e9', '#3b82f6', '#22d3ee'],
    message: 'Metas definidas com sucesso!'
  },
  physical_activity: {
    emoji: '🏃',
    color: '#f97316',
    gradient: 'from-orange-500 to-red-600',
    confettiColors: ['#f97316', '#ef4444', '#fb923c', '#f43f5e'],
    message: 'Avaliação física completa!'
  },
  hydration: {
    emoji: '💧',
    color: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600',
    confettiColors: ['#0ea5e9', '#3b82f6', '#38bdf8', '#60a5fa'],
    message: 'Hidratação monitorada!'
  },
  sleep: {
    emoji: '😴',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-purple-600',
    confettiColors: ['#6366f1', '#8b5cf6', '#818cf8', '#a78bfa'],
    message: 'Qualidade do sono avaliada!'
  },
  nutrition: {
    emoji: '🥗',
    color: '#84cc16',
    gradient: 'from-lime-500 to-green-600',
    confettiColors: ['#84cc16', '#22c55e', '#a3e635', '#4ade80'],
    message: 'Avaliação nutricional completa!'
  },
  motivation: {
    emoji: '⚡',
    color: '#eab308',
    gradient: 'from-yellow-500 to-amber-600',
    confettiColors: ['#eab308', '#f59e0b', '#facc15', '#fbbf24'],
    message: 'Nível de motivação registrado!'
  },
  routine: {
    emoji: '📅',
    color: '#64748b',
    gradient: 'from-slate-500 to-gray-600',
    confettiColors: ['#64748b', '#475569', '#94a3b8', '#6b7280'],
    message: 'Rotina mapeada com sucesso!'
  },
  generic: {
    emoji: '🎉',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    confettiColors: ['#10b981', '#22c55e', '#14b8a6', '#34d399'],
    message: 'Sessão concluída com sucesso!'
  }
};

// Componente de Confetti
const Confetti = ({ colors }: { colors: string[] }) => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-3 h-3 rounded-full"
        style={{
          backgroundColor: colors[i % colors.length],
          left: `${Math.random() * 100}%`,
          top: -20
        }}
        initial={{ y: 0, opacity: 1, rotate: 0 }}
        animate={{
          y: '100vh',
          opacity: 0,
          rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
        }}
        transition={{
          duration: 2.5 + Math.random(),
          delay: i * 0.05,
          ease: 'easeOut'
        }}
      />
    ))}
  </div>
);

export const SessionCompleteFactory: React.FC<SessionCompleteFactoryProps> = ({
  data,
  onContinue,
  showWhatsAppShare = true,
  defaultView = 'professional'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const professionalCardRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'gamified' | 'professional'>(defaultView);
  const sessionType = detectSessionType(data.sessionTitle, data.sessionType);
  const config = celebrationConfig[sessionType] || celebrationConfig.generic;

  // Renderizar card específico baseado no tipo (versão gamificada)
  const renderGamifiedCard = () => {
    const commonProps = {
      data,
      config
    };

    switch (sessionType) {
      case 'anamnesis':
        return <AnamnesisResultCard {...commonProps} />;
      case 'life_wheel':
      case 'health_wheel':
        return <LifeWheelResultCard {...commonProps} isHealthWheel={sessionType === 'health_wheel'} />;
      case 'saboteurs':
        return <SaboteursResultCard {...commonProps} />;
      case 'symptoms':
        return <SymptomsResultCard {...commonProps} />;
      case 'daily_reflection':
      case 'motivation':
      case 'routine':
        return <DailyReflectionResultCard {...commonProps} />;
      default:
        return <GenericResultCard {...commonProps} />;
    }
  };

  // Obter nome do coach baseado no tipo de sessão
  const getCoachInfo = () => {
    switch (sessionType) {
      case 'anamnesis':
      case 'symptoms':
      case 'health_wheel':
        return { name: 'Dr. Vital', title: 'Especialista em Saúde Integrativa' };
      case 'saboteurs':
        return { name: 'Dra. Mindset', title: 'Coach de Inteligência Emocional' };
      case 'life_wheel':
        return { name: 'Coach Equilíbrio', title: 'Especialista em Desenvolvimento Pessoal' };
      case 'nutrition':
        return { name: 'Sofia', title: 'Nutricionista Digital' };
      case 'physical_activity':
        return { name: 'Coach Fitness', title: 'Personal Trainer Digital' };
      default:
        return { name: 'Dr. Vital', title: 'Coach de Bem-Estar' };
    }
  };

  const coachInfo = getCoachInfo();

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      <Confetti colors={config.confettiColors} />

      <div className="max-w-lg mx-auto pt-6 relative z-10">
        {/* Header de Celebração */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center mb-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className={cn(
              "w-20 h-20 rounded-full mx-auto mb-4",
              "flex items-center justify-center",
              "bg-gradient-to-br shadow-lg",
              config.gradient
            )}
            style={{ boxShadow: `0 10px 40px ${config.color}40` }}
          >
            <span className="text-4xl">{config.emoji}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-foreground mb-1"
          >
            Sessão Completa! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground"
          >
            {config.message}
          </motion.p>
        </motion.div>

        {/* Toggle de Visualização */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex justify-center gap-2 mb-4"
        >
          <Button
            variant={viewMode === 'professional' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('professional')}
            className="rounded-full"
          >
            <FileText className="w-4 h-4 mr-2" />
            Relatório Profissional
          </Button>
          <Button
            variant={viewMode === 'gamified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('gamified')}
            className="rounded-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Card Gamificado
          </Button>
        </motion.div>

        {/* Card de Resultado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          {viewMode === 'professional' ? (
            <div ref={professionalCardRef} className="flex justify-center">
              <AICoachingReportWrapper 
                data={data} 
                coachName={coachInfo.name}
                coachTitle={coachInfo.title}
                autoGenerate={true}
              />
            </div>
          ) : (
            <div ref={cardRef}>
              {renderGamifiedCard()}
            </div>
          )}
        </motion.div>

        {/* Botões de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 space-y-3"
        >
          {showWhatsAppShare && (
            <ShareToWhatsAppButton
              userId={data.userId}
              sessionType={sessionType}
              sessionTitle={data.sessionTitle}
              resultData={data.responses}
              cardRef={viewMode === 'professional' ? professionalCardRef : cardRef}
            />
          )}

          {onContinue && (
            <button
              onClick={onContinue}
              className={cn(
                "w-full h-12 rounded-xl font-medium",
                "bg-muted hover:bg-muted/80",
                "text-foreground transition-colors"
              )}
            >
              Continuar
            </button>
          )}
        </motion.div>

        {/* Stats Footer */}
        {(data.totalPoints || data.streakDays) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex justify-center gap-6"
          >
            {data.totalPoints && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">+{data.totalPoints}</div>
                <div className="text-xs text-muted-foreground">pontos</div>
              </div>
            )}
            {data.streakDays && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">🔥 {data.streakDays}</div>
                <div className="text-xs text-muted-foreground">dias seguidos</div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
