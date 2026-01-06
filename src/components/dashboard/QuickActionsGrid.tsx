import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ChevronRight } from 'lucide-react';

interface QuickActionsGridProps {
  onWeightClick: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ onWeightClick }) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Primary CTA - Registrar Peso */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileTap={{ scale: 0.98 }}
        onClick={onWeightClick}
        className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20 shadow-lg text-white"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 flex-shrink-0">
            <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="text-left min-w-0">
            <p className="font-semibold text-sm sm:text-base truncate">Registrar Peso</p>
            <p className="text-[10px] sm:text-xs text-white/70 truncate">Acompanhe sua evolução</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 flex-shrink-0" />
      </motion.button>
    </div>
  );
};
