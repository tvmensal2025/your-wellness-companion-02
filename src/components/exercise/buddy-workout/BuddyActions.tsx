// ============================================
// 🎯 BUDDY ACTIONS
// Ações de convite e aceitação
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, MessageCircle, Swords } from 'lucide-react';

interface BuddyActionsProps {
  buddyName: string;
  onShowProvocations: () => void;
  onShowChallenges: () => void;
  onShowBuddyStats: () => void;
}

export const BuddyActions: React.FC<BuddyActionsProps> = ({
  buddyName,
  onShowProvocations,
  onShowChallenges,
  onShowBuddyStats,
}) => {
  return (
    <div className="space-y-2">
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="gap-2"
          onClick={onShowProvocations}
        >
          <MessageCircle className="w-4 h-4" />
          Mandar Msg
        </Button>
        <Button
          className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          onClick={onShowChallenges}
        >
          <Swords className="w-4 h-4" />
          Desafiar!
        </Button>
      </div>

      {/* Ver perfil completo */}
      <Button
        variant="ghost"
        className="w-full text-sm"
        onClick={onShowBuddyStats}
      >
        <Eye className="w-4 h-4 mr-2" />
        Ver evolução completa de {buddyName}
      </Button>
    </div>
  );
};
