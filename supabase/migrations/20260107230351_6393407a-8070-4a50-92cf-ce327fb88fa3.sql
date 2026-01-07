-- Criar tabela de configuração de pontuação
CREATE TABLE IF NOT EXISTS public.points_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(50) UNIQUE NOT NULL,
  action_name VARCHAR(100) NOT NULL,
  points INTEGER DEFAULT 10,
  description TEXT,
  icon VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  category VARCHAR(50),
  multiplier NUMERIC DEFAULT 1.0,
  max_daily INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.points_configuration ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas admins podem modificar, todos podem ler
CREATE POLICY "Anyone can read points configuration"
ON public.points_configuration FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify points configuration"
ON public.points_configuration FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Inserir configurações padrão
INSERT INTO public.points_configuration (action_type, action_name, points, description, icon, category, max_daily) VALUES
('daily_session', 'Sessão Diária', 50, 'Completar sessão de acompanhamento', '📅', 'missao', 1),
('mission_complete', 'Missão do Dia', 30, 'Completar missão diária', '🎯', 'missao', 3),
('comment', 'Comentar Post', 5, 'Comentar em publicação da comunidade', '💬', 'social', 10),
('like', 'Curtir Post', 2, 'Curtir publicação', '❤️', 'social', 20),
('photo_upload', 'Enviar Foto', 15, 'Enviar foto de progresso', '📷', 'interacao', 5),
('weight_log', 'Registrar Peso', 20, 'Registrar pesagem', '⚖️', 'interacao', 1),
('goal_complete', 'Concluir Meta', 100, 'Completar uma meta aprovada', '🏆', 'desafio', NULL),
('challenge_join', 'Participar Desafio', 10, 'Entrar em um desafio', '🚀', 'desafio', 3),
('challenge_complete', 'Completar Desafio', 200, 'Finalizar desafio com sucesso', '🥇', 'desafio', NULL),
('streak_bonus_7', 'Bônus 7 dias', 50, 'Manter sequência de 7 dias', '🔥', 'bonus', NULL),
('streak_bonus_30', 'Bônus 30 dias', 200, 'Manter sequência de 30 dias', '⭐', 'bonus', NULL),
('first_login', 'Primeiro Acesso', 100, 'Bônus de boas-vindas', '👋', 'bonus', NULL),
('profile_complete', 'Perfil Completo', 50, 'Completar dados do perfil', '✅', 'bonus', NULL),
('referral', 'Indicar Amigo', 100, 'Indicar novo usuário', '🤝', 'social', NULL),
('share_post', 'Compartilhar', 10, 'Compartilhar publicação', '📤', 'social', 5)
ON CONFLICT (action_type) DO NOTHING;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_points_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_points_config_updated_at
BEFORE UPDATE ON public.points_configuration
FOR EACH ROW
EXECUTE FUNCTION update_points_config_updated_at();