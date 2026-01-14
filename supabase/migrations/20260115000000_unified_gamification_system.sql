-- =====================================================
-- UNIFIED GAMIFICATION SYSTEM
-- =====================================================
-- Centraliza toda a configuração de XP/pontos
-- Implementa limites anti-exploit
-- Adiciona auditoria de alterações
-- =====================================================

-- 1. Expandir tabela points_configuration existente
ALTER TABLE public.points_configuration 
ADD COLUMN IF NOT EXISTS base_xp INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS cooldown_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. Tabela de limites diários por usuário (anti-exploit)
CREATE TABLE IF NOT EXISTS public.user_daily_xp_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, action_type, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_daily_xp_user_date 
ON public.user_daily_xp_limits(user_id, date);

CREATE INDEX IF NOT EXISTS idx_user_daily_xp_action 
ON public.user_daily_xp_limits(action_type, date);

-- RLS
ALTER TABLE public.user_daily_xp_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily limits"
ON public.user_daily_xp_limits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage daily limits"
ON public.user_daily_xp_limits FOR ALL
USING (true);

-- 3. Tabela de auditoria de alterações de configuração
CREATE TABLE IF NOT EXISTS public.xp_config_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.points_configuration(id),
  action_type VARCHAR(50),
  field_changed VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_audit_config 
ON public.xp_config_audit_log(config_id);

CREATE INDEX IF NOT EXISTS idx_xp_audit_date 
ON public.xp_config_audit_log(changed_at DESC);

-- RLS para auditoria
ALTER TABLE public.xp_config_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
ON public.xp_config_audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 4. Tabela de histórico unificado de XP
CREATE TABLE IF NOT EXISTS public.unified_xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  multiplier NUMERIC DEFAULT 1.0,
  source_system VARCHAR(30), -- 'exercise', 'health', 'social', 'challenge'
  source_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_unified_xp_user 
ON public.unified_xp_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_unified_xp_action 
ON public.unified_xp_history(action_type);

-- RLS
ALTER TABLE public.unified_xp_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp history"
ON public.unified_xp_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert xp history"
ON public.unified_xp_history FOR INSERT
WITH CHECK (true);

