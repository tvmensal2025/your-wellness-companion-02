import React, { memo } from 'react';
import { useSafeAnimation } from '@/hooks/useSafeAnimation';

interface SafeMotionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SafeMotion - Componente wrapper que usa animações CSS em dispositivos potentes
 * e renderiza sem animações em dispositivos fracos para melhor performance
 */
export const SafeMotion = memo<SafeMotionProps>(({ children, className }) => {
  const { shouldAnimate } = useSafeAnimation();

  return (
    <div className={`${className || ''} ${shouldAnimate ? 'animate-fade-in' : ''}`}>
      {children}
    </div>
  );
});

SafeMotion.displayName = 'SafeMotion';

export default SafeMotion;
