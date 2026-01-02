-- Criar todas as tabelas faltantes com nomes em português - Parte 3

-- Table: notificações_enviadas
CREATE TABLE IF NOT EXISTS public.notificações_enviadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_notificacao TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMPTZ,
  prioridade TEXT DEFAULT 'normal',
  acao_url TEXT,
  metadata JSONB,
  canal TEXT DEFAULT 'app',
  status_envio TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notificações_enviadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notificações_enviadas
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificações_enviadas(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificações_enviadas(lida);

-- Table: receitas_terapeuticas
CREATE TABLE IF NOT EXISTS public.receitas_terapeuticas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_receita TEXT NOT NULL,
  descricao TEXT,
  condicao_alvo TEXT,
  ingredientes JSONB NOT NULL DEFAULT '[]',
  modo_preparo TEXT,
  tempo_preparo_minutos INTEGER,
  porcoes INTEGER DEFAULT 1,
  calorias_por_porcao NUMERIC,
  beneficios_terapeuticos TEXT[],
  contraindicacoes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.receitas_terapeuticas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view therapeutic recipes" ON public.receitas_terapeuticas
  FOR SELECT USING (true);

-- Table: respostas_do_sabotador
CREATE TABLE IF NOT EXISTS public.respostas_do_sabotador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avaliacao_id UUID,
  questao_id TEXT,
  resposta TEXT,
  pontuacao INTEGER,
  sabotador_identificado TEXT,
  intensidade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.respostas_do_sabotador ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saboteur responses" ON public.respostas_do_sabotador
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_respostas_sabotador_user_id ON public.respostas_do_sabotador(user_id);

-- Table: saude_especifica
CREATE TABLE IF NOT EXISTS public.saude_especifica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condicao TEXT NOT NULL,
  diagnostico_confirmado BOOLEAN DEFAULT false,
  data_diagnostico DATE,
  gravidade TEXT,
  tratamento_atual TEXT,
  medicamentos TEXT[],
  restricoes_alimentares TEXT[],
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saude_especifica ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own specific health" ON public.saude_especifica
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saude_especifica_user_id ON public.saude_especifica(user_id);