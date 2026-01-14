# 🎮 AUDITORIA COMPLETA - SISTEMA DE PONTOS / XP / RECOMPENSAS

**Data:** Janeiro 2026  
**Arquiteto:** Análise Automatizada  
**Escopo:** Sistema completo de gamificação MaxNutrition

---

## 📋 SUMÁRIO EXECUTIVO

O sistema atual possui **MÚLTIPLOS sistemas de gamificação paralelos** que operam de forma **FRAGMENTADA**:

1. **Sistema Geral** (`user_points`) - Pontos gerais do app
2. **Sistema de Exercícios** (`exercise_gamification_points`) - Pontos específicos de treino
3. **Sistema Dr. Vital** (`health_streaks`) - XP de saúde
4. **Sistema de Desafios** (`challenges` + `challenge_participations`) - Pontos de desafios
5. **Sistema Cardio** (`cardio_points_history`) - Pontos de atividade cardio

### ⚠️ PROBLEMAS CRÍTICOS IDENTIFICADOS

| Problema | Severidade | Impacto |
|----------|------------|---------|
| Valores hardcoded em múltiplos arquivos | 🔴 CRÍTICO | Impossível ajustar sem deploy |
| Sistemas paralelos não integrados | 🔴 CRÍTICO | Usuário tem "múltiplos XPs" |
| Tabela `points_configuration` existe mas NÃO É USADA | 🟡 MÉDIO | Configuração ignorada |
| Sem limite diário anti-exploit | 🔴 CRÍTICO | Farming infinito possível |
| Hooks duplicados (5+ versões) | 🟡 MÉDIO | Manutenção difícil |

---

## 1️⃣ LISTA COMPLETA DE AÇÕES QUE GERAM PONTOS/XP

### 📊 SISTEMA GERAL (user_points)

| # | Ação | Valor XP | Status | Arquivo |
|---|------|----------|--------|---------|
| 1 | Sessão Diária | 50 | ⚠️ Parcial (tabela existe, não usada) | `points_configuration` |
| 2 | Missão do Dia | 30 | ⚠️ Parcial | `points_configuration` |
| 3 | Comentar Post | 5 | ⚠️ Parcial | `points_configuration` |
| 4 | Curtir Post | 2 | ⚠️ Parcial | `points_configuration` |
| 5 | Enviar Foto | 15 | ⚠️ Parcial | `points_configuration` |
| 6 | Registrar Peso | 20 | ⚠️ Parcial | `points_configuration` |
| 7 | Concluir Meta | 100 | ⚠️ Parcial | `points_configuration` |
| 8 | Participar Desafio | 10 | ⚠️ Parcial | `points_configuration` |
| 9 | Completar Desafio | 200 | ⚠️ Parcial | `points_configuration` |
| 10 | Bônus 7 dias streak | 50 | ⚠️ Parcial | `points_configuration` |
| 11 | Bônus 30 dias streak | 200 | ⚠️ Parcial | `points_configuration` |
| 12 | Primeiro Acesso | 100 | ⚠️ Parcial | `points_configuration` |
| 13 | Perfil Completo | 50 | ⚠️ Parcial | `points_configuration` |
| 14 | Indicar Amigo | 100 | ⚠️ Parcial | `points_configuration` |
| 15 | Compartilhar | 10 | ⚠️ Parcial | `points_configuration` |

### 🏋️ SISTEMA DE EXERCÍCIOS (exercise_gamification_points)

| # | Ação | Valor XP | Status | Arquivo |
|---|------|----------|--------|---------|
| 16 | Base por exercício | 10 pts | ❌ HARDCODED | `gamificationService.ts:44` |
| 17 | Base por minuto | 1 pt | ❌ HARDCODED | `gamificationService.ts:45` |
| 18 | Bônus dificuldade alta (≥7) | +20 pts | ❌ HARDCODED | `gamificationService.ts:47` |
| 19 | Bônus dificuldade média (≥5) | +10 pts | ❌ HARDCODED | `gamificationService.ts:48` |
| 20 | Recorde pessoal | +50 pts | ❌ HARDCODED | `gamificationService.ts:51` |
| 21 | Multiplicador streak 3 dias | x1.1 | ❌ HARDCODED | `gamificationService.ts:53` |
| 22 | Multiplicador streak 7 dias | x1.25 | ❌ HARDCODED | `gamificationService.ts:54` |
| 23 | Multiplicador streak 14 dias | x1.5 | ❌ HARDCODED | `gamificationService.ts:55` |
| 24 | Multiplicador streak 30 dias | x2.0 | ❌ HARDCODED | `gamificationService.ts:56` |
| 25 | XP base por treino | 25 XP | ❌ HARDCODED | `gamificationService.ts:60` |
| 26 | Completar desafio exercício | Variável (BD) | ✅ Configurável | `exercise_challenges.points_reward` |

