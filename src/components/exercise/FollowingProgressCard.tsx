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
  TrendingDown,
  Calendar,
  Trophy,
  Swords,
  ChevronRight,
  Loader2,
  Check,
  Target,
  Zap,
  Scale,
  Award,
  Percent,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFollowingWithStats, FollowingUser, WeeklyWorkoutDays, WeightEvolution, UserAchievements } from '@/hooks/exercise/useFollowingWithStats';
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
              {/* Calendário Semanal de Treinos - Sempre mostrar */}
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    Treinos esta semana
                  </span>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600">
                    {selectedUser.weeklyWorkoutDays 
                      ? Object.values(selectedUser.weeklyWorkoutDays).filter(Boolean).length 
                      : 0}/7 dias
                  </Badge>
                </div>
                
                {/* Calendário Visual */}
                <div className="flex justify-between gap-1">
                  {(['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const).map((day, idx) => {
                    const didWorkout = selectedUser.weeklyWorkoutDays?.[day] || false;
                    const isToday = idx === new Date().getDay();
                    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                    
                    return (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <span className={cn(
                          "text-[10px] font-medium",
                          isToday ? "text-purple-500" : "text-muted-foreground"
                        )}>
                          {dayLabels[idx]}
                        </span>
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            didWorkout
                              ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30"
                              : isToday
                                ? "bg-purple-500/20 border-2 border-purple-500 text-purple-500"
                                : "bg-muted/50 text-muted-foreground border border-border"
                          )}
                        >
                          {didWorkout ? (
                            <Check className="w-4 h-4" strokeWidth={3} />
                          ) : (
                            <span className="text-xs opacity-50">{day.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Barra de Progresso */}
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                    style={{ 
                      width: `${selectedUser.weeklyWorkoutDays 
                        ? (Object.values(selectedUser.weeklyWorkoutDays).filter(Boolean).length / 7) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Estatísticas principais */}
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  icon={<Flame className="w-4 h-4 text-orange-500" />}
                  label="Dias seguidos"
                  value={selectedUser.consecutiveDays}
                  highlight={selectedUser.consecutiveDays >= 7}
                />
                <StatBox
                  icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                  label="Pontos semanais"
                  value={selectedUser.weeklyPoints}
                  highlight={selectedUser.weeklyPoints >= 100}
                />
                <StatBox
                  icon={<Dumbbell className="w-4 h-4 text-emerald-500" />}
                  label="Treinos/semana"
                  value={selectedUser.workoutsThisWeek}
                  highlight={selectedUser.workoutsThisWeek >= 5}
                />
                <StatBox
                  icon={<Calendar className="w-4 h-4 text-blue-500" />}
                  label="Treinos/mês"
                  value={selectedUser.workoutsThisMonth}
                  highlight={selectedUser.workoutsThisMonth >= 15}
                />
              </div>

              {/* Total de treinos (destaque) */}
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl text-center border border-purple-500/20">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedUser.totalWorkouts}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">treinos no total</p>
                
                {/* Badges de conquista */}
                <div className="flex justify-center gap-2 mt-3 flex-wrap">
                  {selectedUser.totalWorkouts >= 10 && (
                    <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                      <Zap className="w-3 h-3 mr-1" />
                      10+ treinos
                    </Badge>
                  )}
                  {selectedUser.totalWorkouts >= 50 && (
                    <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                      <Target className="w-3 h-3 mr-1" />
                      50+ treinos
                    </Badge>
                  )}
                  {selectedUser.consecutiveDays >= 7 && (
                    <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                      <Flame className="w-3 h-3 mr-1" />
                      1 semana
                    </Badge>
                  )}
                </div>
              </div>

              {/* Evolução de Peso */}
              {selectedUser.weightEvolution?.currentWeight && (
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Evolução Física</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Peso Atual */}
                    <div className="bg-background/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedUser.weightEvolution.currentWeight.toFixed(1)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
                      </p>
                      <p className="text-xs text-muted-foreground">Peso atual</p>
                    </div>
                    
                    {/* Variação */}
                    {selectedUser.weightEvolution.weightChange !== undefined && (
                      <div className="bg-background/50 rounded-lg p-3 text-center">
                        <div className={cn(
                          "text-2xl font-bold flex items-center justify-center gap-1",
                          selectedUser.weightEvolution.weightChange > 0 
                            ? "text-orange-500" 
                            : selectedUser.weightEvolution.weightChange < 0 
                              ? "text-emerald-500" 
                              : "text-muted-foreground"
                        )}>
                          {selectedUser.weightEvolution.weightChange > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : selectedUser.weightEvolution.weightChange < 0 ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : null}
                          {selectedUser.weightEvolution.weightChange > 0 ? '+' : ''}
                          {selectedUser.weightEvolution.weightChange.toFixed(1)}
                          <span className="text-sm font-normal text-muted-foreground">kg</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Variação</p>
                      </div>
                    )}
                  </div>

                  {/* Gordura e Massa Muscular */}
                  {(selectedUser.weightEvolution.bodyFatPercent || selectedUser.weightEvolution.muscleMassKg) && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {selectedUser.weightEvolution.bodyFatPercent && (
                        <div className="bg-background/50 rounded-lg p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-amber-500">
                            <Percent className="w-3 h-3" />
                            <span className="font-bold">{selectedUser.weightEvolution.bodyFatPercent.toFixed(1)}%</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Gordura</p>
                        </div>
                      )}
                      {selectedUser.weightEvolution.muscleMassKg && (
                        <div className="bg-background/50 rounded-lg p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-rose-500">
                            <Activity className="w-3 h-3" />
                            <span className="font-bold">{selectedUser.weightEvolution.muscleMassKg.toFixed(1)}kg</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Músculo</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Conquistas */}
              {selectedUser.achievements && selectedUser.achievements.totalAchievements > 0 && (
                <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">Conquistas</span>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-600">
                      {selectedUser.achievements.totalAchievements} 🏆
                    </Badge>
                  </div>
                  
                  {selectedUser.achievements.recentAchievements.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.achievements.recentAchievements.map((achievement, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="bg-background/50 text-xs"
                        >
                          🎖️ {achievement}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Último treino */}
              {selectedUser.lastWorkoutDate && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Último treino:{' '}
                    <span className="font-medium text-foreground">
                      {formatDistanceToNow(new Date(selectedUser.lastWorkoutDate), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </span>
                </div>
              )}

              {/* Botão de desafio */}
              {onChallenge && (
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
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
                    
                    {/* Mini calendário semanal */}
                    {user.weeklyWorkoutDays && (
                      <div className="flex gap-0.5 mt-1.5">
                        {(['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const).map((day, idx) => {
                          const didWorkout = user.weeklyWorkoutDays[day];
                          const isToday = idx === new Date().getDay();
                          return (
                            <div
                              key={day}
                              className={cn(
                                "w-4 h-4 rounded-full flex items-center justify-center",
                                didWorkout
                                  ? "bg-emerald-500 text-white"
                                  : isToday
                                    ? "bg-purple-500/30 border border-purple-500"
                                    : "bg-muted/50"
                              )}
                            >
                              {didWorkout && <Check className="w-2 h-2" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
  highlight?: boolean;
}> = ({ icon, label, value, highlight }) => (
  <div className={cn(
    "p-3 rounded-xl text-center transition-all",
    highlight 
      ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30" 
      : "bg-muted/50"
  )}>
    <div className="flex items-center justify-center gap-1 mb-1">
      {icon}
      <span className={cn(
        "text-xl font-bold",
        highlight && "text-emerald-600 dark:text-emerald-400"
      )}>
        {value}
      </span>
    </div>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default FollowingProgressCard;
