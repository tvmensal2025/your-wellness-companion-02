// ============================================
// USE CHALLENGE LOGIC HOOK
// Gerencia estado e handlers para desafios X1
// ============================================

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useActiveSection } from '@/contexts/ActiveSectionContext';
import { useFollowingWithStats, FollowingUser } from '@/hooks/exercise/useFollowingWithStats';
import { useExerciseChallenges, ExerciseChallenge, CreateChallengeParams } from '@/hooks/exercise/useExerciseChallenges';
import { EXERCISE_OPTIONS } from '../constants';

interface UseChallengeLogicProps {
  userId?: string;
}

export interface ChallengeLogicReturn {
  // Data
  following: FollowingUser[];
  activeChallenges: ExerciseChallenge[];
  receivedPending: ExerciseChallenge[];
  completedChallenges: ExerciseChallenge[];
  currentChallenge: ExerciseChallenge | undefined;
  
  // Loading states
  loading: boolean;
  isCreating: boolean;
  isAccepting: boolean;
  
  // Modal states
  showFollowingList: boolean;
  setShowFollowingList: (show: boolean) => void;
  showCreateChallenge: boolean;
  setShowCreateChallenge: (show: boolean) => void;
  
  // Selection states
  selectedUser: FollowingUser | null;
  selectedExercise: string;
  setSelectedExercise: (exercise: string) => void;
  challengeType: string;
  setChallengeType: (type: string) => void;
  targetValue: number;
  setTargetValue: (value: number) => void;
  
  // Handlers
  handleSelectUser: (user: FollowingUser) => void;
  handleCreateChallenge: () => Promise<void>;
  handleAcceptChallenge: (challenge: ExerciseChallenge) => Promise<void>;
  handleDeclineChallenge: (challenge: ExerciseChallenge) => Promise<void>;
  handleStartChallenge: (challenge: ExerciseChallenge) => Promise<void>;
  handleUpdateProgress: (challenge: ExerciseChallenge, increment: number) => Promise<void>;
  handleCompleteChallenge: (challenge: ExerciseChallenge) => Promise<void>;
  handleNavigateToCommunity: () => void;
}

