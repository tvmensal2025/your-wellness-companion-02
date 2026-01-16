// ============================================
// 👍 DIFFICULTY FEEDBACK
// Botões de feedback de dificuldade
// ============================================

import React from 'react';
import { Target, ThumbsDown, ThumbsUp } from 'lucide-react';

export type DifficultyFeedback = 'facil' | 'medio' | 'dificil';

interface DifficultyFeedbackProps {
  size?: 'sm' | 'md';
  userFeedback: DifficultyFeedback | null;
  feedbackSaving: boolean;
  onSaveFeedback: (feedback: DifficultyFeedback) => void;
}

export const DifficultyFeedback: React.FC<DifficultyFeedbackProps> = ({
  size = 'sm',
  userFeedback,
  feedbackSaving,
  onSaveFeedback,
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-xs';
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onSaveFeedback('facil')}
        disabled={feedbackSaving}
        className={`flex flex-col items-center ${padding} rounded-lg transition-all ${
          userFeedback === 'facil' 
            ? 'bg-green-500/20 text-green-600 ring-1 ring-green-500/50' 
            : 'hover:bg-green-500/10 text-muted-foreground hover:text-green-600'
        }`}
      >
        <ThumbsUp className={iconSize} />
        <span className={`${textSize} font-medium mt-0.5`}>Fácil</span>
      </button>
      <button
        onClick={() => onSaveFeedback('medio')}
        disabled={feedbackSaving}
        className={`flex flex-col items-center ${padding} rounded-lg transition-all ${
          userFeedback === 'medio' 
            ? 'bg-yellow-500/20 text-yellow-600 ring-1 ring-yellow-500/50' 
            : 'hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-600'
        }`}
      >
        <Target className={iconSize} />
        <span className={`${textSize} font-medium mt-0.5`}>Ok</span>
      </button>
      <button
        onClick={() => onSaveFeedback('dificil')}
        disabled={feedbackSaving}
        className={`flex flex-col items-center ${padding} rounded-lg transition-all ${
          userFeedback === 'dificil' 
            ? 'bg-red-500/20 text-red-600 ring-1 ring-red-500/50' 
            : 'hover:bg-red-500/10 text-muted-foreground hover:text-red-600'
        }`}
      >
        <ThumbsDown className={iconSize} />
        <span className={`${textSize} font-medium mt-0.5`}>Difícil</span>
      </button>
    </div>
  );
};
