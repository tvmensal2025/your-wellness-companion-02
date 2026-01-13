// ============================================
// 📊 PERFORMANCE DASHBOARD CARD
// Componente de dashboard de performance
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Target,
  Flame,
  Dumbbell,
  Clock,
  Zap,
  ChevronRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
}

interface InsightItem {
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface PerformanceDashboardCardProps {
  // User ID (optional - for fetching data)
  userId?: string;
  
  // Stats (all optional with defaults)
  totalWorkouts?: number;
  totalMinutes?: number;
  currentStreak?: number;
  weeklyProgress?: number; // 0-100
  
  // Changes
  workoutsChange?: number;
  minutesChange?: number;
  
  // Scores
  strengthScore?: number;
  enduranceScore?: number;
  consistencyScore?: number;
  
  // Insights
  insights?: InsightItem[];
  
  // Personal Records
  recentPRs?: Array<{
    exercise: string;
    value: string;
    date: string;
  }>;
  
  // Actions
  onViewDetails?: () => void;
  onViewInsights?: () => void;
  
  className?: string;
  variant?: 'full' | 'compact' | 'mini';
}

// ============================================
// HELPER COMPONENTS
// ============================================

const TrendIndicator: React.FC<{ value?: number }> = ({ value }) => {
  if (!value || value === 0) {
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  }
  
  if (value > 0) {
    return (
      <span className="flex items-center text-emerald-500 text-xs">
        <TrendingUp className="w-3 h-3 mr-0.5" />
        +{value}%
      </span>
    );
  }
  
  return (
    <span className="flex items-center text-red-500 text-xs">
      <TrendingDown className="w-3 h-3 mr-0.5" />
      {value}%
    </span>
  );
};

const ScoreRing: React.FC<{
  score: number;
  label: string;
  color: string;
  size?: 'sm' | 'md';
}> = ({ score, label, color, size = 'md' }) => {
  const radius = size === 'sm' ? 20 : 28;
  const strokeWidth = size === 'sm' ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          <motion.circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-bold",
            size === 'sm' ? 'text-sm' : 'text-lg'
          )}>
            {score}
          </span>
        </div>
      </div>
      <span className={cn(
        "text-muted-foreground mt-1",
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      )}>
        {label}
      </span>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const PerformanceDashboardCard: React.FC<PerformanceDashboardCardProps> = ({
  userId,
  totalWorkouts = 12,
  totalMinutes = 480,
  currentStreak = 5,
  weeklyProgress = 75,
  workoutsChange = 15,
  minutesChange = 10,
  strengthScore = 72,
  enduranceScore = 68,
  consistencyScore = 85,
  insights = [
    {
      type: 'positive',
      title: 'Ótima consistência!',
      description: 'Você treinou 5 dias seguidos. Continue assim!',
    },
    {
      type: 'info',
      title: 'Dica de recuperação',
      description: 'Considere um dia de descanso ativo amanhã.',
    },
  ],
  recentPRs = [
    { exercise: 'Supino', value: '80kg', date: 'Hoje' },
    { exercise: 'Agachamento', value: '100kg', date: 'Ontem' },
  ],
  onViewDetails,
  onViewInsights,
  className,
  variant = 'full',
}) => {
  // Mini variant
  if (variant === 'mini') {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-500" />
                <span className="font-bold">{totalWorkouts}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-bold">{currentStreak}d</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
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
            <h3 className="font-semibold text-sm">Seu Progresso</h3>
            <Badge variant="secondary" className="text-xs">
              Esta semana
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Dumbbell className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-lg">{totalWorkouts}</span>
              </div>
              <span className="text-xs text-muted-foreground">Treinos</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-lg">{totalMinutes}</span>
              </div>
              <span className="text-xs text-muted-foreground">Minutos</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-lg">{currentStreak}</span>
              </div>
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
          </div>

          {/* Weekly Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Meta semanal</span>
              <span className="font-medium">{weeklyProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${weeklyProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
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
            <Trophy className="w-5 h-5 text-amber-500" />
            Performance
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewDetails}>
            Ver tudo
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Dumbbell className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <div className="font-bold text-xl">{totalWorkouts}</div>
            <div className="text-xs text-muted-foreground">Treinos</div>
            <TrendIndicator value={workoutsChange} />
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="font-bold text-xl">{totalMinutes}</div>
            <div className="text-xs text-muted-foreground">Minutos</div>
            <TrendIndicator value={minutesChange} />
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <div className="font-bold text-xl">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="font-bold text-xl">{weeklyProgress}%</div>
            <div className="text-xs text-muted-foreground">Meta</div>
          </div>
        </div>

        {/* Score Rings */}
        <div className="flex items-center justify-around py-2">
          <ScoreRing score={strengthScore} label="Força" color="#10b981" />
          <ScoreRing score={enduranceScore} label="Resistência" color="#3b82f6" />
          <ScoreRing score={consistencyScore} label="Consistência" color="#f59e0b" />
        </div>

        {/* Recent PRs */}
        {recentPRs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Recordes Recentes
            </h4>
            <div className="space-y-1.5">
              {recentPRs.slice(0, 3).map((pr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg"
                >
                  <span className="text-sm font-medium">{pr.exercise}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {pr.value}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{pr.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Insights da IA
              </h4>
              {insights.length > 2 && (
                <Button variant="ghost" size="sm" onClick={onViewInsights}>
                  Ver todos
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {insights.slice(0, 2).map((insight, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border",
                    insight.type === 'positive' && "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
                    insight.type === 'warning' && "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
                    insight.type === 'info' && "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                  )}
                >
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {insight.description}
                  </p>
                  {insight.actionLabel && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-1 text-xs"
                      onClick={insight.onAction}
                    >
                      {insight.actionLabel}
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceDashboardCard;
