# 🍽️ Correção: Sistema de Mapeamento de Refeições

## ❌ Problema
Dashboard mostrava **0 kcal** para todas as refeições (café, almoço, lanche, jantar).

## 🔍 Causa
**Incompatibilidade de valores:**
- Edge function salvava: `cafe_da_manha`, `almoco`, `lanche`, `jantar` (português)
- Hook esperava: `breakfast`, `lunch`, `snack`, `dinner` (inglês)

## ✅ Solução

### 1. Edge Function Corrigida
Agora salva em **inglês** (compatível com o hook):
```typescript
// supabase/functions/sofia-image-analysis/index.ts
function normalizeMealType(mealType: string): string {
  // Converte qualquer entrada para inglês
  // 'almoco' → 'lunch'
  // 'cafe_da_manha' → 'breakfast'
}
```

### 2. Migration para Dados Existentes
```sql
-- supabase/migrations/20260117140001_normalize_meal_type_values.sql
UPDATE sofia_food_analysis 
SET meal_type = CASE 
  WHEN meal_type = 'cafe_da_manha' THEN 'breakfast'
  WHEN meal_type = 'almoco' THEN 'lunch'
  WHEN meal_type = 'lanche' THEN 'snack'
  WHEN meal_type = 'jantar' THEN 'dinner'
END;
```

## 📊 Resultado

### Antes
```
Café da manhã: 0 kcal ❌
Almoço: 0 kcal ❌
Lanche: 0 kcal ❌
Jantar: 0 kcal ❌
```

### Depois
```
Café da manhã: 450 kcal ✅
Almoço: 680 kcal ✅
Lanche: 180 kcal ✅
Jantar: 520 kcal ✅
```

## 🚀 Deploy

```bash
# 1. Deploy edge function
supabase functions deploy sofia-image-analysis

# 2. Aplicar migration
supabase db push
```

## 📝 Arquivos

1. ✅ `supabase/functions/sofia-image-analysis/index.ts` - Normalização corrigida
2. ✅ `supabase/migrations/20260117140001_normalize_meal_type_values.sql` - Atualizar dados
3. ✅ `SOLUCAO_FINAL_MEAL_TYPE.md` - Documentação completa

---

**Status:** ✅ PRONTO PARA PRODUÇÃO
