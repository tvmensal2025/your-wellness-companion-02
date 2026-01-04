import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Calendar, ChevronRight, BarChart3, Scale } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface WeightRecord {
  id: string;
  peso_kg: number;
  measurement_date: string;
  created_at: string;
}

interface EvolutionChartPremiumProps {
  measurements: WeightRecord[];
  loading?: boolean;
  onViewFullHistory?: () => void;
}

export const EvolutionChartPremium: React.FC<EvolutionChartPremiumProps> = ({
  measurements,
  loading = false,
  onViewFullHistory
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl bg-card border border-border/40 p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-40 bg-muted rounded" />
      </div>
    );
  }

  if (!measurements || measurements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border/40 p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Evolução do Peso</span>
        </div>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          Registre seu primeiro peso para ver a evolução
        </div>
      </motion.div>
    );
  }

  // Prepare chart data
  const chartData = measurements
    .slice(0, 30)
    .reverse()
    .map(m => ({
      date: format(new Date(m.measurement_date || m.created_at), 'dd/MM', { locale: ptBR }),
      fullDate: format(new Date(m.measurement_date || m.created_at), "dd 'de' MMM", { locale: ptBR }),
      weight: Number(m.peso_kg)
    }));

  // Calculate stats
  const weights = chartData.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const totalChange = lastWeight - firstWeight;
  const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-xl">
          <p className="text-[10px] text-muted-foreground mb-1">{payload[0].payload.fullDate}</p>
          <p className="text-lg font-bold text-foreground">
            {payload[0].value.toFixed(1)}<span className="text-xs text-muted-foreground ml-0.5">kg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl sm:rounded-3xl bg-card border border-border/40 overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Evolução do Peso</h3>
              <p className="text-[10px] text-muted-foreground">Últimos {chartData.length} registros</p>
            </div>
          </div>
          
          {/* Total change badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            totalChange < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {totalChange < 0 ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5" />
            )}
            <span className="text-xs font-semibold">
              {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)}kg
            </span>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatMiniCard 
            label="Mínimo"
            value={minWeight.toFixed(1)}
            unit="kg"
            color="text-emerald-500"
          />
          <StatMiniCard 
            label="Média"
            value={avgWeight.toFixed(1)}
            unit="kg"
            color="text-primary"
          />
          <StatMiniCard 
            label="Máximo"
            value={maxWeight.toFixed(1)}
            unit="kg"
            color="text-amber-500"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 sm:h-56 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGradientPremium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3}
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              domain={[minWeight - 1, maxWeight + 1]}
              tickFormatter={(value) => `${value}`}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fill="url(#weightGradientPremium)"
              dot={false}
              activeDot={{
                r: 5,
                stroke: 'hsl(var(--primary))',
                strokeWidth: 2,
                fill: 'hsl(var(--card))'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="p-4 pt-2 border-t border-border/30 mt-2">
        <button 
          onClick={onViewFullHistory}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors text-sm text-muted-foreground"
        >
          <Calendar className="h-4 w-4" />
          Ver histórico completo
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Mini stat card
const StatMiniCard: React.FC<{
  label: string;
  value: string;
  unit: string;
  color: string;
}> = ({ label, value, unit, color }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/30">
    <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</span>
    <div className="flex items-baseline gap-0.5">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-muted-foreground">{unit}</span>
    </div>
  </div>
);