### 🏥 SISTEMA DR. VITAL (health_streaks)

| # | Ação | Valor XP | Status | Arquivo |
|---|------|----------|--------|---------|
| 27 | Beber 2L água | 50 XP | ❌ HARDCODED | `dr-vital/gamificationService.ts:28` |
| 28 | Registrar 3 refeições | 75 XP | ❌ HARDCODED | `dr-vital/gamificationService.ts:29` |
| 29 | 30 min exercício | 100 XP | ❌ HARDCODED | `dr-vital/gamificationService.ts:30` |
| 30 | Dormir 7+ horas | 75 XP | ❌ HARDCODED | `dr-vital/gamificationService.ts:31` |
| 31 | Meditar 10 min | 50 XP | ❌ HARDCODED | `dr-vital/gamificationService.ts:32` |
| 32 | Caminhar 5000 passos | 60 XP | ❌ HARDCODED | `dr-vital/gamificationService.ts:33` |
| 33 | Comer uma fruta | 30 XP | ❌ HARDCODED | `dr-vital/gamificationService.ts:34` |
| 34 | Evitar açúcar | 80 XP | ❌ HARDCODED | `dr-vital/gamificationService.ts:35` |
| 35 | Boss Battle (normal) | 500 XP | ❌ HARDCODED | `bossBattleService.ts:15` |
| 36 | Boss Battle (crítico) | 1000 XP | ❌ HARDCODED | `bossBattleService.ts:16` |
| 37 | Bônus streak 7+ dias | streak × 10 | ❌ HARDCODED | `dr-vital/gamificationService.ts:22` |

### 🎯 SISTEMA DE DESAFIOS (challenges)

| # | Ação | Valor XP | Status | Arquivo |
|---|------|----------|--------|---------|
| 38 | Completar desafio | `points_reward` | ✅ Configurável | `challenges.points_reward` |
| 39 | Fallback desafio | 50 pts | ❌ HARDCODED | `useGamificationUnified.ts:142` |
| 40 | Atualizar progresso | 10 pts | ❌ HARDCODED | `useRealGamification.ts:157` |

### 💓 SISTEMA CARDIO (cardio_points_history)

| # | Ação | Valor XP | Status | Arquivo |
|---|------|----------|--------|---------|
| 41 | Zona Fat Burn (<70% FC) | 1 pt/min | ❌ HARDCODED | `pointsCalculator.ts` |
| 42 | Zona Cardio (70-85% FC) | 2 pts/min | ❌ HARDCODED | `pointsCalculator.ts` |
| 43 | Zona Peak (85%+ FC) | 3 pts/min | ❌ HARDCODED | `pointsCalculator.ts` |

### 📅 MISSÕES DIÁRIAS (daily_mission_sessions)

| # | Ação | Valor XP | Status | Arquivo |
|---|------|----------|--------|---------|
| 44 | Responder pergunta | `question.points` | ✅ Configurável | `daily-questions-light.ts` |
| 45 | Completar check-in | Soma das perguntas | ✅ Configurável | `DailyMissionsLight.tsx` |

---

## 2️⃣ DIAGNÓSTICO: CONFIGURÁVEL VS HARDCODED

### 📊 RESUMO DO DIAGNÓSTICO

| Status | Quantidade | Percentual |
|--------|------------|------------|
| ❌ HARDCODED | 28 ações | 62% |
| ⚠️ PARCIAL (tabela existe, não usada) | 15 ações | 33% |
| ✅ CONFIGURÁVEL | 2 ações | 5% |

