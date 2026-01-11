# 🤖 Regras de Código - Instituto dos Sonhos

> Este arquivo é carregado automaticamente em TODAS as interações. NUNCA ignorar.

---

## ⛔ ARQUIVOS PROTEGIDOS - NUNCA EDITAR
```
src/integrations/supabase/client.ts  → Cliente Supabase (auto-gerado)
src/integrations/supabase/types.ts   → Tipos do banco (13.000+ linhas, auto-gerado)
.env                                  → Variáveis de ambiente
supabase/config.toml                  → Configuração Supabase
package.json                          → Usar ferramentas de dependência
package-lock.json                     → Auto-gerado
bun.lockb                             → Auto-gerado
```

---

## ✅ IMPORTS OBRIGATÓRIOS - SEMPRE USAR ASSIM
```typescript
// Supabase - ÚNICO lugar permitido
import { supabase } from '@/integrations/supabase/client';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Utilitários
import { cn } from '@/lib/utils';

// React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Icons
import { Heart, Activity, Brain } from 'lucide-react';

// SEMPRE usar @/ alias
// NUNCA usar paths relativos longos como ../../../
```

### ❌ IMPORTS PROIBIDOS
```typescript
// NUNCA criar outro cliente Supabase
import { createClient } from '@supabase/supabase-js';

// NUNCA usar paths relativos longos
import { Button } from '../../../components/ui/button';
```

---

## 🗃️ BANCO DE DADOS - COLUNAS QUE NÃO EXISTEM

### Mapeamento de Erros Comuns:
| ❌ ERRADO | ✅ CORRETO |
|-----------|------------|
| `profiles.role` | `supabase.rpc('is_admin_user')` |
| `profiles.admin_level` | NÃO EXISTE |
| `profiles.height_cm` | `profiles.height` |
| `profiles.date_of_birth` | `profiles.birth_date` |
| `challenges.category` | `challenges.challenge_type` |
| `user_goals.profiles` | Fazer query separada (não tem FK) |
| `daily_health_tracking` | `advanced_daily_tracking` |
| `user_physical_data.peso_kg` | `user_physical_data.peso_atual_kg` |

---

## 📊 TABELAS PRINCIPAIS - REFERÊNCIA RÁPIDA

### `profiles`
```
id, full_name, email, avatar_url, bio, phone, height, birth_date
```

### `user_physical_data`
```
user_id, altura_cm, peso_atual_kg, imc, data_nascimento, sexo, nivel_atividade
```

### `weight_measurements`
```
user_id, weight_kg, measurement_date, notes, photo_url, body_fat_percentage
```

### `food_analysis`
```
user_id, meal_type, analysis_text, health_score, calories, protein_g, carbs_g, fat_g
```

### `challenges`
```
id, title, description, challenge_type, difficulty, points_reward, xp_reward, is_active
```

### `challenge_participations`
```
user_id, challenge_id, progress, is_completed, points_earned, started_at, completed_at
```

### `advanced_daily_tracking`
```
user_id, tracking_date, energy_level, stress_level, sleep_quality, sleep_hours, water_ml, steps
```

### `user_roles`
```
user_id, role ('admin', 'moderator', 'user')
```

### `user_goals`
```
user_id, title, description, target_date, status, progress
```

---

## 🔐 VERIFICAR ADMIN - ÚNICO MÉTODO SEGURO

```typescript
// ✅ CORRETO - Via RPC
const { data: isAdmin } = await supabase.rpc('is_admin_user');

// ✅ CORRETO - Via hook
import { useAdminMode } from '@/hooks/useAdminMode';
const { isAdmin, isChecking } = useAdminMode(user);

// ❌ ERRADO - Consultando profiles
const { data } = await supabase.from('profiles').select('role'); // COLUNA NÃO EXISTE!
```

---

## 📊 SUPABASE RETORNA ARRAYS - SEMPRE LEMBRAR