-- 5. Função para verificar e incrementar limite diário
CREATE OR REPLACE FUNCTION check_and_increment_daily_limit(
  p_user_id UUID,
  p_action_type VARCHAR(50),
  p_xp_to_add INTEGER DEFAULT 0,
  p_points_to_add INTEGER DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
  v_config RECORD;
  v_current RECORD;
  v_can_award BOOLEAN := TRUE;
  v_reason TEXT := NULL;
BEGIN
  -- Buscar configuração da ação
  SELECT * INTO v_config 
  FROM public.points_configuration 
  WHERE action_type = p_action_type AND is_active = true;
  
  -- Se não encontrou config, permitir (fallback)
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_award', TRUE,
      'reason', 'no_config_found',
      'current_count', 0,
      'max_count', NULL
    );
  END IF;
  
  -- Se não tem limite diário, permitir
  IF v_config.max_daily IS NULL THEN
    -- Apenas registrar
    INSERT INTO public.user_daily_xp_limits (user_id, action_type, date, count, total_xp, total_points)
    VALUES (p_user_id, p_action_type, CURRENT_DATE, 1, p_xp_to_add, p_points_to_add)
    ON CONFLICT (user_id, action_type, date) 
    DO UPDATE SET 
      count = user_daily_xp_limits.count + 1,
      total_xp = user_daily_xp_limits.total_xp + p_xp_to_add,
      total_points = user_daily_xp_limits.total_points + p_points_to_add,
      updated_at = now();
    
    RETURN jsonb_build_object(
      'can_award', TRUE,
      'reason', 'no_limit',
      'current_count', 0,
      'max_count', NULL
    );
  END IF;
  
  -- Buscar contagem atual
  SELECT * INTO v_current
  FROM public.user_daily_xp_limits
  WHERE user_id = p_user_id 
    AND action_type = p_action_type 
    AND date = CURRENT_DATE;
  
  -- Verificar limite
  IF v_current IS NOT NULL AND v_current.count >= v_config.max_daily THEN
    RETURN jsonb_build_object(
      'can_award', FALSE,
      'reason', 'daily_limit_reached',
      'current_count', v_current.count,
      'max_count', v_config.max_daily
    );
  END IF;
  
  -- Incrementar contador
  INSERT INTO public.user_daily_xp_limits (user_id, action_type, date, count, total_xp, total_points)
  VALUES (p_user_id, p_action_type, CURRENT_DATE, 1, p_xp_to_add, p_points_to_add)
  ON CONFLICT (user_id, action_type, date) 
  DO UPDATE SET 
    count = user_daily_xp_limits.count + 1,
    total_xp = user_daily_xp_limits.total_xp + p_xp_to_add,
    total_points = user_daily_xp_limits.total_points + p_points_to_add,
    updated_at = now();
  
  RETURN jsonb_build_object(
    'can_award', TRUE,
    'reason', 'within_limit',
    'current_count', COALESCE(v_current.count, 0) + 1,
    'max_count', v_config.max_daily
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para buscar configuração de XP
CREATE OR REPLACE FUNCTION get_xp_config(p_action_type VARCHAR(50))
RETURNS JSONB AS $$
DECLARE
  v_config RECORD;
BEGIN
  SELECT * INTO v_config 
  FROM public.points_configuration 
  WHERE action_type = p_action_type AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  RETURN jsonb_build_object(
    'action_type', v_config.action_type,
    'action_name', v_config.action_name,
    'points', v_config.points,
    'base_xp', COALESCE(v_config.base_xp, v_config.points),
    'multiplier', v_config.multiplier,
    'max_daily', v_config.max_daily,
    'icon', v_config.icon,
    'category', v_config.category,
    'is_active', v_config.is_active
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para conceder XP de forma unificada
CREATE OR REPLACE FUNCTION award_unified_xp(
  p_user_id UUID,
  p_action_type VARCHAR(50),
  p_source_system VARCHAR(30) DEFAULT NULL,
  p_source_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  v_config JSONB;
  v_limit_check JSONB;
  v_xp INTEGER;
  v_points INTEGER;
  v_multiplier NUMERIC;
  v_current_points INTEGER;
  v_new_total INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Buscar configuração
  v_config := get_xp_config(p_action_type);
  
  IF v_config IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'reason', 'action_not_configured',
      'xp_earned', 0,
      'points_earned', 0
    );
  END IF;
  
  v_xp := (v_config->>'base_xp')::INTEGER;
  v_points := (v_config->>'points')::INTEGER;
  v_multiplier := (v_config->>'multiplier')::NUMERIC;
  
  -- Aplicar multiplicador
  v_xp := FLOOR(v_xp * v_multiplier);
  v_points := FLOOR(v_points * v_multiplier);
  
  -- Verificar limite diário
  v_limit_check := check_and_increment_daily_limit(p_user_id, p_action_type, v_xp, v_points);
  
  IF NOT (v_limit_check->>'can_award')::BOOLEAN THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'reason', v_limit_check->>'reason',
      'xp_earned', 0,
      'points_earned', 0,
      'current_count', (v_limit_check->>'current_count')::INTEGER,
      'max_count', (v_limit_check->>'max_count')::INTEGER
    );
  END IF;
  
  -- Registrar no histórico unificado
  INSERT INTO public.unified_xp_history (
    user_id, action_type, xp_earned, points_earned, 
    multiplier, source_system, source_id, metadata
  ) VALUES (
    p_user_id, p_action_type, v_xp, v_points,
    v_multiplier, p_source_system, p_source_id, p_metadata
  );
  
  -- Atualizar user_points (tabela principal)
  SELECT total_points INTO v_current_points
  FROM public.user_points
  WHERE user_id = p_user_id;
  
  v_new_total := COALESCE(v_current_points, 0) + v_points;
  v_new_level := FLOOR(SQRT(v_new_total / 100.0)) + 1;
  
  INSERT INTO public.user_points (user_id, total_points, level, last_activity_date, updated_at)
  VALUES (p_user_id, v_new_total, v_new_level, CURRENT_DATE, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = v_new_total,
    level = v_new_level,
    last_activity_date = CURRENT_DATE,
    updated_at = now();
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'xp_earned', v_xp,
    'points_earned', v_points,
    'new_total', v_new_total,
    'new_level', v_new_level,
    'action_name', v_config->>'action_name',
    'icon', v_config->>'icon'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger para auditoria de alterações
CREATE OR REPLACE FUNCTION log_xp_config_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log de alteração de pontos
  IF OLD.points IS DISTINCT FROM NEW.points THEN
    INSERT INTO public.xp_config_audit_log 
      (config_id, action_type, field_changed, old_value, new_value, changed_by)
    VALUES 
      (NEW.id, NEW.action_type, 'points', OLD.points::TEXT, NEW.points::TEXT, auth.uid());
  END IF;
  
  -- Log de alteração de XP base
  IF OLD.base_xp IS DISTINCT FROM NEW.base_xp THEN
    INSERT INTO public.xp_config_audit_log 
      (config_id, action_type, field_changed, old_value, new_value, changed_by)
    VALUES 
      (NEW.id, NEW.action_type, 'base_xp', OLD.base_xp::TEXT, NEW.base_xp::TEXT, auth.uid());
  END IF;
  
  -- Log de alteração de limite diário
  IF OLD.max_daily IS DISTINCT FROM NEW.max_daily THEN
    INSERT INTO public.xp_config_audit_log 
      (config_id, action_type, field_changed, old_value, new_value, changed_by)
    VALUES 
      (NEW.id, NEW.action_type, 'max_daily', OLD.max_daily::TEXT, NEW.max_daily::TEXT, auth.uid());
  END IF;
  
  -- Log de alteração de status
  IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    INSERT INTO public.xp_config_audit_log 
      (config_id, action_type, field_changed, old_value, new_value, changed_by)
    VALUES 
      (NEW.id, NEW.action_type, 'is_active', OLD.is_active::TEXT, NEW.is_active::TEXT, auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_xp_config_audit ON public.points_configuration;
CREATE TRIGGER trigger_xp_config_audit
AFTER UPDATE ON public.points_configuration
FOR EACH ROW
EXECUTE FUNCTION log_xp_config_changes();

-- 9. Atualizar configurações existentes com novos campos
UPDATE public.points_configuration SET
  base_xp = points,
  sort_order = CASE action_type
    WHEN 'daily_session' THEN 1
    WHEN 'mission_complete' THEN 2
    WHEN 'weight_log' THEN 3
    WHEN 'photo_upload' THEN 4
    WHEN 'goal_complete' THEN 5
    WHEN 'challenge_join' THEN 6
    WHEN 'challenge_complete' THEN 7
    WHEN 'comment' THEN 10
    WHEN 'like' THEN 11
    WHEN 'share_post' THEN 12
    WHEN 'referral' THEN 13
    WHEN 'streak_bonus_7' THEN 20
    WHEN 'streak_bonus_30' THEN 21
    WHEN 'first_login' THEN 30
    WHEN 'profile_complete' THEN 31
    ELSE 99
  END
WHERE base_xp IS NULL;

-- 10. Adicionar novas ações de exercício
INSERT INTO public.points_configuration 
  (action_type, action_name, points, base_xp, description, icon, category, max_daily, multiplier, sort_order)
VALUES
  ('workout_complete', 'Completar Treino', 50, 25, 'Finalizar um treino completo', '🏋️', 'exercicio', 3, 1.0, 40),
  ('exercise_complete', 'Completar Exercício', 10, 10, 'Completar um exercício individual', '💪', 'exercicio', 50, 1.0, 41),
  ('personal_record', 'Recorde Pessoal', 100, 50, 'Bater um recorde pessoal', '🏆', 'exercicio', 10, 1.0, 42),
  ('workout_minute', 'Minuto de Treino', 1, 1, 'Por cada minuto de treino', '⏱️', 'exercicio', 120, 1.0, 43),
  ('water_goal', 'Meta de Água', 30, 50, 'Atingir meta diária de água', '💧', 'saude', 1, 1.0, 50),
  ('meal_logged', 'Refeição Registrada', 15, 25, 'Registrar uma refeição', '🍽️', 'saude', 5, 1.0, 51),
  ('sleep_goal', 'Meta de Sono', 40, 75, 'Dormir 7+ horas', '😴', 'saude', 1, 1.0, 52),
  ('steps_goal', 'Meta de Passos', 35, 60, 'Atingir meta de passos', '👟', 'saude', 1, 1.0, 53),
  ('boss_battle_win', 'Derrotar Boss', 300, 500, 'Normalizar exame anormal', '🐉', 'saude', NULL, 1.0, 54),
  ('duel_win', 'Vencer Duelo', 150, 150, 'Vencer um duelo X1', '⚔️', 'desafio', 5, 1.0, 60),
  ('daily_checkin', 'Check-in Diário', 30, 30, 'Fazer check-in diário', '📅', 'missao', 1, 1.0, 70)
ON CONFLICT (action_type) DO UPDATE SET
  action_name = EXCLUDED.action_name,
  points = EXCLUDED.points,
  base_xp = EXCLUDED.base_xp,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  max_daily = EXCLUDED.max_daily,
  sort_order = EXCLUDED.sort_order;

-- 11. Função para buscar todas as configurações (para admin)
CREATE OR REPLACE FUNCTION get_all_xp_configs()
RETURNS TABLE (
  id UUID,
  action_type VARCHAR(50),
  action_name VARCHAR(100),
  points INTEGER,
  base_xp INTEGER,
  description TEXT,
  icon VARCHAR(20),
  category VARCHAR(50),
  multiplier NUMERIC,
  max_daily INTEGER,
  is_active BOOLEAN,
  sort_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.action_type,
    pc.action_name,
    pc.points,
    COALESCE(pc.base_xp, pc.points) as base_xp,
    pc.description,
    pc.icon,
    pc.category,
    pc.multiplier,
    pc.max_daily,
    pc.is_active,
    COALESCE(pc.sort_order, 99) as sort_order,
    pc.created_at,
    pc.updated_at
  FROM public.points_configuration pc
  ORDER BY pc.sort_order, pc.action_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Função para estatísticas de XP do usuário
CREATE OR REPLACE FUNCTION get_user_xp_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_total_points INTEGER;
  v_level INTEGER;
  v_today_xp INTEGER;
  v_week_xp INTEGER;
  v_month_xp INTEGER;
BEGIN
  -- Total de pontos
  SELECT total_points INTO v_total_points
  FROM public.user_points
  WHERE user_id = p_user_id;
  
  v_total_points := COALESCE(v_total_points, 0);
  v_level := FLOOR(SQRT(v_total_points / 100.0)) + 1;
  
  -- XP de hoje
  SELECT COALESCE(SUM(xp_earned), 0) INTO v_today_xp
  FROM public.unified_xp_history
  WHERE user_id = p_user_id AND created_at >= CURRENT_DATE;
  
  -- XP da semana
  SELECT COALESCE(SUM(xp_earned), 0) INTO v_week_xp
  FROM public.unified_xp_history
  WHERE user_id = p_user_id AND created_at >= date_trunc('week', CURRENT_DATE);
  
  -- XP do mês
  SELECT COALESCE(SUM(xp_earned), 0) INTO v_month_xp
  FROM public.unified_xp_history
  WHERE user_id = p_user_id AND created_at >= date_trunc('month', CURRENT_DATE);
  
  RETURN jsonb_build_object(
    'total_points', v_total_points,
    'level', v_level,
    'xp_to_next_level', (v_level * v_level * 100) - v_total_points,
    'today_xp', v_today_xp,
    'week_xp', v_week_xp,
    'month_xp', v_month_xp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Limpar dados antigos de limites diários (manter 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_daily_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_daily_xp_limits
  WHERE date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
