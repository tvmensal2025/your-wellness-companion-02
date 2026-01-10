# 📊 Database Quick Reference

> Referência rápida das tabelas e colunas mais usadas no projeto Instituto dos Sonhos.

---

## 🔑 Tabelas de Autenticação e Perfil

### `profiles`
> Dados básicos do perfil do usuário

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID do usuário (FK para auth.users) |
| `full_name` | text | Nome completo |
| `email` | text | Email |
| `avatar_url` | text | URL do avatar |
| `bio` | text | Biografia |
| `phone` | text | Telefone |
| `height` | numeric | Altura em cm |
| `birth_date` | date | Data de nascimento |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Última atualização |

⚠️ **NÃO EXISTE:** `role`, `admin_level`, `height_cm`, `date_of_birth`

```typescript
// Exemplo de query
const { data } = await supabase
  .from('profiles')
  .select('id, full_name, email, avatar_url')
  .eq('id', userId)
  .single();
```

---

### `user_roles`
> Roles de usuário para controle de acesso

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID do registro |
| `user_id` | uuid | ID do usuário |
| `role` | text | Role: 'admin', 'moderator', 'user' |
| `created_at` | timestamp | Data de criação |

⚠️ **Para verificar admin, usar RPC:**
```typescript
const { data: isAdmin } = await supabase.rpc('is_admin_user');
```

---

## 💪 Tabelas de Dados Físicos

### `user_physical_data`
> Dados físicos atuais do usuário

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID do registro |
| `user_id` | uuid | ID do usuário |
| `altura_cm` | numeric | Altura em centímetros |
| `peso_atual_kg` | numeric | Peso atual em kg |
| `imc` | numeric | IMC calculado |
| `data_nascimento` | date | Data de nascimento |
| `sexo` | text | Sexo biológico |
| `nivel_atividade` | text | Nível de atividade física |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Última atualização |

⚠️ **NÃO EXISTE:** `peso_kg` (é `peso_atual_kg`)

```typescript
// Exemplo - retorna ARRAY
const { data } = await supabase
  .from('user_physical_data')
  .select('*')
  .eq('user_id', userId);

const altura = data?.[0]?.altura_cm;
const peso = data?.[0]?.peso_atual_kg;
```

---

### `weight_measurements`
> Histórico de pesagens

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID do registro |
| `user_id` | uuid | ID do usuário |
| `weight_kg` | numeric | Peso em kg |
| `measurement_date` | date | Data da medição |
| `notes` | text | Observações |
| `photo_url` | text | URL da foto (se houver) |
| `body_fat_percentage` | numeric | % gordura corporal |
| `muscle_mass_kg` | numeric | Massa muscular em kg |
| `created_at` | timestamp | Data de criação |

```typescript
const { data } = await supabase
  .from('weight_measurements')
  .select('*')
  .eq('user_id', userId)
  .order('measurement_date', { ascending: false })
  .limit(10);
```

---

## 🍎 Tabelas de Nutrição

### `food_analysis`
> Análises nutricionais por IA

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID da análise |
| `user_id` | uuid | ID do usuário |
| `meal_type` | text | Tipo: 'breakfast', 'lunch', 'dinner', 'snack' |
| `analysis_text` | text | Texto da análise |
| `health_score` | integer | Score de 0-100 |
| `calories` | numeric | Calorias estimadas |
| `protein_g` | numeric | Proteína em gramas |
| `carbs_g` | numeric | Carboidratos em gramas |
| `fat_g` | numeric | Gordura em gramas |
| `photo_url` | text | URL da foto do prato |
| `created_at` | timestamp | Data de criação |

```typescript
await supabase.from('food_analysis').insert({
  user_id: userId,
  meal_type: 'lunch',
  analysis_text: 'Refeição balanceada...',
  health_score: 85,
  calories: 650,
});
```

---

## 🎯 Tabelas de Desafios

### `challenges`
> Definição dos desafios disponíveis

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID do desafio |
| `title` | text | Título do desafio |
| `description` | text | Descrição |
| `challenge_type` | text | Tipo do desafio |
| `difficulty` | text | Dificuldade |
| `points_reward` | integer | Pontos de recompensa |
| `xp_reward` | integer | XP de recompensa |
| `duration_days` | integer | Duração em dias |
| `is_active` | boolean | Se está ativo |
| `created_at` | timestamp | Data de criação |

⚠️ **NÃO EXISTE:** `category` (é `challenge_type`)

```typescript
const { data } = await supabase
  .from('challenges')
  .select('id, title, challenge_type, points_reward')
  .eq('is_active', true);
```

---

