// ============================================
// OPPONENT SELECTOR
// Dialog para selecionar oponente da lista de seguidos
// ============================================

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Flame, 
  ChevronRight, 
  Trophy,
} from 'lucide-react';
import { FollowingUser } from '@/hooks/exercise/useFollowingWithStats';

interface OpponentSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  following: FollowingUser[];
  onSelectUser: (user: FollowingUser) => void;
}

export const OpponentSelector: React.FC<OpponentSelectorProps> = ({
  open,
  onOpenChange,
  following,
  onSelectUser,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Escolher Oponente
          </DialogTitle>
          <DialogDescription>
            Selecione alguém que você segue para desafiar
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 pr-2">
            {following.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-purple-500/10 hover:to-orange-500/10 border border-transparent hover:border-purple-500/30 transition-all flex items-center gap-4 text-left group"
              >
                {/* Avatar Grande */}
                <Avatar className="w-16 h-16 border-2 border-purple-500/30 group-hover:border-purple-500/60 transition-colors">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="bg-purple-500/20 text-purple-500 font-bold text-xl">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Info Simplificada */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{user.name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      {user.consecutiveDays}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      {user.weeklyPoints}
                    </span>
                  </div>
                </div>
                
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-purple-500 transition-colors" />
              </button>
            ))}

            {following.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Você ainda não segue ninguém</p>
                <p className="text-sm">Vá para a comunidade e siga outros usuários!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
