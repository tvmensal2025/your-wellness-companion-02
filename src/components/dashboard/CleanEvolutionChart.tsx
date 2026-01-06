import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface WeightRecord {
  id: string;
  peso_kg: number;
  measurement_date: string;
  created_at: string;
}

interface CleanEvolutionChartProps {
  measurements: WeightRecord[];
  loading?: boolean;
}

// Memoized mini stat component
const MiniStat = memo(({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="py-2 sm:py-3 text-center">
    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide truncate">{label}</p>
    <p className={`text-xs sm:text-sm font-semibold mt-0.5 truncate ${highlight ? 'text-primary' : 'text-foreground'}`}>
      {value}
    </p>
  </div>
));

MiniStat.displayName = 'MiniStat';

// Memoized tooltip component - defined outside to prevent re-creation
const CustomTooltip = memo(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-semibold text-foreground">
          {payload[0].value.toFixed(1)} kg
        </p>
        <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

// Empty state component - lightweight and fast
const EmptyState = memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl bg-card border border-border/50 p-4"
  >
    <h3 className="text-sm font-medium text-foreground mb-3">Evolução</h3>
    <div className="h-28 flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <TrendingUp className="h-6 w-6 opacity-50" />
      <span className="text-sm">Registre seu peso para acompanhar</span>
    </div>
  </motion.div>
));

EmptyState.displayName = 'EmptyState';

// Loading skeleton - super lightweight
const LoadingSkeleton = memo(() => (
  <div className="rounded-2xl bg-card p-4 animate-pulse">
    <div className="h-4 bg-muted rounded w-1/4 mb-4" />
    <div className="h-36 bg-muted/50 rounded-xl" />
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export const CleanEvolutionChart: React.FC<CleanEvolutionChartProps> = memo(({
  measurements,
  loading = false
}) => {
  // Fast early returns - no computation needed
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!measurements || measurements.length === 0) {
    return <EmptyState />;
  }

  // Memoize all expensive computations
  const { chartData, minWeight, maxWeight, lastWeight, change } = useMemo(() => {
    // Prepare chart data - last 14 entries
    const data = measurements
      .slice(0, 14)
      .reverse()
      .map(m => ({
        date: format(new Date(m.measurement_date || m.created_at), 'dd/MM', { locale: ptBR }),
        weight: Number(m.peso_kg)
      }));

    const weights = data.map(d => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const last = weights[weights.length - 1];
    const first = weights[0];

    return {
      chartData: data,
      minWeight: min,
      maxWeight: max,
      lastWeight: last,
      change: last - first
    };
  }, [measurements]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl sm:rounded-2xl bg-card border border-border/50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-medium text-foreground truncate">Evolução</h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
            Últimos {chartData.length} registros
          </p>
        </div>
        <div className={`text-right flex-shrink-0 ${change <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          <span className="text-base sm:text-lg font-semibold">
            {change > 0 ? '+' : ''}{change.toFixed(1)}
          </span>
          <span className="text-[10px] sm:text-xs ml-0.5">kg</span>
        </div>
      </div>

      {/* Chart - altura responsiva */}
      <div className="h-28 sm:h-36 px-1 sm:px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="cleanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              dy={5}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[minWeight - 0.5, maxWeight + 0.5]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#cleanGradient)"
              dot={false}
              activeDot={{
                r: 3,
                stroke: 'hsl(var(--primary))',
                strokeWidth: 2,
                fill: 'hsl(var(--background))'
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats - mais compacto */}
      <div className="grid grid-cols-3 divide-x divide-border/50 border-t border-border/50">
        <MiniStat label="Mínimo" value={`${minWeight.toFixed(1)}kg`} />
        <MiniStat label="Atual" value={`${lastWeight.toFixed(1)}kg`} highlight />
        <MiniStat label="Máximo" value={`${maxWeight.toFixed(1)}kg`} />
      </div>
    </motion.div>
  );
});

CleanEvolutionChart.displayName = 'CleanEvolutionChart';
