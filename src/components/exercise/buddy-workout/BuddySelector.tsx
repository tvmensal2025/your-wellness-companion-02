// ============================================
// 👥 BUDDY SELECTOR
// Seleção de parceiro de treino
// ============================================

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuddySelectorProps {
  onFindBuddy?: () => void;
  className?: string;
}

export const BuddySelector: React.FC<BuddySelectorProps> = ({
  onFindBuddy,
  className,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 rounded-full flex items-center justify-center">
            <UserPlus className="w-10 h-10 text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Encontre um Parceiro!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Treinar com alguém é mais divertido e motivador
            </p>
          </div>
          <Button 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            onClick={onFindBuddy}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Buscar Parceiro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