### 🔴 ARQUIVOS COM VALORES HARDCODED

```
src/services/exercise/gamificationService.ts
├── POINTS_CONFIG.basePerExercise = 10
├── POINTS_CONFIG.basePerMinute = 1
├── POINTS_CONFIG.difficultyBonus.high = 20
├── POINTS_CONFIG.difficultyBonus.medium = 10
├── POINTS_CONFIG.personalRecordBonus = 50
├── POINTS_CONFIG.streakMultipliers = {3: 1.1, 7: 1.25, 14: 1.5, 30: 2.0}
├── XP_CONFIG.basePerWorkout = 25
└── XP_CONFIG.perLevel = 100

src/services/dr-vital/gamificationService.ts
├── XP_PER_LEVEL_BASE = 100
├── STREAK_BONUS_THRESHOLD = 7
├── STREAK_BONUS_MULTIPLIER = 10
└── DAILY_MISSION_TEMPLATES[].xpReward = [50, 75, 100, 75, 50, 60, 30, 80]

src/services/dr-vital/bossBattleService.ts
├── BOSS_BATTLE_XP_REWARD = 500
└── BOSS_BATTLE_BONUS_MULTIPLIER = 2

src/hooks/useGamificationUnified.ts
└── Fallback xp_reward = 50 (linha 142, 274, 283, 369, 381)

src/hooks/useRealGamification.ts
└── points_earned = 10 (linha 157)

src/services/api/gamificationService.ts
├── LEVEL_THRESHOLDS_MASC = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]
└── LEVEL_THRESHOLDS_FEM = [mesmos valores]
```

### ⚠️ TABELA `points_configuration` - NÃO UTILIZADA

A tabela existe no banco com 15 configurações, mas **NENHUM código a consulta**:

```sql
-- Tabela existe mas não é usada!
SELECT * FROM points_configuration;
-- Retorna 15 registros configuráveis
-- MAS o código usa valores hardcoded
```

---

## 3️⃣ PROPOSTA: MODELO PADRÃO DE CONFIGURAÇÃO

### 📐 ESTRUTURA DE DADOS PROPOSTA

```sql
-- Tabela centralizada de configuração de XP
CREATE TABLE xp_actions_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  action_key VARCHAR(50) UNIQUE NOT NULL,
  action_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(30) NOT NULL, -- 'exercise', 'health', 'social', 'challenge', 'bonus'
  
  -- Valores de recompensa
  base_xp INTEGER NOT NULL DEFAULT 10,
  base_points INTEGER NOT NULL DEFAULT 10,
  
  -- Multiplicadores
  difficulty_multiplier JSONB DEFAULT '{"easy": 0.8, "medium": 1.0, "hard": 1.5}',
  streak_multipliers JSONB DEFAULT '{"3": 1.1, "7": 1.25, "14": 1.5, "30": 2.0}',
  
  -- Limites anti-exploit
  max_daily_count INTEGER, -- NULL = ilimitado
  max_daily_xp INTEGER,    -- NULL = ilimitado
  cooldown_minutes INTEGER DEFAULT 0,
  
  -- Controle
  is_active BOOLEAN DEFAULT true,
  requires_verification BOOLEAN DEFAULT false,
  
  -- Metadados
  icon VARCHAR(20),
  color VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_xp_actions_category ON xp_actions_config(category);
CREATE INDEX idx_xp_actions_active ON xp_actions_config(is_active);

-- RLS
ALTER TABLE xp_actions_config ENABLE ROW LEVEL SECURITY;

-- Todos podem ler
CREATE POLICY "Anyone can read xp config"
ON xp_actions_config FOR SELECT USING (true);

-- Apenas admins podem modificar
CREATE POLICY "Only admins can modify xp config"
ON xp_actions_config FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));
```

### 📋 DADOS INICIAIS RECOMENDADOS

