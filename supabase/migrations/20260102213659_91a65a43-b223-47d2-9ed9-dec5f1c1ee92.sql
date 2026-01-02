-- Criar todas as tabelas faltantes com nomes em português - Parte 5

-- Table: alimentos_principios_ativos
CREATE TABLE IF NOT EXISTS public.alimentos_principios_ativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alimento_id UUID,
  alimento_nome TEXT,
  principio_ativo TEXT NOT NULL,
  concentracao TEXT,
  unidade_medida TEXT,
  beneficios TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alimentos_principios_ativos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view food active principles" ON public.alimentos_principios_ativos
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_alimentos_principios_alimento ON public.alimentos_principios_ativos(alimento_nome);

-- Table: base_de_conhecimento_da_empresa
CREATE TABLE IF NOT EXISTS public.base_de_conhecimento_da_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT,
  titulo TEXT,
  conteudo TEXT,
  tags TEXT[],
  prioridade INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.base_de_conhecimento_da_empresa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view company knowledge base" ON public.base_de_conhecimento_da_empresa
  FOR SELECT USING (is_active = true);

-- Table: fatos_da_conversação
CREATE TABLE IF NOT EXISTS public.fatos_da_conversação (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conteudo_fato TEXT,
  tipo_fato TEXT,
  importancia INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  mensagem_origem_id UUID,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fatos_da_conversação ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversation facts" ON public.fatos_da_conversação
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fatos_conversacao_user_id ON public.fatos_da_conversação(user_id);

-- Table: membros_do_grupo_feed_de_saúde
CREATE TABLE IF NOT EXISTS public.membros_do_grupo_feed_de_saúde (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  papel TEXT DEFAULT 'membro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.membros_do_grupo_feed_de_saúde ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their group memberships" ON public.membros_do_grupo_feed_de_saúde
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_membros_grupo_user_id ON public.membros_do_grupo_feed_de_saúde(user_id);
CREATE INDEX IF NOT EXISTS idx_membros_grupo_grupo_id ON public.membros_do_grupo_feed_de_saúde(grupo_id);

-- View: v_user_conversation_summary
CREATE OR REPLACE VIEW public.v_user_conversation_summary AS
SELECT 
  user_id,
  COUNT(*) as total_conversas,
  MAX(created_at) as ultima_conversa,
  AVG(CASE WHEN sentiment_score IS NOT NULL THEN sentiment_score ELSE 0 END) as sentimento_medio,
  array_agg(DISTINCT conversation_id) as conversas_ids
FROM public.chat_emotional_analysis
GROUP BY user_id;