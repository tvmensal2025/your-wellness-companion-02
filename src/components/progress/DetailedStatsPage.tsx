import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Footprints, Flame, Zap, Moon, Heart, Activity,
  TrendingUp, TrendingDown, ChevronRight, Target
} from 'lucide-react';

// ============================================================================
// TIPOS
// ============================================================================

interface DayData {
  date: string;
  dayName: string;
  dayNumber: number;
  value: number;
  isToday: boolean;
}

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  goal: number;
  icon: React.ElementType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  weekData: DayData[];
  trend?: number;
  onClick?: () => void;
}

// ============================================================================
// ANEL DE PROGRESSO
// ============================================================================

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  progress, size = 60, strokeWidth = 6, color 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// ============================================================================
// GRÁFICO DE BARRAS SEMANAL
// ============================================================================

interface WeeklyChartProps {
  data: DayData[];
  goal: number;
  color: string;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data, goal, color }) => {
  const maxValue = Math.max(...data.map(d => d.value), goal);

  return (
    <div className="space-y-2">
      {/* Barras */}
      <div className="flex items-end justify-between gap-1.5 h-16">
        {data.map((day, i) => {
          const height = maxValue > 0 ? (day.value / maxValue) * 100 : 0;
          const reachedGoal = day.value >= goal;
          
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                style={{ transformOrigin: 'bottom' }}
                className="w-full flex flex-col justify-end"
              >
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all",
                    reachedGoal ? color : "bg-muted",
                    day.isToday && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ height: `${Math.max(height, 8)}%`, minHeight: '4px' }}
                />
              </motion.div>
            </div>
          );
        })}
      </div>
      
      {/* Labels dos dias */}
      <div className="flex justify-between gap-1.5">
        {data.map((day) => (
          <div key={day.date} className="flex-1 text-center">
            <span className={cn(
              "text-[10px] block",
              day.isToday ? "text-primary font-bold" : "text-muted-foreground"
            )}>
              {day.dayName}
            </span>
            <span className={cn(
              "text-[9px] block",
              day.isToday ? "text-primary" : "text-muted-foreground/60"
            )}>
              {day.dayNumber}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


// ============================================================================
// CARD DE MÉTRICA PREMIUM
// ============================================================================

const MetricCard: React.FC<MetricCardProps> = ({
  title, value, unit, goal, icon: Icon, color, gradientFrom, gradientTo,
  weekData, trend, onClick
}) => {
  const progress = goal > 0 ? (value / goal) * 100 : 0;
  const isUp = trend && trend > 0;
  const isDown = trend && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        {/* Header com gradiente */}
        <div className={cn("p-4 text-white", `bg-gradient-to-r ${gradientFrom} ${gradientTo}`)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{title}</span>
            </div>
            {trend !== undefined && trend !== 0 && (
              <div className={cn(
                "flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full",
                "bg-white/20"
              )}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          
          {/* Valor principal */}
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{value.toLocaleString()}</p>
              <p className="text-xs opacity-80">{unit}</p>
            </div>
            <ProgressRing progress={progress} color="white" />
          </div>
        </div>
        
        {/* Gráfico semanal */}
        <CardContent className="p-4">
          <WeeklyChart data={weekData} goal={goal} color={color} />
          
          {/* Meta */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="w-3 h-3" />
              <span>Meta: {goal.toLocaleString()} {unit}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface DetailedStatsPageProps {
  data: any[];
  goals: {
    stepsGoal: number;
    caloriesGoal: number;
    activeMinutesGoal: number;
    sleepGoal: number;
  };
  onMetricClick?: (metric: string) => void;
}

export const DetailedStatsPage: React.FC<DetailedStatsPageProps> = ({
  data, goals, onMetricClick
}) => {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Preparar dados da semana
  const getWeekData = (getValue: (d: any) => number): DayData[] => {
    const result: DayData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = data.find(d => d.date === dateStr);
      
      result.push({
        date: dateStr,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        value: dayData ? getValue(dayData) : 0,
        isToday: i === 0
      });
    }
    return result;
  };

  // Calcular tendência (hoje vs média da semana)
  const getTrend = (weekData: DayData[]): number => {
    const todayValue = weekData[weekData.length - 1]?.value || 0;
    const pastValues = weekData.slice(0, -1).map(d => d.value).filter(v => v > 0);
    if (pastValues.length === 0) return 0;
    const avg = pastValues.reduce((a, b) => a + b, 0) / pastValues.length;
    if (avg === 0) return 0;
    return Math.round(((todayValue - avg) / avg) * 100);
  };

  // Dados por métrica
  const stepsWeek = getWeekData(d => d.steps || 0);
  const caloriesWeek = getWeekData(d => d.calories || 0);
  const activeWeek = getWeekData(d => d.active_minutes || 0);
  const sleepWeek = getWeekData(d => d.sleep_hours || 0);
  const heartWeek = getWeekData(d => d.heart_rate_avg || 0);
  const distanceWeek = getWeekData(d => (d.distance_meters || 0) / 1000);

  // Valores de hoje
  const todaySteps = stepsWeek[stepsWeek.length - 1]?.value || 0;
  const todayCalories = caloriesWeek[caloriesWeek.length - 1]?.value || 0;
  const todayActive = activeWeek[activeWeek.length - 1]?.value || 0;
  const todaySleep = sleepWeek[sleepWeek.length - 1]?.value || 0;
  const todayHeart = heartWeek[heartWeek.length - 1]?.value || 0;
  const todayDistance = distanceWeek[distanceWeek.length - 1]?.value || 0;

  return (
    <div className="space-y-4">
      {/* Passos */}
      <MetricCard
        title="Passos"
        value={todaySteps}
        unit="passos"
        goal={goals.stepsGoal}
        icon={Footprints}
        color="bg-emerald-500"
        gradientFrom="from-emerald-500"
        gradientTo="to-green-600"
        weekData={stepsWeek}
        trend={getTrend(stepsWeek)}
        onClick={() => onMetricClick?.('steps')}
      />

      {/* Grid 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Calorias */}
        <MetricCard
          title="Calorias"
          value={todayCalories}
          unit="kcal"
          goal={goals.caloriesGoal}
          icon={Flame}
          color="bg-orange-500"
          gradientFrom="from-orange-500"
          gradientTo="to-red-500"
          weekData={caloriesWeek}
          trend={getTrend(caloriesWeek)}
          onClick={() => onMetricClick?.('calories')}
        />

        {/* Minutos Ativos */}
        <MetricCard
          title="Min. Ativos"
          value={todayActive}
          unit="min"
          goal={goals.activeMinutesGoal}
          icon={Zap}
          color="bg-yellow-500"
          gradientFrom="from-yellow-500"
          gradientTo="to-amber-500"
          weekData={activeWeek}
          trend={getTrend(activeWeek)}
          onClick={() => onMetricClick?.('active')}
        />

        {/* Sono */}
        <MetricCard
          title="Sono"
          value={Number(todaySleep.toFixed(1))}
          unit="horas"
          goal={goals.sleepGoal}
          icon={Moon}
          color="bg-violet-500"
          gradientFrom="from-violet-500"
          gradientTo="to-purple-600"
          weekData={sleepWeek}
          trend={getTrend(sleepWeek)}
          onClick={() => onMetricClick?.('sleep')}
        />

        {/* Frequência Cardíaca */}
        <MetricCard
          title="FC Média"
          value={todayHeart}
          unit="bpm"
          goal={80}
          icon={Heart}
          color="bg-rose-500"
          gradientFrom="from-rose-500"
          gradientTo="to-red-600"
          weekData={heartWeek}
          trend={getTrend(heartWeek)}
          onClick={() => onMetricClick?.('heart')}
        />
      </div>

      {/* Distância */}
      <MetricCard
        title="Distância"
        value={Number(todayDistance.toFixed(1))}
        unit="km"
        goal={5}
        icon={Activity}
        color="bg-cyan-500"
        gradientFrom="from-cyan-500"
        gradientTo="to-blue-600"
        weekData={distanceWeek}
        trend={getTrend(distanceWeek)}
        onClick={() => onMetricClick?.('distance')}
      />
    </div>
  );
};

export default DetailedStatsPage;
