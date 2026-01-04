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

        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2">
            <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            
            {previousValue !== undefined && (
              <div className="flex items-center gap-0.5">
                {variation > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-[10px] sm:text-xs font-medium text-success">
                      +{variation.toFixed(0)}%
                    </span>
                  </>
                ) : variation < 0 ? (
                  <>
                    <TrendingDown className="w-3 h-3 text-destructive" />
                    <span className="text-[10px] sm:text-xs font-medium text-destructive">
                      {variation.toFixed(0)}%
                    </span>
                  </>
                ) : (
                  <Minus className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          <div className="space-y-0.5 mb-2 sm:mb-3">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{title}</p>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <motion.span
                className="text-xl sm:text-2xl lg:text-3xl font-bold"
                style={{ color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.2 }}
              >
                {value.toLocaleString('pt-BR')}
              </motion.span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{unit}</span>
            </div>
          </div>

          {goal && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <div className="flex items-center gap-0.5 text-muted-foreground">
                  <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="truncate">Meta: {goal.toLocaleString('pt-BR')} {unit}</span>
                </div>
                <span className="font-medium" style={{ color }}>
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-1.5 sm:h-2" />
                <motion.div
                  className="absolute top-0 left-0 h-1.5 sm:h-2 rounded-full"
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
