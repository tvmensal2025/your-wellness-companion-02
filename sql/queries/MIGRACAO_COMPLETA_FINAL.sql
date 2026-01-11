-- ==============================================================================
-- MIGRAÇÃO MESTRE COMPLETA - NEMA'S WAY (CORRIGIDA v4 - DEFINITIVA)
-- Data: 23/11/2025
-- Conteúdo: Correção de Colunas (Image URL), Array Vazio, Marca e Estrutura
-- ==============================================================================

BEGIN;

-- 1. ESTRUTURA DE BANCO DE DADOS
-- ==============================================================================

-- Garantir que a tabela supplements existe
CREATE TABLE IF NOT EXISTS public.supplements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garantir que todas as colunas necessárias existem na tabela supplements
DO $$
BEGIN
    -- Adicionar external_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'external_id') THEN
        ALTER TABLE public.supplements ADD COLUMN external_id TEXT UNIQUE;
    END IF;

    -- Adicionar outras colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'brand') THEN
        ALTER TABLE public.supplements ADD COLUMN brand TEXT DEFAULT 'Nema''s Way';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'category') THEN
        ALTER TABLE public.supplements ADD COLUMN category TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'active_ingredients') THEN
        ALTER TABLE public.supplements ADD COLUMN active_ingredients TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'recommended_dosage') THEN
        ALTER TABLE public.supplements ADD COLUMN recommended_dosage TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'benefits') THEN
        ALTER TABLE public.supplements ADD COLUMN benefits TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'contraindications') THEN
        ALTER TABLE public.supplements ADD COLUMN contraindications TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'description') THEN
        ALTER TABLE public.supplements ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'original_price') THEN
        ALTER TABLE public.supplements ADD COLUMN original_price DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'discount_price') THEN
        ALTER TABLE public.supplements ADD COLUMN discount_price DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'stock_quantity') THEN
        ALTER TABLE public.supplements ADD COLUMN stock_quantity INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'is_approved') THEN
        ALTER TABLE public.supplements ADD COLUMN is_approved BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'image_url') THEN
        ALTER TABLE public.supplements ADD COLUMN image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'tags') THEN
        ALTER TABLE public.supplements ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- FORÇAR ATUALIZAÇÃO DE MARCA PARA TUDO QUE JÁ EXISTE
UPDATE public.supplements SET brand = 'Nema''s Way';

-- Tabela de Condições de Saúde
CREATE TABLE IF NOT EXISTS public.health_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT,
    color_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Protocolos
CREATE TABLE IF NOT EXISTS public.supplement_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    health_condition_id UUID REFERENCES public.health_conditions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_days INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(health_condition_id, name)
);

-- Tabela de Horários de Uso
CREATE TABLE IF NOT EXISTS public.usage_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    time_of_day TIME,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Associação Produto-Protocolo
CREATE TABLE IF NOT EXISTS public.protocol_supplements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES public.supplement_protocols(id) ON DELETE CASCADE,
    supplement_id UUID NOT NULL REFERENCES public.supplements(id) ON DELETE CASCADE,
    usage_time_id UUID NOT NULL REFERENCES public.usage_times(id),
    dosage TEXT NOT NULL,
    notes TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(protocol_id, supplement_id, usage_time_id)
);

