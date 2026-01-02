-- Criar todas as tabelas faltantes com nomes em português - Parte 8

-- Table: comidas_favoritas_do_usuário
CREATE TABLE IF NOT EXISTS public.comidas_favoritas_do_usuário (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alimento_nome TEXT NOT NULL,
  categoria TEXT,
  frequencia_consumo TEXT,
  nivel_preferencia INTEGER CHECK (nivel_preferencia BETWEEN 1 AND 5),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comidas_favoritas_do_usuário ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their favorite foods" ON public.comidas_favoritas_do_usuário
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comidas_favoritas_user_id ON public.comidas_favoritas_do_usuário(user_id);

-- Table: análise_estatísticas
CREATE TABLE IF NOT EXISTS public.análise_estatísticas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  periodo TEXT NOT NULL,
  metricas JSONB NOT NULL,
  tendencias JSONB,
  insights TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.análise_estatísticas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own statistical analysis" ON public.análise_estatísticas
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_analise_stats_user_id ON public.análise_estatísticas(user_id);

-- Table: sabotadores_personalizados
CREATE TABLE IF NOT EXISTS public.sabotadores_personalizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_sabotador TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  padroes_mentais TEXT[],
  padroes_comportamentais TEXT[],
  sintomas_fisicos TEXT[],
  gatilhos_comuns TEXT[],
  estrategias_enfrentamento TEXT[],
  sabotadores_relacionados TEXT[],
  niveis_gravidade JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sabotadores_personalizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active custom saboteurs" ON public.sabotadores_personalizados
  FOR SELECT USING (is_active = true);

-- Table: missões_diárias
CREATE TABLE IF NOT EXISTS public.missões_diárias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  tipo_missao TEXT,
  dificuldade TEXT DEFAULT 'facil',
  pontos_recompensa INTEGER DEFAULT 10,
  xp_recompensa INTEGER DEFAULT 5,
  icone TEXT,
  cor TEXT,
  objetivo_valor NUMERIC,
  objetivo_unidade TEXT,
  is_diaria BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.missões_diárias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active daily missions" ON public.missões_diárias
  FOR SELECT USING (is_active = true);

-- Table: informações_economicas
CREATE TABLE IF NOT EXISTS public.informações_economicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alimento_nome TEXT,
  preco_medio NUMERIC,
  faixa_preco_min NUMERIC,
  faixa_preco_max NUMERIC,
  moeda TEXT DEFAULT 'BRL',
  regiao TEXT,
  disponibilidade TEXT,
  sazonalidade TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.informações_economicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view economic information" ON public.informações_economicas
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_info_economicas_alimento ON public.informações_economicas(alimento_nome);