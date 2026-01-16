/**
 * MealNavigation - Navegação entre refeições
 * Inclui botões anterior/próximo, tabs com emoji/label e indicadores de posição
 * 
 * @param activeTab - Tipo de refeição atualmente selecionada
 * @param onTabChange - Callback quando uma tab é selecionada
 * @param availableMeals - Lista de tipos de refeição disponíveis
 * @param mealTypes - Todos os tipos de refeição (para exibir tabs desabilitadas)
 * @param hasMeal - Função para verificar se uma refeição existe
 * @param getMealConfig - Função para obter configuração visual de uma refeição
 * @param onPrevious - Callback para navegar para refeição anterior
 * @param onNext - Callback para navegar para próxima refeição
 * @param currentIndex - Índice atual na lista de refeições disponíveis
 * 
 * **Validates: Requirements 1.5**
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MealType, MealConfig } from '@/types/meal-plan';

// ============================================================================
// Types
// ============================================================================

export interface MealNavigationProps {
  /** Tipo de refeição atualmente selecionada */
  activeTab: MealType;
  /** Callback quando uma tab é selecionada */
  onTabChange: (tab: MealType) => void;
  /** Lista de tipos de refeição disponíveis */
  availableMeals: MealType[];
  /** Todos os tipos de refeição */
  mealTypes: MealType[];
  /** Função para verificar se uma refeição existe */
  hasMeal: (type: MealType) => boolean;
  /** Função para obter configuração visual de uma refeição */
  getMealConfig: (type: MealType) => MealConfig;
  /** Callback para navegar para refeição anterior */
  onPrevious: () => void;
  /** Callback para navegar para próxima refeição */
  onNext: () => void;
  /** Índice atual na lista de refeições disponíveis */
  currentIndex: number;
  /** Variante de exibição */
  variant?: 'tabs' | 'dots' | 'minimal';
  /** Classes CSS adicionais */
  className?: string;
}

export interface MealTabButtonProps {
  /** Tipo de refeição */
  type: MealType;
  /** Se esta tab está ativa */
  isActive: boolean;
  /** Callback ao clicar */
  onClick: () => void;
  /** Se a refeição existe */
  hasMeal: boolean;
  /** Configuração visual da refeição */
  config: MealConfig;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * MealTabButton - Botão de tab individual para seleção de refeição
 */
const MealTabButton: React.FC<MealTabButtonProps> = ({
  type,
  isActive,
  onClick,
  hasMeal,
  config,
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={!hasMeal}
      className={cn(
        "relative flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all min-w-[52px]",
        isActive
          ? "bg-gradient-to-b from-primary/20 to-primary/5"
          : "hover:bg-muted/50",
        !hasMeal && "opacity-30 pointer-events-none cursor-not-allowed"
      )}
      whileHover={{ scale: hasMeal ? 1.05 : 1 }}
      whileTap={{ scale: hasMeal ? 0.95 : 1 }}
      aria-label={`${config.label}${!hasMeal ? ' (não disponível)' : ''}`}
      aria-selected={isActive}
      role="tab"
    >
      {/* Active indicator border */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className={cn("absolute inset-0 rounded-lg border-2", config.borderColor)}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      {/* Emoji */}
      <motion.span
        className={cn("text-xl relative z-10", isActive && "drop-shadow-lg")}
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {config.emoji}
      </motion.span>

      {/* Short label */}
      <span
        className={cn(
          "text-[9px] font-semibold relative z-10 transition-colors",
          isActive ? config.accentColor : "text-muted-foreground"
        )}
      >
        {config.shortLabel}
      </span>

      {/* Time */}
      <span className="text-[7px] text-muted-foreground/60 relative z-10">
        {config.time}
      </span>
    </motion.button>
  );
};

/**
 * NavigationDots - Indicadores de posição em formato de pontos
 */
const NavigationDots: React.FC<{
  total: number;
  current: number;
  onSelect: (index: number) => void;
  availableMeals: MealType[];
  getMealConfig: (type: MealType) => MealConfig;
}> = ({ total, current, onSelect, availableMeals, getMealConfig }) => {
  return (
    <div className="flex items-center justify-center gap-2" role="tablist">
      {Array.from({ length: total }).map((_, idx) => {
        const mealType = availableMeals[idx];
        const config = getMealConfig(mealType);
        const isActive = idx === current;

        return (
          <motion.button
            key={idx}
            onClick={() => onSelect(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              isActive
                ? "w-6 bg-primary"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Ir para ${config.label}`}
            aria-selected={isActive}
            role="tab"
          />
        );
      })}
    </div>
  );
};

/**
 * NavigationArrows - Botões de navegação anterior/próximo
 */
const NavigationArrows: React.FC<{
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  size?: 'sm' | 'md';
}> = ({ onPrevious, onNext, canGoPrevious, canGoNext, size = 'sm' }) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={cn("flex-shrink-0", buttonSize)}
        aria-label="Refeição anterior"
      >
        <ChevronLeft className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!canGoNext}
        className={cn("flex-shrink-0", buttonSize)}
        aria-label="Próxima refeição"
      >
        <ChevronRight className={iconSize} />
      </Button>
    </>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const MealNavigation: React.FC<MealNavigationProps> = ({
  activeTab,
  onTabChange,
  availableMeals,
  mealTypes,
  hasMeal,
  getMealConfig,
  onPrevious,
  onNext,
  currentIndex,
  variant = 'tabs',
  className,
}) => {
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < availableMeals.length - 1;

  // Tabs variant - full tabs with emoji, label and time
  if (variant === 'tabs') {
    return (
      <div className={cn("flex items-center gap-1", className)} role="navigation">
        <NavigationArrows
          onPrevious={onPrevious}
          onNext={onNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />

        <div
          className="flex-1 flex justify-center gap-0.5 overflow-x-auto py-1 scrollbar-hide"
          role="tablist"
          aria-label="Navegação de refeições"
        >
          {mealTypes.map((type) => (
            <MealTabButton
              key={type}
              type={type}
              isActive={activeTab === type}
              onClick={() => hasMeal(type) && onTabChange(type)}
              hasMeal={hasMeal(type)}
              config={getMealConfig(type)}
            />
          ))}
        </div>

        <NavigationArrows
          onPrevious={onPrevious}
          onNext={onNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      </div>
    );
  }

  // Dots variant - compact dots with arrows
  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center justify-center gap-4", className)} role="navigation">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="h-8 w-8"
          aria-label="Refeição anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <NavigationDots
          total={availableMeals.length}
          current={currentIndex}
          onSelect={(idx) => onTabChange(availableMeals[idx])}
          availableMeals={availableMeals}
          getMealConfig={getMealConfig}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={!canGoNext}
          className="h-8 w-8"
          aria-label="Próxima refeição"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Minimal variant - just arrows with current meal indicator
  return (
    <div className={cn("flex items-center justify-between", className)} role="navigation">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="h-10 w-10"
        aria-label="Refeição anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center gap-2"
      >
        <span className="text-2xl">{getMealConfig(activeTab).emoji}</span>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {getMealConfig(activeTab).label}
          </p>
          <p className="text-xs text-muted-foreground">
            {currentIndex + 1} de {availableMeals.length}
          </p>
        </div>
      </motion.div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!canGoNext}
        className="h-10 w-10"
        aria-label="Próxima refeição"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default MealNavigation;

// Re-export sub-components for flexibility
export { MealTabButton, NavigationDots, NavigationArrows };
