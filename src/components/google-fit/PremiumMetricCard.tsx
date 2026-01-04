import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, LucideIcon, Target, Award } from 'lucide-react';

interface PremiumMetricCardProps {
  title: string;
  value: number;
  unit: string;
  goal?: number;
  previousValue?: number;
  icon: LucideIcon;
  color: string;
  gradient: string;
  delay?: number;
}

export const PremiumMetricCard: React.FC<PremiumMetricCardProps> = ({
  title,
  value,
  unit,
  goal,
  previousValue,
  icon: Icon,
  color,
  gradient,
  delay = 0
}) => {
  const progress = goal ? Math.min((value / goal) * 100, 100) : 0;
  const variation = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const goalAchieved = goal && value >= goal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
        
        {/* Goal achieved badge */}
        {goalAchieved && (
          <motion.div
            className="absolute top-2 right-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: delay + 0.3 }}
          >
            <div className="bg-success/20 p-1.5 rounded-full">
              <Award className="w-4 h-4 text-success" />
            </div>
          </motion.div>
        )}

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            
            {previousValue !== undefined && (
              <div className="flex items-center gap-1">
                {variation > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-xs font-medium text-success">
                      +{variation.toFixed(1)}%
                    </span>
                  </>
                ) : variation < 0 ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span className="text-xs font-medium text-destructive">
                      {variation.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          <div className="space-y-1 mb-4">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline gap-1">
              <motion.span
                className="text-3xl font-bold"
                style={{ color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.2 }}
              >
                {value.toLocaleString('pt-BR')}
              </motion.span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>

          {goal && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Target className="w-3 h-3" />
                  <span>Meta: {goal.toLocaleString('pt-BR')} {unit}</span>
                </div>
                <span className="font-medium" style={{ color }}>
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-2" />
                <motion.div
                  className="absolute top-0 left-0 h-2 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
