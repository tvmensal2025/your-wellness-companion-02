import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseHistoryItem {
  id: string;
  exercise_name: string;
  exercise_type: string;
  sets_completed: number;
  reps_completed: number;
  duration_seconds: number;
  calories_burned: number;
  difficulty_level: string;
  completed_at: string;
}

interface ExerciseAnalysis {
  totalExercises: number;
  totalCalories: number;
  totalDuration: number;
  favoriteExerciseType: string;
  averageDifficulty: string;
  weeklyFrequency: number;
  progressTrend: 'improving' | 'stable' | 'declining';
  suggestions: string[];
}

export const useExerciseAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar histórico de exercícios do usuário
  const getExerciseHistory = async (userId: string, days: number = 30): Promise<ExerciseHistoryItem[]> => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('user_exercise_history')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    return data || [];
  };

  // Analisar adesão ao programa de exercícios
  const analyzeAdherence = async (userId: string, programData: any): Promise<ExerciseAnalysis | null> => {
    setLoading(true);
    try {
      const history = await getExerciseHistory(userId, 30);
      
      if (history.length === 0) {
        return {
          totalExercises: 0,
          totalCalories: 0,
          totalDuration: 0,
          favoriteExerciseType: 'Nenhum',
          averageDifficulty: 'N/A',
          weeklyFrequency: 0,
          progressTrend: 'stable',
          suggestions: [
            'Comece seu primeiro treino hoje!',
            'Defina uma meta semanal de exercícios',
            'Escolha exercícios que você gosta'
          ]
        };
      }

      // Calcular métricas
      const totalCalories = history.reduce((sum, ex) => sum + (ex.calories_burned || 0), 0);
      const totalDuration = history.reduce((sum, ex) => sum + (ex.duration_seconds || 0), 0);
      
      // Tipo de exercício favorito
      const typeCount: Record<string, number> = {};
      history.forEach(ex => {
        const type = ex.exercise_type || 'general';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      const favoriteType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general';

      // Dificuldade média
      const difficultyMap: Record<string, number> = { facil: 1, ok: 2, dificil: 3 };
      const avgDiff = history.reduce((sum, ex) => sum + (difficultyMap[ex.difficulty_level] || 2), 0) / history.length;
      const averageDifficulty = avgDiff < 1.5 ? 'Fácil' : avgDiff < 2.5 ? 'Moderada' : 'Intensa';

      // Frequência semanal
      const uniqueDays = new Set(history.map(ex => ex.completed_at.split('T')[0]));
      const weeklyFrequency = Math.round((uniqueDays.size / 30) * 7);

      // Tendência de progresso (comparar primeiras 2 semanas vs últimas 2 semanas)
      const midPoint = Math.floor(history.length / 2);
      const recentExercises = history.slice(0, midPoint).length;
      const olderExercises = history.slice(midPoint).length;
      const progressTrend = recentExercises > olderExercises ? 'improving' : 
                           recentExercises < olderExercises ? 'declining' : 'stable';

      // Gerar sugestões baseadas na análise
      const suggestions: string[] = [];
      if (weeklyFrequency < 3) {
        suggestions.push('Tente aumentar para 3-4 treinos por semana');
      }
      if (avgDiff < 1.5) {
        suggestions.push('Experimente aumentar a intensidade gradualmente');
      }
      if (progressTrend === 'declining') {
        suggestions.push('Notamos uma redução nos treinos. Mantenha o foco!');
      }
      if (progressTrend === 'improving') {
        suggestions.push('Ótimo progresso! Continue assim!');
      }
      suggestions.push('Lembre-se de variar os tipos de exercício');

      return {
        totalExercises: history.length,
        totalCalories,
        totalDuration,
        favoriteExerciseType: favoriteType,
        averageDifficulty,
        weeklyFrequency,
        progressTrend,
        suggestions
      };
    } catch (error) {
      console.error('Erro na análise:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Analisar progresso geral
  const analyzeProgress = async (userId: string) => {
    const analysis = await analyzeAdherence(userId, null);
    
    if (!analysis || analysis.totalExercises === 0) {
      return {
        message: "Comece seus treinos para ver sua análise de progresso!",
        suggestions: [
          "Faça seu primeiro treino hoje",
          "Defina metas realistas",
          "Comece com exercícios leves"
        ]
      };
    }

    const messages = {
      improving: `Excelente! Você está progredindo muito bem com ${analysis.totalExercises} exercícios nos últimos 30 dias! 🎉`,
      stable: `Você está mantendo uma rotina estável com ${analysis.totalExercises} exercícios. Continue assim! 💪`,
      declining: `Notamos uma redução nos treinos. Vamos retomar o ritmo? Você consegue! 🔥`
    };

    return {
      message: messages[analysis.progressTrend],
      suggestions: analysis.suggestions,
      stats: {
        totalExercises: analysis.totalExercises,
        totalCalories: analysis.totalCalories,
        weeklyFrequency: analysis.weeklyFrequency,
        favoriteType: analysis.favoriteExerciseType
      }
    };
  };

  const getDailyMotivation = async (userId: string) => {
    // Buscar dados recentes para personalizar motivação
    const history = await getExerciseHistory(userId, 7);
    
    if (history.length === 0) {
      return "Hoje é o dia perfeito para começar! Faça seu primeiro treino e comece a transformar sua saúde. 🚀";
    }
    
    const lastExercise = history[0];
    const daysSinceLastExercise = Math.floor(
      (Date.now() - new Date(lastExercise.completed_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastExercise === 0) {
      return "Você já treinou hoje! Descanse bem e prepare-se para o próximo. 💚";
    }
    if (daysSinceLastExercise === 1) {
      return "Ótimo ritmo! Ontem você treinou, hoje é dia de continuar a evolução! 💪";
    }
    if (daysSinceLastExercise >= 3) {
      return `Faz ${daysSinceLastExercise} dias desde seu último treino. Bora retomar? Seu corpo agradece! 🔥`;
    }

    const motivations = [
      "Continue firme! Cada treino te aproxima do seu objetivo. 💪",
      "Você é mais forte do que pensa! Bora treinar! 🔥",
      "Consistência é a chave do sucesso. Você consegue! ⭐",
      "Hoje é dia de superar seus limites! Vamos lá! 🚀",
      "Cada passo conta. Orgulhe-se do seu progresso! 🏆"
    ];
    return motivations[Math.floor(Math.random() * motivations.length)];
  };

  const generateWeeklyTips = async (userId: string, programData: any) => {
    const analysis = await analyzeAdherence(userId, programData);
    
    if (!analysis) {
      return {
        tips: [
          "Comece com 3 treinos por semana",
          "Alterne entre cardio e força",
          "Não esqueça do aquecimento"
        ]
      };
    }

    const tips: string[] = [];
    
    if (analysis.weeklyFrequency < 3) {
      tips.push("Tente adicionar mais 1-2 treinos por semana");
    }
    if (analysis.favoriteExerciseType === 'cardio') {
      tips.push("Adicione exercícios de força para equilibrar");
    }
    if (analysis.favoriteExerciseType === 'forca') {
      tips.push("Inclua cardio para melhorar resistência");
    }
    if (analysis.averageDifficulty === 'Fácil') {
      tips.push("Aumente gradualmente a intensidade");
    }
    tips.push("Mantenha-se hidratado durante os treinos");
    tips.push("Respeite os dias de descanso");

    return { tips: tips.slice(0, 5) };
  };

  const suggestModifications = async (userId: string, programData: any, feedback: string) => {
    const analysis = await analyzeAdherence(userId, programData);
    
    const modifications: string[] = [];
    
    if (feedback === 'muito_dificil') {
      modifications.push("Reduza o número de séries em 20%");
      modifications.push("Aumente o tempo de descanso entre séries");
      modifications.push("Substitua exercícios complexos por versões mais simples");
    }
    if (feedback === 'muito_facil') {
      modifications.push("Aumente o peso ou resistência");
      modifications.push("Adicione mais repetições ou séries");
      modifications.push("Reduza o tempo de descanso");
    }
    if (feedback === 'falta_tempo') {
      modifications.push("Faça circuitos com menos descanso");
      modifications.push("Priorize exercícios compostos");
      modifications.push("Divida o treino em sessões menores");
    }

    return { modifications };
  };

  return {
    loading,
    getExerciseHistory,
    analyzeAdherence,
    analyzeProgress,
    getDailyMotivation,
    generateWeeklyTips,
    suggestModifications
  };
};

