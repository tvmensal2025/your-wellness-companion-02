-- Tabela unificada de notificações
CREATE TABLE IF NOT EXISTS public.notification_queue_unified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Tipo e categoria
  notification_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  -- categorias: general, dr_vital, exercise, community, water, weight, achievement, session, reminder, tip, health, alert, system
  
  -- Conteúdo
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Prioridade e agendamento
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  
  -- Tracking
  sent_at TIMESTAMPTZ,
  sent_via TEXT, -- 'whatsapp', 'push', 'in_app'
  read_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue_unified(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue_unified(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue_unified(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notification_queue_category ON notification_queue_unified(category);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created ON notification_queue_unified(created_at DESC);

-- RLS
ALTER TABLE notification_queue_unified ENABLE ROW LEVEL SECURITY;

-- Políticas: usuários veem suas próprias notificações
CREATE POLICY "Users can view own notifications"
  ON notification_queue_unified FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notification_queue_unified FOR UPDATE
  USING (auth.uid() = user_id);

-- Permitir inserção via service role (VPS)
CREATE POLICY "Service role can insert notifications"
  ON notification_queue_unified FOR INSERT
  WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_notification_queue_unified_updated_at
  BEFORE UPDATE ON notification_queue_unified
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE notification_queue_unified;