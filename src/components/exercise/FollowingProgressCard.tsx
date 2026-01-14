// ============================================
// 📊 FOLLOWING PROGRESS CARD
// Mostra progresso de exercícios de quem você segue
// ============================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Flame,
  Dumbbell,
  TrendingUp,
  Calendar,
  Trophy,
  Swords,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFollowingWithStats, FollowingUser } from '@/hooks/exercise/useFollowingWithStats';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FollowingProgressCardProps {
  userId?: string;
  onChallenge?: (user: FollowingUser) => void;
  className?: string;
}

export const FollowingProgressCard: React.FC<FollowingProgressCardProps> = ({
  userId,
  onChallenge,
  className,
}) => {
  const { following, isLoading, refresh } = useFollowingWithStats(userId);
  const [selectedUser, setSelectedUser] = useState<FollowingUser | null>(null);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (following.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Progresso dos Amigos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Siga pessoas na Comunidade para ver o progresso delas aqui!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Modal de detalhes do usuário */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedUser?.avatarUrl} />
                <AvatarFallback>{selectedUser?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{selectedUser?.name}</p>
                {selectedUser?.bio && (
                  <p className="text-sm text-muted-foreground font-normal">
                    {selectedUser.bio}
                  </p>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              {/* Estatísticas principais */}
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  icon={<Flame className="w-4 h-4 text-orange-500" />}
                  label="Dias seguidos"
                  value={selectedUser.consecutiveDays}
                />
                <StatBox
                  icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                  label="Pontos semanais"
                  value={selectedUser.weeklyPoints}
                />
                <StatBox
                  icon={<Dumbbell className="w-4 h-4 text-emerald-500" />}
                  label="Treinos/semana"
                  value={selectedUser.workoutsThisWeek}
                />
                <StatBox
                  icon={<Calendar className="w-4 h-4 text-blue-500" />}
                  label="Treinos/mês"
                  value={selectedUser.workoutsThisMonth}
                />
              </div>

              {/* Total de treinos */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {selectedUser.totalWorkouts}
                </p>
                <p className="text-sm text-muted-foreground">treinos no total</p>
              </div>

              {/* Último treino */}
              {selectedUser.lastWorkoutDate && (
                <p className="text-sm text-center text-muted-foreground">
                  Último treino:{' '}
                  {formatDistanceToNow(new Date(selectedUser.lastWorkoutDate), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              )}

              {/* Botão de desafio */}
              {onChallenge && (
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500"
                  onClick={() => {
                    onChallenge(selectedUser);
                    setSelectedUser(null);
                  }}
                >
                  <Swords className="w-4 h-4 mr-2" />
                  Desafiar para X1
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Card principal */}
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Progresso dos Amigos
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {following.length} seguindo
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {following.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="w-full p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-3 text-left"
                >
                  {/* Posição */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
                      index === 1 && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                      index === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
                      index > 2 && "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {user.consecutiveDays}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 text-emerald-500" />
                        {user.workoutsThisWeek}/sem
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-purple-500" />
                        {user.weeklyPoints}pts
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
};

// Componente auxiliar para estatísticas
const StatBox: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
}> = ({ icon, label, value }) => (
  <div className="p-3 bg-muted/50 rounded-xl text-center">
    <div className="flex items-center justify-center gap-1 mb-1">
      {icon}
      <span className="text-xl font-bold">{value}</span>
    </div>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default FollowingProgressCard;
