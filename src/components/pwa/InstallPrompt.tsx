import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPrompt, useStandaloneMode } from '@/hooks/useStandaloneMode';
import { useHaptics } from '@/hooks/useHaptics';

interface InstallPromptProps {
  delay?: number;
  showOnlyOnce?: boolean;
}

export function InstallPrompt({ delay = 5000, showOnlyOnce = false }: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const { isIOS, isStandalone } = useStandaloneMode();
  const haptics = useHaptics();

  useEffect(() => {
    // Don't show if already installed or in standalone mode
    if (isInstalled || isStandalone) return;

    // Check if user has dismissed before (only if showOnlyOnce is true)
    if (showOnlyOnce) {
      const hasDismissed = localStorage.getItem('pwa-install-dismissed');
      if (hasDismissed) return;
    }

    // Show after delay - for both Android AND iOS
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
      // iOS: Show modal with instructions
      setShowIOSModal(true);
      return;
    }

    // Android/Chrome: Use native prompt
    const installed = await promptInstall();
    if (installed) {
      haptics.notification('success');
      setIsVisible(false);
    }
  };

  const handleDismiss = useCallback(() => {
    haptics.impact('light');
    setIsVisible(false);
    
    if (showOnlyOnce) {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  }, [haptics, showOnlyOnce]);

  const handleCloseIOSModal = useCallback(() => {
    setShowIOSModal(false);
  }, []);

  if (isInstalled || isStandalone) return null;

  return (
    <>
      {/* Banner de instalação - aparece em baixo */}
      <AnimatePresence>
        {isVisible && !showIOSModal && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 z-[60] safe-area-inset-bottom"
          >
            <div className="bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Smartphone className="w-7 h-7 text-primary-foreground" />
                </div>
                
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-base">
                    Instalar App
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Acesso rápido na tela inicial
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleDismiss}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="gap-2 px-4 h-10 font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Instalar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal iOS - Instruções passo a passo */}
      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleCloseIOSModal}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-lg bg-card rounded-t-3xl overflow-hidden safe-area-inset-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Smartphone className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Instalar MaxNutrition
                </h2>
                <p className="text-muted-foreground mt-1">
                  Siga os passos abaixo para instalar
                </p>
              </div>

              {/* Steps */}
              <div className="px-6 pb-6 space-y-4">
                {/* Step 1 */}
                <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Toque no botão <Share className="w-4 h-4 inline text-primary" /> Compartilhar
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Na barra inferior do Safari
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Role e toque em <Plus className="w-4 h-4 inline text-primary" /> Adicionar à Tela de Início
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Toque em "Adicionar" no canto superior
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-8">
                <Button
                  onClick={handleCloseIOSModal}
                  className="w-full h-12 text-base font-semibold"
                >
                  Entendi
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Compact install button for header/navigation
export function InstallButton({ className }: { className?: string }) {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const { isStandalone, isIOS } = useStandaloneMode();
  const haptics = useHaptics();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Show for iOS too (not just Android)
  if (isInstalled || isStandalone) return null;
  if (!isInstallable && !isIOS) return null;

  const handleClick = async () => {
    haptics.impact('medium');
    
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    
    await promptInstall();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={className}
      >
        <Download className="w-4 h-4 mr-2" />
        Instalar
      </Button>

      {/* iOS Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-card rounded-2xl p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Instalar no iPhone</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Toque em <Share className="w-4 h-4 inline text-primary" /> Compartilhar</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Toque em <Plus className="w-4 h-4 inline text-primary" /> Tela de Início</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Toque em "Adicionar"</span>
                </div>
              </div>

              <Button onClick={() => setShowIOSModal(false)} className="w-full">
                Entendi
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
