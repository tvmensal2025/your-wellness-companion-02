# 🎮 Sistema de Gamificação

> Documentação gerada em: 2026-01-16
> Sistema: Pontos, XP, Níveis, Desafios, Ranking

---

## 📊 Visão Geral

| Componente | Descrição | Tabela Principal |
|------------|-----------|------------------|
| **Pontos** | Moeda principal | `user_points` |
| **XP** | Experiência para níveis | `user_points` |
| **Níveis** | 1-100 baseado em XP | Calculado |
| **Streak** | Dias consecutivos | `user_points` |
| **Desafios** | Metas temporárias | `challenges` |
| **Ranking** | Posição entre usuários | Calculado |
| **Conquistas** | Badges desbloqueáveis | `user_achievements_v2` |
| **Missões** | Tarefas diárias | `daily_mission_sessions` |

---

## 🏆 Sistema de Pontos

### Estrutura da Tabela

```sql
-- user_points
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  total_points INTEGER DEFAULT 0,
  xp_total INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
```

### Ações que Geram Pontos

| Ação | Pontos | XP | Descrição |
|------|--------|-----|-----------|
| Registrar refeição | 10 | 15 | Via Sofia ou manual |
| Foto de refeição | 15 | 20 | Com análise de IA |
| Completar meta diária | 20 | 30 | Qualquer meta |
| Exercício registrado | 15 | 25 | Treino completo |
| Beber água | 5 | 5 | Por registro |
| Check-in diário | 10 | 10 | Primeiro acesso do dia |
| Streak mantido | 5 × dias | 10 | Bônus por streak |
| Desafio completo | Variável | Variável | Definido no desafio |
| Conquista desbloqueada | 50-200 | 100-500 | Por raridade |

### Função de Adição de Pontos

```sql
-- add_user_points()
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_xp INTEGER,
  p_action TEXT
) RETURNS VOID AS $$
DECLARE
  v_new_level INTEGER;
  v_current_xp INTEGER;
BEGIN
  -- Atualizar pontos e XP
  UPDATE user_points
  SET 
    total_points = total_points + p_points,
    xp_total = xp_total + p_xp,
    weekly_points = weekly_points + p_points,
    monthly_points = monthly_points + p_points,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING xp_total INTO v_current_xp;
  
  -- Calcular novo nível
  v_new_level := calculate_level(v_current_xp);
  
  -- Atualizar nível se mudou
  UPDATE user_points
  SET level = v_new_level
  WHERE user_id = p_user_id AND level != v_new_level;
  
  -- Registrar log (opcional)
  INSERT INTO points_history (user_id, points, xp, action, created_at)
  VALUES (p_user_id, p_points, p_xp, p_action, now());
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 Sistema de XP e Níveis

### Fórmula de Nível

```typescript
// Fórmula: XP necessário para nível N
// xp_required = 100 * N^1.5

const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 260,
  4: 490,
  5: 790,
  10: 3162,
  20: 8944,
  50: 35355,
  100: 100000,
};

function calculateLevel(xpTotal: number): number {
  let level = 1;
  let xpRequired = 0;
  
  while (true) {
    xpRequired = Math.floor(100 * Math.pow(level + 1, 1.5));
    if (xpTotal < xpRequired) break;
    level++;
    if (level >= 100) break;
  }
  
  return level;
}

function xpToNextLevel(currentXP: number, currentLevel: number): number {
  const nextLevelXP = Math.floor(100 * Math.pow(currentLevel + 1, 1.5));
  return nextLevelXP - currentXP;
}

