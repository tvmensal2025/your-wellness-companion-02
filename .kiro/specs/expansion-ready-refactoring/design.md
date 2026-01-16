# Documento de Design

## Visão Geral

Este documento descreve a arquitetura e abordagem técnica para refatorar as áreas de MealPlan e Exercise do MaxNutrition, preparando-as para expansão massiva de conteúdo. A refatoração segue o padrão Orchestrator já estabelecido no projeto.

### Princípios de Design

1. **Padrão Orchestrator**: Componente principal coordena sub-componentes, sem lógica de negócio
2. **Hooks Extraídos**: Toda lógica de estado e efeitos em custom hooks dedicados
3. **Sub-componentes Focados**: Cada sub-componente com responsabilidade única
4. **Compatibilidade**: Manter APIs públicas existentes sem breaking changes
5. **Expansibilidade**: Estrutura preparada para adicionar novos layouts/tipos facilmente

### Escopo da Refatoração

| Área | Componentes | Linhas Atuais | Meta |
|------|-------------|---------------|------|
| MealPlan | 4 | 2.670 | <300 cada |
| Exercise | 5 | 3.488 | <300 cada |
| **Total** | **9** | **6.158** | **<2.700** |

## Arquitetura

### Estrutura de Pastas Proposta

```
src/components/
├── meal-plan/
│   ├── compact-meal-plan/           # CompactMealPlanModal refatorado
│   │   ├── index.tsx                # Orchestrator (~150 linhas)
│   │   ├── hooks/
│   │   │   └── useCompactMealPlanLogic.ts
│   │   ├── MealCard.tsx
│   │   ├── MacrosDisplay.tsx
│   │   ├── MealNavigation.tsx
│   │   ├── PrintButton.tsx
│   │   └── README.md
│   │
│   ├── weekly-meal-plan/            # WeeklyMealPlanModal refatorado
│   │   ├── index.tsx                # Orchestrator (~120 linhas)
│   │   ├── hooks/
│   │   │   └── useWeeklyPlanLogic.ts
│   │   ├── DaySelector.tsx
│   │   ├── WeeklyOverview.tsx
│   │   ├── CircularProgress.tsx
│   │   └── README.md
│   │
│   ├── chef-kitchen/                # ChefKitchenMealPlan refatorado
│   │   ├── index.tsx                # Orchestrator (~120 linhas)
│   │   ├── hooks/
│   │   │   └── useChefKitchenLogic.ts
│   │   ├── KitchenHeader.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── CookingAnimation.tsx
│   │   └── README.md
│   │
│   └── daily-meal-plan/             # DailyMealPlanModal refatorado
│       ├── index.tsx                # Orchestrator (~100 linhas)
│       ├── hooks/
│       │   └── useDailyPlanLogic.ts
│       ├── DailyMealList.tsx
│       ├── DailyTotals.tsx
│       └── README.md
│
└── exercise/
    ├── unified-timer/               # UnifiedTimer refatorado
    │   ├── index.tsx                # Orchestrator (~180 linhas)
    │   ├── hooks/
    │   │   ├── useTimerLogic.ts
    │   │   └── useTimerSound.ts
    │   ├── TimerDisplay.tsx
    │   ├── TimerControls.tsx
    │   ├── TimerPresets.tsx
    │   ├── MotivationalMessage.tsx
    │   └── README.md
    │
    ├── exercise-challenge/          # ExerciseChallengeCard refatorado
    │   ├── index.tsx                # Orchestrator (~180 linhas)
    │   ├── hooks/
    │   │   └── useChallengeLogic.ts
    │   ├── ChallengeHeader.tsx
    │   ├── OpponentSelector.tsx
    │   ├── ChallengeProgress.tsx
    │   ├── ChallengeActions.tsx
    │   └── README.md
    │
    ├── exercise-detail/             # ExerciseDetailModal refatorado
    │   ├── index.tsx                # Orchestrator (~180 linhas)
    │   ├── hooks/
    │   │   ├── useExerciseDetailLogic.ts
    │   │   └── useExerciseFeedback.ts
    │   ├── ExerciseOverview.tsx
    │   ├── ExerciseInstructions.tsx
    │   ├── ExerciseExecution.tsx
    │   ├── DifficultyFeedback.tsx
    │   └── README.md
    │
    ├── saved-program/               # SavedProgramView refatorado
    │   ├── index.tsx                # Orchestrator (~150 linhas)
    │   ├── hooks/
    │   │   └── useSavedProgramLogic.ts
    │   ├── ProgramHeader.tsx
    │   ├── ProgramDayList.tsx
    │   ├── ProgramExerciseList.tsx
    │   └── README.md
    │
    └── buddy-workout/               # BuddyWorkoutCard refatorado
        ├── index.tsx                # Orchestrator (~120 linhas)
        ├── hooks/
        │   └── useBuddyWorkoutLogic.ts
        ├── BuddySelector.tsx
        ├── BuddyProgress.tsx
        ├── BuddyActions.tsx
        └── README.md
```

