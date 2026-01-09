import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface DaySelectorProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
  maxDays: number;
  disabled?: boolean;
}

const DAYS = [
  { key: 'seg', label: 'Seg', fullLabel: 'Segunda' },
  { key: 'ter', label: 'Ter', fullLabel: 'Terça' },
  { key: 'qua', label: 'Qua', fullLabel: 'Quarta' },
  { key: 'qui', label: 'Qui', fullLabel: 'Quinta' },
  { key: 'sex', label: 'Sex', fullLabel: 'Sexta' },
  { key: 'sab', label: 'Sáb', fullLabel: 'Sábado' },
  { key: 'dom', label: 'Dom', fullLabel: 'Domingo' },
];

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onChange,
  maxDays,
  disabled = false
}) => {
  const handleDayClick = (dayKey: string) => {
    if (disabled) return;
    
    if (selectedDays.includes(dayKey)) {
      // Remove o dia
      onChange(selectedDays.filter(d => d !== dayKey));
    } else if (selectedDays.length < maxDays) {
      // Adiciona o dia (se ainda não atingiu o máximo)
      onChange([...selectedDays, dayKey]);
    }
  };

  const remainingDays = maxDays - selectedDays.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Selecione {maxDays} dias de treino
        </span>
        <span className={cn(
          "font-medium",
          remainingDays === 0 ? "text-green-600" : "text-orange-500"
        )}>
          {remainingDays === 0 ? '✓ Completo!' : `Faltam ${remainingDays}`}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.key);
          const isDisabled = disabled || (!isSelected && selectedDays.length >= maxDays);
          
          return (
            <button
              key={day.key}
              type="button"
              disabled={isDisabled && !isSelected}
              onClick={() => handleDayClick(day.key)}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                "border-2 min-h-[60px]",
                isSelected 
                  ? "bg-gradient-to-br from-orange-500 to-red-500 text-white border-orange-500 shadow-lg scale-105" 
                  : isDisabled 
                    ? "bg-muted/30 border-border/50 text-muted-foreground/50 cursor-not-allowed"
                    : "bg-background border-border hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 cursor-pointer"
              )}
            >
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="text-xs font-bold uppercase">{day.label}</span>
              <span className={cn(
                "text-lg mt-1",
                isSelected ? "opacity-100" : "opacity-70"
              )}>
                {isSelected ? '🏋️' : '⬜'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legenda visual */}
      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-500 to-red-500" />
          <span>Dia de treino</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted border border-border" />
          <span>Folga</span>
        </div>
      </div>
    </div>
  );
};

export default DaySelector;
