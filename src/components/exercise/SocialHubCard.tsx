// ============================================
// 👥 SOCIAL HUB CARD
// Componente de hub social para exercícios
// ============================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Trophy,
  Heart,
  MessageCircle,
  Zap,
  ChevronRight,
  Crown,
  Radio,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  FeatureTutorialPopup, 
  useFeatureTutorial,
  type TutorialFeature 
} from './FeatureTutorialPopup';

// ============================================
// TYPES
// ============================================

interface GroupInfo {
  id: string;
  name: string;
  memberCount: number;
  avatarUrl?: string;
  isActive?: boolean;
}

interface BuddyInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastWorkout?: string;
  compatibilityScore?: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string;
  points: number;
  isCurrentUser?: boolean;
}

interface LiveSession {
  id: string;
  hostName: string;
  hostAvatarUrl?: string;
  participantCount: number;
  exerciseType?: string;
}

interface Encouragement {
  id: string;
  fromName: string;
  fromAvatarUrl?: string;
  type: 'cheer' | 'high_five' | 'motivation' | 'celebration';
  message?: string;
  createdAt: Date;
}

interface SocialHubCardProps {
  // User ID (optional)
  userId?: string;
  
  // Data
  myGroups?: GroupInfo[];
  buddies?: BuddyInfo[];
  leaderboard?: LeaderboardEntry[];
  liveSessions?: LiveSession[];
  recentEncouragements?: Encouragement[];
  
  // User stats
  userRank?: number;
  userPoints?: number;
  
  // Actions
  onViewGroups?: () => void;
  onViewBuddies?: () => void;
  onViewLeaderboard?: () => void;
  onJoinLiveSession?: (sessionId: string) => void;
  onSendEncouragement?: (userId: string) => void;
  
  className?: string;
  variant?: 'full' | 'compact' | 'mini';
}

// ============================================
// HELPER COMPONENTS
// ============================================

const EncouragementIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons: Record<string, { icon: string; color: string }> = {
    cheer: { icon: '📣', color: 'text-blue-500' },
    high_five: { icon: '🙌', color: 'text-amber-500' },
    motivation: { icon: '💪', color: 'text-emerald-500' },
    celebration: { icon: '🎉', color: 'text-purple-500' },
  };
  
  return <span className="text-lg">{icons[type]?.icon || '👏'}</span>;
};

const OnlineIndicator: React.FC<{ isOnline?: boolean }> = ({ isOnline }) => (
  <span
    className={cn(
      "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
      isOnline ? "bg-emerald-500" : "bg-muted"
    )}
  />
);

// ============================================
// MOCK DATA
// ============================================

const getMockGroups = (): GroupInfo[] => [
  { id: '1', name: 'Treino Matinal', memberCount: 24, isActive: true },
  { id: '2', name: 'Força & Hipertrofia', memberCount: 156 },
];

const getMockBuddies = (): BuddyInfo[] => [
  { id: '1', name: 'Carlos', isOnline: true, lastWorkout: 'Hoje', compatibilityScore: 92 },
  { id: '2', name: 'Ana', isOnline: true, lastWorkout: 'Ontem', compatibilityScore: 88 },
  { id: '3', name: 'Pedro', isOnline: false, lastWorkout: '2 dias', compatibilityScore: 75 },
];

