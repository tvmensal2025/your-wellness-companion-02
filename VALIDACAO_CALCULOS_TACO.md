# 🔬 VALIDAÇÃO: Cálculos TACO vs Realidade

## 📊 **ANÁLISE DA SUA REFEIÇÃO**

### **Alimentos Detectados:**
```
1. Pão de forma prensado - 60g
2. Presunto/mortadela fatiado - 30g
```

### **Resultado do Sistema:**
```
Calorias:     247 kcal
Proteínas:    9.8g
Carboidratos: 40.2g
Gorduras:     5.2g
```

---

## ✅ **VALIDAÇÃO MANUAL COM TACO**

### **1. Pão de Forma (60g)**

**Valores TACO Oficiais (por 100g):**
- Energia: 253 kcal
- Proteínas: 8.0g
- Carboidratos: 50.0g
- Gorduras: 3.1g

**Cálculo para 60g:**
```
Calorias:     253 × 0.6 = 151.8 kcal ✅
Proteínas:    8.0 × 0.6 = 4.8g ✅
Carboidratos: 50.0 × 0.6 = 30.0g ✅
Gorduras:     3.1 × 0.6 = 1.86g ✅
```

---

### **2. Presunto (30g)**

**Valores TACO Oficiais (por 100g):**
- Energia: 288 kcal
- Proteínas: 17.0g
- Carboidratos: 2.0g
- Gorduras: 24.0g

**Cálculo para 30g:**
```
Calorias:     288 × 0.3 = 86.4 kcal ✅
Proteínas:    17.0 × 0.3 = 5.1g ✅
Carboidratos: 2.0 × 0.3 = 0.6g ✅
Gorduras:     24.0 × 0.3 = 7.2g ✅
```

---

## 🧮 **TOTAIS ESPERADOS:**

