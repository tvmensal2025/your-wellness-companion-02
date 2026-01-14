// ============================================
// ⚔️ EXERCISE CHALLENGE CARD - X1 SYSTEM
// Sistema de desafios entre usuários que se seguem
// Sem códigos - usa lista de seguidos da comunidade
// ============================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Swords,
  Trophy,
  Flame,
  Zap,
  Clock,
  Target,
  Crown,
  Play,
  Timer,
  Users,
  ChevronRight,
  Dumbbell,
  TrendingUp,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFollowingWithStats, FollowingUser } from '@/hooks/exercise/useFollowingWithStats';
import { useExerciseChallenges, ExerciseChallenge } from '@/hooks/exercise/useExerciseChallenges';

// ============================================
// EXERCISE OPTIONS
// ============================================

const EXERCISE_OPTIONS = [
  { value: 'agachamento', label: 'Agachamento', emoji: '🦵' },
  { value: 'flexao', label: 'Flexão', emoji: '💪' },
  { value: 'polichinelo', label: 'Polichinelo', emoji: '⭐' },
  { value: 'abdominal', label: 'Abdominal', emoji: '🔥' },
  { value: 'burpee', label: 'Burpee', emoji: '🏃' },
  { value: 'prancha', label: 'Prancha (seg)', emoji: '🧘' },
  { value: 'lunges', label: 'Avanço', emoji: '🦿' },
  { value: 'mountain_climber', label: 'Mountain Climber', emoji: '⛰️' },
  { value: 'jumping_jack', label: 'Jumping Jack', emoji: '🌟' },
  { value: 'supino', label: 'Supino (kg)', emoji: '🏋️' },
];

const CHALLENGE_TYPES = [
  { value: 'max_reps', label: 'Máximo de repetições', description: 'Quem fizer mais em 1 minuto' },
  { value: 'first_to', label: 'Primeiro a chegar', description: 'Quem completar X primeiro' },
  { value: 'timed', label: 'Tempo fixo', description: 'Quem fizer mais no tempo' },
];

// ============================================
// PROPS
// ============================================

