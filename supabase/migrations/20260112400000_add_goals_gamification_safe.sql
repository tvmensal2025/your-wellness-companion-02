-- =====================================================
-- MIGRAÇÃO SEGURA: Gamificação de Metas
-- Data: 2026-01-12
-- Descrição: Adiciona campos de gamificação à tabela user_goals
--            e cria tabelas auxiliares SEM QUEBRAR dados existentes
-- =====================================================

-- 1. ADICIONAR CAMPOS NOVOS À TABELA user_goals (se não existirem)
-- =====================================================

-- Adicionar campos de gamificação
ALTER TABLE public.user_goals
ADD COLUMN IF NOT EXISTS streak_days integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_update_date date,
ADD COLUMN IF NOT EXISTS xp_earned integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS evidence_urls text[],
ADD COLUMN IF NOT EXISTS participant_ids uuid[];

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.user_goals.streak_days IS 'Número de dias consecutivos atualizando a meta';
COMMENT ON COLUMN public.user_goals.last_update_date IS 'Data da última atualização de progresso';
COMMENT ON COLUMN public.user_goals.xp_earned IS 'Experiência acumulada nesta meta';
COMMENT ON COLUMN public.user_goals.level IS 'Nível atual da meta (1-100)';
COMMENT ON COLUMN public.user_goals.evidence_urls IS 'URLs das evidências (fotos/vídeos)';
COMMENT ON COLUMN public.user_goals.participant_ids IS 'IDs dos participantes (metas em grupo)';

-- 2. CRIAR TABELA DE CONQUISTAS (se não existir)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.goal_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  icon text,
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  unlocked_at timestamp with time zone DEFAULT now(),
  progress integer DEFAULT 0,
  total_required integer DEFAULT 1,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Constraint para evitar duplicatas
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_type)
);

-- Comentários
COMMENT ON TABLE public.goal_achievements IS 'Conquistas desbloqueadas pelos usuários no sistema de metas';
COMMENT ON COLUMN public.goal_achievements.rarity IS 'Raridade: common, rare, epic, legendary';
COMMENT ON COLUMN public.goal_achievements.metadata IS 'Dados adicionais em JSON (ex: data de desbloqueio, contexto)';

-- 3. CRIAR TABELA DE STREAKS (se não existir)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.goal_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES public.user_goals(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_update_date date,
  streak_type text DEFAULT 'daily' CHECK (streak_type IN ('daily', 'weekly', 'monthly')),
  streak_protected boolean DEFAULT false,
  protection_used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraint para evitar duplicatas
  CONSTRAINT unique_user_goal_streak UNIQUE (user_id, goal_id, streak_type)
);

-- Comentários
COMMENT ON TABLE public.goal_streaks IS 'Sequências de dias/semanas/meses atualizando metas';
COMMENT ON COLUMN public.goal_streaks.streak_protected IS 'Se o streak está protegido (1x por mês)';
COMMENT ON COLUMN public.goal_streaks.protection_used_at IS 'Quando a proteção foi usada';

-- 4. CRIAR TABELA DE NÍVEIS (se não existir)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_goal_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_level integer DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 100),
  current_xp integer DEFAULT 0 CHECK (current_xp >= 0),
  total_xp integer DEFAULT 0 CHECK (total_xp >= 0),
  xp_to_next_level integer DEFAULT 100,
  level_title text DEFAULT 'Iniciante',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Comentários
COMMENT ON TABLE public.user_goal_levels IS 'Sistema de níveis e experiência dos usuários';
COMMENT ON COLUMN public.user_goal_levels.level_title IS 'Título do nível: Iniciante, Determinado, Mestre, Lenda';

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para goal_achievements
CREATE INDEX IF NOT EXISTS idx_goal_achievements_user_id 
ON public.goal_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_goal_achievements_type 
ON public.goal_achievements(achievement_type);

CREATE INDEX IF NOT EXISTS idx_goal_achievements_unlocked 
ON public.goal_achievements(unlocked_at DESC);

-- Índices para goal_streaks
CREATE INDEX IF NOT EXISTS idx_goal_streaks_user_id 
ON public.goal_streaks(user_id);

CREATE INDEX IF NOT EXISTS idx_goal_streaks_goal_id 
ON public.goal_streaks(goal_id);

CREATE INDEX IF NOT EXISTS idx_goal_streaks_current 
ON public.goal_streaks(current_streak DESC);

-- Índices para user_goals (novos campos)
CREATE INDEX IF NOT EXISTS idx_user_goals_streak 
ON public.user_goals(streak_days DESC) WHERE streak_days > 0;

CREATE INDEX IF NOT EXISTS idx_user_goals_level 
ON public.user_goals(level DESC);

-- 6. HABILITAR ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.goal_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_levels ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLICIES DE SEGURANÇA
-- =====================================================

