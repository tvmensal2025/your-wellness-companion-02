// ============================================
// 🤝 BUDDY WORKOUT CARD - ORCHESTRATOR
// Card interativo de parceiro de treino
// ============================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureTutorialPopup } from '../FeatureTutorialPopup';

// Hooks
import { useBuddyWorkoutLogic, type BuddyStats, type ActiveChallenge } from './hooks/useBuddyWorkoutLogic';

// Sub-components
import { BuddySelector } from './BuddySelector';
import { VSDisplay, CompetitionStatus, ActiveChallengeDisplay, QuickStats } from './BuddyProgress';
import { BuddyActions } from './BuddyActions';
import { ProvocationsModal, ChallengesModal, BuddyStatsModal } from './BuddyModals';

// ============================================
// PROPS
// ============================================

export interface BuddyWorkoutCardProps {
  userId?: string;
  buddy?: BuddyStats;
  userStats?: BuddyStats;
  activeChallenge?: ActiveChallenge;
  onFindBuddy?: () => void;
  onSendProvocation?: (type: string, message: string) => void;
  onCreateChallenge?: () => void;
  onViewBuddyProfile?: () => void;
  onAcceptChallenge?: (challengeId: string) => void;
  className?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const BuddyWorkoutCard: React.FC<BuddyWorkoutCardProps> = ({
  userId,
  buddy,
  userStats,
  activeChallenge,
  onFindBuddy,
  onSendProvocation,
  onCreateChallenge,
  onViewBuddyProfile,
  onAcceptChallenge,
  className,
}) => {
  const logic = useBuddyWorkoutLogic({ buddy, userStats });

  // Se não tem parceiro
  if (!logic.hasBuddy) {
    return <BuddySelector onFindBuddy={onFindBuddy} className={className} />;
  }

  return (
    <>
      {/* Tutorial Popup */}
      <FeatureTutorialPopup
        feature="parceiro_treino"
        isOpen={logic.tutorial.isOpen}
        onClose={logic.tutorial.closeTutorial}
      />

      {/* Modals */}
      <ProvocationsModal
        open={logic.showProvocations}
        onOpenChange={logic.setShowProvocations}
        onSendProvocation={onSendProvocation}
      />

      <ChallengesModal
        open={logic.showChallenges}
        onOpenChange={logic.setShowChallenges}
        buddyName={logic.currentBuddy.name}
        onCreateChallenge={onCreateChallenge}
      />

      <BuddyStatsModal
        open={logic.showBuddyStats}
        onOpenChange={logic.setShowBuddyStats}
        buddy={logic.currentBuddy}
      />

      {/* Main Card */}
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Parceiro de Treino
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => logic.tutorial.showTutorial()}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* VS Display */}
          <VSDisplay
            userStats={logic.currentUserStats}
            buddy={logic.currentBuddy}
            userIsWinning={logic.userIsWinning}
            pointsDiff={logic.pointsDiff}
            onBuddyClick={() => logic.setShowBuddyStats(true)}
          />

          {/* Competition Status */}
          <CompetitionStatus
            userIsWinning={logic.userIsWinning}
            pointsDiff={logic.pointsDiff}
          />

          {/* Active Challenge */}
          {activeChallenge && (
            <ActiveChallengeDisplay
              challenge={activeChallenge}
              buddyName={logic.currentBuddy.name}
            />
          )}

          {/* Quick Stats */}
          <QuickStats buddy={logic.currentBuddy} />

          {/* Actions */}
          <BuddyActions
            buddyName={logic.currentBuddy.name}
            onShowProvocations={() => logic.setShowProvocations(true)}
            onShowChallenges={() => logic.setShowChallenges(true)}
            onShowBuddyStats={() => logic.setShowBuddyStats(true)}
          />
        </CardContent>
      </Card>
    </>
  );
};

// Re-export para compatibilidade
export default BuddyWorkoutCard;

// Export types
export type { BuddyStats, ActiveChallenge } from './hooks/useBuddyWorkoutLogic';
