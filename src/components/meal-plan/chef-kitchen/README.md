# ChefKitchenMealPlan

Componente refatorado do `ChefKitchenMealPlan.tsx` original (523 linhas), seguindo o padrão Orchestrator para modularidade e expansibilidade.

## Estrutura de Pastas

```
chef-kitchen/
├── index.tsx                    # Orchestrator (136 linhas) ✅
├── hooks/
│   └── useChefKitchenLogic.ts   # Lógica de estado e geração (295 linhas) ✅
├── KitchenHeader.tsx            # Cabeçalho temático com ícone do chef ✅
├── RecipeCard.tsx               # Configurações de objetivo e preferências ✅
├── CookingAnimation.tsx         # Animações de cozinha (panela, fogo, vapor) ✅
└── README.md                    # Esta documentação
```

## Status da Refatoração

| Componente | Status | Linhas |
|------------|--------|--------|
| index.tsx (Orchestrator) | ✅ Completo | 136 |
| useChefKitchenLogic.ts | ✅ Completo | 295 |
| KitchenHeader.tsx | ✅ Completo | ~70 |
| RecipeCard.tsx | ✅ Completo | ~150 |
| CookingAnimation.tsx | ✅ Completo | ~200 |

**Total original:** 523 linhas → **Orchestrator:** 136 linhas (74% redução)

## Componentes

### index.tsx (Orchestrator)
Componente principal que coordena todos os sub-componentes. Não contém lógica de negócio, apenas composição.

**Props:**
```typescript
interface ChefKitchenMealPlanProps {
  className?: string;
}
```

### hooks/useChefKitchenLogic.ts
Hook customizado que encapsula toda a lógica de estado:
- Seleção de refeições (selectedMeals)
- Seleção de dias (selectedDays)
- Objetivo nutricional (selectedObjective)
- Preferências e restrições alimentares
- Cálculo de metas nutricionais personalizadas
- Integração com useMealPlanGeneratorV2
- Integração com useUserFoodPreferences
- Integração com useWeightMeasurement
- Handlers de geração de cardápio

**Retorno:**
```typescript
interface UseChefKitchenLogicReturn {
  // Estado de refeições
  selectedMeals: SelectedMealsType;
  toggleMeal: (key: keyof SelectedMealsType) => void;
  selectedCount: number;
  
  // Estado de dias
  selectedDays: number;
  setSelectedDays: (days: number) => void;
  
  // Estado de objetivo
  selectedObjective: NutritionObjective;
  setSelectedObjective: (obj: NutritionObjective) => void;
  getObjectiveLabel: () => string;
  getObjectiveColor: () => string;
  
  // Metas nutricionais
  nutritionalGoals: NutritionalGoals;
  hasUserData: boolean;
  userWeight: number | undefined;
  loadingPhysical: boolean;
  
  // Preferências e restrições
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
  onTogglePreferences: () => void;
  localPreferences: string[];
  localRestrictions: string[];
  newPreference: string;
  setNewPreference: (value: string) => void;
  newRestriction: string;
  setNewRestriction: (value: string) => void;
  handleAddPreference: () => Promise<void>;
  handleRemovePreference: (food: string) => Promise<void>;
  handleAddRestriction: () => Promise<void>;
  handleRemoveRestriction: (food: string) => Promise<void>;
  
  // Geração de cardápio
  isGenerating: boolean;
  generatedPlan: any[];
  handleGenerate: () => Promise<void>;
  
  // Modal de resultado
  showResultModal: boolean;
  setShowResultModal: (show: boolean) => void;
  
  // Efeito de sucesso
  showSuccessEffect: boolean;
  setShowSuccessEffect: (show: boolean) => void;
}
```

### KitchenHeader.tsx
Renderiza o cabeçalho temático com:
- Ícone do chef animado (ChefHat)
- Título "Cardápio Chef"
- Subtítulo "Personalizado para você"
- Botão de histórico (MealPlanHistoryDrawer)
- Aviso se não tiver dados do usuário

**Props:**
```typescript
interface KitchenHeaderProps {
  isGenerating: boolean;
  hasUserData: boolean;
  loadingPhysical: boolean;
  className?: string;
}
```

### RecipeCard.tsx
Renderiza as configurações de cardápio:
- Cards de objetivo (Emagrecer, Manter, Ganhar, Hipertrofia)
- Cards de duração (1d, 3d, 7d)
- Card de meta personalizada com calorias
- Seção de macros calculados
- Seção de preferências e restrições

