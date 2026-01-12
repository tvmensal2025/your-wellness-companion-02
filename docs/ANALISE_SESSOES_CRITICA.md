# 🔴 ANÁLISE CRÍTICA - Sistema de Sessões

> **Data:** Janeiro 2026  
> **Status:** ⚠️ REQUER ATENÇÃO IMEDIATA  
> **Risco:** ALTO - Pode causar erros em produção

---

## 📊 Resumo Executivo

O sistema de sessões funciona hoje, mas possui **7 problemas críticos** que podem causar falhas no futuro:

| # | Problema | Severidade | Impacto |
|---|----------|------------|---------|
| 1 | Colunas fantasma no frontend | 🔴 CRÍTICO | Erro silencioso |
| 2 | Falta UNIQUE constraint | 🔴 CRÍTICO | Duplicatas |
| 3 | Status inconsistente | 🟡 MÉDIO | Dados incorretos |
| 4 | Falta CHECK constraint | 🟡 MÉDIO | Status inválidos |
| 5 | session_attempt_id inexistente | 🔴 CRÍTICO | Insert falha |
| 6 | Funções RPC desatualizadas | 🟡 MÉDIO | Funcionalidade quebrada |
| 7 | Índices insuficientes | 🟢 BAIXO | Performance |

---

## 🔴 PROBLEMA 1: Colunas Fantasma no Frontend

### O que acontece
O componente `UserSessions.tsx` usa colunas que **NÃO EXISTEM** na tabela `user_sessions`:

```typescript
// src/components/UserSessions.tsx - Interface UserSession (linha 48-56)
interface UserSession {
  // ...
  auto_save_data: any;           // ❌ NÃO EXISTE NO BANCO
  last_activity: string;         // ❌ NÃO EXISTE NO BANCO
  cycle_number: number;          // ❌ NÃO EXISTE NO BANCO
  next_available_date?: string;  // ❌ NÃO EXISTE NO BANCO
  is_locked: boolean;            // ❌ NÃO EXISTE NO BANCO
  review_count: number;          // ❌ NÃO EXISTE NO BANCO
}
```

### Estrutura REAL da tabela `user_sessions`:
```sql
CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid,
    user_id uuid,
    status character varying(20) DEFAULT 'assigned',
    assigned_at timestamp with time zone DEFAULT now(),
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    due_date timestamp with time zone,
    progress integer DEFAULT 0,
    feedback jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tools_data jsonb
);
-- FALTAM: auto_save_data, last_activity, cycle_number, next_available_date, is_locked, review_count
```

### Por que funciona hoje?
O código usa fallbacks:
```typescript
// linha 178-184
auto_save_data: session.auto_save_data || {},      // Retorna {} se undefined
last_activity: session.updated_at || session.assigned_at,
cycle_number: session.cycle_number || 1,           // Retorna 1 se undefined
next_available_date: session.next_available_date || null,
is_locked: session.is_locked || false,             // Retorna false se undefined
review_count: session.review_count || 0,           // Retorna 0 se undefined
```

### Quando vai quebrar?
1. Se alguém tentar **salvar** `cycle_number` ou `is_locked` no banco
2. Se a função `complete_session_cycle` for chamada (ela espera essas colunas)
3. Se alguém fizer um `UPDATE` com esses campos

### ✅ SOLUÇÃO
```sql
-- Migration para adicionar colunas faltantes
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS auto_save_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cycle_number integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS next_available_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- last_activity pode usar updated_at (já existe)
```

---

## 🔴 PROBLEMA 2: Falta UNIQUE Constraint

### O que acontece
A tabela `user_sessions` **NÃO TEM** constraint unique para `(user_id, session_id)`.

### Evidência
```sql
-- Única constraint existente:
ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);
-- FALTA: UNIQUE(user_id, session_id)
```

### Por que é crítico?
O código usa `upsert` com `onConflict: 'user_id,session_id'`:
```typescript
// src/components/QuickSessionAssigner.tsx
.upsert([assignment], { 
  onConflict: 'user_id,session_id',  // ❌ CONSTRAINT NÃO EXISTE!
  ignoreDuplicates: true 
});
```

### Quando vai quebrar?
1. O `upsert` vai **FALHAR SILENCIOSAMENTE** ou criar duplicatas
2. Um usuário pode ter a mesma sessão atribuída múltiplas vezes
3. Queries vão retornar dados duplicados

