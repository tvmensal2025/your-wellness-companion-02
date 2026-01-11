/**
 * @deprecated Use useGamificationUnified instead
 * Este hook é mantido para compatibilidade com componentes existentes
 * Internamente usa o hook unificado
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGamificationUnified } from './useGamificationUnified';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  difficulty: string;
  target_value: number;
  xp_reward: number;
  category: string;
  progress?: number;
  is_completed?: boolean;
  expires_at?: Date;
}

export const useEnhancedGamification = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Buscar userId uma vez
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  // Usar hook unificado
  const unified = useGamificationUnified(userId);

  // Retornar com a mesma API para compatibilidade
  return {
    gamificationData: unified.gamificationData,
    isLoading: unified.isLoading,
    completeChallenge: unified.completeChallenge,
    isCompletingChallenge: unified.isCompletingChallenge,
    updateChallengeProgress: unified.updateChallengeProgress,
    isUpdatingProgress: unified.isUpdatingProgress,
    getTrackingProgress: unified.getTrackingProgress,
  };
};

