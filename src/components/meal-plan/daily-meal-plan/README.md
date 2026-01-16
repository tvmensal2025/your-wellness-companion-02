# DailyMealPlanModal

Componente refatorado para exibição de plano alimentar diário.

## Estrutura

```
daily-meal-plan/
├── index.tsx                    # Orchestrator (~100 linhas)
├── hooks/
│   └── useDailyPlanLogic.ts     # Export handlers, modal state
├── DailyMealList.tsx            # MealCard component + meal list
├── DailyTotals.tsx              # Daily totals card
└── README.md                    # Esta documentação
```

## Componentes

### index.tsx (Orchestrator)
Componente principal que coordena os sub-componentes. Responsável por:
- Renderizar o Dialog/Modal
- Coordenar estado entre sub-componentes
- Manter compatibilidade com API existente

### hooks/useDailyPlanLogic.ts
Hook customizado com toda a lógica de negócio:
- `handleDownloadPDF`: Exportar plano para PDF
- `handleDownloadPNG`: Exportar plano para PNG
- `handleOpenDetailed`: Abrir visualização HTML detalhada
- `handleTestDetailed`: Testar com dados de exemplo
- `compactModalOpen`: Estado do modal compacto

### DailyMealList.tsx
Componente que renderiza a lista de refeições do dia:
- Contém o componente interno `MealCard`
- Renderiza todas as refeições disponíveis (breakfast, lunch, snack, dinner, supper)
- Exibe macros e informações nutricionais de cada refeição

### DailyTotals.tsx
Card com totais nutricionais do dia:
- Calorias totais
- Proteínas (g)
- Carboidratos (g)
- Gorduras (g)
- Fibras (g)

## Props

```typescript
interface DailyMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayPlan: DayPlan;
  title?: string;
}
```

## Uso

```tsx
import { DailyMealPlanModal } from '@/components/meal-plan/daily-meal-plan';

<DailyMealPlanModal
  open={isOpen}
  onOpenChange={setIsOpen}
  dayPlan={dayPlan}
  title="Plano Alimentar - Dia 1"
/>
```

## Tipos Exportados

- `DayPlan`: Interface do plano diário
- `Meal`: Interface de uma refeição
- `DailyMealPlanModalProps`: Props do componente principal

## Compatibilidade

O componente mantém compatibilidade com imports existentes através de re-exports no arquivo original `DailyMealPlanModal.tsx`.
