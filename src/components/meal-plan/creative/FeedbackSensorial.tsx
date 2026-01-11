import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Star, Trophy, Sparkles } from 'lucide-react';

interface FeedbackSensorialProps {
  onMealComplete?: () => void;
  onDayComplete?: () => void;
  className?: string;
}

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const randomX = Math.random() * 200 - 100;
  const randomRotation = Math.random() * 720 - 360;

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{ backgroundColor: color }}
      initial={{ 
        y: 0, 
        x: 0, 
        opacity: 1, 
        scale: 1,
        rotate: 0 
      }}
      animate={{ 
        y: [0, -100, 300], 
        x: [0, randomX, randomX * 1.5],
        opacity: [1, 1, 0],
        scale: [1, 1.2, 0.5],
        rotate: [0, randomRotation]
      }}
      transition={{ 
        duration: 2,
        delay,
        ease: "easeOut"
      }}
    />
  );
};

// Confetti explosion
const ConfettiExplosion: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const colors = ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
  
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <ConfettiParticle 
          key={i} 
          delay={i * 0.02} 
          color={colors[i % colors.length]} 
        />
      ))}
    </div>
  );
};

// Success checkmark animation
const SuccessCheckmark: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, times: [0, 0.6, 1] }}
            className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Star burst animation
const StarBurst: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 100;
        const y = Math.sin(angle) * 100;

        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ 
              x: [0, x], 
              y: [0, y], 
              opacity: [1, 0],
              scale: [0, 1.5]
            }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
          >
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </motion.div>
        );
      })}
    </div>
  );
};

// Main component with demo buttons
export const FeedbackSensorial: React.FC<FeedbackSensorialProps> = ({
  onMealComplete,
  onDayComplete,
  className
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showTrophy, setShowTrophy] = useState(false);

  const triggerMealComplete = useCallback(() => {
    // Haptic feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    // Play sound
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore if no sound file

    setShowCheckmark(true);
    setShowStars(true);

    setTimeout(() => {
      setShowCheckmark(false);
      setShowStars(false);
    }, 1500);

    onMealComplete?.();
  }, [onMealComplete]);

  const triggerDayComplete = useCallback(() => {
    // Stronger haptic
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }

    // Play celebration sound
    const audio = new Audio('/sounds/celebration.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {});

    setShowConfetti(true);
    setShowTrophy(true);

    setTimeout(() => {
      setShowConfetti(false);
      setShowTrophy(false);
    }, 3000);

    onDayComplete?.();
  }, [onDayComplete]);

  return (
    <div className={cn("relative p-6 rounded-2xl bg-card border border-border overflow-hidden", className)}>
      {/* Animations */}
      <ConfettiExplosion isActive={showConfetti} />
      <SuccessCheckmark isVisible={showCheckmark} />
      <StarBurst isActive={showStars} />

      {/* Trophy animation */}
      <AnimatePresence>
        {showTrophy && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-yellow-500/20 to-orange-500/20 backdrop-blur-sm z-20"
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <Trophy className="w-20 h-20 text-yellow-500" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-foreground mt-4"
            >
              Dia Completo! 🎉
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground"
            >
              Você bateu todas as metas!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-0">
        <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Feedback Sensorial
        </h3>

        <p className="text-sm text-muted-foreground mb-6">
          Teste as animações de feedback que aparecem quando você completa refeições ou metas.
        </p>

        <div className="flex gap-3">
          <motion.button
            onClick={triggerMealComplete}
            className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Check className="w-4 h-4 inline mr-2" />
            Completar Refeição
          </motion.button>

          <motion.button
            onClick={triggerDayComplete}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Completar Dia
          </motion.button>
        </div>

        {/* Info */}
        <div className="mt-6 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <p>💡 Dica: Em dispositivos móveis, você sentirá uma vibração sutil ao completar ações.</p>
        </div>
      </div>
    </div>
  );
};

// Export individual animation components for use elsewhere
export { ConfettiExplosion, SuccessCheckmark, StarBurst };
