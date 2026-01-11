# 🎯 Roadmap para 10/10 - Instituto dos Sonhos

**Nota Atual:** 7.2/10  
**Meta:** 10/10  
**Tempo Estimado:** 6-8 semanas  
**Risco:** Baixo (todas as mudanças são incrementais e retrocompatíveis)

---

## 📊 Diagnóstico Atual

| Métrica | Valor | Status |
|---------|-------|--------|
| Arquivos .md/.sql na raiz | 552 | 🔴 Crítico |
| Hooks totais | 115 | ⚠️ Muitos |
| Testes | 6 arquivos | 🔴 Crítico |
| Componentes 500+ linhas | 15 | 🔴 Crítico |
| Índices centralizados | 4 | ⚠️ Poucos |
| Edge Functions | 85 | ✅ OK |

---

## 🔴 FASE 1: Organização (Semana 1-2) → +1.0 ponto

### 1.1 Organizar Arquivos da Raiz

**Problema:** 552 arquivos .md e .sql na raiz do projeto

**Solução:**
```
/docs
├── /analysis          # Análises (ANALISE_*.md)
├── /guides            # Guias (GUIA_*.md, COMO_*.md)
├── /changelogs        # Changelogs (CHANGELOG_*.md)
├── /solutions         # Soluções (SOLUCAO_*.md)
├── /corrections       # Correções (CORRECAO_*.md)
└── /implementation    # Implementações (IMPLEMENTACAO_*.md)

/sql
├── /migrations        # Migrações de banco
├── /fixes             # Correções SQL
├── /inserts           # Inserts de dados
└── /queries           # Queries úteis
```

**Ação:**
```bash
# Criar estrutura
mkdir -p docs/{analysis,guides,changelogs,solutions,corrections,implementation}
mkdir -p sql/{migrations,fixes,inserts,queries}

# Mover arquivos (exemplo)
mv ANALISE_*.md docs/analysis/
mv GUIA_*.md COMO_*.md docs/guides/
mv CHANGELOG_*.md docs/changelogs/
mv SOLUCAO_*.md docs/solutions/
mv CORRECAO_*.md docs/corrections/
mv *.sql sql/
```

**Impacto:** +0.3 pontos

---

### 1.2 Criar Índices Centralizados

**Problema:** Apenas 4 índices em 30+ diretórios de componentes

**Solução:** Criar `index.ts` em cada diretório principal:

```typescript
// src/components/gamification/index.ts
export { GamifiedDashboard } from './GamifiedDashboard';
export { BadgeSystem } from './BadgeSystem';
export { LevelSystem } from './LevelSystem';
export { DailyChallenge } from './DailyChallenge';
export { StreakCounter } from './StreakCounter';
export { ProgressRing } from './ProgressRing';
export { CountdownTimer } from './CountdownTimer';

// src/components/nutrition/index.ts
export { NutritionDashboard } from './NutritionDashboard';
export { MealTracker } from './MealTracker';
// ... etc

// src/components/sofia/index.ts
export { SofiaChat } from './SofiaChat';
export { SofiaAvatar } from './SofiaAvatar';
// ... etc

// src/hooks/index.ts
export { useAuth } from './useAuth';
export { useGamificationUnified } from './useGamificationUnified';
export { useUserDataCentralized } from './useUserDataCentralized';
// ... etc
```

**Diretórios que precisam de index.ts:**
- [ ] src/components/gamification/
- [ ] src/components/nutrition/
- [ ] src/components/sofia/
- [ ] src/components/tracking/
- [ ] src/components/admin/
- [ ] src/components/dashboard/
- [ ] src/components/challenges/
- [ ] src/components/weighing/
- [ ] src/hooks/

**Impacto:** +0.3 pontos

---

### 1.3 Remover Hooks Não Utilizados

**Hooks a verificar e possivelmente remover:**
- `useGamification.ts` (substituído por useGamificationUnified)
- `useRealGamification.ts` (0 usos encontrados)
- Hooks duplicados com sufixos (Enhanced, Final, Real, etc)

**Ação:**
1. Buscar usos de cada hook
2. Se 0 usos, marcar como deprecated
3. Após 1 semana, remover

**Impacto:** +0.2 pontos

---

### 1.4 Padronizar Nomes de Hooks

**Antes:**
```
useGamification
useEnhancedGamification
useRealGamification
useDailyMissions
useDailyMissionsEnhanced
```

