# ✅ CORREÇÃO DO ERRO plan_name

## ❌ **PROBLEMA IDENTIFICADO:**
```
ERRO FATAL ao salvar programa: {
  code: "23502",
  message: "null value in column \"plan_name\" of relation \"sport_training_plans\" violates not-null constraint"
}
```

## 🔧 **CORREÇÕES APLICADAS:**

### **1. useExerciseProgram.ts**
- ✅ Corrigido `name: programData.title` → `plan_name: programData.title`
- ✅ Atualizada interface `SavedProgram` para usar `plan_name`

### **2. ExerciseDashboard.tsx**
- ✅ Corrigido `activeProgram.name` → `activeProgram.plan_name`
- ✅ Corrigido `program.name` → `program.plan_name` (2 ocorrências)

## 📋 **ARQUIVOS MODIFICADOS:**
1. `src/hooks/useExerciseProgram.ts` - Linha 172
2. `src/hooks/useExerciseProgram.ts` - Interface SavedProgram (linha 23)
3. `src/components/exercise/ExerciseDashboard.tsx` - 3 ocorrências corrigidas

## 🎯 **RESULTADO:**
O modal de exercícios agora deve funcionar perfeitamente sem erros de salvamento!

### **Teste:**
1. Clicar em "Exercícios Recomendados"
2. Preencher o questionário
3. Clicar em "Começar Hoje!"
4. ✅ Deve salvar sem erro

## 🔍 **VERIFICAÇÃO:**
- ✅ Nenhum erro de lint
- ✅ Todas as referências corrigidas
- ✅ Interface atualizada
- ✅ Código consistente


