import React, { useEffect, useState } from 'react';
import { CoachingReportCard } from './CoachingReportCard';
import { SessionResultData } from './SessionCompleteFactory';
import { useCoachingReport, generateFallbackReport, CoachingReportData } from '@/hooks/useCoachingReport';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AICoachingReportWrapperProps {
  data: SessionResultData;
  coachName?: string;
  coachTitle?: string;
  questions?: Array<{ id: string; question: string }>;
  autoGenerate?: boolean;
}

// Estados de loading criativos
const loadingMessages = [
  { emoji: '🧠', text: 'Analisando suas respostas...' },
  { emoji: '📊', text: 'Identificando padrões...' },
  { emoji: '✨', text: 'Gerando insights personalizados...' },
  { emoji: '📝', text: 'Preparando recomendações...' },
  { emoji: '🎯', text: 'Finalizando seu relatório...' }
];

export const AICoachingReportWrapper: React.FC<AICoachingReportWrapperProps> = ({
  data,
  coachName,
  coachTitle,
  questions,
  autoGenerate = true
}) => {
  const { report, isLoading, error, generateReport } = useCoachingReport();
  const [loadingStep, setLoadingStep] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackReport, setFallbackReport] = useState<CoachingReportData | null>(null);

  // Animação de loading
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-gerar relatório ao montar
  useEffect(() => {
    if (!autoGenerate) return;
    
    const generate = async () => {
      const result = await generateReport({
        userId: data.userId,
        sessionId: data.sessionId,
        sessionType: data.sessionType,
        sessionTitle: data.sessionTitle,
        responses: data.responses,
        questions
      });

      // Se falhou, usar fallback
      if (!result) {
        const fallback = generateFallbackReport(
          data.responses,
          data.sessionType,
          data.sessionTitle,
          data.userName || 'Cliente'
        );
        setFallbackReport(fallback);
        setUseFallback(true);
      }
    };

    generate();
  }, [autoGenerate, data, questions, generateReport]);

  // Retry manual
  const handleRetry = async () => {
    setUseFallback(false);
    setFallbackReport(null);
    
    const result = await generateReport({
      userId: data.userId,
      sessionId: data.sessionId,
      sessionType: data.sessionType,
      sessionTitle: data.sessionTitle,
      responses: data.responses,
      questions
    });

    if (!result) {
      const fallback = generateFallbackReport(
        data.responses,
        data.sessionType,
        data.sessionTitle,
        data.userName || 'Cliente'
      );
      setFallbackReport(fallback);
      setUseFallback(true);
    }
  };

  // Estado de Loading
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 px-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={cn(
            "w-20 h-20 rounded-2xl mb-6",
            "bg-gradient-to-br from-emerald-500 to-teal-600",
            "flex items-center justify-center shadow-lg"
          )}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={loadingStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <span className="text-3xl mb-2 block">
              {loadingMessages[loadingStep].emoji}
            </span>
            <p className="text-muted-foreground font-medium">
              {loadingMessages[loadingStep].text}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-1 mt-6">
          {loadingMessages.map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === loadingStep ? "bg-primary" : "bg-muted"
              )}
              animate={i === loadingStep ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Gerando relatório personalizado com IA...
        </p>
      </motion.div>
    );
  }

  // Estado de Erro (com opção de retry ou usar fallback)
  if (error && !useFallback && !fallbackReport) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 px-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        
        <h3 className="font-semibold text-foreground mb-2">
          Não foi possível gerar o relatório com IA
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          {error}
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const fallback = generateFallbackReport(
                data.responses,
                data.sessionType,
                data.sessionTitle,
                data.userName || 'Cliente'
              );
              setFallbackReport(fallback);
              setUseFallback(true);
            }}
          >
            Ver relatório básico
          </Button>
        </div>
      </motion.div>
    );
  }

  // Relatório gerado (IA ou fallback)
  const finalReport = report || fallbackReport;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {useFallback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
        >
          <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
            ⚡ Relatório gerado localmente (IA indisponível)
          </p>
        </motion.div>
      )}

      <CoachingReportCard
        data={data}
        coachName={coachName}
        coachTitle={coachTitle}
        aiReport={finalReport}
      />
    </motion.div>
  );
};

export default AICoachingReportWrapper;
