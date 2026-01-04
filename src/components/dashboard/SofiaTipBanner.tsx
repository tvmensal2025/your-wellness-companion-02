import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SofiaTipBannerProps {
  healthScore?: number;
  weightChange?: number;
  currentStreak?: number;
  lastMeasurementDays?: number;
}

const tips = [
  { id: 1, message: "Beba água antes das refeições para aumentar a saciedade" },
  { id: 2, message: "Mantenha a consistência! Resultados vêm com o tempo" },
  { id: 3, message: "Registre seu peso no mesmo horário para maior precisão" },
  { id: 4, message: "Pequenos progressos diários geram grandes transformações" },
  { id: 5, message: "O sono é fundamental para o controle do peso" },
];

export const SofiaTipBanner: React.FC<SofiaTipBannerProps> = ({
  healthScore = 50,
  weightChange = 0,
  currentStreak = 0,
  lastMeasurementDays = 0
}) => {
  const navigate = useNavigate();
  const [currentTip, setCurrentTip] = useState(tips[0]);
  const [isVisible, setIsVisible] = useState(true);

  // Generate contextual tip
  useEffect(() => {
    let selectedTip = tips[Math.floor(Math.random() * tips.length)];

    if (lastMeasurementDays >= 3) {
      selectedTip = { id: 0, message: `Já faz ${lastMeasurementDays} dias desde sua última pesagem. Vamos registrar hoje?` };
    } else if (weightChange < -0.5) {
      selectedTip = { id: 0, message: `Parabéns! Você perdeu ${Math.abs(weightChange).toFixed(1)}kg. Continue assim!` };
    } else if (currentStreak >= 7) {
      selectedTip = { id: 0, message: `${currentStreak} dias de sequência! Sua consistência é inspiradora!` };
    }

    setCurrentTip(selectedTip);
  }, [healthScore, weightChange, currentStreak, lastMeasurementDays]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 p-4"
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <div className="flex items-start gap-3 pr-4">
        {/* Sofia icon */}
        <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
          <Sparkles className="h-4 w-4 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-foreground">Sofia</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-medium">IA</span>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={currentTip.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {currentTip.message}
            </motion.p>
          </AnimatePresence>

          <button
            onClick={() => navigate('/sofia')}
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            Conversar com Sofia
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
