import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface WeightDataPoint {
  date: string;
  peso_kg: number;
}

interface MiniWeightChartProps {
  data: WeightDataPoint[];
  className?: string;
}

export const MiniWeightChart: React.FC<MiniWeightChartProps> = ({ data, className = '' }) => {
  if (!data || data.length < 2) {
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

  // Cores baseadas na tendência
  const lineColor = isPositive ? '#10b981' : '#f97316'; // verde para perda, laranja para ganho

  // Formatar tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
          <p className="text-xs font-semibold">{`${payload[0].value.toFixed(1)} kg`}</p>
          <p className="text-[10px] text-muted-foreground">
            {chartData[payload[0].payload.index]?.date}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingDown className="w-3 h-3 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingUp className="w-3 h-3 text-orange-600 dark:text-orange-400" />
          )}
          <span className={`text-[10px] font-medium ${
            isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {Math.abs(trend).toFixed(1)}kg
          </span>
        </div>
      </div>
      
      <div style={{ width: '100%', height: '60px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="peso"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: lineColor }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

