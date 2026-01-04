import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { LucideIcon } from 'lucide-react';

interface PremiumGaugeChartProps {
  title: string;
  value: number;
  maxValue: number;
  unit: string;
  icon: LucideIcon;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  zones?: {
    low: number;
    medium: number;
    high: number;
  };
  showZoneLabels?: boolean;
}

export const PremiumGaugeChart: React.FC<PremiumGaugeChartProps> = ({
  title,
  value,
  maxValue,
  unit,
  icon: Icon,
  colors,
  zones = { low: 33, medium: 66, high: 100 },
  showZoneLabels = true
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const getZoneColor = (pct: number) => {
    if (pct <= zones.low) return '#ef4444'; // red
    if (pct <= zones.medium) return '#f59e0b'; // amber
    return '#22c55e'; // green
  };

  const data = [
    { value: percentage, fill: getZoneColor(percentage) },
    { value: 100 - percentage, fill: colors.background },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div 
          className="absolute inset-0 opacity-5"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
        />
        
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div 
              className="p-2 rounded-lg"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="relative w-full h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="80%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius="70%"
                  outerRadius="100%"
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center value */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <motion.span
                className="text-2xl font-bold"
                style={{ color: getZoneColor(percentage) }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {value.toLocaleString('pt-BR')}
              </motion.span>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
          </div>

          {/* Zone labels */}
          {showZoneLabels && (
            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-4">
              <span>0</span>
              <span>{maxValue.toLocaleString('pt-BR')}</span>
            </div>
          )}

          {/* Zone indicator */}
          <div className="flex gap-1 mt-3">
            <div 
              className="flex-1 h-1.5 rounded-full"
              style={{ 
                background: percentage >= 0 ? '#ef4444' : colors.background,
                opacity: percentage <= zones.low ? 1 : 0.3
              }}
            />
            <div 
              className="flex-1 h-1.5 rounded-full"
              style={{ 
                background: percentage > zones.low ? '#f59e0b' : colors.background,
                opacity: percentage > zones.low && percentage <= zones.medium ? 1 : 0.3
              }}
            />
            <div 
              className="flex-1 h-1.5 rounded-full"
              style={{ 
                background: percentage > zones.medium ? '#22c55e' : colors.background,
                opacity: percentage > zones.medium ? 1 : 0.3
              }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
