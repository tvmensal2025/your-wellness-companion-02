import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ChevronRight } from 'lucide-react';

interface QuickActionsGridProps {
  onWeightClick: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ onWeightClick }) => {
  return (
    <div className="space-y-3">
      {/* Primary CTA - Registrar Peso */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileTap={{ scale: 0.98 }}
        onClick={onWeightClick}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20 shadow-lg text-white"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
            <Scale className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold">Registrar Peso</p>
            <p className="text-xs text-white/70">Acompanhe sua evolução</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/70" />
      </motion.button>
    </div>
  );
};
