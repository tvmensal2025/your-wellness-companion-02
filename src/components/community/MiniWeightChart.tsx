import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, ReferenceDot } from 'recharts';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface WeightDataPoint {
  date: string;
  peso_kg: number;
}

interface MiniWeightChartProps {
  data: WeightDataPoint[];
  className?: string;
}

export const MiniWeightChart: React.FC<MiniWeightChartProps> = ({ data, className = '' }) => {
  if (!data || data.length < 1) {
    return null;
  }

  // Preparar dados para o gráfico (últimas 10-15 medições)
  const chartData = data.slice(-15).map((point, index) => ({
    index,
    peso: point.peso_kg,
    date: point.date
  }));

  // Calcular tendência
  const firstWeight = chartData[0]?.peso || 0;
  const lastWeight = chartData[chartData.length - 1]?.peso || 0;
  const trend = lastWeight - firstWeight;
  const isPositive = trend < 0; // Perda de peso é positiva (negativa em kg)
  const isStable = Math.abs(trend) < 0.1;

  // Cores baseadas na tendência
  const getGradientColors = () => {
    if (isStable) return { start: '#6b7280', end: '#9ca3af' };
    if (isPositive) return { start: '#10b981', end: '#34d399' };
    return { start: '#f97316', end: '#fb923c' };
  };

  const colors = getGradientColors();

  // Formatar tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-2.5 shadow-xl">
          <p className="text-sm font-bold text-foreground">{`${payload[0].value.toFixed(1)} kg`}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {chartData[payload[0].payload.index]?.date}
          </p>
        </div>
      );
    }
    return null;
  };

  const TrendIcon = isStable ? Minus : isPositive ? TrendingDown : TrendingUp;

  return (
    <div className={`relative ${className}`}>
      {/* Header with trend indicator */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <TrendIcon className={`w-3.5 h-3.5 ${
            isStable 
              ? 'text-muted-foreground' 
              : isPositive 
                ? 'text-green-500 dark:text-green-400' 
                : 'text-orange-500 dark:text-orange-400'
          }`} />
          <span className={`text-[11px] font-semibold ${
            isStable 
              ? 'text-muted-foreground' 
              : isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-orange-600 dark:text-orange-400'
          }`}>
            {isStable ? 'Estável' : `${trend > 0 ? '+' : ''}${trend.toFixed(1)}kg`}
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground">
          {chartData.length} med.
        </span>
      </div>
      
      {/* Chart container with enhanced styling */}
      <div className="relative" style={{ width: '100%', height: '55px' }}>
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(to right, hsl(var(--muted)/0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--muted)/0.3) 1px, transparent 1px)',
            backgroundSize: '20% 33%'
          }} />
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id={`colorGradient-${isPositive ? 'pos' : 'neg'}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.start} stopOpacity={0.4} />
                <stop offset="100%" stopColor={colors.end} stopOpacity={0.05} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="peso"
              stroke={colors.start}
              strokeWidth={2}
              fill={`url(#colorGradient-${isPositive ? 'pos' : 'neg'})`}
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: colors.start, 
                stroke: 'white', 
                strokeWidth: 2,
                filter: 'url(#glow)'
              }}
              animationDuration={800}
              animationEasing="ease-out"
            />
            {/* Start and end point indicators */}
            {chartData.length > 1 && (
              <>
                <ReferenceDot 
                  x={0} 
                  y={chartData[0]?.peso} 
                  r={3} 
                  fill="hsl(var(--muted-foreground))" 
                  stroke="white" 
                  strokeWidth={1.5}
                />
                <ReferenceDot 
                  x={chartData.length - 1} 
                  y={chartData[chartData.length - 1]?.peso} 
                  r={4} 
                  fill={colors.start} 
                  stroke="white" 
                  strokeWidth={2}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
