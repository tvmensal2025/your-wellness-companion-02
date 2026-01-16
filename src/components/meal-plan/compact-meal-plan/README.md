# CompactMealPlan

Componente refatorado do `CompactMealPlanModal.tsx` original (1.037 linhas), seguindo o padrão Orchestrator para modularidade e expansibilidade.

## Estrutura de Pastas

```
compact-meal-plan/
├── index.tsx                    # Orchestrator (~150 linhas)
├── hooks/
│   └── useCompactMealPlanLogic.ts  # Lógica de estado e navegação
├── MealCard.tsx                 # Card de refeição individual
├── MacrosDisplay.tsx            # Exibição de macronutrientes
├── MealNavigation.tsx           # Navegação entre refeições
├── PrintButton.tsx              # Funcionalidade de impressão
└── README.md                    # Esta documentação
```

## Componentes

### index.tsx (Orchestrator)
Componente principal que coordena todos os sub-componentes. Não contém lógica de negócio, apenas composição.

**Props:**
```typescript
interface CompactMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayPlan: DayPlan;
  title?: string;
}
```

### hooks/useCompactMealPlanLogic.ts
Hook customizado que encapsula toda a lógica de estado:
- Navegação entre refeições (currentMealIndex)
- Lista de refeições disponíveis
- Configuração da refeição atual
- Handlers de navegação (next/previous)
- Funcionalidade de impressão

**Retorno:**
```typescript
interface CompactMealPlanLogic {
  currentMealIndex: number;
  setCurrentMealIndex: (index: number) => void;
  availableMeals: Array<{ key: MealType; meal: Meal }>;
  currentMeal: Meal | null;
  currentMealConfig: MealConfig | null;
  handlePrint: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
}
```

### MealCard.tsx
Renderiza o card de uma refeição individual com:
- Título e descrição
- Ingredientes
- Modo de preparo
- Sugestões práticas
- Animações Framer Motion

### MacrosDisplay.tsx
Exibe os macronutrientes da refeição:
- Calorias
- Proteínas
- Carboidratos
- Gorduras
- Fibras (opcional)
- Barras de progresso visuais

### MealNavigation.tsx
Controles de navegação entre refeições:
- Botão anterior
- Indicadores de posição
- Botão próximo
- Seleção direta de refeição

### PrintButton.tsx
Funcionalidade de impressão do cardápio:
- Formatação para impressão
- Estilos de impressão otimizados

## Arquivo Original

O componente original está em:
```
src/components/meal-plan/CompactMealPlanModal.tsx
```

**Características do original:**
- 1.037 linhas de código
- Lógica de estado misturada com UI
- Configurações de refeições inline
- Animações Framer Motion

## Uso

```tsx
import { CompactMealPlanModal } from '@/components/meal-plan/compact-meal-plan';

// Uso básico
<CompactMealPlanModal
  open={isOpen}
  onOpenChange={setIsOpen}
  dayPlan={dayPlanData}
  title="Cardápio do Dia"
/>
```

## Compatibilidade

O componente mantém compatibilidade total com a API original:
- Mesmas props
- Mesmo comportamento
- Re-export para imports existentes

```tsx
// Ambos imports funcionam:
import { CompactMealPlanModal } from '@/components/meal-plan/compact-meal-plan';
import { CompactMealPlanModal } from '@/components/meal-plan/CompactMealPlanModal';
```

## Requisitos Atendidos

- **Req 1.1**: Pasta `compact-meal-plan/` com estrutura modular
- **Req 1.2**: Hook `useCompactMealPlanLogic.ts` extraído
- **Req 1.3**: `MealCard.tsx` para refeições individuais
- **Req 1.4**: `MacrosDisplay.tsx` para macronutrientes
- **Req 1.5**: `MealNavigation.tsx` para navegação
- **Req 1.6**: `PrintButton.tsx` para impressão
- **Req 1.7**: Orchestrator com menos de 200 linhas
- **Req 1.8**: Animações Framer Motion mantidas

## Padrões Seguidos

- ✅ Imports usando `@/` alias
- ✅ Cores semânticas (bg-background, text-foreground)
- ✅ TypeScript tipado
- ✅ Componentes < 300 linhas
- ✅ Orchestrator < 200 linhas
