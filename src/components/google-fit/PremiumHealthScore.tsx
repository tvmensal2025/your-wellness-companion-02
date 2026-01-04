import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Heart, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface PremiumHealthScoreProps {
  score: number;
  previousScore?: number;
  label?: string;
  description?: string;
}

export const PremiumHealthScore: React.FC<PremiumHealthScoreProps> = ({
  score,
  previousScore,
  label = "Score de Saúde",
  description
}) => {
  const getScoreColor = (value: number) => {
    if (value >= 80) return { color: 'hsl(142, 76%, 36%)', gradient: 'from-emerald-400 to-green-600', bg: 'bg-emerald-500/10' };
    if (value >= 60) return { color: 'hsl(48, 96%, 53%)', gradient: 'from-yellow-400 to-amber-500', bg: 'bg-amber-500/10' };
    if (value >= 40) return { color: 'hsl(25, 95%, 53%)', gradient: 'from-orange-400 to-orange-600', bg: 'bg-orange-500/10' };
    return { color: 'hsl(0, 84%, 60%)', gradient: 'from-red-400 to-red-600', bg: 'bg-red-500/10' };
  };

  const scoreStyle = getScoreColor(score);
  const variation = previousScore ? score - previousScore : 0;

  const data = [
    {
      name: 'Score',
      value: score,
      fill: scoreStyle.color,
    },
  ];

  const getScoreMessage = (value: number) => {
    if (value >= 90) return "Excelente! Continue assim! 🎉";
    if (value >= 80) return "Muito bom! Você está no caminho certo! 💪";
    if (value >= 70) return "Bom! Pequenos ajustes podem fazer diferença! 👍";
    if (value >= 60) return "Regular. Vamos melhorar juntos! 🌟";
    if (value >= 50) return "Atenção! Sua saúde precisa de cuidados. ⚠️";
    return "Alerta! Procure melhorar seus hábitos. 🚨";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`relative overflow-hidden border-0 shadow-xl ${scoreStyle.bg}`}>
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${scoreStyle.gradient} opacity-5`} />
        
        {/* Animated sparkles */}
        <motion.div
          className="absolute top-4 right-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-6 h-6 text-primary/30" />
        </motion.div>

        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Heart className="w-5 h-5 text-health-heart" />
            {label}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0 px-3 sm:px-6">
          <div className="flex items-center justify-center">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={10}
                  data={data}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background={{ fill: 'hsl(var(--muted))' }}
                    dataKey="value"
                    cornerRadius={10}
                    fill={scoreStyle.color}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-3xl sm:text-4xl font-bold"
                  style={{ color: scoreStyle.color }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {score}
                </motion.span>
                <span className="text-xs sm:text-sm text-muted-foreground">de 100</span>
              </div>
            </div>
          </div>

          {/* Variation indicator */}
          {previousScore !== undefined && (
            <motion.div
              className="flex items-center justify-center gap-2 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {variation > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    +{variation} pontos vs período anterior
                  </span>
                </>
              ) : variation < 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    {variation} pontos vs período anterior
                  </span>
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Sem alteração vs período anterior
                  </span>
                </>
              )}
            </motion.div>
          )}

          {/* Score message */}
          <motion.p
            className="text-center text-sm text-muted-foreground mt-3 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {description || getScoreMessage(score)}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
