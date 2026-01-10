import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string | null; // Coluna real do banco (não category)
  difficulty: string | null;
  duration_days: number | null;
  points_reward: number | null;
  badge_icon: string | null;
  is_active: boolean | null;
  is_group_challenge: boolean | null;
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number | null;
  target_value: number | null;
  is_completed: boolean | null;
  started_at: string | null;
  completed_at?: string | null;
  challenge?: Challenge | null;
}

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      // Buscar desafios
      
      // Buscar desafios
      const { data: challengesData, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar participações do usuário
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: participationsData, error: participationsError } = await supabase
          .from('challenge_participations')
          .select(`
            *,
            challenge:challenges(*)
          `)
          .eq('user_id', user.id);

        if (participationsError) {
          console.error('Erro ao buscar participações:', participationsError);
        } else {
          setUserChallenges(participationsData || []);
          setCompletedChallenges(participationsData?.filter(p => p.is_completed) || []);
        }
      }

      setChallenges(challengesData || []);
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string, duration: number) => {
    try {
      // Fazer join no desafio
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: 0,
          target_value: duration,
          started_at: new Date().toISOString()
        });

      if (error) throw error;

      // Recarregar dados
      await fetchChallenges();
    } catch (error) {
      console.error('Erro ao participar do desafio:', error);
      throw error;
    }
  };

  const updateChallengeProgress = async (userChallengeId: string, newProgress: number) => {
    try {
      // Atualizar progresso
      
      const { error } = await supabase
        .from('challenge_participations')
        .update({
          progress: newProgress,
          is_completed: newProgress >= 100,
          completed_at: newProgress >= 100 ? new Date().toISOString() : null
        })
        .eq('id', userChallengeId);

      if (error) throw error;

      // Recarregar dados
      await fetchChallenges();
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    }
  };

  return {
    challenges,
    userChallenges,
    completedChallenges,
    loading,
    joinChallenge,
    updateChallengeProgress,
    fetchChallenges
  };
}; 