```sql
INSERT INTO xp_actions_config (action_key, action_name, category, base_xp, base_points, max_daily_count, icon) VALUES
-- Exercícios
('workout_complete', 'Completar Treino', 'exercise', 25, 50, 3, '🏋️'),
('exercise_complete', 'Completar Exercício', 'exercise', 10, 10, 50, '💪'),
('personal_record', 'Recorde Pessoal', 'exercise', 50, 100, 10, '🏆'),
('workout_minute', 'Minuto de Treino', 'exercise', 1, 1, 120, '⏱️'),

-- Saúde (Dr. Vital)
('water_goal', 'Meta de Água', 'health', 50, 30, 1, '💧'),
('meal_logged', 'Refeição Registrada', 'health', 25, 15, 5, '🍽️'),
('sleep_goal', 'Meta de Sono', 'health', 75, 40, 1, '😴'),
('steps_goal', 'Meta de Passos', 'health', 60, 35, 1, '👟'),
('boss_battle_win', 'Derrotar Boss', 'health', 500, 300, NULL, '🐉'),

-- Social
('post_comment', 'Comentar Post', 'social', 5, 5, 10, '💬'),
('post_like', 'Curtir Post', 'social', 2, 2, 20, '❤️'),
('share_progress', 'Compartilhar Progresso', 'social', 10, 10, 5, '📤'),
('referral', 'Indicar Amigo', 'social', 100, 100, NULL, '🤝'),

-- Desafios
('challenge_join', 'Entrar em Desafio', 'challenge', 10, 10, 3, '🚀'),
('challenge_complete', 'Completar Desafio', 'challenge', 200, 200, NULL, '🥇'),
('duel_win', 'Vencer Duelo', 'challenge', 150, 150, 5, '⚔️'),

-- Bônus
('streak_7', 'Sequência 7 Dias', 'bonus', 50, 50, NULL, '🔥'),
('streak_30', 'Sequência 30 Dias', 'bonus', 200, 200, NULL, '⭐'),
('first_login', 'Primeiro Acesso', 'bonus', 100, 100, NULL, '👋'),
('profile_complete', 'Perfil Completo', 'bonus', 50, 50, NULL, '✅'),

-- Missões Diárias
('daily_checkin', 'Check-in Diário', 'daily', 30, 30, 1, '📅'),
('daily_mission', 'Missão Diária', 'daily', 50, 50, 3, '🎯');
```

---

## 4️⃣ PAINEL ADMIN - REQUISITOS

### 🎛️ CAMPOS DO PAINEL

| Campo | Tipo | Editável | Validação |
|-------|------|----------|-----------|
| `action_key` | text | ❌ Não | Único, snake_case |
| `action_name` | text | ✅ Sim | 3-100 caracteres |
| `description` | textarea | ✅ Sim | Máx 500 caracteres |
| `category` | select | ✅ Sim | Lista fixa |
| `base_xp` | number | ✅ Sim | 0-10000, inteiro |
| `base_points` | number | ✅ Sim | 0-10000, inteiro |
| `max_daily_count` | number | ✅ Sim | NULL ou 1-1000 |
| `max_daily_xp` | number | ✅ Sim | NULL ou 1-100000 |
| `cooldown_minutes` | number | ✅ Sim | 0-1440 |
| `is_active` | toggle | ✅ Sim | boolean |
| `icon` | emoji picker | ✅ Sim | 1 emoji |
| `sort_order` | number | ✅ Sim | 0-999 |

### 🔒 CAMPOS PROTEGIDOS (Somente Leitura)

| Campo | Motivo |
|-------|--------|
| `id` | Identificador único |
| `action_key` | Referenciado no código |
| `created_at` | Auditoria |
| `updated_at` | Auditoria |
| `updated_by` | Auditoria |

### ✅ VALIDAÇÕES OBRIGATÓRIAS

```typescript
const validations = {
  base_xp: {
    min: 0,
    max: 10000,
    message: 'XP deve ser entre 0 e 10.000'
  },
  base_points: {
    min: 0,
    max: 10000,
    message: 'Pontos devem ser entre 0 e 10.000'
  },
  max_daily_count: {
    min: 1,
    max: 1000,
    nullable: true,
    message: 'Limite diário deve ser entre 1 e 1.000 (ou vazio para ilimitado)'
  },
  cooldown_minutes: {
    min: 0,
    max: 1440, // 24 horas
    message: 'Cooldown deve ser entre 0 e 1440 minutos'
  }
};
```

### 📊 FUNCIONALIDADES DO PAINEL

