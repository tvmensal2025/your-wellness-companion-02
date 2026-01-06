import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPrompt, useStandaloneMode } from '@/hooks/useStandaloneMode';
import { useHaptics } from '@/hooks/useHaptics';

interface InstallPromptProps {
  delay?: number;
  showOnlyOnce?: boolean;
}

export function InstallPrompt({ delay = 30000, showOnlyOnce = true }: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const { isIOS, isStandalone } = useStandaloneMode();
  const haptics = useHaptics();

  useEffect(() => {
    // Don't show if already installed or in standalone mode
    if (isInstalled || isStandalone) return;

    // Check if user has dismissed before
    if (showOnlyOnce) {
      const hasDismissed = localStorage.getItem('pwa-install-dismissed');
      if (hasDismissed) {
        setDismissed(true);
        return;
      }
    }

    // Show after delay
    const timer = setTimeout(() => {
      if (isInstallable || isIOS) {
        setIsVisible(true);
        haptics.notification('warning');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isStandalone, isIOS, delay, showOnlyOnce, haptics]);

  const handleInstall = async () => {
    haptics.impact('medium');
    
    if (isIOS) {
      // iOS doesn't support install prompt, show instructions
      return;
    }

    const installed = await promptInstall();
    if (installed) {
      haptics.notification('success');
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    haptics.impact('light');
    setIsVisible(false);
    setDismissed(true);
    
    if (showOnlyOnce) {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  if (dismissed || isInstalled || isStandalone) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 flex items-start gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">
                  Instalar App
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Acesse mais rápido direto da tela inicial
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {isIOS ? (
                <IOSInstallInstructions />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>Funciona offline</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>Carregamento instantâneo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>Experiência nativa</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {!isIOS && (
              <div className="p-4 pt-0 flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Agora não
                </Button>
                <Button
                  onClick={handleInstall}
                  className="flex-1 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Instalar
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IOSInstallInstructions() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Para instalar no seu iPhone/iPad:
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm font-medium">
            1
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Toque em</span>
            <Share className="w-4 h-4 text-primary" />
            <span>Compartilhar</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm font-medium">
            2
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Role e toque em</span>
            <Plus className="w-4 h-4 text-primary" />
            <span>"Tela Inicial"</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm font-medium">
            3
          </div>
          <span className="text-sm">Toque em "Adicionar"</span>
        </div>
      </div>
    </div>
  );
}

// Compact install button for header/navigation
export function InstallButton({ className }: { className?: string }) {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const { isStandalone } = useStandaloneMode();
  const haptics = useHaptics();

  if (isInstalled || isStandalone || !isInstallable) return null;

  const handleClick = async () => {
    haptics.impact('medium');
    await promptInstall();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      Instalar
    </Button>
  );
}