-- Policies para goal_achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON public.goal_achievements;
CREATE POLICY "Users can view own achievements" 
ON public.goal_achievements FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.goal_achievements;
CREATE POLICY "Users can insert own achievements" 
ON public.goal_achievements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies para goal_streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON public.goal_streaks;
CREATE POLICY "Users can view own streaks" 
ON public.goal_streaks FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own streaks" ON public.goal_streaks;
CREATE POLICY "Users can manage own streaks" 
ON public.goal_streaks FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Policies para user_goal_levels
DROP POLICY IF EXISTS "Users can view own level" ON public.user_goal_levels;
CREATE POLICY "Users can view own level" 
ON public.user_goal_levels FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own level" ON public.user_goal_levels;
CREATE POLICY "Users can update own level" 
ON public.user_goal_levels FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own level" ON public.user_goal_levels;
CREATE POLICY "Users can insert own level" 
ON public.user_goal_levels FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 8. CRIAR FUNÇÃO PARA ATUALIZAR STREAK AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION update_goal_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Só atualiza se o progresso aumentou
  IF NEW.current_value > OLD.current_value THEN
    
    -- Verificar se é atualização no mesmo dia
    IF NEW.last_update_date = CURRENT_DATE THEN
      -- Mesmo dia, não incrementa streak
      RETURN NEW;
      
    ELSIF OLD.last_update_date IS NULL OR NEW.last_update_date = OLD.last_update_date + INTERVAL '1 day' THEN
      -- Primeiro update ou dia consecutivo, incrementa streak
      NEW.streak_days := COALESCE(OLD.streak_days, 0) + 1;
      NEW.last_update_date := CURRENT_DATE;
      
    ELSIF NEW.last_update_date > OLD.last_update_date + INTERVAL '1 day' THEN
      -- Quebrou o streak, reinicia
      NEW.streak_days := 1;
      NEW.last_update_date := CURRENT_DATE;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION update_goal_streak() IS 'Atualiza automaticamente o streak quando a meta é atualizada';

-- 9. CRIAR TRIGGER PARA STREAK
-- =====================================================

DROP TRIGGER IF EXISTS trigger_update_goal_streak ON public.user_goals;
CREATE TRIGGER trigger_update_goal_streak
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  WHEN (NEW.current_value IS DISTINCT FROM OLD.current_value)
  EXECUTE FUNCTION update_goal_streak();

-- 10. CRIAR FUNÇÃO PARA CALCULAR XP NECESSÁRIO
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_xp_to_next_level(current_level integer)
RETURNS integer AS $$
BEGIN
  -- Fórmula: 100 * level^1.5 (progressão exponencial suave)
  RETURN FLOOR(100 * POWER(current_level, 1.5))::integer;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Comentário
COMMENT ON FUNCTION calculate_xp_to_next_level(integer) IS 'Calcula XP necessário para próximo nível';

-- 11. CRIAR FUNÇÃO PARA LEVEL UP
-- =====================================================

CREATE OR REPLACE FUNCTION process_level_up(p_user_id uuid, p_xp_gained integer)
RETURNS TABLE (
  new_level integer,
  new_xp integer,
  leveled_up boolean,
  new_title text
) AS $$
DECLARE
  v_current_level integer;
  v_current_xp integer;
  v_total_xp integer;
  v_xp_needed integer;
  v_leveled_up boolean := false;
  v_new_title text;
BEGIN
  -- Buscar ou criar registro de nível
  INSERT INTO public.user_goal_levels (user_id, current_level, current_xp, total_xp)
  VALUES (p_user_id, 1, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Buscar dados atuais
  SELECT current_level, current_xp, total_xp
  INTO v_current_level, v_current_xp, v_total_xp
  FROM public.user_goal_levels
  WHERE user_id = p_user_id;
  
  -- Adicionar XP
  v_current_xp := v_current_xp + p_xp_gained;
  v_total_xp := v_total_xp + p_xp_gained;
  
  -- Verificar level up
  v_xp_needed := calculate_xp_to_next_level(v_current_level);
  
  WHILE v_current_xp >= v_xp_needed AND v_current_level < 100 LOOP
    v_current_xp := v_current_xp - v_xp_needed;
    v_current_level := v_current_level + 1;
    v_leveled_up := true;
    v_xp_needed := calculate_xp_to_next_level(v_current_level);
  END LOOP;
  
  -- Determinar título
  v_new_title := CASE
    WHEN v_current_level >= 51 THEN 'Lenda'
    WHEN v_current_level >= 26 THEN 'Mestre'
    WHEN v_current_level >= 11 THEN 'Determinado'
    ELSE 'Iniciante'
  END;
  
  -- Atualizar registro
  UPDATE public.user_goal_levels
  SET 
    current_level = v_current_level,
    current_xp = v_current_xp,
    total_xp = v_total_xp,
    xp_to_next_level = v_xp_needed,
    level_title = v_new_title,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Retornar resultado
  RETURN QUERY SELECT v_current_level, v_current_xp, v_leveled_up, v_new_title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION process_level_up(uuid, integer) IS 'Processa ganho de XP e level up automático';

-- 12. ATUALIZAR TIMESTAMP AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_goal_streaks_updated_at ON public.goal_streaks;
CREATE TRIGGER update_goal_streaks_updated_at
  BEFORE UPDATE ON public.goal_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_goal_levels_updated_at ON public.user_goal_levels;
CREATE TRIGGER update_user_goal_levels_updated_at
  BEFORE UPDATE ON public.user_goal_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 13. ANÁLISE DE TABELAS PARA OTIMIZAÇÃO
-- =====================================================

ANALYZE public.user_goals;
ANALYZE public.goal_achievements;
ANALYZE public.goal_streaks;
ANALYZE public.user_goal_levels;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migração de gamificação de metas concluída com sucesso!';
  RAISE NOTICE 'Tabelas criadas: goal_achievements, goal_streaks, user_goal_levels';
  RAISE NOTICE 'Campos adicionados a user_goals: streak_days, last_update_date, xp_earned, level, evidence_urls, participant_ids';
  RAISE NOTICE 'Funções criadas: update_goal_streak(), calculate_xp_to_next_level(), process_level_up()';
END $$;
