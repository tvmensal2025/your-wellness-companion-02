# 🔍 Diagnóstico: meal_type já existe no banco

## ✅ Descoberta

A coluna `meal_type` **JÁ EXISTE** na tabela `sofia_food_analysis` desde a migration `20260105184809_52614b87-1a13-4dc1-b6f3-2a9750488b9e.sql`:

```sql
ALTER TABLE public.sofia_food_analysis 
ADD COLUMN IF NOT EXISTS meal_type TEXT DEFAULT 'refeicao';
```

## 🔍 Possíveis Causas do Problema

Se o dashboard ainda mostra 0 kcal para as refeições, o problema pode ser:

### 1. Dados Antigos sem meal_type
Registros criados antes da migration podem ter `meal_type = NULL` ou `'refeicao'`

### 2. Normalização Incorreta
A função `normalizeMealType()` pode estar retornando valores diferentes do esperado

### 3. Query do Dashboard
O hook `useDailyNutritionReport` pode estar filtrando incorretamente

### 4. Mapeamento de Valores
Incompatibilidade entre valores salvos e valores esperados

## 🧪 Testes Necessários

### 1. Verificar Dados Existentes

```sql
-- Ver distribuição de meal_type
SELECT 
  meal_type, 
  COUNT(*) as total,
  SUM(calories) as total_calories
FROM sofia_food_analysis
WHERE user_id = 'SEU_USER_ID'
  AND created_at >= CURRENT_DATE
GROUP BY meal_type;
```

### 2. Verificar Valores Salvos

```sql
-- Ver últimas análises
SELECT 
  id,
  meal_type,
  calories,
  created_at,
  analysis_result->>'alimentos' as alimentos
FROM sofia_food_analysis
WHERE user_id = 'SEU_USER_ID'
ORDER BY created_at DESC
LIMIT 10;
```

### 3. Verificar Normalização

Os valores esperados pelo dashboard são:
- `breakfast` ou `cafe_da_manha`
- `lunch` ou `almoco`
- `snack` ou `lanche`
- `dinner` ou `jantar`

Mas a edge function normaliza para:
- `cafe_da_manha`
- `almoco`
- `lanche`
- `jantar`
- `ceia`

### 4. Verificar Hook useDailyNutritionReport

```typescript
// src/hooks/useDailyNutritionReport.ts
export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'refeicao';

// ❌ PROBLEMA: Hook espera valores em INGLÊS
// ✅ Edge function salva em PORTUGUÊS
```

## 🎯 Solução Real

O problema é **incompatibilidade de valores**:

- **Edge function salva:** `cafe_da_manha`, `almoco`, `lanche`, `jantar`
- **Hook espera:** `breakfast`, `lunch`, `snack`, `dinner`

### Opção 1: Mudar Edge Function (Recomendado)
Salvar em inglês para compatibilidade com o hook:

```typescript
// supabase/functions/sofia-image-analysis/index.ts
function normalizeMealType(mealType: string | undefined | null): string {
  // ... código existente ...
  
  // Retornar em INGLÊS
  const mealTypeMap: Record<string, string> = {
    'breakfast': 'breakfast',
    'lunch': 'lunch',
    'dinner': 'dinner',
    'snack': 'snack',
    'supper': 'supper',
    'cafe_da_manha': 'breakfast',
    'almoco': 'lunch',
    'jantar': 'dinner',
    'lanche': 'snack',
    'ceia': 'supper',
  };
  
  return mealTypeMap[normalized] || detectMealTypeByTime();
}

function detectMealTypeByTime(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 18) return 'snack';
  if (hour >= 18 && hour < 22) return 'dinner';
  return 'supper';
}
```

### Opção 2: Mudar Hook
Aceitar valores em português:

```typescript
// src/hooks/useDailyNutritionReport.ts
export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'refeicao' | 
                       'cafe_da_manha' | 'almoco' | 'lanche' | 'jantar' | 'ceia';

// Normalizar ao ler
const parsed: MacroRow[] = (data || []).map((r: any) => {
  const mealTypeMap: Record<string, MealSlot> = {
    'cafe_da_manha': 'breakfast',
    'almoco': 'lunch',
    'lanche': 'snack',
    'jantar': 'dinner',
    'ceia': 'dinner',
  };
  
  const rawMealType = r.meal_type || 'refeicao';
  const normalizedMealType = mealTypeMap[rawMealType] || rawMealType;
  
  return {
    day: (r.created_at || '').slice(0, 10),
    meal_type: normalizedMealType as MealSlot,
    // ...
  };
});
```

## 📝 Próximos Passos

1. ✅ Verificar dados existentes no banco
2. ✅ Identificar valores de meal_type salvos
3. ✅ Escolher estratégia de normalização
4. ✅ Aplicar correção
5. ✅ Testar dashboard

## 🔧 Script de Diagnóstico

```sql
-- Executar no Supabase SQL Editor
SELECT 
  'Distribuição de meal_type' as info,
  meal_type,
  COUNT(*) as registros,
  ROUND(SUM(calories)::numeric, 0) as total_calorias
FROM sofia_food_analysis
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY meal_type
ORDER BY registros DESC;
```
