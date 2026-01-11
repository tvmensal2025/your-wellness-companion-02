import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface MacroRadarChartProps {
  current: MacroData;
  target: MacroData;
  className?: string;
  size?: number;
  showLabels?: boolean;
  animated?: boolean;
}

const MACRO_CONFIG = [
  { key: 'calories', label: 'Calorias', color: '#ef4444', unit: 'kcal', max: 3000 },
  { key: 'protein', label: 'Proteína', color: '#f97316', unit: 'g', max: 200 },
  { key: 'carbs', label: 'Carbos', color: '#eab308', unit: 'g', max: 400 },
  { key: 'fat', label: 'Gordura', color: '#22c55e', unit: 'g', max: 100 },
  { key: 'fiber', label: 'Fibra', color: '#06b6d4', unit: 'g', max: 50 }
];

export const MacroRadarChart: React.FC<MacroRadarChartProps> = ({
  current,
  target,
  className,
  size = 200,
  showLabels = true,
  animated = true
}) => {
  const center = size / 2;
  const radius = (size / 2) - 30;
  const angleStep = (2 * Math.PI) / MACRO_CONFIG.length;

  // Calculate points for polygon
  const calculatePoints = (data: MacroData, maxRadius: number) => {
    return MACRO_CONFIG.map((macro, index) => {
      const value = data[macro.key as keyof MacroData] || 0;
      const normalizedValue = Math.min(value / macro.max, 1);
      const angle = index * angleStep - Math.PI / 2;
      const r = normalizedValue * maxRadius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    });
  };

  const targetPoints = useMemo(() => calculatePoints(target, radius), [target, radius]);
  const currentPoints = useMemo(() => calculatePoints(current, radius), [current, radius]);

  const targetPath = targetPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const currentPath = currentPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Calculate match percentage
  const matchPercentage = useMemo(() => {
    let totalMatch = 0;
    MACRO_CONFIG.forEach((macro) => {
      const currentVal = current[macro.key as keyof MacroData] || 0;
      const targetVal = target[macro.key as keyof MacroData] || 1;
      const ratio = Math.min(currentVal / targetVal, targetVal / currentVal);
      totalMatch += ratio;
    });
    return Math.round((totalMatch / MACRO_CONFIG.length) * 100);
  }, [current, target]);

  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Background circles */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle
            key={scale}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {MACRO_CONFIG.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          );
        })}

        {/* Target area (background) */}
        <motion.path
          d={targetPath}
          fill="hsl(var(--primary))"
          fillOpacity={0.1}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeDasharray="4 4"
          initial={animated ? { pathLength: 0, opacity: 0 } : {}}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Current area */}
        <motion.path
          d={currentPath}
          fill="url(#radarGradient)"
          fillOpacity={0.6}
          stroke="url(#radarStrokeGradient)"
          strokeWidth={2}
          initial={animated ? { pathLength: 0, opacity: 0 } : {}}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="radarStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Data points */}
        {currentPoints.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={MACRO_CONFIG[index].color}
            stroke="white"
            strokeWidth={2}
            initial={animated ? { scale: 0 } : {}}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
          />
        ))}

        {/* Labels */}
        {showLabels && MACRO_CONFIG.map((macro, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const labelRadius = radius + 25;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          const currentVal = current[macro.key as keyof MacroData] || 0;
          
          return (
            <g key={macro.key}>
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                className="text-[10px] font-medium fill-foreground"
              >
                {macro.label}
              </text>
              <text
                x={x}
                y={y + 6}
                textAnchor="middle"
                className="text-[9px] fill-muted-foreground"
              >
                {Math.round(currentVal)}{macro.unit}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Center match indicator */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <div className="text-center">
          <motion.span
            className={cn(
              "text-2xl font-bold",
              matchPercentage >= 90 ? "text-green-500" :
              matchPercentage >= 70 ? "text-yellow-500" :
              "text-orange-500"
            )}
            initial={animated ? { opacity: 0 } : {}}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {matchPercentage}%
          </motion.span>
          <p className="text-[10px] text-muted-foreground">match</p>
        </div>
      </motion.div>

      {/* Match animation */}
      {matchPercentage >= 90 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-green-500"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};
