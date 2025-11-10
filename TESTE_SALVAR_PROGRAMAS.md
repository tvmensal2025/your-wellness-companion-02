# ✅ GUIA DE TESTE - SALVAR PROGRAMAS NO BANCO

## 🎯 **COMO VERIFICAR SE ESTÁ SALVANDO:**

---

## 📋 **PASSO A PASSO COMPLETO:**

### **1. ACESSE O SISTEMA:**
```
http://localhost:8080
```

### **2. FAÇA LOGIN:**
- Entre com seu usuário
- Acesse o dashboard

### **3. CRIE UM PROGRAMA:**

**a) Clique no menu lateral:**
```
🏋️ Exercícios Recomendados
```

**b) Se for primeira vez, clique:**
```
[Criar Meu Programa]
```

**c) Responda as 5 perguntas:**
```
Pergunta 1: Escolha "🛋️ Sedentário"
Pergunta 2: Escolha "⏱️ 10-15 minutos"
Pergunta 3: Escolha "🏠 Em casa (sem equipamento)"
Pergunta 4: Escolha "💪 Ganhar condicionamento"
Pergunta 5: Escolha "✅ Nenhuma"
```

**d) Veja a recomendação:**
```
Você verá:
🛋️ Do Sofá ao Movimento
Programa Super Iniciante
4 semanas | 3-5x por semana | 10-20 minutos
```

**e) CLIQUE EM "COMEÇAR HOJE!"**
```
⚠️ IMPORTANTE: Este botão SALVA o programa no banco!

Você deve ver:
✅ Toast: "Programa Salvo! 🎉"
✅ Modal fecha
✅ Dashboard atualiza e mostra o programa ativo
```

---

### **4. VERIFICAR SE SALVOU NO SUPABASE:**

**a) Abra o Supabase:**
```
https://supabase.com
→ Seu projeto
→ Table Editor
→ Tabela: sport_training_plans
```

**b) Você deve ver uma linha com:**
```
├─ user_id: Seu ID
├─ name: "🛋️ Do Sofá ao Movimento"
├─ description: "Comece devagar..."
├─ level: "sedentario"
├─ goal: "condicionamento"
├─ location: "casa_sem"
├─ duration_weeks: 4
├─ frequency_per_week: 3
├─ is_active: true
├─ status: "active"
├─ current_week: 1
├─ total_workouts: 12
├─ completed_workouts: 0
└─ week_plan: {JSON com 4 semanas}
```

---

### **5. MARCAR TREINO COMO COMPLETO:**

**a) No dashboard, você verá:**
```
📅 Treinos desta Semana (Semana 1)

□ Treino 1: Caminhada 10min, Alongamento 5min
  [Marcar Completo]

□ Treino 2: Caminhada 10min, Alongamento 5min  
  [Marcar Completo]
```

**b) Clique em "Marcar Completo" no primeiro treino:**
```
✅ Treino fica verde
✅ Toast: "Treino Completo! ✅"
✅ Contador atualiza: 1/12 treinos
```

**c) Verificar no Supabase:**
```
Tabela: sport_workout_logs

Você deve ver uma linha:
├─ user_id: Seu ID
├─ plan_id: ID do programa
├─ week_number: 1
├─ day_number: 1
├─ completed: true
├─ completed_at: Data/hora atual
```

**d) Verificar na tabela sport_training_plans:**
```
A linha do seu programa deve ter:
├─ completed_workouts: 1 (era 0, agora é 1)
└─ current_week: 1 (ainda na semana 1)
```

---

### **6. MARCAR MAIS TREINOS:**

**a) Marque o segundo treino:**
```
✅ completed_workouts: 2
```

**b) Marque o terceiro treino:**
```
✅ completed_workouts: 3
✅ current_week: 2 (AVANÇOU AUTOMATICAMENTE!)
✅ Toast: "Treino Completo! 9 treinos restantes!"
```

---

### **7. VERIFICAR HISTÓRICO:**

**a) Clique em "Ver Histórico":**
```
Você verá todos seus programas:

📜 Histórico de Programas

┌─────────────────────────────────────┐
│ 🛋️ Do Sofá ao Movimento   [Ativo]  │
│ 4 semanas • 3x/semana               │
│ ████░░░░░░░░░░░  3/12 (25%)        │
└─────────────────────────────────────┘
```

---

## 🔍 **TROUBLESHOOTING:**

### **❌ PROBLEMA: "Programa Salvo" não aparece**

**Possíveis causas:**

1. **Usuário não logado:**
```
Solução: Verifique se está logado
Teste: console.log(user) deve mostrar objeto
```

2. **Erro no Supabase:**
```
Solução: Abra o console do navegador (F12)
Procure por erros em vermelho
Verifique se as tabelas existem no Supabase
```

3. **RLS Policies:**
```
Solução: Verifique se as policies permitem INSERT
SQL para verificar:
SELECT * FROM sport_training_plans WHERE user_id = auth.uid();
```

