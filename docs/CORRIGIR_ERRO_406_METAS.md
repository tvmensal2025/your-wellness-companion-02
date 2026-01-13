# 🔧 Corrigir Erro 406 - Tabelas de Metas

## Problema

Erro **406 (Not Acceptable)** ao tentar acessar `user_goal_levels`:
```
GET https://ciszqtlaacrhfwsqnvjr.supabase.co/rest/v1/user_goal_levels?... 406 (Not Acceptable)
```

## Causa

A tabela `user_goal_levels` não existe no banco de dados, mesmo após executar a migração.

## Solução Passo a Passo

### 1️⃣ Verificar se as Tabelas Existem

Execute o script de verificação no **SQL Editor** do Supabase:

```bash
# Copiar conteúdo do arquivo
cat sql/VERIFICAR_TABELAS_METAS.sql
```

Ou acesse: `sql/VERIFICAR_TABELAS_METAS.sql`

**No Supabase Dashboard:**
1. Ir em **SQL Editor**
2. Colar o conteúdo do script
3. Clicar em **Run**

### 2️⃣ Interpretar Resultados

#### ✅ Se as tabelas EXISTEM:
```
tabela              | existe
--------------------|--------
user_goal_levels    | true
goal_achievements   | true
goal_streaks        | true
```

**Problema:** RLS (Row Level Security) está bloqueando.

**Solução:** Verificar policies no passo 3.

#### ❌ Se as tabelas NÃO EXISTEM:
```
tabela              | existe
--------------------|--------
user_goal_levels    | false
goal_achievements   | false
goal_streaks        | false
```

**Problema:** Migração não foi executada ou falhou.

**Solução:** Executar migração novamente no passo 4.

### 3️⃣ Se Tabelas Existem - Verificar RLS

As policies devem permitir:
- **SELECT**: Usuário pode ver seus próprios dados
- **INSERT**: Usuário pode criar seus próprios registros
- **UPDATE**: Usuário pode atualizar seus próprios dados

**Verificar no SQL Editor:**
```sql
-- Ver policies de user_goal_levels
SELECT * FROM pg_policies WHERE tablename = 'user_goal_levels';
```

**Resultado esperado:**
- `Users can view own level` (SELECT)
- `Users can insert own level` (INSERT)
- `Users can update own level` (UPDATE)

### 4️⃣ Se Tabelas NÃO Existem - Executar Migração

**Opção A: Via Supabase CLI (Recomendado)**
```bash
# Resetar migrações locais
supabase db reset

# Ou aplicar apenas a migração específica
supabase db push
```

**Opção B: Via SQL Editor (Manual)**
1. Abrir `supabase/migrations/20260112400000_add_goals_gamification_safe.sql`
2. Copiar TODO o conteúdo
3. Colar no **SQL Editor** do Supabase
4. Clicar em **Run**

### 5️⃣ Verificar Novamente

Após executar a migração, rodar o script de verificação novamente:
```sql
-- Verificar se tabelas foram criadas
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%goal%';
```

### 6️⃣ Testar no Frontend

Após confirmar que as tabelas existem:

1. **Limpar cache do navegador:**
   ```javascript
   // Console do navegador (F12)
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Verificar no Network:**
   - Abrir DevTools (F12)
   - Aba Network
   - Filtrar por `user_goal_levels`
   - Status deve ser **200 OK** (não 406)

## Código Já Corrigido

O código frontend já foi atualizado para tratar o erro 406 graciosamente:

### `src/hooks/useGoalsGamification.ts`
```typescript
// Se a tabela não existe (406), retornar dados padrão
if (error) {
  if (error.code === 'PGRST116' || error.message?.includes('406')) {
    console.warn('Tabela user_goal_levels não existe. Execute a migração.');
    return {
      id: 'temp',
      user_id: userId,
      current_level: 1,
      current_xp: 0,
      total_xp: 0,
      xp_to_next_level: 100,
      level_title: 'Iniciante',
    };
  }
  throw error;
}
```

### `src/pages/GoalsPageV2.tsx`
```typescript
// Se a tabela não existe (406), usar dados padrão
const userLevel = (levelError && levelError.message?.includes('406')) 
  ? { current_level: 1, current_xp: 0, total_xp: 0, level_title: 'Iniciante' }
  : levelData;
```

## Checklist Final

- [ ] Executar `sql/VERIFICAR_TABELAS_METAS.sql`
- [ ] Confirmar que 3 tabelas existem
- [ ] Confirmar que 6 colunas foram adicionadas em `user_goals`
- [ ] Confirmar que 6 policies RLS existem
- [ ] Confirmar que 3 funções foram criadas
- [ ] Confirmar que 3 triggers foram criados
- [ ] Limpar cache do navegador
- [ ] Testar no frontend (erro 406 deve sumir)

## Comandos Úteis

### Verificar Tabelas via CLI
```bash
# Listar todas as tabelas
supabase db dump --schema public --data-only

# Ver estrutura de uma tabela
supabase db dump --schema public --table user_goal_levels
```

### Recriar Tabelas (CUIDADO: Apaga dados)
```sql
-- APENAS SE NECESSÁRIO - APAGA TUDO
DROP TABLE IF EXISTS public.user_goal_levels CASCADE;
DROP TABLE IF EXISTS public.goal_achievements CASCADE;
DROP TABLE IF EXISTS public.goal_streaks CASCADE;

-- Depois executar a migração novamente
```

## Suporte

Se o problema persistir:
1. Tirar screenshot do resultado de `VERIFICAR_TABELAS_METAS.sql`
2. Tirar screenshot do erro 406 no Network
3. Verificar logs do Supabase Dashboard

---

*Última atualização: Janeiro 2026*
