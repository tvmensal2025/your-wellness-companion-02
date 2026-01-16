// ============================================
// CHALLENGE PROGRESS
// Exibe progresso comparativo entre usuários
// ============================================

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ExerciseChallenge } from '@/hooks/exercise/useExerciseChallenges';

interface ChallengeProgressProps {
  challenge: ExerciseChallenge;
}

export const ChallengeProgress: React.FC<ChallengeProgressProps> = ({ challenge }) => {
  // Placar lado a lado
  const renderScoreboard = () => (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 text-center">
        <p className="text-3xl font-bold text-emerald-600">{challenge.myProgress}</p>
        <p className="text-xs text-muted-foreground">Você</p>
      </div>
      <div className="text-2xl font-bold text-muted-foreground">VS</div>
      <div className="flex-1 text-center">
        <p className="text-3xl font-bold text-purple-600">{challenge.opponentProgress}</p>
        <p className="text-xs text-muted-foreground">{challenge.opponentName}</p>
      </div>
    </div>
  );

  // Barras de progresso (para first_to)
  const renderProgressBars = () => {
    if (challenge.challengeType !== 'first_to' || !challenge.targetValue) {
      return null;
    }

    const myPercent = Math.round((challenge.myProgress / challenge.targetValue) * 100);
    const opponentPercent = Math.round((challenge.opponentProgress / challenge.targetValue) * 100);

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Você: {myPercent}%</span>
          <span>{challenge.opponentName}: {opponentPercent}%</span>
        </div>
        <div className="flex gap-1">
          <Progress
            value={(challenge.myProgress / challenge.targetValue) * 100}
            className="h-2 flex-1"
          />
          <Progress
            value={(challenge.opponentProgress / challenge.targetValue) * 100}
            className="h-2 flex-1 [&>div]:bg-purple-500"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {renderScoreboard()}
      {renderProgressBars()}
    </div>
  );
};