## Componentes e Interfaces

### Padrão de Refatoração Orchestrator

Para cada componente grande, seguiremos este padrão:

```typescript
// ANTES: ComponenteGrande.tsx (700+ linhas)
// DEPOIS: componente-grande/index.tsx + sub-componentes

// 1. Extrair tipos para arquivo de tipos ou inline
// src/components/area/componente-grande/types.ts (opcional)
export interface ComponenteGrandeProps {
  // props tipadas
}

// 2. Extrair lógica para custom hook
// src/components/area/componente-grande/hooks/useComponenteLogic.ts
export const useComponenteLogic = (props: ComponenteGrandeProps) => {
  const [state, setState] = useState<StateType>(initialState);
  
  const handleAction = useCallback(() => {
    // lógica
  }, [dependencies]);
  
  return { state, handleAction, /* outros valores */ };
};

// 3. Criar sub-componentes focados
// src/components/area/componente-grande/SubComponente.tsx
interface SubComponenteProps {
  // props específicas
}

export const SubComponente: React.FC<SubComponenteProps> = ({ prop1, prop2 }) => {
  return (
    <div className="bg-background text-foreground">
      {/* apenas renderização */}
    </div>
  );
};

// 4. Orchestrator coordena tudo
// src/components/area/componente-grande/index.tsx
export const ComponenteGrande: React.FC<ComponenteGrandeProps> = (props) => {
  const logic = useComponenteLogic(props);
  
  return (
    <Dialog>
      <SubComponente1 {...logic.sub1Props} />
      <SubComponente2 {...logic.sub2Props} />
    </Dialog>
  );
};

// Re-export para compatibilidade
export { ComponenteGrande as ComponenteGrandeModal };
```

### Interface de Tipos para MealPlan

```typescript
// src/types/meal-plan.ts

export interface Meal {
  title: string;
  description: string;
  preparo?: string;
  modoPreparoElegante?: string;
  ingredients: string[];
  practicalSuggestion?: string;
  macros: MacroNutrients;
}

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface DayPlan {
  day: number;
  dailyTotals?: MacroNutrients & { fiber: number };
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    snack?: Meal;
    dinner?: Meal;
    supper?: Meal;
  };
}

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'supper';

export interface MealConfig {
  emoji: string;
  label: string;
  shortLabel: string;
  gradient: string;
  bgGradient: string;
  accentColor: string;
  borderColor: string;
  time: string;
}

// Hook return types
export interface CompactMealPlanLogic {
  currentMealIndex: number;
  setCurrentMealIndex: (index: number) => void;
  availableMeals: Array<{ key: MealType; meal: Meal }>;
  currentMeal: Meal | null;
  currentMealConfig: MealConfig | null;
  handlePrint: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
}

export interface WeeklyPlanLogic {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  selectedDayPlan: DayPlan | null;
  weeklyTotals: MacroNutrients;
  showDayDetail: boolean;
  setShowDayDetail: (show: boolean) => void;
}
```

### Interface de Tipos para Exercise

