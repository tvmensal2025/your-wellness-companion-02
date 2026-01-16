// ============================================
// CHALLENGE HISTORY
// Histórico de desafios completados
// ============================================

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExerciseChallenge } from '@/hooks/exercise/useExerciseChallenges';

interface ChallengeHistoryProps {
  challenges: ExerciseChallenge[];
  userId?: string;
  maxItems?: number;
}

export const ChallengeHistory: React.FC<ChallengeHistoryProps> = ({
  challenges,
  userId,
  maxItems = 3,
}) => {
  if (challenges.length === 0) return null;

  return (
    <div className="pt-2 border-t">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Últimos desafios
      </p>
      <div className="space-y-1">
        {challenges.slice(0, maxItems).map((c) => {
          const isWinner = c.winnerId === userId;
          const isDraw = !c.winnerId;
          
          return (
            <div
              key={c.id}
              className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30"
            >
              <span>
                {c.exerciseEmoji} vs {c.opponentName}
              </span>
              <Badge
                variant={isWinner ? 'default' : 'secondary'}
                className={cn(isWinner && 'bg-emerald-500')}
              >
                {isWinner ? '🏆 Vitória' : isDraw ? 'Empate' : 'Derrota'}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};
