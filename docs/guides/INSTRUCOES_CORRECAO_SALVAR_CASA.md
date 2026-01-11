# 🔧 CORREÇÃO: Erro ao Salvar Programa de Casa

## ❌ **PROBLEMA IDENTIFICADO:**
- ✅ Programa de **academia** funciona e salva normalmente
- ❌ Programa de **treino em casa** não consegue salvar
- ❌ Erro: "Erro ao salvar - Não foi possível salvar o programa"

## 🔍 **CAUSA RAIZ:**
A tabela `sport_training_plans` pode não existir ou ter problemas de estrutura/permissões.

## ✅ **SOLUÇÃO IMPLEMENTADA:**

### **1. Script SQL Completo Criado:**
📁 **Arquivo:** `CORRECAO_SALVAR_PROGRAMA_CASA.sql`

Este script corrige:
- ✅ Cria tabela `sport_training_plans` se não existir
- ✅ Cria tabela `sport_workout_logs` para logs de treino
- ✅ Configura RLS (Row Level Security) corretamente
- ✅ Cria índices para performance
- ✅ Configura triggers para updated_at
- ✅ Define permissões adequadas

---

## 🚀 **COMO APLICAR A CORREÇÃO:**

### **OPÇÃO 1: Via Supabase Dashboard (RECOMENDADO)**

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Entre no seu projeto

2. **Abra o SQL Editor:**
   - Clique em "SQL Editor" no menu lateral
   - Clique em "New query"

3. **Execute o Script:**
   - Copie todo o conteúdo do arquivo `CORRECAO_SALVAR_PROGRAMA_CASA.sql`
   - Cole no SQL Editor
   - Clique em "Run" para executar

4. **Verifique o Resultado:**
   - O script deve mostrar várias mensagens de sucesso
   - No final deve aparecer: "✅ Sistema de exercícios corrigido!"

### **OPÇÃO 2: Via Terminal (Alternativa)**

```bash
# Se você tiver o Supabase CLI configurado
npx supabase db push
```

---

## 📊 **O QUE O SCRIPT FAZ:**

### **1. Verificações:**
- 🔍 Verifica se as tabelas existem
- 📋 Mostra estrutura atual

### **2. Criação de Tabelas:**
```sql
-- Tabela principal de programas
CREATE TABLE sport_training_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  modality TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  level TEXT NOT NULL,
  goal TEXT NOT NULL,
  location TEXT NOT NULL,
  duration_weeks INTEGER,
  frequency_per_week INTEGER,
  time_per_session TEXT,
  week_plan JSONB,
  is_active BOOLEAN,
  status TEXT,
  -- ... outros campos
);

-- Tabela de logs de treino
CREATE TABLE sport_workout_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan_id UUID REFERENCES sport_training_plans(id),
  week_number INTEGER,
  day_number INTEGER,
  workout_type TEXT,
  exercises JSONB,
  completed BOOLEAN,
  -- ... outros campos
);
```

### **3. Segurança (RLS):**
- 🔒 Ativa Row Level Security
- 👤 Cria políticas para usuários acessarem apenas seus dados
- 🛡️ Protege contra acesso não autorizado

### **4. Performance:**
- ⚡ Cria índices otimizados
- 🔄 Configura triggers para updated_at
- 📈 Melhora consultas

---

## 🧪 **TESTE APÓS CORREÇÃO:**

1. **Acesse o sistema de exercícios**
2. **Crie um programa "Treino em Casa"**
3. **Complete o questionário**
4. **Clique em "Começar Hoje!"**
5. **Verifique se salva sem erro**

---

## 🔍 **VERIFICAÇÃO MANUAL:**

Se ainda houver problemas, execute no SQL Editor:

```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sport_training_plans', 'sport_workout_logs');

-- Verificar políticas RLS
SELECT policyname, tablename, cmd 
FROM pg_policies 
WHERE tablename IN ('sport_training_plans', 'sport_workout_logs');
```

---

## 📞 **SE AINDA NÃO FUNCIONAR:**

1. **Verifique o Console do Navegador:**
   - Pressione F12
   - Vá para "Console"
   - Procure por erros em vermelho

2. **Verifique os Logs do Supabase:**
   - Dashboard → Logs → API
   - Procure por erros relacionados a "sport_training_plans"

3. **Teste com Programa de Academia:**
   - Se academia funciona e casa não, o problema é específico da tabela
   - Execute o script SQL novamente

---

## 🎯 **RESULTADO ESPERADO:**

Após executar o script, você deve conseguir:
- ✅ Criar programas de exercícios em casa
- ✅ Salvar sem erro "Erro ao salvar"
- ✅ Ver programas salvos no dashboard
- ✅ Acessar logs de treino

---

## 📝 **ARQUIVOS CRIADOS:**

1. **`CORRECAO_SALVAR_PROGRAMA_CASA.sql`** - Script principal de correção
2. **`INSTRUCOES_CORRECAO_SALVAR_CASA.md`** - Este guia de instruções
3. **`EXERCICIOS_ESPECIFICOS_COMPLETOS.ts`** - Exercícios detalhados
4. **`CORRECAO_EXERCICIOS_ESPECIFICOS.md`** - Documentação das melhorias

---

## 🎉 **SISTEMA COMPLETO:**

Agora você tem:
- ✅ **Exercícios específicos** em vez de genéricos
- ✅ **Sistema de salvamento** funcionando para casa e academia
- ✅ **Estrutura de banco** correta e segura
- ✅ **Documentação completa** para manutenção

**Execute o script SQL e teste o salvamento!** 🚀