```typescript
// src/types/exercise-components.ts

// UnifiedTimer types
export type TimerVariant = 'full' | 'compact' | 'inline' | 'mini';

export interface UnifiedTimerProps {
  seconds?: number;
  defaultSeconds?: number;
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  className?: string;
  variant?: TimerVariant;
  showSkip?: boolean;
  showAdjustments?: boolean;
  showPresets?: boolean;
  showMotivation?: boolean;
  showProgress?: boolean;
  soundEnabled?: boolean;
  onCountdownBeep?: () => void;
  onFinishBeep?: () => void;
  nextExerciseName?: string;
  nextSetNumber?: number;
  totalSets?: number;
  externalSoundEnabled?: boolean;
}

export interface TimerLogic {
  seconds: number;
  isRunning: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  adjustTime: (delta: number) => void;
  setPreset: (seconds: number) => void;
}

export interface TimerSoundLogic {
  soundEnabled: boolean;
  toggleSound: () => void;
  playCountdownBeep: () => void;
  playFinishBeep: () => void;
}

// ExerciseChallenge types
export interface ChallengeExercise {
  value: string;
  label: string;
  emoji: string;
}

export interface ChallengeType {
  value: string;
  label: string;
  description: string;
}

export interface ChallengeLogic {
  selectedExercise: string;
  setSelectedExercise: (exercise: string) => void;
  selectedOpponent: string | null;
  setSelectedOpponent: (opponent: string | null) => void;
  challengeType: string;
  setChallengeType: (type: string) => void;
  targetReps: number;
  setTargetReps: (reps: number) => void;
  isCreating: boolean;
  createChallenge: () => Promise<void>;
  acceptChallenge: (challengeId: string) => Promise<void>;
  declineChallenge: (challengeId: string) => Promise<void>;
}

// ExerciseDetail types
export type ExerciseStep = 'overview' | 'instructions' | 'execution';

export interface ExerciseDetailLogic {
  currentStep: ExerciseStep;
  setCurrentStep: (step: ExerciseStep) => void;
  timerSeconds: number;
  isTimerRunning: boolean;
  currentSet: number;
  totalSets: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  nextSet: () => void;
  previousSet: () => void;
}

export interface ExerciseFeedbackLogic {
  userFeedback: 'facil' | 'medio' | 'dificil' | null;
  feedbackSaving: boolean;
  saveFeedback: (feedback: 'facil' | 'medio' | 'dificil') => Promise<void>;
}

// SavedProgram types
export interface SavedProgramLogic {
  selectedDay: number | null;
  setSelectedDay: (day: number | null) => void;
  expandedExercise: string | null;
  setExpandedExercise: (id: string | null) => void;
  isEditing: boolean;
  toggleEditing: () => void;
}

// BuddyWorkout types
export interface BuddyWorkoutLogic {
  selectedBuddy: string | null;
  setSelectedBuddy: (buddyId: string | null) => void;
  workoutStatus: 'idle' | 'inviting' | 'waiting' | 'active' | 'completed';
  sendInvite: () => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
  completeWorkout: () => Promise<void>;
}
```

## Modelos de Dados

### Estrutura de Hooks Padrão

```typescript
// Padrão para hooks extraídos
// src/components/area/componente/hooks/useComponenteLogic.ts

import { useState, useCallback, useMemo, useEffect } from 'react';

interface UseComponenteLogicProps {
  // props necessárias
  initialValue?: number;
  onComplete?: () => void;
}

interface UseComponenteLogicReturn {
  // valores de estado
  value: number;
  isActive: boolean;
  
  // handlers
  handleAction: () => void;
  handleReset: () => void;
  
  // valores computados
  computedValue: number;
}

export const useComponenteLogic = ({
  initialValue = 0,
  onComplete,
}: UseComponenteLogicProps): UseComponenteLogicReturn => {
  // Estado
  const [value, setValue] = useState(initialValue);
  const [isActive, setIsActive] = useState(false);

  // Handlers com useCallback
  const handleAction = useCallback(() => {
    setValue(prev => prev + 1);
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const handleReset = useCallback(() => {
    setValue(initialValue);
    setIsActive(false);
  }, [initialValue]);

  // Valores computados com useMemo
  const computedValue = useMemo(() => {
    return value * 2;
  }, [value]);

  // Efeitos
  useEffect(() => {
    if (value >= 10) {
      setIsActive(true);
    }
  }, [value]);

  return {
    value,
    isActive,
    handleAction,
    handleReset,
    computedValue,
  };
};
```

### Padrão de Sub-componente

```typescript
// Padrão para sub-componentes
// src/components/area/componente/SubComponente.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SubComponenteProps {
  title: string;
  value: number;
  onAction: () => void;
  className?: string;
}

export const SubComponente: React.FC<SubComponenteProps> = ({
  title,
  value,
  onAction,
  className,
}) => {
  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground">{value}</p>
        <Button 
          onClick={onAction}
          className="mt-2"
        >
          Ação
        </Button>
      </CardContent>
    </Card>
  );
};
```

### Padrão de Orchestrator

