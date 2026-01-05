import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthSystemData {
  systemName: string;
  score: number;
  color: string;
  icon: string;
  symptomsCount: number;
  symptoms: string[];
}

interface HealthWheelProps {
  data: HealthSystemData[];
  totalScore: number;
  title?: string;
  className?: string;
  size?: number;
}

// Dados padrão para quando não há dados
const defaultData: HealthSystemData[] = [
  { systemName: 'Energia', score: 7, color: '#ef4444', icon: '⚡', symptomsCount: 0, symptoms: [] },
  { systemName: 'Mental', score: 6, color: '#f59e0b', icon: '🧠', symptomsCount: 0, symptoms: [] },
  { systemName: 'Físico', score: 8, color: '#22c55e', icon: '💪', symptomsCount: 0, symptoms: [] },
  { systemName: 'Emocional', score: 5, color: '#3b82f6', icon: '❤️', symptomsCount: 0, symptoms: [] },
  { systemName: 'Social', score: 7, color: '#8b5cf6', icon: '👥', symptomsCount: 0, symptoms: [] },
  { systemName: 'Espiritual', score: 6, color: '#ec4899', icon: '✨', symptomsCount: 0, symptoms: [] },
  { systemName: 'Financeiro', score: 5, color: '#14b8a6', icon: '💰', symptomsCount: 0, symptoms: [] },
  { systemName: 'Propósito', score: 8, color: '#f97316', icon: '🎯', symptomsCount: 0, symptoms: [] },
];

export const HealthWheel: React.FC<HealthWheelProps> = ({
  data,
  totalScore,
  title = "Roda da Vida",
  className = "",
  size = 200
}) => {
  // Usar dados padrão se não houver dados ou todos scores são 0
  const hasValidData = data && data.length > 0 && data.some(d => d.score > 0);
  const displayData = hasValidData ? data : defaultData;
  const displayScore = hasValidData ? totalScore : 6.5;
  
  // Tamanho responsivo - compacto para mobile
  const getResponsiveSize = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 400) return 160;
      if (window.innerWidth < 640) return 180;
      if (window.innerWidth < 1024) return 200;
      return Math.min(size, 220);
    }
    return size;
  };

  const [responsiveSize, setResponsiveSize] = React.useState(getResponsiveSize());

  React.useEffect(() => {
    const handleResize = () => setResponsiveSize(getResponsiveSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const offset = 30;
  const centerX = responsiveSize / 2;
  const centerY = responsiveSize / 2;
  const outerRadius = responsiveSize * 0.38;
  const innerRadius = responsiveSize * 0.16;
  const iconRadius = responsiveSize * 0.50;

  const createPieSegment = (index: number, total: number, score: number, color: string) => {
    const angleSize = 360 / total;
    const startAngle = index * angleSize - 90;
    const endAngle = startAngle + angleSize;
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    const normalizedScore = Math.max(10, (score / 10) * 100);
    const currentRadius = innerRadius + (outerRadius - innerRadius) * (normalizedScore / 100);
    
    const x1 = centerX + offset + Math.cos(startAngleRad) * innerRadius;
    const y1 = centerY + offset + Math.sin(startAngleRad) * innerRadius;
    const x2 = centerX + offset + Math.cos(startAngleRad) * currentRadius;
    const y2 = centerY + offset + Math.sin(startAngleRad) * currentRadius;
    const x3 = centerX + offset + Math.cos(endAngleRad) * currentRadius;
    const y3 = centerY + offset + Math.sin(endAngleRad) * currentRadius;
    const x4 = centerX + offset + Math.cos(endAngleRad) * innerRadius;
    const y4 = centerY + offset + Math.sin(endAngleRad) * innerRadius;
    const largeArcFlag = angleSize > 180 ? 1 : 0;
    
    return (
      <path
        key={`segment-${index}`}
        d={`M ${x1} ${y1} L ${x2} ${y2} A ${currentRadius} ${currentRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`}
        fill={color}
        stroke="#1a1a1a"
        strokeWidth="1.5"
        opacity="0.85"
      />
    );
  };

  const getIconPosition = (index: number, total: number) => {
    const angleSize = 360 / total;
    const angle = index * angleSize - 90 + angleSize / 2;
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: centerX + Math.cos(angleRad) * iconRadius,
      y: centerY + Math.sin(angleRad) * iconRadius
    };
  };

  const radialLines = displayData.map((_, index) => {
    const angleSize = 360 / displayData.length;
    const angle = index * angleSize - 90;
    const angleRad = (angle * Math.PI) / 180;
    return (
      <line
        key={`line-${index}`}
        x1={centerX + offset + Math.cos(angleRad) * innerRadius}
        y1={centerY + offset + Math.sin(angleRad) * innerRadius}
        x2={centerX + offset + Math.cos(angleRad) * outerRadius}
        y2={centerY + offset + Math.sin(angleRad) * outerRadius}
        stroke="#444"
        strokeWidth="0.5"
        opacity="0.3"
      />
    );
  });

  const referenceCircles = [50, 100].map(percentage => {
    const r = innerRadius + (outerRadius - innerRadius) * (percentage / 100);
    return (
      <circle
        key={`circle-${percentage}`}
        cx={centerX + offset}
        cy={centerY + offset}
        r={r}
        fill="none"
        stroke="#444"
        strokeWidth="0.5"
        opacity="0.2"
        strokeDasharray="2,2"
      />
    );
  });

  const svgSize = responsiveSize + offset * 2;
  const iconSize = responsiveSize < 180 ? 9 : 11;

  return (
    <Card className={`bg-gray-900 text-white border-gray-700 ${className}`}>
      <CardHeader className="text-center pb-1 pt-2 px-2">
        <CardTitle className="text-white text-xs sm:text-sm">{title}</CardTitle>
        <div className="text-[9px] sm:text-[10px] text-gray-400">
          {hasValidData ? 'Mapeamento completo' : 'Dados de exemplo'}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-1 sm:p-2">
        <svg 
          width={svgSize} 
          height={svgSize} 
          viewBox={`0 0 ${svgSize} ${svgSize}`}
        >
          <rect x="0" y="0" width={svgSize} height={svgSize} fill="#1a1a1a" rx="6" />
          
          {referenceCircles}
          {radialLines}
          
          {displayData.map((system, index) => 
            createPieSegment(index, displayData.length, system.score, system.color)
          )}
          
          <circle
            cx={centerX + offset}
            cy={centerY + offset}
            r={innerRadius}
            fill="#0a0a0a"
            stroke="#333"
            strokeWidth="1"
          />
          
          {displayData.map((system, index) => {
            const iconPos = getIconPosition(index, displayData.length);
            return (
              <g key={`icon-${index}`}>
                <circle
                  cx={iconPos.x + offset}
                  cy={iconPos.y + offset}
                  r={iconSize}
                  fill="#2a2a2a"
                  stroke={system.color}
                  strokeWidth="1"
                />
                <text
                  x={iconPos.x + offset}
                  y={iconPos.y + offset + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: `${iconSize}px` }}
                  fill="white"
                >
                  {system.icon}
                </text>
                <text
                  x={iconPos.x + offset + iconSize + 6}
                  y={iconPos.y + offset + 1}
                  textAnchor="start"
                  dominantBaseline="middle"
                  style={{ fontSize: '8px', fontWeight: 'bold' }}
                  fill={system.color}
                >
                  {Math.round(system.score)}
                </text>
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
};

export default HealthWheel;