---

### **❌ PROBLEMA: Programa não aparece no dashboard**

**Solução:**

1. **Atualize a página:**
```
Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
```

2. **Verifique no Supabase:**
```
SELECT * FROM sport_training_plans 
WHERE user_id = 'SEU_USER_ID' 
AND is_active = true;
```

3. **Verifique console:**
```
F12 → Console
Procure por erros
```

---

### **❌ PROBLEMA: "Marcar Completo" não funciona**

**Solução:**

1. **Verifique RLS:**
```sql
-- No Supabase SQL Editor:
SELECT * FROM sport_workout_logs WHERE user_id = auth.uid();
```

2. **Verifique console do navegador:**
```
F12 → Console → Network
Procure por requisições falhando
```

---

## ✅ **TESTE COMPLETO (5 MINUTOS):**

### **CHECKLIST:**

```
□ 1. Acessar http://localhost:8080
□ 2. Fazer login
□ 3. Menu → "Exercícios Recomendados"
□ 4. Clicar "Criar Meu Programa"
□ 5. Responder 5 perguntas
□ 6. Clicar "Começar Hoje!"
□ 7. Ver toast "Programa Salvo!"
□ 8. Dashboard mostra programa ativo
□ 9. Clicar "Marcar Completo" em um treino
□ 10. Ver treino ficar verde
□ 11. Ver contador aumentar (0/12 → 1/12)
□ 12. Marcar 2 treinos adicionais
□ 13. Ver semana avançar (Semana 1 → Semana 2)
□ 14. Clicar "Ver Histórico"
□ 15. Ver programa listado com progresso
□ 16. Abrir Supabase
□ 17. Ver dados na tabela sport_training_plans
□ 18. Ver dados na tabela sport_workout_logs
```

---

## 🎯 **VERIFICAÇÃO NO SUPABASE:**

### **Após criar programa, deve ter:**

```sql
-- sport_training_plans
SELECT 
  id,
  name,
  is_active,
  status,
  current_week,
  completed_workouts,
  total_workouts,
  created_at
FROM sport_training_plans 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

RESULTADO ESPERADO:
┌────┬──────────────────────────┬───────────┬────────┬──────────────┬────────────────────┬───────────────┬─────────────┐
│ id │ name                     │ is_active │ status │ current_week │ completed_workouts │ total_workouts│ created_at  │
├────┼──────────────────────────┼───────────┼────────┼──────────────┼────────────────────┼───────────────┼─────────────┤
│ 1  │ Do Sofá ao Movimento     │ true      │ active │ 1            │ 0                  │ 12            │ 2025-10-18  │
└────┴──────────────────────────┴───────────┴────────┴──────────────┴────────────────────┴───────────────┴─────────────┘
```

### **Após marcar 3 treinos:**

```sql
SELECT 
  week_number,
  day_number,
  completed,
  completed_at
FROM sport_workout_logs 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

RESULTADO ESPERADO:
┌──────────────┬────────────┬───────────┬──────────────────┐
│ week_number  │ day_number │ completed │ completed_at     │
├──────────────┼────────────┼───────────┼──────────────────┤
│ 1            │ 3          │ true      │ 2025-10-18 12:35 │
│ 1            │ 2          │ true      │ 2025-10-18 12:34 │
│ 1            │ 1          │ true      │ 2025-10-18 12:33 │
└──────────────┴────────────┴───────────┴──────────────────┘
```

---

## 🚀 **TESTE AGORA:**

### **1. Acesse:** `http://localhost:8080`

### **2. Login no dashboard**

### **3. Menu → "Exercícios Recomendados"**

### **4. Crie um programa e verifique:**
- ✅ Toast "Programa Salvo!"
- ✅ Dashboard mostra programa
- ✅ Supabase tem registro

### **5. Marque treinos e verifique:**
- ✅ Treino fica verde
- ✅ Contador aumenta
- ✅ Supabase tem logs

---

## 📊 **ESTRUTURA DO BANCO:**

### **Tabela: sport_training_plans**
```
Armazena:
├─ Programa completo
├─ Todas as semanas (JSON)
├─ Status (active, paused, completed)
├─ Progresso (current_week, completed_workouts)
└─ Dados do usuário (level, goal, location)
```

### **Tabela: sport_workout_logs**
```
Armazena:
├─ Cada treino marcado como completo
├─ Semana e dia do treino
├─ Data/hora de conclusão
└─ Exercícios realizados
```

---

## 🎊 **GARANTIA:**

**O sistema ESTÁ salvando se:**
- ✅ Toast "Programa Salvo!" aparece
- ✅ Dashboard mostra o programa
- ✅ Supabase tem os registros
- ✅ Treinos marcados aumentam contador
- ✅ Histórico mostra os programas

**TESTE AGORA E CONFIRME!** 🚀

