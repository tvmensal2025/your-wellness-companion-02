import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ChevronRight, ChevronDown } from 'lucide-react';

interface QuickActionsGridProps {
  onWeightClick: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ onWeightClick }) => {
  return (
    <div className="space-y-2">
      {/* Animated Arrow pointing down */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center text-emerald-600"
        >
          <span className="text-xs font-medium mb-1">Registre seu peso</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>

      {/* Primary CTA - Registrar Peso */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileTap={{ scale: 0.98 }}
        onClick={onWeightClick}
        className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20 shadow-lg text-white"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-white/20 flex-shrink-0">
            <Scale className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
          </div>
          <div className="text-left min-w-0">
            <p className="font-bold text-base sm:text-lg md:text-xl truncate">Registrar Peso</p>
            <p className="text-xs sm:text-sm text-white/80 truncate">Acompanhe sua evolução</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white/80 flex-shrink-0" />
      </motion.button>
    </div>
  );
};