### `challenge_participations`
> Participação de usuários em desafios

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID da participação |
| `user_id` | uuid | ID do usuário |
| `challenge_id` | uuid | ID do desafio |
| `progress` | numeric | Progresso (0-100) |
| `is_completed` | boolean | Se foi completado |
| `completed` | boolean | Alias para is_completed |
| `points_earned` | integer | Pontos ganhos |
| `started_at` | timestamp | Data de início |
| `completed_at` | timestamp | Data de conclusão |

```typescript
const { data } = await supabase
  .from('challenge_participations')
  .select('*, challenges(*)')
  .eq('user_id', userId)
  .eq('is_completed', false);
```

---

## 📈 Tabelas de Tracking

### `advanced_daily_tracking`
> Tracking diário avançado de saúde

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID do registro |
| `user_id` | uuid | ID do usuário |
| `tracking_date` | date | Data do tracking |
| `energy_level` | integer | Nível de energia (1-10) |
| `stress_level` | integer | Nível de stress (1-10) |
| `sleep_quality` | integer | Qualidade do sono (1-10) |
| `sleep_hours` | numeric | Horas de sono |
| `water_ml` | integer | Água consumida em ml |
| `steps` | integer | Passos dados |
| `mood_rating` | integer | Humor (1-10) |
| `notes` | text | Observações |
| `created_at` | timestamp | Data de criação |

⚠️ **TABELA CORRETA:** `advanced_daily_tracking` (NÃO `daily_health_tracking`)

```typescript
const { data } = await supabase
  .from('advanced_daily_tracking')
  .select('*')
  .eq('user_id', userId)
  .order('tracking_date', { ascending: false })
  .limit(7);
```

---

## 🎯 Tabelas de Metas

### `user_goals`
> Metas do usuário

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID da meta |
| `user_id` | uuid | ID do usuário |
| `title` | text | Título da meta |
| `description` | text | Descrição |
| `target_date` | date | Data alvo |
| `status` | text | Status: 'pendente', 'aprovada', 'concluida' |
| `progress` | numeric | Progresso (0-100) |
| `created_at` | timestamp | Data de criação |

⚠️ **NÃO TEM JOIN com profiles** - fazer queries separadas

```typescript
// ERRADO
.select('*, profiles(*)') // Não existe relação!

// CORRETO
const { data: goals } = await supabase
  .from('user_goals')
  .select('*')
  .eq('user_id', userId);
```

---

## 💬 Tabelas de Chat/Sofia

### `chat_conversations`
> Conversas com a Sofia

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID da conversa |
| `user_id` | uuid | ID do usuário |
| `title` | text | Título da conversa |
| `personality` | text | Personalidade da Sofia |
| `messages` | jsonb | Array de mensagens |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Última atualização |

---

### `chat_messages`
> Mensagens individuais

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | ID da mensagem |
| `user_id` | uuid | ID do usuário |
| `content` | text | Conteúdo da mensagem |
| `role` | text | 'user' ou 'assistant' |
| `personality` | text | Personalidade usada |
| `tokens_used` | integer | Tokens consumidos |
| `created_at` | timestamp | Data de criação |

---

## 🔒 Funções RPC Importantes

### `is_admin_user()`
> Verifica se usuário atual é admin

```typescript
const { data: isAdmin } = await supabase.rpc('is_admin_user');
// Retorna: true | false
```

### `get_user_stats(user_id)`
> Retorna estatísticas do usuário

```typescript
const { data: stats } = await supabase.rpc('get_user_stats', {
  user_id: userId
});
```

---

## ⚠️ Mapeamento de Erros Comuns

| Você está buscando... | Coluna/Tabela correta |
|----------------------|----------------------|
| `profiles.role` | `user_roles.role` ou `rpc('is_admin_user')` |
| `profiles.height_cm` | `profiles.height` |
| `profiles.date_of_birth` | `profiles.birth_date` |
| `challenges.category` | `challenges.challenge_type` |
| `user_physical_data.peso_kg` | `user_physical_data.peso_atual_kg` |
| `daily_health_tracking` | `advanced_daily_tracking` |
| `user_goals.profiles` | Fazer query separada |

---

## 📝 Padrões de Query

### Select com relacionamento existente
```typescript
// Participações com dados do desafio
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

### Upsert (Insert ou Update)
```typescript
const { error } = await supabase
  .from('user_physical_data')
  .upsert({
    user_id: userId,
    altura_cm: 175,
    peso_atual_kg: 70,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id'
  });
```

### Insert com retorno
```typescript
const { data, error } = await supabase
  .from('weight_measurements')
  .insert({
    user_id: userId,
    weight_kg: 70.5,
    measurement_date: new Date().toISOString(),
  })
  .select()
  .single();
```

---

*Última atualização: Janeiro 2026*
*Baseado em: src/integrations/supabase/types.ts*
