// ============================================
// WEEKLY CALENDAR COMPONENT
// Mostra os dias da semana que o usuário treinou
// ============================================

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { WeeklyWorkoutDays } from '@/hooks/exercise/useFollowingWithStats';

interface WeeklyCalendarProps {
  workoutDays: WeeklyWorkoutDays;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DAYS = [
  { key: 'dom', label: 'D', fullLabel: 'Dom' },
  { key: 'seg', label: 'S', fullLabel: 'Seg' },
  { key: 'ter', label: 'T', fullLabel: 'Ter' },
  { key: 'qua', label: 'Q', fullLabel: 'Qua' },
  { key: 'qui', label: 'Q', fullLabel: 'Qui' },
  { key: 'sex', label: 'S', fullLabel: 'Sex' },
  { key: 'sab', label: 'S', fullLabel: 'Sáb' },
] as const;

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  workoutDays,
  size = 'md',
  className,
}) => {
  const today = new Date().getDay(); // 0 = Domingo

  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const workoutCount = Object.values(workoutDays).filter(Boolean).length;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Treinos esta semana
        </span>
        <span className="text-xs font-bold text-emerald-500">
          {workoutCount}/7 dias
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="flex justify-between gap-1">
        {DAYS.map((day, index) => {
          const didWorkout = workoutDays[day.key as keyof WeeklyWorkoutDays];
          const isToday = index === today;

          return (
            <div
              key={day.key}
              className={cn(
                "flex flex-col items-center gap-0.5",
              )}
            >
              {/* Day Label */}
              <span className={cn(
                "text-[10px] font-medium",
                isToday ? "text-purple-500" : "text-muted-foreground"
              )}>
                {day.fullLabel}
              </span>

              {/* Day Circle */}
              <div
                className={cn(
                  sizeClasses[size],
                  "rounded-full flex items-center justify-center transition-all",
                  didWorkout
                    ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30"
                    : isToday
                      ? "bg-purple-500/20 border-2 border-purple-500 text-purple-500"
                      : "bg-muted/50 text-muted-foreground border border-border"
                )}
              >
                {didWorkout ? (
                  <Check className={iconSizes[size]} strokeWidth={3} />
                ) : (
                  <span className="opacity-50">{day.label}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
          style={{ width: `${(workoutCount / 7) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default WeeklyCalendar;