**Depois:**
```
useGamification (unificado)
useDailyMissions (unificado)
```

**Impacto:** +0.2 pontos

---

## 🟡 FASE 2: Performance (Semana 3-4) → +1.0 ponto

### 2.1 Adicionar `enabled` em Todos os useQuery

**Problema:** Muitos hooks executam queries sem validar parâmetros

**Hooks que precisam de `enabled`:**
```
src/hooks/useRealRanking.ts
src/hooks/useAdminDashboard.ts
src/hooks/useRanking.ts
src/hooks/useChallengeParticipation.ts
src/hooks/useWeeklyGoalProgress.ts
src/hooks/useGamification.ts
src/hooks/usePointsConfig.ts
src/hooks/useGoals.ts
```

**Padrão a aplicar:**
```typescript
const { data } = useQuery({
  queryKey: ['feature', userId],
  queryFn: async () => { ... },
  enabled: !!userId, // ← ADICIONAR
  staleTime: 5 * 60 * 1000, // ← ADICIONAR
  refetchOnWindowFocus: false, // ← ADICIONAR
});
```

**Impacto:** +0.4 pontos

---

### 2.2 Otimizar Cache com staleTime

**Configuração por tipo de dado:**

| Tipo de Dado | staleTime | gcTime |
|--------------|-----------|--------|
| Perfil/Preferências | 10 min | 1 hora |
| Gamificação/Pontos | 5 min | 30 min |
| Desafios/Metas | 5 min | 30 min |
| Dados estáticos | 1 hora | 2 horas |
| Chat/Tempo real | 0 | 5 min |

**Impacto:** +0.3 pontos

---

### 2.3 Implementar Query Prefetching

**Arquivo:** `src/lib/queryPrefetch.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const prefetchUserData = async (queryClient: QueryClient, userId: string) => {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['user-data-centralized', userId],
      queryFn: () => fetchUserData(userId),
      staleTime: 10 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['gamification-unified', userId],
      queryFn: () => fetchGamification(userId),
      staleTime: 5 * 60 * 1000,
    }),
  ]);
};
```

**Impacto:** +0.3 pontos

---

## 🟢 FASE 3: Qualidade de Código (Semana 5-6) → +1.0 ponto

### 3.1 Quebrar Componentes Grandes

**Componentes críticos (1000+ linhas):**

| Componente | Linhas | Ação |
|------------|--------|------|
| SessionTemplates.tsx | 1312 | Quebrar em 4-5 componentes |
| UserSessions.tsx | 1272 | Quebrar em 3-4 componentes |
| XiaomiScaleFlow.tsx | 1221 | Extrair steps em componentes |
| CourseManagementNew.tsx | 1218 | Quebrar em módulos |
| MedicalDocumentsSection.tsx | 1202 | Extrair seções |
| ActiveWorkoutModal.tsx | 1201 | Extrair timer, exercícios |
| SofiaChat.tsx | 1155 | Extrair mensagens, input |
| ExerciseOnboardingModal.tsx | 1154 | Extrair steps |

**Padrão de refatoração:**
```
ComponenteGrande.tsx (1200 linhas)
↓
ComponenteGrande/
├── index.tsx (container, 100 linhas)
├── ComponenteA.tsx (200 linhas)
├── ComponenteB.tsx (200 linhas)
├── ComponenteC.tsx (200 linhas)
├── hooks/
│   └── useComponenteLogic.ts (300 linhas)
└── types.ts (50 linhas)
```

**Impacto:** +0.5 pontos

---

### 3.2 Extrair Lógica para Hooks Customizados

**Exemplo: ExerciseOnboardingModal**

```typescript
// Antes: Tudo em um arquivo de 1154 linhas

// Depois:
// src/components/exercise/ExerciseOnboardingModal/
// ├── index.tsx (container)
// ├── steps/
// │   ├── WelcomeStep.tsx
// │   ├── LevelStep.tsx
// │   ├── ExperienceStep.tsx
// │   └── ... (8 steps)
// └── hooks/
//     └── useOnboardingFlow.ts (lógica de navegação)
```

**Impacto:** +0.3 pontos

---

### 3.3 Implementar Error Boundaries