### ✅ SOLUÇÃO
```sql
-- Primeiro, remover duplicatas existentes (manter a mais recente)
DELETE FROM user_sessions a
USING user_sessions b
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND a.session_id = b.session_id;

-- Depois, criar constraint
ALTER TABLE public.user_sessions 
ADD CONSTRAINT user_sessions_user_session_unique 
UNIQUE (user_id, session_id);
```

---

## 🟡 PROBLEMA 3: Status Inconsistente

### O que acontece
- **Banco:** Default é `'assigned'`
- **Frontend:** Espera `'pending'`, `'in_progress'`, `'completed'`

```sql
-- Banco de dados
status character varying(20) DEFAULT 'assigned'
```

```typescript
// Frontend espera
pending: sessions.filter(s => s.status === 'pending').length,
inProgress: sessions.filter(s => s.status === 'in_progress').length,
completed: sessions.filter(s => s.status === 'completed').length,
```

### Impacto
Sessões novas com status `'assigned'` não aparecem em nenhuma categoria!

### ✅ SOLUÇÃO
```sql
-- Opção 1: Mudar default para 'pending'
ALTER TABLE public.user_sessions 
ALTER COLUMN status SET DEFAULT 'pending';

-- Opção 2: Atualizar sessões existentes
UPDATE public.user_sessions 
SET status = 'pending' 
WHERE status = 'assigned';
```

---

## 🟡 PROBLEMA 4: Falta CHECK Constraint

### O que acontece
Não existe validação de valores permitidos para `status`.

### Risco
Alguém pode inserir `status = 'banana'` e o sistema aceita.

### ✅ SOLUÇÃO
```sql
ALTER TABLE public.user_sessions 
ADD CONSTRAINT user_sessions_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));
```

---

## 🔴 PROBLEMA 5: session_attempt_id Inexistente

### O que acontece
O código tenta inserir `session_attempt_id` em `daily_responses`:

```typescript
// src/components/UserSessions.tsx - linha 420
const { error } = await supabase
  .from('daily_responses')
  .insert({
    user_id: user.id,
    date: today,
    section: 'sessions',
    question_id: `session_${sessionId}`,
    answer: activity,
    text_response: `Atividade de sessão: ${activity}`,
    points_earned: 10,
    session_attempt_id: sessionAttemptId,  // ❌ COLUNA NÃO EXISTE!
    created_at: new Date().toISOString()
  });
```

### Estrutura REAL de `daily_responses`:
```sql
CREATE TABLE public.daily_responses (
    id uuid,
    user_id uuid,
    question_id text,
    response text,
    response_type text,
    score integer,
    date date,
    created_at timestamp,
    text_response text,
    section text,
    answer text,
    points_earned integer
    -- FALTA: session_attempt_id
);
```

### Quando vai quebrar?
**AGORA!** O insert vai falhar com erro de coluna inexistente.

### ✅ SOLUÇÃO
```sql
ALTER TABLE public.daily_responses 
ADD COLUMN IF NOT EXISTS session_attempt_id text;

CREATE INDEX IF NOT EXISTS idx_daily_responses_session_attempt 
ON public.daily_responses(session_attempt_id);
```

---

## 🟡 PROBLEMA 6: Funções RPC Desatualizadas

### O que acontece
A função `complete_session_cycle` espera colunas que não existem:

```sql
-- sql/queries/SUPABASE_FUNCTIONS_BACKUP.sql
UPDATE user_sessions 
SET 
  status = 'completed',
  progress = 100,
  completed_at = NOW(),
  is_locked = TRUE,              -- ❌ COLUNA NÃO EXISTE
  next_available_date = v_next_date  -- ❌ COLUNA NÃO EXISTE
WHERE user_id = p_user_id AND session_id = p_session_id;
```

### Impacto
Se alguém chamar `supabase.rpc('complete_session_cycle')`, vai dar erro.

### ✅ SOLUÇÃO
Adicionar as colunas (Problema 1) ou atualizar a função.

---

## 🟢 PROBLEMA 7: Índices Insuficientes

### Índices existentes:
```sql
CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_user_status ON public.user_sessions(user_id, status);
```

