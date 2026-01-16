# BuddyWorkoutCard - Orchestrator Pattern

Card de parceiro de treino refatorado seguindo o padrão Orchestrator.

## Estrutura

```
buddy-workout/
├── index.tsx                    # Orchestrator (~120 linhas)
├── hooks/
│   └── useBuddyWorkoutLogic.ts  # Lógica de treino em dupla
├── BuddySelector.tsx            # Seleção de parceiro
├── BuddyProgress.tsx            # Progresso comparativo
├── BuddyActions.tsx             # Ações de convite e desafio
├── BuddyStatsModal.tsx          # Modal de estatísticas
├── ProvocationsModal.tsx        # Modal de provocações
├── ChallengesModal.tsx          # Modal de desafios
├── constants.ts                 # Provocações e templates
└── README.md
```

## Uso

```tsx
import { BuddyWorkoutCard } from '@/components/exercise/buddy-workout';

<BuddyWorkoutCard
  userId={userId}
  buddy={buddyData}
  userStats={userStats}
  onFindBuddy={handleFindBuddy}
  onSendProvocation={handleProvocation}
/>
```

## Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| userId | string | ID do usuário |
| buddy | BuddyStats | Dados do parceiro |
| userStats | BuddyStats | Estatísticas do usuário |
| activeChallenge | ActiveChallenge | Desafio ativo |
| onFindBuddy | () => void | Callback para buscar parceiro |
| onSendProvocation | (type, msg) => void | Callback para enviar mensagem |

## Refatoração

- Original: 630 linhas (arquivo único)
- Refatorado: ~120 linhas orchestrator + componentes focados
- Benefício: Melhor manutenibilidade e testabilidade