1. **Listagem com filtros**
   - Por categoria
   - Por status (ativo/inativo)
   - Busca por nome

2. **Edição inline**
   - Campos numéricos editáveis diretamente
   - Toggle para ativar/desativar

3. **Histórico de alterações**
   - Log de quem alterou
   - Quando alterou
   - Valor anterior vs novo

4. **Preview de impacto**
   - Mostrar quantos usuários seriam afetados
   - Simulação de ganhos com novos valores

5. **Bulk actions**
   - Ativar/desativar múltiplos
   - Aplicar multiplicador em lote

### 🎨 MOCKUP DO PAINEL

```
┌─────────────────────────────────────────────────────────────┐
│ 🎮 Configuração de XP e Pontos                    [+ Nova]  │
├─────────────────────────────────────────────────────────────┤
│ Filtros: [Categoria ▼] [Status ▼] [🔍 Buscar...]           │
├─────────────────────────────────────────────────────────────┤
│ Ação              │ XP  │ Pts │ Limite │ Status │ Ações    │
├───────────────────┼─────┼─────┼────────┼────────┼──────────┤
│ 🏋️ Completar Treino │ 25  │ 50  │ 3/dia  │ ✅     │ [✏️][📊]│
│ 💪 Exercício       │ 10  │ 10  │ 50/dia │ ✅     │ [✏️][📊]│
│ 🏆 Recorde Pessoal │ 50  │ 100 │ 10/dia │ ✅     │ [✏️][📊]│
│ 💧 Meta de Água    │ 50  │ 30  │ 1/dia  │ ✅     │ [✏️][📊]│
│ ...               │     │     │        │        │          │
└─────────────────────────────────────────────────────────────┘
```

---

## 5️⃣ IMPACTO NO SISTEMA

### 🔄 ONDE A ALTERAÇÃO DE XP IMPACTA

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE XP NO SISTEMA                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Ação do Usuário]                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                        │
│  │ xp_actions_config│ ◄── Buscar configuração               │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ Calcular XP     │ ◄── Aplicar multiplicadores            │
│  │ + Verificar     │ ◄── Checar limites diários             │
│  │   limites       │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐     ┌─────────────────┐               │
│  │ user_points     │────►│ Nível do Usuário│               │
│  │ (total_points)  │     │ (level)         │               │
│  └────────┬────────┘     └─────────────────┘               │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐     ┌─────────────────┐               │
│  │ Ranking         │────►│ Leaderboard     │               │
│  │ (posição)       │     │ (semanal/mensal)│               │
│  └─────────────────┘     └─────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ⚠️ RISCOS DE INCONSISTÊNCIA

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| Histórico com valores antigos | Alta | Manter log de alterações |
| Ranking desbalanceado | Média | Recalcular rankings após mudança |
| Usuários com XP "inflado" | Média | Não aplicar retroativamente |
| Exploits de farming | Alta | Implementar limites diários |

### 🛡️ GARANTIAS DE INTEGRIDADE

```sql
-- 1. Trigger para log de alterações
CREATE TABLE xp_config_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES xp_actions_config(id),
  action_key VARCHAR(50),
  field_changed VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Trigger automático
CREATE OR REPLACE FUNCTION log_xp_config_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.base_xp != NEW.base_xp THEN
    INSERT INTO xp_config_audit_log (config_id, action_key, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, NEW.action_key, 'base_xp', OLD.base_xp::text, NEW.base_xp::text, auth.uid());
  END IF;
  -- Repetir para outros campos...
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_xp_config_audit
BEFORE UPDATE ON xp_actions_config
FOR EACH ROW EXECUTE FUNCTION log_xp_config_changes();

-- 3. Tabela de limites diários por usuário
CREATE TABLE user_daily_xp_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_key VARCHAR(50),
  date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  UNIQUE(user_id, action_key, date)
);
```

---

## 6️⃣ SUGESTÕES DE MELHORIAS (NÍVEL ESPECIALISTA)

### 🔴 PROBLEMAS CRÍTICOS A RESOLVER

#### 1. UNIFICAR SISTEMAS PARALELOS
**Problema:** 5 sistemas de XP independentes (user_points, exercise_gamification_points, health_streaks, challenges, cardio)

