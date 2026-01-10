// ✅ OTIMIZADO: Agora usa UnifiedTimer (elimina duplicação de código)
import { UnifiedTimer } from './UnifiedTimer';
import type { UnifiedTimerProps } from './UnifiedTimer';

// ✅ COMPATIBILIDADE: Mantém interface original, mas usa UnifiedTimer internamente
interface RestTimerProps extends Omit<UnifiedTimerProps, 'variant'> {
  compact?: boolean; // Mapeia para variant
}

export const RestTimer: React.FC<RestTimerProps> = ({ 
  compact = false, 
  ...props 
}) => {
  return (
    <UnifiedTimer 
      {...props} 
      variant={compact ? 'compact' : 'full'} 
    />
  );
};

// Mantém MiniRestTimer para compatibilidade
export const MiniRestTimer: React.FC<{
  seconds: number;
  onComplete?: () => void;
  autoStart?: boolean;
}> = ({ seconds, onComplete, autoStart = false }) => {
  return (
    <UnifiedTimer
      seconds={seconds}
      onComplete={onComplete}
      autoStart={autoStart}
      variant="mini"
    />
  );
};