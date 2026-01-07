import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, Trophy, Sparkles, Heart, Flame, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MissionCompletePageProps {
  answers: Record<string, string | number>;
  totalPoints: number;
  questions: Array<{
    id: string;
    question: string;
  }>;
  onContinue?: () => void;
  userId?: string;
  streakDays?: number;
}

export const MissionCompletePage: React.FC<MissionCompletePageProps> = ({
  answers,
  totalPoints,
  questions,
  userId,
  streakDays = 1,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const { toast } = useToast();

  const handleSendToWhatsApp = async () => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Usuário não identificado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingWhatsApp(true);

    try {
      // Verificar se usuário tem telefone cadastrado
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("phone, full_name")
        .eq("user_id", userId)
        .single();

      if (profileError || !profile?.phone) {
        toast({
          title: "Telefone não cadastrado",
          description: "Para receber a análise via WhatsApp, cadastre seu número em Configurações > Perfil.",
          variant: "destructive",
        });
        setIsSendingWhatsApp(false);
        return;
      }

      // Chamar edge function
      const { data, error } = await supabase.functions.invoke("whatsapp-habits-analysis", {
        body: {
          userId,
          answers,
          totalPoints,
          streakDays,
          questions,
        },
      });

      if (error) throw error;

       if (data?.success && data?.textSent) {
         toast({
           title: "Enviado no WhatsApp!",
           description: "Sua mensagem foi enviada para o seu número cadastrado.",
         });
       } else {
         throw new Error(data?.error || "Não foi possível enviar para o WhatsApp. Verifique seu número (com DDI) e tente novamente.");
       }
    } catch (error) {
      console.error("Erro ao enviar para WhatsApp:", error);
      toast({
        title: "Erro ao enviar",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-muted flex items-start justify-center px-3 py-6 relative overflow-hidden">
      {/* Partículas de celebração */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#F472B6'][i % 5],
                left: `${Math.random() * 100}%`,
                top: -20,
              }}
              animate={{
                y: ['0vh', '100vh'],
                rotate: [0, 360],
                opacity: [1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      <main className="w-full max-w-md space-y-4 relative z-10">
        {/* Header celebratório */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          aria-label="Missão Concluída" 
          className="space-y-3"
        >
          {/* Troféu animado */}
          <motion.div 
            className="flex justify-center"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-5 rounded-full shadow-2xl">
                <Trophy className="h-12 w-12 text-white drop-shadow-lg" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-2 h-5 w-5 text-amber-400 animate-pulse delay-150" />
            </div>
          </motion.div>

          {/* Cartão principal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-3xl px-5 py-5 text-white bg-gradient-mission shadow-2xl overflow-hidden"
          >
            {/* Efeito de brilho */}
            <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_50%)]" />
            <motion.div 
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />

            <div className="relative z-10 space-y-3 text-center">
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  🎉 Parabéns!
                </h1>
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  Você completou todas as reflexões de hoje!
                </p>
              </div>

              {/* Card de pontos */}
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className="rounded-2xl bg-white/20 border border-white/30 px-4 py-3 backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                    Pontos conquistados
                  </span>
                  <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                </div>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
                  className="text-4xl font-black leading-none block"
                >
                  +{totalPoints}
                </motion.span>
              </motion.div>

              {/* Métricas rápidas */}
              <div className="flex justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Flame className="h-4 w-4 text-orange-300" />
                  <span className="text-xs font-semibold">{questions.length} respostas</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/90">
                  <Heart className="h-4 w-4 text-pink-300" />
                  <span className="text-xs font-semibold">100% completo</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Resumo das respostas */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          aria-label="Resumo das suas respostas" 
          className="space-y-3"
        >
          <Card className="bg-card rounded-3xl shadow-xl border-none overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <h2 className="text-center text-base font-bold text-foreground flex items-center justify-center gap-2">
                <span className="text-lg">📋</span>
                Suas Respostas de Hoje
              </h2>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {questions.map((question, index) => (
                  <motion.article
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-start gap-3 rounded-2xl bg-muted/70 px-3 py-3 hover:bg-muted transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-mission text-xs font-bold text-primary-foreground shrink-0 shadow-md">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <h3 className="text-xs font-semibold leading-snug text-foreground">
                        {question.question}
                      </h3>
                      <Badge className="inline-flex max-w-full items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] px-3 py-1 font-medium border-0">
                        <CheckCircle className="h-3 w-3 mr-1.5 shrink-0" />
                        <span className="truncate">
                          {answers[question.id] || 'Não respondido'}
                        </span>
                      </Badge>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Mensagem motivacional final */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 px-4 py-4 text-center space-y-2 border border-primary/20"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <p className="text-sm font-bold text-foreground">
                    Missão Concluída!
                  </p>
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Você está construindo hábitos incríveis. Continue assim e volte amanhã para mais uma jornada de autoconhecimento! 💪
                </p>
              </motion.div>

              {/* Botão WhatsApp Dr. Vital */}
              {userId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    onClick={handleSendToWhatsApp}
                    disabled={isSendingWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                  >
                    {isSendingWhatsApp ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        📱 Receber via WhatsApp
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  );
};
