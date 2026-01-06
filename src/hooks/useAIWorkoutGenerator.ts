// Hook para gerar treinos usando IA
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserAnswers {
  level: string;
  experience: string;
  time: string;
  frequency: string;
  location: string;
  goal: string;
  limitation: string;
  gender: string;
  bodyFocus: string;
  ageGroup: string;
  specialCondition: string;
}

interface WeekPlanItem {
  week: number;
  activities: string[];
  days: string;
}

interface AIWorkoutProgram {
  title: string;
  subtitle: string;
  duration: string;
  frequency: string;
  time: string;
  description: string;
  weekPlan: WeekPlanItem[];
}

export const useAIWorkoutGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = async (answers: UserAnswers): Promise<AIWorkoutProgram | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🤖 Iniciando geração de treino com IA...', answers);

      const { data, error: fnError } = await supabase.functions.invoke('generate-ai-workout', {
        body: { answers }
      });

      if (fnError) {
        console.error('Erro na edge function:', fnError);
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar treino');
      }

      console.log('✅ Treino gerado com sucesso:', data.program?.title);
      
      if (data.tokensUsed) {
        console.log(`📊 Tokens utilizados: ${data.tokensUsed}`);
      }

      return data.program as AIWorkoutProgram;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao gerar treino:', errorMessage);
      setError(errorMessage);
      
      // Mostrar toast com erro amigável
      if (errorMessage.includes('Rate limit')) {
        toast.error('Muitas requisições. Aguarde um momento e tente novamente.');
      } else if (errorMessage.includes('Créditos')) {
        toast.error('Serviço temporariamente indisponível.');
      } else {
        toast.error('Erro ao gerar treino. Usando programa padrão.');
      }
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateWorkout,
    isGenerating,
    error
  };
};
