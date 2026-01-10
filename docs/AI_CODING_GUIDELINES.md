# 🤖 AI Coding Guidelines - Instituto dos Sonhos

> **DOCUMENTO CRÍTICO**: Este guia deve ser seguido por TODAS as IAs (Kiro, Cursor, Lovable, etc.) ao trabalhar neste projeto.

---

## 📋 Índice

1. [Arquivos Protegidos](#1-arquivos-protegidos---nunca-editar)
2. [Estrutura de Pastas](#2-estrutura-de-pastas-obrigatória)
3. [Padrões de Importação](#3-padrões-de-importação)
4. [Padrões de Componentes](#4-padrões-de-componentes)
5. [Padrões de Hooks](#5-padrões-de-hooks)
6. [Padrões de Banco de Dados](#6-padrões-de-banco-de-dados)
7. [Edge Functions](#7-edge-functions)
8. [Segurança e RLS](#8-segurança-e-rls)
9. [Performance](#9-performance)
10. [Checklist Pré-Commit](#10-checklist-pré-commit)

---

## 1. ARQUIVOS PROTEGIDOS - NUNCA EDITAR

### ⛔ Arquivos Auto-Gerados (READ-ONLY)

```
src/integrations/supabase/client.ts  → Cliente Supabase (auto-gerado)
src/integrations/supabase/types.ts   → Tipos do banco (13.000+ linhas, auto-gerado)
.env                                  → Variáveis de ambiente (auto-configurado)
supabase/config.toml                  → Configuração Supabase (auto-configurado)
package.json                          → Usar ferramentas de dependência
package-lock.json                     → Auto-gerado
bun.lockb                             → Auto-gerado
```

### ✅ O que fazer ao invés de editar:

| Precisa de... | Faça isso |
|---------------|-----------|
| Novo tipo de banco | Use `supabase--migration` tool |
| Nova dependência | Use `lov-add-dependency` tool |
| Mudar env vars | Use `secrets--add_secret` tool |
| Configurar Supabase | Use `supabase--configure-auth` tool |

---

## 2. ESTRUTURA DE PASTAS OBRIGATÓRIA

```
src/
├── components/
│   ├── ui/              # Componentes base (Button, Input, Card, Dialog, etc.)
│   │   └── *.tsx        # NUNCA criar lógica de negócio aqui
│   │
│   ├── [feature]/       # Componentes por feature
│   │   ├── sofia/       # IA Sofia
│   │   ├── exercise/    # Exercícios
│   │   ├── nutrition/   # Nutrição
│   │   ├── tracking/    # Tracking de saúde
│   │   ├── weighing/    # Pesagens
│   │   ├── admin/       # Componentes admin
│   │   └── challenges/  # Desafios
│   │
│   └── shared/          # Componentes compartilhados entre features
│       └── *.tsx
│
├── hooks/
│   ├── use[Feature].ts  # Hooks de feature (useSofia, useNutrition)
│   └── use-[util].tsx   # Utilitários (use-mobile, use-toast)
│
├── pages/
│   ├── [Feature]Page.tsx    # Páginas principais
│   ├── admin/               # Páginas administrativas
│   └── Index.tsx            # Landing page
│
├── data/
│   └── *.ts             # Constantes, mappings, dados estáticos
│
├── lib/
│   └── utils.ts         # Utilitários (cn, formatters)
│
├── services/
│   └── *.ts             # Serviços de API
│
└── integrations/
    └── supabase/        # ⚠️ AUTO-GERADO - NÃO EDITAR
        ├── client.ts
        └── types.ts

supabase/
├── functions/
│   ├── [nome-funcao]/
│   │   └── index.ts     # TODO código da function aqui
│   └── _shared/
│       └── cors.ts      # Utilitários compartilhados
└── config.toml          # ⚠️ AUTO-GERADO
```

---

## 3. PADRÕES DE IMPORTAÇÃO

### ✅ Imports Corretos

```typescript
// Supabase Client - ÚNICO LUGAR
import { supabase } from '@/integrations/supabase/client';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Hooks
import { useAuth } from '@/hooks/useAuth';
import { useSofiaChat } from '@/hooks/useSofiaChat';

// Utilitários
import { cn } from '@/lib/utils';

// React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Lucide Icons
import { Heart, Activity, Brain } from 'lucide-react';
```

### ⛔ Imports ERRADOS

```typescript
// ❌ NUNCA criar outro cliente Supabase
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(...);

// ❌ NUNCA usar imports relativos longos
import { Button } from '../../../components/ui/button';

// ❌ NUNCA importar de paths que não existem
import { exercises } from './exercise-database'; // ERRO: é exercises-database.ts

// ❌ NUNCA importar interfaces não exportadas
import { SomeInterface } from './file'; // Se não tem 'export' não funciona
```

### 🔍 Verificações Obrigatórias Antes de Importar

1. **Arquivo existe?** Verificar nome exato (com/sem 's', hífens, etc.)
2. **Export existe?** Verificar se tem `export` antes da interface/função
3. **Path correto?** Usar sempre `@/` ao invés de relativos

---

## 4. PADRÕES DE COMPONENTES

### Estrutura Padrão de Componente

```typescript
// 1. IMPORTS (ordem: react, libs externas, internos, tipos)
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// 2. TYPES/INTERFACES (SEMPRE exportar se usado externamente)
export interface MeuComponenteProps {
  userId: string;
  variant?: 'default' | 'compact' | 'expanded';
  onComplete?: () => void;
  className?: string;
}

// 3. COMPONENTE
export const MeuComponente: React.FC<MeuComponenteProps> = ({ 
  userId, 
  variant = 'default',
  onComplete,
  className 
}) => {
  // 3.1 Hooks de estado
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType | null>(null);

  // 3.2 Hooks customizados
  const { user } = useAuth();

  // 3.3 Effects
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  // 3.4 Handlers (usar useCallback para funções passadas como props)
  const handleClick = useCallback(() => {
    setLoading(true);
    // lógica
    onComplete?.();
  }, [onComplete]);

  // 3.5 Early returns
  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  // 3.6 Render
  return (
    <Card className={cn(
      "p-4 rounded-lg transition-all",
      variant === 'compact' && "p-2",
      variant === 'expanded' && "p-6",
      className
    )}>
      {/* JSX */}
    </Card>
  );
};

export default MeuComponente;
```

### 🎨 Classes CSS com cn()

```typescript
// ✅ CORRETO - Usar cn() para classes condicionais
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed",
  className // sempre permitir override
)}>

// ❌ ERRADO - Template strings bagunçadas
<div className={`p-4 ${isActive ? 'bg-primary' : ''} ${className}`}>
```

### 🔘 Variantes ao Invés de Props Booleanas

```typescript
// ✅ CORRETO - Usar variant
interface TimerProps {
  variant?: 'default' | 'compact' | 'minimal';
}
<UnifiedTimer variant="compact" />

// ❌ ERRADO - Props booleanas múltiplas
interface TimerProps {
  compact?: boolean;
  minimal?: boolean;
}
<UnifiedTimer compact={true} minimal={false} />
```

### 🎭 Cores Semânticas (OBRIGATÓRIO)

```typescript
// ✅ CORRETO - Usar tokens semânticos
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

## 5. PADRÕES DE HOOKS

### Estrutura Padrão de Hook

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Tipos do hook
interface UseMinhaFeatureReturn {
  data: DataType[] | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  create: (item: NewItem) => Promise<void>;
}

export const useMinhaFeature = (userId: string | undefined): UseMinhaFeatureReturn => {
  const queryClient = useQueryClient();
  
  // ⚠️ SEMPRE validar parâmetros
  const enabled = !!userId;

  // Query principal
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['minha-feature', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('minha_tabela')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled, // ⚠️ SÓ executa se enabled = true
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation
  const createMutation = useMutation({
    mutationFn: async (item: NewItem) => {
      const { error } = await supabase
        .from('minha_tabela')
        .insert({ ...item, user_id: userId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-feature', userId] });
    },
  });

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null,
    refresh: refetch,
    create: createMutation.mutateAsync,
  };
};
```

### ⚠️ Acessando Dados do Supabase

```typescript
// Supabase SEMPRE retorna arrays para select()

// ✅ CORRETO - Acessar como array
const { data } = await supabase.from('user_physical_data').select('*');
const altura = data?.[0]?.altura_cm;
const peso = data?.[0]?.peso_kg;

// ✅ CORRETO - Usar single() quando espera 1 registro
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
const nome = data?.full_name;

// ❌ ERRADO - Tratar array como objeto
const { data } = await supabase.from('user_physical_data').select('*');
const altura = data.altura_cm; // ERRO: data é array!

// ❌ ERRADO - Esquecer null check
const altura = data[0].altura_cm; // ERRO: data pode ser null!
```

---

## 6. PADRÕES DE BANCO DE DADOS

### 📊 Tabelas Principais

| Tabela | Descrição | Colunas Importantes |
|--------|-----------|---------------------|
| `profiles` | Perfil do usuário | `id`, `full_name`, `email`, `avatar_url`, `bio` |
| `user_physical_data` | Dados físicos | `user_id`, `altura_cm`, `peso_kg`, `data_nascimento`, `sexo` |
| `weight_measurements` | Histórico de peso | `user_id`, `weight_kg`, `measurement_date`, `notes` |
| `food_analysis` | Análises nutricionais | `user_id`, `meal_type`, `analysis_text`, `health_score` |
| `challenges` | Desafios | `id`, `title`, `description`, `challenge_type`, `points_reward` |
| `challenge_participations` | Participação em desafios | `user_id`, `challenge_id`, `progress`, `is_completed` |
| `user_goals` | Metas do usuário | `user_id`, `title`, `description`, `target_date`, `status` |
| `user_roles` | Roles de usuário | `user_id`, `role` (admin, moderator, user) |
| `advanced_daily_tracking` | Tracking diário | `user_id`, `tracking_date`, `energy_level`, `sleep_quality`, `stress_level` |

### ⛔ Colunas que NÃO Existem (Erros Comuns)

```typescript
// ❌ ERRADO - Estas colunas NÃO existem
profiles.role                    // Não existe! Usar user_roles
profiles.admin_level             // Não existe!
profiles.height_cm               // É height (sem _cm)
profiles.date_of_birth           // É birth_date
challenges.category              // É challenge_type
user_goals.profiles              // Não tem FK direta
daily_health_tracking            // É advanced_daily_tracking
user_physical_data.peso_kg       // É peso_atual_kg

// ✅ CORRETO
user_roles.role                  // Para verificar admin
profiles.height                  // Altura
profiles.birth_date              // Data nascimento
challenges.challenge_type        // Tipo do desafio
advanced_daily_tracking.*        // Tracking diário
```

### 🔐 Verificando Admin (ÚNICO MÉTODO SEGURO)

```typescript
// ✅ CORRETO - Via RPC seguro (função no banco)
const { data: isAdmin } = await supabase.rpc('is_admin_user');

// ✅ CORRETO - Via hook useAdminMode
import { useAdminMode } from '@/hooks/useAdminMode';
const { isAdmin, isChecking } = useAdminMode(user);

// ❌ ERRADO - Consultando profiles diretamente
const { data } = await supabase
  .from('profiles')
  .select('role'); // Coluna NÃO existe!

// ❌ ERRADO - Consultando user_roles sem validação no backend
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId); // Pode ser manipulado no frontend!
```

### 📝 Inserts Corretos

```typescript
// Verificar campos obrigatórios em types.ts
// Campos sem "?" são obrigatórios

// ✅ CORRETO
await supabase.from('food_analysis').insert({
  user_id: userId,           // obrigatório
  meal_type: 'lunch',        // verificar tipo
  analysis_text: 'Análise',  // string
  health_score: 85,          // number
  created_at: new Date().toISOString(), // timestamp
});

// ❌ ERRADO - Campos que não existem
await supabase.from('food_analysis').insert({
  user_id: userId,
  meal_name: 'Almoço',       // NÃO existe! É meal_type
  score: 85,                  // NÃO existe! É health_score
});
```

---

## 7. EDGE FUNCTIONS

### Estrutura Obrigatória

```typescript
// supabase/functions/minha-funcao/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

// CORS obrigatório
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. SEMPRE handle CORS preflight primeiro
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2. Criar cliente Supabase com env vars do Deno
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Pegar dados do request
    const { userId, data } = await req.json();

    // 4. Lógica da função
    const result = await processData(data);

    // 5. Retorno COM headers CORS
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

### ⛔ O que NUNCA fazer em Edge Functions

```typescript
// ❌ NUNCA importar de src/
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';

// ❌ NUNCA usar VITE_* env vars
const url = Deno.env.get('VITE_SUPABASE_URL'); // Não existe no Deno!

// ❌ NUNCA esquecer CORS
return new Response(JSON.stringify(data)); // Falta headers!

// ❌ NUNCA criar arquivos fora de index.ts sem config
// supabase/functions/minha-funcao/utils.ts → Não vai funcionar
```

### ✅ Padrões Corretos

```typescript
// ✅ Usar Deno.env para todas env vars
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const openaiKey = Deno.env.get('OPENAI_API_KEY');

// ✅ Importar de esm.sh ou deno.land
import { z } from 'https://esm.sh/zod@3.22.4';
import { format } from 'https://esm.sh/date-fns@3.0.0';

// ✅ Compartilhar código via _shared/
import { corsHeaders } from '../_shared/cors.ts';
```

---

## 8. SEGURANÇA E RLS

### 🔐 Row Level Security (RLS)

```sql
-- Tabelas de usuário: apenas o próprio usuário acessa
CREATE POLICY "Users can view own data" ON user_physical_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON user_physical_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_physical_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Tabelas públicas (comunidade)
CREATE POLICY "Anyone can view challenges" ON challenges
  FOR SELECT USING (true);

-- Tabelas admin: verificar role no banco
CREATE POLICY "Only admins can modify" ON admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### 🛡️ Dados Sensíveis

```
PII (Personally Identifiable Information):
├── profiles (nome, email, telefone)
├── weight_measurements (dados de saúde)
├── medical_documents (documentos médicos)
├── user_physical_data (dados corporais)
└── food_analysis (hábitos alimentares)

⚠️ SEMPRE proteger com RLS restritivo:
- auth.uid() = user_id para todas operações
- Nunca expor em APIs públicas
```

### 🔑 Autenticação

```typescript
// ✅ Verificar auth antes de operações sensíveis
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error('Usuário não autenticado');
}

// ✅ Usar o user.id retornado pelo Supabase
const { error } = await supabase
  .from('user_physical_data')
  .insert({ user_id: user.id, ... });
```

---

## 9. PERFORMANCE

### 🚀 Otimizações Obrigatórias

```typescript
// 1. Lazy loading de componentes pesados
const HeavyChart = lazy(() => import('@/components/charts/HeavyChart'));

// 2. Memoização de componentes
const MeuComponente = memo(({ data }) => {
  return <div>{/* render */}</div>;
});

// 3. useCallback para funções em props
const handleClick = useCallback(() => {
  // lógica
}, [dependencias]);

// 4. useMemo para cálculos pesados
const dadosProcessados = useMemo(() => {
  return dados.map(processarItem);
}, [dados]);

// 5. Debounce para inputs
const debouncedSearch = useMemo(
  () => debounce((term: string) => search(term), 300),
  []
);
```

### 📱 Performance Mobile

```typescript
// Verificar capacidade do device
import { useSafeAnimation } from '@/hooks/useSafeAnimation';
const { shouldAnimate, isLowEndDevice } = useSafeAnimation();

// Reduzir animações em devices fracos
<motion.div
  animate={shouldAnimate ? { opacity: 1 } : false}
  transition={{ duration: isLowEndDevice ? 0.15 : 0.3 }}
>
```

---

## 10. CHECKLIST PRÉ-COMMIT

### ✅ Imports
- [ ] Usando `@/` para todos imports internos
- [ ] Supabase client de `@/integrations/supabase/client`
- [ ] Arquivos importados existem (nome exato verificado)
- [ ] Interfaces têm `export` se usadas externamente
- [ ] Sem imports de `createClient` do supabase-js

### ✅ Componentes
- [ ] Props tipadas com interface exportada
- [ ] Usando `cn()` para classes condicionais
- [ ] Usando variants ao invés de props booleanas
- [ ] Cores semânticas (não hardcoded)
- [ ] className passado para o elemento raiz

### ✅ Hooks
- [ ] Parâmetros validados antes de queries
- [ ] `enabled` configurado em useQuery
- [ ] Arrays acessados com `[0]` ou `.map()`
- [ ] Null checks em todos acessos de dados
- [ ] Error handling implementado

### ✅ Supabase
- [ ] Colunas existem no types.ts
- [ ] Tabelas existem no banco
- [ ] Não fazendo joins que não existem
- [ ] Admin check via RPC `is_admin_user`
- [ ] RLS policies consideradas

### ✅ Edge Functions
- [ ] CORS headers em todas respostas
- [ ] Handle de OPTIONS request
- [ ] Usando `Deno.env` (não VITE_*)
- [ ] Imports de esm.sh ou deno.land
- [ ] Error handling com try/catch

### ✅ Geral
- [ ] TypeScript sem erros
- [ ] Console.log removidos (usar logger)
- [ ] Código formatado (Prettier)
- [ ] Sem dependências circulares
- [ ] Testes passando

---

## 📚 Arquivos Relacionados

- [COMMON_ERRORS.md](./COMMON_ERRORS.md) - Lista detalhada de erros comuns
- [DATABASE_QUICK_REF.md](./DATABASE_QUICK_REF.md) - Referência rápida do banco
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do sistema
- [.cursorrules](../.cursorrules) - Regras para Cursor AI

---

*Última atualização: Janeiro 2026*
*Versão: 2.0*
