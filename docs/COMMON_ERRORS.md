# 🐛 Erros Comuns e Soluções

> Guia rápido para resolver os erros mais frequentes no projeto Instituto dos Sonhos.

---

## 📁 Erros de Importação

### 1. Módulo não encontrado

```typescript
// ❌ ERRO
Cannot find module './exercise-database' or its corresponding type declarations

// 🔍 CAUSA
Nome do arquivo incorreto

// ✅ SOLUÇÃO
// Verificar nome exato do arquivo
import { exercises } from './exercises-database'; // Com 's'

// Nomes comuns que causam confusão:
// exercises-database.ts (CORRETO)
// exercise-database.ts (ERRADO - sem 's')
```

### 2. Export não encontrado

```typescript
// ❌ ERRO
'UnifiedTimerProps' is not exported from './UnifiedTimer'

// 🔍 CAUSA
Interface sem 'export'

// ✅ SOLUÇÃO
// No arquivo de origem, adicionar export:
export interface UnifiedTimerProps {
  variant?: 'default' | 'compact';
}
```

### 3. Path relativo muito longo

```typescript
// ❌ ERRO (má prática, pode quebrar)
import { Button } from '../../../components/ui/button';

// ✅ SOLUÇÃO
import { Button } from '@/components/ui/button';
```

### 4. Importando cliente Supabase errado

```typescript
// ❌ ERRO
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);

// ✅ SOLUÇÃO
import { supabase } from '@/integrations/supabase/client';
```

---

## 🗃️ Erros de Banco de Dados

### 5. Coluna não existe

```typescript
// ❌ ERRO
column "category" does not exist

// 🔍 CAUSA
Nome da coluna incorreto

// ✅ SOLUÇÃO - Mapeamento de colunas corretas:
challenges.category        → challenges.challenge_type
profiles.role             → Usar RPC is_admin_user
profiles.height_cm        → profiles.height
profiles.date_of_birth    → profiles.birth_date
user_goals.profiles       → Fazer query separada
daily_health_tracking     → advanced_daily_tracking
```

### 6. Relação/Join não existe

```typescript
// ❌ ERRO
Could not find a relationship between 'user_goals' and 'profiles'

// 🔍 CAUSA
Tentando fazer join que não existe no schema

// ✅ SOLUÇÃO - Fazer queries separadas
// ERRADO
const { data } = await supabase
  .from('user_goals')
  .select('*, profiles(*)');

// CORRETO
const { data: goals } = await supabase
  .from('user_goals')
  .select('*')
  .eq('user_id', userId);

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

### 7. Acessando array como objeto

```typescript
// ❌ ERRO
Cannot read property 'altura_cm' of undefined
// ou
data.altura_cm is undefined

// 🔍 CAUSA
Supabase select() retorna array, não objeto

// ✅ SOLUÇÃO
const { data } = await supabase
  .from('user_physical_data')
  .select('*');

// ERRADO
const altura = data.altura_cm;

// CORRETO
const altura = data?.[0]?.altura_cm;

// OU usar .single() quando espera 1 registro
const { data } = await supabase
  .from('user_physical_data')
  .select('*')
  .eq('user_id', userId)
  .single();

const altura = data?.altura_cm; // Agora é objeto
```

### 8. Verificação de admin insegura

```typescript
// ❌ ERRO (inseguro e pode não funcionar)
const { data } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId);

const isAdmin = data?.[0]?.role === 'admin';

// 🔍 CAUSA
1. Coluna 'role' não existe em profiles
2. Mesmo se existisse, seria inseguro (manipulável no frontend)

// ✅ SOLUÇÃO
// Usar RPC seguro
const { data: isAdmin } = await supabase.rpc('is_admin_user');

// Ou hook
import { useAdminMode } from '@/hooks/useAdminMode';
const { isAdmin, isChecking } = useAdminMode(user);
```

---

## 🧩 Erros de Componentes

### 9. Prop não existe

```typescript
// ❌ ERRO
Property 'compact' does not exist on type 'UnifiedTimerProps'

// 🔍 CAUSA
Usando props booleanas ao invés de variants

// ✅ SOLUÇÃO
// ERRADO
<UnifiedTimer compact={true} />

// CORRETO
<UnifiedTimer variant="compact" />

// Interface correta:
interface UnifiedTimerProps {
  variant?: 'default' | 'compact' | 'minimal';
}
```

### 10. Classe CSS inválida

```typescript
// ❌ ERRO
Cores não seguem o tema, ficam estranhas no dark mode

// 🔍 CAUSA
Usando cores hardcoded

// ✅ SOLUÇÃO
// ERRADO
<div className="bg-white text-black">
<div className="bg-[#1a1a2e]">