**Solução:**
```typescript
// Criar um único ponto de entrada
class UnifiedGamificationService {
  async awardXP(userId: string, actionKey: string, metadata?: object) {
    // 1. Buscar config da ação
    const config = await this.getActionConfig(actionKey);
    
    // 2. Verificar limites diários
    const canAward = await this.checkDailyLimits(userId, actionKey);
    if (!canAward) return { awarded: false, reason: 'daily_limit' };
    
    // 3. Calcular XP com multiplicadores
    const xp = this.calculateXP(config, metadata);
    
    // 4. Salvar em ÚNICA tabela centralizada
    await this.saveToUserPoints(userId, xp, actionKey);
    
    // 5. Verificar conquistas
    await this.checkAchievements(userId);
    
    return { awarded: true, xp };
  }
}
```

#### 2. USAR A TABELA `points_configuration` QUE JÁ EXISTE
**Problema:** Tabela existe mas código usa valores hardcoded

**Solução:**
```typescript
// src/services/xpConfigService.ts
export async function getXPConfig(actionKey: string) {
  const { data } = await supabase
    .from('points_configuration')
    .select('*')
    .eq('action_type', actionKey)
    .eq('is_active', true)
    .single();
  
  return data || DEFAULT_CONFIG[actionKey];
}

// Usar em vez de constantes hardcoded
const config = await getXPConfig('workout_complete');
const xp = config.points * config.multiplier;
```

#### 3. IMPLEMENTAR LIMITES ANTI-EXPLOIT
**Problema:** Usuário pode farmar XP infinitamente

**Solução:**
```sql
-- Função para verificar e incrementar limite diário
CREATE OR REPLACE FUNCTION check_and_increment_daily_limit(
  p_user_id UUID,
  p_action_key VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
  v_config RECORD;
  v_current_count INTEGER;
BEGIN
  -- Buscar configuração
  SELECT * INTO v_config FROM xp_actions_config WHERE action_key = p_action_key;
  
  -- Se não tem limite, permitir
  IF v_config.max_daily_count IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Buscar contagem atual
  SELECT count INTO v_current_count
  FROM user_daily_xp_limits
  WHERE user_id = p_user_id 
    AND action_key = p_action_key 
    AND date = CURRENT_DATE;
  
  -- Verificar limite
  IF COALESCE(v_current_count, 0) >= v_config.max_daily_count THEN
    RETURN FALSE;
  END IF;
  
  -- Incrementar
  INSERT INTO user_daily_xp_limits (user_id, action_key, date, count)
  VALUES (p_user_id, p_action_key, CURRENT_DATE, 1)
  ON CONFLICT (user_id, action_key, date) 
  DO UPDATE SET count = user_daily_xp_limits.count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 🟡 MELHORIAS DE PRODUTO

#### 4. SEPARAR XP DE MOEDAS/RECOMPENSAS
**Recomendação:** Criar sistema dual

| Tipo | Propósito | Uso |
|------|-----------|-----|
| **XP** | Progressão/Nível | Não pode ser gasto, só acumula |
| **Moedas** | Economia | Pode comprar itens, skins, etc |

```sql
ALTER TABLE user_points ADD COLUMN coins INTEGER DEFAULT 0;

-- XP = progressão permanente
-- Coins = economia gastável
```

#### 5. PADRONIZAR FÓRMULA DE NÍVEIS
**Problema:** Cada sistema usa fórmula diferente

**Solução única:**
```typescript
// Fórmula quadrática (padrão RPG)
export function calculateLevel(totalXP: number): number {
  // Level = floor(sqrt(XP / 100)) + 1
  // Level 1: 0-99 XP
  // Level 2: 100-399 XP  
  // Level 3: 400-899 XP
  // Level N: (N-1)² * 100 XP
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return (level - 1) ** 2 * 100;
}
```

#### 6. ELIMINAR HOOKS DUPLICADOS
**Problema:** 5+ hooks de gamificação

**Solução:** Deprecar e unificar
```
❌ useGamification.ts          → DEPRECAR
❌ useEnhancedGamification.ts  → DEPRECAR  
❌ useRealGamification.ts      → DEPRECAR
⚠️ useGamificationUnified.ts  → MANTER (renomear)
✅ useGamification (novo)      → CRIAR único
```

### 🟢 MELHORIAS AVANÇADAS

#### 7. SISTEMA DE MULTIPLICADORES DINÂMICOS
```typescript
interface XPMultiplier {
  type: 'streak' | 'event' | 'premium' | 'first_time';
  value: number;
  expiresAt?: Date;
}

