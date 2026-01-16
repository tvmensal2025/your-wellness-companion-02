# Exercise Challenge Card

Sistema de desafios X1 entre usuários que se seguem na comunidade.

## Estrutura

```
exercise-challenge/
├── index.tsx                    # Orchestrator (~180 linhas)
├── hooks/
│   └── useChallengeLogic.ts     # Lógica de desafios e handlers
├── constants.ts                 # EXERCISE_OPTIONS, CHALLENGE_TYPES
├── ChallengeHeader.tsx          # Cabeçalho com status badge
├── OpponentSelector.tsx         # Dialog para selecionar oponente
├── ChallengeProgress.tsx        # Progresso comparativo
├── ChallengeActions.tsx         # Botões de ação (aceitar, recusar, etc.)
├── ActiveChallengeView.tsx      # Visualização do desafio ativo
├── CreateChallengeDialog.tsx    # Dialog para criar desafio
└── README.md                    # Esta documentação
```

## Uso

```tsx
import { ExerciseChallengeCard } from '@/components/exercise/exercise-challenge';

<ExerciseChallengeCard 
  userId={userId}
  className="my-4"
/>
```

## Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `userId` | `string?` | ID do usuário atual |
| `className` | `string?` | Classes CSS adicionais |

## Funcionalidades

1. **Criar Desafio**: Seleciona oponente da lista de seguidos e configura exercício
2. **Aceitar/Recusar**: Responde a desafios recebidos
3. **Progresso**: Atualiza progresso durante desafio ativo
4. **Histórico**: Visualiza desafios completados

## Tipos de Desafio

- `max_reps`: Máximo de repetições em tempo fixo
- `first_to`: Primeiro a atingir meta
- `timed`: Tempo fixo para completar

## Hooks

### useChallengeLogic

Hook principal que gerencia:
- Estado dos modais
- Seleção de usuário e exercício
- Handlers para criar, aceitar, recusar, iniciar, atualizar e completar desafios

## Dependências

- `@/hooks/exercise/useFollowingWithStats` - Lista de seguidos
- `@/hooks/exercise/useExerciseChallenges` - API de desafios
