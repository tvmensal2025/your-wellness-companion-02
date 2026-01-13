// =====================================================
// HEALTH QUEST PANEL COMPONENT
// =====================================================
// Painel de gamificação com missões, streak e XP
// Requirements: 2.1, 2.2, 2.3, 2.8
// =====================================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Flame, 
  Star, 
  Trophy, 
  Target,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useHealthQuest, useHealthLevel } from '@/hooks/dr-vital/useHealthQuest';
import type { HealthMission } from '@/types/dr-vital-revolution';

// =====================================================
// MISSION CARD COMPONENT
// =====================================================

interface MissionCardProps {
  mission: HealthMission;
  onComplete: () => void;
  isCompleting: boolean;
}

function MissionCard({ mission, onComplete, isCompleting }: MissionCardProps) {
  const isCompleted = mission.isCompleted;
  
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        isCompleted 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-card border-border hover:border-primary/50'
      )}
    >
      {/* Status icon */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : (
          <Circle className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-sm',
          isCompleted && 'line-through text-muted-foreground'
        )}>
          {mission.title}
        </p>
        {mission.description && (
          <p className="text-xs text-muted-foreground truncate">
            {mission.description}
          </p>
        )}
        
        {/* Progress bar for incomplete missions */}
        {!isCompleted && mission.progress > 0 && (
          <div className="mt-2">
            <Progress value={mission.progress} className="h-1" />
          </div>
        )}
      </div>

      {/* XP reward */}
      <div className="flex items-center gap-1 text-sm">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className={cn(
          'font-medium',
          isCompleted ? 'text-muted-foreground' : 'text-yellow-500'
        )}>
          {mission.xpReward}
        </span>
      </div>

      {/* Complete button */}
      {!isCompleted && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onComplete}
          disabled={isCompleting}
          className="flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// =====================================================
// STREAK DISPLAY COMPONENT
// =====================================================

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  hasBonus: boolean;
}

function StreakDisplay({ currentStreak, longestStreak, hasBonus }: StreakDisplayProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg',
      hasBonus ? 'bg-orange-500/10' : 'bg-muted'
    )}>
      <div className={cn(
        'p-3 rounded-full',
        hasBonus ? 'bg-orange-500/20' : 'bg-muted-foreground/20'
      )}>
        <Flame className={cn(
          'w-6 h-6',
          hasBonus ? 'text-orange-500' : 'text-muted-foreground',
          currentStreak > 0 && 'animate-pulse'
        )} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{currentStreak}</span>
          <span className="text-sm text-muted-foreground">dias</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Recorde: {longestStreak} dias
        </p>
      </div>

      {hasBonus && (
        <div className="text-right">
          <div className="flex items-center gap-1 text-orange-500">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">+{currentStreak * 10} XP</span>
          </div>
          <p className="text-xs text-muted-foreground">Bônus de streak</p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// LEVEL DISPLAY COMPONENT
// =====================================================

interface LevelDisplayProps {
  level: number;
  title: string;
  currentXp: number;
  xpToNextLevel: number;
  progressPercentage: number;
}

function LevelDisplay({ 
  level, 
  title, 
  currentXp, 
  xpToNextLevel, 
  progressPercentage 
}: LevelDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{level}</span>
            </div>
            <Star className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{currentXp.toLocaleString()} XP total</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-medium">{xpToNextLevel} XP</p>
          <p className="text-xs text-muted-foreground">para nível {level + 1}</p>
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground text-center">
          {progressPercentage}% para o próximo nível
        </p>
      </div>
    </div>
  );
}

// =====================================================
// CELEBRATION OVERLAY
// =====================================================

interface CelebrationOverlayProps {
  show: boolean;
  xpEarned: number;
  onClose: () => void;
}

function CelebrationOverlay({ show, xpEarned, onClose }: CelebrationOverlayProps) {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
        <div className="relative">
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto animate-bounce" />
          <Sparkles className="absolute top-0 right-0 w-8 h-8 text-yellow-400 animate-ping" />
          <Sparkles className="absolute bottom-0 left-0 w-6 h-6 text-yellow-400 animate-ping delay-100" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold">Missão Completa!</h2>
          <p className="text-muted-foreground">Você ganhou</p>
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-yellow-500">
            <Zap className="w-8 h-8" />
            <span>+{xpEarned} XP</span>
          </div>
        </div>

        <Button onClick={onClose}>Continuar</Button>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface HealthQuestPanelProps {
  className?: string;
  compact?: boolean;
}

export function HealthQuestPanel({ className, compact = false }: HealthQuestPanelProps) {
  const {
    dailyMissions,
    streak,
    isLoading,
    isCompletingMission,
    completeMission,
    stats,
  } = useHealthQuest();

  const {
    level,
    title,
    currentXp,
    xpToNextLevel,
    progressPercentage,
  } = useHealthLevel();

  const [celebration, setCelebration] = useState<{ show: boolean; xp: number }>({
    show: false,
    xp: 0,
  });

  const handleCompleteMission = async (missionId: string, xpReward: number) => {
    try {
      await completeMission(missionId);
      setCelebration({ show: true, xp: xpReward });
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-16 bg-muted rounded-lg" />
            <div className="space-y-2">
              <div className="h-12 bg-muted rounded-lg" />
              <div className="h-12 bg-muted rounded-lg" />
              <div className="h-12 bg-muted rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="font-bold text-white">{level}</span>
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{currentXp} XP</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Flame className={cn(
                'w-5 h-5',
                (streak?.currentStreak || 0) > 0 ? 'text-orange-500' : 'text-muted-foreground'
              )} />
              <span className="font-medium">{streak?.currentStreak || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Health Quest
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Level Display */}
          <LevelDisplay
            level={level}
            title={title}
            currentXp={currentXp}
            xpToNextLevel={xpToNextLevel}
            progressPercentage={progressPercentage}
          />

          {/* Streak Display */}
          <StreakDisplay
            currentStreak={streak?.currentStreak || 0}
            longestStreak={streak?.longestStreak || 0}
            hasBonus={(streak?.currentStreak || 0) >= 7}
          />

          {/* Daily Missions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Missões do Dia</h4>
              {stats && (
                <span className="text-xs text-muted-foreground">
                  {stats.completedMissions}/{stats.totalMissions} completas
                </span>
              )}
            </div>

            <div className="space-y-2">
              {dailyMissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma missão disponível
                </p>
              ) : (
                dailyMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onComplete={() => handleCompleteMission(mission.id, mission.xpReward)}
                    isCompleting={isCompletingMission}
                  />
                ))
              )}
            </div>

            {stats && stats.totalXpAvailable > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {stats.totalXpAvailable} XP disponíveis hoje
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Celebration Overlay */}
      <CelebrationOverlay
        show={celebration.show}
        xpEarned={celebration.xp}
        onClose={() => setCelebration({ show: false, xp: 0 })}
      />
    </>
  );
}

export default HealthQuestPanel;
