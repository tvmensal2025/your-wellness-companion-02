# 🔍 COMO VERIFICAR SE OS PROGRAMAS ESTÃO SENDO SALVOS

## ✅ **SISTEMA COM LOGS COMPLETOS IMPLEMENTADO!**

---

## 📊 **AGORA O SISTEMA TEM LOGS VISUAIS:**

Quando você clicar em **"Começar Hoje!"**, você verá no console:

```javascript
🔵 INICIANDO SALVAMENTO DO PROGRAMA: 🛋️ Do Sofá ao Movimento
✅ Usuário autenticado: abc123-def456-...
📝 Desativando programas anteriores...
✅ Programas anteriores desativados
📊 Duração extraída: 4 semanas
📋 Dados do programa: { modality: 'walking', duration_weeks: 4, ... }
💾 Inserindo novo programa no Supabase...
✅ PROGRAMA SALVO COM SUCESSO! { id: '...', name: '...', ... }
🔄 Atualizando lista de programas...
✅ Lista atualizada!
```

---

## 🎯 **PASSO A PASSO PARA VERIFICAR:**

### **1. ABRA O CONSOLE DO NAVEGADOR:**

**Chrome/Edge:**
```
Pressione: F12
ou
Botão direito → Inspecionar → Console
```

**Firefox:**
```
Pressione: F12
ou
Ctrl+Shift+K (Windows)
Cmd+Option+K (Mac)
```

**Safari:**
```
Cmd+Option+C
```

---

### **2. CRIE UM PROGRAMA:**

**a) Acesse:**
```
http://localhost:8080
```

**b) Menu lateral:**
```
Clique em: 🏋️ Exercícios Recomendados
```

**c) Crie programa:**
```
1. Clique "Criar Meu Programa"
2. Responda as 5 perguntas
3. Clique "Começar Hoje!"
```

**d) OLHE O CONSOLE:**

Você DEVE ver:
```
🔵 INICIANDO SALVAMENTO DO PROGRAMA: ...
✅ Usuário autenticado: ...
📝 Desativando programas anteriores...
✅ Programas anteriores desativados
📊 Duração extraída: 4 semanas
📋 Dados do programa: {...}
💾 Inserindo novo programa no Supabase...
✅ PROGRAMA SALVO COM SUCESSO! {...}
🔄 Atualizando lista de programas...
✅ Lista atualizada!
```

**e) DEVE APARECER:**
- ✅ Toast verde: "Programa Salvo! 🎉"
- ✅ Dashboard mostra o programa
- ✅ Estatísticas aparecem (Semana 1, 0/12 treinos, etc)

---

### **3. VERIFIQUE NO SUPABASE:**

**a) Acesse Supabase:**
```
https://supabase.com
→ Login
→ Seu projeto
→ Table Editor (ícone de tabela na lateral)
→ Tabela: sport_training_plans
```

**b) Filtre por seu usuário:**
```
user_id = seu UUID
```

**c) Você DEVE ver:**
```
┌────────────────────────────────────────────────────┐
│ id | name                  | is_active | status  │
├────────────────────────────────────────────────────┤
│ 1  | Do Sofá ao Movimento  | true      | active  │
│    | duration_weeks: 4                             │
│    | current_week: 1                               │
│    | completed_workouts: 0                         │
│    | total_workouts: 12                            │
│    | week_plan: {JSON com 4 semanas}               │
└────────────────────────────────────────────────────┘
```

---

### **4. MARQUE UM TREINO:**

**a) No dashboard, clique:**
```
[Marcar Completo] no primeiro treino
```

**b) OLHE O CONSOLE:**
```
🔵 MARCANDO TREINO COMO COMPLETO: {planId: '...', weekNumber: 1, dayNumber: 1}
💾 Inserindo log de treino no Supabase...
✅ Log de treino inserido com sucesso!
📊 Buscando dados do programa...
📈 Atualizando progresso: {
  completedWorkouts: "0 → 1",
  currentWeek: "1 → 1",
  shouldAdvanceWeek: false,
  isCompleted: false
}
✅ Programa atualizado com sucesso!
✅ Treino 1/12 completo
🔄 Atualizando lista de programas e logs...
✅ Dados atualizados!
```

**c) DEVE APARECER:**
- ✅ Treino fica verde
- ✅ Toast: "Treino Completo! ✅ ... 11 treinos restantes!"
- ✅ Contador: 0/12 → 1/12
- ✅ Barra de progresso: 0% → 8%

**d) Verifique no Supabase:**

**Tabela sport_workout_logs:**
```
┌────────────────────────────────────────────────┐
│ plan_id | week | day | completed | completed_at│
├────────────────────────────────────────────────┤
│ xxx-... | 1    | 1   | true      | 2025-10-18  │
└────────────────────────────────────────────────┘
```

**Tabela sport_training_plans:**
```
Linha do seu programa deve ter:
├─ completed_workouts: 1 (era 0!)
└─ current_week: 1
```

---

### **5. MARQUE 3 TREINOS E VEJA SEMANA AVANÇAR:**