```typescript
// src/components/shared/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<Props> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

**Impacto:** +0.2 pontos

---

## 🔵 FASE 4: Testes (Semana 7-8) → +0.8 ponto

### 4.1 Aumentar Cobertura de Testes

**Meta:** 70%+ de cobertura

**Prioridade de testes:**

1. **Hooks críticos (Alta prioridade)**
   - useAuth
   - useGamificationUnified
   - useUserDataCentralized
   - useChallenges

2. **Componentes de UI (Média prioridade)**
   - UnifiedTimer
   - DailyChallenge
   - BadgeSystem

3. **Utilitários (Alta prioridade)**
   - Funções em src/lib/
   - Formatters
   - Validators

**Estrutura de testes:**
```
src/
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
├── components/
│   ├── exercise/
│   │   ├── UnifiedTimer.tsx
│   │   └── __tests__/
│   │       └── UnifiedTimer.test.tsx
└── lib/
    ├── utils.ts
    └── __tests__/
        └── utils.test.ts
```

**Impacto:** +0.5 pontos

---

### 4.2 Testes de Integração

```typescript
// src/__tests__/integration/gamification.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useGamificationUnified } from '@/hooks/useGamificationUnified';

describe('Gamification Integration', () => {
  it('should load user gamification data', async () => {
    const { result } = renderHook(() => useGamificationUnified('user-123'));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.gamificationData).toBeDefined();
    expect(result.current.gamificationData?.currentLevel).toBeGreaterThan(0);
  });
});
```

**Impacto:** +0.3 pontos

---

## ⚡ FASE 5: Otimizações Avançadas (Contínuo) → +0.2 ponto

### 5.1 Code Splitting Avançado

```typescript
// Lazy load de páginas pesadas
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const SofiaChat = lazy(() => import('@/components/sofia/SofiaChat'));
const ExerciseOnboarding = lazy(() => import('@/components/exercise/ExerciseOnboardingModal'));
```

### 5.2 Otimização de Imagens

- Usar WebP/AVIF
- Lazy loading de imagens
- Placeholder blur

### 5.3 Monitoramento com Sentry

- Error tracking
- Performance monitoring
- User feedback

**Impacto:** +0.2 pontos

---

## 📋 CHECKLIST COMPLETO

### Fase 1: Organização
- [ ] Criar estrutura de pastas docs/ e sql/
- [ ] Mover 552 arquivos para pastas corretas
- [ ] Criar index.ts em 9 diretórios
- [ ] Remover hooks não utilizados
- [ ] Padronizar nomes de hooks

### Fase 2: Performance
- [ ] Adicionar `enabled` em 8+ hooks
- [ ] Configurar staleTime em todos hooks
- [ ] Implementar query prefetching
- [ ] Adicionar refetchOnWindowFocus: false

### Fase 3: Qualidade
- [ ] Quebrar 8 componentes grandes
- [ ] Extrair lógica para hooks
- [ ] Implementar Error Boundaries
- [ ] Adicionar loading states consistentes

### Fase 4: Testes
- [ ] Criar 20+ testes de hooks
- [ ] Criar 15+ testes de componentes
- [ ] Criar 5+ testes de integração
- [ ] Configurar CI/CD com testes

### Fase 5: Otimizações
- [ ] Code splitting em 10+ componentes
- [ ] Otimizar imagens
- [ ] Configurar Sentry completo
- [ ] Lighthouse score 90+

---

## 📈 Projeção de Notas

| Fase | Nota Após | Incremento |
|------|-----------|------------|
| Atual | 7.2 | - |
| Fase 1 | 8.2 | +1.0 |
| Fase 2 | 9.2 | +1.0 |
| Fase 3 | 10.0 | +0.8 |
| Fase 4 | 10.0 | (consolidação) |
| Fase 5 | 10.0 | (manutenção) |

---

## ⚠️ Regras de Segurança

1. **NUNCA quebrar funcionalidade existente**
2. **Sempre manter compatibilidade de API**
3. **Testar cada mudança antes de commit**
4. **Fazer mudanças incrementais**
5. **Manter documentação atualizada**

---

## 🎯 Resultado Final Esperado

```
Nota: 10/10

✅ Organização impecável
✅ Performance otimizada
✅ Código limpo e modular
✅ 70%+ cobertura de testes
✅ Documentação completa
✅ Zero duplicação
✅ Padrões consistentes
✅ Monitoramento ativo
```

---

*Criado em: 10 de Janeiro de 2026*
*Última atualização: 10 de Janeiro de 2026*
