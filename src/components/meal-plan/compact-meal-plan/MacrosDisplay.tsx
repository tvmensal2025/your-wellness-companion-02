/**
 * MacrosDisplay - Exibição de macronutrientes com barras de progresso circulares
 * Mostra calorias, proteína, carboidratos, gordura e fibra com animações
 * 
 * @param macros - Dados de macronutrientes da refeição
 * @param variant - Variante de exibição ('rings' | 'bars' | 'compact')
 * @param showLabels - Se deve mostrar labels abaixo dos valores
 * @param animated - Se deve animar os elementos
 * 
 * **Validates: Requirements 1.4**
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MacroNutrients } from '@/types/meal-plan';

// ============================================================================
// Types
// ============================================================================

export interface MacrosDisplayProps {
  macros: MacroNutrients;
  variant?: 'rings' | 'bars' | 'compact';
  showLabels?: boolean;
  animated?: boolean;
  className?: string;
}

interface MacroRingProps {
  value: number;
  label: string;
  emoji: string;
  color: string;
  maxValue?: number;
  delay?: number;
  animated?: boolean;
}

interface MacroBarProps {
  value: number;
  label: string;
  emoji: string;
  color: string;
  maxValue?: number;
  delay?: number;
  animated?: boolean;
}

interface MacroItemConfig {
  key: keyof MacroNutrients;
  label: string;
  shortLabel: string;
  emoji: string;
  color: string;
  maxValue: number;
  unit: string;
}

// ============================================================================
// Constants
// ============================================================================

const MACRO_CONFIGS: MacroItemConfig[] = [
  { key: 'calories', label: 'Calorias', shortLabel: 'KCAL', emoji: '🔥', color: '#f97316', maxValue: 800, unit: '' },
  { key: 'protein', label: 'Proteína', shortLabel: 'PROT', emoji: '💪', color: '#ef4444', maxValue: 100, unit: 'g' },
  { key: 'carbs', label: 'Carboidratos', shortLabel: 'CARB', emoji: '⚡', color: '#eab308', maxValue: 150, unit: 'g' },
  { key: 'fat', label: 'Gordura', shortLabel: 'GORD', emoji: '🥑', color: '#22c55e', maxValue: 80, unit: 'g' },
  { key: 'fiber', label: 'Fibra', shortLabel: 'FIBRA', emoji: '🥬', color: '#8b5cf6', maxValue: 40, unit: 'g' },
];

// ============================================================================
// Sub-components
// ============================================================================

/**
 * MacroRing - Anel circular animado para exibição de macro individual
 */
const MacroRing: React.FC<MacroRingProps> = ({
  value,
  label,
  emoji,
  color,
  maxValue = 100,
  delay = 0,
  animated = true,
}) => {
  const circumference = 2 * Math.PI * 18;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const containerVariants = animated
    ? { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 } }
    : { initial: { scale: 1, opacity: 1 }, animate: { scale: 1, opacity: 1 } };

  const circleVariants = animated
    ? { initial: { strokeDashoffset: circumference }, animate: { strokeDashoffset } }
    : { initial: { strokeDashoffset }, animate: { strokeDashoffset } };

  const emojiVariants = animated
    ? { initial: { scale: 0 }, animate: { scale: 1 } }
    : { initial: { scale: 1 }, animate: { scale: 1 } };

  const textVariants = animated
    ? { initial: { y: 5, opacity: 0 }, animate: { y: 0, opacity: 1 } }
    : { initial: { y: 0, opacity: 1 }, animate: { y: 0, opacity: 1 } };

  return (
    <motion.div
      className="flex flex-col items-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      transition={{ delay, type: 'spring', stiffness: 200 }}
    >
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
          {/* Background circle */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            variants={circleVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: animated ? 1 : 0, ease: 'easeOut', delay: animated ? delay + 0.2 : 0 }}
          />
        </svg>
        {/* Emoji in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-lg"
            variants={emojiVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: animated ? delay + 0.3 : 0, type: 'spring' }}
          >
            {emoji}
          </motion.span>
        </div>
      </div>
      {/* Value and label */}
      <motion.div
        className="text-center mt-1"
        variants={textVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: animated ? delay + 0.4 : 0 }}
      >
        <div className="text-sm font-bold text-foreground">
          {value}{label !== 'KCAL' && 'g'}
        </div>
        <div className="text-[8px] text-muted-foreground font-medium">{label}</div>
      </motion.div>
    </motion.div>
  );
};