**a) Marque o 2º treino:**
```
Console:
✅ Treino 2/12 completo

Supabase:
completed_workouts: 2
current_week: 1
```

**b) Marque o 3º treino:**
```
Console:
📈 Atualizando progresso: {
  completedWorkouts: "2 → 3",
  currentWeek: "1 → 2",  ← AVANÇOU!
  shouldAdvanceWeek: true
}
✅ Treino 3/12 completo

Supabase:
completed_workouts: 3
current_week: 2 ← AVANÇOU AUTOMATICAMENTE!

Dashboard:
📅 Treinos desta Semana (Semana 2) ← MUDOU!
```

---

## 🚨 **SE NÃO ESTIVER SALVANDO:**

### **Cenário 1: Erro no Console**

Se você ver no console:
```
❌ ERRO ao inserir programa: {...}
```

**Causas possíveis:**

**A) RLS Policy bloqueando:**
```sql
-- Execute no Supabase SQL Editor:

-- Verificar se pode inserir
SELECT has_table_privilege('sport_training_plans', 'INSERT');

-- Se der erro, criar policy:
CREATE POLICY "Usuários podem criar seus programas"
ON sport_training_plans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

**B) Tabela não existe:**
```sql
-- Verifique se tabela existe:
SELECT * FROM sport_training_plans LIMIT 1;

-- Se não existir, execute:
-- CRIAR_SISTEMA_MODALIDADES_ESPORTIVAS_CORRIGIDO.sql
```

**C) Campos faltando:**
```sql
-- Verifique estrutura da tabela:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sport_training_plans';
```

---

### **Cenário 2: Toast não aparece**

**Possíveis causas:**

1. **Toast provider não configurado:**
```typescript
// Verifique se App.tsx tem:
<Toaster />
```

2. **Função não está sendo chamada:**
```typescript
// Adicione console.log antes do saveProgram:
console.log('CLICOU EM COMEÇAR HOJE');
await saveProgram(...);
```

---

### **Cenário 3: Dashboard não atualiza**

**Solução:**

1. **Refresh da página:**
```
F5 ou Ctrl+R
```

2. **Verificar useEffect:**
```typescript
// O hook deve ter:
useEffect(() => {
  if (userId) fetchPrograms();
}, [userId]);
```

3. **Verificar no Supabase diretamente:**
```sql
SELECT * FROM sport_training_plans 
WHERE user_id = auth.uid() 
AND is_active = true;
```

---

## ✅ **CHECKLIST FINAL:**

```
□ 1. Console mostra: "🔵 INICIANDO SALVAMENTO..."
□ 2. Console mostra: "✅ PROGRAMA SALVO COM SUCESSO!"
□ 3. Toast aparece: "Programa Salvo! 🎉"
□ 4. Dashboard mostra o programa ativo
□ 5. Supabase tem linha na tabela sport_training_plans
□ 6. Ao marcar treino, console mostra: "🔵 MARCANDO TREINO..."
□ 7. Console mostra: "✅ Log de treino inserido..."
□ 8. Toast: "Treino Completo! ✅"
□ 9. Contador aumenta (0/12 → 1/12)
□ 10. Supabase tem linha na tabela sport_workout_logs
□ 11. Ao marcar 3 treinos, semana avança (1 → 2)
□ 12. Console mostra: "currentWeek: 1 → 2"
```

---

## 🚀 **TESTE AGORA:**

1. **Abra:** `http://localhost:8080`
2. **Abra Console:** F12
3. **Crie programa**
4. **OLHE O CONSOLE**
5. **Veja os logs em tempo real**
6. **Verifique no Supabase**

---

## 📖 **COMANDOS SQL ÚTEIS:**

### **Ver todos seus programas:**
```sql
SELECT 
  name,
  status,
  current_week,
  completed_workouts,
  total_workouts,
  created_at
FROM sport_training_plans 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### **Ver todos treinos marcados:**
```sql
SELECT 
  week_number,
  day_number,
  completed,
  completed_at
FROM sport_workout_logs 
WHERE user_id = auth.uid()
ORDER BY completed_at DESC;
```

### **Ver progresso do programa ativo:**
```sql
SELECT 
  name,
  current_week || '/' || duration_weeks as semanas,
  completed_workouts || '/' || total_workouts as treinos,
  ROUND((completed_workouts::float / total_workouts::float) * 100, 1) as progresso_percent
FROM sport_training_plans 
WHERE user_id = auth.uid() 
AND is_active = true;
```

---

## 🎊 **AGORA COM LOGS COMPLETOS:**

**✅ Logs no console para TUDO:**
- Salvar programa
- Marcar treino completo
- Avançar semana
- Completar programa
- Erros detalhados

**✅ Feedback visual:**
- Toasts informativos
- Dashboard atualiza em tempo real
- Cores visuais (verde = completo)

**✅ Dados no Supabase:**
- Tabela sport_training_plans
- Tabela sport_workout_logs
- Histórico completo

**TESTE AGORA E VERIFIQUE OS LOGS!** 🚀

