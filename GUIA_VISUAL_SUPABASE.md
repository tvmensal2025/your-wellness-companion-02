# 📸 GUIA VISUAL - Executar Migração no Supabase

> **Passo a passo com capturas de tela (descrição)**

---

## 🎯 PASSO 1: Acessar Dashboard

### URL:
```
https://supabase.com/dashboard
```

### O que você verá:
```
┌─────────────────────────────────────────┐
│  Supabase Dashboard                     │
├─────────────────────────────────────────┤
│                                         │
│  Seus Projetos:                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📦 instituto-dos-sonhos        │   │
│  │  🟢 Active                      │   │
│  │  [Abrir Projeto]                │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**👉 Clique em "Abrir Projeto" ou no nome do projeto**

---

## 🎯 PASSO 2: Abrir SQL Editor

### Menu Lateral:
```
┌─────────────────────┐
│  Supabase           │
├─────────────────────┤
│  🏠 Home            │
│  📊 Table Editor    │
│  🔍 SQL Editor  ← AQUI
│  🔐 Authentication  │
│  📦 Storage         │
│  🔧 Database        │
│  ⚙️  Settings       │
└─────────────────────┘
```

**👉 Clique em "SQL Editor"**

---

## 🎯 PASSO 3: Criar Nova Query

### Tela do SQL Editor:
```
┌─────────────────────────────────────────────────────┐
│  SQL Editor                                         │
├─────────────────────────────────────────────────────┤
│  [+ New Query]  [Snippets ▼]  [History]           │
│                                                     │
│  Queries recentes:                                  │
│  • SELECT * FROM profiles...                        │
│  • UPDATE user_goals...                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**👉 Clique em "+ New Query"**

---

## 🎯 PASSO 4: Colar a Migração

### Editor SQL:
```
┌─────────────────────────────────────────────────────┐
│  Untitled Query                    [Run] [Save]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1  -- Cole aqui o conteúdo do arquivo:            │
│  2  -- supabase/migrations/                        │
│  3  --   20260112400000_add_goals_gamification...  │
│  4                                                  │
│  5  -- ================================             │
│  6  -- MIGRAÇÃO SEGURA: Gamificação de Metas      │
│  7  -- ================================             │
│  8                                                  │
│  9  ALTER TABLE public.user_goals                  │
│ 10  ADD COLUMN IF NOT EXISTS streak_days...        │
│                                                     │
│  [Área de edição - Cole o SQL aqui]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Como colar:

1. **Abra o arquivo:**
   ```
   supabase/migrations/20260112400000_add_goals_gamification_safe.sql
   ```

2. **Selecione tudo:**
   - Windows/Linux: `Ctrl + A`
   - Mac: `Cmd + A`

3. **Copie:**
   - Windows/Linux: `Ctrl + C`
   - Mac: `Cmd + C`

4. **Cole no SQL Editor:**
   - Windows/Linux: `Ctrl + V`
   - Mac: `Cmd + V`

---

## 🎯 PASSO 5: Executar

### Botão Run:
```
┌─────────────────────────────────────────────────────┐
│  Untitled Query          [▶ Run] [💾 Save]         │
│                          ↑                          │
│                          └─ CLIQUE AQUI            │
├─────────────────────────────────────────────────────┤
│  [SQL completo colado aqui]                         │
└─────────────────────────────────────────────────────┘
```

**👉 Clique em "▶ Run" ou pressione:**
- Windows/Linux: `Ctrl + Enter`
- Mac: `Cmd + Enter`

### Aguarde (5-10 segundos):
```
┌─────────────────────────────────────────────────────┐
│  ⏳ Executing query...                              │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 PASSO 6: Verificar Sucesso

### Resultado Esperado:
```
┌─────────────────────────────────────────────────────┐
│  ✅ Success                                         │
├─────────────────────────────────────────────────────┤
│  Results:                                           │
│                                                     │
│  NOTICE: Migração de gamificação de metas          │
│          concluída com sucesso!                     │
│                                                     │
│  NOTICE: Tabelas criadas:                           │
│          goal_achievements, goal_streaks,           │
│          user_goal_levels                           │
│                                                     │
│  NOTICE: Campos adicionados a user_goals:           │
│          streak_days, last_update_date,             │
│          xp_earned, level, evidence_urls,           │
│          participant_ids                            │
│                                                     │
│  NOTICE: Funções criadas:                           │
│          update_goal_streak(),                      │
│          calculate_xp_to_next_level(),              │
│          process_level_up()                         │
│                                                     │
│  Query executed successfully                        │
│  Rows returned: 0                                   │
│  Time: 8.2s                                         │
└─────────────────────────────────────────────────────┘
```

**✅ Se viu essas mensagens, SUCESSO!**

