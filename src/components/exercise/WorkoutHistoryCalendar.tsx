import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WorkoutLog {
  id: string;
  week_number: number;
  day_number: number;
  completed_at?: string;
  duration_minutes?: number;
  rating?: number;
  notes?: string;
}

interface WorkoutHistoryCalendarProps {
  workoutLogs: WorkoutLog[];
}

export const WorkoutHistoryCalendar: React.FC<WorkoutHistoryCalendarProps> = ({
  workoutLogs
}) => {
  const getDaysInCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInCurrentMonth();

  const getWorkoutsForDay = (day: number) => {
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0);
    
    return workoutLogs.filter(log => {
      if (!log.completed_at) return false;
      const logDate = new Date(log.completed_at);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === dayDate.getTime();
    });
  };

  const monthName = new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-600" />
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
            {day}
          </div>
        ))}

        {/* Espaços vazios antes do primeiro dia */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Dias do mês */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const workouts = getWorkoutsForDay(day);
          const hasWorkout = workouts.length > 0;
          const today = new Date();
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

          return (
            <div
              key={day}
              className={`
                relative aspect-square rounded-lg p-2 text-center
                ${isToday ? 'ring-2 ring-orange-400' : ''}
                ${hasWorkout ? 'bg-green-100 dark:bg-green-950/30' : 'bg-muted/30'}
                transition-colors
              `}
            >
              <div className="text-sm font-medium">{day}</div>
              {hasWorkout && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              )}
              {workouts.length > 1 && (
                <Badge variant="secondary" className="absolute top-1 right-1 text-[8px] h-4 px-1">
                  {workouts.length}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-950/30" />
          Treino realizado
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded ring-2 ring-orange-400" />
          Hoje
        </div>
      </div>
    </div>
  );
};
