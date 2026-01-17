# 🎯 Sistema de Pontuação - MaxNutrition

## 📊 Visão Geral

O sistema de pontuação da plataforma MaxNutrition é composto por múltiplas tabelas e mecanismos que trabalham juntos para gamificar a experiência do usuário.

---

## 🗄️ Estrutura do Banco de Dados

### 1. `user_points` - Pontos Principais do Usuário

Tabela central que armazena os pontos acumulados de cada usuário.

```sql
CREATE TABLE user_points (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0,        -- Total acumulado
  daily_points INTEGER DEFAULT 0,        -- Pontos do dia
  weekly_points INTEGER DEFAULT 0,       -- Pontos da semana
  monthly_points INTEGER DEFAULT 0,      -- Pontos do mês
  current_streak INTEGER DEFAULT 0,      -- Sequência atual
  best_streak INTEGER DEFAULT 0,         -- Melhor sequência
  last_activity_date DATE,               -- Última atividade
  level INTEGER DEFAULT 1,               -- Nível calculado
  completed_challenges INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Cálculo de Nível:**
- Nível = `floor(total_points / 1000) + 1`
- Cada 1000 pontos = 1 nível
- XP no nível atual = `total_points % 1000`
- XP para próximo nível = `1000 - (total_points % 1000)`

---

### 2. `points_configuration` - Configuração de Ações

Define quanto cada ação vale em pontos.

```sql
CREATE TABLE points_configuration (
  id UUID PRIMARY KEY,
  action_type VARCHAR(50) UNIQUE NOT NULL,  -- ID único da ação
  action_name VARCHAR(100) NOT NULL,        -- Nome amigável
  points INTEGER DEFAULT 10,                -- Pontos base
  description TEXT,                         -- Descrição
  icon VARCHAR(20),                         -- Emoji/ícone
  is_active BOOLEAN DEFAULT true,           -- Ativo/inativo
  category VARCHAR(50),                     -- Categoria
  multiplier NUMERIC DEFAULT 1.0,           -- Multiplicador
  max_daily INTEGER,                        -- Limite diário (NULL = ilimitado)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Categorias:**
- `missao` - Missões e sessões diárias
- `social` - Interações sociais (curtir, comentar, compartilhar)
- `interacao` - Registros e uploads (peso, fotos)
- `desafio` - Desafios e metas
- `bonus` - Bônus especiais (streaks, primeiro acesso)

**Ações Padrão:**

| action_type | action_name | points | category | max_daily |
|-------------|-------------|--------|----------|-----------|
| `daily_session` | Sessão Diária | 50 | missao | 1 |
| `mission_complete` | Missão do Dia | 30 | missao | 3 |
| `comment` | Comentar Post | 5 | social | 10 |
| `like` | Curtir Post | 2 | social | 20 |
| `photo_upload` | Enviar Foto | 15 | interacao | 5 |
| `weight_log` | Registrar Peso | 20 | interacao | 1 |
| `goal_complete` | Concluir Meta | 100 | desafio | NULL |
| `challenge_join` | Participar Desafio | 10 | desafio | 3 |
| `challenge_complete` | Completar Desafio | 200 | desafio | NULL |
| `streak_bonus_7` | Bônus 7 dias | 50 | bonus | NULL |
| `streak_bonus_30` | Bônus 30 dias | 200 | bonus | NULL |
| `first_login` | Primeiro Acesso | 100 | bonus | NULL |
| `profile_complete` | Perfil Completo | 50 | bonus | NULL |
| `referral` | Indicar Amigo | 100 | social | NULL |
| `share_post` | Compartilhar | 10 | social | 5 |

**Pontos Finais = `points * multiplier`**

---

### 3. `exercise_points_history` - Histórico de Exercícios

Pontos específicos do sistema de exercícios.

```sql
CREATE TABLE exercise_points_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  points_earned INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  source_type VARCHAR(50),  -- 'workout', 'achievement', 'streak'
  source_id UUID,           -- ID do treino/conquista
  created_at TIMESTAMPTZ
);
```

---

### 4. `challenges` - Desafios

Desafios que concedem pontos ao serem completados.

```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50),
  difficulty VARCHAR(20),
  duration_days INTEGER,
  target_value NUMERIC,
  target_unit VARCHAR(50),
  points_reward INTEGER DEFAULT 0,  -- Pontos ao completar
  xp_reward INTEGER DEFAULT 0,      -- XP ao completar
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  start_date DATE,
  end_date DATE
);
```

---

### 5. `challenge_participations` - Participações em Desafios

```sql
CREATE TABLE challenge_participations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

---

### 6. `health_streaks` - Sistema Dr. Vital

Sistema de streaks e XP do Dr. Vital.

```sql
CREATE TABLE health_streaks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  total_xp_earned INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ
);
```

---

### 7. `user_goals` - Metas com XP

```sql
CREATE TABLE user_goals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  target_date DATE,
  status VARCHAR(50),
  progress INTEGER DEFAULT 0,
  estimated_points INTEGER,
  xp_earned INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1
);
```

---

## 🎮 Hooks de Gamificação

### `useUserPoints()`
Gerencia pontos básicos do usuário.

```typescript
const { userPoints, loading, updateUserPoints, fetchUserPoints } = useUserPoints();

