import React, { useState, useEffect } from 'react';
import { Leaf, Activity } from 'lucide-react';

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

export function SplashScreen({ minDisplayTime = 1200, onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const isLowEnd = isLowEndDevice();

  useEffect(() => {
    const startTime = Date.now();
    // Tempo reduzido para dispositivos lentos (500ms) e normais (1200ms)
    const displayTime = isLowEnd ? 500 : minDisplayTime;
    
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

  // Versão única e leve - CSS puro para todos os dispositivos
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      {/* Logo com folha */}
      <div className="relative w-24 h-24">
        {/* Círculo girando - CSS puro */}
        <div className="absolute inset-0 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
        {/* Fundo do logo */}
        <div className="absolute inset-2 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
          <Leaf className="w-10 h-10 text-primary-foreground" />
        </div>
      </div>
      
      {/* Nome do app */}
      <h1 className="text-2xl font-bold text-foreground mt-6">MaxNutrition</h1>
      <p className="text-sm text-muted-foreground mt-1">Seu companheiro de saúde</p>
      
      {/* Barra de progresso */}
      <div className="mt-8 w-48">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-100 ease-out"
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
export function useSplashScreen(minDisplayTime = 1200) {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    // Em dispositivos lentos, não mostra splash (já tem o loader do HTML)
    if (isLowEndDevice()) return false;
    
    // Only show splash in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (navigator as any).standalone === true;
    return isStandalone || isIOSStandalone;
  });

  const hideSplash = () => setShowSplash(false);

  return { showSplash, hideSplash };
}
