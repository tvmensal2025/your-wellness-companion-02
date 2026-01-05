import React, { useState, useCallback } from 'react';
import { getCharacterImageUrls } from '@/lib/character-images';

interface CharacterImageProps {
  characterType: 'dr-vital' | 'sofia';
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20'
};

export const CharacterImage: React.FC<CharacterImageProps> = ({
  characterType,
  alt,
  className = '',
  size = 'md'
}) => {
  const urls = getCharacterImageUrls(characterType);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    const nextIndex = currentUrlIndex + 1;
    if (nextIndex < urls.length) {
      setCurrentUrlIndex(nextIndex);
    } else {
      setHasError(true);
    }
  }, [currentUrlIndex, urls.length]);

  const defaultAlt = characterType === 'dr-vital' ? 'Dr. Vital' : 'Sofia';
  const sizeClass = sizeClasses[size];

  if (hasError) {
    // Fallback visual se todas as URLs falharem
    return (
      <div 
        className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold ${className}`}
      >
        {characterType === 'dr-vital' ? 'DV' : 'S'}
      </div>
    );
  }

  return (
    <img
      src={urls[currentUrlIndex]}
      alt={alt || defaultAlt}
      className={`${sizeClass} object-contain rounded-full ${className}`}
      onError={handleError}
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
  );
};

// Componente para uso direto com URL
export const DrVitalImage: React.FC<Omit<CharacterImageProps, 'characterType'>> = (props) => (
  <CharacterImage {...props} characterType="dr-vital" />
);

export const SofiaImage: React.FC<Omit<CharacterImageProps, 'characterType'>> = (props) => (
  <CharacterImage {...props} characterType="sofia" />
);

export default CharacterImage;
