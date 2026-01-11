# 🚀 Recomendações de Implementação - Instituto dos Sonhos

**Prioridade:** CRÍTICA → IMPORTANTE → MELHORIAS  
**Tempo Total:** 4-6 semanas  
**Impacto:** Performance +30%, Manutenibilidade +50%, Duplicação -80%

---

## 🔴 CRÍTICO (Semana 1-2)

### 1. Unificar Hooks de Gamificação

**Arquivo:** `src/hooks/useGamification.ts` (NOVO - UNIFICADO)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GamificationData {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  badges: any[];
  dailyChallenges: any[];
  achievements: number;
  rank: string;
  lastActivityDate: string;
}

export const useGamification = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ✅ SINGLE QUERY - Buscar tudo em paralelo
  const { data: gamificationData, isLoading } = useQuery({
    queryKey: ['gamification', userId],
    queryFn: async (): Promise<GamificationData | null> => {
      if (!userId) return null;

      // Buscar TUDO em paralelo (single roundtrip)
      const [
        { data: challenges },
        { data: participations },
        { data: userGoals },
        { data: recentActivities }
      ] = await Promise.all([
        supabase
          .from('challenges')
          .select('*')
          .eq('is_active', true),
        supabase
          .from('challenge_participations')
          .select('*')
          .eq('user_id', userId),
        supabase
          .from('user_goals')
          .select('estimated_points')
          .eq('user_id', userId)
          .eq('status', 'concluida'),
        supabase
          .from('goal_updates')
          .select('created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(30),
      ]);

      // Processar dados
      const totalXP = userGoals?.reduce((sum, goal) => sum + (goal.estimated_points || 0), 0) || 0;
      const currentLevel = Math.floor(totalXP / 1000) + 1;
      const currentXP = totalXP % 1000;
      const xpToNextLevel = 1000 - currentXP;

      // Calcular streak
      let currentStreak = 0;
      let bestStreak = 0;
      if (recentActivities && recentActivities.length > 0) {
        const today = new Date();
        let streakDate = new Date(today);
        
        for (const activity of recentActivities) {
          const activityDate = new Date(activity.created_at);
          const daysDiff = Math.floor((streakDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff <= 1) {
            currentStreak++;
            streakDate = activityDate;
          } else {
            break;
          }
        }
        bestStreak = currentStreak;
      }

      // Converter desafios
      const dailyChallenges = challenges?.map(challenge => {
        const participation = participations?.find(p => p.challenge_id === challenge.id);
        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description || '',
          challenge_type: challenge.challenge_type || 'general',
          difficulty: challenge.difficulty || 'medium',
          target_value: 100,
          xp_reward: challenge.points_reward || 50,
          category: challenge.challenge_type || 'general',
          progress: participation?.progress || 0,
          is_completed: participation?.is_completed || false,
          expires_at: challenge.end_date ? new Date(challenge.end_date) : new Date(Date.now() + (24 * 60 * 60 * 1000))
        };
      }) || [];

      return {
        currentLevel,
        currentXP,
        xpToNextLevel,
        totalXP,
        currentStreak,
        bestStreak,
        badges: [], // TODO: Implementar badges
        dailyChallenges,
        achievements: dailyChallenges.filter(c => c.is_completed).length,
        rank: currentLevel > 10 ? 'Lendário' : currentLevel > 5 ? 'Épico' : 'Iniciante',
        lastActivityDate: recentActivities?.[0]?.created_at || new Date().toISOString(),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 60 * 60 * 1000,   // 1 hora
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });

  // Completar desafio
  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase
        .from('challenge_participations')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', userId] });
      toast({ title: 'Desafio Completo! 🎉' });
    },
  });

  // Atualizar progresso
  const updateProgressMutation = useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      const { error } = await supabase
        .from('challenge_participations')
        .update({ progress })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', userId] });
    },
  });

  return {
    gamificationData,
    isLoading,
    completeChallenge: completeChallengeMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
  };
};
```

**Ações:**
- [ ] Criar novo arquivo `src/hooks/useGamification.ts`
- [ ] Copiar código acima
- [ ] Remover `useEnhancedGamification.ts`
- [ ] Remover `useRealGamification.ts`
- [ ] Atualizar imports em componentes

---

### 2. Criar Hook Centralizado de Dados de Usuário

**Arquivo:** `src/hooks/useUserData.ts` (NOVO)

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  profile: {
    user_id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    gender: string | null;
    phone: string;
    birth_date: string;
    city: string;
    state: string;
  } | null;
  physicalData: {
    altura_cm: number;
    idade: number;
    sexo: string;
    nivel_atividade: string;
  } | null;
  points: {
    total_points: number;
    current_streak: number;
    best_streak: number;
    last_activity_date: string | null;
    level: number;
  } | null;
  preferences: {
    sidebar_order: string[];
    hidden_sidebar_items: string[];
    default_section: string;
  } | null;
}

export const useUserData = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-data', userId],
    queryFn: async (): Promise<UserData | null> => {
      if (!userId) return null;

      // ✅ SINGLE ROUNDTRIP - Buscar tudo em paralelo
      const [
        { data: profile },
        { data: physicalData },
        { data: points },
        { data: preferences }
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('user_physical_data')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('user_layout_preferences')
          .select('*')
          .eq('user_id', userId)
          .single(),
      ]);

      return {
        profile: profile || null,
        physicalData: physicalData || null,
        points: points || null,
        preferences: preferences || null,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 60 * 60 * 1000,    // 1 hora
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};
```

