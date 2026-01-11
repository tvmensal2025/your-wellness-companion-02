import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  alt?: string;
}

/**
 * Componente Logo MaxNutrition
 * 
 * Alterna automaticamente entre versões clara/escura baseado no tema:
 * - Modo Claro: Logo PRETA (texto preto) - logo-dark.png
 * - Modo Escuro: Logo BRANCA (texto branco) - logo-light.png
 * 
 * @example
 * <Logo className="h-8" />
 * <Logo variant="icon" className="h-10" />
 */
export const Logo: React.FC<LogoProps> = ({ 
  className = 'h-8 w-auto',
  alt = 'MaxNutrition'
}) => {
  return (
    <>
      {/* Logo PRETA para modo CLARO */}
      <img 
        src="/logo-dark.png"
        alt={alt}
        className={cn(className, "dark:hidden")}
      />
      {/* Logo BRANCA para modo ESCURO */}
      <img 
        src="/logo-light.png"
        alt={alt}
        className={cn(className, "hidden dark:block")}
      />
    </>
  );
};

export default Logo;
