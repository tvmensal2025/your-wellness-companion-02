import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MealPlanHistoryDrawer } from '@/components/meal-plan/MealPlanHistoryDrawer';

/**
 * KitchenHeader - Cabeçalho temático do Chef Kitchen
 * 
 * Exibe o título "Cardápio Chef" com ícone animado,
 * botão de histórico e aviso quando usuário não tem dados físicos.
 * 
 * @example
 * <KitchenHeader 
 *   isGenerating={false}
 *   hasUserData={true}
 *   loadingPhysical={false}
 * />
 */

export interface KitchenHeaderProps {
  /** Indica se o cardápio está sendo gerado (ativa animação do ícone) */
  isGenerating: boolean;
  /** Indica se o usuário tem dados físicos cadastrados */
  hasUserData: boolean;
  /** Indica se os dados físicos estão carregando */
  loadingPhysical: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  isGenerating,
  hasUserData,
  loadingPhysical,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={isGenerating ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg"
          >
            <ChefHat className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="font-bold text-lg text-foreground">Cardápio Chef</h2>
            <p className="text-xs text-muted-foreground">Personalizado para você</p>
          </div>
        </div>
        <MealPlanHistoryDrawer />
      </div>

      {/* Aviso se não tiver dados do usuário */}
      {!hasUserData && !loadingPhysical && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Complete seu perfil físico para cálculos mais precisos
          </p>
        </div>
      )}
    </div>
  );
};

export default KitchenHeader;
