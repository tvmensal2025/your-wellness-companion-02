// ============================================
// CHALLENGE ACTIONS
// Botões de ação para desafios (aceitar, recusar, iniciar, etc.)
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Timer } from 'lucide-react';
import { ExerciseChallenge } from '@/hooks/exercise/useExerciseChallenges';

interface ChallengeActionsProps {
  challenge: ExerciseChallenge;
  onStart: () => void;
  onUpdateProgress: (increment: number) => void;
  onComplete: () => void;
}

export const ChallengeActions: React.FC<ChallengeActionsProps> = ({
  challenge,
  onStart,
  onUpdateProgress,
  onComplete,
}) => {
  // Botão para iniciar desafio aceito
  if (challenge.status === 'accepted') {
    return (
      <Button
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
        onClick={onStart}
      >
        <Play className="w-4 h-4 mr-2" />
        Iniciar Desafio!
      </Button>
    );
  }

  // Controles durante desafio ativo
  if (challenge.status === 'active') {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {[1, 5, 10].map((increment) => (
            <Button
              key={increment}
              variant="outline"
              onClick={() => onUpdateProgress(increment)}
              className="text-lg font-bold"
            >
              +{increment}
            </Button>
          ))}
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={onComplete}
        >
          <Timer className="w-4 h-4 mr-2" />
          Finalizar Desafio
        </Button>
      </div>
    );
  }

  return null;
};
