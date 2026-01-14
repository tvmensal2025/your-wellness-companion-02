// ============================================
// 🤝 BUDDY WORKOUT CARD
// Card interativo de parceiro de treino
// Com desafios, provocações e evolução
// ============================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Trophy,
  Zap,
  Flame,
  Target,
  TrendingUp,
  Dumbbell,
  MessageCircle,
  Send,
  Crown,
  Swords,
  Gift,
  PartyPopper,
  ThumbsUp,
  Eye,
  Calendar,
  Weight,
  Activity,
  ChevronRight,
  HelpCircle,
  UserPlus,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  FeatureTutorialPopup, 
  useFeatureTutorial 
} from './FeatureTutorialPopup';

// ============================================
// TYPES
// ============================================

interface BuddyStats {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  // Estatísticas de treino
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  totalWorkouts: number;
  consecutiveDays: number; // "dias seguidos" ao invés de streak
  // Evolução física
  currentWeight?: number;
  weightChange?: number; // positivo = ganhou, negativo = perdeu
  // Pontos e ranking
  weeklyPoints: number;
  monthlyPoints: number;
  // Último treino
  lastWorkoutDate?: string;
  lastWorkoutType?: string;
  // Desafios
  challengesWon: number;
  challengesLost: number;
}

interface ActiveChallenge {
  id: string;
  type: 'weight_increase' | 'more_workouts' | 'more_reps' | 'consistency';
  title: string;
  description: string;
  createdBy: 'user' | 'buddy';
  targetValue: number;
  userProgress: number;
  buddyProgress: number;
  endsAt: Date;
  prize?: string;
}

interface Provocation {
  id: string;
  type: 'taunt' | 'cheer' | 'challenge' | 'celebrate';
  message: string;
  emoji: string;
}

