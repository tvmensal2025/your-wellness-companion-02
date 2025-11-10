# 🔧 CORREÇÃO DO ERRO DE SALVAMENTO

## ❌ **PROBLEMA IDENTIFICADO:**
```
ERRO FATAL ao salvar programa: {
  code: "PGRST204",
  message: "Could not find the 'modality' column of 'sport_training_plans'"
}
```

## ✅ **SOLUÇÃO:**

### **1. Executar SQL no Supabase:**
```sql
-- Adicionar coluna modality que está faltando
ALTER TABLE public.sport_training_plans 
ADD COLUMN IF NOT EXISTS modality TEXT;

-- Adicionar outras colunas necessárias
ALTER TABLE public.sport_training_plans 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS level TEXT,
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS frequency_per_week INTEGER,
ADD COLUMN IF NOT EXISTS time_per_session TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS week_plan JSONB,
ADD COLUMN IF NOT EXISTS current_week INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_workouts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_workouts INTEGER DEFAULT 0;
```

### **2. Verificar se funcionou:**
1. Abrir o Supabase Dashboard
2. Ir para SQL Editor
3. Executar o SQL acima
4. Testar o modal de exercícios novamente

### **3. Teste de Funcionamento:**
1. Clicar em "Exercícios Recomendados"
2. Preencher o questionário
3. Clicar em "Começar Hoje!"
4. Verificar se salva sem erro

## 📋 **COLUNAS ADICIONADAS:**
- ✅ `modality` - Modalidade do treino
- ✅ `name` - Nome do programa
- ✅ `description` - Descrição
- ✅ `level` - Nível do usuário
- ✅ `goal` - Objetivo
- ✅ `location` - Local de treino
- ✅ `frequency_per_week` - Frequência semanal
- ✅ `time_per_session` - Tempo por sessão
- ✅ `is_active` - Se está ativo
- ✅ `start_date` - Data de início
- ✅ `completion_date` - Data de conclusão
- ✅ `week_plan` - Plano semanal (JSON)
- ✅ `current_week` - Semana atual
- ✅ `total_workouts` - Total de treinos
- ✅ `completed_workouts` - Treinos completados

## 🎯 **RESULTADO ESPERADO:**
Após executar o SQL, o modal de exercícios deve funcionar perfeitamente sem erros de salvamento.


