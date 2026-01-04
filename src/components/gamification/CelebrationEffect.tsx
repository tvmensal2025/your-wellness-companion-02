import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CelebrationEffectProps {
  trigger: boolean;
  type?: 'confetti' | 'fireworks' | 'stars' | 'xp';
  xpAmount?: number;
  message?: string;
  onComplete?: () => void;
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  trigger,
  type = 'confetti',
  xpAmount,
  message,
  onComplete,
}) => {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    setShowOverlay(true);

    // Disparar confetti
    if (type === 'confetti') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899'],
      });
    } else if (type === 'fireworks') {
      const duration = 2000;
      const animationEnd = Date.now() + duration;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 50,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2,
          },
          colors: ['#10B981', '#8B5CF6', '#F59E0B'],
        });
      }, 250);
    } else if (type === 'stars') {
      confetti({
        particleCount: 50,
        spread: 100,
        shapes: ['star'],
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      });
    }

    // Auto-hide overlay
    const timer = setTimeout(() => {
      setShowOverlay(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [trigger, type, onComplete]);

  return (
    <AnimatePresence>
      {showOverlay && (xpAmount || message) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-gradient-to-br from-primary via-violet-600 to-purple-700 rounded-3xl px-8 py-6 shadow-2xl shadow-primary/30 text-center">
            {xpAmount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-5xl font-bold text-white mb-2"
              >
                +{xpAmount} XP
              </motion.div>
            )}
            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-white/90 font-medium"
              >
                {message}
              </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 text-4xl"
            >
              🎉
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook para usar celebrações
export const useCelebration = () => {
  const [celebrationState, setCelebrationState] = useState({
    trigger: false,
    type: 'confetti' as 'confetti' | 'fireworks' | 'stars' | 'xp',
    xpAmount: 0,
    message: '',
  });

  const celebrate = (options: {
    type?: 'confetti' | 'fireworks' | 'stars' | 'xp';
    xpAmount?: number;
    message?: string;
  }) => {
    setCelebrationState({
      trigger: true,
      type: options.type || 'confetti',
      xpAmount: options.xpAmount || 0,
      message: options.message || '',
    });

    // Reset after animation
    setTimeout(() => {
      setCelebrationState((prev) => ({ ...prev, trigger: false }));
    }, 3000);
  };

  const CelebrationComponent = () => (
    <CelebrationEffect
      trigger={celebrationState.trigger}
      type={celebrationState.type}
      xpAmount={celebrationState.xpAmount}
      message={celebrationState.message}
    />
  );

  return { celebrate, CelebrationComponent };
};

export default CelebrationEffect;