-- 2. TRIGGERS E AUTOMAÇÃO (50% DESCONTO E UPDATED_AT)
-- ==============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular 50% de desconto
CREATE OR REPLACE FUNCTION public.calculate_discount_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.original_price IS NOT NULL THEN
    NEW.discount_price := ROUND(NEW.original_price * 0.5, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar Triggers
DROP TRIGGER IF EXISTS trigger_calculate_discount_price ON public.supplements;
CREATE TRIGGER trigger_calculate_discount_price
  BEFORE INSERT OR UPDATE OF original_price ON public.supplements
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_discount_price();

DROP TRIGGER IF EXISTS trigger_update_supplements_updated_at ON public.supplements;
CREATE TRIGGER trigger_update_supplements_updated_at
  BEFORE UPDATE ON public.supplements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. ÍNDICES E SEGURANÇA (RLS)
-- ==============================================================================

-- Índices
CREATE INDEX IF NOT EXISTS idx_supplements_category ON public.supplements(category);
CREATE INDEX IF NOT EXISTS idx_supplements_brand ON public.supplements(brand);
CREATE INDEX IF NOT EXISTS idx_protocols_condition ON public.supplement_protocols(health_condition_id);
CREATE INDEX IF NOT EXISTS idx_protocol_supplements_protocol ON public.protocol_supplements(protocol_id);

-- RLS (Habilitar Segurança)
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_supplements ENABLE ROW LEVEL SECURITY;

-- Políticas (Recriar para garantir permissões corretas)
DROP POLICY IF EXISTS "Public Read Supplements" ON public.supplements;
DROP POLICY IF EXISTS "Admin Write Supplements" ON public.supplements;
DROP POLICY IF EXISTS "Allow public read access" ON public.supplements;
DROP POLICY IF EXISTS "Allow authenticated insert/update" ON public.supplements;

CREATE POLICY "Public Read Supplements" ON public.supplements FOR SELECT USING (true);
CREATE POLICY "Admin Write Supplements" ON public.supplements FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Conditions" ON public.health_conditions;
DROP POLICY IF EXISTS "Admin Write Conditions" ON public.health_conditions;
CREATE POLICY "Public Read Conditions" ON public.health_conditions FOR SELECT USING (true);
CREATE POLICY "Admin Write Conditions" ON public.health_conditions FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Protocols" ON public.supplement_protocols;
DROP POLICY IF EXISTS "Admin Write Protocols" ON public.supplement_protocols;
CREATE POLICY "Public Read Protocols" ON public.supplement_protocols FOR SELECT USING (true);
CREATE POLICY "Admin Write Protocols" ON public.supplement_protocols FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read UsageTimes" ON public.usage_times;
DROP POLICY IF EXISTS "Admin Write UsageTimes" ON public.usage_times;
CREATE POLICY "Public Read UsageTimes" ON public.usage_times FOR SELECT USING (true);
CREATE POLICY "Admin Write UsageTimes" ON public.usage_times FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read ProtoSupplements" ON public.protocol_supplements;
DROP POLICY IF EXISTS "Admin Write ProtoSupplements" ON public.protocol_supplements;
CREATE POLICY "Public Read ProtoSupplements" ON public.protocol_supplements FOR SELECT USING (true);
CREATE POLICY "Admin Write ProtoSupplements" ON public.protocol_supplements FOR ALL USING (auth.role() = 'authenticated');


-- 4. INSERÇÃO DE DADOS DE REFERÊNCIA (HORÁRIOS E CONDIÇÕES)
-- ==============================================================================

INSERT INTO public.usage_times (code, name, time_of_day, display_order) VALUES
  ('EM_JEJUM', 'Em Jejum', '07:00:00', 1),
  ('APOS_CAFE_MANHA', 'Após o Café da Manhã', '08:00:00', 2),
  ('AS_10H_MANHA', 'Às 10h da Manhã', '10:00:00', 3),
  ('30MIN_ANTES_ALMOCO', '30 Minutos Antes do Almoço', '11:30:00', 4),
  ('APOS_ALMOCO', 'Após o Almoço', '13:00:00', 5),
  ('AS_18H_NOITE', 'Às 18h da Noite', '18:00:00', 6),
  ('30MIN_ANTES_JANTAR', '30 Minutos Antes do Jantar', '18:30:00', 7),
  ('30MIN_APOS_JANTAR', '30 Minutos Após o Jantar', '20:30:00', 8),
  ('ANTES_DORMIR', 'Antes de Dormir', '22:00:00', 9),
  ('USO_DIARIO', 'Uso Diário', NULL, 10),
  ('ANTES_EXERCICIOS', 'Antes dos Exercícios', NULL, 11),
  ('APOS_EXERCICIOS', 'Após os Exercícios', NULL, 12)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.health_conditions (name, description, icon_name, color_code) VALUES
  ('Ansiedade', 'Protocolo para redução de ansiedade e estresse', 'brain', '#8B5CF6'),
  ('Diabetes', 'Protocolo para controle glicêmico e diabetes', 'activity', '#EF4444'),
  ('Fibromialgia e Enxaqueca', 'Protocolo para dores crônicas e enxaquecas', 'heart', '#F59E0B'),
  ('Insônia', 'Protocolo para melhora do sono', 'moon', '#6366F1'),
  ('Alzheimer e Memória', 'Protocolo para saúde cognitiva', 'brain', '#10B981'),
  ('Candidíase', 'Protocolo para tratamento de candidíase', 'shield', '#EC4899'),
  ('Saúde Íntima', 'Protocolo para saúde íntima feminina', 'heart', '#F472B6'),
  ('Menopausa', 'Protocolo para sintomas da menopausa', 'flower', '#A855F7'),
  ('Emagrecimento', 'Protocolo para perda de peso', 'trending-down', '#14B8A6'),
  ('Hipertensão', 'Protocolo para controle de pressão arterial', 'activity', '#F97316'),
  ('Saúde Cardiovascular', 'Protocolo para saúde do coração', 'heart', '#DC2626'),
  ('Saúde Intestinal', 'Protocolo para saúde digestiva', 'stomach', '#059669'),
  ('Saúde Ocular', 'Protocolo para saúde dos olhos', 'eye', '#0284C7'),
  ('Saúde da Pele', 'Protocolo para saúde e beleza da pele', 'sparkles', '#F59E0B'),
  ('Saúde do Homem', 'Protocolo específico para saúde masculina', 'user', '#3B82F6'),
  ('Saúde da Mulher', 'Protocolo específico para saúde feminina', 'heart', '#EC4899'),
  ('Desintoxicação', 'Protocolo para desintoxicação do organismo', 'zap', '#10B981'),
  ('Sono e Estresse', 'Protocolo para qualidade do sono e redução de estresse', 'moon', '#6366F1'),
  ('Performance e Energia', 'Protocolo para aumento de energia e performance', 'zap', '#F59E0B'),
  ('Imunidade', 'Protocolo para fortalecimento do sistema imunológico', 'shield', '#10B981')
ON CONFLICT (name) DO UPDATE SET updated_at = NOW();


-- 5. INSERÇÃO DOS PRODUTOS (CATÁLOGO COMPLETO)
-- ==============================================================================

-- OBS: Adicionada coluna image_url ao cabeçalho e NULL em todas as tuplas
INSERT INTO public.supplements (external_id, name, brand, category, active_ingredients, recommended_dosage, benefits, contraindications, description, original_price, discount_price, stock_quantity, is_approved, image_url, tags)
VALUES
  -- Adicionando 'OZONIO' (Cápsulas) manualmente para compatibilidade com protocolos
  ('OZONIO', 'Ozônio em Cápsulas', 'Nema''s Way', 'desintoxicacao', ARRAY['Óleo de Girassol Ozonizado'], '2 cápsulas ao dia', ARRAY['Ação anti-inflamatória', 'Melhora oxigenação celular', 'Antioxidante'], ARRAY['Gravidez'], 'Cápsulas de óleo ozonizado para saúde celular.', 149.90, 74.95, 100, true, NULL, ARRAY['ozonio', 'capsulas']),

  ('SOS_UNHAS', 'SOS UNHAS', 'Nema''s Way', 'beleza', ARRAY['Óleo de Girassol Ozonizado'], 'Aplicar sobre unhas limpas e secas', ARRAY['Fortalece unhas frágeis e quebradiças', 'Combate fungos e previne infecções', 'Estimula crescimento saudável', 'Protege e nutre com óleo ozonizado'], ARRAY[]::TEXT[], 'Base fortalecedora e antifúngica ozonizada. O poder do ozônio unido ao mix de vitaminas para suas unhas!', 49.90, 24.95, 200, true, NULL, ARRAY['unhas', 'fortalecedor', 'antifungico', 'ozonizado']),
  
  ('COLAGENO_ACIDO_HIALURONICO', 'Colágeno com Ácido Hialurônico', 'Nema''s Way', 'beleza', ARRAY['Colágeno Verisol', 'Ácido Hialurônico', 'Vitamina C', 'Biotina'], '2 scoops com água pela manhã', ARRAY['Melhora elasticidade e firmeza da pele', 'Hidratação profunda da pele', 'Fortalecimento de unhas e cabelos', 'Ação antioxidante', 'Saúde das articulações'], ARRAY[]::TEXT[], 'Colágeno Verisol com Ácido Hialurônico, Vitamina C e Biotina. Sabor Frutas Vermelhas. Zero açúcares. 200g rende 20 porções.', 299.90, 149.95, 150, true, NULL, ARRAY['colageno', 'acido_hialuronico', 'pele', 'articulacoes', 'verisol']),
  
  ('BVB_CALCIO', 'BVB Cálcio Concha Ostra', 'Nema''s Way', 'minerais', ARRAY['Cálcio de Concha de Ostra 600mg'], '2 cápsulas antes de dormir', ARRAY['Fortalecimento ósseo', 'Coagulação sanguínea adequada', 'Suporte muscular', 'Sistema nervoso equilibrado', 'Divisão celular', 'Energia celular'], ARRAY['Alergia a frutos do mar'], 'O único cálcio natural de concha de ostra que fortalece ossos, melhora função muscular e apoia saúde do sistema nervoso.', 99.90, 49.95, 180, true, NULL, ARRAY['calcio', 'ossos', 'concha_ostra', 'minerais']),
  
  ('LIPOWAY', 'Lipo Way', 'Nema''s Way', 'emagrecimento', ARRAY['Cafeína', 'Chá Verde', 'L-Carnitina'], '02 Cápsulas ao dia', ARRAY['Queima gordura e é termogênico', 'Fornece energia', 'Acelera metabolismo', 'Auxilia no ganho de massa magra'], ARRAY['Hipertensão', 'Insônia'], 'Transforme seu corpo com Lipoway. O segredo para queimar gordura, ganhar energia e acelerar o metabolismo. 60 cápsulas de 1.400mg.', 149.90, 74.95, 140, true, NULL, ARRAY['emagrecimento', 'termogenico', 'gordura', 'metabolismo']),
  
  ('BVB_SB', 'BVB SB', 'Nema''s Way', 'emagrecimento', ARRAY['Antioxidantes', 'Fibras', 'Nutrientes essenciais'], '2 cápsulas 30 minutos antes do almoço', ARRAY['Promove saciedade prolongada (controle apetite)', 'Reduz absorção de gorduras e carboidratos', 'Controle glicêmico e lipídico', 'Estimula metabolismo e queima de gordura', 'Ação antioxidante e anti-inflamatória', 'Favorece funcionamento intestinal', 'Suporte à saúde da pele, articulações e imunidade'], ARRAY[]::TEXT[], 'Queime gordura, domine seu metabolismo. Um verdadeiro escudo para imunidade, pele, articulações e bem-estar. 60 cápsulas de 600mg.', 149.90, 74.95, 160, true, NULL, ARRAY['emagrecimento', 'fibras', 'antioxidante', 'apetite']),
  
  ('WINNER_OLEO_PERNAS', 'Winner Óleo para Pernas Ozonizado', 'Nema''s Way', 'topico', ARRAY['Castanha da Índia', 'Óleo de Calêndula', 'Óleo de Amêndoas', 'Óleo Semente de Uva', 'Cânfora', 'Mentol'], 'Aplicar nas pernas com movimentos circulares. Diariamente após banho ou cansaço', ARRAY['Ativa circulação sanguínea', 'Alivia sensação de peso e cansaço', 'Devolve frescor imediato', 'Ação vasoprotetora', 'Favorece vitalidade das pernas'], ARRAY[]::TEXT[], 'O campeão voltou desde 1986. Formulado para oferecer alívio imediato e cuidado contínuo. 120ml.', 79.90, 39.95, 180, true, NULL, ARRAY['pernas', 'circulacao', 'ozonizado', 'topico']),
  
  ('VITAMINA_K2', 'Vitamina K2', 'Nema''s Way', 'vitaminas', ARRAY['Vitamina K2 (MK-7)'], '2 cápsulas na hora do almoço', ARRAY['Saúde óssea', 'Proteção cardiovascular', 'Sinergia com vitamina D3', 'Prevenção de osteoporose'], ARRAY[]::TEXT[], 'O GPS que o corpo precisa. A vitamina K2 direciona o cálcio para os ossos e impede acúmulo nas artérias. 60 cápsulas de 600mg.', 99.90, 49.95, 200, true, NULL, ARRAY['vitamina_k2', 'ossos', 'cardiovascular', 'calcio']),
  
  ('FRESH_GLOW_CREME', 'Fresh Glow Creme Corporal', 'Nema''s Way', 'beleza', ARRAY['Ozônio', 'Colágeno', 'Elastina'], 'Uso Diário', ARRAY['Ação purificadora e regenerativa', 'Prevenção do envelhecimento', 'Hidratação e maciez', 'Firmeza e elasticidade'], ARRAY[]::TEXT[], 'Combinação perfeita de ozônio, colágeno e elastina para firmeza, elasticidade e hidratação profunda. 200g.', 99.99, 49.99, 170, true, NULL, ARRAY['creme_corporal', 'ozonizado', 'colageno', 'elastina']),
  
  ('VITAMINA_C_400MG', 'Vitamina C', 'Nema''s Way', 'vitaminas', ARRAY['Ácido Ascórbico 400mg'], '01 Cápsula ao dia', ARRAY['Rejuvenescimento da pele', 'Promoção de longevidade', 'Reforço do sistema imunológico', 'Proteção contra radicais livres', 'Combate a vírus e bactérias'], ARRAY['Cálculos renais'], 'Segredo para rejuvenescimento, longevidade e imunidade. Mais longevidade para sua vida. 30 cápsulas de 400mg (250mg por cápsula).', 49.90, 24.95, 250, true, NULL, ARRAY['vitamina_c', 'antioxidante', 'imunidade', 'pele']),
  
  ('FRESH_GLOW_LOCAO', 'Fresh Glow Loção Adstringente', 'Nema''s Way', 'beleza', ARRAY['Alantoína', 'Aloe Vera', 'D-Pantenol', 'Ácido de Frutas', 'Vitamina E'], 'Uso Diário', ARRAY['Esfoliante natural (remove células mortas)', 'Aumenta elasticidade da pele', 'Propriedades calmantes', 'Limpa e tonifica profundamente'], ARRAY[]::TEXT[], 'Combina ativos potentes para limpar, purificar e tonificar profundamente a pele. Ozonizado. 250ml.', 99.90, 49.95, 160, true, NULL, ARRAY['adstringente', 'facial', 'ozonizado', 'esfoliante']),
  
  ('BVB_COLEST', 'BVB Colest', 'Nema''s Way', 'cardiovascular', ARRAY['Proantocianidinas de Cranberry'], '2 cápsulas na hora do almoço', ARRAY['Saúde do trato urinário (prevenção infecções)', 'Ação antioxidante', 'Auxílio na redução do colesterol ruim (LDL)', 'Apoio ao sistema imunológico', 'Manutenção da boa circulação'], ARRAY[]::TEXT[], 'Fonte de Proantocianidinas Cranberry. Contribui para proteção do trato urinário, equilíbrio do colesterol e saúde cardiovascular. 60 cápsulas de 600mg.', 129.90, 64.95, 150, true, NULL, ARRAY['cranberry', 'trato_urinario', 'colesterol', 'antioxidante']),
  
  ('FRESH_GLOW_SABONETE', 'Fresh Glow Sabonete Facial', 'Nema''s Way', 'higiene', ARRAY['Extrato de Kiwi', 'Ozônio', 'Aloe Vera'], 'Uso Diário', ARRAY['Limpeza profunda e revitalização', 'Ação purificadora e renovadora', 'Hidratação e suavização', 'Desobstrução dos poros', 'Combate radicais livres'], ARRAY[]::TEXT[], 'Fórmula enriquecida com extrato de kiwi, ozônio e aloe vera. Frescor e luminosidade em cada limpeza. Ozonizado. 200g.', 99.99, 49.99, 200, true, NULL, ARRAY['sabonete_facial', 'ozonizado', 'kiwi', 'aloe_vera']),
  
  ('BVB_D3K2', 'BVB D3K2', 'Nema''s Way', 'vitaminas', ARRAY['Vitamina D3', 'Vitamina K2'], '02 Cápsulas ao dia', ARRAY['Combate doenças autoimunes e do coração', 'Contribui para dentes saudáveis e previne calvície', 'Importante para coagulação sanguínea', 'Melhora função hormonal', 'Previne infarto'], ARRAY[]::TEXT[], 'A fórmula perfeita para sua saúde. Renova saúde, melhora imunidade e previne calvície. 60 cápsulas de 700mg.', 149.90, 74.95, 180, true, NULL, ARRAY['vitamina_d3', 'vitamina_k2', 'imunidade', 'calvicie']),
  
  ('SD_ARTRO', 'SD Artro', 'Nema''s Way', 'articulacoes', ARRAY['Magnésio', 'Extratos Anti-inflamatórios'], '02 Cápsulas ao dia', ARRAY['Previne contra trombose', 'Melhora a musculatura', 'Auxilia na redução de inflamações', 'Indicado para Artrite, Artrose e Dores nas Articulações'], ARRAY[]::TEXT[], 'Alívio nas articulações e força nos músculos. Vida sem dor. 60 cápsulas de 600mg.', 134.90, 67.45, 150, true, NULL, ARRAY['articulacoes', 'artrite', 'artrose', 'dor']),
  
  ('COLAGENO_TIPO_II', 'Colágeno Tipo II', 'Nema''s Way', 'articulacoes', ARRAY['Colágeno Tipo II', 'Vitamina E'], '01 comprimido ao dia', ARRAY['Melhora a musculatura', 'Auxilia na redução de inflamações', 'Melhora a saúde óssea', 'Auxilia no tratamento de lesões e cartilagens', 'Auxilia no tratamento de Artrite Reumatoide'], ARRAY['Alergia a proteínas'], 'Aumente a elasticidade das articulações. Fortalece músculos e ossos, reduz inflamações e trata lesões. 30 comprimidos de 500mg.', 119.90, 59.95, 120, true, NULL, ARRAY['colageno_tipo_ii', 'articulacoes', 'cartilagem', 'artrite']),
  
  ('OLEO_PRIMULA', 'Óleo de Prímula', 'Nema''s Way', 'saude_feminina', ARRAY['Óleo de Prímula 500mg'], '02 Cápsulas ao dia', ARRAY['Fortalece sistema imunológico', 'Auxilia na perda de peso', 'Combate má digestão', 'Promove saúde da pele'], ARRAY[]::TEXT[], 'Saúde para o corpo. Parceiro na busca por vida saudável. 60 cápsulas de 500mg.', 119.90, 59.95, 160, true, NULL, ARRAY['oleo_primula', 'feminino', 'hormonal', 'pele']),
  
  ('GOLD_MONEY', 'Gold Money', 'Nema''s Way', 'perfumaria', ARRAY[]::TEXT[], 'Uso pessoal', ARRAY['Fragrância masculina elegante'], ARRAY[]::TEXT[], 'Desafie as probabilidades. Supere os limites. Com Gold Money, você é invencível. Inspirado no Ferrari Black. 100ml.', 199.99, 99.99, 100, true, NULL, ARRAY['perfume', 'masculino', 'fragrancia']),
  
  ('LIBWAY', 'LibWay', 'Nema''s Way', 'saude_sexual', ARRAY['Boro', 'Aspartato', 'Arginina', 'Taurina'], '01 Cápsula ao dia', ARRAY['Aumento dos hormônios', 'Melhora do desempenho sexual', 'Contribui no aumento da libido'], ARRAY['Câncer de próstata'], 'Sua confiança de volta, sua potência garantida. 30 cápsulas soft gel de 760mg.', 149.90, 74.95, 130, true, NULL, ARRAY['libido', 'sexual', 'hormonal', 'vitalidade']),
  
  ('BVB_B12', 'BVB B12', 'Nema''s Way', 'vitaminas', ARRAY['Metilcobalamina 350mg'], '02 Cápsulas ao dia', ARRAY['Previne problemas cardíacos e derrame cerebral', 'Prevenção de doenças como Alzheimer', 'Melhor oxigenação no corpo', 'Produção de energia', 'Manutenção do sistema nervoso'], ARRAY['Alergia a cobalamina'], 'Energia para a mente e o corpo. Vital para saúde geral, produção de energia e manutenção do sistema nervoso. 60 cápsulas.', 149.90, 74.95, 220, true, NULL, ARRAY['b12', 'energia', 'memoria', 'neurologico']),
  
  ('BVB_INSU', 'BVB Insu', 'Nema''s Way', 'metabolismo', ARRAY['Berberina', 'Cromo', 'Ácido Alfa-Lipóico'], '02 Cápsulas ao dia', ARRAY['Diminui Colesterol "Ruim" (LDL) e Triglicerídeos', 'Auxilia no tratamento da Diabetes ou Resistência à Insulina', 'Diminui fome e compulsão alimentar por doces', 'Mantém saúde da pele e cabelos'], ARRAY['Gravidez', 'Lactação', 'Hipoglicemia'], 'Caminho para equilíbrio e bem-estar. Trata problemas como colesterol e diabetes. 60 cápsulas de 700mg.', 149.90, 74.95, 150, true, NULL, ARRAY['diabetes', 'colesterol', 'glicemia', 'insulina']),
  
  ('VITAMIX_SKIN', 'VitamixSkin', 'Nema''s Way', 'beleza', ARRAY['Vitaminas A, C, E', 'Zinco', 'Selênio'], '02 Cápsulas ao dia', ARRAY['Melhora elasticidade da pele', 'Reduz linhas de expressão', 'Regeneração das células'], ARRAY[]::TEXT[], 'Cuide da sua pele do jeito que ela merece. Mantém pele saudável, firme e protegida contra envelhecimento precoce. 60 cápsulas de 310mg.', 109.90, 54.95, 160, true, NULL, ARRAY['pele', 'vitaminas', 'antioxidante', 'elasticidade']),
  
  ('ACIDO_HIALURONICO_FITIOS', 'Ácido Hialurônico', 'Nema''s Way', 'beleza', ARRAY['Ácido Hialurônico', 'Vitamina B5', 'Vitamina C'], '01 Cápsula ao dia', ARRAY['Melhora elasticidade da pele', 'Reduz linhas de expressão', 'Regeneração das células', 'Combate flacidez'], ARRAY[]::TEXT[], 'Refaz o que o tempo desfaz! Diga adeus à flacidez e recupere elasticidade da pele. 30 comprimidos de 800mg.', 99.90, 49.95, 150, true, NULL, ARRAY['acido_hialuronico', 'pele', 'elasticidade', 'rugas']),
  
  ('OMEGA_3_1400MG', 'Ômega 3', 'Nema''s Way', 'cardiovascular', ARRAY['EPA 540mg', 'DHA 360mg'], '02 Cápsulas ao dia', ARRAY['Prevenção do Parkinson e Alzheimer', 'Auxilia na Depressão e Doenças Cardiovasculares', 'Controle da Pressão Arterial', 'Ação Anti-inflamatória e Efeito Antitrombótico'], ARRAY['Alergia a peixes', 'Uso de anticoagulantes'], 'Produto indicado para toda família. DHA 360 / EPA 540. 60 cápsulas de 1.400mg.', 129.99, 64.99, 200, true, NULL, ARRAY['omega3', 'cardiovascular', 'cerebro', 'antiinflamatorio']),
  
  ('VIP_GLAMOUR_KIT', 'VIP Glamour Kit', 'Nema''s Way', 'beleza', ARRAY['Ativos naturais'], 'Uso Diário', ARRAY['Sensação de bem-estar', 'Sensação refrescante', 'Charme e sofisticação'], ARRAY[]::TEXT[], 'Body Splash Corporal + Creme Corporal. Charme e sofisticação por onde passar. Inspirado no Vip Rose da Victoria''s Secret. 250ml cada.', 149.90, 74.95, 120, true, NULL, ARRAY['cosmetico', 'body_splash', 'creme', 'fragrancia']),
  
  ('FAIR_WAY', 'Fair Way Ozonizado', 'Nema''s Way', 'beleza', ARRAY['Ozônio', 'Colágeno', 'Elastina'], 'Uso Diário', ARRAY['Estimulação da circulação sanguínea', 'Ação antioxidante', 'Hidratação profunda', 'Combate flacidez'], ARRAY[]::TEXT[], 'Loção hidratante para o corpo. Combina poder do colágeno e elastina para pele mais firme, elástica e rejuvenescida. 200g.', 99.99, 49.99, 170, true, NULL, ARRAY['loção_corporal', 'ozonizado', 'colageno', 'elastina']),
  
  ('BVB_ZINCO_QUELATO', 'BVB Zinco Quelato', 'Nema''s Way', 'minerais', ARRAY['Zinco Quelato 600mg'], '2 cápsulas (1 hora antes café, 1 hora antes almoço)', ARRAY['Ação antioxidante', 'Saúde da pele, cabelo e unhas', 'Fortalecimento do sistema imunológico', 'Suporte à visão', 'Manutenção da saúde óssea', 'Metabolismo otimizado'], ARRAY[]::TEXT[], 'Sua imunidade merece mais. Forma de zinco de alta biodisponibilidade para máxima absorção. 60 cápsulas de 600mg.', 129.90, 64.95, 220, true, NULL, ARRAY['zinco', 'imunidade', 'pele', 'quelato']),
  
  ('AMARGO', 'Amargo', 'Nema''s Way', 'digestao', ARRAY['Extrato de Alcachofra', 'Quassia', 'Quina', 'Salsaparrilha', 'Camomila', 'Carqueja', 'Chá Verde', 'Hortelã', 'Berinjela'], '02 colheres de sopa ao dia', ARRAY['Promove organismo mais eficiente', 'Elimina azia e desconfortos digestivos', 'Ajuda a reduzir acúmulo de gordura no fígado', 'Contribui para perda de peso'], ARRAY[]::TEXT[], 'Ele é Amargo, mas é Bom! Transforme seu organismo em máquina funcional. Chá com Vegetal. 500ml.', 99.90, 49.95, 180, true, NULL, ARRAY['digestao', 'figado', 'amargo', 'bile']),
  
  ('TOP_SECRETS', 'TOP Secrets Creme Clareador', 'Nema''s Way', 'beleza', ARRAY['Pantenol', 'Extrato de Ylang Ylang', 'Rosa Mosqueta'], '02 aplicações ao dia', ARRAY['Clareamento da pele', 'Hidratação profunda', 'Efeito rejuvenescedor', 'Suporte na cicatrização e regeneração'], ARRAY[]::TEXT[], 'Segredo para pele mais clara e saudável. Para mãos e rosto. Ozonizado. 100g.', 99.90, 49.95, 150, true, NULL, ARRAY['clareador', 'pele', 'rosa_mosqueta', 'ozonizado']),
  
  ('PEELING_5X1', 'Peeling 5X1', 'Nema''s Way', 'beleza', ARRAY['Vitamina E', 'Ácidos de Frutas'], '03 aplicações durante a semana', ARRAY['Limpa, Tonifica, Amacia, Hidrata, Clareia', 'Prevenção de rugas', 'Remove células mortas', 'Ação antioxidante'], ARRAY[]::TEXT[], 'Corpo e Rosto. Sua pele incrivelmente renovada. Com Vitamina E. 145g.', 99.90, 49.95, 150, true, NULL, ARRAY['peeling', 'esfoliante', 'gomage', 'renovacao']),
  
  ('SEREMIX', 'Seremix', 'Nema''s Way', 'sono', ARRAY['L-Triptofano 500mg', 'Melatonina', 'Magnésio'], '02 Cápsulas ao dia', ARRAY['Promove relaxamento', 'Promove melhor qualidade de sono', 'Alivia estresse'], ARRAY['Gravidez', 'Lactação'], 'Aliado para melhor noite de sono. Suplemento revolucionário para equilíbrio do organismo e sono. 60 cápsulas de 500mg.', 149.90, 74.95, 200, true, NULL, ARRAY['sono', 'triptofano', 'relaxamento', 'ansiedade']),
  
  ('BVB_MORO', 'BVB Moro', 'Nema''s Way', 'emagrecimento', ARRAY['Extrato de Moro'], '2 cápsulas 30 minutos antes do almoço', ARRAY['Auxilia no controle e redução da gordura abdominal', 'Melhora metabolismo de carboidratos e lipídios', 'Regula glicemia e picos de insulina', 'Aumenta saciedade', 'Ação antioxidante (envelhecimento precoce)', 'Estimula corpo a usar gordura como energia'], ARRAY[]::TEXT[], 'Transforme seu metabolismo em máquina de queimar gorduras. Mais energia, mais foco, mais definição. 60 cápsulas de 600mg.', 129.90, 64.95, 140, true, NULL, ARRAY['emagrecimento', 'moro', 'metabolismo', 'gordura']),
  
  ('PROWOMAN', 'ProWoman', 'Nema''s Way', 'saude_feminina', ARRAY['Fitoestrógenos', 'Óleo de Prímula', 'Vitaminas do Complexo B'], '02 Cápsulas ao dia', ARRAY['Alivia sintomas da menopausa', 'Reduz risco de câncer de mama', 'Equilibra níveis hormonais'], ARRAY['Câncer hormônio-dependente'], 'Você Radiante e Forte Sempre. Suplemento especialmente formulado para necessidades das mulheres modernas. 60 cápsulas de 500mg.', 149.90, 74.95, 150, true, NULL, ARRAY['feminino', 'menopausa', 'hormonal', 'cancer']),
  
  ('SERUM_VITAMINA_C', 'Sérum Vitamina C Ozonizado', 'Nema''s Way', 'beleza', ARRAY['Vitamina C', 'Vitamina E', 'Ácido Hialurônico', 'Colágeno'], 'Uso diário', ARRAY['Neutraliza radicais livres', 'Reduz inflamação e acalma a pele', 'Clareia manchas escuras', 'Estimula produção de colágeno'], ARRAY[]::TEXT[], 'Para pele radiante e protegida todos os dias. Antioxidante poderoso que combate radicais livres e estimula colágeno. 20ml.', 119.99, 59.99, 140, true, NULL, ARRAY['serum', 'vitamina_c', 'ozonizado', 'pele']),
  
  ('ORGANIC_OZON3_ARGAN', 'Organic Ozon3 Óleo de Argan', 'Nema''s Way', 'beleza', ARRAY['Óleo de Argan', 'Ozônio', 'Ácidos Graxos', 'Vitamina E'], 'Uso Diário', ARRAY['Reparação de cabelos danificados', 'Hidratação profunda', 'Ação antioxidante'], ARRAY[]::TEXT[], 'Orgânico com Ozônio. Cuidado profundo, brilho intenso. Hidrata profundamente, restaura brilho e fortalece fios. 30ml.', 99.90, 49.95, 150, true, NULL, ARRAY['argan', 'cabelo', 'ozonizado', 'organico']),
  
  ('POLIVITAMIX', 'Polivitamix', 'Nema''s Way', 'vitaminas', ARRAY['Complexo A-Z de Vitaminas e Minerais', 'Ômega 3 (MEG-3)'], '02 Cápsulas ao dia', ARRAY['Fortalece Sistema Imunológico', 'Regula Metabolismo', 'Energia e Vitalidade (combate fadiga)', 'Saúde Óssea e Mental'], ARRAY['Hipervitaminose'], 'Agora com Ômega 3. Segredo para vida mais saudável e ativa. Fornece mais energia e saúde. 60 cápsulas de 700mg.', 109.90, 54.95, 200, true, NULL, ARRAY['multivitaminico', 'omega3', 'a-z', 'energia']),
  
  ('LIFE_WAY_GEL', 'Life Way Gel Massageador Ozonizado', 'Nema''s Way', 'topico', ARRAY['Mentol', 'Cânfora', 'Centella Asiática', 'Chá Verde', 'Alecrim', 'Óleo de Girassol Ozonizado'], 'Uso Diário', ARRAY['Alívio imediato de dores musculares', 'Sensação de relaxamento e bem-estar', 'Pele tonificada e suave', 'Alívio muscular'], ARRAY[]::TEXT[], 'Chega de conviver com dores. Promove frescor, relaxamento e cuidado com a pele, aliviando tensões musculares. 150g.', 139.90, 69.95, 160, true, NULL, ARRAY['gel_massageador', 'dor_muscular', 'ozonizado', 'relaxamento']),
  
  ('VISION_WAY', 'VisionWay', 'Nema''s Way', 'saude_ocular', ARRAY['Luteína', 'Zeaxantina', 'DHA', 'Óleo de Cártamo'], '01 Cápsula ao dia', ARRAY['Redução da síndrome de olho seco', 'Prevenção de inflamações oculares', 'Melhora da circulação ocular', 'Proteção contra luz azul e UV'], ARRAY[]::TEXT[], 'Proteção avançada, visão clara. Filtra luz azul e protege contra raios UV. 30 cápsulas soft gel de 750mg.', 149.90, 74.95, 100, true, NULL, ARRAY['visao', 'luteina', 'zeaxantina', 'olhos']),
  
  ('BVB_Q10', 'BVB Q10', 'Nema''s Way', 'energia', ARRAY['Coenzima Q10 700mg'], '01 Cápsula ao dia', ARRAY['Produção de energia', 'Contribui a melhorar fertilidade', 'Diminui chances de doenças cardiovasculares', 'Proteção antioxidante', 'Função neurológica'], ARRAY['Uso de varfarina'], 'Suporte completo para vida equilibrada. Essencial para produção de energia, saúde cardiovascular e proteção antioxidante. 30 cápsulas de 700mg.', 159.90, 79.95, 120, true, NULL, ARRAY['coq10', 'energia', 'cardiovascular', 'fertilidade']),
  
  ('SABONETE_INTIMO_SEDUCAO', 'Sabonete Íntimo Sedução', 'Nema''s Way', 'higiene', ARRAY['Morango', 'Malva', 'Barbatimão'], 'Uso diário', ARRAY['Mantém PH equilibrado', 'Estimula processo imunológico', 'Auxilia no processo da Candidíase', 'Previne doenças ginecológicas'], ARRAY[]::TEXT[], 'Nova fórmula. Sabonete íntimo incrível desenvolvido com cuidado que sua saúde íntima merece. pH neutro. 200ml.', 59.90, 29.95, 200, true, NULL, ARRAY['sabonete_intimo', 'feminino', 'ph', 'candidíase']),
  
  ('TENIS_BIOQUANTICO', 'Tênis Bioquântico', 'Nema''s Way', 'equipamento', ARRAY['Íons magnéticos', 'Infravermelho longo', 'Tecido inteligente'], 'Uso diário', ARRAY['Alivia dores na coluna', 'Correção de postura', 'Bem estar e conforto'], ARRAY[]::TEXT[], 'Caminhar com saúde, tecnologia e conforto. Íons magnéticos, infravermelho longo, palmilha que se ajusta. 1 par.', 1099.99, 549.99, 50, true, NULL, ARRAY['tenis', 'bioquantico', 'postura', 'coluna']),
  
  ('MELATONINA', 'Melatonina', 'Nema''s Way', 'sono', ARRAY['Melatonina'], '2 cápsulas 30 minutos antes de dormir', ARRAY['Auxilia no início do sono', 'Melhora qualidade do sono (ciclos completos)', 'Promove relaxamento físico e mental', 'Auxilia em quadros de insônia leve e jet lag', 'Contribui para equilíbrio hormonal'], ARRAY['Gravidez', 'Lactação', 'Doenças autoimunes'], 'Durma profundamente e acorde renovado. Aliado para noites completas e restauradoras. 60 cápsulas de 600mg.', 99.90, 49.95, 280, true, NULL, ARRAY['melatonina', 'sono', 'insonia', 'relaxamento']),
  
  ('CREATINA_Q10', 'Creatina com Coenzima Q10', 'Nema''s Way', 'performance', ARRAY['Creatina Monohidratada 3g', 'Coenzima Q10'], 'Diluir 3g (1 scoop) em 150ml de água', ARRAY['Mais energia e resistência física', 'Foco mental e desempenho cognitivo', 'Saúde do coração', 'Ação antioxidante e antienvelhecimento', 'Combate cansaço crônico'], ARRAY['Problemas renais'], 'Corpo em forma, mente em equilíbrio. Creatina 100% pura com Coenzima Q10. 300g.', 299.99, 149.99, 200, true, NULL, ARRAY['creatina', 'coq10', 'performance', 'energia']),
  
  ('KIT_ORGANIC_OZON3', 'Kit Organic Ozon3 Shampoo + Alinhamento', 'Nema''s Way', 'beleza', ARRAY['Óleo de Argan', 'Tanino', 'Ozônio'], 'Aplicar por profissional cabeleireiro', ARRAY['Ação antioxidante e antibacteriana', 'Facilidade de manutenção', 'Redução do frizz'], ARRAY[]::TEXT[], 'Cabelos lisos, leves e radiantes. 0% Formol. Alisa, nutre profundamente, repara danos e revitaliza. 550ml cada.', 399.90, 199.95, 80, true, NULL, ARRAY['cabelo', 'alinhamento', 'ozonizado', 'kit']),
  
  ('SERUM_RETINOL', 'Sérum Retinol Ozonizado', 'Nema''s Way', 'beleza', ARRAY['Retinol', 'Vitamina E', 'Ácido Hialurônico', 'Colágeno'], 'Uso diário', ARRAY['Protege pele de radicais livres', 'Reduz sinais de envelhecimento (rugas/linhas)', 'Promove elasticidade e firmeza'], ARRAY['Gravidez', 'Lactação'], 'Revitalize sua pele com poder do Retinol e pureza do Ozônio. Reduz rugas e linhas finas. 20ml.', 119.99, 59.99, 130, true, NULL, ARRAY['retinol', 'anti_idade', 'ozonizado', 'pele']),
  
  ('SD_FIBRO3', 'SD Fibro3 com Cúrcuma', 'Nema''s Way', 'antiinflamatorios', ARRAY['Magnésio Quelato', 'Dimagnésio Malato', 'Taurato de Magnésio', 'Cúrcuma'], '02 Cápsulas ao dia', ARRAY['Combate dores da Fibromialgia e Osteoporose', 'Adeus Enxaqueca e Alívio da Asma', 'Melhora saúde cardiovascular, sistema nervoso, óssea e intestinal'], ARRAY['Obstrução das vias biliares'], 'Para uma vida sem dor. Fusão poderosa de três tipos de magnésio com cúrcuma. 60 cápsulas de 600mg.', 149.90, 74.95, 180, true, NULL, ARRAY['fibromialgia', 'magnesio', 'curcuma', 'dor']),
  
  ('SPIRULINA_VIT_E', 'Spirulina + Vitamina E', 'Nema''s Way', 'superalimentos', ARRAY['Spirulina platensis 1000mg', 'Vitamina E'], '03 Comprimidos ao dia', ARRAY['Age como poderoso antioxidante', 'Ação Anti-inflamatória', 'Colabora para flora intestinal saudável', 'Reduz sintomas do cansaço'], ARRAY['Fenilcetonúria'], 'Limpeza completa para seu organismo. Potencialize sua saúde. 90 comprimidos de 1000mg cada.', 139.90, 69.95, 250, true, NULL, ARRAY['spirulina', 'vitamina_e', 'desintoxicacao', 'antioxidante']),
  
  ('OLEO_GIRASSOL_OZONIZADO', 'Óleo de Girassol Ozonizado', 'Nema''s Way', 'topico', ARRAY['Óleo de Girassol Ozonizado'], '02 aplicações ao dia', ARRAY['Combate Acnes, Rugas e promove Renovação Celular', 'Hidratação anti-idade', 'Alto poder de cicatrização (queimaduras)', 'Ação antioxidante, antimicrobiana', 'Alívio para Psoríase'], ARRAY[]::TEXT[], 'Tecnologia avançada para cicatrização eficaz. Manchas, acnes ou qualquer problema de pele não serão mais problema. 30ml.', 109.90, 54.95, 150, true, NULL, ARRAY['oleo_girassol', 'ozonizado', 'cicatrizacao', 'pele']),
  
  ('OLEO_REGENERADOR', 'Óleo Regenerador Ozonizado', 'Nema''s Way', 'beleza', ARRAY['Rosa Mosqueta', 'Semente de Uva', 'Copaíba', 'Girassol Extra Virgem'], 'Diariamente a noite', ARRAY['Promove regeneração celular', 'Reduz rugas e linhas finas', 'Rica em antioxidantes', 'Redução de cicatrizes e manchas'], ARRAY[]::TEXT[], 'Transformação começa em cada gota. Sinfonia natural de ingredientes preciosos. Elixir de rejuvenescimento. 30ml.', 109.90, 54.95, 140, true, NULL, ARRAY['oleo_regenerador', 'rosa_mosqueta', 'ozonizado', 'anti_idade']),
  
  ('GEL_CRIOTERAPICO', 'Gel Crioterápico', 'Nema''s Way', 'topico', ARRAY['Cafeína', 'Centella Asiática', 'Alga Fucus', 'Mentol', 'Colágeno'], 'Uso diário', ARRAY['Redução de Gordura Localizada', 'Modelagem do contorno corporal', 'Ação drenante (inchaço)', 'Melhora textura da pele (celulite)'], ARRAY[]::TEXT[], 'Seu corpo, sua regra: sem espaço para pneuzinhos. Solução high-performance para redução de medidas. 500g.', 99.90, 49.95, 180, true, NULL, ARRAY['gel_crioterapico', 'gordura_localizada', 'celulite', 'drenante']),
  
  ('FOCUS_TDAH', 'Focus TDAH Premium', 'Nema''s Way', 'cognicao', ARRAY['Ingredientes para foco e concentração'], '02 Cápsulas ao dia', ARRAY['Melhora do foco e concentração', 'Redução do estresse e ansiedade', 'Melhora do humor e bem-estar', 'Proteção do sistema nervoso', 'Redução da fadiga mental'], ARRAY[]::TEXT[], 'Foco, clareza e equilíbrio para sua mente. Aumenta concentração, reduz fadiga mental e melhora produtividade. 60 cápsulas de 500mg.', 159.90, 79.95, 150, true, NULL, ARRAY['foco', 'concentracao', 'tdah', 'cognicao']),
  
  ('CAR_BLACK', 'Car Black', 'Nema''s Way', 'perfumaria', ARRAY[]::TEXT[], 'Uso pessoal', ARRAY['Fragrância masculina elegante'], ARRAY[]::TEXT[], 'Desafie as probabilidades. Supere os limites. Inspirado no Ferrari Black. 100ml.', 199.99, 99.99, 100, true, NULL, ARRAY['perfume', 'masculino', 'fragrancia']),
  
  ('MADAME_X', 'Madame X', 'Nema''s Way', 'perfumaria', ARRAY[]::TEXT[], 'Uso pessoal', ARRAY['Fragrância feminina sofisticada'], ARRAY[]::TEXT[], 'Descubra sua singularidade. Inspirada no Coco Mademoiselle. Revele sua autenticidade. 100ml.', 199.99, 99.99, 100, true, NULL, ARRAY['perfume', 'feminino', 'fragrancia']),
  
  ('MOLECULA_DA_VIDA', 'Molécula da Vida', 'Nema''s Way', 'digestao', ARRAY['Ácido Araquidônico'], '02 Cápsulas ao dia', ARRAY['Melhora da saúde digestiva e mucosa intestinal', 'Alívio de gastrite, úlceras e desconfortos', 'Ação anti-inflamatória natural potente', 'Proteção contra bactéria H. pylori', 'Promoção do equilíbrio intestinal'], ARRAY[]::TEXT[], 'Cuide do sistema digestivo de forma natural e eficaz. Ação anti-inflamatória e protetora. 60 cápsulas de 300mg.', 159.99, 79.99, 150, true, NULL, ARRAY['digestao', 'gastrite', 'h_pylori', 'antiinflamatorio']),
  
  ('MEGA_NUTRI_RX21', 'Mega Nutri RX21', 'Nema''s Way', 'beleza', ARRAY['Vitaminas e Minerais'], '01 Comprimido ao dia', ARRAY['Reduz a queda capilar', 'Fortalece e aumenta elasticidade dos fios', 'Promove unhas saudáveis e menos quebradiças', 'Estimula crescimento'], ARRAY[]::TEXT[], 'Tratamento para Cabelo, Pele e Unhas. Solução completa para fortalecer e cuidar da beleza. 30 comprimidos de 800mg.', 99.90, 49.95, 150, true, NULL, ARRAY['cabelo', 'unhas', 'pele', 'vitaminas']),
  
  ('OLEO_MASSAGEM_OZONIZADO', 'Óleo de Massagem Ozonizado', 'Nema''s Way', 'topico', ARRAY['Arnica', 'Óleo de Girassol Ozonizado'], 'Uso diário', ARRAY['Tratamento eficaz para hematomas', 'Promove relaxamento muscular e alivia tensões', 'Auxilia no tratamento de varizes', 'Ativa articulações e melhora circulação'], ARRAY[]::TEXT[], 'Tratamento para corpo inteiro. Solução completa para bem-estar. Fórmula potente para todas as dores. 120ml.', 99.90, 49.95, 160, true, NULL, ARRAY['oleo_massagem', 'arnica', 'ozonizado', 'varizes']),
  
  ('PROPOLIS_VERDE', 'Própolis Verde', 'Nema''s Way', 'imunidade', ARRAY['Própolis Verde 300mg'], '02 Cápsulas ao dia', ARRAY['Reforça Sistema Imunológico (infecções bacterianas, fúngicas, virais)', 'Acelera cicatrização de feridas (incluindo queimaduras)', 'Alivia desconfortos (Faringite, Amigdalite, Gripes)', 'Promove saúde geral'], ARRAY['Alergia a própolis'], 'Imunidade imediata em uma única cápsula. Fórmula poderosa que combate infecções e acelera cicatrização. 60 cápsulas de 300mg.', 139.90, 69.95, 180, true, NULL, ARRAY['propolis_verde', 'imunidade', 'antimicrobiano', 'cicatrizacao']),
  
  ('PROPOWAY_VERMELHA', 'PropoWay Vermelha', 'Nema''s Way', 'imunidade', ARRAY['Extrato de Própolis', 'Óleo de Linhaça', 'TCM'], '02 Cápsulas ao dia', ARRAY['Auxilia no fortalecimento do sistema imunológico', 'Previne cáries e gengivites', 'Auxilia na recuperação de feridas e lesões na pele'], ARRAY['Alergia a própolis'], 'Imunidade e Resistência em Duas Cápsulas! Fortalece sistema imunológico e melhora saúde cardiovascular. 60 cápsulas de 300mg.', 139.90, 69.95, 170, true, NULL, ARRAY['propolis_vermelha', 'imunidade', 'cardiovascular', 'energia']),
  
  ('PROMEN', 'Promen', 'Nema''s Way', 'saude_geral', ARRAY['Lycopene', 'Óleo de Semente de Uva', 'Óleo de Abóbora', 'Vitamina E'], '02 Cápsulas ao dia', ARRAY['Prevenção do Infarto e AVC', 'Auxilia na Prevenção do Câncer de Próstata, Colo do Útero, Mamas', 'Fortalecimento do Sistema Imunológico', 'Melhora da Fertilidade Masculina', 'Trata Hiperplasia Benigna da Próstata'], ARRAY['Insuficiência cardíaca'], 'Tratamento para Homens e Mulheres. Vida de qualidade e bem-estar. 60 cápsulas de 1.400mg.', 149.90, 74.95, 150, true, NULL, ARRAY['prostata', 'cancer', 'cardiovascular', 'fertilidade']),
  
  -- Mantendo 'OLEO_HOT' que estava nos protocolos
  ('OLEO_HOT', 'Óleo Hot', 'Nema''s Way', 'saude_intima', ARRAY['Óleos Essenciais', 'Extratos'], 'Uso tópico diário', ARRAY['Lubrificação', 'Antisséptico', 'Antifúngico', 'Cicatrização'], ARRAY[]::TEXT[], 'Óleo para saúde íntima com ação antisséptica.', 99.90, 49.95, 120, true, NULL, ARRAY['intimo', 'topico', 'antisseptico'])

ON CONFLICT (external_id) DO UPDATE SET
    name = EXCLUDED.name,
    brand = 'Nema''s Way', -- FORÇAR A MARCA CORRETA NO UPDATE TAMBÉM
    category = EXCLUDED.category,
    active_ingredients = EXCLUDED.active_ingredients,
    recommended_dosage = EXCLUDED.recommended_dosage,
    benefits = EXCLUDED.benefits,
    contraindications = EXCLUDED.contraindications,
    description = EXCLUDED.description,
    original_price = EXCLUDED.original_price,
    discount_price = ROUND(EXCLUDED.original_price * 0.5, 2),
    stock_quantity = EXCLUDED.stock_quantity,
    is_approved = EXCLUDED.is_approved,
    image_url = EXCLUDED.image_url,
    tags = EXCLUDED.tags,
    updated_at = NOW();


-- 6. INSERÇÃO DE PROTOCOLOS (MAPEADOS COM NOVOS PRODUTOS)
-- ==============================================================================

DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  -- Variáveis para IDs de produtos
  v_ozonio_id UUID;
  v_sdfibro_id UUID;
  v_bvb_insu_id UUID;
  v_seremix_id UUID;
  v_omega3_id UUID;
  v_d3k2_id UUID;
  v_coq10_id UUID;
  v_propoway_id UUID;
  v_spirulina_id UUID;
  v_lipoway_id UUID;
  v_amargo_id UUID;
  v_sabonete_id UUID;
  v_oleo_hot_id UUID;
  v_prowoman_id UUID;
  v_oleo_primula_id UUID;
  
  -- Variáveis para IDs de horários
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_as_10h_id UUID;
  v_30min_almoco_id UUID;
  v_apos_almoco_id UUID;
  v_30min_jantar_id UUID;
  v_uso_diario_id UUID;
BEGIN
  -- Buscar IDs de Horários
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_apos_almoco_id FROM public.usage_times WHERE code = 'APOS_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_ANTES_JANTAR';
  SELECT id INTO v_uso_diario_id FROM public.usage_times WHERE code = 'USO_DIARIO';

  -- PROTOCOLO 1: ANSIEDADE
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Ansiedade';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3'; -- Mapeado
  SELECT id INTO v_bvb_insu_id FROM public.supplements WHERE external_id = 'BVB_INSU'; -- Mapeado
  SELECT id INTO v_seremix_id FROM public.supplements WHERE external_id = 'SEREMIX';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Ansiedade', 'Protocolo completo para redução de ansiedade e estresse', 'Acompanhamento profissional recomendado')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1; END IF;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order) VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_sdfibro_id, v_apos_cafe_id, '2 Cápsulas', 2),
    (v_protocol_id, v_bvb_insu_id, v_30min_almoco_id, '2 Cápsulas', 3),
    (v_protocol_id, v_seremix_id, v_30min_jantar_id, '1 Cápsula', 4)
  ON CONFLICT DO NOTHING;

  -- PROTOCOLO 2: DIABETES
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Diabetes';
  SELECT id INTO v_omega3_id FROM public.supplements WHERE external_id = 'OMEGA_3_1400MG'; -- Mapeado
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2'; -- Mapeado

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Diabetes', 'Protocolo para controle glicêmico e diabetes', 'Monitorar glicemia regularmente')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1; END IF;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order) VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_bvb_insu_id, v_jejum_id, '2 Cápsulas', 2),
    (v_protocol_id, v_omega3_id, v_30min_almoco_id, '1 Cápsula', 3),
    (v_protocol_id, v_omega3_id, v_30min_jantar_id, '1 Cápsula', 4),
    (v_protocol_id, v_d3k2_id, v_jejum_id, '2 Cápsulas', 5)
  ON CONFLICT DO NOTHING;

  -- PROTOCOLO 3: FIBROMIALGIA E ENXAQUECA
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Fibromialgia e Enxaqueca';
  SELECT id INTO v_coq10_id FROM public.supplements WHERE external_id = 'BVB_Q10'; -- Mapeado

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Fibromialgia e Enxaqueca', 'Protocolo para alívio de dores crônicas', 'Pode levar algumas semanas para efeito completo')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1; END IF;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order) VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_sdfibro_id, v_apos_cafe_id, '2 Cápsulas', 2),
    (v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 3),
    (v_protocol_id, v_coq10_id, v_30min_jantar_id, '2 Cápsulas', 4)
  ON CONFLICT DO NOTHING;

  -- PROTOCOLO 4: INSÔNIA
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Insônia';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Insônia', 'Protocolo para melhora da qualidade do sono', 'Tomar Seremix 30 minutos antes de dormir')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1; END IF;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order) VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_sdfibro_id, v_as_10h_id, '2 Cápsulas', 2),
    (v_protocol_id, v_seremix_id, v_30min_jantar_id, '1 Cápsula', 3)
  ON CONFLICT DO NOTHING;

  -- PROTOCOLO 5: EMAGRECIMENTO
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Emagrecimento';
  SELECT id INTO v_propoway_id FROM public.supplements WHERE external_id = 'PROPOWAY_VERMELHA';
  SELECT id INTO v_spirulina_id FROM public.supplements WHERE external_id = 'SPIRULINA_VIT_E'; -- Mapeado
  SELECT id INTO v_lipoway_id FROM public.supplements WHERE external_id = 'LIPOWAY';
  SELECT id INTO v_amargo_id FROM public.supplements WHERE external_id = 'AMARGO';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Emagrecimento', 'Protocolo completo para perda de peso', 'Aumentar ingestão de água.')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1; END IF;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, notes, display_order) VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', NULL, 1),
    (v_protocol_id, v_propoway_id, v_jejum_id, '2 Cápsulas', NULL, 2),
    (v_protocol_id, v_spirulina_id, v_as_10h_id, '3 Comprimidos', 'Começar com 3, aumentar conforme tolerância', 3),
    (v_protocol_id, v_lipoway_id, v_30min_almoco_id, '1 Cápsula', NULL, 4),
    (v_protocol_id, v_lipoway_id, v_30min_jantar_id, '1 Cápsula', NULL, 5),
    (v_protocol_id, v_amargo_id, v_apos_almoco_id, '2 Colheres de Sopa', NULL, 6)
  ON CONFLICT DO NOTHING;

  -- PROTOCOLO 6: DESINTOXICAÇÃO
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Desintoxicação';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Desintoxicação', 'Protocolo para limpeza do organismo', 'Aumentar ingestão de água.')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1; END IF;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order) VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_propoway_id, v_jejum_id, '2 Cápsulas', 2),
    (v_protocol_id, v_spirulina_id, v_as_10h_id, '3 Comprimidos', 3),
    (v_protocol_id, v_amargo_id, v_apos_almoco_id, '2 Colheres de Sopa', 4)
  ON CONFLICT DO NOTHING;

  -- PROTOCOLO 7: SAÚDE ÍNTIMA
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Saúde Íntima';
  SELECT id INTO v_sabonete_id FROM public.supplements WHERE external_id = 'SABONETE_INTIMO_SEDUCAO'; -- Mapeado
  SELECT id INTO v_oleo_hot_id FROM public.supplements WHERE external_id = 'OLEO_HOT';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Saúde Íntima', 'Protocolo completo para saúde íntima feminina', 'Manter higiene adequada')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1; END IF;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order) VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 2),
    (v_protocol_id, v_propoway_id, v_jejum_id, '2 Cápsulas', 3),
    (v_protocol_id, v_sabonete_id, v_uso_diario_id, '1x ao dia', 4),
    (v_protocol_id, v_oleo_hot_id, v_uso_diario_id, 'Todas as noites', 5)
  ON CONFLICT DO NOTHING;

  -- PROTOCOLO 8: MENOPAUSA
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Menopausa';
  SELECT id INTO v_prowoman_id FROM public.supplements WHERE external_id = 'PROWOMAN';
  SELECT id INTO v_oleo_primula_id FROM public.supplements WHERE external_id = 'OLEO_PRIMULA';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Menopausa', 'Alívio dos sintomas da menopausa', 'Acompanhamento médico recomendado')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1; END IF;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order) VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_prowoman_id, v_apos_cafe_id, '2 Cápsulas', 2),
    (v_protocol_id, v_propoway_id, v_jejum_id, '2 Cápsulas', 3),
    (v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 4),
    (v_protocol_id, v_oleo_primula_id, v_30min_almoco_id, '2 Cápsulas', 5)
  ON CONFLICT DO NOTHING;

END $$;

COMMIT;