---

## 🎯 PASSO 7: Validar (Opcional mas Recomendado)

### Criar Nova Query:
```
┌─────────────────────────────────────────────────────┐
│  [+ New Query]  ← Clique aqui                       │
└─────────────────────────────────────────────────────┘
```

### Cole esta query de validação:
```sql
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_name IN ('goal_achievements', 'goal_streaks', 'user_goal_levels')) as tabelas_criadas,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'user_goals' 
   AND column_name IN ('streak_days', 'xp_earned', 'level')) as campos_adicionados,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_name IN ('update_goal_streak', 'process_level_up')) as funcoes_criadas;
```

### Resultado Esperado:
```
┌─────────────────────────────────────────────────────┐
│  ✅ Success                                         │
├─────────────────────────────────────────────────────┤
│  Results (1 row):                                   │
│                                                     │
│  tabelas_criadas    | 3                             │
│  campos_adicionados | 3                             │
│  funcoes_criadas    | 2                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**✅ Se viu esses números, está PERFEITO!**

---

## 🎯 PASSO 8: Verificar Tabelas (Opcional)

### Ir para Table Editor:
```
┌─────────────────────┐
│  Supabase           │
├─────────────────────┤
│  🏠 Home            │
│  📊 Table Editor ← AQUI
│  🔍 SQL Editor      │
└─────────────────────┘
```

### Você verá as novas tabelas:
```
┌─────────────────────────────────────────────────────┐
│  Tables                                             │
├─────────────────────────────────────────────────────┤
│  📋 user_goals (atualizada)                         │
│  🏆 goal_achievements (NOVA)                        │
│  🔥 goal_streaks (NOVA)                             │
│  ⭐ user_goal_levels (NOVA)                         │
│  📊 profiles                                        │
│  📝 challenges                                      │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST VISUAL

Marque conforme avança:

- [ ] ✅ Acessei https://supabase.com/dashboard
- [ ] ✅ Abri meu projeto
- [ ] ✅ Cliquei em "SQL Editor" no menu lateral
- [ ] ✅ Cliquei em "+ New Query"
- [ ] ✅ Copiei o arquivo `20260112400000_add_goals_gamification_safe.sql`
- [ ] ✅ Colei no editor SQL
- [ ] ✅ Cliquei em "Run" (ou Ctrl+Enter)
- [ ] ✅ Vi as mensagens de sucesso (NOTICE)
- [ ] ✅ Executei a query de validação
- [ ] ✅ Vi os números corretos (3, 3, 2)
- [ ] ✅ Verifiquei as novas tabelas no Table Editor

---

## 🎉 PRONTO!

Se completou todos os passos acima, a migração foi **100% bem-sucedida!**

### Próximos Passos:

1. **Integrar o componente React:**
   ```
   src/components/goals/ModernGoalCard.tsx
   ```

2. **Ver o preview visual:**
   ```
   Abra: PREVIEW_MINHAS_METAS_NOVO.html no navegador
   ```

3. **Ler a documentação completa:**
   ```
   docs/ANALISE_MINHAS_METAS_COMPLETA.md
   ```

---

## 📞 TROUBLESHOOTING

### ❌ Erro: "permission denied"
**Solução:** Você precisa ser admin do projeto Supabase

### ❌ Erro: "column already exists"
**Solução:** A migração já foi executada antes. Está tudo OK!

### ❌ Erro: "syntax error"
**Solução:** Certifique-se de copiar TODO o conteúdo do arquivo SQL

### ❌ Timeout
**Solução:** Execute novamente. Pode ser lentidão temporária.

---

## 🆘 ROLLBACK (Se necessário)

Se algo der errado, execute:

```sql
-- ROLLBACK COMPLETO
DROP TRIGGER IF EXISTS trigger_update_goal_streak ON public.user_goals;
DROP FUNCTION IF EXISTS update_goal_streak();
DROP FUNCTION IF EXISTS calculate_xp_to_next_level(integer);
DROP FUNCTION IF EXISTS process_level_up(uuid, integer);
DROP TABLE IF EXISTS public.goal_achievements CASCADE;
DROP TABLE IF EXISTS public.goal_streaks CASCADE;
DROP TABLE IF EXISTS public.user_goal_levels CASCADE;

ALTER TABLE public.user_goals
DROP COLUMN IF EXISTS streak_days,
DROP COLUMN IF EXISTS last_update_date,
DROP COLUMN IF EXISTS xp_earned,
DROP COLUMN IF EXISTS level,
DROP COLUMN IF EXISTS evidence_urls,
DROP COLUMN IF EXISTS participant_ids;
```

---

*Guia criado por Kiro AI - Janeiro 2026*  
*Siga passo a passo e terá sucesso! 🚀*
