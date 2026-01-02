-- Criar todas as tabelas faltantes com nomes em português - Parte 6

-- Table: registros_diários_de_desafio
CREATE TABLE IF NOT EXISTS public.registros_diários_de_desafio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participacao_id UUID NOT NULL,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_registrado TEXT,
  valor_numerico NUMERIC,
  completado BOOLEAN DEFAULT false,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.registros_diários_de_desafio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their challenge daily records" ON public.registros_diários_de_desafio
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.challenge_participations 
      WHERE id = registros_diários_de_desafio.participacao_id 
      AND user_id = auth.uid()
    )
  );

-- Table: sugestões_nutracêuticas_do_usuário
CREATE TABLE IF NOT EXISTS public.sugestões_nutracêuticas_do_usuário (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_suplemento TEXT NOT NULL,
  dosagem TEXT,
  frequencia TEXT,
  objetivo TEXT,
  condicao_alvo TEXT,
  beneficios_esperados TEXT[],
  contraindicacoes TEXT[],
  interacoes_medicamentosas TEXT[],
  duracao_sugerida TEXT,
  prioridade TEXT DEFAULT 'media',
  evidencia_cientifica TEXT,
  status_sugestao TEXT DEFAULT 'pendente',
  data_inicio_sugerida DATE,
  data_revisao DATE,
  notas TEXT,
  created_by TEXT,
  criado_por_ia BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sugestões_nutracêuticas_do_usuário ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nutraceutical suggestions" ON public.sugestões_nutracêuticas_do_usuário
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sugestoes_nutra_user_id ON public.sugestões_nutracêuticas_do_usuário(user_id);

-- Table: lições
CREATE TABLE IF NOT EXISTS public.lições (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID,
  modulo_id UUID,
  titulo TEXT NOT NULL,
  descricao TEXT,
  conteudo TEXT,
  tipo_licao TEXT DEFAULT 'video',
  url_video TEXT,
  url_thumbnail TEXT,
  duracao_minutos INTEGER,
  ordem_index INTEGER NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  prerequisitos TEXT[],
  recursos JSONB DEFAULT '[]',
  questoes_quiz JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lições ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view published lessons" ON public.lições
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_licoes_curso_id ON public.lições(curso_id);
CREATE INDEX IF NOT EXISTS idx_licoes_modulo_id ON public.lições(modulo_id);