// ============================================
// 📅 DAY SPLIT ASSIGNER
// Permite atribuir treinos A, B, C, D, E aos dias da semana
// Visual e intuitivo - arrasta ou clica para atribuir
// ============================================

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DaySplitAssignerProps {
  selectedDays: string[];
  trainingSplit: string; // 'AB', 'ABC', 'ABCD', 'ABCDE', 'FULLBODY'
  dayAssignments: Record<string, string>; // { 'seg': 'A', 'ter': 'B', ... }
  onChange: (assignments: Record<string, string>) => void;
  disabled?: boolean;
}

const DAYS = [
  { key: 'seg', label: 'Seg', fullLabel: 'Segunda-feira', emoji: '📅' },
  { key: 'ter', label: 'Ter', fullLabel: 'Terça-feira', emoji: '📅' },
  { key: 'qua', label: 'Qua', fullLabel: 'Quarta-feira', emoji: '📅' },
  { key: 'qui', label: 'Qui', fullLabel: 'Quinta-feira', emoji: '📅' },
  { key: 'sex', label: 'Sex', fullLabel: 'Sexta-feira', emoji: '📅' },
  { key: 'sab', label: 'Sáb', fullLabel: 'Sábado', emoji: '🌟' },
  { key: 'dom', label: 'Dom', fullLabel: 'Domingo', emoji: '☀️' },
];

