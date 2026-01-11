import React, { memo } from 'react';
import { Scale, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsGridProps {
  onWeightClick: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = memo(({ onWeightClick }) => {
  return (
    <div className="animate-fade-in">
      {/* Primary CTA - Registrar Peso - compacto mas legível */}
      <button
        onClick={onWeightClick}
        className={cn(
          "group relative w-full flex items-center justify-between p-3 sm:p-4",
          "rounded-xl sm:rounded-2xl overflow-hidden",
          "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600",
          "shadow-lg shadow-emerald-500/25 text-white",
          "transition-all duration-300",
          "hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01]",
          "active:scale-[0.98]"
        )}
      >
        {/* Shimmer effect overlay */}
        <div 
          className={cn(
            "absolute inset-0 -translate-x-full",
            "bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
          )}
        />
        
        {/* Floating sparkles */}
        <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-4 h-4 text-white/60 animate-pulse" />
        </div>
        
        {/* Content */}
        <div className="relative flex items-center gap-3 min-w-0">
          {/* Icon container - mantém tamanho legível */}
          <div className={cn(
            "relative flex items-center justify-center",
            "w-11 h-11 sm:w-12 sm:h-12",
            "rounded-xl bg-white/20 backdrop-blur-sm",
            "flex-shrink-0 transition-transform duration-300",
            "group-hover:scale-110 group-hover:bg-white/25"
          )}>
            <Scale className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
          </div>
          
          <div className="text-left min-w-0">
            <p className="font-bold text-base sm:text-lg truncate">
              Registrar Peso ⚖️
            </p>
            <p className="text-xs sm:text-sm text-white/80 truncate">
              Acompanhe sua evolução
            </p>
          </div>
        </div>
        
        {/* Arrow */}
        <div className="relative flex-shrink-0">
          <ChevronRight className={cn(
            "h-6 w-6 text-white/80",
            "transition-transform duration-300",
            "group-hover:translate-x-1"
          )} />
        </div>
      </button>
    </div>
  );
});

QuickActionsGrid.displayName = 'QuickActionsGrid';
