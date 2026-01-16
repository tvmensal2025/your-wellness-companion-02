# SavedProgramView - Orchestrator Pattern

Visualização de programa de treino salvo, refatorado seguindo o padrão Orchestrator.

## Estrutura

```
saved-program/
├── index.tsx                    # Orchestrator (~150 linhas)
├── hooks/
│   └── useSavedProgramLogic.ts  # Lógica de programas e seleção de dias
├── ProgramHeader.tsx            # Cabeçalho com título e ações
├── ProgramDayList.tsx           # Lista de dias da semana
├── ProgramExerciseList.tsx      # Lista de exercícios do dia
├── RestDayCard.tsx              # Card para dia de descanso
├── WorkoutDayCard.tsx           # Card para dia de treino
├── LimitationWarning.tsx        # Aviso de limitação física
└── README.md
```

## Uso

```tsx
import { SavedProgramView } from '@/components/exercise/saved-program';

<SavedProgramView
  program={savedProgram}
  onStartWorkout={handleStartWorkout}
  onCompleteWorkout={handleComplete}
  onExerciseClick={handleExerciseClick}
/>
```

## Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| program | SavedProgram | Dados do programa salvo |
| onStartWorkout | (week, activities, exercises) => void | Callback ao iniciar treino |
| onCompleteWorkout | () => void | Callback ao completar treino |
| onExerciseClick | (exercise) => void | Callback ao clicar em exercício |

## Refatoração

- Original: 638 linhas (arquivo único)
- Refatorado: ~150 linhas orchestrator + componentes focados
- Benefício: Melhor manutenibilidade e testabilidade
