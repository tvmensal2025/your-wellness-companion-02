# 🤖 MaxNutrition - Knowledge Base Completo para Lovable

> **INSTRUÇÕES CRÍTICAS**: Este documento contém TODAS as regras do projeto. NUNCA ignorar. Consultar ANTES de qualquer alteração.

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

## ✅ IMPORTS OBRIGATÓRIOS

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
import { createClient } from '@supabase/supabase-js'; // PROIBIDO!

// NUNCA usar paths relativos longos
import { Button } from '../../../components/ui/button'; // PROIBIDO!
```

---

## 🗃️ SCHEMA DO BANCO DE DADOS - TABELAS PRINCIPAIS

### `profiles` - Perfil do usuário
```sql
id UUID PRIMARY KEY          -- ID do usuário (FK para auth.users)
full_name TEXT               -- Nome completo
email TEXT                   -- Email
avatar_url TEXT              -- URL do avatar
bio TEXT                     -- Biografia
phone TEXT                   -- Telefone
height NUMERIC               -- Altura em cm (NÃO é height_cm!)
birth_date DATE              -- Data nascimento (NÃO é date_of_birth!)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```
⚠️ **COLUNAS QUE NÃO EXISTEM:** `role`, `admin_level`, `height_cm`, `date_of_birth`

---

### `user_roles` - Roles de usuário
```sql
id UUID PRIMARY KEY
user_id UUID                 -- ID do usuário
role TEXT                    -- 'admin', 'moderator', 'user'
created_at TIMESTAMPTZ
```
⚠️ **Para verificar admin, SEMPRE usar RPC:**
```typescript
const { data: isAdmin } = await supabase.rpc('is_admin_user');
```

---

### `user_physical_data` - Dados físicos
```sql
id UUID PRIMARY KEY
user_id UUID
altura_cm NUMERIC            -- Altura em centímetros
peso_atual_kg NUMERIC        -- Peso atual (NÃO é peso_kg!)
imc NUMERIC                  -- IMC calculado
data_nascimento DATE
sexo TEXT
nivel_atividade TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```
⚠️ **COLUNA QUE NÃO EXISTE:** `peso_kg` (é `peso_atual_kg`)

---

### `weight_measurements` - Histórico de pesagens
```sql
id UUID PRIMARY KEY
user_id UUID
weight_kg NUMERIC            -- Peso em kg
measurement_date DATE
notes TEXT
photo_url TEXT
body_fat_percentage NUMERIC
muscle_mass_kg NUMERIC
created_at TIMESTAMPTZ
```

---

### `food_analysis` - Análises nutricionais
```sql
id UUID PRIMARY KEY
user_id UUID
meal_type TEXT               -- 'breakfast', 'lunch', 'dinner', 'snack'
analysis_text TEXT
health_score INTEGER         -- 0-100
calories NUMERIC
protein_g NUMERIC
carbs_g NUMERIC
fat_g NUMERIC
photo_url TEXT
created_at TIMESTAMPTZ
```

---

### `challenges` - Desafios
```sql
id UUID PRIMARY KEY
title TEXT
description TEXT
challenge_type TEXT          -- (NÃO é category!)
difficulty TEXT
points_reward INTEGER
xp_reward INTEGER
duration_days INTEGER
is_active BOOLEAN
created_at TIMESTAMPTZ
```
⚠️ **COLUNA QUE NÃO EXISTE:** `category` (é `challenge_type`)

---

### `challenge_participations` - Participações em desafios
```sql
id UUID PRIMARY KEY
user_id UUID
challenge_id UUID
progress NUMERIC             -- 0-100
is_completed BOOLEAN
points_earned INTEGER
started_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
```

---

### `advanced_daily_tracking` - Tracking diário
```sql
id UUID PRIMARY KEY
user_id UUID
tracking_date DATE
energy_level INTEGER         -- 1-10
stress_level INTEGER         -- 1-10
sleep_quality INTEGER        -- 1-10
sleep_hours NUMERIC
water_ml INTEGER
steps INTEGER
mood_rating INTEGER
notes TEXT
created_at TIMESTAMPTZ
```
⚠️ **TABELA CORRETA:** `advanced_daily_tracking` (NÃO `daily_health_tracking`)

---

### `user_goals` - Metas do usuário
```sql
id UUID PRIMARY KEY
user_id UUID
title TEXT
description TEXT
target_date DATE
status TEXT                  -- 'pendente', 'aprovada', 'concluida'
progress NUMERIC             -- 0-100
created_at TIMESTAMPTZ
```
⚠️ **NÃO TEM JOIN com profiles** - fazer queries separadas

---

### `sessions` - Templates de sessão
```sql
id UUID PRIMARY KEY
title TEXT
description TEXT
type TEXT                    -- 'coaching', 'therapy', 'assessment', etc
content JSONB                -- Estrutura de seções e perguntas
target_saboteurs TEXT[]
difficulty TEXT              -- 'easy', 'medium', 'hard'
estimated_time INTEGER
is_active BOOLEAN
created_at TIMESTAMPTZ
```

---

### `user_sessions` - Atribuições de sessão
```sql
id UUID PRIMARY KEY
user_id UUID
session_id UUID
status TEXT                  -- 'pending', 'in_progress', 'completed', 'cancelled'
progress INTEGER             -- 0-100
assigned_at TIMESTAMPTZ
started_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
auto_save_data JSONB
cycle_number INTEGER
next_available_date DATE
is_locked BOOLEAN
review_count INTEGER
tools_data JSONB
```
⚠️ **Status válidos:** `'pending'`, `'in_progress'`, `'completed'`, `'cancelled'`
⚠️ **NUNCA usar:** `'assigned'` (foi deprecado!)
⚠️ **UNIQUE constraint:** `(user_id, session_id)` - usar `upsert` com `onConflict`

---

### `daily_responses` - Respostas de sessões
```sql
id UUID PRIMARY KEY
user_id UUID
question_id TEXT
answer TEXT
section TEXT
date DATE
points_earned INTEGER
session_attempt_id UUID
```

---

### `courses` - Cursos
```sql
id UUID PRIMARY KEY
title TEXT
description TEXT
thumbnail_url TEXT
is_published BOOLEAN
is_featured BOOLEAN
order_index INTEGER
created_at TIMESTAMPTZ
```

---

### `course_modules` - Módulos de cursos
```sql
id UUID PRIMARY KEY
course_id UUID
title TEXT
description TEXT
thumbnail_url TEXT
order_index INTEGER
is_published BOOLEAN
```

---

### `lessons` - Aulas
```sql
id UUID PRIMARY KEY
module_id UUID
course_id UUID
title TEXT
description TEXT
video_url TEXT
thumbnail_url TEXT
is_free BOOLEAN
order_index INTEGER
```

---

## 🔄 MAPEAMENTO DE ERROS COMUNS

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
| `user_sessions.status = 'assigned'` | `user_sessions.status = 'pending'` |

---

## 📊 SUPABASE RETORNA ARRAYS - REGRA CRÍTICA

```typescript
// Supabase select() SEMPRE retorna array

