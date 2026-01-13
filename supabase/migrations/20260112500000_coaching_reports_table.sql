-- =====================================================
-- TABELA: coaching_reports
-- Armazena relatórios de coaching gerados por IA
-- =====================================================

-- Criar tabela de relatórios de coaching
CREATE TABLE IF NOT EXISTS public.coaching_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint única para evitar duplicatas
  CONSTRAINT coaching_reports_user_session_unique UNIQUE (user_id, session_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_coaching_reports_user_id ON public.coaching_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_reports_session_id ON public.coaching_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_coaching_reports_created_at ON public.coaching_reports(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_coaching_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_coaching_reports_updated_at ON public.coaching_reports;
CREATE TRIGGER trigger_coaching_reports_updated_at
  BEFORE UPDATE ON public.coaching_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_coaching_reports_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.coaching_reports ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas seus próprios relatórios
DROP POLICY IF EXISTS "Users can view own coaching reports" ON public.coaching_reports;
CREATE POLICY "Users can view own coaching reports"
  ON public.coaching_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: service role pode inserir/atualizar (edge functions)
DROP POLICY IF EXISTS "Service role can manage coaching reports" ON public.coaching_reports;
CREATE POLICY "Service role can manage coaching reports"
  ON public.coaching_reports
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comentários
COMMENT ON TABLE public.coaching_reports IS 'Relatórios de coaching gerados por IA após conclusão de sessões';
COMMENT ON COLUMN public.coaching_reports.report_data IS 'JSON com análise completa: score, insights, recomendações, etc.';

-- Grant permissions
GRANT SELECT ON public.coaching_reports TO authenticated;
GRANT ALL ON public.coaching_reports TO service_role;