```typescript
// Supabase select() SEMPRE retorna array

// ❌ ERRADO
const { data } = await supabase.from('user_physical_data').select('*');
const altura = data.altura_cm; // ERRO: data é array!

// ✅ CORRETO - Acessar como array
const altura = data?.[0]?.altura_cm;
const peso = data?.[0]?.peso_atual_kg;

// ✅ CORRETO - Usar .single() quando espera 1 registro
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
const nome = data?.full_name; // Agora é objeto
```

---

## 🎨 PADRÕES DE COMPONENTES

### Variants ao invés de Props Booleanas
```typescript
// ❌ ERRADO
interface TimerProps {
  compact?: boolean;
  minimal?: boolean;
}
<UnifiedTimer compact={true} />

// ✅ CORRETO
interface TimerProps {
  variant?: 'default' | 'compact' | 'minimal';
}
<UnifiedTimer variant="compact" />
```

### Classes CSS com cn()
```typescript
import { cn } from '@/lib/utils';

// ✅ CORRETO
<div className={cn(
  "base-classes p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  className
)}>

// ❌ ERRADO
<div className={`p-4 ${isActive ? 'bg-primary' : ''}`}>
```

### Cores Semânticas OBRIGATÓRIAS
```typescript
// ✅ CORRETO
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
<div className="bg-muted text-muted-foreground">
<div className="bg-card border-border">

// ❌ ERRADO - Cores hardcoded
<div className="bg-white text-black">
<div className="bg-[#1a1a2e] text-[#ffffff]">
<div className="bg-purple-500">
```

---

## 🪝 PADRÕES DE HOOKS

```typescript
// SEMPRE validar parâmetros
const enabled = !!userId;

// SEMPRE usar enabled em useQuery
const { data } = useQuery({
  queryKey: ['minha-feature', userId],
  queryFn: async () => {
    if (!userId) return null;
    // query...
  },
  enabled, // SÓ executa se enabled = true
  staleTime: 5 * 60 * 1000,
});

// SEMPRE invalidar cache após mutation
const mutation = useMutation({
  mutationFn: async (item) => { ... },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['minha-feature'] });
  },
});
```

---

## 🔌 EDGE FUNCTIONS - ESTRUTURA OBRIGATÓRIA

```typescript
// supabase/functions/[nome]/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // SEMPRE handle CORS primeiro
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Usar Deno.env (NÃO VITE_*)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // lógica...
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### ❌ NUNCA em Edge Functions:
- Importar de `@/` paths
- Usar `VITE_*` env vars
- Esquecer CORS headers

---

## 📁 ESTRUTURA DE PASTAS

```
src/
├── components/
│   ├── ui/              # Componentes base (NUNCA lógica de negócio)
│   ├── sofia/           # IA Sofia
│   ├── exercise/        # Exercícios
│   ├── nutrition/       # Nutrição
│   ├── tracking/        # Tracking de saúde
│   ├── admin/           # Admin
│   └── challenges/      # Desafios
├── hooks/
│   └── use[Feature].ts  # Hooks de feature
├── pages/
│   └── [Feature]Page.tsx
├── data/
│   └── *.ts             # Dados estáticos
├── lib/
│   └── utils.ts
└── integrations/
    └── supabase/        # ⚠️ AUTO-GERADO - NÃO EDITAR

supabase/
├── functions/
│   └── [nome-funcao]/
│       └── index.ts
└── migrations/
```

---

## ✅ CHECKLIST PRÉ-COMMIT

- [ ] Imports usando `@/` alias
- [ ] Supabase de `@/integrations/supabase/client`
- [ ] Arrays acessados com `[0]` ou `.map()`
- [ ] Admin via `rpc('is_admin_user')`
- [ ] Colunas existem no banco
- [ ] Cores semânticas (não hardcoded)
- [ ] Edge functions com CORS
- [ ] TypeScript sem erros

---

## 📚 DOCUMENTAÇÃO COMPLETA

- `docs/AI_CODING_GUIDELINES.md` - Guia completo com todas as regras
- `docs/COMMON_ERRORS.md` - 21 erros comuns com soluções
- `docs/DATABASE_QUICK_REF.md` - Referência rápida das tabelas
- `.cursorrules` - Versão resumida para Cursor AI

---

*Última atualização: Janeiro 2026*