const getMockLeaderboard = (): LeaderboardEntry[] => [
  { rank: 1, userId: '1', name: 'Maria S.', points: 2450 },
  { rank: 2, userId: '2', name: 'João P.', points: 2380 },
  { rank: 3, userId: '3', name: 'Ana C.', points: 2210 },
  { rank: 4, userId: 'current', name: 'Você', points: 1850, isCurrentUser: true },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const SocialHubCard: React.FC<SocialHubCardProps> = ({
  userId,
  myGroups: externalGroups,
  buddies: externalBuddies,
  leaderboard: externalLeaderboard,
  liveSessions = [],
  recentEncouragements = [],
  userRank = 4,
  userPoints = 1850,
  onViewGroups,
  onViewBuddies,
  onViewLeaderboard,
  onJoinLiveSession,
  onSendEncouragement,
  className,
  variant = 'full',
}) => {
  // Tutorial hooks
  const gruposTutorial = useFeatureTutorial('grupos_treino');
  const parceiroTutorial = useFeatureTutorial('parceiro_treino');
  const sessaoTutorial = useFeatureTutorial('sessao_ao_vivo');
  const encorajamentosTutorial = useFeatureTutorial('encorajamentos');

  // Use mock data if no external data provided
  const myGroups = externalGroups || getMockGroups();
  const buddies = externalBuddies || getMockBuddies();
  const leaderboard = externalLeaderboard || getMockLeaderboard();

  // Helper para botão de tutorial
  const TutorialButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
    >
      <HelpCircle className="w-4 h-4" />
    </Button>
  );
  // Mini variant
  if (variant === 'mini') {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-bold">{myGroups.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="font-bold">{buddies.length}</span>
              </div>
              {liveSessions.length > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  <Radio className="w-3 h-3 mr-1" />
                  {liveSessions.length} ao vivo
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onViewGroups}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Social
            </h3>
            {liveSessions.length > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                Ao vivo
              </Badge>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={onViewGroups}
              className="text-center p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-bold text-lg">{myGroups.length}</span>
              <span className="text-xs text-muted-foreground block">Grupos</span>
            </button>
            <button
              onClick={onViewBuddies}
              className="text-center p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-bold text-lg">{buddies.length}</span>
              <span className="text-xs text-muted-foreground block">Buddies</span>
            </button>
            <button
              onClick={onViewLeaderboard}
              className="text-center p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-bold text-lg">#{userRank || '-'}</span>
              <span className="text-xs text-muted-foreground block">Rank</span>
            </button>
          </div>

          {/* Buddies Avatars */}
          {buddies.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {buddies.slice(0, 5).map((buddy) => (
                  <Avatar key={buddy.id} className="w-7 h-7 border-2 border-background">
                    <AvatarImage src={buddy.avatarUrl} loading="lazy" />
                    <AvatarFallback className="text-xs">
                      {buddy.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {buddies.length > 5 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{buddies.length - 5}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Social Hub
          </CardTitle>
          {liveSessions.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <Radio className="w-3 h-3 mr-1" />
              {liveSessions.length} ao vivo
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Live Sessions */}
        {liveSessions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                Sessões ao Vivo
              </h4>
              <TutorialButton onClick={() => sessaoTutorial.showTutorial()} />
            </div>
            <div className="space-y-2">
              {liveSessions.slice(0, 2).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={session.hostAvatarUrl} loading="lazy" />
                      <AvatarFallback>{session.hostName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{session.hostName}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.participantCount} participantes
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onJoinLiveSession?.(session.id)}
                  >
                    Entrar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Preview */}
        {leaderboard.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                Ranking Semanal
              </h4>
              <Button variant="ghost" size="sm" onClick={onViewLeaderboard}>
                Ver tudo
              </Button>
            </div>
            <div className="space-y-1.5">
              {leaderboard.slice(0, 5).map((entry) => (
                <div
                  key={entry.userId}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    entry.isCurrentUser
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                      : "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      entry.rank === 1 && "bg-amber-500 text-white",
                      entry.rank === 2 && "bg-gray-400 text-white",
                      entry.rank === 3 && "bg-amber-700 text-white",
                      entry.rank > 3 && "bg-muted text-muted-foreground"
                    )}>
                      {entry.rank <= 3 ? (
                        <Crown className="w-3 h-3" />
                      ) : (
                        entry.rank
                      )}
                    </span>
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={entry.avatarUrl} loading="lazy" />
                      <AvatarFallback className="text-xs">
                        {entry.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {entry.isCurrentUser ? 'Você' : entry.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-sm font-bold">{entry.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Groups */}
        {myGroups.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                Meus Grupos
              </h4>
              <div className="flex items-center gap-1">
                <TutorialButton onClick={() => gruposTutorial.showTutorial()} />
                <Button variant="ghost" size="sm" onClick={onViewGroups}>
                  Ver todos
                </Button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {myGroups.slice(0, 4).map((group) => (
                <div
                  key={group.id}
                  className="flex-shrink-0 p-2 bg-muted/50 rounded-lg text-center min-w-[80px]"
                >
                  <Avatar className="w-10 h-10 mx-auto mb-1">
                    <AvatarImage src={group.avatarUrl} loading="lazy" />
                    <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-medium truncate">{group.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {group.memberCount} membros
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workout Buddies */}
        {buddies.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-500" />
                Parceiros de Treino
              </h4>
              <div className="flex items-center gap-1">
                <TutorialButton onClick={() => parceiroTutorial.showTutorial()} />
                <Button variant="ghost" size="sm" onClick={onViewBuddies}>
                  Ver todos
                </Button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {buddies.slice(0, 5).map((buddy) => (
                <button
                  key={buddy.id}
                  onClick={() => onSendEncouragement?.(buddy.id)}
                  className="flex-shrink-0 p-2 bg-muted/50 rounded-lg text-center min-w-[70px] hover:bg-muted transition-colors"
                >
                  <div className="relative inline-block">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={buddy.avatarUrl} loading="lazy" />
                      <AvatarFallback>{buddy.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <OnlineIndicator isOnline={buddy.isOnline} />
                  </div>
                  <p className="text-xs font-medium truncate mt-1">{buddy.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Encouragements */}
        {recentEncouragements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-purple-500" />
                Apoio Recebido
              </h4>
              <TutorialButton onClick={() => encorajamentosTutorial.showTutorial()} />
            </div>
            <div className="space-y-1.5">
              {recentEncouragements.slice(0, 3).map((enc) => (
                <div
                  key={enc.id}
                  className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={enc.fromAvatarUrl} loading="lazy" />
                    <AvatarFallback>{enc.fromName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">
                      <span className="font-medium">{enc.fromName}</span>
                      {' enviou '}
                      <EncouragementIcon type={enc.type} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Tutorial Popups */}
      <FeatureTutorialPopup
        feature="grupos_treino"
        isOpen={gruposTutorial.isOpen}
        onClose={gruposTutorial.closeTutorial}
      />
      <FeatureTutorialPopup
        feature="parceiro_treino"
        isOpen={parceiroTutorial.isOpen}
        onClose={parceiroTutorial.closeTutorial}
      />
      <FeatureTutorialPopup
        feature="sessao_ao_vivo"
        isOpen={sessaoTutorial.isOpen}
        onClose={sessaoTutorial.closeTutorial}
      />
      <FeatureTutorialPopup
        feature="encorajamentos"
        isOpen={encorajamentosTutorial.isOpen}
        onClose={encorajamentosTutorial.closeTutorial}
      />
    </Card>
  );
};

export default SocialHubCard;