// CORRETO - Usar tokens semânticos
<div className="bg-background text-foreground">
<div className="bg-card">
<div className="bg-primary text-primary-foreground">
<div className="bg-muted text-muted-foreground">
```

### 11. cn() não importado

```typescript
// ❌ ERRO
cn is not defined

// ✅ SOLUÇÃO
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes"
)}>
```

---

## 🔌 Erros de Edge Functions

### 12. CORS Error

```typescript
// ❌ ERRO
Access to fetch has been blocked by CORS policy

// 🔍 CAUSA
Edge function sem headers CORS

// ✅ SOLUÇÃO
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // SEMPRE handle OPTIONS primeiro
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // SEMPRE incluir corsHeaders na resposta
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
```

### 13. Variável de ambiente não encontrada

```typescript
// ❌ ERRO
VITE_SUPABASE_URL is undefined

// 🔍 CAUSA
Usando VITE_* em Edge Function (Deno)

// ✅ SOLUÇÃO
// ERRADO
const url = Deno.env.get('VITE_SUPABASE_URL');

// CORRETO
const url = Deno.env.get('SUPABASE_URL');
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openaiKey = Deno.env.get('OPENAI_API_KEY');
```

### 14. Import inválido em Edge Function

```typescript
// ❌ ERRO
Module not found '@/lib/utils'

// 🔍 CAUSA
Edge Functions não têm acesso ao código de src/

// ✅ SOLUÇÃO
// ERRADO
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// CORRETO - Usar esm.sh ou deno.land
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { format } from 'https://esm.sh/date-fns@3.0.0';

// Para código compartilhado, usar _shared/
import { corsHeaders } from '../_shared/cors.ts';
```

---

## 🪝 Erros de Hooks

### 15. Query executando sem dados necessários

```typescript
// ❌ ERRO
Query executa antes do userId estar disponível, causando erro

// ✅ SOLUÇÃO - Usar enabled
const { data } = useQuery({
  queryKey: ['user-data', userId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },
  enabled: !!userId, // SÓ executa quando userId existe
});
```

### 16. Dependência faltando no useEffect

```typescript
// ❌ ERRO
React Hook useEffect has a missing dependency: 'userId'

// ✅ SOLUÇÃO
useEffect(() => {
  if (userId) {
    fetchData();
  }
}, [userId]); // Incluir todas dependências
```

### 17. Mutation sem invalidação de cache

```typescript
// ❌ ERRO
Dados não atualizam após mutation

// ✅ SOLUÇÃO
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: async (newData) => {
    await supabase.from('table').insert(newData);
  },
  onSuccess: () => {
    // Invalidar cache para refetch
    queryClient.invalidateQueries({ queryKey: ['table-data'] });
  },
});
```

---

## 🔐 Erros de Autenticação

### 18. Usuário não autenticado

```typescript
// ❌ ERRO
Row level security policy violation

// 🔍 CAUSA
Tentando acessar dados sem estar logado

// ✅ SOLUÇÃO
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Redirecionar para login ou mostrar erro
  navigate('/login');
  return;
}

// Agora pode fazer operações
const { data } = await supabase
  .from('user_physical_data')
  .select('*')
  .eq('user_id', user.id);
```

### 19. Token expirado

```typescript
// ❌ ERRO
JWT expired

// ✅ SOLUÇÃO - Supabase gerencia automaticamente, mas verificar:
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

## 📊 Erros de TypeScript

### 20. Tipo any implícito

```typescript
// ❌ ERRO
Parameter 'data' implicitly has an 'any' type

// ✅ SOLUÇÃO
// Definir tipos explícitos
interface UserData {
  id: string;
  name: string;
  email: string;
}

const processData = (data: UserData) => {
  // ...
};
```

### 21. Propriedade pode ser undefined

```typescript
// ❌ ERRO
Object is possibly 'undefined'

// ✅ SOLUÇÃO - Usar optional chaining e nullish coalescing
// ERRADO
const name = user.profile.name;

// CORRETO
const name = user?.profile?.name ?? 'Usuário';

// Ou com early return
if (!user?.profile) {
  return null;
}
const name = user.profile.name;
```

---

## 🎯 Resumo Rápido

| Erro | Solução Rápida |
|------|----------------|
| Module not found | Verificar nome exato do arquivo |
| Export not found | Adicionar `export` antes da interface |
| Column not exist | Consultar `types.ts` ou `DATABASE_QUICK_REF.md` |
| CORS error | Adicionar corsHeaders em Edge Functions |
| Array access error | Usar `data?.[0]?.campo` |
| Admin check fail | Usar `supabase.rpc('is_admin_user')` |
| Query before data | Adicionar `enabled: !!userId` |
| Prop not exist | Usar `variant` ao invés de boolean |

---

*Última atualização: Janeiro 2026*
