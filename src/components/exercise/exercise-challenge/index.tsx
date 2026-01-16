// ============================================
// ⚔️ EXERCISE CHALLENGE CARD - ORCHESTRATOR
// Sistema de desafios X1 entre usuários
// ============================================

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Hooks
import { useChallengeLogic } from './hooks/useChallengeLogic';

// Sub-components
import { ChallengeHeader } from './ChallengeHeader';
import { OpponentSelector } from './OpponentSelector';
import { CreateChallengeDialog } from './CreateChallengeDialog';
import { PendingChallengesList } from './PendingChallengesList';
import { ActiveChallengeView } from './ActiveChallengeView';
import { ChallengeHistory } from './ChallengeHistory';
import { NoFollowingState, NoChallengeState } from './EmptyState';

// ============================================
// PROPS
// ============================================

export interface ExerciseChallengeCardProps {
  userId?: string;
  className?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ExerciseChallengeCard: React.FC<ExerciseChallengeCardProps> = ({
  userId,
  className,
}) => {
  const logic = useChallengeLogic({ userId });

  // Se não segue ninguém
  if (!logic.loading && logic.following.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <ChallengeHeader pendingCount={0} />
        <CardContent>
          <NoFollowingState onNavigateToCommunity={logic.handleNavigateToCommunity} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Modal: Lista de Seguidos */}
      <OpponentSelector
        open={logic.showFollowingList}
        onOpenChange={logic.setShowFollowingList}
        following={logic.following}
        onSelectUser={logic.handleSelectUser}
      />

      {/* Modal: Criar Desafio */}
      <CreateChallengeDialog
        open={logic.showCreateChallenge}
        onOpenChange={logic.setShowCreateChallenge}
        selectedUser={logic.selectedUser}
        selectedExercise={logic.selectedExercise}
        onExerciseChange={logic.setSelectedExercise}
        challengeType={logic.challengeType}
        onChallengeTypeChange={logic.setChallengeType}
        targetValue={logic.targetValue}
        onTargetValueChange={logic.setTargetValue}
        onCreateChallenge={logic.handleCreateChallenge}
        isCreating={logic.isCreating}
      />

      {/* Card Principal */}
      <Card className={cn("overflow-hidden", className)}>
        <ChallengeHeader pendingCount={logic.receivedPending.length} />

        <CardContent className="space-y-4">
          {logic.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Desafios recebidos pendentes */}
              <PendingChallengesList
                challenges={logic.receivedPending}
                onAccept={logic.handleAcceptChallenge}
                onDecline={logic.handleDeclineChallenge}
                isAccepting={logic.isAccepting}
              />

              {/* Desafio ativo */}
              {logic.currentChallenge ? (
                <ActiveChallengeView
                  challenge={logic.currentChallenge}
                  userId={userId}
                  onStart={() => logic.handleStartChallenge(logic.currentChallenge!)}
                  onUpdateProgress={(inc) => logic.handleUpdateProgress(logic.currentChallenge!, inc)}
                  onComplete={() => logic.handleCompleteChallenge(logic.currentChallenge!)}
                />
              ) : (
                <NoChallengeState 
                  onCreateChallenge={() => logic.setShowFollowingList(true)} 
                />
              )}

              {/* Histórico recente */}
              {!logic.currentChallenge && (
                <ChallengeHistory
                  challenges={logic.completedChallenges}
                  userId={userId}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

// Re-export para compatibilidade
export default ExerciseChallengeCard;

// Export types and constants
export { EXERCISE_OPTIONS, CHALLENGE_TYPES } from './constants';
export type { ChallengeLogicReturn } from './hooks/useChallengeLogic';
