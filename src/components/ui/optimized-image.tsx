import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: string;
  priority?: boolean; // Se true, carrega imediatamente (above the fold)
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagem otimizada com:
 * - Lazy loading nativo (carrega só quando visível)
 * - Skeleton loader enquanto carrega
 * - Fallback para erros
 * - Suporte a WebP
 */
export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  fallback = '/placeholder.svg',
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer para lazy loading
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
        rootMargin: '50px', // Começa a carregar 50px antes de entrar na tela
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageSrc = hasError ? fallback : src;

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-muted animate-pulse rounded-inherit"
          aria-hidden="true"
        />
      )}

      {/* Imagem */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}

/**
 * Versão simplificada para avatares
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallbackInitials,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  fallbackInitials?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const showFallback = !src || hasError;

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-muted flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Skeleton */}
      {!isLoaded && !showFallback && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {showFallback ? (
        <span className="text-muted-foreground font-medium text-sm">
          {fallbackInitials || alt.charAt(0).toUpperCase()}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-200',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}

export default OptimizedImage;