**Props:**
```typescript
interface RecipeCardProps {
  selectedObjective: NutritionObjective;
  onSelectObjective: (obj: NutritionObjective) => void;
  selectedDays: number;
  onSelectDays: (days: number) => void;
  nutritionalGoals: NutritionalGoals;
  userWeight?: number;
  hasUserData: boolean;
  showPreferences: boolean;
  onTogglePreferences: () => void;
  localPreferences: string[];
  localRestrictions: string[];
  onAddPreference: () => Promise<void>;
  onRemovePreference: (food: string) => Promise<void>;
  onAddRestriction: () => Promise<void>;
  onRemoveRestriction: (food: string) => Promise<void>;
  newPreference: string;
  onNewPreferenceChange: (value: string) => void;
  newRestriction: string;
  onNewRestrictionChange: (value: string) => void;
  getObjectiveLabel: () => string;
  getObjectiveColor: () => string;
  className?: string;
}
```

### CookingAnimation.tsx
Renderiza as animações de cozinha com Framer Motion:
- Panela com ingredientes selecionados
- Chamas animadas (AnimatedFlame)
- Vapor saindo da panela
- Alças da panela
- Base do fogão
- Botões de seleção de refeições (ingredientes)
- Botão de gerar cardápio

**Props:**
```typescript
interface CookingAnimationProps {
  selectedMeals: SelectedMealsType;
  onToggleMeal: (key: keyof SelectedMealsType) => void;
  isGenerating: boolean;
  selectedCount: number;
  onGenerate: () => void;
  className?: string;
}
```

## Uso

```tsx
// Import recomendado (novo)
import { ChefKitchenMealPlan } from '@/components/meal-plan/chef-kitchen';

// Import legado (compatibilidade)
import { ChefKitchenMealPlan } from '@/components/meal-plan/ChefKitchenMealPlan';

// Uso básico
<ChefKitchenMealPlan />

// Com className customizado
<ChefKitchenMealPlan className="max-w-md mx-auto" />
```

## Compatibilidade

O arquivo original `ChefKitchenMealPlan.tsx` foi atualizado para re-exportar do novo local, mantendo compatibilidade total com imports existentes.

```tsx
// Ambos imports funcionam:
import { ChefKitchenMealPlan } from '@/components/meal-plan/chef-kitchen';
import { ChefKitchenMealPlan } from '@/components/meal-plan/ChefKitchenMealPlan';
```

## Requisitos Atendidos

- **Req 3.1**: Pasta `chef-kitchen/` com estrutura modular ✅
- **Req 3.2**: Hook `useChefKitchenLogic.ts` extraído ✅
- **Req 3.3**: `KitchenHeader.tsx` para cabeçalho temático ✅
- **Req 3.4**: `RecipeCard.tsx` para cards de receitas ✅
- **Req 3.5**: `CookingAnimation.tsx` para animações ✅
- **Req 3.6**: Orchestrator com menos de 150 linhas (136 linhas) ✅

## Padrões Seguidos

- ✅ Imports usando `@/` alias para externos
- ✅ Imports relativos para componentes locais
- ✅ Cores semânticas (bg-background, text-foreground)
- ✅ TypeScript tipado
- ✅ Componentes < 300 linhas
- ✅ Orchestrator < 150 linhas (136 linhas)
- ✅ Animações Framer Motion mantidas
- ✅ cn() para className merging

## Dependências

- `framer-motion` - Animações
- `@/components/ui/button` - Botões
- `@/components/ui/input` - Inputs
- `@/components/ui/badge` - Badges
- `@/hooks/useMealPlanGeneratorV2` - Geração de cardápio
- `@/hooks/useUserFoodPreferences` - Preferências alimentares
- `@/hooks/useWeightMeasurement` - Dados físicos do usuário
- `@/components/meal-plan/WeeklyMealPlanModal` - Modal de resultado
- `@/components/meal-plan/MealPlanSuccessEffect` - Efeito de sucesso
- `@/components/meal-plan/creative/MealPlanLoadingExperience` - Loading
- `@/components/meal-plan/MealPlanHistoryDrawer` - Histórico
- `@/utils/macro-calculator` - Cálculo de macros
- `lucide-react` - Ícones

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    ChefKitchenMealPlan                      │
│                      (Orchestrator)                         │
│                       136 linhas                            │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  KitchenHeader  │ │   RecipeCard    │ │CookingAnimation │
│    ~70 linhas   │ │   ~150 linhas   │ │   ~200 linhas   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │    useChefKitchenLogic      │
              │        295 linhas           │
              │                             │
              │  - Estado de refeições      │
              │  - Metas nutricionais       │
              │  - Preferências/Restrições  │
              │  - Geração de cardápio      │
              └─────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│useMealPlanGen...│ │useUserFoodPref..│ │useWeightMeas... │
│   (externo)     │ │   (externo)     │ │   (externo)     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```
