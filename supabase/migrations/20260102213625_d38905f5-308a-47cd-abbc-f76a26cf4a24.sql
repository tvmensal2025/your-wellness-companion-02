-- Criar todas as tabelas faltantes com nomes em português - Parte 2

-- Table: dados_físicos_do_usuário
CREATE TABLE IF NOT EXISTS public.dados_físicos_do_usuário (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  altura_cm NUMERIC(5,2),
  peso_atual_kg NUMERIC(5,2),
  sexo TEXT CHECK (sexo IN ('masculino', 'feminino', 'outro')),
  data_nascimento DATE,
  tipo_sanguineo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dados_físicos_do_usuário ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own physical data" ON public.dados_físicos_do_usuário
  FOR ALL USING (auth.uid() = user_id);

-- Table: pontos_do_usuário
CREATE TABLE IF NOT EXISTS public.pontos_do_usuário (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_pontos INTEGER DEFAULT 0,
  nivel_atual INTEGER DEFAULT 1,
  experiencia_atual INTEGER DEFAULT 0,
  experiencia_proximo_nivel INTEGER DEFAULT 100,
  pontos_semana INTEGER DEFAULT 0,
  pontos_mes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pontos_do_usuário ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points" ON public.pontos_do_usuário
  FOR ALL USING (auth.uid() = user_id);

-- Table: reações_feed_de_saúde
CREATE TABLE IF NOT EXISTS public.reações_feed_de_saúde (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_reacao TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reações_feed_de_saúde ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reactions" ON public.reações_feed_de_saúde
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reacoes_post_id ON public.reações_feed_de_saúde(post_id);
CREATE INDEX IF NOT EXISTS idx_reacoes_user_id ON public.reações_feed_de_saúde(user_id);

-- Table: medidas_de_peso
CREATE TABLE IF NOT EXISTS public.medidas_de_peso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_medicao DATE NOT NULL DEFAULT CURRENT_DATE,
  peso_kg NUMERIC(5,2),
  altura_cm NUMERIC(5,2),
  imc NUMERIC(4,2),
  gordura_corporal_percentual NUMERIC(4,2),
  massa_muscular_kg NUMERIC(5,2),
  massa_ossea_kg NUMERIC(4,2),
  agua_corporal_percentual NUMERIC(4,2),
  gordura_visceral INTEGER,
  taxa_metabolica_basal INTEGER,
  idade_metabolica INTEGER,
  circunferencia_cintura_cm NUMERIC(5,2),
  circunferencia_quadril_cm NUMERIC(5,2),
  circunferencia_abdominal_cm NUMERIC(5,2),
  circunferencia_braco_cm NUMERIC(5,2),
  circunferencia_coxa_cm NUMERIC(5,2),
  circunferencia_panturrilha_cm NUMERIC(5,2),
  dobra_triceps_mm NUMERIC(4,1),
  dobra_biceps_mm NUMERIC(4,1),
  dobra_subescapular_mm NUMERIC(4,1),
  dobra_suprailiaca_mm NUMERIC(4,1),
  pressao_sistolica INTEGER,
  pressao_diastolica INTEGER,
  risco_cardiometabolico TEXT,
  tipo_dispositivo TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medidas_de_peso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own weight measures" ON public.medidas_de_peso
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_medidas_peso_user_id ON public.medidas_de_peso(user_id);
CREATE INDEX IF NOT EXISTS idx_medidas_peso_data ON public.medidas_de_peso(data_medicao);