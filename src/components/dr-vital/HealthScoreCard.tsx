// =====================================================
// HEALTH SCORE CARD COMPONENT
// =====================================================
// Card animado com Health Score pulsante
// Requirements: 1.1, 1.2
// =====================================================

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart, TrendingUp, TrendingDown, Minus, RefreshCw, Activity, Moon, Brain, Apple } from 'lucide-react';
import { useHealthScore } from '@/hooks/dr-vital/useHealthScore';
import type { ScoreColor, HealthScoreBreakdown } from '@/types/dr-vital-revolution';

// =====================================================
// SCORE DISPLAY COMPONENT
// =====================================================

interface ScoreDisplayProps {
  score: number;
  color: ScoreColor;
  isAnimating: boolean;
}

function ScoreDisplay({ score, color, isAnimating }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score counting up
  useEffect(() => {
    if (score === 0) {
      setDisplayScore(0);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score);
      setDisplayScore(current);

      if (step >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const colorClasses: Record<ScoreColor, string> = {
    red: 'from-red-500 to-red-600 text-red-50',
    yellow: 'from-yellow-500 to-amber-500 text-yellow-50',
    green: 'from-green-500 to-emerald-500 text-green-50',
  };

  const glowClasses: Record<ScoreColor, string> = {
    red: 'shadow-red-500/50',
    yellow: 'shadow-yellow-500/50',
    green: 'shadow-green-500/50',
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing background */}
      <div
        className={cn(
          'absolute w-32 h-32 rounded-full bg-gradient-to-br opacity-20',
          colorClasses[color],
          isAnimating && 'animate-ping'
        )}
      />
      
      {/* Main score circle */}
      <div
        className={cn(
          'relative w-28 h-28 rounded-full bg-gradient-to-br flex items-center justify-center',
          'shadow-lg transition-all duration-500',
          colorClasses[color],
          glowClasses[color],
          isAnimating && 'animate-pulse'
        )}
      >
        <div className="text-center">
          <span className="text-4xl font-bold">{displayScore}</span>
          <span className="text-sm block opacity-80">/ 100</span>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// BREAKDOWN BAR COMPONENT
// =====================================================

interface BreakdownBarProps {
  label: string;
  value: number;
  maxValue: number;
  icon: React.ReactNode;
  color: string;
}

function BreakdownBar({ label, value, maxValue, icon, color }: BreakdownBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-medium">{value}/{maxValue}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// =====================================================
// TREND INDICATOR COMPONENT
// =====================================================

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  previousScore?: number;
}

function TrendIndicator({ trend, previousScore }: TrendIndicatorProps) {
  const trendConfig = {
    up: {
      icon: TrendingUp,
      text: 'Melhorando',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    down: {
      icon: TrendingDown,
      text: 'Atenção',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    stable: {
      icon: Minus,
      text: 'Estável',
      color: 'text-muted-foreground',
      bg: 'bg-muted',
    },
  };

  const config = trendConfig[trend];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm', config.bg)}>
      <Icon className={cn('w-4 h-4', config.color)} />
      <span className={config.color}>{config.text}</span>
      {previousScore !== undefined && trend !== 'stable' && (
        <span className="text-muted-foreground text-xs">
          (era {previousScore})
        </span>
      )}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface HealthScoreCardProps {
  className?: string;
  showBreakdown?: boolean;
  compact?: boolean;
}

export function HealthScoreCard({ 
  className, 
  showBreakdown = true,
  compact = false,
}: HealthScoreCardProps) {
  const {
    score,
    color,
    trend,
    breakdown,
    currentScore,
    isLoading,
    isRecalculating,
    recalculate,
  } = useHealthScore();

  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when score changes
  useEffect(() => {
    if (score > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [score]);

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="w-28 h-28 rounded-full bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <ScoreDisplay score={score} color={color} isAnimating={isAnimating} />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Health Score</h3>
              <TrendIndicator trend={trend} previousScore={currentScore?.previousScore} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Health Score
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => recalculate()}
            disabled={isRecalculating}
          >
            <RefreshCw className={cn('w-4 h-4', isRecalculating && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="flex flex-col items-center gap-4">
          <ScoreDisplay score={score} color={color} isAnimating={isAnimating} />
          <TrendIndicator trend={trend} previousScore={currentScore?.previousScore} />
        </div>

        {/* Breakdown */}
        {showBreakdown && breakdown && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground">Detalhamento</h4>
            
            <BreakdownBar
              label="Nutrição"
              value={breakdown.nutrition}
              maxValue={25}
              icon={<Apple className="w-4 h-4" />}
              color="bg-green-500"
            />
            
            <BreakdownBar
              label="Exercício"
              value={breakdown.exercise}
              maxValue={25}
              icon={<Activity className="w-4 h-4" />}
              color="bg-blue-500"
            />
            
            <BreakdownBar
              label="Sono"
              value={breakdown.sleep}
              maxValue={25}
              icon={<Moon className="w-4 h-4" />}
              color="bg-purple-500"
            />
            
            <BreakdownBar
              label="Mental"
              value={breakdown.mental}
              maxValue={25}
              icon={<Brain className="w-4 h-4" />}
              color="bg-pink-500"
            />
          </div>
        )}

        {/* Last updated */}
        {currentScore?.lastUpdated && (
          <p className="text-xs text-muted-foreground text-center">
            Atualizado {new Date(currentScore.lastUpdated).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default HealthScoreCard;
