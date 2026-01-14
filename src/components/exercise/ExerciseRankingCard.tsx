// ============================================
// 🏆 EXERCISE RANKING CARD
// Ranking específico para treino com abas:
// - Ranking Geral (Treino)
// - Ranking do Grupo
// - Ranking com Parceiro
// ============================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Users,
  UserPlus,
  Crown,
  Zap,
  Flame,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  FeatureTutorialPopup, 
  useFeatureTutorial 
} from './FeatureTutorialPopup';

// ============================================
// TYPES
// ============================================

interface RankingUser {
  id: string;
  name: string;
  avatarUrl?: string;
  points: number;
  consecutiveDays?: number; // "dias seguidos" ao invés de streak
  workoutsThisWeek?: number;
  isCurrentUser?: boolean;
  position: number;
}

interface GroupInfo {
  id: string;
  name: string;
  memberCount: number;
}

interface BuddyInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  points: number;
  consecutiveDays?: number;
  isOnline?: boolean;
}

interface ExerciseRankingCardProps {
  // Ranking geral
  generalRanking?: RankingUser[];
  userPosition?: number;
  userPoints?: number;
  
  // Ranking do grupo
  groupRanking?: RankingUser[];
  currentGroup?: GroupInfo;
  availableGroups?: GroupInfo[];
  
  // Ranking com parceiro
  buddyRanking?: {
    user: RankingUser;
    buddy: RankingUser;
  };
  currentBuddy?: BuddyInfo;
  
  // Actions
  onViewFullRanking?: () => void;
  onJoinGroup?: (groupId: string) => void;
  onFindBuddy?: () => void;
  onViewBuddyProfile?: (buddyId: string) => void;
  
  className?: string;
  isLoading?: boolean;
}

// ============================================
// HELPER COMPONENTS
// ============================================

