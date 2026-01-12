# 🔍 DIAGNÓSTICO: Comunidade - Ranking #0 e Dados Zerados

## 📋 PROBLEMAS IDENTIFICADOS

### 1. 🔴 PROBLEMA CRÍTICO: Política RLS Restritiva

**Arquivo:** `supabase/migrations/20260104191401_a61bd04d-4f7a-41a4-b625-f29315529a98.sql`

```sql
-- PROBLEMA: Esta política só permite ver SEUS PRÓPRIOS pontos
CREATE POLICY "Users can view their own points"
  ON public.user_points FOR SELECT
  USING (auth.uid() = user_id);
```

**Impacto:** 
- O ranking não consegue buscar pontos de OUTROS usuários
- A query `profiles!inner` falha silenciosamente
- Resultado: array vazio ou apenas o próprio usuário

**Solução:** Adicionar política que permite ver TODOS os pontos para ranking:
```sql
CREATE POLICY "Everyone can view all points for ranking"
  ON public.user_points FOR SELECT
  TO authenticated
  USING (true);
```

---

### 2. 🔴 PROBLEMA: Join Incorreto no useRanking

**Arquivo:** `src/hooks/useRanking.ts`

```typescript
// PROBLEMA: profiles!inner assume FK que pode não existir
const { data, error } = await supabase
  .from('user_points')
  .select(`
    user_id,
    ...
    profiles!inner(full_name, avatar_url)  // ← FK pode não existir
  `)
```

**Impacto:**
- Se `user_points.user_id` não tem FK para `profiles.user_id`, o join falha
- Usuários sem perfil completo são filtrados
- Resultado: ranking incompleto

**Solução:** Usar join explícito ou query separada:
```typescript
// Opção 1: Join explícito
.select(`
  user_id,
  ...
  profiles:profiles!user_points_user_id_fkey(full_name, avatar_url)
`)

// Opção 2: Query separada (mais seguro)
const { data: points } = await supabase.from('user_points').select('*');
const { data: profiles } = await supabase.from('profiles').select('*');
// Merge manualmente
```

---

### 3. 🟡 PROBLEMA: Usuários sem registro em user_points

**Causa:** O trigger `on_profile_created_points` pode não ter sido executado para usuários antigos.

**Verificação:**
```sql
-- Usuários SEM pontos
SELECT p.user_id, p.full_name 
FROM profiles p
LEFT JOIN user_points up ON p.user_id = up.user_id
WHERE up.id IS NULL;
```

**Solução:** Inserir registros faltantes:
```sql
INSERT INTO user_points (user_id)
SELECT p.user_id FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM user_points up WHERE up.user_id = p.user_id);
```

---

### 4. 🟡 PROBLEMA: currentUserStats retorna position: 0

**Arquivo:** `src/pages/HealthFeedPage.tsx`

```typescript
const currentUserStats = useMemo(() => {
  // Busca pelo user_id
  const userRank = ranking.find(r => r.user_id === user.id);
  
  // Se não encontrar, retorna 0
  if (!userRank) {
    return { position: 0, ... };  // ← Aqui está o #0
  }
```

**Causa:** O usuário não está no array `ranking` porque:
1. RLS bloqueia a visualização
2. Não tem registro em `user_points`
3. O join com `profiles` falhou

---

## 🛠️ CORREÇÕES NECESSÁRIAS

### Migration SQL (Executar no Supabase)

```sql
-- 1. Adicionar política para ver todos os pontos
DROP POLICY IF EXISTS "Everyone can view all points for ranking" ON public.user_points;
CREATE POLICY "Everyone can view all points for ranking"
  ON public.user_points FOR SELECT
  TO authenticated
  USING (true);

-- 2. Garantir que todos os usuários têm registro de pontos
INSERT INTO public.user_points (user_id, total_points, current_streak, level)
SELECT 
  p.user_id,
  COALESCE(p.points, 0),
  0,
  1
FROM public.profiles p
WHERE p.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.user_points up WHERE up.user_id = p.user_id)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON public.user_points(total_points DESC);
```

### Código TypeScript (useRanking.ts)

```typescript
const fetchRankingData = async (): Promise<RankingUser[]> => {
  // Query mais robusta sem depender de FK
  const { data: pointsData, error: pointsError } = await supabase
    .from('user_points')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(100);

  if (pointsError || !pointsData?.length) {
    console.error('Erro ao buscar pontos:', pointsError);
    return [];
  }

  // Buscar perfis separadamente
  const userIds = pointsData.map(p => p.user_id);
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url')
    .in('user_id', userIds);

  const profilesMap = new Map(
    profilesData?.map(p => [p.user_id, p]) || []
  );

  // Mapear com fallback
  return pointsData
    .map((item, index) => {
      const profile = profilesMap.get(item.user_id);
      return {
        user_id: item.user_id,
        user_name: profile?.full_name || 'Usuário',
        avatar_url: profile?.avatar_url,
        total_points: item.total_points || 0,
        streak_days: item.current_streak || 0,
        missions_completed: item.missions_completed || 0,
        completed_challenges: item.completed_challenges || 0,
        level: item.level || 1,
        last_activity: item.last_activity_date,
        position: index + 1
      };
    })
    .filter(u => u.user_name !== 'Usuário' || u.total_points > 0);
};
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Executar migration SQL no Supabase
- [ ] Verificar se política RLS foi criada
- [ ] Verificar se todos usuários têm registro em user_points
- [ ] Atualizar useRanking.ts com query robusta
- [ ] Testar ranking na comunidade
- [ ] Verificar se usuário logado aparece no ranking

---

## 📊 QUERIES DE DIAGNÓSTICO

```sql
-- Ver políticas atuais de user_points
SELECT * FROM pg_policies WHERE tablename = 'user_points';

-- Contar usuários com/sem pontos
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM user_points) as total_user_points,
  (SELECT COUNT(*) FROM profiles p WHERE NOT EXISTS (SELECT 1 FROM user_points up WHERE up.user_id = p.user_id)) as sem_pontos;

-- Top 10 do ranking atual
SELECT up.*, p.full_name 
FROM user_points up
LEFT JOIN profiles p ON up.user_id = p.user_id
ORDER BY up.total_points DESC
LIMIT 10;
```
