-- Criar tabelas para sistema de suplementos
CREATE TABLE IF NOT EXISTS public.supplements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    active_ingredients TEXT[],
    recommended_dosage TEXT,
    benefits TEXT[],
    contraindications TEXT[],
    category TEXT,
    brand TEXT,
    is_approved BOOLEAN DEFAULT false,
    image_url TEXT,
    original_price DECIMAL(10,2),
    discount_price DECIMAL(10,2),
    description TEXT,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_supplements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplement_id UUID REFERENCES public.supplements(id),
    supplement_name TEXT,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_supplements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Enable read access for all users" ON public.supplements FOR SELECT USING (true);

CREATE POLICY "Enable read access for users based on user_id" ON public.user_supplements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for users based on user_id" ON public.user_supplements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for users based on user_id" ON public.user_supplements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for users based on user_id" ON public.user_supplements FOR DELETE USING (auth.uid() = user_id);

-- Inserir suplementos Atlântica Natural
INSERT INTO public.supplements (
    name, 
    active_ingredients, 
    recommended_dosage, 
    benefits, 
    contraindications, 
    category, 
    brand, 
    is_approved,
    original_price,
    discount_price,
    description,
    stock_quantity
) 
SELECT * FROM (VALUES
    ('Whey Protein 80%', ARRAY['Proteína do soro do leite (80%)'], '30g ao dia', ARRAY['Aumento de massa muscular', 'Recuperação pós-treino', 'Saciedade'], ARRAY['Intolerância à lactose'], 'Proteínas', 'Atlântica Natural', true, 179.90, 89.90, 'Proteína de alta qualidade para atletas e praticantes de exercícios físicos', 100),
    ('Creatina Monohidratada', ARRAY['Creatina monohidratada (3g)'], '3-5g ao dia', ARRAY['Aumento de força', 'Ganho de massa muscular', 'Melhora do desempenho'], ARRAY['Problemas renais'], 'Creatina', 'Atlântica Natural', true, 129.90, 64.90, 'Creatina monohidratada para aumento de força e massa muscular', 80),
    ('BCAA 2:1:1', ARRAY['L-Leucina (2g)', 'L-Isoleucina (1g)', 'L-Valina (1g)'], '5-10g ao dia', ARRAY['Recuperação muscular', 'Redução da fadiga', 'Preservação da massa muscular'], ARRAY['Alergia a aminoácidos'], 'Aminoácidos', 'Atlântica Natural', true, 99.90, 49.90, 'Aminoácidos essenciais para recuperação muscular', 120),
    ('Glutamina', ARRAY['L-Glutamina (5g)'], '5-10g ao dia', ARRAY['Recuperação muscular', 'Sistema imunológico', 'Integridade intestinal'], ARRAY['Epilepsia'], 'Aminoácidos', 'Atlântica Natural', true, 89.90, 44.90, 'Glutamina para recuperação e sistema imunológico', 90),
    ('Multivitamínico', ARRAY['Vitaminas A, C, D, E', 'Complexo B', 'Minerais'], '1 cápsula ao dia', ARRAY['Suporte nutricional', 'Energia', 'Sistema imunológico'], ARRAY['Hipersensibilidade'], 'Vitaminas', 'Atlântica Natural', true, 99.90, 49.90, 'Complexo vitamínico completo para suporte nutricional', 150),
    ('Ômega 3', ARRAY['EPA (180mg)', 'DHA (120mg)'], '2 cápsulas ao dia', ARRAY['Saúde cardiovascular', 'Função cerebral', 'Anti-inflamatório'], ARRAY['Distúrbios hemorrágicos'], 'Ômega 3', 'Atlântica Natural', true, 149.90, 74.90, 'Ômega 3 para saúde cardiovascular e cerebral', 110),
    ('Magnésio', ARRAY['Magnésio (400mg)'], '1-2 cápsulas ao dia', ARRAY['Relaxamento muscular', 'Qualidade do sono', 'Função nervosa'], ARRAY['Insuficiência renal'], 'Minerais', 'Atlântica Natural', true),
    ('Zinco', ARRAY['Zinco (15mg)'], '1 cápsula ao dia', ARRAY['Sistema imunológico', 'Síntese proteica', 'Função hormonal'], ARRAY['Deficiência de cobre'], 'Minerais', 'Atlântica Natural', true),
    ('Vitamina D3', ARRAY['Vitamina D3 (2000 UI)'], '1 cápsula ao dia', ARRAY['Saúde óssea', 'Sistema imunológico', 'Função muscular'], ARRAY['Hipercalcemia'], 'Vitaminas', 'Atlântica Natural', true),
    ('Vitamina B12', ARRAY['Vitamina B12 (1000mcg)'], '1 cápsula ao dia', ARRAY['Energia', 'Função neurológica', 'Síntese de DNA'], ARRAY['Hipersensibilidade'], 'Vitaminas', 'Atlântica Natural', true),
    ('Ferro', ARRAY['Ferro (18mg)'], '1 cápsula ao dia', ARRAY['Transporte de oxigênio', 'Prevenção de anemia', 'Energia'], ARRAY['Hemocromatose'], 'Minerais', 'Atlântica Natural', true),
    ('Cálcio', ARRAY['Cálcio (600mg)'], '1-2 cápsulas ao dia', ARRAY['Saúde óssea', 'Função muscular', 'Coagulação sanguínea'], ARRAY['Hipercalcemia'], 'Minerais', 'Atlântica Natural', true),
    ('Colágeno', ARRAY['Colágeno hidrolisado (10g)'], '10g ao dia', ARRAY['Saúde articular', 'Pele firme', 'Unhas e cabelos'], ARRAY['Alergia a proteínas'], 'Colágeno', 'Atlântica Natural', true),
    ('Probióticos', ARRAY['Lactobacillus', 'Bifidobacterium'], '1 cápsula ao dia', ARRAY['Saúde intestinal', 'Sistema imunológico', 'Digestão'], ARRAY['Imunossupressão'], 'Probióticos', 'Atlântica Natural', true),
    ('Coenzima Q10', ARRAY['CoQ10 (100mg)'], '1 cápsula ao dia', ARRAY['Energia celular', 'Saúde cardiovascular', 'Antioxidante'], ARRAY['Hipotensão'], 'Antioxidantes', 'Atlântica Natural', true),
    ('Curcumina', ARRAY['Curcumina (500mg)'], '1-2 cápsulas ao dia', ARRAY['Anti-inflamatório', 'Proteção hepática', 'Antioxidante'], ARRAY['Cálculos biliares'], 'Anti-inflamatórios', 'Atlântica Natural', true),
    ('Resveratrol', ARRAY['Resveratrol (250mg)'], '1 cápsula ao dia', ARRAY['Antioxidante', 'Longevidade', 'Saúde cardiovascular'], ARRAY['Gravidez'], 'Antioxidantes', 'Atlântica Natural', true),
    ('Ashwagandha', ARRAY['Withania somnifera (600mg)'], '1-2 cápsulas ao dia', ARRAY['Redução do estresse', 'Melhora do sono', 'Função adrenal'], ARRAY['Hipertireoidismo'], 'Adaptógenos', 'Atlântica Natural', true),
    ('Rhodiola', ARRAY['Rhodiola rosea (400mg)'], '1 cápsula ao dia', ARRAY['Energia', 'Resistência ao estresse', 'Função cognitiva'], ARRAY['Hipertensão'], 'Adaptógenos', 'Atlântica Natural', true),
    ('Melatonina', ARRAY['Melatonina (3mg)'], '1 cápsula antes de dormir', ARRAY['Qualidade do sono', 'Ritmo circadiano', 'Relaxamento'], ARRAY['Gravidez'], 'Sono', 'Atlântica Natural', true),
    ('L-Tirosina', ARRAY['L-Tirosina (500mg)'], '1-2 cápsulas ao dia', ARRAY['Foco e concentração', 'Energia mental', 'Produção de neurotransmissores'], ARRAY['Hipertireoidismo'], 'Aminoácidos', 'Atlântica Natural', true),
    ('5-HTP', ARRAY['5-HTP (100mg)'], '1 cápsula ao dia', ARRAY['Bem-estar', 'Qualidade do sono', 'Apetite'], ARRAY['Medicamentos antidepressivos'], 'Aminoácidos', 'Atlântica Natural', true),
    ('Ginkgo Biloba', ARRAY['Ginkgo Biloba (120mg)'], '1-2 cápsulas ao dia', ARRAY['Circulação cerebral', 'Memória', 'Concentração'], ARRAY['Distúrbios hemorrágicos'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Ginseng', ARRAY['Panax ginseng (200mg)'], '1 cápsula ao dia', ARRAY['Energia', 'Resistência', 'Função cognitiva'], ARRAY['Hipertensão'], 'Adaptógenos', 'Atlântica Natural', true),
    ('Cordyceps', ARRAY['Cordyceps sinensis (400mg)'], '1 cápsula ao dia', ARRAY['Energia', 'Resistência física', 'Função pulmonar'], ARRAY['Doenças autoimunes'], 'Adaptógenos', 'Atlântica Natural', true),
    ('Reishi', ARRAY['Ganoderma lucidum (400mg)'], '1 cápsula ao dia', ARRAY['Sistema imunológico', 'Relaxamento', 'Qualidade do sono'], ARRAY['Alergia a cogumelos'], 'Adaptógenos', 'Atlântica Natural', true),
    ('Chlorella', ARRAY['Chlorella vulgaris (500mg)'], '2-3 cápsulas ao dia', ARRAY['Desintoxicação', 'Clorofila', 'Nutrientes essenciais'], ARRAY['Sensibilidade ao iodo'], 'Algas', 'Atlântica Natural', true),
    ('Spirulina', ARRAY['Spirulina platensis (500mg)'], '2-3 cápsulas ao dia', ARRAY['Proteína completa', 'Ferro', 'Antioxidantes'], ARRAY['Fenilcetonúria'], 'Algas', 'Atlântica Natural', true),
    ('Cúrcuma', ARRAY['Cúrcuma longa (500mg)'], '1-2 cápsulas ao dia', ARRAY['Anti-inflamatório', 'Proteção hepática', 'Digestão'], ARRAY['Cálculos biliares'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Gengibre', ARRAY['Zingiber officinale (500mg)'], '1-2 cápsulas ao dia', ARRAY['Digestão', 'Náusea', 'Anti-inflamatório'], ARRAY['Distúrbios hemorrágicos'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Canela', ARRAY['Cinnamomum verum (500mg)'], '1 cápsula ao dia', ARRAY['Controle glicêmico', 'Antioxidante', 'Metabolismo'], ARRAY['Distúrbios hemorrágicos'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Pimenta Preta', ARRAY['Piper nigrum (5mg)'], '1 cápsula ao dia', ARRAY['Absorção de nutrientes', 'Metabolismo', 'Digestão'], ARRAY['Úlceras'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Alho', ARRAY['Allium sativum (400mg)'], '1 cápsula ao dia', ARRAY['Sistema imunológico', 'Saúde cardiovascular', 'Antioxidante'], ARRAY['Distúrbios hemorrágicos'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Echinacea', ARRAY['Echinacea purpurea (400mg)'], '1-2 cápsulas ao dia', ARRAY['Sistema imunológico', 'Prevenção de resfriados', 'Recuperação'], ARRAY['Doenças autoimunes'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Equinácea', ARRAY['Echinacea angustifolia (400mg)'], '1-2 cápsulas ao dia', ARRAY['Sistema imunológico', 'Prevenção de infecções', 'Recuperação'], ARRAY['Doenças autoimunes'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Própolis', ARRAY['Própolis (400mg)'], '1-2 cápsulas ao dia', ARRAY['Sistema imunológico', 'Antioxidante', 'Proteção celular'], ARRAY['Alergia a abelhas'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Geleia Real', ARRAY['Geleia Real (300mg)'], '1 cápsula ao dia', ARRAY['Energia', 'Sistema imunológico', 'Vitalidade'], ARRAY['Alergia a abelhas'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Pólen', ARRAY['Pólen de abelhas (500mg)'], '1-2 cápsulas ao dia', ARRAY['Energia natural', 'Nutrientes essenciais', 'Vitalidade'], ARRAY['Alergia a pólen'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Maca Peruana', ARRAY['Lepidium meyenii (500mg)'], '1-2 cápsulas ao dia', ARRAY['Energia', 'Libido', 'Hormônios'], ARRAY['Hipertensão'], 'Adaptógenos', 'Atlântica Natural', true),
    ('Tribulus', ARRAY['Tribulus terrestris (500mg)'], '1-2 cápsulas ao dia', ARRAY['Libido masculina', 'Testosterona', 'Performance'], ARRAY['Problemas prostáticos'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Saw Palmetto', ARRAY['Serenoa repens (320mg)'], '1-2 cápsulas ao dia', ARRAY['Saúde prostática', 'Função urinária', 'Hormônios masculinos'], ARRAY['Gravidez'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Dong Quai', ARRAY['Angelica sinensis (400mg)'], '1-2 cápsulas ao dia', ARRAY['Saúde feminina', 'Ciclo menstrual', 'Hormônios'], ARRAY['Distúrbios hemorrágicos'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Vitex', ARRAY['Vitex agnus-castus (400mg)'], '1 cápsula ao dia', ARRAY['Desequilíbrio hormonal', 'Síndrome pré-menstrual', 'Ciclo menstrual'], ARRAY['Gravidez'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Chasteberry', ARRAY['Vitex agnus-castus (400mg)'], '1 cápsula ao dia', ARRAY['Desequilíbrio hormonal', 'Síndrome pré-menstrual', 'Ciclo menstrual'], ARRAY['Gravidez'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Black Cohosh', ARRAY['Actaea racemosa (400mg)'], '1-2 cápsulas ao dia', ARRAY['Menopausa', 'Ondas de calor', 'Hormônios femininos'], ARRAY['Distúrbios hepáticos'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Red Clover', ARRAY['Trifolium pratense (400mg)'], '1-2 cápsulas ao dia', ARRAY['Menopausa', 'Ondas de calor', 'Hormônios'], ARRAY['Distúrbios hemorrágicos'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Soy Isoflavones', ARRAY['Isoflavonas de soja (50mg)'], '1-2 cápsulas ao dia', ARRAY['Menopausa', 'Saúde óssea', 'Hormônios'], ARRAY['Câncer de mama'], 'Fitoterápicos', 'Atlântica Natural', true),
    ('Flaxseed Oil', ARRAY['Óleo de linhaça (1000mg)'], '1-2 cápsulas ao dia', ARRAY['Ômega 3 vegetal', 'Hormônios', 'Saúde cardiovascular'], ARRAY['Distúrbios hemorrágicos'], 'Óleos', 'Atlântica Natural', true),
    ('Evening Primrose', ARRAY['Óleo de prímula (500mg)'], '1-2 cápsulas ao dia', ARRAY['Síndrome pré-menstrual', 'Hormônios femininos', 'Saúde da pele'], ARRAY['Epilepsia'], 'Óleos', 'Atlântica Natural', true),
    ('Borage Oil', ARRAY['Óleo de borragem (500mg)'], '1 cápsula ao dia', ARRAY['GLA', 'Hormônios', 'Anti-inflamatório'], ARRAY['Epilepsia'], 'Óleos', 'Atlântica Natural', true),
    ('Coconut Oil', ARRAY['Óleo de coco (1000mg)'], '1-2 cápsulas ao dia', ARRAY['MCT', 'Energia', 'Metabolismo'], ARRAY['Alergia a coco'], 'Óleos', 'Atlântica Natural', true),
    ('MCT Oil', ARRAY['Óleo MCT (1000mg)'], '1-2 cápsulas ao dia', ARRAY['Energia rápida', 'Cetose', 'Perda de peso'], ARRAY['Distúrbios hepáticos'], 'Óleos', 'Atlântica Natural', true),
    ('CLA', ARRAY['Ácido linoleico conjugado (1000mg)'], '2 cápsulas ao dia', ARRAY['Perda de gordura', 'Massa muscular', 'Metabolismo'], ARRAY['Diabetes'], 'Queimadores', 'Atlântica Natural', true),
    ('L-Carnitine', ARRAY['L-Carnitina (1000mg)'], '1-2 cápsulas ao dia', ARRAY['Queima de gordura', 'Energia', 'Performance'], ARRAY['Convulsões'], 'Queimadores', 'Atlântica Natural', true),
    ('Garcinia Cambogia', ARRAY['Garcinia cambogia (500mg)'], '1-2 cápsulas ao dia', ARRAY['Controle do apetite', 'Metabolismo', 'Perda de peso'], ARRAY['Demência'], 'Queimadores', 'Atlântica Natural', true),
    ('Green Tea Extract', ARRAY['Extrato de chá verde (500mg)'], '1-2 cápsulas ao dia', ARRAY['Antioxidante', 'Metabolismo', 'Energia'], ARRAY['Insônia'], 'Queimadores', 'Atlântica Natural', true),
    ('Raspberry Ketones', ARRAY['Cetona de framboesa (100mg)'], '1 cápsula ao dia', ARRAY['Metabolismo', 'Perda de peso', 'Energia'], ARRAY['Gravidez'], 'Queimadores', 'Atlântica Natural', true),
    ('Forskolin', ARRAY['Forskolina (250mg)'], '1-2 cápsulas ao dia', ARRAY['Queima de gordura', 'Massa muscular', 'Metabolismo'], ARRAY['Hipotensão'], 'Queimadores', 'Atlântica Natural', true),
    ('Yohimbe', ARRAY['Yohimbina (5mg)'], '1 cápsula ao dia', ARRAY['Queima de gordura', 'Libido', 'Performance'], ARRAY['Hipertensão'], 'Queimadores', 'Atlântica Natural', true),
    ('Beta-Alanine', ARRAY['Beta-Alanina (3g)'], '3-5g ao dia', ARRAY['Resistência muscular', 'Performance', 'Redução da fadiga'], ARRAY['Parestesia'], 'Performance', 'Atlântica Natural', true),
    ('Citrulline Malate', ARRAY['Citrulina malato (6g)'], '6-8g ao dia', ARRAY['Pump muscular', 'Resistência', 'Recuperação'], ARRAY['Distúrbios hepáticos'], 'Performance', 'Atlântica Natural', true),
    ('Arginina', ARRAY['L-Arginina (3g)'], '3-5g ao dia', ARRAY['Pump muscular', 'Fluxo sanguíneo', 'Performance'], ARRAY['Herpes'], 'Performance', 'Atlântica Natural', true),
    ('Taurina', ARRAY['Taurina (2g)'], '2-3g ao dia', ARRAY['Energia', 'Função cardíaca', 'Antioxidante'], ARRAY['Distúrbios hepáticos'], 'Aminoácidos', 'Atlântica Natural', true),
    ('HMB', ARRAY['Beta-hidroxi-beta-metilbutirato (3g)'], '3g ao dia', ARRAY['Preservação muscular', 'Recuperação', 'Massa muscular'], ARRAY['Distúrbios renais'], 'Performance', 'Atlântica Natural', true)
) AS new_supplements(
    name, 
    active_ingredients, 
    recommended_dosage, 
    benefits, 
    contraindications, 
    category, 
    brand, 
    is_approved
)
WHERE NOT EXISTS (
    SELECT 1 FROM public.supplements s 
    WHERE s.name = new_supplements.name 
    AND s.brand = new_supplements.brand
);