import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

export const CleanEvolutionChart: React.FC<CleanEvolutionChartProps> = ({
  measurements,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl bg-card p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4" />
        <div className="h-36 bg-muted/50 rounded-xl" />
      </div>
    );
  }

  if (!measurements || measurements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border/50 p-4"
      >
        <h3 className="text-sm font-medium text-foreground mb-3">Evolução</h3>
        <div className="h-28 flex items-center justify-center text-sm text-muted-foreground">
          Registre seu peso para acompanhar
        </div>
      </motion.div>
    );
  }

  // Prepare chart data - last 14 entries
  const chartData = measurements
    .slice(0, 14)
    .reverse()
    .map(m => ({
      date: format(new Date(m.measurement_date || m.created_at), 'dd/MM', { locale: ptBR }),
      weight: Number(m.peso_kg)
    }));

  const weights = chartData.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const lastWeight = weights[weights.length - 1];
  const firstWeight = weights[0];
  const change = lastWeight - firstWeight;

  const CustomTooltip = ({ active, payload }: any) => {
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Evolução</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Últimos {chartData.length} registros
          </p>
        </div>
        <div className={`text-right ${change <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          <span className="text-lg font-semibold">
            {change > 0 ? '+' : ''}{change.toFixed(1)}
          </span>
          <span className="text-xs ml-0.5">kg</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-36 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              dy={5}
            />
            <YAxis 
              domain={[minWeight - 0.5, maxWeight + 0.5]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              width={35}
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
                r: 4,
                stroke: 'hsl(var(--primary))',
                strokeWidth: 2,
                fill: 'hsl(var(--background))'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 divide-x divide-border/50 border-t border-border/50">
        <MiniStat label="Mínimo" value={`${minWeight.toFixed(1)}kg`} />
        <MiniStat label="Atual" value={`${lastWeight.toFixed(1)}kg`} highlight />
        <MiniStat label="Máximo" value={`${maxWeight.toFixed(1)}kg`} />
      </div>
    </motion.div>
  );
};

const MiniStat: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ 
  label, 
  value, 
  highlight 
}) => (
  <div className="py-3 text-center">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-primary' : 'text-foreground'}`}>
      {value}
    </p>
  </div>
);
