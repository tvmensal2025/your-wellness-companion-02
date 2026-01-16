# 🧭 Navegação para Comunidade - Guia de Referência

## ⚠️ REGRA IMPORTANTE

A Comunidade (HealthFeedPage) é renderizada **DENTRO** do SofiaPage como uma seção.
Não existe rota `/comunidade` ou `/health-feed` separada.

---

## ✅ PADRÃO CORRETO

### Para componentes DENTRO do SofiaPage (ExerciseDashboard, DashboardOverview, etc.)

Use o contexto `ActiveSectionContext`:

```typescript
import { useActiveSection } from '@/contexts/ActiveSectionContext';

// No componente
const { setActiveSection } = useActiveSection();

// Para navegar
setActiveSection('comunidade');
```

### Para componentes FORA do SofiaPage (páginas separadas)

Use navigate com query param:

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Para navegar
navigate('/sofia?section=comunidade');
```

---

## ❌ NUNCA USE

```typescript
// ❌ ERRADO - Rota não existe
navigate('/comunidade');

// ❌ ERRADO - Rota pode não estar configurada
navigate('/health-feed');

// ❌ ERRADO - Rota não existe
navigate('/social');

// ❌ ERRADO - Dentro do SofiaPage, navigate não funciona
navigate('/sofia?section=comunidade'); // Se já está no SofiaPage!
```

---

## 📁 Arquivos Corrigidos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `useChallengeLogic.ts` | `navigate('/sofia?section=comunidade')` | `setActiveSection('comunidade')` |
| `CommunityIntegration.tsx` | `navigate('/health-feed')` | `setActiveSection('comunidade')` |
| `CommunityButton.tsx` | `navigate('/sofia?section=comunidade')` | OK (está fora do SofiaPage) |

---

## 🔧 Como o SofiaPage Funciona

1. SofiaPage é o dashboard principal (`/sofia`)
2. Ele tem várias seções internas: `dashboard`, `comunidade`, `exercicios`, `goals`, etc.
3. A seção ativa é controlada pelo estado `activeSectionState`
4. O contexto `ActiveSectionContext` permite que componentes filhos mudem a seção
5. Query param `?section=X` é lido na inicialização para navegação externa

---

## 📋 Seções Válidas do SofiaPage

```typescript
type DashboardSection = 
  | 'dashboard'      // Dashboard principal
  | 'missions'       // Missões do dia
  | 'courses'        // Plataforma de cursos
  | 'sessions'       // Sessões de coaching
  | 'comunidade'     // Feed social (HealthFeedPage)
  | 'goals'          // Metas
  | 'challenges'     // Desafios
  | 'saboteur-test'  // Teste de sabotadores
  | 'progress'       // Meu progresso
  | 'subscriptions'  // Assinaturas
  | 'sofia-nutricional' // Sofia nutricional
  | 'dr-vital'       // Dr. Vital
  | 'exercicios'     // ExerciseDashboard
  | 'apps'           // Apps
  | 'help'           // Ajuda
  | 'profile';       // Perfil
```

---

*Última atualização: Janeiro 2026*