// Cores para cada treino
const SPLIT_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'A': { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500', gradient: 'from-red-500 to-rose-600' },
  'B': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500', gradient: 'from-blue-500 to-indigo-600' },
  'C': { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500', gradient: 'from-green-500 to-emerald-600' },
  'D': { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-500', gradient: 'from-purple-500 to-violet-600' },
  'E': { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-500', gradient: 'from-amber-500 to-orange-600' },
  'F': { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-500', gradient: 'from-cyan-500 to-teal-600' },
};

// Descrições dos treinos por divisão
const SPLIT_DESCRIPTIONS: Record<string, Record<string, string>> = {
  'AB': {
    'A': 'Superior (Peito, Costas, Ombros, Braços)',
    'B': 'Inferior (Pernas, Glúteos, Core)',
  },
  'ABC': {
    'A': 'Peito + Tríceps',
    'B': 'Costas + Bíceps',
    'C': 'Pernas + Glúteos',
  },
  'ABCD': {
    'A': 'Peito',
    'B': 'Costas',
    'C': 'Pernas',
    'D': 'Ombros + Braços',
  },
  'ABCDE': {
    'A': 'Peito',
    'B': 'Costas',
    'C': 'Pernas',
    'D': 'Ombros',
    'E': 'Braços',
  },
  'FULLBODY': {
    'A': 'Corpo Todo',
  },
};

export const DaySplitAssigner: React.FC<DaySplitAssignerProps> = ({
  selectedDays,
  trainingSplit,
  dayAssignments,
  onChange,
  disabled = false,
}) => {
  const [selectedSplit, setSelectedSplit] = useState<string | null>(null);

  // Letras disponíveis baseado na divisão
  const availableSplits = useMemo(() => {
    if (trainingSplit === 'FULLBODY') return ['A'];
    return trainingSplit.split('');
  }, [trainingSplit]);

  // Descrições para a divisão atual
  const descriptions = SPLIT_DESCRIPTIONS[trainingSplit] || {};

  // Verificar se todos os dias foram atribuídos
  const allAssigned = selectedDays.every(day => dayAssignments[day]);

  // Contar quantas vezes cada treino foi usado
  const splitUsageCount = useMemo(() => {
    const count: Record<string, number> = {};
    availableSplits.forEach(s => count[s] = 0);
    Object.values(dayAssignments).forEach(split => {
      if (split && count[split] !== undefined) {
        count[split]++;
      }
    });
    return count;
  }, [dayAssignments, availableSplits]);

  // Handler para clicar em um dia
  const handleDayClick = (dayKey: string) => {
    if (disabled || !selectedDays.includes(dayKey)) return;

    if (selectedSplit) {
      // Atribuir o treino selecionado ao dia
      onChange({ ...dayAssignments, [dayKey]: selectedSplit });
      setSelectedSplit(null);
    } else if (dayAssignments[dayKey]) {
      // Remover atribuição
      const newAssignments = { ...dayAssignments };
      delete newAssignments[dayKey];
      onChange(newAssignments);
    }
  };

  // Handler para clicar em um treino
  const handleSplitClick = (split: string) => {
    if (disabled) return;
    setSelectedSplit(selectedSplit === split ? null : split);
  };

  // Auto-atribuir de forma inteligente
  const autoAssign = () => {
    const newAssignments: Record<string, string> = {};
    const sortedDays = [...selectedDays].sort((a, b) => {
      const order = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
      return order.indexOf(a) - order.indexOf(b);
    });

    sortedDays.forEach((day, index) => {
      const splitIndex = index % availableSplits.length;
      newAssignments[day] = availableSplits[splitIndex];
    });

    onChange(newAssignments);
    setSelectedSplit(null);
  };

  // Limpar todas as atribuições
  const clearAll = () => {
    onChange({});
    setSelectedSplit(null);
  };

  return (
    <div className="space-y-4">
      {/* Header com instruções */}
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          {selectedSplit 
            ? `Clique em um dia para atribuir o Treino ${selectedSplit}`
            : 'Selecione um treino e depois clique no dia'}
        </p>
        {!allAssigned && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Faltam {selectedDays.length - Object.keys(dayAssignments).length} dia(s) para atribuir
          </p>
        )}
      </div>

      {/* Treinos disponíveis para selecionar */}
      <div className="flex flex-wrap justify-center gap-2">
        {availableSplits.map((split) => {
          const colors = SPLIT_COLORS[split];
          const isSelected = selectedSplit === split;
          const usageCount = splitUsageCount[split];
          
          return (
            <motion.button
              key={split}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSplitClick(split)}
              disabled={disabled}
              className={cn(
                "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all min-w-[70px]",
                isSelected
                  ? `bg-gradient-to-br ${colors.gradient} text-white border-transparent shadow-lg ring-2 ring-offset-2 ring-${split === 'A' ? 'red' : split === 'B' ? 'blue' : split === 'C' ? 'green' : split === 'D' ? 'purple' : 'amber'}-400`
                  : `bg-background hover:bg-muted/50 ${colors.border} border-opacity-50`
              )}
            >
              <span className={cn(
                "text-2xl font-bold",
                isSelected ? "text-white" : colors.bg.replace('bg-', 'text-')
              )}>
                {split}
              </span>
              <span className={cn(
                "text-[10px] mt-1 font-medium",
                isSelected ? "text-white/90" : "text-muted-foreground"
              )}>
                {usageCount}x usado
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Descrição do treino selecionado */}
      <AnimatePresence>
        {selectedSplit && descriptions[selectedSplit] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className={cn(
              "border-2",
              SPLIT_COLORS[selectedSplit]?.border
            )}>
              <CardContent className="p-3 text-center">
                <p className="text-sm font-medium">
                  Treino {selectedSplit}: {descriptions[selectedSplit]}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de dias da semana */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day) => {
          const isTrainingDay = selectedDays.includes(day.key);
          const assignment = dayAssignments[day.key];
          const colors = assignment ? SPLIT_COLORS[assignment] : null;
          
          return (
            <motion.button
              key={day.key}
              whileHover={isTrainingDay ? { scale: 1.05 } : {}}
              whileTap={isTrainingDay ? { scale: 0.95 } : {}}
              onClick={() => handleDayClick(day.key)}
              disabled={disabled || !isTrainingDay}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-xl transition-all min-h-[72px]",
                "border-2",
                !isTrainingDay && "bg-muted/20 border-border/30 opacity-40 cursor-not-allowed",
                isTrainingDay && !assignment && "bg-background border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer",
                isTrainingDay && assignment && `bg-gradient-to-br ${colors?.gradient} text-white border-transparent shadow-md cursor-pointer`,
                selectedSplit && isTrainingDay && !assignment && "ring-2 ring-emerald-400 ring-offset-1 animate-pulse"
              )}
            >
              {/* Badge do treino atribuído */}
              {assignment && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                >
                  <span className={cn("text-xs font-bold", colors?.bg.replace('bg-', 'text-'))}>
                    {assignment}
                  </span>
                </motion.div>
              )}

              {/* Nome do dia */}
              <span className={cn(
                "text-xs font-bold uppercase",
                assignment ? "text-white" : "text-foreground"
              )}>
                {day.label}
              </span>

              {/* Indicador visual */}
              <span className="text-lg mt-0.5">
                {!isTrainingDay ? '😴' : assignment ? '🏋️' : '➕'}
              </span>

              {/* Descrição curta do treino */}
              {assignment && (
                <span className="text-[9px] text-white/80 mt-0.5 line-clamp-1">
                  {descriptions[assignment]?.split(' ')[0] || 'Treino'}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={autoAssign}
          disabled={disabled}
          className="gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          Auto-atribuir
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          disabled={disabled || Object.keys(dayAssignments).length === 0}
          className="gap-1.5 text-muted-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Limpar
        </Button>
      </div>

      {/* Resumo visual */}
      {allAssigned && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              Divisão configurada!
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {DAYS.filter(d => selectedDays.includes(d.key)).map(day => {
              const assignment = dayAssignments[day.key];
              const colors = SPLIT_COLORS[assignment];
              return (
                <Badge
                  key={day.key}
                  className={cn(
                    "text-xs",
                    colors ? `bg-gradient-to-r ${colors.gradient} text-white` : ''
                  )}
                >
                  {day.label}: {assignment}
                </Badge>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DaySplitAssigner;
