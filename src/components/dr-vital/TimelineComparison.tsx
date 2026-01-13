// =====================================================
// TIMELINE COMPARISON COMPONENT
// =====================================================
// Comparação entre dois períodos de tempo
// Requirements: 8.6
// =====================================================

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  GitCompare, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Activity,
  Lightbulb,
} from 'lucide-react';
import { useTimelineComparison } from '@/hooks/dr-vital/useHealthTimeline';

// =====================================================
// PERIOD SELECTOR
// =====================================================

type PeriodPreset = 'last_week' | 'last_month' | 'last_3_months' | 'custom';

interface PeriodSelectorProps {
  label: string;
  selectedPreset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  customRange?: { start: Date; end: Date };
  onCustomRangeChange?: (range: { start: Date; end: Date }) => void;
}

function PeriodSelector({ 
  label, 
  selectedPreset, 
  onPresetChange,
}: PeriodSelectorProps) {
  const presets: { value: PeriodPreset; label: string }[] = [
    { value: 'last_week', label: 'Última semana' },
    { value: 'last_month', label: 'Último mês' },
    { value: 'last_3_months', label: 'Últimos 3 meses' },
  ];

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex flex-wrap gap-2">
        {presets.map(preset => (
          <Button
            key={preset.value}
            variant={selectedPreset === preset.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange(preset.value)}
            className="h-8"
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// COMPARISON STAT
// =====================================================

interface ComparisonStatProps {
  label: string;
  value1: number;
  value2: number;
  format?: (value: number) => string;
  higherIsBetter?: boolean;
}

function ComparisonStat({ 
  label, 
  value1, 
  value2, 
  format = (v) => v.toString(),
  higherIsBetter = true,
}: ComparisonStatProps) {
  const diff = value2 - value1;
  const percentChange = value1 !== 0 ? ((diff / value1) * 100) : 0;
  const isImprovement = higherIsBetter ? diff > 0 : diff < 0;
  const isNoChange = diff === 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm">{format(value1)}</span>
        <div className={cn(
          'flex items-center gap-1 text-sm font-medium',
          isNoChange ? 'text-muted-foreground' : isImprovement ? 'text-green-500' : 'text-red-500'
        )}>
          {isNoChange ? (
            <Minus className="w-4 h-4" />
          ) : isImprovement ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {!isNoChange && (
            <span>{percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}%</span>
          )}
        </div>
        <span className="text-sm font-medium">{format(value2)}</span>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface TimelineComparisonProps {
  className?: string;
}

export function TimelineComparison({ className }: TimelineComparisonProps) {
  const [period1Preset, setPeriod1Preset] = useState<PeriodPreset>('last_month');
  const [period2Preset, setPeriod2Preset] = useState<PeriodPreset>('last_week');

  // Calculate date ranges from presets
  const getDateRange = (preset: PeriodPreset): { start: Date; end: Date } => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (preset) {
      case 'last_week':
        start.setDate(start.getDate() - 7);
        break;
      case 'last_month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'last_3_months':
        start.setMonth(start.getMonth() - 3);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return { start, end };
  };

  const period1Range = useMemo(() => getDateRange(period1Preset), [period1Preset]);
  const period2Range = useMemo(() => getDateRange(period2Preset), [period2Preset]);

  const {
    comparison,
    isLoading,
    error,
  } = useTimelineComparison(period1Range, period2Range);

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <GitCompare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium">Erro ao comparar períodos</h3>
          <p className="text-sm text-muted-foreground">
            Não foi possível gerar a comparação.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date) => date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          Comparar Períodos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Period Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PeriodSelector
            label="Período Anterior"
            selectedPreset={period1Preset}
            onPresetChange={setPeriod1Preset}
          />
          <PeriodSelector
            label="Período Atual"
            selectedPreset={period2Preset}
            onPresetChange={setPeriod2Preset}
          />
        </div>

        {/* Date Range Display */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(period1Range.start)} - {formatDate(period1Range.end)}
          </div>
          <span>vs</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(period2Range.start)} - {formatDate(period2Range.end)}
          </div>
        </div>

        {comparison && (
          <>
            {/* Overall Improvement */}
            <div className={cn(
              'p-4 rounded-lg text-center',
              comparison.improvement > 0 
                ? 'bg-green-500/10 text-green-500' 
                : comparison.improvement < 0 
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-muted text-muted-foreground'
            )}>
              <div className="flex items-center justify-center gap-2 mb-1">
                {comparison.improvement > 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : comparison.improvement < 0 ? (
                  <TrendingDown className="w-5 h-5" />
                ) : (
                  <Minus className="w-5 h-5" />
                )}
                <span className="text-2xl font-bold">
                  {comparison.improvement > 0 ? '+' : ''}{comparison.improvement.toFixed(0)}%
                </span>
              </div>
              <p className="text-sm">
                {comparison.improvement > 0 
                  ? 'Melhoria geral' 
                  : comparison.improvement < 0 
                    ? 'Queda no desempenho'
                    : 'Sem mudanças significativas'}
              </p>
            </div>

            {/* Stats Comparison */}
            <div className="space-y-2">
              <ComparisonStat
                label="Total de Eventos"
                value1={comparison.period1.summary.totalEvents}
                value2={comparison.period2.summary.totalEvents}
              />
              <ComparisonStat
                label="Conquistas"
                value1={comparison.period1.summary.achievements}
                value2={comparison.period2.summary.achievements}
              />
              <ComparisonStat
                label="Health Score Médio"
                value1={comparison.period1.summary.avgHealthScore}
                value2={comparison.period2.summary.avgHealthScore}
                format={(v) => v.toFixed(0)}
              />
            </div>

            {/* Insights */}
            {comparison.insights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Insights
                </h4>
                <ul className="space-y-1">
                  {comparison.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TimelineComparison;
