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

// Padrões de erro de chunk/cache que causam tela branca
const CHUNK_ERROR_PATTERNS = [
  'ChunkLoadError',
  'Loading chunk',
  'dynamically imported module',
  'Failed to fetch dynamically imported module',
  'Failed to fetch',
  'Importing a module script failed',
  'NetworkError when attempting to fetch',
  'Load failed',
  'error loading dynamically imported module',
  'Unable to preload CSS',
  'Loading CSS chunk',
  'Unexpected token \'<\'' // HTML retornado em vez de JS
];

function isChunkError(message: string): boolean {
  if (!message) return false;
  const lowerMsg = message.toLowerCase();
  return CHUNK_ERROR_PATTERNS.some(pattern => 
    lowerMsg.includes(pattern.toLowerCase())
  );
}

// Component to handle chunk load errors (white screen fix)
export function ChunkErrorHandler() {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Verificar se houve erro de chunk na sessão anterior
    const lastChunkError = sessionStorage.getItem('chunk_error_recovery');
    if (lastChunkError) {
      console.log('[PWA] Recuperação de erro de chunk detectada');
      sessionStorage.removeItem('chunk_error_recovery');
    }

    const handleError = (event: ErrorEvent) => {
      const msg = event.message || '';
      if (isChunkError(msg)) {
        console.error('[PWA] Chunk load error detectado:', msg);
        setErrorMessage(msg);
        setHasError(true);
        event.preventDefault();
        
        // Marcar para auto-recovery
        sessionStorage.setItem('chunk_error_recovery', 'pending');
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason?.message || event.reason || '');
      if (isChunkError(msg)) {
        console.error('[PWA] Chunk promise rejected:', msg);
        setErrorMessage(msg);
        setHasError(true);
        event.preventDefault();
        
        // Marcar para auto-recovery
        sessionStorage.setItem('chunk_error_recovery', 'pending');
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
        console.log('[PWA] Caches limpos:', keys.length);
      } catch (e) {
        console.warn('[PWA] Erro ao limpar cache:', e);
      }
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
        console.log('[PWA] Service workers desregistrados:', registrations.length);
      } catch (e) {
        console.warn('[PWA] Erro ao desregistrar SW:', e);
      }
    }

    // Limpar sessionStorage exceto marcador de recovery
    const recoveryFlag = sessionStorage.getItem('chunk_error_recovery');
    sessionStorage.clear();
    if (recoveryFlag) {
      sessionStorage.setItem('chunk_error_recovery', 'done');
    }

    // Hard reload
    window.location.reload();
  };

  if (!hasError) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Atualização Necessária
          </h2>
          <p className="text-gray-400">
            Uma nova versão do app está disponível. Limpe o cache para continuar usando.
          </p>
        </div>
        <Button 
          onClick={handleReload} 
          size="lg" 
          className="w-full gap-2 py-6 text-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
        >
          <RefreshCw className="w-5 h-5" />
          Limpar Cache e Recarregar
        </Button>
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && errorMessage && (
          <p className="text-xs text-gray-600 break-all mt-4">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
