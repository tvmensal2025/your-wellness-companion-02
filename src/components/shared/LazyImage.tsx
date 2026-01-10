import React, { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Componente de imagem otimizado com lazy loading nativo
 * - Usa Intersection Observer para carregar apenas quando visível
 * - Placeholder blur enquanto carrega
 * - Fallback para imagem padrão em caso de erro
 */
const LazyImage = memo(({
  src,
  alt,
  className,
  placeholderClassName,
  width,
  height,
  priority = false,
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Fallback image (placeholder cinza)
  const fallbackSrc = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width || 100}' height='${height || 100}'%3E%3Crect fill='%23e5e7eb' width='100%25' height='100%25'/%3E%3C/svg%3E`;

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        placeholderClassName
      )}
      style={{ width, height }}
    >
      {/* Placeholder/Skeleton */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted',
            placeholderClassName
          )}
        />
      )}

      {/* Imagem real */}
      {isInView && (
        <img
          src={hasError ? fallbackSrc : src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export { LazyImage };
export default LazyImage;
