// =====================================================
// BOSS BATTLE CARD COMPONENT
// =====================================================
// Card especial para exames anormais (Boss Battles)
// Requirements: 2.5, 2.6
// =====================================================

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Swords, 
  Shield, 
  Heart,
  Zap,
  AlertTriangle,
  Trophy,
  Sparkles,
  FileText,
} from 'lucide-react';
import type { HealthMission } from '@/types/dr-vital-revolution';

// =====================================================
// BOSS BATTLE CARD
// =====================================================

interface BossBattleCardProps {
  mission: HealthMission;
  onViewExam?: () => void;
  onDefeat?: () => void;
  className?: string;
}

export function BossBattleCard({ 
  mission, 
  onViewExam, 
  onDefeat,
  className 
}: BossBattleCardProps) {
  const [isDefeating, setIsDefeating] = useState(false);
  const isDefeated = mission.isCompleted;
  
  const metadata = mission.metadata as {
    exam_name?: string;
    abnormal_value?: string;
    target_value?: string;
    severity?: 'warning' | 'critical';
  };

  const severity = metadata?.severity || 'warning';
  const isCritical = severity === 'critical';

  const handleDefeat = async () => {
    if (onDefeat) {
      setIsDefeating(true);
      try {
        await onDefeat();
      } finally {
        setIsDefeating(false);
      }
    }
  };

  if (isDefeated) {
    return (
      <Card className={cn(
        'overflow-hidden border-2 border-green-500/50 bg-green-500/5',
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-green-500" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-green-500 uppercase">
                  Boss Derrotado!
                </span>
              </div>
              <h3 className="font-semibold line-through text-muted-foreground">
                {mission.title.replace('🏆 ', '')}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  +{mission.xpReward} XP ganhos!
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'overflow-hidden border-2 transition-all',
      isCritical 
        ? 'border-red-500/50 bg-red-500/5 animate-pulse' 
        : 'border-orange-500/50 bg-orange-500/5',
      className
    )}>
      {/* Header with severity indicator */}
      <div className={cn(
        'px-4 py-2 flex items-center gap-2',
        isCritical ? 'bg-red-500/20' : 'bg-orange-500/20'
      )}>
        <Swords className={cn(
          'w-4 h-4',
          isCritical ? 'text-red-500' : 'text-orange-500'
        )} />
        <span className={cn(
          'text-xs font-bold uppercase tracking-wide',
          isCritical ? 'text-red-500' : 'text-orange-500'
        )}>
          {isCritical ? '⚠️ Boss Crítico' : '🏆 Boss Battle'}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-yellow-500">{mission.xpReward} XP</span>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Boss info */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              isCritical ? 'bg-red-500/20' : 'bg-orange-500/20'
            )}>
              <AlertTriangle className={cn(
                'w-8 h-8',
                isCritical ? 'text-red-500' : 'text-orange-500'
              )} />
            </div>
            {/* Health bar */}
            <div className="absolute -bottom-1 left-0 right-0">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all duration-500',
                    isCritical ? 'bg-red-500' : 'bg-orange-500'
                  )}
                  style={{ width: `${100 - mission.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">
              {mission.title.replace('🏆 ', '')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mission.description}
            </p>
            
            {/* Exam details */}
            {metadata?.exam_name && (
              <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-3 h-3" />
                  <span className="font-medium">{metadata.exam_name}</span>
                </div>
                {metadata.abnormal_value && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Atual: <span className="text-red-500 font-medium">{metadata.abnormal_value}</span>
                    {metadata.target_value && (
                      <> → Meta: <span className="text-green-500 font-medium">{metadata.target_value}</span></>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso da batalha</span>
            <span className="font-medium">{mission.progress}%</span>
          </div>
          <Progress 
            value={mission.progress} 
            className={cn(
              'h-3',
              isCritical ? '[&>div]:bg-red-500' : '[&>div]:bg-orange-500'
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onViewExam && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onViewExam}
            >
              <FileText className="w-4 h-4 mr-2" />
              Ver Exame
            </Button>
          )}
          
          {mission.progress >= 100 && onDefeat && (
            <Button 
              size="sm" 
              className={cn(
                'flex-1',
                isCritical 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-orange-500 hover:bg-orange-600'
              )}
              onClick={handleDefeat}
              disabled={isDefeating}
            >
              <Shield className="w-4 h-4 mr-2" />
              {isDefeating ? 'Derrotando...' : 'Derrotar Boss!'}
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 Dica: Normalize seu exame para derrotar este boss e ganhar {mission.xpReward} XP!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// BOSS BATTLES LIST
// =====================================================

interface BossBattlesListProps {
  missions: HealthMission[];
  onViewExam?: (examId: string) => void;
  onDefeat?: (missionId: string) => void;
  className?: string;
}

export function BossBattlesList({ 
  missions, 
  onViewExam, 
  onDefeat,
  className 
}: BossBattlesListProps) {
  const activeBattles = missions.filter(m => !m.isCompleted);
  const defeatedBattles = missions.filter(m => m.isCompleted);

  if (missions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium">Nenhum Boss Battle</h3>
          <p className="text-sm text-muted-foreground">
            Seus exames estão normais! Continue assim.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Active battles */}
      {activeBattles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Swords className="w-4 h-4 text-orange-500" />
            Batalhas Ativas ({activeBattles.length})
          </h3>
          {activeBattles.map((mission) => (
            <BossBattleCard
              key={mission.id}
              mission={mission}
              onViewExam={mission.relatedExamId ? () => onViewExam?.(mission.relatedExamId!) : undefined}
              onDefeat={() => onDefeat?.(mission.id)}
            />
          ))}
        </div>
      )}

      {/* Defeated battles */}
      {defeatedBattles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-green-500" />
            Bosses Derrotados ({defeatedBattles.length})
          </h3>
          {defeatedBattles.slice(0, 3).map((mission) => (
            <BossBattleCard
              key={mission.id}
              mission={mission}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BossBattleCard;
