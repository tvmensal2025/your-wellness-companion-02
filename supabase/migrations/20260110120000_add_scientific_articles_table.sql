-- Migration: Add Scientific Articles Table
-- Description: Tabela para armazenar artigos científicos relacionados a suplementos

-- Tabela de artigos científicos
CREATE TABLE IF NOT EXISTS scientific_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_pt TEXT NOT NULL,
  url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'pubmed' CHECK (source IN ('pubmed', 'scielo', 'other')),
  summary_pt TEXT NOT NULL,
  related_ingredient TEXT NOT NULL,
  related_conditions TEXT[] DEFAULT '{}',
  published_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de junção: suplementos <-> artigos
CREATE TABLE IF NOT EXISTS supplement_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES scientific_articles(id) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplement_id, article_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_scientific_articles_ingredient ON scientific_articles(related_ingredient);
CREATE INDEX IF NOT EXISTS idx_scientific_articles_source ON scientific_articles(source);
CREATE INDEX IF NOT EXISTS idx_supplement_articles_supplement ON supplement_articles(supplement_id);
CREATE INDEX IF NOT EXISTS idx_supplement_articles_article ON supplement_articles(article_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_scientific_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_scientific_articles_updated_at ON scientific_articles;
CREATE TRIGGER trigger_scientific_articles_updated_at
  BEFORE UPDATE ON scientific_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_scientific_articles_updated_at();

-- RLS Policies
ALTER TABLE scientific_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_articles ENABLE ROW LEVEL SECURITY;

-- Artigos são públicos para leitura
CREATE POLICY "scientific_articles_select_all" ON scientific_articles
  FOR SELECT USING (true);

CREATE POLICY "supplement_articles_select_all" ON supplement_articles
  FOR SELECT USING (true);

-- Apenas admins podem inserir/atualizar
CREATE POLICY "scientific_articles_admin_insert" ON scientific_articles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "scientific_articles_admin_update" ON scientific_articles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "supplement_articles_admin_insert" ON supplement_articles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Inserir artigos científicos iniciais
INSERT INTO scientific_articles (title, title_pt, url, source, summary_pt, related_ingredient, related_conditions, published_year)
VALUES
  (
    'Meta-Analysis: Melatonin for the Treatment of Primary Sleep Disorders',
    'Meta-Análise: Melatonina para Tratamento de Distúrbios Primários do Sono',
    'https://pubmed.ncbi.nlm.nih.gov/23691095/',
    'pubmed',
    'Estudo com 1.683 participantes demonstrou que a melatonina reduz significativamente o tempo para adormecer e aumenta a duração total do sono, com efeitos mais pronunciados em idosos.',
    'melatonina',
    ARRAY['sono', 'insonia'],
    2013
  ),
  (
    'An investigation into the stress-relieving and pharmacological actions of an ashwagandha extract',
    'Investigação sobre as ações farmacológicas e de alívio do estresse do extrato de Ashwagandha',
    'https://pubmed.ncbi.nlm.nih.gov/31517876/',
    'pubmed',
    'Estudo clínico randomizado mostrou redução de 44% nos níveis de cortisol e melhora significativa na qualidade do sono após 8 semanas de suplementação com Ashwagandha.',
    'ashwagandha',
    ARRAY['estresse', 'ansiedade', 'cortisol', 'sono'],
    2019
  ),
  (
    'Vitamin D and Immune Function',
    'Vitamina D e Função Imunológica',
    'https://pubmed.ncbi.nlm.nih.gov/32340216/',
    'pubmed',
    'Revisão sistemática demonstra que a vitamina D modula tanto a imunidade inata quanto adaptativa, reduzindo risco de infecções respiratórias em até 42% em pessoas com deficiência.',
    'vitamina_d',
    ARRAY['imunidade', 'ossos', 'humor'],
    2020
  ),
  (
    'Omega-3 Fatty Acids and Cardiovascular Disease',
    'Ácidos Graxos Ômega-3 e Doença Cardiovascular',
    'https://pubmed.ncbi.nlm.nih.gov/33626250/',
    'pubmed',
    'Meta-análise com mais de 120.000 participantes mostrou redução de 18% em eventos cardiovasculares maiores com suplementação de ômega-3 em doses adequadas.',
    'omega_3',
    ARRAY['cardiovascular', 'triglicerides', 'inflamacao'],
    2021
  ),
  (
    'Oral Collagen Supplementation: A Systematic Review of Dermatological Applications',
    'Suplementação Oral de Colágeno: Revisão Sistemática de Aplicações Dermatológicas',
    'https://pubmed.ncbi.nlm.nih.gov/30681787/',
    'pubmed',
    'Revisão de 11 estudos mostrou melhora significativa na hidratação, elasticidade e densidade da pele após 8-12 semanas de suplementação com colágeno hidrolisado.',
    'colageno',
    ARRAY['pele', 'cabelo', 'unhas', 'articulacoes'],
    2019
  ),
  (
    'International Society of Sports Nutrition position stand: creatine supplementation and exercise',
    'Posicionamento da Sociedade Internacional de Nutrição Esportiva: suplementação de creatina e exercício',
    'https://pubmed.ncbi.nlm.nih.gov/28615996/',
    'pubmed',
    'Consenso científico confirma que a creatina é o suplemento nutricional mais eficaz para aumentar força, massa muscular e performance em exercícios de alta intensidade.',
    'creatina',
    ARRAY['musculos', 'performance', 'forca', 'energia'],
    2017
  ),
  (
    'Probiotics for the Prevention and Treatment of Antibiotic-Associated Diarrhea',
    'Probióticos para Prevenção e Tratamento de Diarreia Associada a Antibióticos',
    'https://pubmed.ncbi.nlm.nih.gov/32730573/',
    'pubmed',
    'Meta-análise de 42 estudos demonstrou que probióticos reduzem em 42% o risco de diarreia associada a antibióticos e melhoram significativamente a saúde intestinal.',
    'probioticos',
    ARRAY['digestao', 'intestino', 'imunidade'],
    2020
  ),
  (
    'The effect of magnesium supplementation on primary insomnia in elderly',
    'Efeito da suplementação de magnésio na insônia primária em idosos',
    'https://pubmed.ncbi.nlm.nih.gov/23853635/',
    'pubmed',
    'Estudo clínico mostrou que a suplementação de magnésio melhorou significativamente a qualidade do sono, tempo de sono e níveis de melatonina em idosos com insônia.',
    'magnesio',
    ARRAY['sono', 'estresse', 'musculos'],
    2012
  ),
  (
    'Curcumin: A Review of Its Effects on Human Health',
    'Curcumina: Uma Revisão de Seus Efeitos na Saúde Humana',
    'https://pubmed.ncbi.nlm.nih.gov/29065496/',
    'pubmed',
    'Revisão abrangente demonstra que a curcumina possui potentes propriedades anti-inflamatórias e antioxidantes, com benefícios comprovados para articulações e digestão.',
    'curcuma',
    ARRAY['inflamacao', 'articulacoes', 'digestao', 'antioxidante'],
    2017
  ),
  (
    'A systematic review of the potential health benefits of spirulina',
    'Revisão sistemática dos potenciais benefícios da spirulina para a saúde',
    'https://pubmed.ncbi.nlm.nih.gov/30882511/',
    'pubmed',
    'Revisão de 40 estudos mostrou que a spirulina melhora perfil lipídico, reduz pressão arterial, tem efeitos antioxidantes e pode auxiliar no controle glicêmico.',
    'spirulina',
    ARRAY['detox', 'energia', 'imunidade', 'antioxidante'],
    2019
  ),
  (
    'Moro orange juice prevents fatty liver in mice',
    'Suco de laranja Moro previne fígado gorduroso em camundongos',
    'https://pubmed.ncbi.nlm.nih.gov/25912765/',
    'pubmed',
    'Estudos demonstram que os antocianinas da laranja Moro reduzem acúmulo de gordura, especialmente abdominal, e melhoram sensibilidade à insulina.',
    'moro_complex',
    ARRAY['emagrecimento', 'metabolismo', 'gordura_abdominal'],
    2015
  ),
  (
    'Chromium supplementation in overweight and obesity: a systematic review',
    'Suplementação de cromo em sobrepeso e obesidade: revisão sistemática',
    'https://pubmed.ncbi.nlm.nih.gov/30193598/',
    'pubmed',
    'Meta-análise mostrou que o cromo melhora controle glicêmico, reduz compulsão por carboidratos e pode auxiliar na perda de peso em pessoas com sobrepeso.',
    'cromo',
    ARRAY['glicemia', 'compulsao', 'emagrecimento', 'diabetes'],
    2018
  ),
  (
    'Zinc and immunity: An essential interrelation',
    'Zinco e imunidade: Uma inter-relação essencial',
    'https://pubmed.ncbi.nlm.nih.gov/32319538/',
    'pubmed',
    'Revisão demonstra que o zinco é essencial para função imune, com deficiência associada a maior susceptibilidade a infecções. Suplementação reduz duração de resfriados.',
    'zinco',
    ARRAY['imunidade', 'pele', 'cicatrizacao'],
    2020
  ),
  (
    'Coenzyme Q10 supplementation and exercise performance',
    'Suplementação de Coenzima Q10 e performance no exercício',
    'https://pubmed.ncbi.nlm.nih.gov/29141968/',
    'pubmed',
    'Estudos mostram que CoQ10 melhora produção de energia celular, reduz fadiga e pode melhorar performance física, especialmente em pessoas com níveis baixos.',
    'coenzima_q10',
    ARRAY['energia', 'cardiovascular', 'antioxidante'],
    2018
  ),
  (
    'Bitter taste receptors and their role in digestion',
    'Receptores de sabor amargo e seu papel na digestão',
    'https://pubmed.ncbi.nlm.nih.gov/26176799/',
    'pubmed',
    'Pesquisas demonstram que compostos amargos estimulam secreção de enzimas digestivas, melhoram absorção de nutrientes e auxiliam na função hepática.',
    'cha_amargo',
    ARRAY['digestao', 'figado', 'detox'],
    2015
  )
ON CONFLICT DO NOTHING;

-- Comentário na tabela
COMMENT ON TABLE scientific_articles IS 'Artigos científicos relacionados a ingredientes de suplementos';
COMMENT ON TABLE supplement_articles IS 'Relação entre suplementos e artigos científicos';
