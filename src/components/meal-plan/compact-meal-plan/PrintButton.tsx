/**
 * PrintButton - Botão de impressão do cardápio
 * Componente estilizado com tooltip, animações e estado de loading
 * 
 * @param onPrint - Função de callback para impressão (vem do hook)
 * @param disabled - Se o botão está desabilitado
 * @param className - Classes CSS adicionais
 * 
 * **Validates: Requirements 1.6**
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Printer, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface PrintButtonProps {
  /** Função de callback para impressão */
  onPrint: () => void;
  /** Se o botão está desabilitado */
  disabled?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Variante do botão */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** Tamanho do botão */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Mostrar texto junto com ícone */
  showLabel?: boolean;
  /** Texto do tooltip */
  tooltipText?: string;
}

type PrintState = 'idle' | 'preparing' | 'success';

export const PrintButton: React.FC<PrintButtonProps> = ({
  onPrint,
  disabled = false,
  className,
  variant = 'outline',
  size = 'icon',
  showLabel = false,
  tooltipText = 'Imprimir receita',
}) => {
  const [printState, setPrintState] = useState<PrintState>('idle');

  const handleClick = useCallback(async () => {
    if (disabled || printState !== 'idle') return;

    // Set preparing state
    setPrintState('preparing');

    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));

    // Execute print
    try {
      onPrint();
      setPrintState('success');
      
      // Reset to idle after success animation
      setTimeout(() => {
        setPrintState('idle');
      }, 1500);
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      setPrintState('idle');
    }
  }, [onPrint, disabled, printState]);

  // Icon based on state
  const renderIcon = () => {
    switch (printState) {
      case 'preparing':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        );
      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Check className="h-4 w-4 text-green-500" />
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Printer className="h-4 w-4" />
          </motion.div>
        );
    }
  };

  // Get tooltip text based on state
  const getTooltipText = () => {
    switch (printState) {
      case 'preparing':
        return 'Preparando impressão...';
      case 'success':
        return 'Pronto!';
      default:
        return tooltipText;
    }
  };

  // Button content
  const buttonContent = (
    <motion.div
      className="flex items-center gap-2"
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {renderIcon()}
      {showLabel && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium"
        >
          {printState === 'preparing' ? 'Preparando...' : 
           printState === 'success' ? 'Impresso!' : 'Imprimir'}
        </motion.span>
      )}
    </motion.div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            disabled={disabled || printState !== 'idle'}
            className={cn(
              "relative overflow-hidden transition-all duration-200",
              // Semantic colors
              "bg-background hover:bg-muted",
              "border-border hover:border-primary/50",
              "text-foreground",
              // Success state styling
              printState === 'success' && "border-green-500/50 bg-green-500/10",
              // Preparing state styling
              printState === 'preparing' && "border-primary/50 bg-primary/5",
              // Disabled styling
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            aria-label={getTooltipText()}
          >
            {/* Background animation on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            
            {/* Button content */}
            <span className="relative z-10">
              {buttonContent}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-popover text-popover-foreground border-border"
        >
          <p className="text-xs font-medium">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Named export for compatibility
export default PrintButton;