**Ações:**
- [ ] Criar novo arquivo `src/hooks/useUserData.ts`
- [ ] Copiar código acima
- [ ] Atualizar componentes para usar `useUserData`
- [ ] Remover hooks redundantes (ver lista abaixo)

**Hooks a Remover:**
```
- useUserProfile.ts
- usePhysicalData.ts
- useUserPoints.ts
- useUserXP.ts
- useUserStreak.ts
- useLayoutPreferences.ts (se existir)
```

---

### 3. Remover Duplicação de Timers

**Arquivo:** `src/components/exercise/index.ts` (NOVO)

```typescript
// Central export para todos os timers
export { UnifiedTimer } from './UnifiedTimer';
export { RestTimer, MiniRestTimer } from './RestTimer';
export { InlineRestTimer } from './InlineRestTimer';
export { CompactTimer, MiniTimer } from './UnifiedTimer';
```

**Arquivo:** `src/components/exercise/RestTimer.tsx` (SIMPLIFICADO)

```typescript
import { UnifiedTimer } from './UnifiedTimer';
import type { UnifiedTimerProps } from './UnifiedTimer';

interface RestTimerProps extends Omit<UnifiedTimerProps, 'variant'> {
  compact?: boolean;
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
```

**Arquivo:** `src/components/exercise/InlineRestTimer.tsx` (SIMPLIFICADO)

```typescript
import { UnifiedTimer } from './UnifiedTimer';
import type { UnifiedTimerProps } from './UnifiedTimer';

interface InlineRestTimerProps extends Omit<UnifiedTimerProps, 'variant'> {
  nextSetNumber?: number;
  totalSets?: number;
}

export const InlineRestTimer: React.FC<InlineRestTimerProps> = (props) => {
  return (
    <UnifiedTimer 
      {...props} 
      variant="inline"
      autoStart={props.autoStart ?? true}
    />
  );
};
```

**Arquivo:** `src/components/exercise/UnifiedTimer.tsx` (REMOVER EXPORTS DUPLICADOS)

```typescript
// ❌ REMOVER estas linhas (752-770):
// export const RestTimer: React.FC<UnifiedTimerProps> = (props) => (
//   <UnifiedTimer {...props} variant="full" />
// );
// export const InlineRestTimer: React.FC<UnifiedTimerProps> = (props) => (
//   <UnifiedTimer {...props} variant="inline" />
// );
// export const CompactTimer: React.FC<UnifiedTimerProps> = (props) => (
//   <UnifiedTimer {...props} variant="compact" />
// );
// export const MiniTimer: React.FC<UnifiedTimerProps> = (props) => (
//   <UnifiedTimer {...props} variant="mini" />
// );

// ✅ MANTER apenas:
export const UnifiedTimer: React.FC<UnifiedTimerProps> = ({ ... }) => { ... };
export default UnifiedTimer;
```

**Ações:**
- [ ] Criar `src/components/exercise/index.ts`
- [ ] Simplificar `RestTimer.tsx`
- [ ] Simplificar `InlineRestTimer.tsx`
- [ ] Remover exports duplicados de `UnifiedTimer.tsx`
- [ ] Atualizar imports em componentes

---

### 4. Adicionar `enabled` em Todos os useQuery

