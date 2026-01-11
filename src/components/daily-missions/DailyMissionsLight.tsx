import React, { useState, useCallback, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ChevronLeft, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { dailyQuestionsLight, getSectionTitleLight, mapWaterResponse, mapSleepResponse } from '@/data/daily-questions-light';
import { DailyQuestion } from '@/types/daily-missions';
import { MissionCompleteLightPage } from '@/components/daily-missions/MissionCompleteLightPage';
import { cn } from '@/lib/utils';

interface DailyMissionsLightProps {
  user: User | null;
}

export const DailyMissionsLight: React.FC<DailyMissionsLightProps> = ({ user }) => {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [streakDays, setStreakDays] = useState(1);

  const questions = dailyQuestionsLight;
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  // Verificar se já completou hoje
  useEffect(() => {
    if (!user) return;

    const checkTodaySession = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('daily_mission_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('is_completed', true)
        .maybeSingle();

      if (data) {
        setIsCompleted(true);
        setTotalPoints(data.total_points || 0);
        setStreakDays(data.streak_days || 1);
        
        // Carregar respostas
        const { data: responses } = await supabase
          .from('daily_responses')
          .select('question_id, answer')
          .eq('user_id', user.id)
          .eq('date', today);

        if (responses) {
          const answersMap: Record<string, string | number> = {};
          responses.forEach(r => {
            answersMap[r.question_id] = r.answer;
          });
          setAnswers(answersMap);
        }
      }
    };

    checkTodaySession();
  }, [user]);

  // Salvar resposta e avançar
  const handleAnswer = useCallback(async (answer: string | number) => {
    if (!user || !currentQuestion) return;

    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];

    // Atualizar estado local
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));

    try {
      // Salvar resposta (upsert para evitar duplicatas)
      await supabase
        .from('daily_responses')
        .upsert({
          user_id: user.id,
          date: today,
          section: currentQuestion.section,
          question_id: currentQuestion.id,
          answer: answer.toString(),
          points_earned: currentQuestion.points
        }, {
          onConflict: 'user_id,date,question_id'
        });

      // Salvar tracking específico
      await saveTracking(currentQuestion.tracking, answer, today);

      // Avançar ou completar
      if (currentIndex < questions.length - 1) {
        setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
      } else {
        await completeMission(today, { ...answers, [currentQuestion.id]: answer });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentQuestion, currentIndex, questions.length, answers]);

  // Salvar dados de tracking
  const saveTracking = async (trackingType: string | undefined, answer: string | number, today: string) => {
    if (!user || !trackingType) return;

    // Base data sempre com user_id e date
    const baseData = {
      user_id: user.id,
      date: today
    };

    let trackingData: typeof baseData & {
      mood_rating?: number;
      sleep_hours?: number;
      water_intake?: number;
      notes?: string;
    } = { ...baseData };

    switch (trackingType) {
      case 'mood_rating':
        trackingData.mood_rating = Number(answer);
        break;
      case 'sleep_quality':
        trackingData.sleep_hours = mapSleepResponse(Number(answer));
        break;
      case 'water_intake':
        trackingData.water_intake = mapWaterResponse(Number(answer));
        break;
      case 'physical_activity':
        trackingData.notes = answer === 'Sim' ? 'Fez atividade física' : 'Sem atividade física';
        break;
      default:
        trackingData.notes = `${trackingType}: ${answer}`;
    }

    await supabase
      .from('health_diary')
      .upsert(trackingData, { onConflict: 'user_id,date' });
  };

  // Completar missão
  const completeMission = async (today: string, finalAnswers: Record<string, string | number>) => {
    if (!user) return;

    const points = questions.reduce((sum, q) => 
      finalAnswers[q.id] !== undefined ? sum + q.points : sum, 0
    );

    // Calcular streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: yesterdaySession } = await supabase
      .from('daily_mission_sessions')
      .select('streak_days')
      .eq('user_id', user.id)
      .eq('date', yesterdayStr)
      .eq('is_completed', true)
      .maybeSingle();

    const newStreak = (yesterdaySession?.streak_days || 0) + 1;

    // Salvar sessão
    await supabase
      .from('daily_mission_sessions')
      .upsert({
        user_id: user.id,
        date: today,
        completed_sections: ['evening', 'habits', 'mindset'],
        total_points: points,
        is_completed: true,
        streak_days: newStreak
      }, {
        onConflict: 'user_id,date'
      });

    setTotalPoints(points);
    setStreakDays(newStreak);
    setIsCompleted(true);
  };

  // Voltar pergunta
  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Renderizar opções de escala
  const renderScale = (question: DailyQuestion) => (
    <div className="space-y-2.5">
      {question.scale?.labels?.map((label, index) => {
        const value = index + 1;
        const isSelected = answers[question.id] === value;
        const emoji = question.scale?.emojis?.[index];

        return (
          <motion.button
            key={value}
            onClick={() => handleAnswer(value)}
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
              "border-2 text-left group",
              isSelected
                ? "bg-primary/10 border-primary shadow-md shadow-primary/10 dark:bg-primary/20"
                : "bg-card border-border hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm"
            )}
          >
            <motion.span 
              className="text-3xl w-12 text-center"
              animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {emoji}
            </motion.span>
            <span className={cn(
              "flex-1 font-medium text-base transition-colors",
              isSelected ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
            )}>
              {label}
            </span>
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <CheckCircle className="h-6 w-6 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );

  // Renderizar Sim/Não
  const renderYesNo = () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        { value: 'Sim', emoji: '👍', label: 'Sim!', selectedClass: 'bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-500' },
        { value: 'Não', emoji: '👎', label: 'Não', selectedClass: 'bg-muted-foreground/80 text-white border-muted-foreground' }
      ].map(({ value, emoji, label, selectedClass }, index) => {
        const isSelected = answers[currentQuestion.id] === value;
        return (
          <motion.button
            key={value}
            onClick={() => handleAnswer(value)}
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-5 rounded-2xl font-semibold text-lg transition-all duration-300",
              "flex flex-col items-center gap-2 border-2",
              isSelected
                ? `${selectedClass} shadow-lg`
                : "bg-card border-border text-foreground/80 hover:border-muted-foreground/50 hover:shadow-sm"
            )}
          >
            <motion.span 
              className="text-4xl"
              animate={isSelected ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {emoji}
            </motion.span>
            <span>{label}</span>
          </motion.button>
        );
      })}
    </div>
  );

  // Renderizar múltipla escolha
  const renderMultipleChoice = (question: DailyQuestion) => (
    <div className="space-y-2.5">
      {question.options?.map((option, index) => {
        const isSelected = answers[question.id] === option;
        return (
          <motion.button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "w-full p-4 rounded-2xl transition-all duration-300",
              "border-2 text-left font-medium text-base group",
              isSelected
                ? "bg-primary/10 border-primary text-primary shadow-md shadow-primary/10 dark:bg-primary/20"
                : "bg-card border-border text-foreground/80 hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm"
            )}
          >
            <span className="flex items-center justify-between">
              <span className={cn(
                "transition-colors",
                !isSelected && "group-hover:text-foreground"
              )}>
                {option}
              </span>
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
          </motion.button>
        );
      })}
    </div>
  );

  // Tela de conclusão
  if (isCompleted) {
    return (
      <MissionCompleteLightPage
        answers={answers}
        totalPoints={totalPoints}
        questions={questions}
        streakDays={streakDays}
        userId={user?.id}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Heart className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Preparando seu check-in...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        {/* Header elegante */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.button
              onClick={goBack}
              disabled={currentIndex === 0}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "p-2.5 rounded-full transition-all duration-200",
                currentIndex === 0 
                  ? "opacity-0 pointer-events-none" 
                  : "opacity-100 bg-card hover:bg-muted shadow-sm hover:shadow border border-border"
              )}
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </motion.button>
            
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            
            <div className="w-10" />
          </div>

          {/* Barra de progresso animada */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Brilho */}
            <motion.div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '500%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </div>
        </motion.div>

        {/* Card da pergunta com animação */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-border shadow-xl bg-card rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                {/* Seção com ícone */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 mb-5"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {getSectionTitleLight(currentQuestion.section)}
                  </span>
                </motion.div>

                {/* Pergunta */}
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold text-foreground mb-8 leading-relaxed"
                >
                  {currentQuestion.question}
                </motion.h2>

                {/* Opções */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentQuestion.type === 'scale' && renderScale(currentQuestion)}
                  {currentQuestion.type === 'yes_no' && renderYesNo()}
                  {currentQuestion.type === 'multiple_choice' && renderMultipleChoice(currentQuestion)}
                </motion.div>

                {/* Loading elegante */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 flex items-center justify-center gap-2"
                    >
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-primary"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ 
                              duration: 0.6, 
                              repeat: Infinity, 
                              delay: i * 0.15 
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">Salvando...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Footer motivacional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {currentIndex === questions.length - 1 ? (
              <span className="flex items-center justify-center gap-1">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Última pergunta!
                <Sparkles className="h-4 w-4 text-amber-400" />
              </span>
            ) : (
              "Toque na opção que mais combina com você"
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
