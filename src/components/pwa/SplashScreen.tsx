import React, { useState, useEffect } from 'react';
import { Heart, Activity } from 'lucide-react';

interface SplashScreenProps {
  minDisplayTime?: number;
  onComplete?: () => void;
}

// Detecta se é dispositivo de baixa performance
const isLowEndDevice = () => {
  if (typeof navigator === 'undefined') return false;
  
  // Detecta memória baixa
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  
  // Detecta conexão lenta
  const connection = (navigator as any).connection;
  if (connection) {
    const slowTypes = ['slow-2g', '2g', '3g'];
    if (slowTypes.includes(connection.effectiveType)) return true;
    if (connection.saveData) return true;
  }
  
  // Detecta hardware cores baixo
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return true;
  
  return false;
};

export function SplashScreen({ minDisplayTime = 1500, onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const isLowEnd = isLowEndDevice();

  useEffect(() => {
    const startTime = Date.now();
    // Tempo reduzido para dispositivos lentos
    const displayTime = isLowEnd ? 800 : minDisplayTime;
    
    // Animate progress (menos frequente em dispositivos lentos)
    const interval = isLowEnd ? 100 : 50;
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / displayTime) * 100, 100);
      setProgress(newProgress);
    }, interval);

    // Hide after minimum display time
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, displayTime);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [minDisplayTime, onComplete, isLowEnd]);

  if (!isVisible) return null;

  // Versão simplificada para dispositivos lentos
  if (isLowEnd) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
          <Heart className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground mt-6">MaxNutrition</h1>
        <div className="mt-8 w-40">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  // Versão normal com animações CSS (mais leve que framer-motion)
  return (
    <div 
      className={`fixed inset-0 z-[100] bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center transition-opacity duration-500 ${!isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Logo */}
      <div className="relative animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30">
          <Heart className="w-12 h-12 text-primary-foreground" />
        </div>
        
        {/* Pulse animation - CSS only */}
        <div className="absolute inset-0 bg-primary/20 rounded-3xl animate-ping" />
      </div>

      {/* App name */}
      <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h1 className="text-2xl font-bold text-foreground">MaxNutrition</h1>
        <p className="text-sm text-muted-foreground mt-1">Seu companheiro de saúde</p>
      </div>

      {/* Loading indicator */}
      <div className="mt-12 w-48 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Carregando...</span>
        </div>
      </div>

      {/* Version */}
      <p className="absolute bottom-8 text-xs text-muted-foreground/50">v1.0.0</p>
    </div>
  );
}

// Hook to manage splash screen state
export function useSplashScreen(minDisplayTime = 1500) {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    // Em dispositivos lentos, não mostra splash
    if (isLowEndDevice()) return false;
    
    // Only show splash in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (navigator as any).standalone === true;
    return isStandalone || isIOSStandalone;
  });

  const hideSplash = () => setShowSplash(false);

  return { showSplash, hideSplash };
}
