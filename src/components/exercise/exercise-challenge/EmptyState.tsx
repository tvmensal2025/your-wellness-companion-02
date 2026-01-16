// ============================================
// EMPTY STATE
// Estados vazios para o card de desafio
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Swords, Users } from 'lucide-react';

interface NoFollowingStateProps {
  onNavigateToCommunity: () => void;
}

export const NoFollowingState: React.FC<NoFollowingStateProps> = ({
  onNavigateToCommunity,
}) => {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950 dark:to-red-950 rounded-full flex items-center justify-center">
        <Users className="w-10 h-10 text-orange-500" />
      </div>
      <div>
        <h3 className="font-bold text-lg">Siga alguém primeiro!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Para desafiar alguém no X1, você precisa seguir a pessoa na Comunidade.
        </p>
      </div>
      <Button variant="outline" onClick={onNavigateToCommunity}>
        <Users className="w-4 h-4 mr-2" />
        Ir para Comunidade
      </Button>
    </div>
  );
};

interface NoChallengeStateProps {
  onCreateChallenge: () => void;
}

export const NoChallengeState: React.FC<NoChallengeStateProps> = ({
  onCreateChallenge,
}) => {
  return (
    <div className="text-center py-4 space-y-3">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950 dark:to-red-950 rounded-full flex items-center justify-center">
        <Swords className="w-8 h-8 text-orange-500" />
      </div>
      <p className="text-sm text-muted-foreground">
        Desafie alguém que você segue!
      </p>
      <Button
        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        onClick={onCreateChallenge}
      >
        <Swords className="w-4 h-4 mr-2" />
        Criar Desafio
      </Button>
    </div>
  );
};
