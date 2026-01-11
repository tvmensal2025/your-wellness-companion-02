import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Flame, Heart, ArrowRight, Sparkles, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyQuestion } from '@/types/daily-missions';
import { cn } from '@/lib/utils';

interface MissionCompleteLightPageProps {
  answers: Record<string, string | number>;
  totalPoints: number;
  questions: DailyQuestion[];
  streakDays: number;
  userId?: string;
}

// Confetti particles
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{ 
      backgroundColor: color,
      left: `${Math.random() * 100}%`,
      top: -10
    }}
    initial={{ y: 0, opacity: 1, rotate: 0 }}
    animate={{ 
      y: '100vh', 
      opacity: 0, 
      rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
    }}
    transition={{ 
      duration: 2.5 + Math.random(), 
      delay,
      ease: 'easeOut'
    }}
  />
);

export const MissionCompleteLightPage: React.FC<MissionCompleteLightPageProps> = ({
  answers,
  totalPoints,
  questions,
  streakDays,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const confettiColors = ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(30)].map((_, i) => (
              <ConfettiParticle 
                key={i} 
                delay={i * 0.05} 
                color={confettiColors[i % confettiColors.length]} 
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-lg mx-auto pt-6 relative z-10">
        {/* Header com celebração */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center mb-6"
        >
          {/* Ícone animado */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative inline-block mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <CheckCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            
            {/* Sparkles ao redor */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-400" />
              <Star className="absolute -bottom-1 -left-1 h-4 w-4 text-pink-400 fill-pink-400" />
            </motion.div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-foreground mb-1"
          >
            Missão Completa! 🎉
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground"
          >
            Você cuidou de você hoje
          </motion.p>
        </motion.div>

        {/* Card principal com stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <Card className="border border-border shadow-xl bg-card rounded-3xl overflow-hidden mb-4">
            <CardContent className="p-0">
              {/* Header colorido */}
              <div className="bg-primary p-5 text-primary-foreground">
                <div className="flex justify-around">
                  {/* Streak */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Flame className="h-6 w-6 text-amber-300" />
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-3xl font-bold"
                      >
                        {streakDays}
                      </motion.span>
                    </div>
                    <span className="text-xs text-primary-foreground/80 font-medium">
                      {streakDays === 1 ? 'dia' : 'dias seguidos'}
                    </span>
                  </motion.div>

                  {/* Divider */}
                  <div className="w-px bg-primary-foreground/20" />

                  {/* Pontos */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Trophy className="h-6 w-6 text-amber-300" />
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-3xl font-bold"
                      >
                        +{totalPoints}
                      </motion.span>
                    </div>
                    <span className="text-xs text-primary-foreground/80 font-medium">pontos</span>
                  </motion.div>

                  {/* Divider */}
                  <div className="w-px bg-primary-foreground/20" />

                  {/* Respostas */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring' }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Heart className="h-6 w-6 text-pink-300" />
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-3xl font-bold"
                      >
                        {questions.length}
                      </motion.span>
                    </div>
                    <span className="text-xs text-primary-foreground/80 font-medium">reflexões</span>
                  </motion.div>
                </div>
              </div>

              {/* Mensagem motivacional */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="p-5 text-center border-b border-border"
              >
                <p className="text-foreground font-medium">
                  {getMotivationalMessage(streakDays)}
                </p>
              </motion.div>

              {/* Toggle para ver respostas */}
              <div className="p-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">
                    {showDetails ? 'Ocultar respostas' : 'Ver suas respostas'}
                  </span>
                  <motion.div
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                  </motion.div>
                </button>

                {/* Respostas expandíveis */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-3">
                        {questions.map((question, index) => {
                          const answer = answers[question.id];
                          if (!answer) return null;

                          return (
                            <motion.div
                              key={question.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                            >
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-0.5">
                                  {question.question}
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                  {formatAnswer(answer, question)}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botão de continuar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-3"
        >
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className={cn(
              "w-full h-14 rounded-2xl font-semibold text-base",
              "bg-primary hover:bg-primary/90",
              "shadow-lg shadow-primary/30 transition-all duration-300",
              "hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
            )}
          >
            Continuar
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Volte amanhã para manter seu streak! 🔥
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Formatar resposta para exibição
function formatAnswer(answer: string | number, question: DailyQuestion): string {
  if (question.type === 'scale' && typeof answer === 'number') {
    const label = question.scale?.labels?.[answer - 1];
    const emoji = question.scale?.emojis?.[answer - 1];
    return emoji ? `${emoji} ${label}` : label || String(answer);
  }
  return String(answer);
}

// Mensagem motivacional baseada no streak
function getMotivationalMessage(streak: number): string {
  if (streak === 1) {
    return "Primeiro passo dado! Volte amanhã para manter o ritmo 💪";
  }
  if (streak < 7) {
    return `${streak} dias seguidos! Você está criando um hábito 🌱`;
  }
  if (streak < 30) {
    return `${streak} dias! Sua consistência é inspiradora ⭐`;
  }
  return `${streak} dias! Você é incrível! 🏆`;
}
