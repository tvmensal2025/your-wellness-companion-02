-- Tabela de cache para análises de imagem
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_hash TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('food', 'medical', 'image_type')),
  result JSONB NOT NULL,
  model_used TEXT,
  processing_time_ms INTEGER,
  yolo_confidence FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  hits INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  UNIQUE(image_hash, analysis_type)
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_analysis_cache_hash ON analysis_cache(image_hash);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_type ON analysis_cache(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_created ON analysis_cache(created_at);

-- RLS policies
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;

-- Cache é acessível publicamente (não contém dados sensíveis do usuário)
CREATE POLICY "Cache is readable by all" ON analysis_cache FOR SELECT USING (true);
CREATE POLICY "Cache is insertable by authenticated" ON analysis_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Cache is updatable by all" ON analysis_cache FOR UPDATE USING (true);

-- Função para limpar cache antigo (mais de 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_analysis_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analysis_cache WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;