```typescript
// Padrão para orchestrator
// src/components/area/componente/index.tsx

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Hooks
import { useComponenteLogic } from './hooks/useComponenteLogic';

// Sub-componentes
import { SubComponente1 } from './SubComponente1';
import { SubComponente2 } from './SubComponente2';
import { SubComponente3 } from './SubComponente3';

export interface ComponenteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DataType;
  className?: string;
}

export const Componente: React.FC<ComponenteProps> = ({
  open,
  onOpenChange,
  data,
  className,
}) => {
  const logic = useComponenteLogic({ data });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("bg-background", className)}>
        <SubComponente1 
          title={logic.title}
          onAction={logic.handleAction1}
        />
        
        <SubComponente2 
          items={logic.items}
          selectedIndex={logic.selectedIndex}
          onSelect={logic.handleSelect}
        />
        
        <SubComponente3 
          value={logic.computedValue}
          onComplete={logic.handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
};

// Re-export para compatibilidade com imports existentes
export { Componente as ComponenteModal };
export default Componente;
```



## Propriedades de Corretude

*Uma propriedade é uma característica ou comportamento que deve ser verdadeiro em todas as execuções válidas de um sistema - essencialmente, uma declaração formal sobre o que o sistema deve fazer. Propriedades servem como ponte entre especificações legíveis por humanos e garantias de corretude verificáveis por máquina.*

### Propriedades Derivadas dos Requisitos

Baseado na análise de prework dos critérios de aceitação, as seguintes propriedades foram identificadas:

**Property 1: Orchestrators não excedem 200 linhas**
*Para qualquer* arquivo `index.tsx` nas pastas refatoradas (compact-meal-plan, weekly-meal-plan, chef-kitchen, daily-meal-plan, unified-timer, exercise-challenge, exercise-detail, saved-program, buddy-workout), o número de linhas não deve exceder 200.
**Validates: Requirements 1.7, 2.5, 3.5, 4.4, 5.8, 6.6, 7.7, 8.5, 9.5**

**Property 2: Sub-componentes não excedem 300 linhas**
*Para qualquer* arquivo `.tsx` nas pastas refatoradas (exceto index.tsx), o número de linhas não deve exceder 300.
**Validates: Requirements 10.1**

**Property 3: Hooks seguem padrão de nomenclatura**
*Para qualquer* arquivo em pastas `hooks/` dentro das áreas refatoradas, o nome do arquivo deve seguir o padrão `use[Feature]Logic.ts` ou `use[Feature][Aspect].ts`.
**Validates: Requirements 10.2**

**Property 4: Pastas refatoradas têm README**
*Para qualquer* pasta refatorada (compact-meal-plan, weekly-meal-plan, chef-kitchen, daily-meal-plan, unified-timer, exercise-challenge, exercise-detail, saved-program, buddy-workout), deve existir um arquivo `README.md`.
**Validates: Requirements 10.3, 11.1**

**Property 5: Imports usam @/ alias**
*Para qualquer* arquivo TypeScript/TSX nas pastas refatoradas, imports não devem usar caminhos relativos com mais de um nível (../../), devendo usar o alias @/.
**Validates: Requirements 10.4**