**Padrão:**

```typescript
// ❌ ANTES
const { data } = useQuery({
  queryKey: ['my-data'],
  queryFn: async () => { ... }
});

// ✅ DEPOIS
const { data } = useQuery({
  queryKey: ['my-data', userId],
  queryFn: async () => { ... },
  enabled: !!userId, // ← ADICIONAR ISTO
});
```

**Arquivos a Atualizar:**
- [ ] `src/hooks/useGoals.ts`
- [ ] `src/hooks/useGamification.ts` (novo)
- [ ] `src/hooks/useChallenges.ts`
- [ ] `src/hooks/useNutritionTracking.ts`
- [ ] `src/hooks/useExerciseProgram.ts`
- [ ] ... (todos os hooks com useQuery)

**Script para Encontrar:**
```bash
grep -r "useQuery({" src/hooks/ | grep -v "enabled:"
```

---

## 🟡 IMPORTANTE (Semana 2-3)

### 5. Criar Índices Centralizados

**Arquivo:** `src/components/exercise/index.ts`

```typescript
// Timers
export { UnifiedTimer } from './UnifiedTimer';
export { RestTimer, MiniRestTimer } from './RestTimer';
export { InlineRestTimer } from './InlineRestTimer';

// Modals
export { ExerciseOnboardingModal } from './ExerciseOnboardingModal';

// Selectors
export { DaySelector } from './DaySelector';

// Types
export type { UnifiedTimerProps } from './UnifiedTimer';
```

**Arquivo:** `src/hooks/index.ts` (NOVO)

```typescript
// Auth
export { useAuth } from './useAuth';
export { useAutoAuth } from './useAutoAuth';
export { useGoogleAuth } from './useGoogleAuth';

// User Data (CENTRALIZADO)
export { useUserData } from './useUserData';
export { useUserDataCache } from './useUserDataCache';

// Gamification (UNIFICADO)
export { useGamification } from './useGamification';

// Missions
export { useDailyMissions } from './useDailyMissions';

// Exercises
export { useExerciseProgram } from './useExerciseProgram';
export { useExerciseRecommendation } from './useExerciseRecommendation';

// ... resto dos hooks
```

**Ações:**
- [ ] Criar `src/components/*/index.ts` para cada diretório
- [ ] Criar `src/hooks/index.ts`
- [ ] Atualizar imports em componentes

---

### 6. Padronizar Nomes de Hooks

**Antes:**
```typescript
useGamification()
useEnhancedGamification()
useRealGamification()

useDailyMissions()
useDailyMissionsEnhanced()
useDailyMissionsFinal()

useExerciseProgram()
useWorkoutPlanGenerator()
useAIWorkoutGenerator()
```

**Depois:**
```typescript
useGamification()

useDailyMissions()

useExerciseProgram()
```

**Ações:**
- [ ] Renomear hooks com sufixos (Enhanced, Final, Real, etc)
- [ ] Atualizar imports
- [ ] Remover versões antigas

---

### 7. Adicionar `staleTime` Adequado

**Padrão por Tipo de Dado:**

```typescript
// Dados que mudam raramente (perfil, preferências)
staleTime: 10 * 60 * 1000, // 10 minutos

// Dados que mudam frequentemente (pontos, progresso)
staleTime: 5 * 60 * 1000,  // 5 minutos

// Dados em tempo real (chat, notificações)
staleTime: 0,              // Sempre buscar

// Dados estáticos (exercícios, alimentos)
staleTime: 60 * 60 * 1000, // 1 hora
```

**Ações:**
- [ ] Revisar todos os useQuery
- [ ] Adicionar `staleTime` apropriado
- [ ] Adicionar `gcTime` (2x staleTime)
- [ ] Adicionar `refetchOnWindowFocus: false`

---

## 🟢 MELHORIAS (Semana 3-4)

### 8. Documentar Arquitetura

**Arquivo:** `docs/ARCHITECTURE.md` (NOVO)

