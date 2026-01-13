// =====================================================
// DR. VITAL AVATAR COMPONENT
// =====================================================
// Avatar animado do Dr. Vital com estados e humor
// Requirements: 4.1, 4.2, 4.3, 4.4
// =====================================================

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { AvatarState, AvatarMood } from '@/types/dr-vital-revolution';

// =====================================================
// AVATAR EXPRESSIONS
// =====================================================

interface AvatarExpression {
  eyes: string;
  mouth: string;
  eyebrows: string;
}

const EXPRESSIONS: Record<AvatarMood, AvatarExpression> = {
  happy: { eyes: '◠', mouth: '◡', eyebrows: '︵' },
  neutral: { eyes: '●', mouth: '—', eyebrows: '—' },
  concerned: { eyes: '●', mouth: '︵', eyebrows: '︶' },
  excited: { eyes: '★', mouth: '◡', eyebrows: '︵' },
};

// =====================================================
// ANIMATION VARIANTS
// =====================================================

const avatarVariants = {
  idle: {
    y: [0, -5, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
  },
  thinking: {
    rotate: [-2, 2, -2],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
  talking: {
    scale: [1, 1.02, 1],
    transition: { duration: 0.3, repeat: Infinity },
  },
  listening: {
    scale: 1.05,
    transition: { duration: 0.5 },
  },
  celebrating: {
    y: [0, -20, 0],
    rotate: [0, 10, -10, 0],
    transition: { duration: 0.8, repeat: 2 },
  },
  concerned: {
    x: [-2, 2, -2],
    transition: { duration: 0.5, repeat: 3 },
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: { duration: 2, repeat: Infinity },
  },
};

// =====================================================
// AVATAR FACE COMPONENT
// =====================================================

interface AvatarFaceProps {
  mood: AvatarMood;
  state: AvatarState;
  size: 'sm' | 'md' | 'lg';
}

function AvatarFace({ mood, state, size }: AvatarFaceProps) {
  const expression = EXPRESSIONS[mood];
  const [blinking, setBlinking] = useState(false);

  // Blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', sizeClasses[size])}>
      {/* Eyebrows */}
      <div className="flex gap-4 text-foreground/70">
        <span>{expression.eyebrows}</span>
        <span>{expression.eyebrows}</span>
      </div>
      
      {/* Eyes */}
      <div className="flex gap-4">
        <motion.span
          animate={blinking ? { scaleY: 0.1 } : { scaleY: 1 }}
          transition={{ duration: 0.1 }}
        >
          {expression.eyes}
        </motion.span>
        <motion.span
          animate={blinking ? { scaleY: 0.1 } : { scaleY: 1 }}
          transition={{ duration: 0.1 }}
        >
          {expression.eyes}
        </motion.span>
      </div>
      
      {/* Mouth */}
      <motion.div
        animate={state === 'talking' ? { scaleY: [1, 0.5, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.2, repeat: state === 'talking' ? Infinity : 0 }}
      >
        {expression.mouth}
      </motion.div>
    </div>
  );
}

// =====================================================
// THINKING DOTS
// =====================================================

function ThinkingDots() {
  return (
    <div className="flex gap-1 absolute -top-2 -right-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// =====================================================
// LISTENING WAVES
// =====================================================

function ListeningWaves() {
  return (
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary rounded-full"
          animate={{ height: [8, 16, 8] }}
          transition={{ duration: 0.4, delay: i * 0.1, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// =====================================================
// CELEBRATION PARTICLES
// =====================================================

function CelebrationParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * 360,
      delay: i * 0.1,
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full bg-yellow-400"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [0, Math.cos(p.angle * Math.PI / 180) * 40],
            y: [0, Math.sin(p.angle * Math.PI / 180) * 40],
            opacity: [1, 0],
            scale: [1, 0.5],
          }}
          transition={{ duration: 0.8, delay: p.delay, repeat: 2 }}
        />
      ))}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface DrVitalAvatarProps {
  state?: AvatarState;
  mood?: AvatarMood;
  healthScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
  className?: string;
  onAnimationComplete?: () => void;
}

export function DrVitalAvatar({
  state = 'idle',
  mood: propMood,
  healthScore,
  size = 'md',
  showBackground = true,
  className,
  onAnimationComplete,
}: DrVitalAvatarProps) {
  // Derive mood from health score if not provided (Property 12)
  const mood = useMemo((): AvatarMood => {
    if (propMood) return propMood;
    if (healthScore === undefined) return 'neutral';
    
    if (healthScore >= 80) return 'happy';
    if (healthScore >= 60) return 'neutral';
    return 'concerned';
  }, [propMood, healthScore]);

  const sizeConfig = {
    sm: { container: 'w-16 h-16', avatar: 'w-12 h-12' },
    md: { container: 'w-24 h-24', avatar: 'w-18 h-18' },
    lg: { container: 'w-32 h-32', avatar: 'w-24 h-24' },
  };

  const config = sizeConfig[size];

  // Background color based on mood
  const bgColor = useMemo(() => {
    switch (mood) {
      case 'happy': return 'from-green-400/20 to-emerald-500/20';
      case 'excited': return 'from-yellow-400/20 to-orange-500/20';
      case 'concerned': return 'from-orange-400/20 to-red-500/20';
      default: return 'from-blue-400/20 to-primary/20';
    }
  }, [mood]);

  return (
    <div className={cn('relative', config.container, className)}>
      {/* Background Glow */}
      {showBackground && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-br blur-xl',
            bgColor
          )}
          variants={pulseVariants}
          animate="pulse"
        />
      )}

      {/* Avatar Container */}
      <motion.div
        className={cn(
          'relative rounded-full bg-gradient-to-br from-primary/80 to-primary',
          'flex items-center justify-center shadow-lg',
          config.container
        )}
        variants={avatarVariants}
        animate={state}
        onAnimationComplete={onAnimationComplete}
      >
        {/* Stethoscope Icon */}
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background flex items-center justify-center shadow-md">
          <span className="text-xs">🩺</span>
        </div>

        {/* Face */}
        <div className="text-white">
          <AvatarFace mood={mood} state={state} size={size} />
        </div>

        {/* State-specific effects */}
        <AnimatePresence>
          {state === 'thinking' && <ThinkingDots />}
          {state === 'listening' && <ListeningWaves />}
          {state === 'celebrating' && <CelebrationParticles />}
        </AnimatePresence>

        {/* Alert ring for concerned state */}
        {mood === 'concerned' && healthScore !== undefined && healthScore < 40 && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500"
            animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Health Score Badge */}
      {healthScore !== undefined && (
        <div className={cn(
          'absolute -bottom-1 left-1/2 -translate-x-1/2',
          'px-2 py-0.5 rounded-full text-xs font-bold',
          'bg-background shadow-md border',
          healthScore >= 70 ? 'text-green-500 border-green-500/30' :
          healthScore >= 40 ? 'text-yellow-500 border-yellow-500/30' :
          'text-red-500 border-red-500/30'
        )}>
          {healthScore}
        </div>
      )}
    </div>
  );
}

export default DrVitalAvatar;
