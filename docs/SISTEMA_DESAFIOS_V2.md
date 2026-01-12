# 🎮 Sistema de Desafios V2 - Documentação

## Visão Geral

Sistema de desafios completamente reimaginado com gamificação avançada, incluindo:

- **Jornadas Épicas** - Desafios com mapa visual e checkpoints
- **Sistema de Ligas** - Competição semanal (Bronze → Diamante)
- **Duelos 1v1** - Competição direta entre usuários
- **Times/Clãs** - Desafios coletivos
- **Power-ups** - Itens que ajudam nos desafios
- **Eventos Sazonais** - Desafios temáticos com recompensas exclusivas
- **Desafios Relâmpago** - Desafios de curta duração com bônus

## Estrutura de Arquivos

```
src/
├── types/
│   └── challenges-v2.ts          # Tipos TypeScript
├── hooks/
│   └── challenges/
│       └── useChallengesV2.ts    # Hooks React Query
├── components/
│   └── challenges-v2/
│       ├── index.ts              # Exports
│       ├── ChallengesPageV2.tsx  # Página principal
│       ├── ChallengesDashboard.tsx
│       ├── journey/
│       │   ├── JourneyCard.tsx
│       │   └── JourneyMap.tsx
│       ├── individual/
│       │   ├── IndividualChallengeCard.tsx
│       │   └── ChallengeProgressModal.tsx
│       ├── flash/
│       │   └── FlashChallengeBanner.tsx
│       ├── duels/
│       │   ├── DuelCard.tsx
│       │   ├── CreateDuelModal.tsx
│       │   └── DuelVsDisplay.tsx
│       ├── leagues/
│       │   ├── LeagueCard.tsx
│       │   ├── LeagueRanking.tsx
│       │   └── LeagueBadge.tsx
│       ├── teams/
│       │   ├── TeamCard.tsx
│       │   └── CreateTeamModal.tsx
│       ├── events/
│       │   ├── SeasonalEventBanner.tsx
│       │   └── EventChallengeList.tsx
│       ├── powerups/
│       │   ├── PowerupInventory.tsx
│       │   └── PowerupCard.tsx
│       └── achievements/
│           ├── AchievementCard.tsx
│           └── RecentAchievements.tsx
└── pages/
    └── ChallengesV2Page.tsx

supabase/
└── migrations/
    └── 20260111200000_challenges_system_v2.sql
```

## Banco de Dados

### Novas Tabelas

| Tabela | Descrição |
|--------|-----------|
| `user_leagues` | Sistema de ligas semanais |
| `challenge_duels` | Duelos 1v1 |
| `challenge_teams` | Times/Clãs |
| `challenge_team_members` | Membros dos times |
| `team_challenges` | Desafios de time |
| `user_powerups` | Power-ups do usuário |
| `seasonal_events` | Eventos sazonais |
| `event_participations` | Participação em eventos |
| `flash_challenges` | Desafios relâmpago |
| `challenge_journeys` | Jornadas épicas |
| `user_achievements_v2` | Conquistas expandidas |

### Colunas Adicionadas

- `challenges.challenge_mode` - Tipo de desafio
- `challenges.combo_enabled` - Se combo está ativo
- `challenge_participations.combo_multiplier` - Multiplicador atual
- `challenge_participations.journey_checkpoint` - Checkpoint da jornada

## Rotas

| Rota | Descrição |
|------|-----------|
| `/desafios` | Página principal de desafios V2 |
| `/challenges` | Alias para desafios V2 |
| `/challenges/:id` | Detalhes do desafio (legado) |

## Uso

### Importar Componentes

```typescript
import { 
  ChallengesPageV2,
  JourneyCard,
  DuelCard,
  LeagueCard,
  // ...
} from '@/components/challenges-v2';
```

### Usar Hooks

```typescript
import {
  useIndividualChallenges,
  useMyParticipations,
  useFlashChallenges,
  useMyDuels,
  useUserLeague,
  useMyTeams,
  useActiveEvents,
  useMyPowerups,
} from '@/hooks/challenges/useChallengesV2';
```

## Sistema de Combo

O combo aumenta o XP ganho baseado em dias consecutivos:

| Dias | Multiplicador |
|------|---------------|
| 1 | 1.0x |
| 2 | 1.25x |
| 3 | 1.5x |
| 4 | 1.75x |
| 5 | 2.0x |
| 6 | 2.25x |
| 7 | 2.5x |
| 8+ | 3.0x (máximo) |

## Sistema de Ligas

| Liga | XP para Promoção | XP para Rebaixamento |
|------|------------------|----------------------|
| Bronze | 500 | - |
| Prata | 1000 | 200 |
| Ouro | 2000 | 500 |
| Diamante | 5000 | 1000 |
| Mestre | ∞ | 2500 |

## Power-ups Disponíveis

| Power-up | Efeito | Custo |
|----------|--------|-------|
| 🛡️ Escudo | Protege streak por 1 dia | 100 coins |
| ⏰ +2 Horas | Estende prazo do desafio | 75 coins |
| ✨ 2x XP | Dobra XP do próximo desafio | 150 coins |
| ⏭️ Pular Dia | Pula 1 dia sem perder progresso | 200 coins |
| ❄️ Congelar Combo | Mantém multiplicador por 24h | 125 coins |

## Migração

Para aplicar as mudanças no banco:

```bash
# Via Supabase CLI
supabase db push

# Ou executar manualmente o SQL
# supabase/migrations/20260111200000_challenges_system_v2.sql
```

## Próximos Passos

1. [ ] Implementar notificações push para duelos
2. [ ] Adicionar chat de time em tempo real
3. [ ] Sistema de conquistas automáticas
4. [ ] Integração com Google Fit para passos
5. [ ] Loja de power-ups
6. [ ] Eventos sazonais automáticos

---

*Última atualização: Janeiro 2026*
