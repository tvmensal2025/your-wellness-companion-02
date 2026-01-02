-- Criar todas as tabelas faltantes com nomes em português - Parte 4

-- Table: conquistas_do_usuário
CREATE TABLE IF NOT EXISTS public.conquistas_do_usuário (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_conquista TEXT NOT NULL,
  descricao TEXT,
  tipo_conquista TEXT,
  icone_badge TEXT,
  data_desbloqueio TIMESTAMPTZ,
  progresso_atual INTEGER DEFAULT 0,
  progresso_total INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conquistas_do_usuário ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" ON public.conquistas_do_usuário
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conquistas_user_id ON public.conquistas_do_usuário(user_id);

-- Table: backups_anamnese_do_usuário
CREATE TABLE IF NOT EXISTS public.backups_anamnese_do_usuário (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dados_backup JSONB NOT NULL,
  versao_backup TEXT,
  motivo_backup TEXT,
  data_backup TIMESTAMPTZ DEFAULT NOW(),
  restaurado BOOLEAN DEFAULT false,
  data_restauracao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.backups_anamnese_do_usuário ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own anamnesis backups" ON public.backups_anamnese_do_usuário
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_backups_anamnese_user_id ON public.backups_anamnese_do_usuário(user_id);

-- Table: pontuações_do_usuário
CREATE TABLE IF NOT EXISTS public.pontuações_do_usuário (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  pontuacao NUMERIC NOT NULL,
  pontuacao_maxima NUMERIC DEFAULT 100,
  data_avaliacao DATE NOT NULL DEFAULT CURRENT_DATE,
  detalhes JSONB,
  tendencia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pontuações_do_usuário ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scores" ON public.pontuações_do_usuário
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pontuacoes_user_id ON public.pontuações_do_usuário(user_id);

-- Table: combinacoes_ideais
CREATE TABLE IF NOT EXISTS public.combinacoes_ideais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alimento_principal TEXT NOT NULL,
  alimento_combinado TEXT NOT NULL,
  beneficio TEXT,
  sinergia_nutricional TEXT,
  potencializacao_percentual NUMERIC,
  categoria_combinacao TEXT,
  referencias_cientificas TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.combinacoes_ideais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view ideal combinations" ON public.combinacoes_ideais
  FOR SELECT USING (true);

-- Table: alimentos_alias
CREATE TABLE IF NOT EXISTS public.alimentos_alias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alimento_id UUID,
  nome_alias TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alimentos_alias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view food aliases" ON public.alimentos_alias
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_alimentos_alias_nome ON public.alimentos_alias(nome_alias);