import { useCallback } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationOptions {
  type?: 'confetti' | 'fireworks' | 'stars' | 'coins';
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
}

export const useCelebration = () => {
  const celebrate = useCallback(({ type = 'confetti', duration = 3000, intensity = 'medium' }: CelebrationOptions = {}) => {
    const intensityMap = {
      low: { particleCount: 30, spread: 50 },
      medium: { particleCount: 80, spread: 70 },
      high: { particleCount: 150, spread: 100 }
    };

    const { particleCount, spread } = intensityMap[intensity];

    switch (type) {
      case 'confetti':
        confetti({
          particleCount,
          spread,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#D946EF', '#F59E0B', '#10B981', '#3B82F6']
        });
        break;

      case 'fireworks':
        const end = Date.now() + duration;
        const interval = setInterval(() => {
          if (Date.now() > end) {
            clearInterval(interval);
            return;
          }
          confetti({
            particleCount: 30,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#8B5CF6', '#D946EF', '#F59E0B']
          });
          confetti({
            particleCount: 30,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#10B981', '#3B82F6', '#EC4899']
          });
        }, 250);
        break;

      case 'stars':
        confetti({
          particleCount: particleCount * 2,
          spread,
          origin: { y: 0.5 },
          shapes: ['star'],
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
        break;

      case 'coins':
        confetti({
          particleCount: particleCount / 2,
          spread: 45,
          origin: { y: 0.4 },
          shapes: ['circle'],
          colors: ['#FFD700', '#FFC107', '#FFEB3B'],
          gravity: 1.5
        });
        break;
    }
  }, []);

  const celebrateStreak = useCallback((streakDays: number) => {
    if (streakDays >= 30) {
      celebrate({ type: 'fireworks', intensity: 'high', duration: 4000 });
    } else if (streakDays >= 7) {
      celebrate({ type: 'stars', intensity: 'high' });
    } else if (streakDays >= 3) {
      celebrate({ type: 'confetti', intensity: 'medium' });
    } else {
      celebrate({ type: 'confetti', intensity: 'low' });
    }
  }, [celebrate]);

  const celebrateLevelUp = useCallback((newLevel: number) => {
    celebrate({ type: 'fireworks', intensity: 'high', duration: 5000 });
  }, [celebrate]);

  const celebrateAchievement = useCallback(() => {
    celebrate({ type: 'stars', intensity: 'high' });
  }, [celebrate]);

  const celebrateXP = useCallback((amount: number) => {
    if (amount >= 100) {
      celebrate({ type: 'coins', intensity: 'high' });
    } else if (amount >= 50) {
      celebrate({ type: 'coins', intensity: 'medium' });
    } else {
      celebrate({ type: 'coins', intensity: 'low' });
    }
  }, [celebrate]);

  return {
    celebrate,
    celebrateStreak,
    celebrateLevelUp,
    celebrateAchievement,
    celebrateXP
  };
};