function levelProgress(currentXP: number, currentLevel: number): number {
  const currentLevelXP = Math.floor(100 * Math.pow(currentLevel, 1.5));
  const nextLevelXP = Math.floor(100 * Math.pow(currentLevel + 1, 1.5));
  const progress = (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
  return Math.min(Math.max(progress * 100, 0), 100);
}
```

### Função SQL de Cálculo

```sql
-- calculate_level()
CREATE OR REPLACE FUNCTION calculate_level(p_xp_total INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := 1;
  v_xp_required INTEGER;
BEGIN
  LOOP
    v_xp_required := FLOOR(100 * POWER(v_level + 1, 1.5));
    EXIT WHEN p_xp_total < v_xp_required OR v_level >= 100;
    v_level := v_level + 1;
  END LOOP;
  RETURN v_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## 🔥 Sistema de Streak

### Lógica de Streak

```
┌─────────────────────────────────────────────────────────────────┐
│                     STREAK LOGIC                                │
└─────────────────────────────────────────────────────────────────┘

Dia 1: Atividade → streak = 1
Dia 2: Atividade → streak = 2
Dia 3: Atividade → streak = 3
Dia 4: SEM atividade → streak = 0 (reset)
Dia 5: Atividade → streak = 1 (recomeça)

Regra: Streak mantém se atividade no dia OU no dia anterior
       Streak reseta se passar 1 dia completo sem atividade
```

### Função de Atualização

```sql
-- recalculate_user_streak()
CREATE OR REPLACE FUNCTION recalculate_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Buscar última atividade
  SELECT last_activity_date, current_streak
  INTO v_last_activity, v_current_streak
  FROM user_points
  WHERE user_id = p_user_id;
  
  -- Se nunca teve atividade
  IF v_last_activity IS NULL THEN
    UPDATE user_points
    SET current_streak = 1, last_activity_date = v_today
    WHERE user_id = p_user_id;
    RETURN;
  END IF;
  
  -- Se é o mesmo dia, não muda
  IF v_last_activity = v_today THEN
    RETURN;
  END IF;
  
  -- Se é o dia seguinte, incrementa
  IF v_last_activity = v_today - 1 THEN
    UPDATE user_points
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = v_today
    WHERE user_id = p_user_id;
    RETURN;
  END IF;
  
  -- Se passou mais de 1 dia, reseta
  UPDATE user_points
  SET current_streak = 1, last_activity_date = v_today
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

### Proteção de Streak

```typescript
// Usuário pode usar "protetor de streak" 1x por semana
interface StreakProtection {
  userId: string;
  protectionUsedAt: Date | null;
  canUseProtection: boolean; // true se não usou nos últimos 7 dias
}

async function useStreakProtection(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_points')
    .select('protection_used_at')
    .eq('user_id', userId)
    .single();
  
  const lastUsed = data?.protection_used_at;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  if (!lastUsed || new Date(lastUsed) < sevenDaysAgo) {
    await supabase
      .from('user_points')
      .update({ protection_used_at: new Date() })
      .eq('user_id', userId);
    return true;
  }
  
  return false;
}
```

---

## 🎯 Sistema de Desafios

### Estrutura

```sql
-- challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT, -- 'steps', 'calories', 'water', 'exercise', 'custom'
  target_value INTEGER,
  target_unit TEXT,
  xp_reward INTEGER DEFAULT 100,
  points_reward INTEGER DEFAULT 50,
  badge_reward TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  difficulty TEXT, -- 'easy', 'medium', 'hard', 'extreme'
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- challenge_participations
CREATE TABLE challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges,
  user_id UUID NOT NULL,
  progress INTEGER DEFAULT 0,
  target_value INTEGER,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  points_earned INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Tipos de Desafios

| Tipo | Exemplo | Tracking |
|------|---------|----------|
| `steps` | "10k passos/dia por 7 dias" | Google Fit |
| `calories` | "Manter 2000kcal por 5 dias" | food_history |
| `water` | "Beber 3L água por 7 dias" | health_diary |
| `exercise` | "Treinar 5x esta semana" | exercise_tracking |
| `weight` | "Perder 2kg em 30 dias" | Pesagens |
| `streak` | "Manter streak de 14 dias" | user_points |
| `custom` | Definido pelo admin | Manual |

### Função de Atualização de Progresso

```sql
-- update_challenge_progress()
CREATE OR REPLACE FUNCTION update_challenge_progress(
  p_user_id UUID,
  p_challenge_id UUID,
  p_increment INTEGER
) RETURNS VOID AS $$
DECLARE
  v_participation RECORD;
BEGIN
  -- Buscar participação
  SELECT * INTO v_participation
  FROM challenge_participations
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
  
  -- Se não existe, criar
  IF v_participation IS NULL THEN
    INSERT INTO challenge_participations (user_id, challenge_id, progress)
    VALUES (p_user_id, p_challenge_id, p_increment);
    RETURN;
  END IF;
  
  -- Se já completou, ignorar
  IF v_participation.is_completed THEN
    RETURN;
  END IF;
  
  -- Atualizar progresso
  UPDATE challenge_participations
  SET 
    progress = progress + p_increment,
    updated_at = now()
  WHERE id = v_participation.id;
  
  -- Verificar se completou
  IF (v_participation.progress + p_increment) >= v_participation.target_value THEN
    -- Marcar como completo e dar recompensa
    UPDATE challenge_participations
    SET 
      is_completed = true,
      completed_at = now(),
      points_earned = (SELECT points_reward FROM challenges WHERE id = p_challenge_id)
    WHERE id = v_participation.id;
    
    -- Adicionar pontos e XP ao usuário
    PERFORM add_user_points(
      p_user_id,
      (SELECT points_reward FROM challenges WHERE id = p_challenge_id),
      (SELECT xp_reward FROM challenges WHERE id = p_challenge_id),
      'challenge_completed'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 🏅 Sistema de Ranking

### Ligas

```
┌─────────────────────────────────────────────────────────────────┐
│                       LIGAS                                     │
└─────────────────────────────────────────────────────────────────┘

💎 DIAMANTE  │ Top 1%    │ 10.000+ pontos semanais
🥇 OURO      │ Top 5%    │ 5.000+ pontos semanais  
🥈 PRATA     │ Top 20%   │ 2.000+ pontos semanais
🥉 BRONZE    │ Demais    │ < 2.000 pontos semanais

Promoção/Rebaixamento: Semanal (domingo 23:59)
- Top 10% da liga: Promovido
- Bottom 10% da liga: Rebaixado
```

### Cálculo de Ranking

```sql
-- Ranking global por pontos semanais
SELECT 
  p.user_id,
  pr.full_name,
  pr.avatar_url,
  p.weekly_points,
  p.level,
  p.current_streak,
  ROW_NUMBER() OVER (ORDER BY p.weekly_points DESC) as position
FROM user_points p
JOIN profiles pr ON p.user_id = pr.user_id
ORDER BY p.weekly_points DESC
LIMIT 100;

-- Ranking por liga
WITH league_users AS (
  SELECT 
    user_id,
    weekly_points,
    CASE 
      WHEN weekly_points >= 10000 THEN 'diamond'
      WHEN weekly_points >= 5000 THEN 'gold'
      WHEN weekly_points >= 2000 THEN 'silver'
      ELSE 'bronze'
    END as league
  FROM user_points
)
SELECT 
  lu.*,
  ROW_NUMBER() OVER (PARTITION BY league ORDER BY weekly_points DESC) as league_position
FROM league_users lu;
```

### Promoções Semanais

```sql
-- process_league_promotions()
CREATE OR REPLACE FUNCTION process_league_promotions()
RETURNS VOID AS $$
BEGIN
  -- Resetar pontos semanais
  UPDATE user_points SET weekly_points = 0;
  
  -- Registrar histórico de liga
  INSERT INTO league_history (user_id, league, position, week_end)
  SELECT 
    user_id, 
    current_league,
    league_position,
    CURRENT_DATE
  FROM user_league_positions;
  
  -- Notificar promoções/rebaixamentos
  -- (implementado via Edge Function)
END;
$$ LANGUAGE plpgsql;
```

---

## 🏆 Sistema de Conquistas

### Estrutura

```sql
-- user_achievements_v2
CREATE TABLE user_achievements_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT,
  achievement_description TEXT,
  achievement_icon TEXT,
  category TEXT, -- 'nutrition', 'exercise', 'consistency', 'social', 'special'
  rarity TEXT, -- 'common', 'rare', 'epic', 'legendary'
  xp_reward INTEGER DEFAULT 100,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
```

### Conquistas Disponíveis

| ID | Nome | Categoria | Raridade | XP | Condição |
|----|------|-----------|----------|-----|----------|
| `first_meal` | Primeira Refeição | nutrition | common | 50 | Registrar 1ª refeição |
| `week_streak` | Semana de Ouro | consistency | rare | 200 | 7 dias de streak |
| `month_streak` | Mês Invicto | consistency | epic | 500 | 30 dias de streak |
| `century_streak` | Centenário | consistency | legendary | 1000 | 100 dias de streak |
| `photo_master` | Fotógrafo | nutrition | rare | 150 | 50 fotos analisadas |
| `hydration_hero` | Hidratado | nutrition | common | 100 | Meta água 7 dias |
| `gym_rat` | Rato de Academia | exercise | rare | 200 | 50 treinos |
| `social_butterfly` | Sociável | social | rare | 150 | 10 posts no feed |
| `challenge_master` | Mestre dos Desafios | special | epic | 500 | Completar 10 desafios |
| `top_10` | Elite | special | legendary | 1000 | Top 10 global |

### Verificação de Conquistas

```typescript
// Hook para verificar conquistas
async function checkAchievements(userId: string, action: string) {
  const achievements = await getAvailableAchievements(userId);
  
  for (const achievement of achievements) {
    if (await meetsCondition(userId, achievement)) {
      await unlockAchievement(userId, achievement);
      
      // Notificar usuário
      toast.success(`🏆 Conquista desbloqueada: ${achievement.name}`);
      
      // Adicionar XP
      await addXP(userId, achievement.xpReward, 'achievement');
    }
  }
}
```

---

## 📋 Missões Diárias

### Estrutura

```sql
-- daily_mission_sessions
CREATE TABLE daily_mission_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_date DATE NOT NULL,
  missions_completed INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  completed_sections JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_date)
);
```

### Missões do Dia

Geradas dinamicamente baseadas no perfil:

| Tipo | Exemplo | Pontos | Frequência |
|------|---------|--------|------------|
| Nutrição | "Registre café da manhã" | 10 | Diária |
| Água | "Beba 8 copos de água" | 10 | Diária |
| Exercício | "Faça 30min de atividade" | 15 | 3x/semana |
| Check-in | "Faça check-in no app" | 5 | Diária |
| Social | "Curta um post" | 5 | Diária |
| Especial | "Complete todas as missões" | 20 | Diária |

### Reset Diário

```sql
-- Trigger para reset às 00:00
CREATE OR REPLACE FUNCTION reset_daily_missions()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar nova sessão para o dia
  INSERT INTO daily_mission_sessions (user_id, session_date)
  SELECT DISTINCT user_id, CURRENT_DATE
  FROM daily_mission_sessions
  ON CONFLICT DO NOTHING;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Hooks de Gamificação

### useGamificationUnified

```typescript
// src/hooks/useGamificationUnified.ts
interface UseGamificationUnifiedReturn {
  // Dados
  points: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  weeklyPoints: number;
  
  // Progresso
  xpToNextLevel: number;
  levelProgress: number;
  
  // Ranking
  position: number;
  league: LeagueType;
  
  // Status
  isLoading: boolean;
  error: Error | null;
  
  // Ações
  addPoints: (amount: number, action: string) => Promise<void>;
  addXP: (amount: number, source: string) => Promise<void>;
  checkAchievements: () => Promise<void>;
  
  // Refetch
  refetch: () => void;
}

// Uso
const { 
  points, 
  level, 
  currentStreak,
  addPoints,
  levelProgress 
} = useGamificationUnified();
```

---

## 📝 Próximos Passos

- Consulte `03_COMPONENTS_CATALOG.md` para componentes visuais
- Consulte `04_HOOKS_REFERENCE.md` para hooks relacionados
- Consulte `02_DATABASE_SCHEMA.md` para tabelas completas