// userPoints: { total_points, current_streak, level, experience }
```

### `useUserXP()`
Sistema de XP e níveis com títulos.

```typescript
const { 
  currentXP,      // XP no nível atual
  totalXP,        // XP total acumulado
  level,          // Nível atual
  xpToNextLevel,  // XP faltando para próximo nível
  xpProgress,     // Progresso em % (0-100)
  levelTitle,     // Título do nível (ex: "Guerreiro")
  loading,
  addXP,          // Função para adicionar XP
  xpGained,       // XP ganho recentemente (animação)
  refetch
} = useUserXP();

// Adicionar XP
await addXP(50, 'Completou missão diária');
```

**Títulos de Nível (com suporte a gênero):**

| Nível | Masculino | Feminino |
|-------|-----------|----------|
| 1 | Iniciante | Iniciante |
| 2 | Explorador | Exploradora |
| 3 | Dedicado | Dedicada |
| 4 | Comprometido | Comprometida |
| 5 | Focado | Focada |
| 6 | Guerreiro | Guerreira |
| 7 | Mestre | Mestra |
| 8 | Campeão | Campeã |
| 9 | Lenda | Lenda |
| 10+ | Imortal | Imortal |

### `usePointsConfig()`
Gerencia configurações de pontos (admin).

```typescript
const {
  configs,              // Array de configurações
  isLoading,
  updateConfig,         // Atualizar uma config
  bulkUpdate,          // Atualizar múltiplas
  isSaving,
  getPoints,           // Obter pontos de uma ação
  getConfig,           // Obter config de uma ação
  getByCategory        // Filtrar por categoria
} = usePointsConfig();

// Atualizar pontos de uma ação
updateConfig({ 
  id: 'config-id', 
  points: 100, 
  multiplier: 1.5 
});

// Obter pontos de uma ação
const points = getPoints('daily_session'); // 50
```

### `useGamification()`
Sistema completo de gamificação (legado, sendo substituído).

```typescript
const {
  gamificationData: {
    currentLevel,
    currentXP,
    xpToNextLevel,
    totalXP,
    currentStreak,
    bestStreak,
    badges,
    dailyChallenges,
    achievements,
    rank
  },
  isLoading,
  addXP,
  completeChallenge
} = useGamification();
```

---

## 🔧 Como Adicionar Pontos

### 1. Via Trigger Automático (Recomendado)

Criar trigger que adiciona pontos automaticamente:

```sql
CREATE OR REPLACE FUNCTION add_points_on_action()
RETURNS TRIGGER AS $$
DECLARE
  v_points INTEGER;
  v_config RECORD;
BEGIN
  -- Buscar configuração
  SELECT * INTO v_config 
  FROM points_configuration 
  WHERE action_type = 'action_name' 
  AND is_active = true;
  
  IF FOUND THEN
    v_points := v_config.points * v_config.multiplier;
    
    -- Adicionar pontos
    INSERT INTO user_points (user_id, total_points, daily_points)
    VALUES (NEW.user_id, v_points, v_points)
    ON CONFLICT (user_id) DO UPDATE SET
      total_points = user_points.total_points + v_points,
      daily_points = user_points.daily_points + v_points,
      level = calculate_level(user_points.total_points + v_points),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. Via Hook no Frontend

