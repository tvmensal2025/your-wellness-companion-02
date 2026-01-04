// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FlashChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  xpReward: number;
  expiresAt: Date;
  isCompleted: boolean;
  type: 'water' | 'exercise' | 'weight' | 'mood' | 'sleep';
}

const DAILY_CHALLENGES = [
  {
    type: 'water',
    title: 'Hidratação Perfeita',
    description: 'Beba 2L de água hoje',
    icon: '💧',
    target: 2000,
    xpReward: 50
  },
  {
    type: 'exercise',
    title: 'Movimento do Dia',
    description: 'Faça 30 minutos de exercício',
    icon: '🏃',
    target: 30,
    xpReward: 75
  },
  {
    type: 'weight',
    title: 'Registro Diário',
    description: 'Registre seu peso hoje',
    icon: '⚖️',
    target: 1,
    xpReward: 25
  },
  {
    type: 'mood',
    title: 'Check-in Emocional',
    description: 'Registre seu humor hoje',
    icon: '😊',
    target: 1,
    xpReward: 30
  },
  {
    type: 'sleep',
    title: 'Sono Reparador',
    description: 'Durma pelo menos 7 horas',
    icon: '😴',
    target: 7,
    xpReward: 60
  }
];

export const useFlashChallenge = () => {
  const [challenge, setChallenge] = useState<FlashChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const getDailyChallenge = useCallback(() => {
    // Seleciona desafio baseado no dia (rotação)
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const challengeIndex = dayOfYear % DAILY_CHALLENGES.length;
    return DAILY_CHALLENGES[challengeIndex];
  }, []);

  const fetchChallenge = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayChallenge = getDailyChallenge();
      const today = new Date();
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Verificar progresso do desafio
      let currentProgress = 0;
      let isCompleted = false;

      if (todayChallenge.type === 'water') {
        const { data } = await supabase
          .from('water_tracking')
          .select('amount_ml')
          .eq('user_id', user.id)
          .eq('date', today.toISOString().split('T')[0]);
        currentProgress = data?.reduce((sum, r) => sum + (r.amount_ml || 0), 0) || 0;
      } else if (todayChallenge.type === 'exercise') {
        const { data } = await supabase
          .from('exercise_tracking')
          .select('duration_minutes')
          .eq('user_id', user.id)
          .eq('date', today.toISOString().split('T')[0]);
        currentProgress = data?.reduce((sum, r) => sum + (r.duration_minutes || 0), 0) || 0;
      } else if (todayChallenge.type === 'weight') {
        const { data } = await supabase
          .from('weight_measurements')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString().split('T')[0]);
        currentProgress = data?.length || 0;
      }

      isCompleted = currentProgress >= todayChallenge.target;

      setChallenge({
        id: `flash-${today.toISOString().split('T')[0]}`,
        title: todayChallenge.title,
        description: todayChallenge.description,
        icon: todayChallenge.icon,
        target: todayChallenge.target,
        current: currentProgress,
        xpReward: isCompleted ? 0 : todayChallenge.xpReward * 3, // 3x reward for flash
        expiresAt: endOfDay,
        isCompleted,
        type: todayChallenge.type as any
      });
    } catch (error) {
      console.error('Erro ao buscar desafio flash:', error);
    } finally {
      setLoading(false);
    }
  }, [getDailyChallenge]);

  // Atualizar countdown
  useEffect(() => {
    const updateCountdown = () => {
      if (!challenge) return;
      
      const now = new Date();
      const diff = challenge.expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('Expirado');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [challenge]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  return { challenge, loading, timeRemaining, refetch: fetchChallenge };
};