// Exemplo: Evento de fim de semana = 2x XP
const multipliers = await getActiveMultipliers(userId);
const totalMultiplier = multipliers.reduce((acc, m) => acc * m.value, 1);
const finalXP = baseXP * totalMultiplier;
```

#### 8. CONQUISTAS PROGRESSIVAS
```sql
CREATE TABLE achievement_tiers (
  id UUID PRIMARY KEY,
  achievement_key VARCHAR(50),
  tier INTEGER, -- 1=bronze, 2=silver, 3=gold, 4=platinum
  threshold INTEGER,
  xp_reward INTEGER,
  icon VARCHAR(20)
);

-- Exemplo: "Treinos Completados"
-- Tier 1 (Bronze): 10 treinos = 100 XP
-- Tier 2 (Silver): 50 treinos = 300 XP
-- Tier 3 (Gold): 200 treinos = 1000 XP
-- Tier 4 (Platinum): 1000 treinos = 5000 XP
```

#### 9. DECAY DE INATIVIDADE (OPCIONAL)
```sql
-- Reduzir streak após X dias sem atividade
CREATE OR REPLACE FUNCTION decay_inactive_streaks()
RETURNS void AS $$
BEGIN
  UPDATE user_points
  SET current_streak = GREATEST(0, current_streak - 1)
  WHERE last_activity_date < CURRENT_DATE - INTERVAL '2 days'
    AND current_streak > 0;
END;
$$ LANGUAGE plpgsql;

-- Executar diariamente via cron
SELECT cron.schedule('decay-streaks', '0 3 * * *', 'SELECT decay_inactive_streaks()');
```

---

## 7️⃣ ENTREGA FINAL - CHECKLIST

### ✅ ITENS ENTREGUES

| Item | Status | Localização |
|------|--------|-------------|
| Lista completa de ações (45 itens) | ✅ | Seção 1 |
| Diagnóstico hardcoded vs configurável | ✅ | Seção 2 |
| Proposta de estrutura de dados | ✅ | Seção 3 |
| Proposta de painel admin | ✅ | Seção 4 |
| Análise de impacto | ✅ | Seção 5 |
| Recomendações técnicas | ✅ | Seção 6 |

### 📊 RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| Total de ações mapeadas | 45 |
| Ações hardcoded | 28 (62%) |
| Ações parcialmente configuráveis | 15 (33%) |
| Ações totalmente configuráveis | 2 (5%) |
| Sistemas paralelos identificados | 5 |
| Hooks duplicados | 5 |
| Tabelas de gamificação | 8+ |

### 🚨 AÇÕES PRIORITÁRIAS

1. **URGENTE:** Criar service centralizado que usa `points_configuration`
2. **URGENTE:** Implementar limites diários anti-exploit
3. **ALTA:** Unificar hooks em um único `useGamification`
4. **MÉDIA:** Criar painel admin para configuração
5. **BAIXA:** Separar XP de moedas

### 📁 ARQUIVOS A MODIFICAR

```
CRIAR:
├── src/services/gamification/unifiedGamificationService.ts
├── src/services/gamification/xpConfigService.ts
├── src/hooks/useUnifiedGamification.ts
├── src/components/admin/XPConfigPanel.tsx
└── supabase/migrations/XXXXXX_unified_gamification.sql

MODIFICAR:
├── src/services/exercise/gamificationService.ts (usar config do BD)
├── src/services/dr-vital/gamificationService.ts (usar config do BD)
├── src/hooks/useGamificationUnified.ts (deprecar)
└── src/hooks/useGamification.ts (deprecar)

