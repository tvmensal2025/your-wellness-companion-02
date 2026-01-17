/**
 * @file WeeklyPlanCard Component
 * @description Card visual mostrando o planejamento semanal de refeições
 * 
 * Funcionalidade:
 * - Mostra 7 dias da semana com indicadores visuais
 * - Cores: verde (completo), amarelo (parcial), cinza (vazio), azul (hoje)
 * - Clicável para abrir detalhes do dia
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWeeklyPlan } from '@/hooks/mealie/useWeeklyPlan';
import type { WeekDay } from '@/types/mealie';
import { DayDetailModal } from './DayDetailModal';

interface WeeklyPlanCardProps {
  userId?: string;
  className?: string;
}

export const WeeklyPlanCard: React.FC<WeeklyPlanCardProps> = ({
  userId,
  className,
}) => {
  const { weeklyPlan, loading, error } = useWeeklyPlan(userId);
  const [selectedDay, setSelectedDay] = useState<WeekDay | null>(null);

  if (loading) {
    return (
      <Card className={cn('bg-card/50 backdrop-blur', className)}>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !weeklyPlan) {
    return null;
  }

  const { days, completedDays, totalDays } = weeklyPlan;

  return (
    <>
      <Card className={cn('bg-card/50 backdrop-blur border-0', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Seu Cardápio da Semana</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {completedDays}/{totalDays} completos
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <DayIndicator
                key={day.date.toISOString()}
                day={day}
                index={index}
                onClick={() => setSelectedDay(day)}
              />
            ))}
          </div>

          {/* Legenda */}
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Completo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Parcial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <span>Vazio</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-2">
            👆 Toque em um dia para ver detalhes
          </p>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          userId={userId}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
};

// ============================================
// COMPONENTE: Indicador do Dia
// ============================================

interface DayIndicatorProps {
  day: WeekDay;
  index: number;
  onClick: () => void;
}

const DayIndicator: React.FC<DayIndicatorProps> = ({ day, index, onClick }) => {
  const { dayOfWeek, dayNumber, mealsCount, calories, status } = day;

  // Cores baseadas no status
  const getStatusColor = () => {
    switch (status) {
      case 'today':
        return 'from-blue-500 to-blue-600';
      case 'complete':
        return 'from-emerald-500 to-emerald-600';
      case 'partial':
        return 'from-amber-500 to-amber-600';
      default:
        return 'from-muted to-muted';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'today':
        return 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background';
      case 'complete':
        return 'ring-1 ring-emerald-500/30';
      case 'partial':
        return 'ring-1 ring-amber-500/30';
      default:
        return 'ring-1 ring-border';
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all',
        'hover:scale-105 active:scale-95',
        getBorderColor()
      )}
    >
      {/* Dia da semana */}
      <span
        className={cn(
          'text-[10px] font-medium uppercase',
          status === 'today' ? 'text-blue-500' : 'text-muted-foreground'
        )}
      >
        {dayOfWeek}
      </span>

      {/* Círculo com número do dia */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          'bg-gradient-to-br shadow-sm',
          getStatusColor()
        )}
      >
        <span
          className={cn(
            'text-sm font-bold',
            status === 'empty' ? 'text-muted-foreground' : 'text-white'
          )}
        >
          {dayNumber}
        </span>
      </div>

      {/* Número de refeições */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'text-[10px] font-medium',
            mealsCount >= 3 ? 'text-emerald-500' : 'text-muted-foreground'
          )}
        >
          {mealsCount > 0 ? `${mealsCount}/4` : '-'}
        </span>
        
        {/* Calorias (se houver) */}
        {calories > 0 && (
          <span className="text-[9px] text-muted-foreground">
            {Math.round(calories)}
          </span>
        )}
      </div>
    </motion.button>
  );
};

export default WeeklyPlanCard;