/**
 * MacroBar - Barra de progresso horizontal para exibição de macro individual
 */
const MacroBar: React.FC<MacroBarProps> = ({
  value,
  label,
  emoji,
  color,
  maxValue = 100,
  delay = 0,
  animated = true,
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const containerVariants = animated
    ? { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 } }
    : { initial: { opacity: 1, x: 0 }, animate: { opacity: 1, x: 0 } };

  const barVariants = animated
    ? { initial: { width: 0 }, animate: { width: `${percentage}%` } }
    : { initial: { width: `${percentage}%` }, animate: { width: `${percentage}%` } };

  return (
    <motion.div
      className="flex items-center gap-2"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      transition={{ delay, duration: 0.3 }}
    >
      <span className="text-sm flex-shrink-0">{emoji}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
          <span className="text-xs font-bold text-foreground">
            {value}{label !== 'KCAL' && 'g'}
          </span>
        </div>
        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            variants={barVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: animated ? delay + 0.2 : 0, duration: animated ? 0.6 : 0, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

/**
 * CompactMacroItem - Item compacto para exibição inline de macro
 */
const CompactMacroItem: React.FC<{
  value: number;
  label: string;
  emoji: string;
  unit: string;
}> = ({ value, label, emoji, unit }) => (
  <div className="flex items-center gap-1">
    <span className="text-sm">{emoji}</span>
    <span className="text-xs font-semibold text-foreground">{value}{unit}</span>
    <span className="text-[10px] text-muted-foreground">{label.toLowerCase()}</span>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const MacrosDisplay: React.FC<MacrosDisplayProps> = ({
  macros,
  variant = 'rings',
  showLabels = true,
  animated = true,
  className,
}) => {
  // Filter out fiber if it's 0 or undefined
  const visibleMacros = MACRO_CONFIGS.filter(
    config => config.key !== 'fiber' || (macros.fiber !== undefined && macros.fiber > 0)
  );

  // Rings variant - circular progress indicators
  if (variant === 'rings') {
    return (
      <div className={cn('flex items-center justify-between py-2', className)}>
        {visibleMacros.map((config, idx) => (
          <MacroRing
            key={config.key}
            value={macros[config.key] ?? 0}
            label={config.shortLabel}
            emoji={config.emoji}
            color={config.color}
            maxValue={config.maxValue}
            delay={animated ? idx * 0.1 : 0}
            animated={animated}
          />
        ))}
      </div>
    );
  }

  // Bars variant - horizontal progress bars
  if (variant === 'bars') {
    return (
      <div className={cn('space-y-2 py-2', className)}>
        {visibleMacros.map((config, idx) => (
          <MacroBar
            key={config.key}
            value={macros[config.key] ?? 0}
            label={showLabels ? config.label : config.shortLabel}
            emoji={config.emoji}
            color={config.color}
            maxValue={config.maxValue}
            delay={animated ? idx * 0.1 : 0}
            animated={animated}
          />
        ))}
      </div>
    );
  }

  // Compact variant - inline display
  return (
    <div className={cn('flex items-center justify-between px-2 py-2 rounded-lg bg-muted/30', className)}>
      {visibleMacros.map(config => (
        <CompactMacroItem
          key={config.key}
          value={macros[config.key] ?? 0}
          label={config.shortLabel}
          emoji={config.emoji}
          unit={config.unit}
        />
      ))}
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default MacrosDisplay;

// Re-export sub-components for flexibility
export { MacroRing, MacroBar, CompactMacroItem };
export type { MacroRingProps, MacroBarProps, MacroItemConfig };
