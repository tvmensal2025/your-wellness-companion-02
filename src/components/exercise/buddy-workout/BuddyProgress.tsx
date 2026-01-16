// ============================================
// 📊 BUDDY PROGRESS
// Progresso comparativo entre parceiros
// ============================================

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Dumbbell, Flame, Swords, Target, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BuddyStats, ActiveChallenge } from './hooks/useBuddyWorkoutLogic';

// ============================================
// ONLINE INDICATOR
// ============================================

export const OnlineIndicator: React.FC<{ isOnline?: boolean }> = ({ isOnline }) => (
  <span
    className={cn(
      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
      isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
    )}
  />
);

// ============================================
// VS DISPLAY
// ============================================

interface VSDisplayProps {
  userStats: BuddyStats;
  buddy: BuddyStats;
  userIsWinning: boolean;
  pointsDiff: number;
  onBuddyClick: () => void;
}

export const VSDisplay: React.FC<VSDisplayProps> = ({
  userStats,
  buddy,
  userIsWinning,
  pointsDiff,
  onBuddyClick,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 via-transparent to-purple-50 dark:from-emerald-950/30 dark:to-purple-950/30 rounded-xl">
      {/* Você */}
      <div className="text-center flex-1">
        <Avatar className="w-14 h-14 mx-auto border-3 border-emerald-500 shadow-lg">
          <AvatarFallback className="bg-emerald-100 text-emerald-700">Eu</AvatarFallback>
        </Avatar>
        <p className="font-bold text-sm mt-1">Você</p>
        <div className="flex items-center justify-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          <span className="font-bold text-sm">{userStats.weeklyPoints}</span>
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
        onClick={onBuddyClick}
      >
        <div className="relative inline-block">
          <Avatar className="w-14 h-14 border-3 border-purple-500 shadow-lg">
            <AvatarImage src={buddy.avatarUrl} />
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {buddy.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <OnlineIndicator isOnline={buddy.isOnline} />
        </div>
        <p className="font-bold text-sm mt-1">{buddy.name}</p>
        <div className="flex items-center justify-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          <span className="font-bold text-sm">{buddy.weeklyPoints}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPETITION STATUS
// ============================================

interface CompetitionStatusProps {
  userIsWinning: boolean;
  pointsDiff: number;
}

export const CompetitionStatus: React.FC<CompetitionStatusProps> = ({
  userIsWinning,
  pointsDiff,
}) => {
  return (
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
  );
};

// ============================================
// ACTIVE CHALLENGE DISPLAY
// ============================================

interface ActiveChallengeDisplayProps {
  challenge: ActiveChallenge;
  buddyName: string;
}

export const ActiveChallengeDisplay: React.FC<ActiveChallengeDisplayProps> = ({
  challenge,
  buddyName,
}) => {
  return (
    <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-2 mb-2">
        <Swords className="w-4 h-4 text-orange-500" />
        <span className="font-bold text-sm">{challenge.title}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          Ativo
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span>Você: {challenge.userProgress}</span>
          <span>{buddyName}: {challenge.buddyProgress}</span>
        </div>
        <div className="flex gap-1">
          <Progress 
            value={(challenge.userProgress / challenge.targetValue) * 100} 
            className="h-2 flex-1"
          />
          <Progress 
            value={(challenge.buddyProgress / challenge.targetValue) * 100} 
            className="h-2 flex-1 [&>div]:bg-purple-500"
          />
        </div>
      </div>
    </div>
  );
};

// ============================================
// QUICK STATS
// ============================================

interface QuickStatsProps {
  buddy: BuddyStats;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ buddy }) => {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="p-2 bg-muted/50 rounded-lg">
        <Dumbbell className="w-4 h-4 mx-auto text-blue-500 mb-1" />
        <p className="font-bold text-sm">{buddy.workoutsThisWeek}</p>
        <p className="text-[10px] text-muted-foreground">Treinos/sem</p>
      </div>
      <div className="p-2 bg-muted/50 rounded-lg">
        <Flame className="w-4 h-4 mx-auto text-orange-500 mb-1" />
        <p className="font-bold text-sm">{buddy.consecutiveDays}</p>
        <p className="text-[10px] text-muted-foreground">Dias seguidos</p>
      </div>
      <div className="p-2 bg-muted/50 rounded-lg">
        <Trophy className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
        <p className="font-bold text-sm">{buddy.challengesWon}</p>
        <p className="text-[10px] text-muted-foreground">Vitórias</p>
      </div>
    </div>
  );
};
