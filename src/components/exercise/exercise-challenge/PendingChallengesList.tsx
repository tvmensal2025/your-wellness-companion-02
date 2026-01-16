// ============================================
// PENDING CHALLENGES LIST
// Lista de desafios recebidos pendentes
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X } from 'lucide-react';
import { ExerciseChallenge } from '@/hooks/exercise/useExerciseChallenges';

interface PendingChallengesListProps {
  challenges: ExerciseChallenge[];
  onAccept: (challenge: ExerciseChallenge) => void;
  onDecline: (challenge: ExerciseChallenge) => void;
  isAccepting: boolean;
}

export const PendingChallengesList: React.FC<PendingChallengesListProps> = ({
  challenges,
  onAccept,
  onDecline,
  isAccepting,
}) => {
  if (challenges.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Desafios Recebidos
      </p>
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          className="p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={challenge.opponentAvatar} />
              <AvatarFallback>{challenge.opponentName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{challenge.opponentName}</p>
              <p className="text-xs text-muted-foreground">
                {challenge.exerciseEmoji} {challenge.exerciseName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              onClick={() => onAccept(challenge)}
              disabled={isAccepting}
            >
              <Check className="w-4 h-4 mr-1" />
              Aceitar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDecline(challenge)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