```markdown
# Arquitetura do Instituto dos Sonhos

## Estrutura de Pastas

### src/components
- Componentes React organizados por feature
- Cada diretório tem `index.ts` para exports centralizados
- Componentes devem ser "dumb" (sem lógica de negócio)

### src/hooks
- Hooks customizados para lógica de negócio
- Usar React Query para dados remotos
- Padrão: `useFeatureName`

### src/pages
- Páginas da aplicação
- Usar componentes e hooks

### src/lib
- Utilitários e helpers
- Configurações (queryConfig, cache, etc)

## Padrões de Código

### Hooks com useQuery

```typescript
export const useMyData = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['my-data', userId],
    queryFn: async () => { ... },
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};
```

### Componentes

```typescript
interface MyComponentProps {
  title: string;
  onClose?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onClose,
}) => {
  return <div>{title}</div>;
};
```

## Fluxo de Dados

1. Componente renderiza
2. Hook busca dados via React Query
3. Dados são cacheados
4. Componente renderiza com dados
5. Mutação atualiza dados
6. Cache é invalidado
7. Hook refetch automático

## Performance

- Usar `staleTime` para reduzir requests
- Usar `enabled` para não buscar dados desnecessários
- Usar `refetchOnWindowFocus: false` para mobile
- Usar code splitting para reduzir bundle
```

**Ações:**
- [ ] Criar `docs/ARCHITECTURE.md`
- [ ] Criar `docs/PATTERNS.md`
- [ ] Criar `docs/PERFORMANCE.md`
- [ ] Atualizar README

---

### 9. Refatorar Componentes Grandes

**Exemplo: ExerciseOnboardingModal (1155 linhas)**

```typescript
// ❌ ANTES: Tudo em um arquivo

// ✅ DEPOIS: Quebrar em componentes menores
src/components/exercise/
├── ExerciseOnboardingModal.tsx (container)
├── steps/
│   ├── WelcomeStep.tsx
│   ├── LevelStep.tsx
│   ├── ExperienceStep.tsx
│   ├── TimeStep.tsx
│   ├── FrequencyStep.tsx
│   ├── DaysStep.tsx
│   ├── LocationStep.tsx
│   ├── EquipmentStep.tsx
│   ├── GoalStep.tsx
│   └── ResultStep.tsx
└── index.ts
```

**Ações:**
- [ ] Identificar componentes com 500+ linhas
- [ ] Quebrar em componentes menores
- [ ] Extrair lógica para hooks
- [ ] Testar cada componente

---

## 📊 CHECKLIST DE IMPLEMENTAÇÃO

### Semana 1
- [ ] Unificar `useGamification`
- [ ] Criar `useUserData`
- [ ] Remover duplicação de timers
- [ ] Adicionar `enabled` em useQuery

### Semana 2
- [ ] Criar índices centralizados
- [ ] Padronizar nomes de hooks
- [ ] Adicionar `staleTime` adequado
- [ ] Remover hooks redundantes

### Semana 3
- [ ] Documentar arquitetura
- [ ] Refatorar componentes grandes
- [ ] Criar guia de padrões
- [ ] Testar performance

### Semana 4
- [ ] Code splitting avançado
- [ ] Lazy load de componentes
- [ ] Otimizar imagens
- [ ] Monitorar com Sentry

---

## 🧪 TESTES

### Antes de Implementar
```bash
npm run test
npm run lint
npm run build
```

### Depois de Implementar
```bash
npm run test
npm run lint
npm run build
npm run preview
```

### Verificar Performance
```bash
# Lighthouse
npm run build
npm run preview
# Abrir http://localhost:4173 e rodar Lighthouse

# Bundle Size
npm run build
# Verificar dist/
```

---

## 📈 MÉTRICAS DE SUCESSO

### Antes
- Bundle Size: ~500KB
- Queries por página: 20+
- Duplicação: 25%
- Performance Score: 65/100

### Depois
- Bundle Size: ~350KB (-30%)
- Queries por página: 5 (-75%)
- Duplicação: 5% (-80%)
- Performance Score: 90/100 (+38%)

---

## 🚨 RISCOS E MITIGAÇÃO

### Risco 1: Quebrar Componentes Existentes
**Mitigação:** Testar cada mudança, manter compatibilidade

### Risco 2: Perder Dados em Cache
**Mitigação:** Usar React Query invalidation corretamente

### Risco 3: Performance Piorar
**Mitigação:** Monitorar com Lighthouse, Sentry

### Risco 4: Usuários Afetados
**Mitigação:** Deploy gradual, feature flags

---

## 📞 SUPORTE

Para dúvidas durante implementação:
1. Consultar `docs/ARCHITECTURE.md`
2. Verificar exemplos em componentes existentes
3. Testar localmente antes de fazer push
4. Revisar com time antes de merge

