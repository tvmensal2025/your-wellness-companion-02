import React from 'react';
import { motion } from 'framer-motion';

interface SimpleCharacter3DProps {
  width?: number;
  height?: number;
  gender: 'male' | 'female';
  autoRotate?: boolean;
  backgroundColor?: string;
  onLoad?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SimpleCharacter3D: React.FC<SimpleCharacter3DProps> = ({
  width = 300,
  height = 400,
  gender,
  autoRotate = true,
  backgroundColor = 'transparent',
  onLoad,
  className = '',
  style = {}
}) => {
  // Call onLoad immediately since component renders instantly
  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  // Configurações baseadas no gênero
  const config = {
    male: {
      emoji: '👨',
      color: 'hsl(var(--primary))',
    },
    female: {
      emoji: '👩',
      color: 'hsl(var(--primary))',
    }
  };

  const currentConfig = config[gender];

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor,
        ...style
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          rotateY: autoRotate ? [0, 360] : 0
        }}
        transition={{
          scale: { duration: 0.3 },
          opacity: { duration: 0.3 },
          rotateY: autoRotate ? {
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          } : undefined
        }}
        className="text-6xl sm:text-7xl"
        style={{
          textShadow: `0 4px 12px ${currentConfig.color}30`
        }}
      >
        {currentConfig.emoji}
      </motion.div>
    </div>
  );
};
