/// <reference types="vite-plugin-pwa/client" />
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // Dynamically import to avoid hook ordering issues
    const registerSW = async () => {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        const updateFunction = registerSW({
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onRegistered(registration) {
            console.log('SW Registered:', registration);
          },
          onRegisterError(error) {
            console.error('SW registration error:', error);
          }
        });
        setUpdateSW(() => updateFunction);
      } catch (error) {
        console.debug('PWA registration not available:', error);
      }
    };
    
    registerSW();
  }, []);

  const handleUpdate = useCallback(async () => {
    if (updateSW) {
      await updateSW();
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
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm">
                  Nova versão disponível
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Atualize para obter as últimas melhorias
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-muted rounded-md transition-colors"
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
              >
                Depois
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                className="flex-1 gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Atualizar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