const PositionBadge: React.FC<{ position: number }> = ({ position }) => {
  const getStyle = () => {
    if (position === 1) return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white';
    if (position === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800';
    if (position === 3) return 'bg-gradient-to-br from-amber-600 to-orange-700 text-white';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <span className={cn(
      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
      getStyle()
    )}>
      {position <= 3 ? <Crown className="w-3.5 h-3.5" /> : position}
    </span>
  );
};

const RankingRow: React.FC<{ 
  user: RankingUser; 
  showConsecutiveDays?: boolean;
  onClick?: () => void;
}> = ({ user, showConsecutiveDays = true, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "flex items-center justify-between p-2.5 rounded-lg transition-colors",
      user.isCurrentUser
        ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
        : "bg-muted/50 hover:bg-muted",
      onClick && "cursor-pointer"
    )}
  >
    <div className="flex items-center gap-2.5">
      <PositionBadge position={user.position} />
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.avatarUrl} loading="lazy" />
        <AvatarFallback className="text-xs">
          {user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div>
        <span className="text-sm font-medium">
          {user.isCurrentUser ? 'Você' : user.name}
        </span>
        {showConsecutiveDays && user.consecutiveDays && user.consecutiveDays > 0 && (
          <div className="flex items-center gap-1 text-xs text-orange-500">
            <Flame className="w-3 h-3" />
            {user.consecutiveDays} dias seguidos
          </div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1.5">
      <Zap className="w-4 h-4 text-amber-500" />
      <span className="font-bold text-sm">{user.points.toLocaleString()}</span>
    </div>
  </div>
);

const TutorialButton: React.FC<{ 
  onClick: () => void;
  label?: string;
}> = ({ onClick, label }) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
    title={label || "Como funciona?"}
  >
    <HelpCircle className="w-4 h-4" />
  </Button>
);

// ============================================
// MOCK DATA (fallback quando não há dados reais)
// ============================================

const getMockGeneralRanking = (): RankingUser[] => [
  { id: '1', name: 'Maria S.', points: 2450, consecutiveDays: 15, position: 1, workoutsThisWeek: 5 },
  { id: '2', name: 'João P.', points: 2380, consecutiveDays: 12, position: 2, workoutsThisWeek: 4 },
  { id: '3', name: 'Ana C.', points: 2210, consecutiveDays: 8, position: 3, workoutsThisWeek: 6 },
  { id: 'current', name: 'Você', points: 1850, consecutiveDays: 5, position: 4, isCurrentUser: true, workoutsThisWeek: 3 },
  { id: '5', name: 'Pedro M.', points: 1720, consecutiveDays: 3, position: 5, workoutsThisWeek: 3 },
];

const getMockGroupRanking = (): RankingUser[] => [
  { id: '1', name: 'Carlos', points: 890, consecutiveDays: 7, position: 1 },
  { id: 'current', name: 'Você', points: 750, consecutiveDays: 5, position: 2, isCurrentUser: true },
  { id: '3', name: 'Fernanda', points: 680, consecutiveDays: 4, position: 3 },
];

const getMockBuddyInfo = (): BuddyInfo => ({
  id: 'buddy1',
  name: 'Carlos',
  points: 1650,
  consecutiveDays: 7,
  isOnline: true,
});

const getMockBuddyRanking = () => ({
  user: { id: 'current', name: 'Você', points: 1850, consecutiveDays: 5, position: 1, isCurrentUser: true, avatarUrl: undefined },
  buddy: { id: 'buddy1', name: 'Carlos', points: 1650, consecutiveDays: 7, position: 2, avatarUrl: undefined },
});

const getMockGroupInfo = (): GroupInfo => ({
  id: 'group1',
  name: 'Força Total 💪',
  memberCount: 12,
});

// ============================================
// MAIN COMPONENT
// ============================================

export const ExerciseRankingCard: React.FC<ExerciseRankingCardProps> = ({
  generalRanking: externalGeneralRanking,
  userPosition = 4,
  userPoints = 1850,
  groupRanking: externalGroupRanking,
  currentGroup: externalCurrentGroup,
  availableGroups = [],
  buddyRanking: externalBuddyRanking,
  currentBuddy: externalCurrentBuddy,
  onViewFullRanking,
  onJoinGroup,
  onFindBuddy,
  onViewBuddyProfile,
  className,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState('treino');
  
  // Tutorial hooks
  const treinoTutorial = useFeatureTutorial('ranking_treino');
  const grupoTutorial = useFeatureTutorial('ranking_grupo');
  const parceiroTutorial = useFeatureTutorial('ranking_parceiro');

  // Use mock data if no external data
  const generalRanking = externalGeneralRanking || getMockGeneralRanking();
  const groupRanking = externalGroupRanking || getMockGroupRanking();
  const currentGroup = externalCurrentGroup || getMockGroupInfo();
  const currentBuddy = externalCurrentBuddy || getMockBuddyInfo();
  const buddyRanking = externalBuddyRanking || getMockBuddyRanking();

  // Handle tab click with tutorial
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    
    // Show tutorial on first click
    if (tab === 'treino' && treinoTutorial.shouldShow) {
      treinoTutorial.showTutorial();
    } else if (tab === 'grupo' && grupoTutorial.shouldShow) {
      grupoTutorial.showTutorial();
    } else if (tab === 'parceiro' && parceiroTutorial.shouldShow) {
      parceiroTutorial.showTutorial();
    }
  };

  return (
    <>
      {/* Tutorial Popups */}
      <FeatureTutorialPopup
        feature="ranking_treino"
        isOpen={treinoTutorial.isOpen}
        onClose={treinoTutorial.closeTutorial}
      />
      <FeatureTutorialPopup
        feature="ranking_grupo"
        isOpen={grupoTutorial.isOpen}
        onClose={grupoTutorial.closeTutorial}
      />
      <FeatureTutorialPopup
        feature="ranking_parceiro"
        isOpen={parceiroTutorial.isOpen}
        onClose={parceiroTutorial.closeTutorial}
      />

      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Ranking de Treino
            </CardTitle>
            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              #{userPosition} • {userPoints.toLocaleString()} pts
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <Tabs value={activeTab} onValueChange={handleTabClick}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="treino" className="text-xs gap-1">
                <Trophy className="w-3.5 h-3.5" />
                Treino
              </TabsTrigger>
              <TabsTrigger value="grupo" className="text-xs gap-1">
                <Users className="w-3.5 h-3.5" />
                Grupo
              </TabsTrigger>
              <TabsTrigger value="parceiro" className="text-xs gap-1">
                <UserPlus className="w-3.5 h-3.5" />
                Parceiro
              </TabsTrigger>
            </TabsList>

            {/* TAB: Ranking Geral de Treino */}
            <TabsContent value="treino" className="space-y-3 mt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Top 5 da semana</span>
                <TutorialButton 
                  onClick={() => treinoTutorial.showTutorial()} 
                  label="Como funciona o ranking?"
                />
              </div>
              
              <div className="space-y-2">
                {generalRanking.slice(0, 5).map((user) => (
                  <RankingRow key={user.id} user={user} />
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full text-sm"
                onClick={onViewFullRanking}
              >
                Ver ranking completo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </TabsContent>

            {/* TAB: Ranking do Grupo */}
            <TabsContent value="grupo" className="space-y-3 mt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {currentGroup ? currentGroup.name : 'Nenhum grupo'}
                </span>
                <TutorialButton 
                  onClick={() => grupoTutorial.showTutorial()} 
                  label="Como funciona o ranking de grupo?"
                />
              </div>

              {currentGroup ? (
                <>
                  <div className="space-y-2">
                    {groupRanking.slice(0, 5).map((user) => (
                      <RankingRow key={user.id} user={user} />
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{currentGroup.memberCount} membros</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Ver grupo
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Entre em um grupo!</p>
                    <p className="text-sm text-muted-foreground">
                      Compita com outros membros e se motive
                    </p>
                  </div>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => onJoinGroup?.('')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Encontrar grupos
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* TAB: Ranking com Parceiro */}
            <TabsContent value="parceiro" className="space-y-3 mt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {currentBuddy ? `Você vs ${currentBuddy.name}` : 'Sem parceiro'}
                </span>
                <TutorialButton 
                  onClick={() => parceiroTutorial.showTutorial()} 
                  label="Como funciona o ranking com parceiro?"
                />
              </div>

              {currentBuddy && buddyRanking ? (
                <>
                  {/* VS Display */}
                  <div className="flex items-center justify-center gap-4 py-4">
                    {/* Você */}
                    <div className="text-center">
                      <Avatar className="w-16 h-16 mx-auto border-4 border-emerald-500">
                        <AvatarImage src={buddyRanking.user.avatarUrl} />
                        <AvatarFallback>Você</AvatarFallback>
                      </Avatar>
                      <p className="font-bold mt-2">Você</p>
                      <div className="flex items-center justify-center gap-1 text-emerald-600">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{buddyRanking.user.points}</span>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="text-2xl font-bold text-muted-foreground">VS</div>

                    {/* Parceiro */}
                    <div className="text-center">
                      <Avatar className="w-16 h-16 mx-auto border-4 border-purple-500">
                        <AvatarImage src={currentBuddy.avatarUrl} />
                        <AvatarFallback>{currentBuddy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-bold mt-2">{currentBuddy.name}</p>
                      <div className="flex items-center justify-center gap-1 text-purple-600">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{buddyRanking.buddy.points}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={cn(
                    "p-3 rounded-lg text-center",
                    buddyRanking.user.points > buddyRanking.buddy.points
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                      : buddyRanking.user.points < buddyRanking.buddy.points
                        ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300"
                        : "bg-muted"
                  )}>
                    {buddyRanking.user.points > buddyRanking.buddy.points ? (
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">
                          Você está {buddyRanking.user.points - buddyRanking.buddy.points} pts na frente!
                        </span>
                      </div>
                    ) : buddyRanking.user.points < buddyRanking.buddy.points ? (
                      <div className="flex items-center justify-center gap-2">
                        <Target className="w-5 h-5" />
                        <span className="font-medium">
                          Faltam {buddyRanking.buddy.points - buddyRanking.user.points} pts para alcançar!
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">Empate! 🤝</span>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onViewBuddyProfile?.(currentBuddy.id)}
                  >
                    Ver perfil do parceiro
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-950 rounded-full flex items-center justify-center">
                    <UserPlus className="w-8 h-8 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Encontre um parceiro!</p>
                    <p className="text-sm text-muted-foreground">
                      Treinem juntos e se motivem mutuamente
                    </p>
                  </div>
                  <Button 
                    className="bg-purple-500 hover:bg-purple-600"
                    onClick={onFindBuddy}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Encontrar parceiro
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default ExerciseRankingCard;
