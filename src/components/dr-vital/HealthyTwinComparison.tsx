// =====================================================
// HEALTHY TWIN COMPARISON COMPONENT
// =====================================================
// Comparação com o "gêmeo saudável" ideal
// Requirements: 3.5, 3.6
// =====================================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Target,
  TrendingUp,
  RefreshCw,
  Scale,
  Moon,
  Dumbbell,
  Droplets,
  Brain,
  Heart,
  Percent,
  ChevronRight,
} from 'lucide-react';
import { useHealthyTwin } from '@/hooks/dr-vital/useHealthOracle';

// =====================================================
// METRIC CONFIG
// =====================================================

interface MetricConfig {
  key: string;
  label: string;
  unit: string;
  icon: React.ReactNode;
  format?: (value: number) => string;
  lowerIsBetter?: boolean;
}

const METRICS: MetricConfig[] = [
  {
    key: 'weight',
    label: 'Peso',
    unit: 'kg',
    icon: <Scale className="w-4 h-4" />,
    format: (v) => v.toFixed(1),
    lowerIsBetter: true,
  },
  {
    key: 'bmi',
    label: 'IMC',
    unit: '',
    icon: <Heart className="w-4 h-4" />,
    format: (v) => v.toFixed(1),
    lowerIsBetter: true,
  },
  {
    key: 'bodyFat',
    label: 'Gordura Corporal',
    unit: '%',
    icon: <Percent className="w-4 h-4" />,
    format: (v) => v.toFixed(1),
    lowerIsBetter: true,
  },
  {
    key: 'sleepHours',
    label: 'Horas de Sono',
    unit: 'h',
    icon: <Moon className="w-4 h-4" />,
    format: (v) => v.toFixed(1),
  },
  {
    key: 'exerciseMinutes',
    label: 'Exercício Semanal',
    unit: 'min',
    icon: <Dumbbell className="w-4 h-4" />,
    format: (v) => Math.round(v).toString(),
  },
  {
    key: 'waterIntake',
    label: 'Água Diária',
    unit: 'L',
    icon: <Droplets className="w-4 h-4" />,
    format: (v) => v.toFixed(1),
  },
  {
    key: 'stressLevel',
    label: 'Estresse',
    unit: '/10',
    icon: <Brain className="w-4 h-4" />,
    format: (v) => Math.round(v).toString(),
    lowerIsBetter: true,
  },
];

// =====================================================
// COMPARISON SCORE RING
// =====================================================

