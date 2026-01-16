// ============================================
// ACTIVE CHALLENGE VIEW
// Visualização completa do desafio ativo
// ============================================

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExerciseChallenge } from '@/hooks/exercise/useExerciseChallenges';
import { ChallengeProgress } from './ChallengeProgress';
import { ChallengeActions } from './ChallengeActions';

interface ActiveChallengeViewProps {
  challenge: ExerciseChallenge;
  userId?: string;
  onStart: () => void;
  onUpdateProgress: (increment: number) => void;
  onComplete: () => void;
}

export const ActiveChallengeView: React.FC<ActiveChallengeViewProps> = ({
  challenge,
  userId,
  onStart,
  onUpdateProgress,
  onComplete,
}) => {
  const isWinner = challenge.winnerId === userId;
  const isLoser = challenge.winnerId && challenge.winnerId !== userId;
  const isTie = challenge.status === 'completed' && !challenge.winnerId;

  // Descrição do tipo de desafio
  const getChallengeDescription = () => {
    switch (challenge.challengeType) {
      case 'max_reps':
        return `Máximo em ${challenge.durationSeconds}s`;
      case 'first_to':
        return `Primeiro a fazer ${challenge.targetValue}`;
      case 'timed':
        return `${challenge.durationSeconds}s de tempo`;
      default:
        return '';
    }
  };

  // Badge de status
  const getStatusBadge = () => {
    const statusConfig = {
      active: {
        className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
        label: "🔥 Em andamento"
      },
      accepted: {
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
        label: "✅ Aceito - Pronto para iniciar"
      },
      completed: {
        className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        label: "✅ Finalizado"
      }
    };

    const config = statusConfig[challenge.status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge variant="secondary" className={cn("mt-2", config.className)}>
        {config.label}
      </Badge>
    );
  };

  // Resultado final
  const renderResult = () => {
    if (challenge.status !== 'completed') return null;

    return (
      <div
        className={cn(
          "p-4 rounded-xl text-center",
          isWinner && "bg-emerald-50 dark:bg-emerald-950/30",
          isLoser && "bg-orange-50 dark:bg-orange-950/30",
          isTie && "bg-muted"
        )}
      >
        {isWinner && (
          <div className="flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              Você venceu! 🎉
            </span>
          </div>
        )}
        {isLoser && (
          <div className="flex items-center justify-center gap-2">
            <Target className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-orange-700 dark:text-orange-300">
              {challenge.opponentName} venceu!
            </span>
          </div>
        )}
        {isTie && <span className="font-bold">Empate! 🤝</span>}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Info do desafio */}
      <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl">
        <span className="text-4xl">{challenge.exerciseEmoji}</span>
        <h3 className="font-bold text-lg mt-2">{challenge.exerciseName}</h3>
        <p className="text-sm text-muted-foreground">{getChallengeDescription()}</p>
        {getStatusBadge()}
      </div>

      {/* Progresso */}
      <ChallengeProgress challenge={challenge} />

      {/* Ações */}
      <ChallengeActions
        challenge={challenge}
        onStart={onStart}
        onUpdateProgress={onUpdateProgress}
        onComplete={onComplete}
      />

      {/* Resultado */}
      {renderResult()}
    </div>
  );
};