### Índices recomendados:
```sql
-- Para queries de sessões por data
CREATE INDEX IF NOT EXISTS idx_user_sessions_assigned_at 
ON public.user_sessions(assigned_at DESC);

-- Para queries de sessões completas
CREATE INDEX IF NOT EXISTS idx_user_sessions_completed_at 
ON public.user_sessions(completed_at DESC) 
WHERE status = 'completed';

-- Para busca por session_id
CREATE INDEX IF NOT EXISTS idx_user_sessions_session 
ON public.user_sessions(session_id);
```

---

## 📋 MIGRATION COMPLETA RECOMENDADA

```sql
-- =====================================================
-- MIGRATION: fix_user_sessions_schema
-- Data: Janeiro 2026
-- Descrição: Corrige problemas críticos na tabela user_sessions
-- =====================================================

BEGIN;

-- 1. Adicionar colunas faltantes em user_sessions
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS auto_save_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cycle_number integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS next_available_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- 2. Adicionar coluna faltante em daily_responses
ALTER TABLE public.daily_responses 
ADD COLUMN IF NOT EXISTS session_attempt_id text;

-- 3. Corrigir status default
ALTER TABLE public.user_sessions 
ALTER COLUMN status SET DEFAULT 'pending';

-- 4. Atualizar status 'assigned' para 'pending'
UPDATE public.user_sessions 
SET status = 'pending' 
WHERE status = 'assigned';

-- 5. Remover duplicatas antes de criar constraint
DELETE FROM user_sessions a
USING user_sessions b
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND a.session_id = b.session_id;

-- 6. Criar UNIQUE constraint
ALTER TABLE public.user_sessions 
ADD CONSTRAINT user_sessions_user_session_unique 
UNIQUE (user_id, session_id);

-- 7. Criar CHECK constraint para status
ALTER TABLE public.user_sessions 
ADD CONSTRAINT user_sessions_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));

-- 8. Criar índices adicionais
CREATE INDEX IF NOT EXISTS idx_user_sessions_assigned_at 
ON public.user_sessions(assigned_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_completed_at 
ON public.user_sessions(completed_at DESC) 
WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_user_sessions_session 
ON public.user_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_daily_responses_session_attempt 
ON public.daily_responses(session_attempt_id);

COMMIT;
```

---

## 🔄 Fluxo de Dados Correto

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    sessions     │────▶│  user_sessions   │────▶│ daily_responses │
│   (templates)   │     │  (atribuições)   │     │   (respostas)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        │                       │                        │
   id, title,              user_id,                 user_id,
   description,            session_id,              question_id,
   type,                   status,                  answer,
   content,                progress,                section,
   difficulty              cycle_number,            session_attempt_id
                           is_locked
```

---

## ✅ Checklist de Correção

- [ ] Aplicar migration com colunas faltantes
- [ ] Criar UNIQUE constraint
- [ ] Atualizar status 'assigned' → 'pending'
- [ ] Criar CHECK constraint
- [ ] Adicionar índices
- [ ] Testar função `complete_session_cycle`
- [ ] Verificar inserts em `daily_responses`

---

---

## 🎨 REDESIGN IMPLEMENTADO

Foi criado um novo componente `UserSessionsRedesigned` em `src/components/sessions/UserSessionsRedesigned.tsx` com as seguintes melhorias:

### Melhorias de Design

| Antes | Depois |
|-------|--------|
| 4 cards grandes de estatísticas | Barra horizontal compacta |
| Sem CTA claro | Card hero "Próxima Sessão" com botão destacado |
| Cores hardcoded | Cores semânticas (text-foreground, bg-card, etc) |
| Filtros decorativos | Pills funcionais com contagem |
| Sem gamificação | Card de celebração quando tudo completo |
| Layout fixo | Animações com Framer Motion |

### Componentes Criados

1. **StatsBar** - Barra horizontal compacta com estatísticas
2. **NextSessionCard** - Card hero para próxima sessão
3. **FilterPills** - Filtros funcionais por status
4. **SessionCard** - Card individual de sessão redesenhado
5. **EmptyState** - Estados vazios contextuais
6. **CelebrationCard** - Celebração quando tudo completo

### Como usar

```tsx
import { UserSessionsRedesigned } from '@/components/sessions';

<UserSessionsRedesigned 
  user={user} 
  onStartSession={(sessionId) => {
    // Abrir modal de sessão ou navegar
  }} 
/>
```

---

*Documento gerado automaticamente - Análise de código*
