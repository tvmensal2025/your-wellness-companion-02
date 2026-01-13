// =====================================================
// METRIC CARDS COMPONENT
// =====================================================
// Cards de métricas com indicadores de alerta
// Requirements: 1.5, 1.6
// =====================================================

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Scale, 
  Moon, 
  Activity, 
  Apple, 
  Smile,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from 'lucide-react';
import type { MetricCard as MetricCardType } from '@/types/dr-vital-revolution';

// =====================================================
// METRIC THRESHOLDS
// =====================================================

const METRIC_THRESHOLDS = {
  weight: { alertBelow: null, alertAbove: null }, // Dynamic based on goals
  sleep: { alertBelow: 6, alertAbove: 10 },
  exercise: { alertBelow: 1, alertAbove: null }, // Alert if 0 days streak
  nutrition: { alertBelow: 40, alertAbove: null },
  mood: { alertBelow: 4, alertAbove: null },
};

// =====================================================
// SINGLE METRIC CARD
// =====================================================

interface MetricCardProps {
  metric: MetricCardType;
  onClick?: () => void;
}

function MetricCard({ metric, onClick }: MetricCardProps) {
  const iconMap = {
    weight: Scale,
    sleep: Moon,
    exercise: Activity,
    nutrition: Apple,
    mood: Smile,
  };

  const colorMap = {
    weight: 'text-blue-500 bg-blue-500/10',
    sleep: 'text-purple-500 bg-purple-500/10',
    exercise: 'text-green-500 bg-green-500/10',
    nutrition: 'text-orange-500 bg-orange-500/10',
    mood: 'text-pink-500 bg-pink-500/10',
  };

  const Icon = iconMap[metric.type];
  const colorClass = colorMap[metric.type];

  const TrendIcon = metric.trend === 'up' 
    ? TrendingUp 
    : metric.trend === 'down' 
      ? TrendingDown 
      : Minus;

  const trendColor = metric.trend === 'up' 
    ? 'text-green-500' 
    : metric.trend === 'down' 
      ? 'text-red-500' 
      : 'text-muted-foreground';

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md',
        metric.isAlert && 'ring-2 ring-red-500/50 animate-pulse'
      )}
      onClick={onClick}
    >
      {/* Alert indicator */}
      {metric.isAlert && (
        <div className="absolute top-2 right-2">
          <div className="relative">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </div>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn('p-2 rounded-lg', colorClass)}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{metric.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{metric.value}</span>
              <span className="text-sm text-muted-foreground">{metric.unit}</span>
            </div>

            {/* Trend */}
            <div className={cn('flex items-center gap-1 text-xs mt-1', trendColor)}>
              <TrendIcon className="w-3 h-3" />
              {metric.trendValue !== undefined && (
                <span>
                  {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
                  {Math.abs(metric.trendValue)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Alert message */}
        {metric.isAlert && metric.alertMessage && (
          <div className="mt-3 p-2 bg-red-500/10 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400">
              {metric.alertMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// METRIC CARDS GRID
// =====================================================

interface MetricCardsProps {
  metrics: MetricCardType[];
  onMetricClick?: (metric: MetricCardType) => void;
  className?: string;
  columns?: 2 | 3 | 5;
}

export function MetricCards({ 
  metrics, 
  onMetricClick, 
  className,
  columns = 5,
}: MetricCardsProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          metric={metric}
          onClick={() => onMetricClick?.(metric)}
        />
      ))}
    </div>
  );
}

// =====================================================
// HOOK FOR GENERATING METRICS
// =====================================================

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useMetricCards() {
  const { user } = useAuth();
  const userId = user?.id;
  const enabled = !!userId;

  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['metric-cards', userId],
    queryFn: async (): Promise<MetricCardType[]> => {
      if (!userId) return [];

      // Fetch data from multiple sources
      const [weightData, trackingData, workoutData, nutritionData] = await Promise.all([
        supabase
          .from('weight_measurements')
          .select('weight_kg, measurement_date')
          .eq('user_id', userId)
          .order('measurement_date', { ascending: false })
          .limit(2),
        supabase
          .from('advanced_daily_tracking')
          .select('sleep_hours, energy_level, stress_level, tracking_date')
          .eq('user_id', userId)
          .order('tracking_date', { ascending: false })
          .limit(7),
        supabase
          .from('workout_sessions')
          .select('id, created_at')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('food_analysis')
          .select('health_score, created_at')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const cards: MetricCardType[] = [];

      // Weight metric
      const weights = weightData.data || [];
      if (weights.length > 0) {
        const current = weights[0].weight_kg;
        const previous = weights[1]?.weight_kg;
        const trend = previous ? (current > previous ? 'up' : current < previous ? 'down' : 'stable') : 'stable';
        
        cards.push({
          id: 'weight',
          type: 'weight',
          label: 'Peso',
          value: Math.round(current * 10) / 10,
          unit: 'kg',
          trend: trend as 'up' | 'down' | 'stable',
          trendValue: previous ? Math.abs(Math.round((current - previous) * 10) / 10) : undefined,
          isAlert: false,
          icon: 'scale',
        });
      }

      // Sleep metric
      const tracking = trackingData.data || [];
      if (tracking.length > 0) {
        const avgSleep = tracking.reduce((sum, t) => sum + (t.sleep_hours || 0), 0) / tracking.length;
        const isAlert = avgSleep < METRIC_THRESHOLDS.sleep.alertBelow!;
        
        cards.push({
          id: 'sleep',
          type: 'sleep',
          label: 'Sono (média)',
          value: Math.round(avgSleep * 10) / 10,
          unit: 'h/noite',
          trend: 'stable',
          isAlert,
          alertMessage: isAlert ? 'Você está dormindo menos que o recomendado' : undefined,
          icon: 'moon',
        });
      }

      // Exercise metric
      const workouts = workoutData.data || [];
      const exerciseDays = workouts.length;
      const isExerciseAlert = exerciseDays < METRIC_THRESHOLDS.exercise.alertBelow!;
      
      cards.push({
        id: 'exercise',
        type: 'exercise',
        label: 'Treinos (7 dias)',
        value: exerciseDays,
        unit: 'dias',
        trend: exerciseDays >= 3 ? 'up' : exerciseDays === 0 ? 'down' : 'stable',
        isAlert: isExerciseAlert,
        alertMessage: isExerciseAlert ? 'Você não treinou esta semana' : undefined,
        icon: 'activity',
      });

      // Nutrition metric
      const nutrition = nutritionData.data || [];
      if (nutrition.length > 0) {
        const avgScore = nutrition.reduce((sum, n) => sum + (n.health_score || 50), 0) / nutrition.length;
        const isNutritionAlert = avgScore < METRIC_THRESHOLDS.nutrition.alertBelow!;
        
        cards.push({
          id: 'nutrition',
          type: 'nutrition',
          label: 'Nutrição',
          value: Math.round(avgScore),
          unit: 'pts',
          trend: avgScore >= 70 ? 'up' : avgScore < 50 ? 'down' : 'stable',
          isAlert: isNutritionAlert,
          alertMessage: isNutritionAlert ? 'Sua alimentação precisa de atenção' : undefined,
          icon: 'apple',
        });
      }

      // Mood metric (from energy and stress)
      if (tracking.length > 0) {
        const avgEnergy = tracking.reduce((sum, t) => sum + (t.energy_level || 5), 0) / tracking.length;
        const avgStress = tracking.reduce((sum, t) => sum + (t.stress_level || 5), 0) / tracking.length;
        const moodScore = Math.round((avgEnergy + (10 - avgStress)) / 2);
        const isMoodAlert = moodScore < METRIC_THRESHOLDS.mood.alertBelow!;
        
        cards.push({
          id: 'mood',
          type: 'mood',
          label: 'Bem-estar',
          value: moodScore,
          unit: '/10',
          trend: moodScore >= 7 ? 'up' : moodScore < 5 ? 'down' : 'stable',
          isAlert: isMoodAlert,
          alertMessage: isMoodAlert ? 'Cuide da sua saúde mental' : undefined,
          icon: 'smile',
        });
      }

      return cards;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const alertCount = metrics?.filter(m => m.isAlert).length || 0;

  return {
    metrics: metrics || [],
    alertCount,
    hasAlerts: alertCount > 0,
    isLoading,
    error,
    refetch,
  };
}

// =====================================================
// VALIDATION FUNCTION (for property tests)
// =====================================================

/**
 * Validates metric alert threshold detection
 * Property 4: if value crosses threshold, isAlert SHALL be true
 */
export function shouldTriggerAlert(
  type: MetricCardType['type'],
  value: number
): boolean {
  const threshold = METRIC_THRESHOLDS[type];
  
  if (threshold.alertBelow !== null && value < threshold.alertBelow) {
    return true;
  }
  
  if (threshold.alertAbove !== null && value > threshold.alertAbove) {
    return true;
  }
  
  return false;
}

export default MetricCards;
