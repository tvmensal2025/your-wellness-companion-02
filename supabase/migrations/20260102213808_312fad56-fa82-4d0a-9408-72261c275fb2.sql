-- Criar todas as tabelas faltantes com nomes em português - Parte 10 (Final)

-- Table: configurações_ai
CREATE TABLE IF NOT EXISTS public.configurações_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionalidade TEXT NOT NULL,
  servico TEXT NOT NULL DEFAULT 'gemini',
  modelo TEXT NOT NULL DEFAULT 'gemini-pro',
  max_tokens INTEGER NOT NULL DEFAULT 4096,
  temperatura NUMERIC NOT NULL DEFAULT 0.8,
  nivel TEXT DEFAULT 'medio',
  personalidade TEXT DEFAULT 'drvital',
  system_prompt TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  custo_por_requisicao NUMERIC DEFAULT 0.01,
  prioridade INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.configurações_ai ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view ai configurations" ON public.configurações_ai
  FOR SELECT USING (true);

-- Table: resumo_nutricional_diário
CREATE TABLE IF NOT EXISTS public.resumo_nutricional_diário (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  total_calorias NUMERIC,
  total_proteinas NUMERIC,
  total_carboidratos NUMERIC,
  total_gorduras NUMERIC,
  total_fibras NUMERIC,
  total_agua_ml INTEGER,
  calorias_cafe NUMERIC,
  calorias_almoco NUMERIC,
  calorias_jantar NUMERIC,
  calorias_lanches NUMERIC,
  metas_atingidas BOOLEAN DEFAULT false,
  score_saude INTEGER,
  aderencia_plano_percentual NUMERIC,
  quantidade_refeicoes INTEGER DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resumo_nutricional_diário ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily nutrition summary" ON public.resumo_nutricional_diário
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resumo_nutri_user_id ON public.resumo_nutricional_diário(user_id);
CREATE INDEX IF NOT EXISTS idx_resumo_nutri_data ON public.resumo_nutricional_diário(data);

-- Table: base_de_conhecimento_sofia
CREATE TABLE IF NOT EXISTS public.base_de_conhecimento_sofia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  topico TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tags TEXT[],
  relevancia INTEGER DEFAULT 5,
  fonte TEXT,
  referencias TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.base_de_conhecimento_sofia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view sofia knowledge base" ON public.base_de_conhecimento_sofia
  FOR SELECT USING (is_active = true);

-- Table: memória_sofia
CREATE TABLE IF NOT EXISTS public.memória_sofia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_memoria TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  contexto JSONB,
  importancia INTEGER DEFAULT 5,
  frequencia_acesso INTEGER DEFAULT 0,
  ultimo_acesso TIMESTAMPTZ,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  expira_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.memória_sofia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage sofia memory" ON public.memória_sofia
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_memoria_sofia_user_id ON public.memória_sofia(user_id);
CREATE INDEX IF NOT EXISTS idx_memoria_sofia_tipo ON public.memória_sofia(tipo_memoria);

-- Table: suplementos_do_usuário
CREATE TABLE IF NOT EXISTS public.suplementos_do_usuário (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_suplemento TEXT NOT NULL,
  dosagem TEXT,
  frequencia TEXT,
  horario_tomada TEXT,
  objetivo TEXT,
  data_inicio DATE,
  data_fim DATE,
  is_ativo BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.suplementos_do_usuário ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own supplements" ON public.suplementos_do_usuário
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_suplementos_user_id ON public.suplementos_do_usuário(user_id);

-- View: v_ingestão_diária_de_macronutrientes
CREATE OR REPLACE VIEW public.v_ingestão_diária_de_macronutrientes AS
SELECT 
  user_id,
  data,
  SUM(total_proteinas) as proteinas_dia,
  SUM(total_carboidratos) as carboidratos_dia,
  SUM(total_gorduras) as gorduras_dia,
  SUM(total_calorias) as calorias_dia,
  SUM(total_fibras) as fibras_dia,
  SUM(total_agua_ml) as agua_ml_dia,
  AVG(score_saude) as score_medio,
  COUNT(*) as registros_dia
FROM public.resumo_nutricional_diário
GROUP BY user_id, data;