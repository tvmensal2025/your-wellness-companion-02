import React, { useEffect, useCallback, useState } from 'react';
import confetti from 'canvas-confetti';
import { useSafeAnimation } from '@/hooks/useSafeAnimation';

interface ConfettiAnimationProps {
  trigger: boolean;
  duration?: number;
  colors?: string[];
  particleCount?: number;
  onComplete?: () => void;
}

/**
 * Componente de confetti otimizado usando canvas-confetti
 * Muito mais performático que framer-motion para partículas
 * Adapta automaticamente para dispositivos fracos
 */
export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  trigger,
  duration = 3000,
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
  particleCount: propParticleCount,
  onComplete
}) => {
  const { shouldAnimate, particleCount: safeParticleCount, isLowEndDevice } = useSafeAnimation();
  
  // Usa quantidade de partículas do prop ou do hook de performance
  const finalParticleCount = propParticleCount ?? safeParticleCount;

  const fireConfetti = useCallback(() => {
    // Pula animação em dispositivos fracos que preferem redução de movimento
    if (!shouldAnimate && isLowEndDevice) {
      onComplete?.();
      return;
    }

    // Dispara confetti do canvas (muito mais leve que DOM elements)
    const count = isLowEndDevice ? Math.min(finalParticleCount, 15) : finalParticleCount;
    const defaults = {
      origin: { y: 0.7 },
      colors,
      disableForReducedMotion: true,
    };

    // Disparo central
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.6),
      spread: 55,
      startVelocity: 45,
    });

    // Disparos laterais (apenas se não for dispositivo fraco)
    if (!isLowEndDevice) {
      confetti({
        ...defaults,
        particleCount: Math.floor(count * 0.2),
        angle: 60,
        spread: 40,
        origin: { x: 0, y: 0.6 },
      });

      confetti({
        ...defaults,
        particleCount: Math.floor(count * 0.2),
        angle: 120,
        spread: 40,
        origin: { x: 1, y: 0.6 },
      });
    }

    // Callback após duração
    setTimeout(() => {
      onComplete?.();
    }, duration);
  }, [shouldAnimate, isLowEndDevice, finalParticleCount, colors, duration, onComplete]);

  useEffect(() => {
    if (trigger) {
      fireConfetti();
    }
  }, [trigger, fireConfetti]);

  // Componente não renderiza nada - confetti usa canvas separado
  return null;
};

// Hook para usar confetti facilmente
export const useConfetti = () => {
  const [trigger, setTrigger] = useState(false);

  const celebrate = () => {
    setTrigger(true);
    setTimeout(() => setTrigger(false), 100);
  };

  return { trigger, celebrate };
};