DEPRECAR:
├── src/hooks/useEnhancedGamification.ts
├── src/hooks/useRealGamification.ts
└── Valores hardcoded em todos os arquivos listados
```

---

## 📝 NOTAS FINAIS

### O QUE NÃO EXISTE E É RECOMENDADO

| Feature | Status | Prioridade |
|---------|--------|------------|
| Painel admin de XP | ❌ NÃO IMPLEMENTADO | 🔴 Alta |
| Limites diários anti-exploit | ❌ NÃO IMPLEMENTADO | 🔴 Alta |
| Log de auditoria de alterações | ❌ NÃO IMPLEMENTADO | 🟡 Média |
| Sistema de moedas separado | ❌ NÃO IMPLEMENTADO | 🟢 Baixa |
| Multiplicadores de evento | ❌ NÃO IMPLEMENTADO | 🟢 Baixa |
| Decay de inatividade | ❌ NÃO IMPLEMENTADO | 🟢 Baixa |

### CONCLUSÃO

O sistema atual funciona mas está **fragmentado e difícil de manter**. A tabela `points_configuration` já existe e deveria ser usada. A prioridade é:

1. Fazer o código **usar a tabela que já existe**
2. Implementar **limites diários** para evitar exploits
3. **Unificar** os 5 sistemas em um só
4. Criar **painel admin** para configuração sem deploy

---

*Documento gerado em Janeiro 2026*
*Arquiteto: Análise Automatizada de Sistema*

---

## 🚀 IMPLEMENTAÇÃO REALIZADA (Janeiro 2026)

### ✅ O QUE FOI IMPLEMENTADO

1. **Migration `20260115000000_unified_gamification_system.sql`**
   - Expandiu tabela `points_configuration` com `base_xp`, `cooldown_minutes`, `sort_order`
   - Criou tabela `user_daily_xp_limits` para limites anti-exploit
   - Criou tabela `xp_config_audit_log` para auditoria de alterações
   - Criou tabela `unified_xp_history` para histórico centralizado
   - Funções RPC: `check_and_increment_daily_limit`, `get_xp_config`, `award_unified_xp`, `get_user_xp_stats`
   - Trigger de auditoria automática em alterações de config
   - 26 ações de XP configuradas no banco

2. **Service Unificado `src/services/gamification/unifiedGamificationService.ts`**
   - `getXPConfig()` - Busca config do banco com cache local
   - `awardXP()` - Concede XP usando config do banco + verifica limites
   - `getUserXPStats()` - Estatísticas completas do usuário
   - `getUserDailyLimits()` - Limites diários consumidos
   - Funções de cálculo de nível padronizadas

3. **Hook Unificado `src/hooks/useUnifiedGamification.ts`**
   - Substitui os 5 hooks duplicados
   - React Query com cache otimizado
   - Optimistic updates
   - Verificação automática de limites

4. **Painel Admin `src/components/admin/XPConfigPanel.tsx`**
   - Listagem de todas as configurações
   - Edição inline de XP, pontos, limites
   - Filtros por categoria e busca
   - Histórico de alterações (auditoria)
   - Validações de valores

5. **Integração nos Services Existentes**
   - `src/services/exercise/gamificationService.ts` - Usa config do banco
   - `src/services/dr-vital/gamificationService.ts` - Usa config do banco
   - `src/services/dr-vital/bossBattleService.ts` - Usa config do banco

### 📁 ARQUIVOS CRIADOS/MODIFICADOS

```
CRIADOS:
├── supabase/migrations/20260115000000_unified_gamification_system.sql
├── src/services/gamification/unifiedGamificationService.ts
├── src/hooks/useUnifiedGamification.ts
└── src/components/admin/XPConfigPanel.tsx

MODIFICADOS:
├── src/pages/AdminPage.tsx (adicionado menu e case)
├── src/services/exercise/gamificationService.ts (usa sistema unificado)
├── src/services/dr-vital/gamificationService.ts (usa sistema unificado)
└── src/services/dr-vital/bossBattleService.ts (usa sistema unificado)
```

### 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Deprecar hooks antigos** gradualmente:
   - `useGamification.ts`
   - `useEnhancedGamification.ts`
   - `useRealGamification.ts`
   - `useGamificationUnified.ts`

2. **Migrar componentes** para usar `useUnifiedGamification`

3. **Configurar valores** no painel admin conforme necessidade do negócio

4. **Monitorar** limites diários e ajustar conforme comportamento dos usuários