**Property 6: Cores semânticas são usadas**
*Para qualquer* arquivo TypeScript/TSX nas pastas refatoradas, classNames não devem conter cores hardcoded (hex como #ffffff, bg-white, text-black), devendo usar cores semânticas (bg-background, text-foreground, bg-card, etc).
**Validates: Requirements 10.5**

**Property 7: TypeScript compila sem erros**
*Para qualquer* arquivo TypeScript/TSX nas pastas refatoradas, a execução de `tsc --noEmit` deve completar sem erros de compilação.
**Validates: Requirements 10.7**

**Property 8: ESLint sem warnings críticos**
*Para qualquer* arquivo TypeScript/TSX nas pastas refatoradas, a execução do ESLint não deve retornar warnings das regras: react-hooks/exhaustive-deps, no-empty, prefer-const.
**Validates: Requirements 10.8**

## Tratamento de Erros

### Padrão de Tratamento de Erros em Hooks

```typescript
// Padrão para hooks com operações assíncronas
export const useFeatureLogic = (props: FeatureProps) => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAsyncOperation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await someAsyncOperation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro na operação:', err);
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { error, loading, handleAsyncOperation };
};
```

### Padrão de Tratamento de Erros em Sub-componentes

```typescript
// Sub-componentes devem receber handlers de erro do orchestrator
interface SubComponenteProps {
  onError?: (error: Error) => void;
}

export const SubComponente: React.FC<SubComponenteProps> = ({ onError }) => {
  const handleLocalError = (err: unknown) => {
    const error = err instanceof Error ? err : new Error('Erro desconhecido');
    console.error('SubComponente error:', error);
    onError?.(error);
  };

  return (/* ... */);
};
```

## Estratégia de Testes

### Abordagem Dual de Testes

O refatoramento utilizará duas abordagens complementares:

1. **Testes de Propriedade**: Verificam propriedades universais em todos os arquivos refatorados
2. **Testes Unitários**: Verificam exemplos específicos de estrutura e comportamento

### Configuração de Testes de Propriedade

O projeto usa `vitest` com `fast-check`. Cada teste de propriedade deve:
- Executar no mínimo 100 iterações (quando aplicável)
- Referenciar a propriedade do documento de design
- Usar o formato de tag: **Feature: expansion-ready-refactoring, Property {number}: {property_text}**

### Exemplos de Testes de Propriedade

```typescript
// src/tests/expansion-refactoring/structure.property.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const REFACTORED_FOLDERS = [
  'src/components/meal-plan/compact-meal-plan',
  'src/components/meal-plan/weekly-meal-plan',
  'src/components/meal-plan/chef-kitchen',
  'src/components/meal-plan/daily-meal-plan',
  'src/components/exercise/unified-timer',
  'src/components/exercise/exercise-challenge',
  'src/components/exercise/exercise-detail',
  'src/components/exercise/saved-program',
  'src/components/exercise/buddy-workout',
];

describe('Expansion Refactoring Properties', () => {
  // Feature: expansion-ready-refactoring, Property 1: Orchestrators não excedem 200 linhas
  it('should have orchestrators with less than 200 lines', () => {
    REFACTORED_FOLDERS.forEach(folder => {
      const indexPath = path.join(folder, 'index.tsx');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf-8');
        const lineCount = content.split('\n').length;
        expect(lineCount).toBeLessThanOrEqual(200);
      }
    });
  });

  // Feature: expansion-ready-refactoring, Property 2: Sub-componentes não excedem 300 linhas
  it('should have sub-components with less than 300 lines', () => {
    REFACTORED_FOLDERS.forEach(folder => {
      if (fs.existsSync(folder)) {
        const files = fs.readdirSync(folder).filter(f => 
          f.endsWith('.tsx') && f !== 'index.tsx'
        );
        files.forEach(file => {
          const filePath = path.join(folder, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const lineCount = content.split('\n').length;
          expect(lineCount).toBeLessThanOrEqual(300);
        });
      }
    });
  });

  // Feature: expansion-ready-refactoring, Property 4: Pastas refatoradas têm README
  it('should have README.md in each refactored folder', () => {
    REFACTORED_FOLDERS.forEach(folder => {
      if (fs.existsSync(folder)) {
        const readmePath = path.join(folder, 'README.md');
        expect(fs.existsSync(readmePath)).toBe(true);
      }
    });
  });

  // Feature: expansion-ready-refactoring, Property 5: Imports usam @/ alias
  it('should not have deep relative imports', () => {
    REFACTORED_FOLDERS.forEach(folder => {
      if (fs.existsSync(folder)) {
        const files = getAllTsxFiles(folder);
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf-8');
          const deepImports = content.match(/from ['"]\.\.\/\.\.\/\.\.\//g);
          expect(deepImports).toBeNull();
        });
      }
    });
  });

  // Feature: expansion-ready-refactoring, Property 6: Cores semânticas são usadas
  it('should use semantic colors instead of hardcoded', () => {
    const hardcodedPatterns = [
      /className="[^"]*bg-white[^"]*"/g,
      /className="[^"]*text-black[^"]*"/g,
      /className="[^"]*bg-\[#[0-9a-fA-F]+\][^"]*"/g,
      /className="[^"]*text-\[#[0-9a-fA-F]+\][^"]*"/g,
    ];
    
    REFACTORED_FOLDERS.forEach(folder => {
      if (fs.existsSync(folder)) {
        const files = getAllTsxFiles(folder);
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf-8');
          hardcodedPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            expect(matches).toBeNull();
          });
        });
      }
    });
  });
});

function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllTsxFiles(fullPath));
    } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}
```

### Scripts de Validação

```bash
# scripts/validate-expansion-refactoring.sh

#!/bin/bash

echo "🔍 Validando refatoração de expansão..."

FOLDERS=(
  "src/components/meal-plan/compact-meal-plan"
  "src/components/meal-plan/weekly-meal-plan"
  "src/components/meal-plan/chef-kitchen"
  "src/components/meal-plan/daily-meal-plan"
  "src/components/exercise/unified-timer"
  "src/components/exercise/exercise-challenge"
  "src/components/exercise/exercise-detail"
  "src/components/exercise/saved-program"
  "src/components/exercise/buddy-workout"
)

# Property 1: Orchestrators <= 200 linhas
echo "Verificando orchestrators..."
for folder in "${FOLDERS[@]}"; do
  if [ -f "$folder/index.tsx" ]; then
    lines=$(wc -l < "$folder/index.tsx")
    if [ "$lines" -gt 200 ]; then
      echo "❌ $folder/index.tsx tem $lines linhas (máximo 200)"
      exit 1
    fi
  fi
done

# Property 2: Sub-componentes <= 300 linhas
echo "Verificando sub-componentes..."
for folder in "${FOLDERS[@]}"; do
  if [ -d "$folder" ]; then
    find "$folder" -name "*.tsx" ! -name "index.tsx" -exec sh -c '
      lines=$(wc -l < "$1")
      if [ "$lines" -gt 300 ]; then
        echo "❌ $1 tem $lines linhas (máximo 300)"
        exit 1
      fi
    ' _ {} \;
  fi
done

# Property 4: README existe
echo "Verificando READMEs..."
for folder in "${FOLDERS[@]}"; do
  if [ -d "$folder" ] && [ ! -f "$folder/README.md" ]; then
    echo "❌ $folder não tem README.md"
    exit 1
  fi
done

# Property 7: TypeScript compila
echo "Verificando TypeScript..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript encontrou erros"
  exit 1
fi

# Property 8: ESLint
echo "Verificando ESLint..."
for folder in "${FOLDERS[@]}"; do
  if [ -d "$folder" ]; then
    npx eslint "$folder" --ext .ts,.tsx --quiet
    if [ $? -ne 0 ]; then
      echo "❌ ESLint encontrou erros em $folder"
      exit 1
    fi
  fi
done

echo "✅ Todas as validações passaram!"
```

### Testes Unitários para Estrutura

```typescript
// src/tests/expansion-refactoring/structure.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';

describe('MealPlan Refactoring Structure', () => {
  it('should have compact-meal-plan folder with expected files', () => {
    const folder = 'src/components/meal-plan/compact-meal-plan';
    expect(fs.existsSync(folder)).toBe(true);
    expect(fs.existsSync(`${folder}/index.tsx`)).toBe(true);
    expect(fs.existsSync(`${folder}/hooks/useCompactMealPlanLogic.ts`)).toBe(true);
    expect(fs.existsSync(`${folder}/MealCard.tsx`)).toBe(true);
    expect(fs.existsSync(`${folder}/README.md`)).toBe(true);
  });

  it('should have weekly-meal-plan folder with expected files', () => {
    const folder = 'src/components/meal-plan/weekly-meal-plan';
    expect(fs.existsSync(folder)).toBe(true);
    expect(fs.existsSync(`${folder}/index.tsx`)).toBe(true);
    expect(fs.existsSync(`${folder}/hooks/useWeeklyPlanLogic.ts`)).toBe(true);
    expect(fs.existsSync(`${folder}/README.md`)).toBe(true);
  });
});

describe('Exercise Refactoring Structure', () => {
  it('should have unified-timer folder with expected files', () => {
    const folder = 'src/components/exercise/unified-timer';
    expect(fs.existsSync(folder)).toBe(true);
    expect(fs.existsSync(`${folder}/index.tsx`)).toBe(true);
    expect(fs.existsSync(`${folder}/hooks/useTimerLogic.ts`)).toBe(true);
    expect(fs.existsSync(`${folder}/hooks/useTimerSound.ts`)).toBe(true);
    expect(fs.existsSync(`${folder}/README.md`)).toBe(true);
  });

  it('should have exercise-challenge folder with expected files', () => {
    const folder = 'src/components/exercise/exercise-challenge';
    expect(fs.existsSync(folder)).toBe(true);
    expect(fs.existsSync(`${folder}/index.tsx`)).toBe(true);
    expect(fs.existsSync(`${folder}/hooks/useChallengeLogic.ts`)).toBe(true);
    expect(fs.existsSync(`${folder}/README.md`)).toBe(true);
  });
});
```