// ❌ ERRADO - VAI QUEBRAR!
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

## 🔐 VERIFICAR ADMIN - ÚNICO MÉTODO SEGURO

```typescript
// ✅ CORRETO - Via RPC
const { data: isAdmin } = await supabase.rpc('is_admin_user');

// ✅ CORRETO - Via hook
import { useAdminMode } from '@/hooks/useAdminMode';
const { isAdmin, isChecking } = useAdminMode(user);

// ❌ ERRADO - NUNCA FAZER ISSO!
const { data } = await supabase.from('profiles').select('role'); // COLUNA NÃO EXISTE!
```

---

## 📋 SESSÕES - REGRAS IMPORTANTES

### Status válidos para `user_sessions`:
```typescript
type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
// ❌ NUNCA usar 'assigned' - foi deprecado
```

### Atribuir sessão (evitar duplicatas):
```typescript
// ✅ CORRETO - Usar upsert com onConflict
const { error } = await supabase
  .from('user_sessions')
  .upsert([{
    user_id: userId,
    session_id: sessionId,
    status: 'pending',
    progress: 0
  }], { 
    onConflict: 'user_id,session_id',
    ignoreDuplicates: true 
  });
```

### Completar ciclo de sessão:
```typescript
// ✅ CORRETO - Usar RPC
const { data } = await supabase.rpc('complete_session_cycle', {
  p_user_id: userId,
  p_session_id: sessionId
});
```

---

## 🎨 CORES - USAR TOKENS SEMÂNTICOS

```typescript
// ✅ CORRETO - Tokens semânticos
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
<div className="bg-muted text-muted-foreground">
<div className="bg-card border-border">
<div className="bg-destructive text-destructive-foreground">
<div className="bg-secondary text-secondary-foreground">
<div className="bg-accent text-accent-foreground">

// ❌ ERRADO - Cores hardcoded (PROIBIDO!)
<div className="bg-white text-black">
<div className="bg-[#1a1a2e] text-[#ffffff]">
<div className="bg-purple-500">
<div className="text-gray-900">
```

---

## 🧩 PADRÕES DE COMPONENTES

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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
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

