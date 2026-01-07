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
  onRegisterClick?: () => void;
}

// Memoized mini stat component
const MiniStat = memo(({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="py-3 sm:py-4 text-center">
    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide truncate">{label}</p>
    <p className={`text-sm sm:text-base font-bold mt-1 truncate ${highlight ? 'text-primary' : 'text-foreground'}`}>
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

// Empty state component - motivational and actionable
const EmptyState = memo(({ onRegisterClick }: { onRegisterClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl bg-card border border-border/50 p-5 sm:p-6"
  >
    <h3 className="text-sm font-medium text-foreground mb-4">Evolução</h3>
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      {/* Ilustração de gráfico vazio */}
      <svg 
        className="w-32 h-20 text-muted-foreground/30" 
        viewBox="0 0 120 60" 
        fill="none"
      >
        {/* Grid lines */}
        <line x1="10" y1="10" x2="10" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="10" y1="50" x2="110" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        
        {/* Dotted line representing potential chart */}
        <motion.path
          d="M 15 40 Q 30 35, 45 38 T 75 30 T 105 25"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="4 4"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Dots on the line */}
        <motion.circle cx="15" cy="40" r="3" fill="hsl(var(--primary))" opacity="0.3" 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
        <motion.circle cx="45" cy="38" r="3" fill="hsl(var(--primary))" opacity="0.3"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />
        <motion.circle cx="75" cy="30" r="3" fill="hsl(var(--primary))" opacity="0.3"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }} />
        <motion.circle cx="105" cy="25" r="3" fill="hsl(var(--primary))" opacity="0.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
      </svg>

      {/* Title */}
      <div className="text-center space-y-1">
        <h4 className="text-base font-semibold text-foreground flex items-center justify-center gap-2">
          <span>📈</span> Sua Evolução Começa Aqui!
        </h4>
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Registre seu primeiro peso para acompanhar seu progresso com gráficos detalhados
        </p>
      </div>

      {/* CTA Button */}
      {onRegisterClick && (
        <motion.button
          onClick={onRegisterClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
        >
          <span>⚖️</span> Registrar Primeiro Peso
        </motion.button>
      )}
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
  loading = false,
  onRegisterClick
}) => {
  // Fast early returns - no computation needed
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!measurements || measurements.length === 0) {
    return <EmptyState onRegisterClick={onRegisterClick} />;
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
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3 flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">Evolução</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
            Últimos {chartData.length} registros
          </p>
        </div>
        <div className={`text-right flex-shrink-0 ${change <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          <span className="text-lg sm:text-xl font-bold">
            {change > 0 ? '+' : ''}{change.toFixed(1)}
          </span>
          <span className="text-xs sm:text-sm ml-0.5">kg</span>
        </div>
      </div>

      {/* Chart - altura responsiva */}
      <div className="h-36 sm:h-44 px-2 sm:px-3">
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
