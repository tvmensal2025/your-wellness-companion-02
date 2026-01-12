import React, { memo } from 'react';
import { Scale, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsGridProps {
  onWeightClick: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = memo(({ onWeightClick }) => {
  return (
    <div className="animate-fade-in">
      {/* Primary CTA - Registrar Peso - ultra compacto */}
      <button
        onClick={onWeightClick}
        className={cn(
          "group relative w-full flex items-center justify-between p-2.5 sm:p-3",
          "rounded-xl overflow-hidden",
          "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600",
          "shadow-md shadow-emerald-500/20 text-white",
          "transition-all duration-200",
          "hover:shadow-lg active:scale-[0.98]"
        )}
      >
        {/* Content */}
        <div className="relative flex items-center gap-2.5 min-w-0">
          {/* Icon container */}
          <div className={cn(
            "flex items-center justify-center",
            "w-9 h-9 sm:w-10 sm:h-10",
            "rounded-lg bg-white/20",
            "flex-shrink-0"
          )}>
            <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          
          <div className="text-left min-w-0">
            <p className="font-semibold text-sm sm:text-base truncate">
              Registrar Peso ⚖️
            </p>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">
              sua evolução
            </p>
          </div>
        </div>
        
        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-white/70 flex-shrink-0" />
      </button>
    </div>
  );
});

QuickActionsGrid.displayName = 'QuickActionsGrid';