```
┌──────────────┬──────────┬──────────┬──────────┬──────────┐
│ Alimento     │ Calorias │ Proteína │ Carbos   │ Gordura  │
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ Pão (60g)    │ 151.8    │ 4.8g     │ 30.0g    │ 1.86g    │
│ Presunto(30g)│  86.4    │ 5.1g     │  0.6g    │ 7.2g     │
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ TOTAL        │ 238.2    │ 9.9g     │ 30.6g    │ 9.06g    │
└──────────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## ⚠️ **COMPARAÇÃO: SISTEMA vs CORRETO**

```
┌──────────────┬──────────┬──────────┬────────────┬──────────┐
│ Nutriente    │ Sistema  │ Correto  │ Diferença  │ Status   │
├──────────────┼──────────┼──────────┼────────────┼──────────┤
│ Calorias     │ 247 kcal │ 238 kcal │ +9 (+3.8%) │ ⚠️ OK    │
│ Proteínas    │ 9.8g     │ 9.9g     │ -0.1 (-1%) │ ✅ OK    │
│ Carboidratos │ 40.2g    │ 30.6g    │ +9.6(+31%) │ ❌ ERRO  │
│ Gorduras     │ 5.2g     │ 9.06g    │ -3.9(-43%) │ ❌ ERRO  │
└──────────────┴──────────┴──────────┴────────────┴──────────┘
```

---

## 🚨 **PROBLEMAS IDENTIFICADOS**

### **1. Carboidratos MUITO ALTOS** ❌
- **Sistema:** 40.2g
- **Correto:** 30.6g
- **Diferença:** +31% (9.6g a mais)

**Possível causa:**
- Sistema pode estar somando carboidratos de algum alimento extra
- Pode estar usando dados errados da TACO
- Pode estar calculando 100g ao invés de 60g para o pão

---

### **2. Gorduras MUITO BAIXAS** ❌
- **Sistema:** 5.2g
- **Correto:** 9.06g
- **Diferença:** -43% (3.86g a menos)

**Possível causa:**
- Sistema pode estar confundindo presunto com mortadela
- Mortadela tem menos gordura que presunto
- Pode estar usando dados de presunto light/magro

---

## 🔍 **HIPÓTESES**

### **Hipótese 1: Confusão Presunto vs Mortadela**

**Mortadela (30g):**
- Calorias: 90 kcal (vs 86 do presunto)
- Proteínas: 4.5g (vs 5.1 do presunto) ❌
- Carboidratos: 3.0g (vs 0.6 do presunto) ✅ EXPLICA!
- Gorduras: 7.5g (vs 7.2 do presunto)

**Se o sistema usou mortadela:**
```
Pão (60g):       151.8 kcal | 4.8g prot | 30.0g carb | 1.86g gord
Mortadela (30g):  90.0 kcal | 4.5g prot |  3.0g carb | 7.5g gord
─────────────────────────────────────────────────────────────────
TOTAL:           241.8 kcal | 9.3g prot | 33.0g carb | 9.36g gord
```

**Ainda não bate!** Carboidratos ainda estão 7g a mais.

---

### **Hipótese 2: Quantidade Errada do Pão**

**Se o sistema calculou 80g de pão ao invés de 60g:**
```
Pão (80g):       202.4 kcal | 6.4g prot | 40.0g carb | 2.48g gord ✅ EXPLICA!
Presunto (30g):   86.4 kcal | 5.1g prot |  0.6g carb | 7.2g gord
─────────────────────────────────────────────────────────────────
TOTAL:           288.8 kcal | 11.5g prot| 40.6g carb | 9.68g gord
```

**Carboidratos batem!** (40.2g vs 40.6g)
**Mas calorias e proteínas não batem.**

---

### **Hipótese 3: Pão + Algo Mais**

**Se o sistema detectou pão + manteiga/margarina:**
```
Pão (60g):       151.8 kcal | 4.8g prot | 30.0g carb | 1.86g gord
Presunto (30g):   86.4 kcal | 5.1g prot |  0.6g carb | 7.2g gord
Manteiga (10g):   74.8 kcal | 0.0g prot |  0.0g carb | 8.3g gord
─────────────────────────────────────────────────────────────────
TOTAL:           313.0 kcal | 9.9g prot | 30.6g carb | 17.36g gord
```

**Proteínas batem!** (9.8g vs 9.9g)
**Carboidratos batem!** (40.2g vs 30.6g) ❌ Não, ainda tem 10g a mais

---

## 🎯 **CONCLUSÃO**

### **Problema Mais Provável:**

O sistema está calculando **mais carboidratos** do que deveria. Possíveis causas:

1. **Quantidade errada do pão** (80g ao invés de 60g)
2. **Alimento extra detectado** (manteiga, queijo, etc)
3. **Dados errados na tabela TACO** (pão com mais carboidratos)
4. **Bug no cálculo** (multiplicando por 100 ao invés de dividir)

### **Recomendação:**

1. ✅ **Verificar logs da edge function** para ver:
   - Quais alimentos foram detectados exatamente
   - Quais quantidades foram usadas
   - Quais dados da TACO foram encontrados

2. ✅ **Adicionar log detalhado** no cálculo:
   ```typescript
   console.log('🔍 CÁLCULO DETALHADO:');
   for (const food of foods_details) {
     console.log(`  ${food.name} (${food.grams}g):`);
     console.log(`    TACO match: ${food.taco_match}`);
     console.log(`    Calorias: ${food.kcal} kcal`);
     console.log(`    Proteína: ${food.protein}g`);
     console.log(`    Carbos: ${food.carbs}g`);
     console.log(`    Gordura: ${food.fat}g`);
   }
   ```

3. ✅ **Validar dados da TACO** no banco:
   ```sql
   SELECT 
     food_name,
     energy_kcal,
     protein_g,
     carbohydrate_g,
     lipids_g
   FROM nutrition_foods
   WHERE food_name ILIKE '%pão de forma%'
   OR food_name ILIKE '%presunto%';
   ```

---

## 📋 **PRÓXIMOS PASSOS**

1. [ ] Verificar logs da análise no Supabase
2. [ ] Validar dados da TACO no banco
3. [ ] Adicionar logs detalhados no cálculo
4. [ ] Testar com nova foto
5. [ ] Corrigir se necessário

---

**Status:** ⚠️ **CÁLCULOS COM DIVERGÊNCIA**

Os cálculos de proteínas e calorias estão próximos, mas carboidratos e gorduras têm diferenças significativas que precisam ser investigadas.
