// ============================================
// ⚠️ LIMITATION WARNING
// Aviso de limitação física adaptada
// ============================================

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { limitationLabels } from './hooks/useSavedProgramLogic';

interface LimitationWarningProps {
  limitation: string;
}

export const LimitationWarning: React.FC<LimitationWarningProps> = ({ limitation }) => {
  if (!limitation || limitation === 'nenhuma') return null;

  return (
    <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm sm:text-base text-amber-800 dark:text-amber-200">
              Exercícios Adaptados
            </p>
            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
              Seu programa foi ajustado para proteger: {limitationLabels[limitation] || limitation}. 
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
