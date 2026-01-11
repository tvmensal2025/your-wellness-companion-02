import React from 'react';
import { Logo } from '@/components/ui/logo';

interface MaxNutritionLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'light' | 'dark';
  className?: string;
}

const MaxNutritionLogo: React.FC<MaxNutritionLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  variant = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const textColorClasses = {
    default: 'text-foreground',
    light: 'text-white',
    dark: 'text-gray-900'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo className={`${sizeClasses[size]} object-contain`} />
      {showText && (
        <div>
          <h1 className={`font-bold ${textSizeClasses[size]} ${textColorClasses[variant]}`}>
            MaxNutrition
          </h1>
          <p className={`text-xs opacity-60 ${textColorClasses[variant]}`}>
            Nutrição Inteligente
          </p>
        </div>
      )}
    </div>
  );
};

export default MaxNutritionLogo;

// Alias para compatibilidade
export { MaxNutritionLogo as InstitutoLogo };