## 🦾 YOLO INTEGRATION - NUNCA DESCONECTAR

O serviço YOLO é **ESSENCIAL** para análise de imagens.

### Configuração Fixa:
```bash
YOLO_SERVICE_URL=https://yolo-service-yolo-detection.0sw627.easypanel.host
YOLO_ENABLED=true
```

### Fluxo Obrigatório para Análise de Alimentos:
```
1. 📸 Imagem recebida
2. 🦾 YOLO detecta objetos (PRIMEIRO)
3. 🤖 Gemini refina com contexto YOLO
4. 📊 Cálculos nutricionais
```

### Código Correto:
```typescript
// SEMPRE tentar YOLO primeiro
const yoloResult = await tryYoloDetect(imageUrl);

if (yoloResult && yoloResult.foods.length > 0) {
  // Usar contexto YOLO no Gemini
  const prompt = `YOLO detectou: ${yoloResult.foods.join(', ')}...`;
}
```

### ❌ Código Proibido:
```typescript
// NUNCA ignorar YOLO
const result = await callGeminiDirectly(imageUrl); // ERRADO!
```

---

## 🎨 BRANDING - LOGOS

| Tema | Logo | Arquivo |
|------|------|---------|
| **Modo Claro** | Logo PRETA | `logo-dark.png` |
| **Modo Escuro** | Logo BRANCA | `logo-light.png` |

```typescript
// ✅ CORRETO - Alternar automaticamente
<img src="/logo-dark.png" className="dark:hidden" alt="MaxNutrition" />
<img src="/logo-light.png" className="hidden dark:block" alt="MaxNutrition" />
```

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
- [ ] Colunas existem no banco (verificar lista acima)
- [ ] Cores semânticas (não hardcoded)
- [ ] Edge functions com CORS
- [ ] TypeScript sem erros
- [ ] Status de sessão válido ('pending', 'in_progress', 'completed', 'cancelled')

---

## 🐛 ERROS MAIS COMUNS E SOLUÇÕES

### 1. Column does not exist
```typescript
// ERRO: column "category" does not exist
// SOLUÇÃO: Usar challenge_type
.select('challenge_type') // NÃO category
```

### 2. Cannot read property of undefined
```typescript
// ERRO: data.altura_cm is undefined
// CAUSA: Supabase retorna array
// SOLUÇÃO:
const altura = data?.[0]?.altura_cm;
// OU usar .single()
```

### 3. Relationship not found
```typescript
// ERRO: Could not find relationship between 'user_goals' and 'profiles'
// SOLUÇÃO: Fazer queries separadas
const { data: goals } = await supabase.from('user_goals').select('*');
const { data: profile } = await supabase.from('profiles').select('*');
```

### 4. CORS Error em Edge Function
```typescript
// SOLUÇÃO: Adicionar corsHeaders
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

### 5. Admin check fail
```typescript
// ERRO: Tentando acessar profiles.role
// SOLUÇÃO: Usar RPC
const { data: isAdmin } = await supabase.rpc('is_admin_user');
```

---

## 📊 QUERIES DE EXEMPLO CORRETAS

### Buscar perfil do usuário:
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('id, full_name, email, avatar_url, height, birth_date')
  .eq('id', userId)
  .single();
```

### Buscar dados físicos:
```typescript
const { data } = await supabase
  .from('user_physical_data')
  .select('altura_cm, peso_atual_kg, imc')
  .eq('user_id', userId);

const altura = data?.[0]?.altura_cm;
const peso = data?.[0]?.peso_atual_kg;
```

### Buscar desafios ativos:
```typescript
const { data: challenges } = await supabase
  .from('challenges')
  .select('id, title, challenge_type, points_reward, difficulty')
  .eq('is_active', true);
```

### Buscar participações com desafio:
```typescript
const { data } = await supabase
  .from('challenge_participations')
  .select(`
    id,
    progress,
    is_completed,
    challenges (
      id,
      title,
      challenge_type,
      points_reward
    )
  `)
  .eq('user_id', userId);
```

### Atribuir sessão (com upsert):
```typescript
const { error } = await supabase
  .from('user_sessions')
  .upsert([{
    user_id: userId,
    session_id: sessionId,
    status: 'pending',
    progress: 0
  }], { 
    onConflict: 'user_id,session_id',
    ignoreDuplicates: true 
  });
```

### Buscar tracking diário:
```typescript
const { data } = await supabase
  .from('advanced_daily_tracking')
  .select('*')
  .eq('user_id', userId)
  .order('tracking_date', { ascending: false })
  .limit(7);
```

---

*Última atualização: Janeiro 2026*
*Este documento é a fonte única de verdade para o projeto MaxNutrition*