interface BuddyWorkoutCardProps {
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
// PROVOCATIONS DATA
// ============================================

const PROVOCATIONS: Provocation[] = [
  // Provocações divertidas
  { id: '1', type: 'taunt', message: 'Tá leve demais! Bora aumentar o peso! 💪', emoji: '😏' },
  { id: '2', type: 'taunt', message: 'Só isso? Achei que você era forte! 🏋️', emoji: '😤' },
  { id: '3', type: 'taunt', message: 'Meu avô levanta mais que isso! 👴', emoji: '😂' },
  { id: '4', type: 'taunt', message: 'Cadê o treino hoje? Tá com preguiça? 😴', emoji: '🦥' },
  // Incentivos
  { id: '5', type: 'cheer', message: 'Você consegue! Mais uma série! 🔥', emoji: '💪' },
  { id: '6', type: 'cheer', message: 'Tá voando! Continue assim! 🚀', emoji: '⭐' },
  { id: '7', type: 'cheer', message: 'Orgulho de treinar com você! 🤝', emoji: '❤️' },
  // Celebrações
  { id: '8', type: 'celebrate', message: 'RECORDEEE! Você é fera! 🏆', emoji: '🎉' },
  { id: '9', type: 'celebrate', message: 'Mais um treino completo! 💯', emoji: '🔥' },
  // Desafios
  { id: '10', type: 'challenge', message: 'Aposto que não faz 20 flexões! 😈', emoji: '🎯' },
  { id: '11', type: 'challenge', message: 'Quem treinar mais essa semana paga o açaí! 🍨', emoji: '🏆' },
];

const CHALLENGE_TEMPLATES = [
  {
    type: 'more_workouts',
    title: 'Maratona de Treinos',
    description: 'Quem treinar mais vezes essa semana vence!',
    icon: '🏃',
    targetValue: 5,
  },
  {
    type: 'weight_increase',
    title: 'Desafio do Peso',
    description: 'Quem aumentar mais peso no supino vence!',
    icon: '🏋️',
    targetValue: 5,
  },
  {
    type: 'consistency',
    title: 'Sequência Perfeita',
    description: 'Quem mantiver mais dias seguidos treinando!',
    icon: '🔥',
    targetValue: 7,
  },
  {
    type: 'more_reps',
    title: 'Rei das Repetições',
    description: 'Quem fizer mais repetições totais na semana!',
    icon: '💪',
    targetValue: 500,
  },
];

// ============================================
// HELPER COMPONENTS
// ============================================

const StatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}> = ({ icon, label, value, trend, color = 'text-muted-foreground' }) => (
  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
    <div className={cn("p-1.5 rounded-md bg-background", color)}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground truncate">{label}</p>
      <div className="flex items-center gap-1">
        <span className="font-bold text-sm">{value}</span>
        {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
        {trend === 'down' && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
      </div>
    </div>
  </div>
);

const OnlineIndicator: React.FC<{ isOnline?: boolean }> = ({ isOnline }) => (
  <span
    className={cn(
      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
      isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
    )}
  />
);

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
  const [showProvocations, setShowProvocations] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showBuddyStats, setShowBuddyStats] = useState(false);
  
  const tutorial = useFeatureTutorial('parceiro_treino');

  // Mock data se não tiver buddy
  const mockBuddy: BuddyStats = {
    id: 'mock',
    name: 'Carlos',
    isOnline: true,
    workoutsThisWeek: 4,
    workoutsThisMonth: 15,
    totalWorkouts: 89,
    consecutiveDays: 7,
    currentWeight: 78.5,
    weightChange: -2.3,
    weeklyPoints: 1250,
    monthlyPoints: 4800,
    lastWorkoutDate: 'Hoje',
    lastWorkoutType: 'Peito e Tríceps',
    challengesWon: 5,
    challengesLost: 3,
  };

  const mockUserStats: BuddyStats = {
    id: 'user',
    name: 'Você',
    workoutsThisWeek: 3,
    workoutsThisMonth: 12,
    totalWorkouts: 67,
    consecutiveDays: 5,
    currentWeight: 82.0,
    weightChange: -1.5,
    weeklyPoints: 980,
    monthlyPoints: 3900,
    challengesWon: 3,
    challengesLost: 5,
  };

  const currentBuddy = buddy || mockBuddy;
  const currentUserStats = userStats || mockUserStats;

  // Se não tem parceiro
  if (!buddy && !mockBuddy) {
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
  }

  const userIsWinning = currentUserStats.weeklyPoints > currentBuddy.weeklyPoints;
  const pointsDiff = Math.abs(currentUserStats.weeklyPoints - currentBuddy.weeklyPoints);

  return (
    <>
      {/* Tutorial Popup */}
      <FeatureTutorialPopup
        feature="parceiro_treino"
        isOpen={tutorial.isOpen}
        onClose={tutorial.closeTutorial}
      />

      {/* Provocations Modal */}
      <Dialog open={showProvocations} onOpenChange={setShowProvocations}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-500" />
              Mandar Mensagem
            </DialogTitle>
            <DialogDescription>
              Motive ou provoque seu parceiro! 😈
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
            {PROVOCATIONS.map((prov) => (
              <Button
                key={prov.id}
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => {
                  onSendProvocation?.(prov.type, prov.message);
                  setShowProvocations(false);
                }}
              >
                <span className="text-2xl mr-3">{prov.emoji}</span>
                <span className="text-sm text-left">{prov.message}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Challenge Modal */}
      <Dialog open={showChallenges} onOpenChange={setShowChallenges}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-orange-500" />
              Criar Desafio
            </DialogTitle>
            <DialogDescription>
              Desafie {currentBuddy.name} para uma competição!
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            {CHALLENGE_TEMPLATES.map((challenge) => (
              <Card
                key={challenge.type}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  onCreateChallenge?.();
                  setShowChallenges(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{challenge.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-bold">{challenge.title}</h4>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Buddy Stats Modal */}
      <Dialog open={showBuddyStats} onOpenChange={setShowBuddyStats}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Evolução de {currentBuddy.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Avatar e status */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="relative">
                <Avatar className="w-16 h-16 border-4 border-purple-500">
                  <AvatarImage src={currentBuddy.avatarUrl} />
                  <AvatarFallback className="text-xl">{currentBuddy.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <OnlineIndicator isOnline={currentBuddy.isOnline} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{currentBuddy.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentBuddy.isOnline ? '🟢 Online agora' : '⚪ Offline'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Último treino: {currentBuddy.lastWorkoutDate}
                </p>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-3">
              <StatItem
                icon={<Dumbbell className="w-4 h-4 text-blue-500" />}
                label="Treinos esta semana"
                value={currentBuddy.workoutsThisWeek}
                color="text-blue-500"
              />
              <StatItem
                icon={<Calendar className="w-4 h-4 text-purple-500" />}
                label="Treinos no mês"
                value={currentBuddy.workoutsThisMonth}
                color="text-purple-500"
              />
              <StatItem
                icon={<Flame className="w-4 h-4 text-orange-500" />}
                label="Dias seguidos"
                value={`${currentBuddy.consecutiveDays} dias`}
                color="text-orange-500"
              />
              <StatItem
                icon={<Zap className="w-4 h-4 text-amber-500" />}
                label="Pontos semanais"
                value={currentBuddy.weeklyPoints.toLocaleString()}
                color="text-amber-500"
              />
              {currentBuddy.currentWeight && (
                <StatItem
                  icon={<Weight className="w-4 h-4 text-emerald-500" />}
                  label="Peso atual"
                  value={`${currentBuddy.currentWeight} kg`}
                  trend={currentBuddy.weightChange && currentBuddy.weightChange < 0 ? 'down' : 'up'}
                  color="text-emerald-500"
                />
              )}
              <StatItem
                icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                label="Desafios vencidos"
                value={`${currentBuddy.challengesWon}/${currentBuddy.challengesWon + currentBuddy.challengesLost}`}
                color="text-yellow-500"
              />
            </div>

            {/* Último treino */}
            {currentBuddy.lastWorkoutType && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Último treino:</span>{' '}
                  {currentBuddy.lastWorkoutType}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
              onClick={() => tutorial.showTutorial()}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* VS Display */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 via-transparent to-purple-50 dark:from-emerald-950/30 dark:to-purple-950/30 rounded-xl">
            {/* Você */}
            <div className="text-center flex-1">
              <Avatar className="w-14 h-14 mx-auto border-3 border-emerald-500 shadow-lg">
                <AvatarFallback className="bg-emerald-100 text-emerald-700">Eu</AvatarFallback>
              </Avatar>
              <p className="font-bold text-sm mt-1">Você</p>
              <div className="flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="font-bold text-sm">{currentUserStats.weeklyPoints}</span>
              </div>
            </div>

            {/* VS Badge */}
            <div className="px-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg",
                userIsWinning 
                  ? "bg-gradient-to-br from-emerald-500 to-green-600" 
                  : "bg-gradient-to-br from-orange-500 to-red-600"
              )}>
                VS
              </div>
              <p className="text-[10px] text-center mt-1 text-muted-foreground">
                {pointsDiff} pts
              </p>
            </div>

            {/* Parceiro */}
            <div 
              className="text-center flex-1 cursor-pointer"
              onClick={() => setShowBuddyStats(true)}
            >
              <div className="relative inline-block">
                <Avatar className="w-14 h-14 border-3 border-purple-500 shadow-lg">
                  <AvatarImage src={currentBuddy.avatarUrl} />
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {currentBuddy.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <OnlineIndicator isOnline={currentBuddy.isOnline} />
              </div>
              <p className="font-bold text-sm mt-1">{currentBuddy.name}</p>
              <div className="flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="font-bold text-sm">{currentBuddy.weeklyPoints}</span>
              </div>
            </div>
          </div>

          {/* Status da competição */}
          <div className={cn(
            "p-3 rounded-lg text-center",
            userIsWinning
              ? "bg-emerald-50 dark:bg-emerald-950/30"
              : "bg-orange-50 dark:bg-orange-950/30"
          )}>
            {userIsWinning ? (
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-700 dark:text-emerald-300">
                  Você está {pointsDiff} pontos na frente! 🔥
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-700 dark:text-orange-300">
                  Faltam {pointsDiff} pontos para alcançar! 💪
                </span>
              </div>
            )}
          </div>

          {/* Desafio ativo */}
          {activeChallenge && (
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Swords className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-sm">{activeChallenge.title}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  Ativo
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{activeChallenge.description}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Você: {activeChallenge.userProgress}</span>
                  <span>{currentBuddy.name}: {activeChallenge.buddyProgress}</span>
                </div>
                <div className="flex gap-1">
                  <Progress 
                    value={(activeChallenge.userProgress / activeChallenge.targetValue) * 100} 
                    className="h-2 flex-1"
                  />
                  <Progress 
                    value={(activeChallenge.buddyProgress / activeChallenge.targetValue) * 100} 
                    className="h-2 flex-1 [&>div]:bg-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-muted/50 rounded-lg">
              <Dumbbell className="w-4 h-4 mx-auto text-blue-500 mb-1" />
              <p className="font-bold text-sm">{currentBuddy.workoutsThisWeek}</p>
              <p className="text-[10px] text-muted-foreground">Treinos/sem</p>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <Flame className="w-4 h-4 mx-auto text-orange-500 mb-1" />
              <p className="font-bold text-sm">{currentBuddy.consecutiveDays}</p>
              <p className="text-[10px] text-muted-foreground">Dias seguidos</p>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <Trophy className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
              <p className="font-bold text-sm">{currentBuddy.challengesWon}</p>
              <p className="text-[10px] text-muted-foreground">Vitórias</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowProvocations(true)}
            >
              <MessageCircle className="w-4 h-4" />
              Mandar Msg
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={() => setShowChallenges(true)}
            >
              <Swords className="w-4 h-4" />
              Desafiar!
            </Button>
          </div>

          {/* Ver perfil completo */}
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => setShowBuddyStats(true)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver evolução completa de {currentBuddy.name}
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default BuddyWorkoutCard;
