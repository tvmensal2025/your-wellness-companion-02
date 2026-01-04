// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SofiaMessage {
  id: string;
  type: 'celebration' | 'reminder' | 'motivation' | 'tip' | 'alert';
  title: string;
  message: string;
  emoji: string;
  action?: {
    label: string;
    route: string;
  };
  priority: number;
}

export const useSofiaEmotional = () => {
  const [message, setMessage] = useState<SofiaMessage | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const generateMessage = useCallback(async (): Promise<SofiaMessage | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const hour = now.getHours();

      // Verificar streak
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('current_streak, best_streak, last_activity_date, total_points')
        .eq('user_id', user.id)
        .single();

      const streak = userPoints?.current_streak || 0;
      const bestStreak = userPoints?.best_streak || 0;
      const lastActivity = userPoints?.last_activity_date;
      const isActiveToday = lastActivity === today;

      // Verificar peso recente
      const { data: recentWeight } = await supabase
        .from('weight_measurements')
        .select('peso_kg, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      // Gerar mensagem baseada no contexto
      const messages: SofiaMessage[] = [];

      // Saudação baseada no horário
      if (hour >= 5 && hour < 12) {
        messages.push({
          id: 'morning-greeting',
          type: 'motivation',
          title: 'Bom dia! ☀️',
          message: 'Que tal começar o dia registrando seu peso? Pequenos hábitos fazem grande diferença!',
          emoji: '🌅',
          action: { label: 'Registrar Peso', route: '/dashboard' },
          priority: isActiveToday ? 1 : 5
        });
      } else if (hour >= 12 && hour < 18) {
        messages.push({
          id: 'afternoon-check',
          type: 'reminder',
          title: 'Como está seu dia?',
          message: 'Lembre-se de se manter hidratado e fazer pausas para se movimentar!',
          emoji: '💪',
          priority: 2
        });
      } else {
        messages.push({
          id: 'evening-reflection',
          type: 'tip',
          title: 'Hora de relaxar',
          message: 'Uma boa noite de sono é essencial. Tente dormir cedo hoje!',
          emoji: '🌙',
          priority: 2
        });
      }

      // Celebrar streak
      if (streak >= 7 && streak === bestStreak) {
        messages.push({
          id: 'streak-record',
          type: 'celebration',
          title: 'Novo Recorde! 🎉',
          message: `Incrível! ${streak} dias seguidos! Você está no seu melhor momento!`,
          emoji: '🔥',
          priority: 10
        });
      } else if (streak >= 3) {
        messages.push({
          id: 'streak-going',
          type: 'celebration',
          title: `${streak} dias de foco!`,
          message: 'Continue assim! Você está construindo um hábito poderoso.',
          emoji: '🔥',
          priority: 6
        });
      }

      // Alerta de streak prestes a expirar
      if (!isActiveToday && streak > 0 && hour >= 18) {
        messages.push({
          id: 'streak-warning',
          type: 'alert',
          title: 'Não perca seu streak!',
          message: `Você tem ${streak} dias de sequência. Registre algo hoje para não perder!`,
          emoji: '⚠️',
          action: { label: 'Manter Streak', route: '/dashboard' },
          priority: 9
        });
      }

      // Celebrar perda de peso
      if (recentWeight && recentWeight.length >= 2) {
        const current = recentWeight[0]?.peso_kg;
        const previous = recentWeight[1]?.peso_kg;
        if (current && previous && current < previous) {
          const diff = (previous - current).toFixed(1);
          messages.push({
            id: 'weight-loss',
            type: 'celebration',
            title: 'Parabéns! 🎯',
            message: `Você perdeu ${diff}kg! Seu esforço está dando resultado!`,
            emoji: '🏆',
            priority: 8
          });
        }
      }

      // Ordenar por prioridade e retornar a mais importante
      messages.sort((a, b) => b.priority - a.priority);
      return messages[0] || null;

    } catch (error) {
      console.error('Erro ao gerar mensagem Sofia:', error);
      return null;
    }
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    // Salvar no localStorage para não mostrar novamente hoje
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`sofia-dismissed-${today}`, 'true');
  }, []);

  useEffect(() => {
    const init = async () => {
      // Verificar se já foi descartada hoje
      const today = new Date().toISOString().split('T')[0];
      const wasDismissed = localStorage.getItem(`sofia-dismissed-${today}`);
      
      if (wasDismissed) {
        setDismissed(true);
        setLoading(false);
        return;
      }

      const msg = await generateMessage();
      setMessage(msg);
      setLoading(false);
    };

    init();
  }, [generateMessage]);

  return { message, dismissed, dismiss, loading };
};