interface ComparisonScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function ComparisonScoreRing({ score, size = 'md' }: ComparisonScoreRingProps) {
  const sizeConfig = {
    sm: { width: 80, stroke: 6, fontSize: 'text-lg' },
    md: { width: 120, stroke: 8, fontSize: 'text-2xl' },
    lg: { width: 160, stroke: 10, fontSize: 'text-4xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    if (s >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="relative" style={{ width: config.width, height: config.width }}>
      <svg className="transform -rotate-90" width={config.width} height={config.width}>
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={cn('transition-all duration-1000', getColor(score))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', config.fontSize, getColor(score))}>
          {Math.round(score)}%
        </span>
        <span className="text-xs text-muted-foreground">similaridade</span>
      </div>
    </div>
  );
}

// =====================================================
// METRIC COMPARISON ROW
// =====================================================

interface MetricComparisonRowProps {
  metric: MetricConfig;
  userValue: number;
  idealValue: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

function MetricComparisonRow({ 
  metric, 
  userValue, 
  idealValue, 
  gap,
  priority,
}: MetricComparisonRowProps) {
  const formatValue = metric.format || ((v: number) => v.toString());
  const isAtIdeal = Math.abs(gap) < 0.1;
  const needsImprovement = metric.lowerIsBetter 
    ? userValue > idealValue 
    : userValue < idealValue;

  const priorityColors = {
    high: 'text-red-500 bg-red-500/10',
    medium: 'text-orange-500 bg-orange-500/10',
    low: 'text-green-500 bg-green-500/10',
  };

  // Calculate progress towards ideal (0-100)
  const progressToIdeal = metric.lowerIsBetter
    ? Math.max(0, Math.min(100, (1 - (userValue - idealValue) / idealValue) * 100))
    : Math.max(0, Math.min(100, (userValue / idealValue) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-primary">{metric.icon}</span>
          <span className="text-sm font-medium">{metric.label}</span>
        </div>
        {!isAtIdeal && (
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            priorityColors[priority]
          )}>
            {priority === 'high' ? 'Prioridade' : priority === 'medium' ? 'Atenção' : 'Bom'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* User Value */}
        <div className="flex-1 text-center">
          <p className={cn(
            'text-lg font-semibold',
            needsImprovement ? 'text-orange-500' : 'text-green-500'
          )}>
            {formatValue(userValue)}{metric.unit}
          </p>
          <p className="text-xs text-muted-foreground">Você</p>
        </div>

        {/* Progress Bar */}
        <div className="flex-[2]">
          <Progress 
            value={progressToIdeal} 
            className="h-2"
          />
        </div>

        {/* Ideal Value */}
        <div className="flex-1 text-center">
          <p className="text-lg font-semibold text-primary">
            {formatValue(idealValue)}{metric.unit}
          </p>
          <p className="text-xs text-muted-foreground">Ideal</p>
        </div>
      </div>

      {/* Gap indicator */}
      {!isAtIdeal && (
        <p className="text-xs text-muted-foreground text-center">
          {metric.lowerIsBetter ? (
            userValue > idealValue ? (
              <span>Reduzir {formatValue(Math.abs(gap))}{metric.unit}</span>
            ) : (
              <span className="text-green-500">✓ Abaixo do ideal</span>
            )
          ) : (
            userValue < idealValue ? (
              <span>Aumentar {formatValue(Math.abs(gap))}{metric.unit}</span>
            ) : (
              <span className="text-green-500">✓ Acima do ideal</span>
            )
          )}
        </p>
      )}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface HealthyTwinComparisonProps {
  className?: string;
  compact?: boolean;
}

export function HealthyTwinComparison({ className, compact = false }: HealthyTwinComparisonProps) {
  const {
    healthyTwin,
    comparisonScore,
    gaps,
    highPriorityGaps,
    improvementSuggestions,
    isLoading,
    error,
    refetch,
  } = useHealthyTwin();

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-32 h-32 rounded-full bg-muted" />
          </div>
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded-lg" />
            <div className="h-12 bg-muted rounded-lg" />
            <div className="h-12 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !healthyTwin) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium">Gêmeo Saudável Indisponível</h3>
          <p className="text-sm text-muted-foreground">
            Não foi possível gerar seu gêmeo saudável ideal.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => refetch()}
          >
            Tentar novamente
          </Button>
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
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Gêmeo Saudável</p>
                <p className="text-xs text-muted-foreground">
                  {highPriorityGaps.length} áreas para melhorar
                </p>
              </div>
            </div>
            <ComparisonScoreRing score={comparisonScore} size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Seu Gêmeo Saudável
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Comparação com a versão ideal de você baseada em dados científicos
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Ring */}
        <div className="flex flex-col items-center py-4">
          <ComparisonScoreRing score={comparisonScore} size="lg" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Você está {comparisonScore >= 80 ? 'muito próximo' : comparisonScore >= 60 ? 'no caminho certo' : 'com oportunidades de melhoria'} do seu potencial ideal
          </p>
        </div>

        {/* Demographics Match */}
        <div className="p-3 rounded-lg bg-muted/50 text-sm">
          <p className="text-muted-foreground">
            Baseado em: {healthyTwin.demographics.gender === 'male' ? 'Homem' : 'Mulher'}, {healthyTwin.demographics.age} anos, {healthyTwin.demographics.height}cm
          </p>
        </div>

        {/* Metric Comparisons */}
        <div className="space-y-6">
          {gaps.map((gap) => {
            const metric = METRICS.find(m => m.key === gap.metric);
            if (!metric) return null;

            return (
              <MetricComparisonRow
                key={gap.metric}
                metric={metric}
                userValue={gap.userValue}
                idealValue={gap.idealValue}
                gap={gap.gap}
                priority={gap.priority}
              />
            );
          })}
        </div>

        {/* Improvement Suggestions */}
        {improvementSuggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Target className="w-4 h-4 text-primary" />
              Próximos Passos
            </h4>
            <ul className="space-y-2">
              {improvementSuggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 text-sm"
                >
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                  {suggestion}
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HealthyTwinComparison;
