# ExerciseDetailModal - Orchestrator Pattern

Modal de detalhes de exercício refatorado seguindo o padrão Orchestrator.

## Estrutura

```
exercise-detail/
├── index.tsx                    # Orchestrator (~180 linhas)
├── hooks/
│   ├── useExerciseDetailLogic.ts  # Lógica de navegação entre steps
│   └── useExerciseFeedback.ts     # Lógica de feedback de dificuldade
├── ExerciseOverview.tsx         # Visão geral com vídeo/imagem
├── ExerciseInstructions.tsx     # Instruções detalhadas
├── ExerciseExecution.tsx        # Tela de execução com timer
├── DifficultyFeedback.tsx       # Feedback de dificuldade
├── VideoBlock.tsx               # Bloco de vídeo reutilizável
└── README.md
```

## Uso

```tsx
import { ExerciseDetailModal } from '@/components/exercise/exercise-detail';

<ExerciseDetailModal
  isOpen={isOpen}
  onClose={handleClose}
  exerciseData={exercise}
  location="casa"
/>
```

## Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| isOpen | boolean | Controla visibilidade do modal |
| onClose | () => void | Callback ao fechar |
| exerciseData | any | Dados do exercício |
| location | 'casa' \| 'academia' | Local do exercício |

## Steps

1. **Overview**: Visão geral com vídeo, stats e botões
2. **Instructions**: Passo a passo e dicas do personal
3. **Execution**: Timer, séries e feedback

## Refatoração

- Original: 698 linhas (arquivo único)
- Refatorado: ~180 linhas orchestrator + componentes focados
- Benefício: Melhor manutenibilidade e testabilidade
