// ✅ OTIMIZADO: Agora usa UnifiedTimer (elimina duplicação de código)
import { UnifiedTimer } from './UnifiedTimer';
import type { UnifiedTimerProps } from './UnifiedTimer';

// ✅ COMPATIBILIDADE: Mantém interface original, mas usa UnifiedTimer internamente
interface InlineRestTimerProps extends Omit<UnifiedTimerProps, 'variant'> {
  // Props específicas do InlineRestTimer (mapeadas para UnifiedTimer)
  nextSetNumber?: number;
  totalSets?: number;
}

export const InlineRestTimer: React.FC<InlineRestTimerProps> = (props) => {
  return (
    <UnifiedTimer 
      {...props} 
      variant="inline"
      autoStart={props.autoStart ?? true} // InlineRestTimer tinha autoStart=true por padrão
    />
  );
};

export default InlineRestTimer;