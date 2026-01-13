# ⚠️ CORRIGIR ERRO 406 - AÇÃO IMEDIATA

## 🔴 Problema
```
GET .../user_goal_levels?... 406 (Not Acceptable)
```

## ✅ Solução Rápida (3 minutos)

### 1. Abrir Supabase Dashboard
```
https://supabase.com/dashboard/project/ciszqtlaacrhfwsqnvjr
```

### 2. Ir em SQL Editor
Clicar em **SQL Editor** no menu lateral

### 3. Executar Script de Verificação
Copiar e colar este SQL:

```sql
-- Verificar se tabelas existem
SELECT 
  'user_goal_levels' as tabela,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_goal_levels'
  ) as existe;

SELECT 
  'goal_achievements' as tabela,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'goal_achievements'
  ) as existe;

SELECT 
  'goal_streaks' as tabela,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'goal_streaks'
  ) as existe;
```

### 4. Interpretar Resultado

#### ✅ Se mostrar `existe = true` para todas:
**As tabelas existem!** O problema é no código.

**Solução:** O código já foi corrigido. Apenas limpe o cache:
```javascript
// Console do navegador (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

#### ❌ Se mostrar `existe = false`:
**As tabelas NÃO existem!** Precisa executar a migração.

**Solução:** Copiar e executar a migração completa:

1. Abrir arquivo: `supabase/migrations/20260112400000_add_goals_gamification_safe.sql`
2. Copiar **TODO** o conteúdo (Ctrl+A, Ctrl+C)
3. Colar no SQL Editor do Supabase
4. Clicar em **Run**
5. Aguardar mensagem de sucesso

### 5. Verificar Novamente
Executar o script do passo 3 novamente.

Agora deve mostrar `existe = true` para todas as tabelas.

### 6. Testar no App
1. Limpar cache do navegador (Ctrl+Shift+Delete)
2. Recarregar página (F5)
3. Erro 406 deve sumir

## 📋 Arquivos Importantes

- **Migração:** `supabase/migrations/20260112400000_add_goals_gamification_safe.sql`
- **Verificação:** `sql/VERIFICAR_TABELAS_METAS.sql`
- **Documentação:** `docs/CORRIGIR_ERRO_406_METAS.md`

## 🆘 Se Ainda Não Funcionar

Execute este SQL para ver detalhes do erro:

```sql
-- Ver todas as tabelas que começam com 'goal' ou 'user_goal'
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename LIKE '%goal%' OR tablename LIKE 'user_goal%')
ORDER BY tablename;

-- Ver policies RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_goal_levels', 'goal_achievements', 'goal_streaks');
```

Copie o resultado e me envie.

---

**Status Atual:**
- ✅ Código corrigido (trata erro 406 graciosamente)
- ⏳ Aguardando execução da migração no Supabase
- ⏳ Aguardando verificação das tabelas

**Próximo Passo:** Executar passo 3 acima ☝️
