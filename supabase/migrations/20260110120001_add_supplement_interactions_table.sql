-- Migration: Add Supplement Interactions Table
-- Description: Tabela para tracking de interações do usuário com suplementos

-- Tabela de interações
CREATE TABLE IF NOT EXISTS supplement_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'expand', 'article_click', 'article_view', 'purchase_click', 'purchase_complete')),
  article_id UUID REFERENCES scientific_articles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries de analytics
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_user ON supplement_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_product ON supplement_interactions(product_id);
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_event ON supplement_interactions(event_type);
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_created ON supplement_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_user_product ON supplement_interactions(user_id, product_id);

-- Índice composto para analytics de conversão
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_analytics 
  ON supplement_interactions(user_id, product_id, event_type, created_at DESC);

-- RLS Policies
ALTER TABLE supplement_interactions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias interações
CREATE POLICY "supplement_interactions_select_own" ON supplement_interactions
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias interações
CREATE POLICY "supplement_interactions_insert_own" ON supplement_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todas as interações (para analytics)
CREATE POLICY "supplement_interactions_admin_select" ON supplement_interactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- View para analytics de conversão por produto
CREATE OR REPLACE VIEW supplement_conversion_stats AS
SELECT 
  product_id,
  s.name as product_name,
  COUNT(*) FILTER (WHERE event_type = 'view') as total_views,
  COUNT(*) FILTER (WHERE event_type = 'expand') as total_expands,
  COUNT(*) FILTER (WHERE event_type = 'article_click') as total_article_clicks,
  COUNT(*) FILTER (WHERE event_type = 'purchase_click') as total_purchase_clicks,
  COUNT(*) FILTER (WHERE event_type = 'purchase_complete') as total_purchases,
  CASE 
    WHEN COUNT(*) FILTER (WHERE event_type = 'view') > 0 
    THEN ROUND(
      (COUNT(*) FILTER (WHERE event_type = 'purchase_complete')::NUMERIC / 
       COUNT(*) FILTER (WHERE event_type = 'view')::NUMERIC) * 100, 2
    )
    ELSE 0 
  END as conversion_rate,
  COUNT(DISTINCT user_id) as unique_users
FROM supplement_interactions si
JOIN supplements s ON s.id = si.product_id
GROUP BY product_id, s.name;

-- View para analytics por usuário
CREATE OR REPLACE VIEW user_supplement_engagement AS
SELECT 
  user_id,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT product_id) as products_viewed,
  COUNT(*) FILTER (WHERE event_type = 'article_click') as articles_clicked,
  COUNT(*) FILTER (WHERE event_type = 'purchase_click') as purchase_attempts,
  COUNT(*) FILTER (WHERE event_type = 'purchase_complete') as purchases_completed,
  MAX(created_at) as last_interaction
FROM supplement_interactions
GROUP BY user_id;

-- Comentários
COMMENT ON TABLE supplement_interactions IS 'Tracking de interações do usuário com suplementos para analytics e otimização';
COMMENT ON VIEW supplement_conversion_stats IS 'Estatísticas de conversão por produto';
COMMENT ON VIEW user_supplement_engagement IS 'Engajamento do usuário com suplementos';