```typescript
import { useUserXP } from '@/hooks/useUserXP';

const { addXP } = useUserXP();

// Ao completar uma ação
const handleComplete = async () => {
  // ... lógica da ação
  
  await addXP(50, 'Completou sessão diária');
};
```

### 3. Via Edge Function

```typescript
// supabase/functions/add-points/index.ts
const { data: config } = await supabase
  .from('points_configuration')
  .select('points, multiplier')
  .eq('action_type', 'daily_session')
  .single();

const points = config.points * config.multiplier;

await supabase
  .from('user_points')
  .update({
    total_points: supabase.raw(`total_points + ${points}`),
    daily_points: supabase.raw(`daily_points + ${points}`)
  })
  .eq('user_id', userId);
```

---

## 🎨 Painel Admin

### Componentes

1. **`XPConfigPanel`** - Painel principal com tabs
   - Tab "Configuração" → `PointsConfigPanel`
   - Tab "Estatísticas" → Estatísticas e ranking

2. **`PointsConfigPanel`** - Gerenciamento de pontos
   - Tabs por categoria (Missões, Social, Interação, Desafios, Bônus)
   - Edição inline de pontos, multiplicador, limite diário
   - Ativar/desativar ações
   - Salvar individual ou em lote
   - Resumo por categoria

### Funcionalidades

- ✅ Editar pontos de cada ação
- ✅ Definir multiplicadores
- ✅ Configurar limites diários
- ✅ Ativar/desativar ações
- ✅ Ver estatísticas gerais
- ✅ Top 10 usuários
- ✅ Distribuição de níveis
- ✅ Usuários ativos

---

## 📈 Fluxo de Pontos

```
Usuário realiza ação
    ↓
Sistema verifica points_configuration
    ↓
Calcula: points * multiplier
    ↓
Verifica max_daily (se aplicável)
    ↓
Adiciona em user_points
    ↓
Recalcula level
    ↓
Atualiza streak (se aplicável)
    ↓
Notifica usuário (toast/animação)
```

---

## 🔐 Políticas RLS

### `user_points`
```sql
-- Todos podem ver (necessário para ranking)
CREATE POLICY "Everyone can view all points for ranking"
  ON user_points FOR SELECT
  TO authenticated
  USING (true);

-- Apenas próprio usuário pode inserir/atualizar
CREATE POLICY "Users can insert their own points"
  ON user_points FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON user_points FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
```

### `points_configuration`
```sql
-- Todos podem ler
CREATE POLICY "Anyone can read points configuration"
  ON points_configuration FOR SELECT
  USING (true);

-- Apenas admins podem modificar
CREATE POLICY "Only admins can modify points configuration"
  ON points_configuration FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

## 🎯 Boas Práticas

1. **Sempre usar `points_configuration`** - Não hardcodar valores de pontos
2. **Respeitar `max_daily`** - Verificar limite antes de adicionar
3. **Usar multiplicadores** - Para eventos especiais (ex: 2x pontos no fim de semana)
4. **Invalidar cache** - Após adicionar pontos, invalidar queries do React Query
5. **Notificar usuário** - Sempre mostrar feedback visual ao ganhar pontos
6. **Calcular nível automaticamente** - Usar função `calculate_level()`
7. **Registrar histórico** - Manter log de onde vieram os pontos

---

## 🚀 Próximas Melhorias

- [ ] Sistema de badges/conquistas
- [ ] Recompensas por nível
- [ ] Loja de pontos (trocar por benefícios)
- [ ] Eventos temporários com multiplicadores
- [ ] Desafios em equipe
- [ ] Ranking por período (semanal, mensal)
- [ ] Notificações push ao ganhar pontos
- [ ] Histórico detalhado de pontos
- [ ] Gráficos de evolução
- [ ] Comparação com amigos

---

*Última atualização: Janeiro 2026*
