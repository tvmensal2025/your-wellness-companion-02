// ============================================
// ⚔️ USE EXERCISE CHALLENGES HOOK
// Gerencia desafios X1 de exercícios
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fromTable, callRpc } from '@/lib/supabase-helpers';

// ============================================
// TYPES
// ============================================

export interface ExerciseChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerAvatar?: string;
  challengedId: string;
  challengedName: string;
  challengedAvatar?: string;
  exerciseName: string;
  exerciseEmoji: string;
  challengeType: 'max_reps' | 'first_to' | 'timed';
  targetValue?: number;
  durationSeconds: number;
  challengerProgress: number;
  challengedProgress: number;
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'declined' | 'expired';
  winnerId?: string;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt: string;
  // Computed
  isChallenger: boolean;
  isChallenged: boolean;
  myProgress: number;
  opponentProgress: number;
  opponentName: string;
  opponentAvatar?: string;
}

export interface CreateChallengeParams {
  challengedId: string;
  exerciseName: string;
  exerciseEmoji?: string;
  challengeType: 'max_reps' | 'first_to' | 'timed';
  targetValue?: number;
  durationSeconds?: number;
}

// ============================================
// MAIN HOOK
// ============================================

export function useExerciseChallenges(userId?: string) {
  const queryClient = useQueryClient();
  const enabled = !!userId;

  // Buscar desafios do usuário
  const { data: challenges, isLoading, error, refetch } = useQuery({
    queryKey: ['exercise-challenges', userId],
    queryFn: async (): Promise<ExerciseChallenge[]> => {
      if (!userId) return [];

      const { data, error } = await (fromTable('exercise_challenges') as any)
        .select(`
          *,
          challenger:profiles!challenger_id(id, full_name, avatar_url),
          challenged:profiles!challenged_id(id, full_name, avatar_url)
        `)
        .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar desafios:', error);
        return [];
      }

      return (data || []).map((c: any) => {
        const isChallenger = c.challenger_id === userId;
        const isChallenged = c.challenged_id === userId;

        return {
          id: c.id,
          challengerId: c.challenger_id,
          challengerName: c.challenger?.full_name || 'Usuário',
          challengerAvatar: c.challenger?.avatar_url,
          challengedId: c.challenged_id,
          challengedName: c.challenged?.full_name || 'Usuário',
          challengedAvatar: c.challenged?.avatar_url,
          exerciseName: c.exercise_name,
          exerciseEmoji: c.exercise_emoji || '💪',
          challengeType: c.challenge_type,
          targetValue: c.target_value,
          durationSeconds: c.duration_seconds || 60,
          challengerProgress: c.challenger_progress || 0,
          challengedProgress: c.challenged_progress || 0,
          status: c.status,
          winnerId: c.winner_id,
          createdAt: c.created_at,
          acceptedAt: c.accepted_at,
          startedAt: c.started_at,
          completedAt: c.completed_at,
          expiresAt: c.expires_at,
          // Computed
          isChallenger,
          isChallenged,
          myProgress: isChallenger ? c.challenger_progress : c.challenged_progress,
          opponentProgress: isChallenger ? c.challenged_progress : c.challenger_progress,
          opponentName: isChallenger 
            ? (c.challenged?.full_name || 'Oponente')
            : (c.challenger?.full_name || 'Oponente'),
          opponentAvatar: isChallenger 
            ? c.challenged?.avatar_url 
            : c.challenger?.avatar_url,
        };
      });
    },
    enabled,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 10 * 1000, // Atualizar a cada 10s para desafios ativos
  });

  // Criar desafio
  const createChallenge = useMutation({
    mutationFn: async (params: CreateChallengeParams) => {
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await (fromTable('exercise_challenges') as any)
        .insert({
          challenger_id: userId,
          challenged_id: params.challengedId,
          exercise_name: params.exerciseName,
          exercise_emoji: params.exerciseEmoji || '💪',
          challenge_type: params.challengeType,
          target_value: params.targetValue,
          duration_seconds: params.durationSeconds || 60,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-challenges'] });
    },
  });

  // Aceitar desafio
  const acceptChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data, error } = await callRpc('accept_exercise_challenge', { p_challenge_id: challengeId });

      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || 'Erro ao aceitar');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-challenges'] });
    },
  });

  // Recusar desafio
  const declineChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await (fromTable('exercise_challenges') as any)
        .update({ status: 'declined' })
        .eq('id', challengeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-challenges'] });
    },
  });

  // Iniciar desafio
  const startChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data, error } = await callRpc('start_exercise_challenge', { p_challenge_id: challengeId });

      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || 'Erro ao iniciar');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-challenges'] });
    },
  });

  // Atualizar progresso
  const updateProgress = useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      const { data, error } = await callRpc('update_challenge_progress', { 
        p_challenge_id: challengeId,
        p_progress: progress,
      });

      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || 'Erro ao atualizar');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-challenges'] });
    },
  });

  // Completar desafio
  const completeChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data, error } = await callRpc('complete_exercise_challenge', { p_challenge_id: challengeId });

      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || 'Erro ao completar');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-challenges'] });
    },
  });

  // Filtrar desafios por status
  const pendingChallenges = (challenges || []).filter(c => c.status === 'pending');
  const activeChallenges = (challenges || []).filter(c => c.status === 'active' || c.status === 'accepted');
  const completedChallenges = (challenges || []).filter(c => c.status === 'completed');

  // Desafios recebidos pendentes (para aceitar)
  const receivedPending = pendingChallenges.filter(c => c.isChallenged);
  
  // Desafios enviados pendentes (aguardando resposta)
  const sentPending = pendingChallenges.filter(c => c.isChallenger);

  return {
    challenges: challenges || [],
    pendingChallenges,
    activeChallenges,
    completedChallenges,
    receivedPending,
    sentPending,
    isLoading,
    error: error?.message,
    refresh: refetch,
    // Mutations
    createChallenge: createChallenge.mutateAsync,
    acceptChallenge: acceptChallenge.mutateAsync,
    declineChallenge: declineChallenge.mutateAsync,
    startChallenge: startChallenge.mutateAsync,
    updateProgress: updateProgress.mutateAsync,
    completeChallenge: completeChallenge.mutateAsync,
    // Loading states
    isCreating: createChallenge.isPending,
    isAccepting: acceptChallenge.isPending,
    isStarting: startChallenge.isPending,
    isUpdating: updateProgress.isPending,
  };
}

export default useExerciseChallenges;
