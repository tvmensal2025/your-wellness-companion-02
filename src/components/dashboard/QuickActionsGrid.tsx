import React, { memo } from 'react';
import { Scale, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsGridProps {
  onWeightClick: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = memo(({ onWeightClick }) => {
  return (
    <div className="animate-fade-in">
      {/* Primary CTA - Registrar Peso */}
      <button
        onClick={onWeightClick}
        className={cn(
          "group relative w-full flex items-center justify-between",
          "p-2.5 min-[400px]:p-4 sm:p-5",
          "rounded-xl overflow-hidden",
          "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600",
          "shadow-md shadow-emerald-500/20 text-white",
          "transition-all duration-200",
          "hover:shadow-lg active:scale-[0.98]"
        )}
      >
        {/* Content */}
        <div className="relative flex items-center gap-2.5 min-[400px]:gap-4 min-w-0">
          {/* Icon container */}
          <div className={cn(
            "flex items-center justify-center",
            "w-9 h-9 min-[400px]:w-12 min-[400px]:h-12 sm:w-14 sm:h-14",
            "rounded-lg min-[400px]:rounded-xl bg-white/20",
            "flex-shrink-0"
          )}>
            <Scale className="h-4 w-4 min-[400px]:h-6 min-[400px]:w-6 sm:h-7 sm:w-7" />
          </div>
          
          <div className="text-left min-w-0">
            <p className="font-semibold text-sm min-[400px]:text-lg sm:text-xl truncate">
              Registrar Peso ⚖️
            </p>
            <p className="text-[10px] min-[400px]:text-sm sm:text-base text-white/80 truncate">
              Acompanhe sua evolução
            </p>
          </div>
        </div>
        
        {/* Arrow */}
        <ChevronRight className="h-5 w-5 min-[400px]:h-7 min-[400px]:w-7 text-white/70 flex-shrink-0" />
      </button>
    </div>
  );
});

QuickActionsGrid.displayName = 'QuickActionsGrid';
