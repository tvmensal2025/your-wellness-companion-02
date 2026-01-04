import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import mascotImage from '@/assets/wellness-mascot.png';

interface ActivityStats {
  hasWeighedToday: boolean;
  hasExercisedToday: boolean;
  hasChatWithSofia: boolean;
  hasLoggedNutrition: boolean;
  streak: number;
}

const motivationalPhrases: Record<string, string[]> = {
  default: [
    "Cada pequeno passo conta! 💪",
    "Você é mais forte do que imagina!",
    "Hoje é um ótimo dia para cuidar de você!",
    "Continue assim, você está arrasando!"
  ],
  weight: [
    "Ótimo! Você registrou seu peso hoje! 🎯",
    "Acompanhar seu progresso é o primeiro passo!",
    "Parabéns por manter o controle! ⚖️"
  ],
  exercise: [
    "Exercício feito! Seu corpo agradece! 🏃",
    "Incrível! Você se movimentou hoje! 💪",
    "Atividade física concluída com sucesso!"
  ],
  nutrition: [
    "Alimentação registrada! Consciente e saudável! 🥗",
    "Ótimo controle nutricional hoje!",
    "Você está cuidando bem da sua alimentação!"
  ],
  chat: [
    "Que bom que conversou com a Sofia! 🤖",
    "Dúvidas esclarecidas, caminho mais claro!",
    "Conhecimento é poder! Continue aprendendo!"
  ],
  streak: [
    "🔥 {days} dias seguidos! Você é imparável!",
    "Sequência de {days} dias! Continue firme!",
    "Wow! {days} dias de dedicação!"
  ],
  morning: [
    "Bom dia! Pronto para mais um dia incrível? ☀️",
    "Manhã perfeita para novos começos!",
    "O sol nasceu e você também! Vamos lá!"
  ],
  afternoon: [
    "Boa tarde! Como está seu dia? 🌤️",
    "Metade do dia, energia total!",
    "Continue firme nessa tarde!"
  ],
  evening: [
    "Boa noite! Descanse bem! 🌙",
    "Hora de relaxar e recarregar!",
    "Você fez um ótimo trabalho hoje!"
  ]
};

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

export const MotivationalMascot: React.FC = () => {
  const [phrase, setPhrase] = useState('');
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    hasWeighedToday: false,
    hasExercisedToday: false,
    hasChatWithSofia: false,
    hasLoggedNutrition: false,
    streak: 0
  });

  useEffect(() => {
    const fetchActivityStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];

        // Check weight measurements
        const { data: weightData } = await supabase
          .from('weight_measurements')
          .select('id')
          .eq('user_id', user.id)
          .gte('measurement_date', today)
          .limit(1);

        // Check daily tracking (exercise)
        const { data: trackingData } = await supabase
          .from('advanced_daily_tracking')
          .select('exercise_duration_minutes')
          .eq('user_id', user.id)
          .gte('tracking_date', today)
          .limit(1);

        // Check chat messages
        const { data: chatData } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', today)
          .limit(1);

        // Check nutrition logs
        const { data: nutritionData } = await supabase
          .from('daily_nutrition_summary')
          .select('id')
          .eq('user_id', user.id)
          .gte('date', today)
          .limit(1);

        setActivityStats({
          hasWeighedToday: (weightData?.length || 0) > 0,
          hasExercisedToday: (trackingData?.length || 0) > 0 && (trackingData?.[0]?.exercise_duration_minutes || 0) > 0,
          hasChatWithSofia: (chatData?.length || 0) > 0,
          hasLoggedNutrition: (nutritionData?.length || 0) > 0,
          streak: 0
        });
      } catch (error) {
        console.error('Error fetching activity stats:', error);
      }
    };

    fetchActivityStats();
  }, []);

  useEffect(() => {
    const selectPhrase = () => {
      let phrases: string[] = [];
      
      // Priority order based on recent activities
      if (activityStats.hasWeighedToday) {
        phrases = [...phrases, ...motivationalPhrases.weight];
      }
      if (activityStats.hasExercisedToday) {
        phrases = [...phrases, ...motivationalPhrases.exercise];
      }
      if (activityStats.hasLoggedNutrition) {
        phrases = [...phrases, ...motivationalPhrases.nutrition];
      }
      if (activityStats.hasChatWithSofia) {
        phrases = [...phrases, ...motivationalPhrases.chat];
      }
      
      // Add time-based phrases
      const timeOfDay = getTimeOfDay();
      phrases = [...phrases, ...motivationalPhrases[timeOfDay]];
      
      // Add default phrases
      phrases = [...phrases, ...motivationalPhrases.default];

      // Select random phrase
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setPhrase(randomPhrase.replace('{days}', String(activityStats.streak)));
    };

    selectPhrase();

    // Change phrase every 30 seconds
    const interval = setInterval(selectPhrase, 30000);
    return () => clearInterval(interval);
  }, [activityStats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border/30"
    >
      <motion.img
        src={mascotImage}
        alt="Mascote wellness"
        className="w-12 h-12 object-contain"
        animate={{ 
          y: [0, -3, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={phrase}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-muted-foreground font-medium flex-1"
        >
          {phrase}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
};
