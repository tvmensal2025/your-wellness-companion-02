import { useState, useEffect } from 'react';

interface StandaloneModeState {
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isPWA: boolean;
  displayMode: 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen';
}

export function useStandaloneMode(): StandaloneModeState {
  const [state, setState] = useState<StandaloneModeState>(() => {
    if (typeof window === 'undefined') {
      return {
        isStandalone: false,
        isIOS: false,
        isAndroid: false,
        isPWA: false,
        displayMode: 'browser'
      };
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    // Check various standalone indicators
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    const isIOSStandalone = (navigator as any).standalone === true;
    
    const isStandalone = isStandaloneMedia || isIOSStandalone || isMinimalUI || isFullscreen;
    
    let displayMode: StandaloneModeState['displayMode'] = 'browser';
    if (isFullscreen) displayMode = 'fullscreen';
    else if (isStandaloneMedia || isIOSStandalone) displayMode = 'standalone';
    else if (isMinimalUI) displayMode = 'minimal-ui';

    return {
      isStandalone,
      isIOS,
      isAndroid,
      isPWA: isStandalone,
      displayMode
    };
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setState(prev => ({
        ...prev,
        isStandalone: e.matches,
        isPWA: e.matches,
        displayMode: e.matches ? 'standalone' : 'browser'
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return state;
}

// Hook to check if app can be installed
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }
    
    return false;
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall
  };
}