interface ExerciseChallengeCardProps {
  userId?: string;
  className?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ExerciseChallengeCard: React.FC<ExerciseChallengeCardProps> = ({
  userId,
  className,
}) => {
  const { toast } = useToast();
  
  // Hooks
  const { following, isLoading: loadingFollowing } = useFollowingWithStats(userId);
  const {
    activeChallenges,
    receivedPending,
    completedChallenges,
    isLoading: loadingChallenges,
    createChallenge,
    acceptChallenge,
    declineChallenge,
    startChallenge,
    updateProgress,
    completeChallenge,
    isCreating,
    isAccepting,
  } = useExerciseChallenges(userId);

  // State
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FollowingUser | null>(null);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [challengeType, setChallengeType] = useState('max_reps');
  const [targetValue, setTargetValue] = useState(50);

  const loading = loadingFollowing || loadingChallenges;

  // Handlers
  const handleSelectUser = (user: FollowingUser) => {
    setSelectedUser(user);
    setShowFollowingList(false);
    setShowCreateChallenge(true);
  };

  const handleCreateChallenge = async () => {
    if (!selectedUser || !selectedExercise) {
      toast({ title: "Selecione um exercício", variant: "destructive" });
      return;
    }

    const exercise = EXERCISE_OPTIONS.find(e => e.value === selectedExercise);

    try {
      await createChallenge({
        challengedId: selectedUser.id,
        exerciseName: exercise?.label || selectedExercise,
        exerciseEmoji: exercise?.emoji || '💪',
        challengeType: challengeType as any,
        targetValue: challengeType === 'first_to' ? targetValue : undefined,
        durationSeconds: challengeType === 'timed' ? targetValue : 60,
      });

      setShowCreateChallenge(false);
      setSelectedUser(null);
      setSelectedExercise('');
      
      toast({
        title: "⚔️ Desafio enviado!",
        description: `${selectedUser.name} foi desafiado para ${exercise?.label}!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar desafio",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAcceptChallenge = async (challenge: ExerciseChallenge) => {
    try {
      await acceptChallenge(challenge.id);
      toast({
        title: "🔥 Desafio aceito!",
        description: "Que comece a competição!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao aceitar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeclineChallenge = async (challenge: ExerciseChallenge) => {
    try {
      await declineChallenge(challenge.id);
      toast({ title: "Desafio recusado" });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartChallenge = async (challenge: ExerciseChallenge) => {
    try {
      await startChallenge(challenge.id);
      toast({
        title: "🏁 Desafio iniciado!",
        description: "Boa sorte!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProgress = async (challenge: ExerciseChallenge, increment: number) => {
    try {
      const newProgress = challenge.myProgress + increment;
      await updateProgress({ challengeId: challenge.id, progress: newProgress });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCompleteChallenge = async (challenge: ExerciseChallenge) => {
    try {
      const result = await completeChallenge(challenge.id);
      const isWinner = result.winner_id === userId;
      toast({
        title: isWinner ? "🏆 Você venceu!" : "Desafio finalizado",
        description: isWinner ? "Parabéns pela vitória!" : "Boa tentativa!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao finalizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Desafio ativo atual (prioridade)
  const currentChallenge = activeChallenges[0];

  // Se não segue ninguém
  if (!loading && following.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Swords className="w-5 h-5 text-orange-500" />
            Desafio X1
          </CardTitle>
        </CardHeader>
        <CardContent>
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
            <Button
              variant="outline"
              onClick={() => {
                // Navegar para comunidade
                window.location.href = '/comunidade';
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Ir para Comunidade
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Modal: Lista de Seguidos */}
      <Dialog open={showFollowingList} onOpenChange={setShowFollowingList}>
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

          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {following.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors flex items-center gap-3 text-left"
                >
                  <Avatar className="w-12 h-12 border-2 border-purple-500/30">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {user.consecutiveDays} dias
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 text-emerald-500" />
                        {user.workoutsThisWeek} treinos/sem
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal: Criar Desafio */}
      <Dialog open={showCreateChallenge} onOpenChange={setShowCreateChallenge}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-orange-500" />
              Criar Desafio
            </DialogTitle>
            {selectedUser && (
              <DialogDescription>
                Desafie {selectedUser.name} para um X1!
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              {/* Oponente selecionado */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedUser.weeklyPoints} pts esta semana
                  </p>
                </div>
              </div>

              {/* Exercício */}
              <div>
                <label className="text-sm font-medium mb-2 block">Exercício</label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o exercício" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_OPTIONS.map((ex) => (
                      <SelectItem key={ex.value} value={ex.value}>
                        <span className="flex items-center gap-2">
                          <span>{ex.emoji}</span>
                          <span>{ex.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de desafio */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select value={challengeType} onValueChange={setChallengeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHALLENGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meta (se aplicável) */}
              {challengeType === 'first_to' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Meta de repetições</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setTargetValue(Math.max(10, targetValue - 10))}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      className="text-center text-xl font-bold"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setTargetValue(targetValue + 10)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}

              {challengeType === 'timed' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Tempo (segundos)</label>
                  <div className="flex gap-2">
                    {[30, 60, 90, 120].map((time) => (
                      <Button
                        key={time}
                        variant={targetValue === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTargetValue(time)}
                        className="flex-1"
                      >
                        {time}s
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500"
                onClick={handleCreateChallenge}
                disabled={isCreating || !selectedExercise}
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Swords className="w-4 h-4 mr-2" />
                )}
                Desafiar!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Card Principal */}
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Swords className="w-5 h-5 text-orange-500" />
              Desafio X1
            </CardTitle>
            {receivedPending.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {receivedPending.length} pendente{receivedPending.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Desafios recebidos pendentes */}
              {receivedPending.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Desafios Recebidos
                  </p>
                  {receivedPending.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={challenge.opponentAvatar} />
                          <AvatarFallback>{challenge.opponentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{challenge.opponentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {challenge.exerciseEmoji} {challenge.exerciseName}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => handleAcceptChallenge(challenge)}
                          disabled={isAccepting}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineChallenge(challenge)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Desafio ativo */}
              {currentChallenge ? (
                <ActiveChallengeView
                  challenge={currentChallenge}
                  userId={userId}
                  onStart={() => handleStartChallenge(currentChallenge)}
                  onUpdateProgress={(inc) => handleUpdateProgress(currentChallenge, inc)}
                  onComplete={() => handleCompleteChallenge(currentChallenge)}
                />
              ) : (
                /* Sem desafio ativo */
                <div className="text-center py-4 space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950 dark:to-red-950 rounded-full flex items-center justify-center">
                    <Swords className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Desafie alguém que você segue!
                  </p>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    onClick={() => setShowFollowingList(true)}
                  >
                    <Swords className="w-4 h-4 mr-2" />
                    Criar Desafio
                  </Button>
                </div>
              )}

              {/* Histórico recente */}
              {completedChallenges.length > 0 && !currentChallenge && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Últimos desafios
                  </p>
                  <div className="space-y-1">
                    {completedChallenges.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30"
                      >
                        <span>
                          {c.exerciseEmoji} vs {c.opponentName}
                        </span>
                        <Badge
                          variant={c.winnerId === userId ? 'default' : 'secondary'}
                          className={cn(
                            c.winnerId === userId && 'bg-emerald-500'
                          )}
                        >
                          {c.winnerId === userId ? '🏆 Vitória' : c.winnerId ? 'Derrota' : 'Empate'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

// ============================================
// ACTIVE CHALLENGE VIEW
// ============================================

interface ActiveChallengeViewProps {
  challenge: ExerciseChallenge;
  userId?: string;
  onStart: () => void;
  onUpdateProgress: (increment: number) => void;
  onComplete: () => void;
}

const ActiveChallengeView: React.FC<ActiveChallengeViewProps> = ({
  challenge,
  userId,
  onStart,
  onUpdateProgress,
  onComplete,
}) => {
  const isWinner = challenge.winnerId === userId;
  const isLoser = challenge.winnerId && challenge.winnerId !== userId;
  const isTie = challenge.status === 'completed' && !challenge.winnerId;

  return (
    <div className="space-y-3">
      {/* Info do desafio */}
      <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl">
        <span className="text-4xl">{challenge.exerciseEmoji}</span>
        <h3 className="font-bold text-lg mt-2">{challenge.exerciseName}</h3>
        <p className="text-sm text-muted-foreground">
          {challenge.challengeType === 'max_reps' && `Máximo em ${challenge.durationSeconds}s`}
          {challenge.challengeType === 'first_to' && `Primeiro a fazer ${challenge.targetValue}`}
          {challenge.challengeType === 'timed' && `${challenge.durationSeconds}s de tempo`}
        </p>
        <Badge
          variant="secondary"
          className={cn(
            "mt-2",
            challenge.status === 'active' && "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
            challenge.status === 'accepted' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
            challenge.status === 'completed' && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          )}
        >
          {challenge.status === 'active' && '🔥 Em andamento'}
          {challenge.status === 'accepted' && '✅ Aceito - Pronto para iniciar'}
          {challenge.status === 'completed' && '✅ Finalizado'}
        </Badge>
      </div>

      {/* Placar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <p className="text-3xl font-bold text-emerald-600">{challenge.myProgress}</p>
          <p className="text-xs text-muted-foreground">Você</p>
        </div>
        <div className="text-2xl font-bold text-muted-foreground">VS</div>
        <div className="flex-1 text-center">
          <p className="text-3xl font-bold text-purple-600">{challenge.opponentProgress}</p>
          <p className="text-xs text-muted-foreground">{challenge.opponentName}</p>
        </div>
      </div>

      {/* Progresso (para first_to) */}
      {challenge.challengeType === 'first_to' && challenge.targetValue && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Você: {Math.round((challenge.myProgress / challenge.targetValue) * 100)}%</span>
            <span>{challenge.opponentName}: {Math.round((challenge.opponentProgress / challenge.targetValue) * 100)}%</span>
          </div>
          <div className="flex gap-1">
            <Progress
              value={(challenge.myProgress / challenge.targetValue) * 100}
              className="h-2 flex-1"
            />
            <Progress
              value={(challenge.opponentProgress / challenge.targetValue) * 100}
              className="h-2 flex-1 [&>div]:bg-purple-500"
            />
          </div>
        </div>
      )}

      {/* Ações */}
      {challenge.status === 'accepted' && (
        <Button
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
          onClick={onStart}
        >
          <Play className="w-4 h-4 mr-2" />
          Iniciar Desafio!
        </Button>
      )}

      {challenge.status === 'active' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[1, 5, 10].map((increment) => (
              <Button
                key={increment}
                variant="outline"
                onClick={() => onUpdateProgress(increment)}
                className="text-lg font-bold"
              >
                +{increment}
              </Button>
            ))}
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={onComplete}
          >
            <Timer className="w-4 h-4 mr-2" />
            Finalizar Desafio
          </Button>
        </div>
      )}

      {challenge.status === 'completed' && (
        <div
          className={cn(
            "p-4 rounded-xl text-center",
            isWinner && "bg-emerald-50 dark:bg-emerald-950/30",
            isLoser && "bg-orange-50 dark:bg-orange-950/30",
            isTie && "bg-muted"
          )}
        >
          {isWinner && (
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                Você venceu! 🎉
              </span>
            </div>
          )}
          {isLoser && (
            <div className="flex items-center justify-center gap-2">
              <Target className="w-6 h-6 text-orange-500" />
              <span className="font-bold text-orange-700 dark:text-orange-300">
                {challenge.opponentName} venceu!
              </span>
            </div>
          )}
          {isTie && <span className="font-bold">Empate! 🤝</span>}
        </div>
      )}
    </div>
  );
};

export default ExerciseChallengeCard;
