# UnifiedTimer

Timer unificado para exercícios com múltiplas variantes de exibição.

## Estrutura

```
unified-timer/
├── index.tsx                    # Orchestrator (~180 linhas)
├── hooks/
│   ├── useTimerLogic.ts         # Timer state and countdown logic
│   └── useTimerSound.ts         # Audio and vibration
├── TimerDisplay.tsx             # Time display with progress ring
├── TimerControls.tsx            # Control buttons
├── TimerPresets.tsx             # Preset time buttons
├── MotivationalMessage.tsx      # Motivational messages
└── README.md                    # Documentation
```

## Variantes

O timer suporta 4 variantes de exibição:

| Variante | Descrição | Uso |
|----------|-----------|-----|
| `full` | Card completo com todas as funcionalidades | Tela de descanso principal |
| `compact` | Inline horizontal compacto | Dentro de cards de exercício |
| `inline` | Card compacto com progress ring | Modais de exercício |
| `mini` | Botão simples com contador | Listas de exercícios |

## Props

```typescript
interface UnifiedTimerProps {
  // Timer básico
  seconds?: number;              // Segundos iniciais
  defaultSeconds?: number;       // Segundos padrão (60)
  onComplete?: () => void;       // Callback ao completar
  onSkip?: () => void;           // Callback ao pular
  autoStart?: boolean;           // Iniciar automaticamente
  className?: string;            // Classes CSS adicionais
  
  // Variações de layout
  variant?: 'full' | 'compact' | 'inline' | 'mini';
  
  // Funcionalidades
  showSkip?: boolean;            // Mostrar botão pular
  showAdjustments?: boolean;     // Mostrar +/- tempo
  showPresets?: boolean;         // Mostrar presets (30s, 60s, etc)
  showMotivation?: boolean;      // Mostrar mensagem motivacional
  showProgress?: boolean;        // Mostrar anel de progresso
  
  // Som e vibração
  soundEnabled?: boolean;        // Som habilitado
  onCountdownBeep?: () => void;  // Beep customizado countdown
  onFinishBeep?: () => void;     // Beep customizado finalização
  
  // Contexto do exercício
  nextExerciseName?: string;     // Nome do próximo exercício
  nextSetNumber?: number;        // Número da próxima série
  totalSets?: number;            // Total de séries
  
  // Controle externo de som
  externalSoundEnabled?: boolean;
}
```

## Uso

```tsx
import { UnifiedTimer, RestTimer, InlineRestTimer, CompactTimer, MiniTimer } from '@/components/exercise/unified-timer';

// Variante full (padrão)
<UnifiedTimer 
  seconds={60} 
  onComplete={() => console.log('Done!')} 
/>

// Variante compact
<UnifiedTimer variant="compact" seconds={30} />

// Usando aliases de compatibilidade
<RestTimer seconds={60} />        // = variant="full"
<InlineRestTimer seconds={45} />  // = variant="inline"
<CompactTimer seconds={30} />     // = variant="compact"
<MiniTimer seconds={15} />        // = variant="mini"
```

## Hooks

### useTimerLogic

Gerencia estado e lógica do timer:

```typescript
const {
  seconds,           // Segundos restantes
  isRunning,         // Timer está rodando
  progress,          // Progresso (0-100)
  isLow,             // Últimos 3 segundos
  isComplete,        // Timer completou
  toggleTimer,       // Play/Pause
  resetTimer,        // Reset
  adjustTime,        // Ajustar tempo (+/- delta)
  setPreset,         // Definir preset
  formatTime,        // Formatar tempo (mm:ss)
} = useTimerLogic({ initialSeconds: 60, onComplete, autoStart });
```

### useTimerSound

Gerencia sons e vibração:

```typescript
const {
  soundEnabled,      // Som habilitado
  toggleSound,       // Alternar som
  playCountdownBeep, // Beep de countdown
  playFinishBeep,    // Beep de finalização
  vibrate,           // Vibrar dispositivo
} = useTimerSound({ enabled: true, onCountdownBeep, onFinishBeep });
```

## Exports de Compatibilidade

Para manter compatibilidade com código existente:

- `RestTimer` → `UnifiedTimer` com `variant="full"`
- `InlineRestTimer` → `UnifiedTimer` com `variant="inline"`
- `CompactTimer` → `UnifiedTimer` com `variant="compact"`
- `MiniTimer` → `UnifiedTimer` com `variant="mini"`

## Refatoração

Este módulo foi refatorado do arquivo original `UnifiedTimer.tsx` (775 linhas) para uma estrutura modular com orchestrator de ~180 linhas.

**Antes:** 1 arquivo com 775 linhas
**Depois:** 7 arquivos com responsabilidades separadas

### Benefícios

1. **Manutenibilidade**: Cada arquivo tem responsabilidade única
2. **Testabilidade**: Hooks podem ser testados isoladamente
3. **Reutilização**: Componentes podem ser usados em outros contextos
4. **Expansibilidade**: Fácil adicionar novas variantes ou funcionalidades
