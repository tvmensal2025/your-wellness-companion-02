/**
 * WeeklyOverview - Visão geral da semana com totais nutricionais
 * @module WeeklyOverview
 * @requirements 2.4
 * 
 * Exibe um resumo dos macronutrientes médios do plano semanal,
 * incluindo calorias com progresso circular e macros detalhados.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, Sparkles } from 'lucide-react';
import type { MacroNutrients } from '@/types/meal-plan';

/**
 * CircularProgress - Componente de progresso circular animado
 * Exibe uma porcentagem visual em formato de anel
 */
interface CircularProgressProps {
  /** Valor atual */
  value: number;
  /** Valor máximo para cálculo da porcentagem */
  max: number;
  /** Classes CSS adicionais */
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  value, 
  max, 
  className 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative w-14 h-14", className)}>
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 40 40">
        {/* Background circle */}
        <circle 
          cx="20" 
          cy="20" 
          r="18" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          className="text-muted/30" 
        />
        {/* Progress circle */}
        <motion.circle 
          cx="20" 
          cy="20" 
          r="18" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          className="text-primary" 
          strokeDasharray={circumference} 
          initial={{ strokeDashoffset: circumference }} 
          animate={{ strokeDashoffset }} 
          transition={{ duration: 1, ease: "easeOut" }} 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-foreground">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

/**
 * Configuração dos macronutrientes para exibição
 */
const MACRO_DISPLAY_CONFIG = [
  { 
    key: 'protein' as const, 
    label: 'Proteína', 
    icon: '💪', 
    color: 'text-red-500' 
  },
  { 
    key: 'carbs' as const, 
    label: 'Carbos', 
    icon: '⚡', 
    color: 'text-amber-500' 
  },
  { 
    key: 'fat' as const, 
    label: 'Gordura', 
    icon: '🥑', 
    color: 'text-yellow-500' 
  },
  { 
    key: 'fiber' as const, 
    label: 'Fibras', 
    icon: '🥬', 
    color: 'text-green-500' 
  },
] as const;

/**
 * Props do componente WeeklyOverview
 */
export interface WeeklyOverviewProps {
  /** Macronutrientes médios do plano (incluindo fiber) */
  macros: MacroNutrients & { fiber: number };
  /** Meta de calorias diárias para cálculo do progresso (padrão: 2000) */
  calorieGoal?: number;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * WeeklyOverview - Componente principal
 * 
 * Exibe um card com resumo nutricional do plano semanal:
 * - Calorias médias diárias com progresso circular
 * - Macronutrientes (proteína, carboidratos, gordura, fibras)
 * - Layout responsivo (empilha em mobile, lado a lado em desktop)
 * - Animações suaves de entrada
 */
export const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({
  macros,
  calorieGoal = 2000,
  className,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className={cn(
        "rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
        "border border-primary/20 p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/20">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Média Diária</h3>
            <p className="text-xs text-muted-foreground">
              Valores nutricionais do plano
            </p>
          </div>
        </div>
        
        {/* Badge personalizado */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          Personalizado
        </div>
      </div>

      {/* Layout responsivo: empilha em mobile, lado a lado em desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Calorias com progresso circular */}
        <div className="flex items-center gap-3 pb-3 sm:pb-0 sm:pr-4 border-b sm:border-b-0 sm:border-r border-border/50">
          <CircularProgress value={macros.calories} max={calorieGoal} />
          <div>
            <div className="text-2xl font-bold text-primary leading-tight">
              {macros.calories}
            </div>
            <div className="text-xs text-muted-foreground">kcal/dia</div>
          </div>
        </div>

        {/* Grid de macronutrientes */}
        <div className="flex-1 grid grid-cols-4 gap-2 sm:gap-4">
          {MACRO_DISPLAY_CONFIG.map((macro) => (
            <MacroItem
              key={macro.key}
              label={macro.label}
              value={macros[macro.key] ?? 0}
              icon={macro.icon}
              color={macro.color}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * MacroItem - Item individual de macronutriente
 */
interface MacroItemProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const MacroItem: React.FC<MacroItemProps> = ({ label, value, icon, color }) => (
  <div className="text-center">
    <div className="text-base sm:text-lg mb-0.5">{icon}</div>
    <div className={cn("text-sm sm:text-base font-bold leading-tight", color)}>
      {value}g
    </div>
    <div className="text-[8px] sm:text-[9px] text-muted-foreground leading-tight mt-0.5">
      {label}
    </div>
  </div>
);

export default WeeklyOverview;
