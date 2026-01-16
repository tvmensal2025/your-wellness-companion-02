// ============================================
// 🎯 EXERCISE DETAIL MODAL - ORCHESTRATOR
// Modal de detalhes do exercício
// ============================================

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dumbbell } from 'lucide-react';

// Hooks
import { useExerciseDetailLogic } from './hooks/useExerciseDetailLogic';
import { useExerciseFeedback } from './hooks/useExerciseFeedback';

// Sub-components
import { ExerciseOverview } from './ExerciseOverview';
import { ExerciseInstructions } from './ExerciseInstructions';
import { ExerciseExecution } from './ExerciseExecution';

// ============================================
// PROPS
// ============================================

export interface ExerciseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseData: any;
  location?: 'casa' | 'academia';
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  isOpen,
  onClose,
  exerciseData,
  location = 'casa',
}) => {
  const logic = useExerciseDetailLogic({ isOpen, exerciseData, onClose });
  
  const feedback = useExerciseFeedback({
    isOpen,
    exerciseId: logic.exerciseId,
    exerciseName: logic.name,
    expectedDifficulty: logic.difficultyRaw,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md p-0 gap-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            Detalhes do Exercício
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-60px)]">
          <div className="p-4">
            {logic.currentStep === 'overview' && (
              <ExerciseOverview
                name={logic.name}
                description={logic.description}
                location={location}
                videoId={logic.videoId}
                sets={logic.sets}
                reps={logic.reps}
                rest={logic.rest}
                difficulty={logic.difficulty}
                difficultyRaw={logic.difficultyRaw}
                onStartExecution={logic.startExecution}
                onGoToInstructions={logic.goToInstructions}
              />
            )}

            {logic.currentStep === 'instructions' && (
              <ExerciseInstructions
                name={logic.name}
                instructions={logic.instructions}
                tips={logic.tips}
                instructionsSummary={logic.instructionsSummary}
                tipsSummary={logic.tipsSummary}
                showDetailedInstructions={logic.showDetailedInstructions}
                showDetailedTips={logic.showDetailedTips}
                onToggleDetailedInstructions={() => logic.setShowDetailedInstructions(!logic.showDetailedInstructions)}
                onToggleDetailedTips={() => logic.setShowDetailedTips(!logic.showDetailedTips)}
                onGoBack={logic.goToOverview}
                onStartExecution={logic.startExecution}
              />
            )}

            {logic.currentStep === 'execution' && (
              <ExerciseExecution
                name={logic.name}
                videoId={logic.videoId}
                timerSeconds={logic.timerSeconds}
                isTimerRunning={logic.isTimerRunning}
                currentSet={logic.currentSet}
                totalSets={logic.totalSets}
                reps={logic.reps}
                heartRate={{
                  current: logic.heartRate.heartRate.current,
                  isConnected: logic.heartRate.isConnected,
                  isLoading: logic.heartRate.isLoading,
                }}
                userFeedback={feedback.userFeedback}
                feedbackSaving={feedback.feedbackSaving}
                formatTime={logic.formatTime}
                onToggleTimer={logic.toggleTimer}
                onResetTimer={logic.resetTimer}
                onPrevSet={logic.prevSet}
                onNextSet={logic.nextSet}
                onCompleteSet={logic.completeSet}
                onGoBack={logic.goToOverview}
                onConnectGoogleFit={logic.connectGoogleFit}
                onSaveFeedback={feedback.saveFeedback}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Re-export para compatibilidade
export default ExerciseDetailModal;

// Export types
export type { Step } from './hooks/useExerciseDetailLogic';
export type { DifficultyFeedback } from './DifficultyFeedback';
