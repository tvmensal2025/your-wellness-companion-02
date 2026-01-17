import React from 'react';
import { WeekDay } from '@/types/mealie';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Circle } from 'lucide-react';

interface DayIndicatorProps {
  day: WeekDay;
  onClick: () => void;
  delay?: number;
}

export const DayIndicator: React.FC<DayIndicatorProps> = ({ day, onClick, delay = 0 }) => {
  const getStatusIcon = () => {
    switch (day.status) {
      case 'complete':
        return <Check className="w-3 h-3 text-emerald-500" />;
      case 'partial':
        return <AlertCircle className="w-3 h-3 text-amber-500" />;
      case 'today':
        return <Circle className="w-3 h-3 text-primary fill-primary" />;
      default:
        return <Circle className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (day.status) {
      case 'complete':
        return 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20';
      case 'partial':
        return 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20';
      case 'today':
        return 'bg-primary/10 border-primary/50 hover:bg-primary/20 ring-2 ring-primary/30';
      default:
        return 'bg-muted/30 border-border hover:bg-muted/50';
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer",
        getStatusColor()
      )}
    >
      {/* Dia da semana */}
      <span className="text-[10px] font-medium text-muted-foreground uppercase">
        {day.dayOfWeek}
      </span>
      
      {/* Número do dia */}
      <span className={cn(
        "text-sm font-bold",
        day.status === 'today' ? "text-primary" : "text-foreground"
      )}>
        {day.dayNumber}
      </span>
      
      {/* Ícone de status */}
      <div className="flex items-center justify-center">
        {getStatusIcon()}
      </div>
      
      {/* Número de refeições */}
      <span className={cn(
        "text-[10px] font-medium",
        day.mealsCount >= 3 ? "text-emerald-500" : "text-muted-foreground"
      )}>
        {day.mealsCount > 0 ? `${day.mealsCount}/4` : '-'}
      </span>
      
      {/* Calorias (opcional, só se tiver) */}
      {day.calories > 0 && (
        <span className="text-[9px] text-muted-foreground">
          {Math.round(day.calories)}
        </span>
      )}
    </motion.button>
  );
};
