// ============================================
// CHALLENGE HEADER
// Cabeçalho do card de desafio com badge de pendentes
// ============================================

import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Swords } from 'lucide-react';

interface ChallengeHeaderProps {
  pendingCount: number;
}

export const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({ pendingCount }) => {
  return (
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Swords className="w-5 h-5 text-orange-500" />
          Desafio X1
        </CardTitle>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </CardHeader>
  );
};
