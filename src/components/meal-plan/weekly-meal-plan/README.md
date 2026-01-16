# WeeklyMealPlan

Componente refatorado do `WeeklyMealPlanModal.tsx` original (660 linhas), seguindo o padrão Orchestrator para modularidade e expansibilidade.

## Estrutura de Pastas

```
weekly-meal-plan/
├── index.tsx                    # Orchestrator (~120 linhas)
├── hooks/
│   └── useWeeklyPlanLogic.ts    # Lógica de seleção de dias e cálculos
├── DaySelector.tsx              # Seleção de dias da semana
├── WeeklyOverview.tsx           # Visão geral da semana com totais
├── CircularProgress.tsx         # Componente de progresso circular
└── README.md                    # Esta documentação
```

## Componentes

### index.tsx (Orchestrator)
Componente principal que coordena todos os sub-componentes. Não contém lógica de negócio, apenas composição.

**Props:**
```typescript
interface WeeklyMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlan: DayPlan[];
  title?: string;
}
```

### hooks/useWeeklyPlanLogic.ts
Hook customizado que encapsula toda a lógica de estado:
- Seleção de dias (expandedDays)
- Cálculo de médias de macros semanais
- Obtenção do nome do dia
- Toggle de expansão de dias
- Funcionalidade de impressão
- Estado do modal de detalhes (CompactMealPlanModal)

**Retorno:**
```typescript
interface WeeklyPlanLogic {
  expandedDays: number[];
  toggleDay: (day: number) => void;
  avgMacros: MacroNutrients & { fiber: number };
  getDayName: (day: number) => string;
  handlePrint: () => void;
  compactModalOpen: boolean;
  setCompactModalOpen: (open: boolean) => void;
  selectedDayForCompact: DayPlan | null;
  setSelectedDayForCompact: (day: DayPlan | null) => void;
  userFullName: string;
}
```

### DaySelector.tsx ✅
Renderiza os cards de cada dia da semana com:
- Badge do dia com número
- Nome do dia (Segunda, Terça, etc.)
- Contagem de refeições
- Total de calorias do dia
- Mini timeline visual das refeições (MiniDayTimeline interno)
- Cards de refeição expandidos (MealCard interno)
- Botão de expansão/colapso
- Botão "Ver Receitas Completas" para abrir CompactMealPlanModal
- Animações Framer Motion

**Props:**
```typescript
interface DaySelectorProps {
  dayPlan: DayPlan;
  isExpanded: boolean;
  onToggle: () => void;
  onViewDetailed: () => void;
  getDayName: (day: number) => string;
  className?: string;
}
```

**Componentes Internos:**
- `MiniDayTimeline` - Timeline horizontal visual das refeições do dia
- `MealCard` - Card de refeição individual com macros

### WeeklyOverview.tsx ✅
Exibe o resumo semanal com:
- Média de calorias diárias com progresso circular
- Médias de proteínas, carboidratos, gorduras e fibras
- Layout responsivo (empilha em mobile, lado a lado em desktop)
- Gradientes e animações
- Badge "Personalizado" com ícone Sparkles
- Componente `CircularProgress` integrado

**Props:**
```typescript
interface WeeklyOverviewProps {
  macros: MacroNutrients & { fiber: number };
  calorieGoal?: number; // Padrão: 2000
  className?: string;
}
```

**Componentes Exportados:**
- `WeeklyOverview` - Componente principal
- `CircularProgress` - Componente de progresso circular reutilizável

### CircularProgress.tsx (integrado em WeeklyOverview)
Componente reutilizável de progresso circular:
- SVG animado com Framer Motion
- Exibe porcentagem no centro
- Configurável via value/max

**Props:**
```typescript
interface CircularProgressProps {
  value: number;
  max: number;
  className?: string;
}
```

## Componentes Internos (a serem extraídos)

O arquivo original também contém componentes internos que podem ser extraídos:
- `MiniDayTimeline` - Timeline horizontal das refeições do dia
- `MealCard` - Card de refeição individual (similar ao compact-meal-plan)
- `SummaryCard` - Card de resumo (será WeeklyOverview)
- `DayCard` - Card do dia (será DaySelector)

## Arquivo Original

O componente original está em:
```
src/components/meal-plan/WeeklyMealPlanModal.tsx
```

**Características do original:**
- 660 linhas de código
- Lógica de estado misturada com UI
- Componentes internos inline (CircularProgress, MiniDayTimeline, MealCard, SummaryCard, DayCard)
- Configurações de refeições (MEAL_CONFIG) inline
- Animações Framer Motion
- Integração com CompactMealPlanModal para detalhes
- Funcionalidade de impressão com layout premium

## Uso

```tsx
import { WeeklyMealPlanModal } from '@/components/meal-plan/weekly-meal-plan';

// Uso básico
<WeeklyMealPlanModal
  open={isOpen}
  onOpenChange={setIsOpen}
  mealPlan={weeklyPlanData}
  title="Cardápio Semanal"
/>
```

## Compatibilidade

O componente manterá compatibilidade total com a API original:
- Mesmas props
- Mesmo comportamento
- Re-export para imports existentes

```tsx
// Ambos imports funcionarão:
import { WeeklyMealPlanModal } from '@/components/meal-plan/weekly-meal-plan';
import { WeeklyMealPlanModal } from '@/components/meal-plan/WeeklyMealPlanModal';
```

## Requisitos Atendidos

- **Req 2.1**: Pasta `weekly-meal-plan/` com estrutura modular ✅
- **Req 2.2**: Hook `useWeeklyPlanLogic.ts` ✅
- **Req 2.3**: `DaySelector.tsx` para seleção de dias ✅
- **Req 2.4**: `WeeklyOverview.tsx` para visão geral ✅
- **Req 2.5**: `CircularProgress.tsx` para progresso circular ✅ (integrado em WeeklyOverview)
- **Req 2.6**: Orchestrator com menos de 150 linhas ✅ (113 linhas)

## Padrões a Seguir

- ✅ Imports usando `@/` alias
- ✅ Cores semânticas (bg-background, text-foreground)
- ✅ TypeScript tipado
- ✅ Componentes < 300 linhas
- ✅ Orchestrator < 150 linhas
- ✅ Animações Framer Motion mantidas

## Dependências

- `framer-motion` - Animações
- `@/components/ui/dialog` - Modal base
- `@/components/ui/button` - Botões
- `@/components/meal-plan/compact-meal-plan` - Modal de detalhes do dia
- `@/integrations/supabase/client` - Para obter nome do usuário
- `lucide-react` - Ícones

## Próximos Passos

1. ~~Criar pasta e estrutura~~ ✅
2. ~~Extrair `useWeeklyPlanLogic.ts`~~ ✅
3. ~~Extrair `DaySelector.tsx`~~ ✅ (incluindo MiniDayTimeline e MealCard internos)
4. ~~Extrair `CircularProgress.tsx`~~ ✅ (integrado em WeeklyOverview)
5. ~~Extrair `WeeklyOverview.tsx`~~ ✅ (baseado em SummaryCard)
6. ~~Criar orchestrator `index.tsx`~~ ✅ (113 linhas)
7. ~~Atualizar exports para compatibilidade~~ ✅
