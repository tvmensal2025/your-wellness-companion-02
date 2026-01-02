-- Criar todas as tabelas faltantes com nomes em português - Parte 7

-- Table: documentos_médicos
CREATE TABLE IF NOT EXISTS public.documentos_médicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_documento DATE,
  arquivo_url TEXT,
  arquivo_nome TEXT,
  arquivo_tamanho INTEGER,
  tipo_mime TEXT,
  tags TEXT[],
  categoria TEXT,
  medico_responsavel TEXT,
  instituicao TEXT,
  resultado_geral TEXT,
  resultados_exames JSONB,
  analise_ia TEXT,
  analise_completa JSONB,
  prioridade TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'ativo',
  compartilhado_com TEXT[],
  notas_usuario TEXT,
  notas_profissional TEXT,
  data_proxima_revisao DATE,
  alertas TEXT[],
  metadata JSONB,
  processado BOOLEAN DEFAULT false,
  data_processamento TIMESTAMPTZ,
  versao_processamento TEXT,
  is_publico BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documentos_médicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own medical documents" ON public.documentos_médicos
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_docs_medicos_user_id ON public.documentos_médicos(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_medicos_tipo ON public.documentos_médicos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_docs_medicos_data ON public.documentos_médicos(data_documento);

-- Table: avaliações_sabotadores
CREATE TABLE IF NOT EXISTS public.avaliações_sabotadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_avaliacao DATE NOT NULL DEFAULT CURRENT_DATE,
  sabotadores_identificados JSONB,
  pontuacao_total INTEGER,
  nivel_intensidade TEXT,
  recomendacoes TEXT[],
  plano_acao TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.avaliações_sabotadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saboteur assessments" ON public.avaliações_sabotadores
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_sabotadores_user_id ON public.avaliações_sabotadores(user_id);

-- Table: desafios_esportivos
CREATE TABLE IF NOT EXISTS public.desafios_esportivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_desafio TEXT,
  esporte TEXT,
  nivel_dificuldade TEXT,
  duracao_dias INTEGER,
  meta_valor NUMERIC,
  meta_unidade TEXT,
  data_inicio DATE,
  data_fim DATE,
  pontos_recompensa INTEGER DEFAULT 100,
  badge_recompensa TEXT,
  regras TEXT,
  instrucoes TEXT,
  is_grupo BOOLEAN DEFAULT false,
  max_participantes INTEGER,
  criado_por UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.desafios_esportivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active sports challenges" ON public.desafios_esportivos
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_desafios_esportivos_tipo ON public.desafios_esportivos(tipo_desafio);