export const useChallengeLogic = ({ userId }: UseChallengeLogicProps): ChallengeLogicReturn => {
  const { toast } = useToast();
  const { setActiveSection } = useActiveSection();
  
  // External hooks
  const { following, isLoading: loadingFollowing } = useFollowingWithStats(userId);
  const {
    activeChallenges,
    receivedPending,
    completedChallenges,
    isLoading: loadingChallenges,
    createChallenge,
    acceptChallenge,
    declineChallenge,
    startChallenge,
    updateProgress,
    completeChallenge,
    isCreating,
    isAccepting,
  } = useExerciseChallenges(userId);

  // Modal states
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  
  // Selection states
  const [selectedUser, setSelectedUser] = useState<FollowingUser | null>(null);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [challengeType, setChallengeType] = useState('max_reps');
  const [targetValue, setTargetValue] = useState(50);

  const loading = loadingFollowing || loadingChallenges;
  const currentChallenge = activeChallenges[0];

  // Handlers
  const handleSelectUser = useCallback((user: FollowingUser) => {
    setSelectedUser(user);
    setShowFollowingList(false);
    setShowCreateChallenge(true);
  }, []);

  const handleCreateChallenge = useCallback(async () => {
    if (!selectedUser || !selectedExercise) {
      toast({ title: "Selecione um exercício", variant: "destructive" });
      return;
    }

    // Lidar com exercício personalizado
    let exerciseName: string;
    let exerciseEmoji: string;
    
    if (selectedExercise.startsWith('custom:')) {
      exerciseName = selectedExercise.replace('custom:', '');
      exerciseEmoji = '🎯'; // Emoji padrão para exercício personalizado
    } else {
      const exercise = EXERCISE_OPTIONS.find(e => e.value === selectedExercise);
      exerciseName = exercise?.label || selectedExercise;
      exerciseEmoji = exercise?.emoji || '💪';
    }

    // Lidar com tipo de desafio personalizado
    let finalChallengeType: 'max_reps' | 'first_to' | 'timed' | 'custom';
    let customTypeDescription: string | undefined;
    
    if (challengeType.startsWith('custom:')) {
      finalChallengeType = 'custom';
      customTypeDescription = challengeType.replace('custom:', '');
    } else {
      finalChallengeType = challengeType as 'max_reps' | 'first_to' | 'timed';
    }

    try {
      const challengeParams: CreateChallengeParams = {
        challengedId: selectedUser.id,
        exerciseName,
        exerciseEmoji,
        challengeType: finalChallengeType,
        targetValue: challengeType === 'first_to' ? targetValue : undefined,
        durationSeconds: challengeType === 'timed' ? targetValue : 60,
        customTypeDescription,
      };
      
      await createChallenge(challengeParams);

      setShowCreateChallenge(false);
      setSelectedUser(null);
      setSelectedExercise('');
      
      const typeLabel = customTypeDescription || challengeType;
      toast({
        title: "⚔️ Desafio enviado!",
        description: `${selectedUser.name} foi desafiado para ${exerciseName}! (${typeLabel})`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao criar desafio",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [selectedUser, selectedExercise, challengeType, targetValue, createChallenge, toast]);

  const handleAcceptChallenge = useCallback(async (challenge: ExerciseChallenge) => {
    try {
      await acceptChallenge(challenge.id);
      toast({
        title: "🔥 Desafio aceito!",
        description: "Que comece a competição!",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao aceitar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [acceptChallenge, toast]);

  const handleDeclineChallenge = useCallback(async (challenge: ExerciseChallenge) => {
    try {
      await declineChallenge(challenge.id);
      toast({ title: "Desafio recusado" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [declineChallenge, toast]);

  const handleStartChallenge = useCallback(async (challenge: ExerciseChallenge) => {
    try {
      await startChallenge(challenge.id);
      toast({
        title: "🏁 Desafio iniciado!",
        description: "Boa sorte!",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao iniciar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [startChallenge, toast]);

  const handleUpdateProgress = useCallback(async (challenge: ExerciseChallenge, increment: number) => {
    try {
      const newProgress = challenge.myProgress + increment;
      await updateProgress({ challengeId: challenge.id, progress: newProgress });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao atualizar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [updateProgress, toast]);

  const handleCompleteChallenge = useCallback(async (challenge: ExerciseChallenge) => {
    try {
      const result = await completeChallenge(challenge.id) as { winner_id?: string };
      const isWinner = result?.winner_id === userId;
      toast({
        title: isWinner ? "🏆 Você venceu!" : "Desafio finalizado",
        description: isWinner ? "Parabéns pela vitória!" : "Boa tentativa!",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao finalizar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [completeChallenge, userId, toast]);

  const handleNavigateToCommunity = useCallback(() => {
    // Usa o contexto para mudar a seção dentro do SofiaPage
    setActiveSection('comunidade');
  }, [setActiveSection]);

  return {
    // Data
    following,
    activeChallenges,
    receivedPending,
    completedChallenges,
    currentChallenge,
    
    // Loading states
    loading,
    isCreating,
    isAccepting,
    
    // Modal states
    showFollowingList,
    setShowFollowingList,
    showCreateChallenge,
    setShowCreateChallenge,
    
    // Selection states
    selectedUser,
    selectedExercise,
    setSelectedExercise,
    challengeType,
    setChallengeType,
    targetValue,
    setTargetValue,
    
    // Handlers
    handleSelectUser,
    handleCreateChallenge,
    handleAcceptChallenge,
    handleDeclineChallenge,
    handleStartChallenge,
    handleUpdateProgress,
    handleCompleteChallenge,
    handleNavigateToCommunity,
  };
};
