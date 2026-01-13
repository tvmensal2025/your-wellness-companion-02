import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionResultData } from './SessionCompleteFactory';

interface LifeWheelResultCardProps {
  data: SessionResultData;
  config: {
    emoji: string;
    color: string;
    gradient: string;
  };
  isHealthWheel?: boolean;
}

// Áreas padrão da Roda da Vida
const defaultAreas = [
  { id: 'career', name: 'Carreira', icon: '💼', color: '#3b82f6' },
  { id: 'finances', name: 'Finanças', icon: '💰', color: '#22c55e' },
  { id: 'health', name: 'Saúde', icon: '❤️', color: '#ef4444' },
  { id: 'relationships', name: 'Relacionamentos', icon: '💕', color: '#ec4899' },
  { id: 'family', name: 'Família', icon: '👨‍👩‍👧', color: '#f97316' },
  { id: 'social', name: 'Social', icon: '👥', color: '#8b5cf6' },
  { id: 'personal_growth', name: 'Crescimento', icon: '🌱', color: '#10b981' },
  { id: 'fun', name: 'Lazer', icon: '🎨', color: '#f59e0b' },
  { id: 'physical', name: 'Físico', icon: '🏃', color: '#06b6d4' },
  { id: 'spirituality', name: 'Espiritualidade', icon: '🧘', color: '#a855f7' },
  { id: 'contribution', name: 'Contribuição', icon: '🤝', color: '#14b8a6' },
  { id: 'environment', name: 'Ambiente', icon: '🏠', color: '#64748b' }
];

// Extrair scores das respostas
const extractScores = (responses: Record<string, any>): Record<string, number> => {
  const scores: Record<string, number> = {};

  Object.entries(responses).forEach(([key, value]) => {
    // Tentar extrair número do valor
    let score = 0;
    if (typeof value === 'number') {
      score = value;
    } else if (typeof value === 'string') {
      const match = value.match(/(\d+)/);
      if (match) score = parseInt(match[1]);
    }

    // Normalizar para 0-10
    if (score > 10) score = Math.round(score / 10);
    if (score > 0 && score <= 10) {
      // Mapear key para área
      const keyLower = key.toLowerCase();
      defaultAreas.forEach(area => {
        if (keyLower.includes(area.id) || keyLower.includes(area.name.toLowerCase())) {
          scores[area.id] = score;
        }
      });

      // Se não encontrou, usar o próprio key
      if (!Object.keys(scores).some(k => keyLower.includes(k))) {
        scores[key] = score;
      }
    }
  });

  return scores;
};

export const LifeWheelResultCard: React.FC<LifeWheelResultCardProps> = ({
  data,
  config,
  isHealthWheel = false
}) => {
  const scores = extractScores(data.responses);
  const firstName = data.userName?.split(' ')[0] || 'Você';

  // Calcular média
  const scoreValues = Object.values(scores);
  const averageScore = scoreValues.length > 0
    ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
    : 0;

  // Ordenar áreas por score
  const sortedAreas = defaultAreas
    .filter(area => scores[area.id] !== undefined)
    .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  const topAreas = sortedAreas.slice(0, 3);
  const bottomAreas = sortedAreas.slice(-3).reverse();

  return (
    <Card className="border-0 shadow-xl bg-card overflow-hidden">
      {/* Header */}
      <div className={cn("p-5 text-white bg-gradient-to-r", config.gradient)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {isHealthWheel ? 'Roda da Saúde' : 'Roda da Vida'}
            </h2>
            <p className="text-white/80 text-sm">{firstName}, seu equilíbrio atual</p>
          </div>
          <div className="text-4xl">{config.emoji}</div>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Score Central com Radar simplificado */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Gráfico Radar Simplificado */}
          <div className="flex justify-center mb-4">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Círculos de fundo */}
                {[20, 40, 60, 80, 100].map((r, i) => (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r={r * 0.8}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-muted/20"
                  />
                ))}

                {/* Área preenchida */}
                <motion.polygon
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 0.5 }}
                  points={sortedAreas.map((area, i) => {
                    const angle = (i * 360 / sortedAreas.length - 90) * Math.PI / 180;
                    const score = scores[area.id] || 0;
                    const r = (score / 10) * 80;
                    const x = 100 + r * Math.cos(angle);
                    const y = 100 + r * Math.sin(angle);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill={config.color}
                />

                {/* Pontos */}
                {sortedAreas.map((area, i) => {
                  const angle = (i * 360 / sortedAreas.length - 90) * Math.PI / 180;
                  const score = scores[area.id] || 0;
                  const r = (score / 10) * 80;
                  const x = 100 + r * Math.cos(angle);
                  const y = 100 + r * Math.sin(angle);

                  return (
                    <motion.circle
                      key={area.id}
                      cx={x}
                      cy={y}
                      r="6"
                      fill={area.color}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    />
                  );
                })}
              </svg>

              {/* Score central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-card rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl font-bold"
                    style={{ color: config.color }}
                  >
                    {(averageScore * 10).toFixed(0)}%
                  </motion.span>
                  <span className="text-xs text-muted-foreground">Equilíbrio</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Áreas em Destaque */}
        {topAreas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-sm text-foreground">Áreas em Destaque</span>
            </div>
            <div className="space-y-2">
              {topAreas.map((area, i) => (
                <AreaBar
                  key={area.id}
                  icon={area.icon}
                  name={area.name}
                  score={scores[area.id] || 0}
                  color={area.color}
                  delay={0.7 + i * 0.1}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Áreas para Desenvolver */}
        {bottomAreas.length > 0 && bottomAreas[0] !== topAreas[topAreas.length - 1] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-sm text-foreground">Áreas para Desenvolver</span>
            </div>
            <div className="space-y-2">
              {bottomAreas.slice(0, 2).map((area, i) => (
                <AreaBar
                  key={area.id}
                  icon={area.icon}
                  name={area.name}
                  score={scores[area.id] || 0}
                  color={area.color}
                  delay={1 + i * 0.1}
                  isLow
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Dica */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="p-4 rounded-xl bg-muted/50 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {averageScore >= 7
              ? '🌟 Excelente equilíbrio! Continue assim!'
              : averageScore >= 5
              ? '💪 Bom progresso! Foque nas áreas mais baixas.'
              : '🌱 Cada área importa. Comece pela que mais te motiva!'}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};

// Componente de barra de área
const AreaBar = ({
  icon,
  name,
  score,
  color,
  delay,
  isLow = false
}: {
  icon: string;
  name: string;
  score: number;
  color: string;
  delay: number;
  isLow?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3"
  >
    <span className="text-xl">{icon}</span>
    <div className="flex-1">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-foreground">{name}</span>
        <span className="font-bold" style={{ color }}>{score * 10}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8, delay: delay + 0.1 }}
        />
      </div>
    </div>
  </motion.div>
);
