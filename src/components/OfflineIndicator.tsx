import React from 'react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineIndicatorProps {
  className?: string;
  showSlowConnection?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  showSlowConnection = true,
}) => {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  const showIndicator = !isOnline || (showSlowConnection && isSlowConnection);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed top-0 left-0 right-0 z-50 safe-area-top',
            className
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium',
              !isOnline
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-warning text-warning-foreground'
            )}
          >
            {!isOnline ? (
              <>
                <WifiOff className="h-4 w-4" />
                <span>Sem conexão com a internet</span>
              </>
            ) : isSlowConnection ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>Conexão lenta detectada</span>
              </>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Compact version for embedding in headers
export const OfflineIndicatorCompact: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  if (isOnline && !isSlowConnection) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full p-1.5',
        !isOnline ? 'bg-destructive/20' : 'bg-warning/20',
        className
      )}
      title={!isOnline ? 'Sem conexão' : 'Conexão lenta'}
    >
      {!isOnline ? (
        <WifiOff className="h-4 w-4 text-destructive" />
      ) : (
        <Wifi className="h-4 w-4 text-warning" />
      )}
    </div>
  );
};

export default OfflineIndicator;
