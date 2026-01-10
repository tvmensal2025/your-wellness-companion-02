import { useMemo } from 'react';

/**
 * Hook para detectar dispositivos fracos e desabilitar animações pesadas
 * Melhora performance em celulares com pouca memória/CPU
 */
export const useSafeAnimation = () => {
  const deviceInfo = useMemo(() => {
    if (typeof window === 'undefined') {
      return { isLowEnd: false, prefersReducedMotion: false };
    }

    // Detecta preferência de redução de movimento do sistema
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detecta memória do dispositivo (API disponível em Chrome/Edge)
    const deviceMemory = (navigator as any).deviceMemory ?? 8;
    const isLowMemory = deviceMemory < 4;

    // Detecta número de núcleos de CPU
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 8;
    const isLowCPU = hardwareConcurrency < 4;

    // Detecta conexão lenta
    const connection = (navigator as any).connection;
    const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';

    // Detecta se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Device é considerado fraco se:
    // - Preferência de redução de movimento OU
    // - Pouca memória OU
    // - Poucos núcleos OU
    // - Conexão lenta + mobile
    const isLowEnd = prefersReducedMotion || isLowMemory || isLowCPU || (isSlowConnection && isMobile);

    return {
      isLowEnd,
      prefersReducedMotion,
      deviceMemory,
      hardwareConcurrency,
      isMobile,
      isSlowConnection,
    };
  }, []);

  // Retorna configurações otimizadas baseadas no dispositivo
  return {
    shouldAnimate: !deviceInfo.isLowEnd,
    isLowEndDevice: deviceInfo.isLowEnd,
    prefersReducedMotion: deviceInfo.prefersReducedMotion,
    isMobile: deviceInfo.isMobile,
    
    // Quantidade reduzida de partículas para dispositivos fracos
    particleCount: deviceInfo.isLowEnd ? 8 : 30,
    
    // Duração de animações (mais curta em dispositivos fracos)
    animationDuration: deviceInfo.isLowEnd ? 0.15 : 0.3,
    
    // Configuração para framer-motion
    motionConfig: deviceInfo.isLowEnd 
      ? { 
          initial: false, 
          animate: false,
          transition: { duration: 0 }
        }
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3 }
        },
  };
};

/**
 * Função utilitária para verificar se deve animar (pode ser usada fora de componentes)
 */
export const shouldAnimateOnDevice = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const deviceMemory = (navigator as any).deviceMemory ?? 8;
  const hardwareConcurrency = navigator.hardwareConcurrency ?? 8;
  
  return !prefersReducedMotion && deviceMemory >= 4 && hardwareConcurrency >= 4;
};

export default useSafeAnimation;
