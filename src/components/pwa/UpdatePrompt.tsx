/// <reference types="vite-plugin-pwa/client" />
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Dynamically import to avoid hook ordering issues
    const registerSW = async () => {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        const updateFunction = registerSW({
          immediate: true,
          onNeedRefresh() {
            console.log('[PWA] Nova versão disponível');
            setNeedRefresh(true);
          },
          onOfflineReady() {
            console.log('[PWA] App pronto para uso offline');
          },
          onRegistered(registration) {
            console.log('[PWA] Service Worker registrado:', registration?.scope);
            
            // Check for updates every 60 seconds
            if (registration) {
              setInterval(() => {
                registration.update();
              }, 60 * 1000);
            }
          },
          onRegisterError(error) {
            console.error('[PWA] Erro no registro:', error);
          }
        });
        setUpdateSW(() => updateFunction);
      } catch (error) {
        console.debug('[PWA] Registro não disponível:', error);
      }
    };
    
    registerSW();
  }, []);

  const handleUpdate = useCallback(async () => {
    if (updateSW) {
      setIsUpdating(true);
      try {
        await updateSW();
        // Force reload after update
        window.location.reload();
      } catch (error) {
        console.error('[PWA] Erro ao atualizar:', error);
        // Try force reload anyway
        window.location.reload();
      }
    }
  }, [updateSW]);

  const handleDismiss = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-4 right-4 z-[70] md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-card/95 backdrop-blur-lg border border-primary/30 rounded-xl shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <RefreshCw className={`w-5 h-5 text-primary ${isUpdating ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm">
                  Nova versão disponível
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Atualize para obter as últimas melhorias
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-muted rounded-md transition-colors"
                disabled={isUpdating}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="flex-1"
                disabled={isUpdating}
              >
                Depois
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                className="flex-1 gap-1.5"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Atualizar Agora
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Component to handle chunk load errors (white screen fix)
export function ChunkErrorHandler() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const msg = event.message || '';
      if (
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('dynamically imported module') ||
        msg.includes('Failed to fetch dynamically imported module')
      ) {
        console.error('[PWA] Chunk load error - versão desatualizada');
        setHasError(true);
        event.preventDefault();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason?.message || event.reason || '');
      if (
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('dynamically imported module') ||
        msg.includes('Failed to fetch')
      ) {
        console.error('[PWA] Chunk promise rejected - versão desatualizada');
        setHasError(true);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleReload = async () => {
    // Clear all caches
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      } catch (e) {
        console.warn('Erro ao limpar cache:', e);
      }
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      } catch (e) {
        console.warn('Erro ao desregistrar SW:', e);
      }
    }

    // Hard reload
    window.location.reload();
  };

  if (!hasError) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Atualização Necessária
          </h2>
          <p className="text-muted-foreground">
            Uma nova versão do app está disponível. Recarregue para continuar.
          </p>
        </div>
        <Button onClick={handleReload} size="lg" className="w-full gap-2">
          <RefreshCw className="w-4 h-4" />
          Recarregar App
        </Button>
      </div>
    </div>
  );
}
