-- ==============================================================================
-- ATUALIZAÇÃO COMPLETA DE PRODUTOS COM TODAS AS INFORMAÇÕES DETALHADAS
-- Baseado no catálogo completo Nema's Way
-- ==============================================================================

BEGIN;

-- 1. SOS UNHAS
UPDATE public.supplements SET
    description = 'O segredo das unhas perfeitas está em força, proteção, crescimento e livre de fungos e bactérias. Base Fortalecedora e Antifúngica Ozonizada com óleo de girassol ozonizado. O poder do ozônio unido ao mix de vitaminas para suas unhas!',
    recommended_dosage = 'Aplique sobre unhas limpas e secas. Pode ser usado sozinho ou como base antes do esmalte.',
    active_ingredients = ARRAY['Óleo de Girassol Ozonizado', 'Vitaminas', 'Ozônio'],
    benefits = ARRAY[
        'Fortalece unhas frágeis e quebradiças',
        'Combate fungos e previne infecções',
        'Estimula o crescimento saudável das unhas',
        'Protege e nutre com óleo de girassol ozonizado',
        'Pode ser usado sozinho ou como base antes do esmalte'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'SOS_UNHAS';

-- 2. COLÁGENO COM ÁCIDO HIALURÔNICO
UPDATE public.supplements SET
    description = 'Fórmula desenvolvida para cuidar da pele, cabelos, unhas e articulações. O colágeno é a principal proteína estrutural do corpo, auxiliando na elasticidade e firmeza da pele, além de contribuir para a saúde dos ossos e articulações. O ácido hialurônico potencializa os resultados, promovendo hidratação profunda e retenção de água nas células, resultando em uma pele mais macia, vibrante e rejuvenescida. Esta combinação poderosa promove beleza, vitalidade e suporte estrutural, ajudando a manter uma aparência jovem e bem-estar ao longo do tempo.',
    recommended_dosage = 'Ingerir 2 scoops com água pela manhã. Conteúdo: 200g (rende 14 dias).',
    active_ingredients = ARRAY['Colágeno Verisol', 'Ácido Hialurônico', 'Vitamina C', 'Biotina', 'Sabor Frutas Vermelhas'],
    benefits = ARRAY[
        'Melhora a elasticidade e firmeza da pele',
        'Hidratação profunda da pele',
        'Fortalecimento de unhas e cabelos',
        'Ação antioxidante',
        'Saúde das articulações',
        'Zero açúcares',
        'Sabor frutas vermelhas'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'COLAGENO_ACIDO_HIALURONICO';

-- 3. BVB CÁLCIO CONCHA DE OSTRA
UPDATE public.supplements SET
    description = 'O único cálcio natural de concha de ostra que fortalece ossos, melhora a função muscular e apoia a saúde do sistema nervoso. Fonte natural e biodisponível de cálcio essencial para múltiplas funções vitais do organismo.',
    recommended_dosage = '2 cápsulas antes de dormir. Conteúdo: 60 Cápsulas de 600mg cada.',
    active_ingredients = ARRAY['Cálcio de Concha de Ostra Natural', '600mg por cápsula'],
    benefits = ARRAY[
        'Fortalecimento ósseo',
        'Coagulação sanguínea adequada',
        'Suporte muscular',
        'Sistema nervoso equilibrado',
        'Divisão celular',
        'Energia celular'
    ],
    contraindications = ARRAY['Contraindicado para pessoas com alergia a frutos do mar']
WHERE external_id = 'BVB_CALCIO';

-- 4. LIPO WAY
UPDATE public.supplements SET
    description = 'Transforme seu corpo com Lipoway, o segredo para queimar gordura, ganhar energia e acelerar o metabolismo. Alcance sua melhor forma e otimize seu desempenho com Lipoway! Adeus Gordurinha!',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 1.400mg cada.',
    active_ingredients = ARRAY['Termogênicos Naturais', '1.400mg por cápsula'],
    benefits = ARRAY[
        'Queima Gordura e é Termogênico',
        'Fornece Energia',
        'Acelera o Metabolismo',
        'Auxilia no Ganho de Massa Magra',
        'Transformação corporal'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'LIPOWAY';

-- 5. BVB SB (SECA BARRIGA)
UPDATE public.supplements SET
    description = 'Um suplemento que combina antioxidantes, fibras e nutrientes essenciais. Um verdadeiro escudo para a sua imunidade, pele, articulações e bem-estar, tudo em um só produto! Queime gordura, domine seu metabolismo e transforme seu corpo com BVB SB!',
    recommended_dosage = '2 cápsulas 30 minutos antes do almoço. Conteúdo: 60 Cápsulas de 600mg cada.',
    active_ingredients = ARRAY['Antioxidantes', 'Fibras', 'Nutrientes Essenciais', '600mg por cápsula'],
    benefits = ARRAY[
        'Promove saciedade prolongada, ajudando no controle do apetite',
        'Auxilia na redução da absorção de gorduras e carboidratos',
        'Contribui para o controle glicêmico e lipídico',
        'Estimula o metabolismo e a queima de gordura corporal',
        'Ação antioxidante e anti-inflamatória',
        'Favorece o funcionamento intestinal',
        'Suporte à saúde da pele, articulações e imunidade'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'BVB_SB';

-- 6. WINNER ÓLEO PARA PERNAS
UPDATE public.supplements SET
    description = 'O campeão voltou, desde 1986, com formulação original e ozonizado. Formulado para oferecer alívio imediato e cuidado contínuo. Sua composição exclusiva combina óleo ozonizado com um mix de ativos vasoprotetores, proporcionando benefícios únicos para a saúde e bem-estar das pernas. Entre suas principais ações, destaca-se a capacidade de ativar a circulação, auxiliando na redução da sensação de peso e cansaço. Além disso, promove frescor instantâneo, devolvendo leveza e conforto ao longo do dia. Graças à união de tecnologia e ativos naturais, o Winner se torna um aliado indispensável para quem busca cuidar da circulação, prevenir desconfortos e manter a vitalidade das pernas.',
    recommended_dosage = 'Aplicar o óleo nas pernas com movimentos circulares suaves até completa absorção. Pode ser utilizado diariamente, principalmente após o banho ou em momentos de cansaço. Conteúdo: 120ml.',
    active_ingredients = ARRAY['Castanha da Índia', 'Óleo de Calêndula', 'Óleo de Amêndoas', 'Óleo Semente de Uva', 'Cânfora', 'Mentol', 'Ozônio'],
    benefits = ARRAY[
        'Ativa a circulação sanguínea',
        'Alivia a sensação de peso e cansaço',
        'Devolve frescor imediato',
        'Ação vasoprotetora',
        'Favorece a vitalidade das pernas',
        'Relaxamento e bem-estar'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'WINNER_OLEO_PERNAS';

-- 7. VITAMINA K2
UPDATE public.supplements SET
    description = 'O GPS que o seu corpo precisa. A vitamina K2 direciona o cálcio para os ossos e impede o acúmulo nas artérias. Ativa a osteocalcina, proteína essencial para a força e densidade óssea, promovendo saúde cardiovascular ao prevenir a deposição de cálcio nas artérias. Sua poderosa sinergia com a Vitamina D3 potencializa os benefícios para ossos e coração, prevenindo osteoporose e mantendo o sistema cardiovascular saudável.',
    recommended_dosage = '2 cápsulas na hora do almoço. Conteúdo: 60 Cápsulas de 600mg cada.',
    active_ingredients = ARRAY['Vitamina K2', '600mg por cápsula'],
    benefits = ARRAY[
        'Saúde óssea',
        'Proteção cardiovascular',
        'Sinergia com a vitamina D3',
        'Prevenção de osteoporose',
        'Direcionamento de cálcio para ossos',
        'Prevenção de acúmulo de cálcio nas artérias'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'VITAMINA_K2';

-- 8. FRESH GLOW CREME CORPORAL
UPDATE public.supplements SET
    description = 'Uma combinação perfeita de ozônio, colágeno e elastina, que atuam para proporcionar firmeza, elasticidade e hidratação profunda para a pele do corpo. Este creme é ideal para o cuidado diário, proporcionando uma pele saudável, suave e protegida. Revitalize sua pele com hidratação e firmeza.',
    recommended_dosage = 'Uso Diário. Aplicar no corpo após o banho. Conteúdo: 200g.',
    active_ingredients = ARRAY['Ozônio', 'Colágeno', 'Elastina'],
    benefits = ARRAY[
        'Ação purificadora e regenerativa',
        'Prevenção do envelhecimento',
        'Hidratação e maciez',
        'Firmeza e elasticidade',
        'Revitalização da pele'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'FRESH_GLOW_CREME';

-- 9. VITAMINA C 400MG
UPDATE public.supplements SET
    description = 'Apresentamos a Vitamina C, o seu segredo para rejuvenescimento, longevidade e imunidade. Seja o seu melhor e sinta-se incrível com a Vitamina C! Mais Longevidade para a sua Vida. Proteção Contra Radicais Livres e Combate a Vírus e Bactérias.',
    recommended_dosage = '01 Cápsula ao dia. Conteúdo: 30 Cápsulas de 400mg cada (conteúdo por cápsula: 250mg). Peso Líquido: 12g.',
    active_ingredients = ARRAY['Vitamina C 400mg', '250mg de conteúdo por cápsula'],
    benefits = ARRAY[
        'Rejuvenescimento da Pele',
        'Promoção de Longevidade',
        'Reforço do Sistema Imunológico',
        'Proteção Contra Radicais Livres',
        'Combate a Vírus e Bactérias',
        'Antioxidante poderoso'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'VITAMINA_C_400MG';

-- 10. FRESH GLOW LOÇÃO ADSTRINGENTE
UPDATE public.supplements SET
    description = 'O FreshGlow Loção Adstringente combina ativos potentes como Alantoina, Aloe Vera, D-Pantenol, Ácido de Frutas e Vitamina E, formulada para limpar, purificar e tonificar profundamente a pele. Pele limpa, fresca e equilibrada.',
    recommended_dosage = 'Uso Diário. Aplicar no rosto após a limpeza. Conteúdo: 250ml.',
    active_ingredients = ARRAY['Alantoína', 'Aloe Vera', 'D-Pantenol', 'Ácido de Frutas', 'Vitamina E', 'Ozônio'],
    benefits = ARRAY[
        'Esfoliante natural que remove células mortas',
        'Aumenta a elasticidade da pele',
        'Oferece propriedades calmantes',
        'Limpeza profunda',
        'Tonificação da pele',
        'Equilíbrio do pH'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'FRESH_GLOW_LOCAO';

-- 11. BVB COLEST (CRANBERRY)
UPDATE public.supplements SET
    description = 'Um suplemento formulado com tecnologia exclusiva para atuar em três frentes essenciais do organismo. Ele contribui para a proteção do trato urinário, auxiliando na prevenção de infecções e no equilíbrio da flora. Sua ação antioxidante ajuda a neutralizar os radicais livres, que em excesso podem causar envelhecimento celular precoce e favorecer o desenvolvimento de doenças crônicas. Além disso, o BVB Colest apoia o equilíbrio dos níveis de colesterol, favorecendo a saúde cardiovascular e a manutenção de uma boa circulação. Com essa combinação de benefícios, o BVB Colest se torna um aliado importante para quem busca bem-estar, vitalidade e proteção diária. Fonte de Proantocianidinas Cranberry.',
    recommended_dosage = '2 cápsulas na hora do almoço. Conteúdo: 60 Cápsulas de 600mg cada.',
    active_ingredients = ARRAY['Cranberry', 'Proantocianidinas', '600mg por cápsula'],
    benefits = ARRAY[
        'Saúde do trato urinário',
        'Ação antioxidante',
        'Auxílio na redução do colesterol ruim (LDL)',
        'Apoio ao sistema imunológico',
        'Prevenção de infecções',
        'Equilíbrio da flora intestinal',
        'Saúde cardiovascular'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'BVB_COLEST';

-- 12. FRESH GLOW SABONETE FACIAL
UPDATE public.supplements SET
    description = 'Com uma fórmula enriquecida com extrato de kiwi, ozônio e aloe vera, esse sabonete promove a remoção de impurezas, desobstrução dos poros e combate aos radicais livres, enquanto mantém a pele hidratada e equilibrada. Frescor e luminosidade em cada limpeza.',
    recommended_dosage = 'Uso Diário. Aplicar no rosto com movimentos circulares suaves. Conteúdo: 200g.',
    active_ingredients = ARRAY['Extrato de Kiwi', 'Ozônio', 'Aloe Vera'],
    benefits = ARRAY[
        'Limpeza profunda e revitalização',
        'Ação purificadora e renovadora',
        'Hidratação e suavização',
        'Desobstrução dos poros',
        'Combate aos radicais livres',
        'Mantém a pele hidratada e equilibrada'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'FRESH_GLOW_SABONETE';

-- 13. BVB D3K2
UPDATE public.supplements SET
    description = 'Descubra o nosso BVB D3K2, um suplemento que irá renovar a sua saúde, melhorando a sua imunidade, e prevenindo a calvície, além de proporcionar diversos outros benefícios que apenas a nossa incrível fórmula pode trazer. A Fórmula Perfeita para sua Saúde.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 700mg cada.',
    active_ingredients = ARRAY['Vitamina D3', 'Vitamina K2', '700mg por cápsula'],
    benefits = ARRAY[
        'Combate Doenças Autoimunes e do Coração',
        'Contribui para Dentes Saudáveis e Previne a Calvície',
        'Importante para a Coagulação Sanguínea',
        'Melhora a Função Hormonal',
        'Previne Infarto',
        'Renova saúde e imunidade'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'BVB_D3K2';

-- 14. SD ARTRO
UPDATE public.supplements SET
    description = 'Quer uma vida Sem Dor? Com o SD ARTRO, isso é possível! Nossa poderosa fórmula promove saúde óssea, muscular e das articulações. Descubra o caminho para uma vida sem limitações. Alívio nas articulações e força nos músculos.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 600mg cada.',
    active_ingredients = ARRAY['Ingredientes para articulação', '600mg por cápsula'],
    benefits = ARRAY[
        'Previne Contra a Trombose',
        'Melhora a Musculatura',
        'Auxilia na Redução de Inflamações',
        'Indicado para Artrite, Artrose e Dores nas Articulações',
        'Promove saúde óssea e muscular',
        'Vida sem limitações'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'SD_ARTRO';

-- 15. COLÁGENO TIPO II
UPDATE public.supplements SET
    description = 'Descubra o Colágeno Tipo II: um suplemento essencial para uma vida saudável e ativa. Fortalece músculos e ossos, reduz inflamações e trata lesões. Experimente seus incríveis benefícios e transforme sua jornada de bem-estar. Aumente a Elasticidade das Articulações.',
    recommended_dosage = '01 comprimido ao dia. Conteúdo: 30 Comprimidos de 500mg cada. Peso Líquido: 15g.',
    active_ingredients = ARRAY['Colágeno Tipo II', 'Vitamina E', '500mg por comprimido'],
    benefits = ARRAY[
        'Melhora a Musculatura',
        'Auxilia na Redução de Inflamações',
        'Melhora a Saúde Óssea',
        'Auxilia no Tratamento de Lesões e Cartilagens',
        'Auxilia no Tratamento de Artrite Reumatoide',
        'Aumenta elasticidade das articulações'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'COLAGENO_TIPO_II';

-- 16. ÓLEO DE PRÍMULA
UPDATE public.supplements SET
    description = 'Apresentamos o Óleo de Prímula, seu parceiro na busca por uma vida mais saudável. Transforme sua rotina com o Óleo de Prímula. Saúde para o Corpo.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 500mg cada.',
    active_ingredients = ARRAY['Óleo de Prímula', '500mg por cápsula'],
    benefits = ARRAY[
        'Fortalece o Sistema Imunológico',
        'Auxilia na Perda de Peso',
        'Combate a Má Digestão',
        'Promove Saúde da Pele',
        'Equilíbrio hormonal',
        'Bem-estar geral'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'OLEO_PRIMULA';

-- 17. GOLD MONEY PERFUME
UPDATE public.supplements SET
    description = 'Desafie as probabilidades. Supere os limites. Com Gold Money, você é invencível. Entre em um mundo de elegância e luxo com Car Black, uma fragrância inspirada no lendário Ferrari Black.',
    recommended_dosage = 'Uso externo. Aplicar nas áreas de pulso e pescoço. Conteúdo: 100ml | 3,38 FL OZ.',
    active_ingredients = ARRAY['Fragrância Premium'],
    benefits = ARRAY[
        'Fragrância marcante',
        'Longa duração',
        'Elegância e sofisticação',
        'Inspiração Ferrari Black'
    ],
    contraindications = ARRAY['Evitar contato com os olhos']
WHERE external_id = 'GOLD_MONEY';

-- 18. LIB WAY
UPDATE public.supplements SET
    description = 'Formulado com uma combinação potente de boro, aspartato, arginina e taurina, este suplemento foi cuidadosamente criado para promover o bem-estar sexual, aumentar os níveis de energia e melhorar o desempenho sexual. Sua confiança de volta, sua potência garantida.',
    recommended_dosage = '01 Cápsula ao dia. Conteúdo: 30 Cápsulas Soft Gel de 760mg cada.',
    active_ingredients = ARRAY['Boro', 'Aspartato', 'Arginina', 'Taurina', '760mg por cápsula'],
    benefits = ARRAY[
        'Aumento dos hormônios',
        'Melhora do Desempenho Sexual',
        'Contribui no aumento da Libido',
        'Aumenta os níveis de energia',
        'Bem-estar sexual'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'LIBWAY';

-- 19. BVB B12
UPDATE public.supplements SET
    description = 'A Vitamina B12 é vital para a saúde geral, contribuindo para a produção de energia e a manutenção do sistema nervoso, reforçando a importância de uma dieta balanceada ou suplementação adequada para evitar deficiências. Energia para a Mente e o Corpo. Metilcobalamina.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 350mg cada. Conteúdo Líquido: 21g.',
    active_ingredients = ARRAY['Vitamina B12 (Metilcobalamina)', '350mg por cápsula'],
    benefits = ARRAY[
        'Previne problemas cardíacos e derrame cerebral',
        'Prevenção de doenças como Alzheimer',
        'Melhor oxigenação no seu corpo',
        'Produção de energia',
        'Manutenção do sistema nervoso',
        'Saúde geral'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'BVB_B12';

-- 20. BVB INSU
UPDATE public.supplements SET
    description = 'Conheça o nosso BVBINSU, um incrível suplemento que irá tratar problemas como colesterol e a diabetes, trazendo mais saúde e bem-estar para a sua vida. O Caminho para o Equilíbrio e Bem-Estar.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 700mg cada.',
    active_ingredients = ARRAY['Ingredientes naturais para controle glicêmico', '700mg por cápsula'],
    benefits = ARRAY[
        'Diminui o Colesterol "Ruim" (LDL) e Triglicerídeos',
        'Auxilia no Tratamento da Diabetes ou Resistência à Insulina',
        'Diminui a Fome e a Compulsão Alimentar por Doces',
        'Mantém a Saúde da Pele e dos Cabelos',
        'Equilíbrio glicêmico',
        'Bem-estar geral'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'BVB_INSU';

-- 21. VITAMIX SKIN
UPDATE public.supplements SET
    description = 'Cuide Da Sua Pele Do Jeito Que Ela Merece! Desfrute de todo o poder do VITAMIX SKIN e mantenha sua pele saudável, firme e protegida contra o envelhecimento precoce.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 310mg cada.',
    active_ingredients = ARRAY['Vitaminas para pele', '310mg por cápsula'],
    benefits = ARRAY[
        'Melhora a Elasticidade da Pele',
        'Reduz Linhas de Expressão',
        'Regeneração das Células',
        'Firmeza e proteção',
        'Combate envelhecimento precoce'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'VITAMIX_SKIN';

-- 22. ÁCIDO HIALURÔNICO FITIOS
UPDATE public.supplements SET
    description = 'Com o nosso Ácido Hialurônico, diga adeus à flacidez e recupere a elasticidade da pele, desafiando os efeitos do tempo. Surpreenda-se! Refaz o que o Tempo Desfaz! Com Vitamina B5 e Vitamina C.',
    recommended_dosage = '01 Cápsula ao dia. Conteúdo: 30 Comprimidos de 800mg cada. Peso Líquido: 24g.',
    active_ingredients = ARRAY['Ácido Hialurônico', 'Vitamina B5', 'Vitamina C', '800mg por comprimido'],
    benefits = ARRAY[
        'Melhora a Elasticidade da Pele',
        'Reduz Linhas de Expressão',
        'Regeneração das Células',
        'Combate flacidez',
        'Recupera elasticidade da pele'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'ACIDO_HIALURONICO_FITIOS';

-- 23. ÔMEGA 3
UPDATE public.supplements SET
    description = 'Conheça o nosso Ômega 3, um suplemento nutricional poderoso que vai te proporcionar uma vida saudável e equilibrada. Este produto é uma verdadeira fonte de benefícios para a sua saúde e bem-estar. Um produto indicado para toda a família. DHA 360 / EPA 540.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas Soft Gel de 1.400mg cada. Conteúdo Líquido: 84g.',
    active_ingredients = ARRAY['Óleo de Peixe (Ômega 3)', 'DHA 360mg', 'EPA 540mg', '1.400mg por cápsula'],
    benefits = ARRAY[
        'Prevenção do Parkinson e Alzheimer',
        'Auxilia na Depressão, Doenças Cardiovasculares e Colesterol',
        'Auxilia no Controle da Pressão Arterial',
        'Ação Anti-Inflamatória e Efeito Antitrombótico',
        'Saúde cardiovascular',
        'Bem-estar geral'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'OMEGA_3_1400MG';

-- 24. VIP GLAMOUR KIT
UPDATE public.supplements SET
    description = 'Permita-se abraçar sua singularidade e realçar sua autenticidade a cada aplicação. Com o VIP Glamour Body Splash e o VIP Glamour Creme Corporal, reinvente-se diariamente e deixe um rastro de charme e sofisticação por onde passar inspirado no Vip Rose da Victoria''s Secret. Charme e sofisticação por onde passar.',
    recommended_dosage = 'Uso externo. Aplicar Body Splash e Creme Corporal diariamente. Conteúdo: 250ml cada (Kit completo).',
    active_ingredients = ARRAY['Ativos naturais', 'Fragrância sofisticada'],
    benefits = ARRAY[
        'Fragrância sofisticada',
        'Hidratação profunda',
        'Sensação de bem-estar',
        'Composto por ativos naturais',
        'Proporciona sensação refrescante',
        'Charme e sofisticação'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'VIP_GLAMOUR_KIT';

-- 25. FAIR WAY
UPDATE public.supplements SET
    description = 'A loção hidratante FairWay combina o poder do colágeno e da elastina para proporcionar uma pele mais firme, elástica e rejuvenescida. O colágeno fortalece e dá estrutura, enquanto a elastina mantém a pele flexível e resistente, combatendo flacidez e sinais de envelhecimento. Além de fortalecer e revitalizar, possui uma fragrância exclusiva e envolvente, encantando a todos com seu aroma suave e inesquecível. Combina o poder do ozônio, colágeno e elastina.',
    recommended_dosage = 'Uso Diário. Aplicar no corpo após o banho. Conteúdo: 200g.',
    active_ingredients = ARRAY['Colágeno', 'Elastina', 'Ozônio'],
    benefits = ARRAY[
        'Estimulação da circulação sanguínea',
        'Ação antioxidante',
        'Hidratação profunda',
        'Combate flacidez',
        'Fragrância exclusiva e envolvente'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'FAIR_WAY';

-- 26. BVB ZINCO QUELATO
UPDATE public.supplements SET
    description = 'Sua imunidade merece mais do que um multivitamínico comum. BVB Zinco Quelato é formulado para máxima absorção e resultados reais. Desenvolvido com uma forma altamente biodisponível de zinco para melhor absorção. O zinco é um mineral fundamental para funções vitais: fortalecimento do sistema imunológico, auxílio na defesa contra infecções, contribuição para a saúde da pele, unhas e cabelos, promoção da cicatrização e regeneração celular, e participação em importantes processos metabólicos energéticos e hormonais, essenciais para o equilíbrio do organismo. Com sua tecnologia de quelação, o BVB Zinco Quelato oferece maior eficácia na reposição desse nutriente essencial, promovendo vitalidade, resistência e bem-estar diário.',
    recommended_dosage = '2 cápsulas ao dia, consumir 1 cápsula 1 hora antes do café da manhã e 1 cápsula 1 hora antes do almoço. Conteúdo: 60 Cápsulas de 600mg cada.',
    active_ingredients = ARRAY['Zinco Quelato', '600mg por cápsula'],
    benefits = ARRAY[
        'Ação antioxidante',
        'Saúde da pele, cabelo e unhas',
        'Fortalecimento do sistema imunológico',
        'Suporte à visão',
        'Manutenção da saúde óssea',
        'Metabolismo otimizado',
        'Máxima absorção'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'BVB_ZINCO_QUELATO';

-- 27. AMARGO (CHÁ)
UPDATE public.supplements SET
    description = 'Desfrute o poder do Amargo e transforme seu organismo em uma máquina funcional. Diga adeus à azia e à gordura no fígado, e dê as boas-vindas a um processo de emagrecimento mais saudável. Ele é Amargo, mas é Bom! Chá com vegetais para digestão e fígado.',
    recommended_dosage = '02 colheres de sopa ao dia. Conteúdo: 500ml.',
    active_ingredients = ARRAY['Extrato de Alcachofra', 'Quassia', 'Quina', 'Salsaparrilha', 'Chá de Camomila', 'Carqueja', 'Chá Verde', 'Hortelã', 'Suco de Berinjela'],
    benefits = ARRAY[
        'Promove um Organismo mais Eficiente',
        'Elimina a Azia e Desconfortos Digestivos',
        'Ajuda a Reduzir o Acúmulo de Gordura no Fígado',
        'Contribui para a Perda de Peso e Emagrecimento',
        'Melhora digestão',
        'Desintoxicação hepática'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'AMARGO';

-- 28. TOP SECRETS CREME CLAREADOR
UPDATE public.supplements SET
    description = 'Top Secrets é o seu segredo para uma pele impecável e radiante. Realce a sua beleza natural com esta fórmula incrível! O Segredo para uma Pele mais Clara e Saudável. Creme para mãos e rosto ozonizado com Rosa Mosqueta e Pantenol.',
    recommended_dosage = '02 aplicações ao dia. Conteúdo: 100g.',
    active_ingredients = ARRAY['Rosa Mosqueta', 'Pantenol', 'Extrato de Ylang Ylang', 'Ozônio'],
    benefits = ARRAY[
        'Clareamento da Pele',
        'Hidratação Profunda',
        'Efeito Rejuvenescedor',
        'Suporte na Cicatrização e Regeneração da Pele',
        'Pele impecável e radiante'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'TOP_SECRETS';

-- 29. PEELING 5X1
UPDATE public.supplements SET
    description = 'Conheça o nosso Peeling 5x1, a sua solução para uma pele mais radiante e saudável. Sinta a diferença e renove a sua beleza! Sua Pele Incrivelmente Renovada. Corpo e Rosto. Limpa, tonifica, amacia, hidrata e clareia.',
    recommended_dosage = '03 aplicações durante a semana. Conteúdo: 145g.',
    active_ingredients = ARRAY['Vitamina E'],
    benefits = ARRAY[
        'Prevenção de Rugas, Melhora da Elasticidade Cutânea e Remove as Células Mortas',
        'Hidratação e Ação Antioxidante',
        'Amacia, Nutre e Uniformiza o Tom da Pele',
        'Efeito Reparador e de Limpeza',
        '5 em 1: Limpa, Tonifica, Amacia, Hidrata e Clareia'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'PEELING_5X1';

-- 30. SEREMIX
UPDATE public.supplements SET
    description = 'Um suplemento revolucionário desenvolvido para apoiar sua saúde e bem-estar de maneira abrangente. O SEREMIX foi cuidadosamente elaborado para ajudar no equilíbrio do seu organismo e melhorar a sua noite de sono. Seu Aliado Para Uma Melhor Noite De Sono.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 500mg cada (L-Triptofano).',
    active_ingredients = ARRAY['L-Triptofano', '500mg por cápsula'],
    benefits = ARRAY[
        'Promove o relaxamento',
        'Promove uma melhor qualidade de sono',
        'Alivia o estresse',
        'Equilíbrio do organismo',
        'Bem-estar geral'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'SEREMIX';

-- 31. BVB MORO
UPDATE public.supplements SET
    description = 'É a ferramenta definitiva para quem quer mudar de dentro para fora. Entre na rotina de quem decide: mais energia, mais foco, mais definição, mais resultado! BVB Moro o suplemento que vai transformar o seu metabolismo em uma máquina de queimar gorduras!',
    recommended_dosage = '2 cápsulas 30 minutos antes do almoço. Conteúdo: 60 Cápsulas de 600mg cada.',
    active_ingredients = ARRAY['Laranja Moro', '600mg por cápsula'],
    benefits = ARRAY[
        'Auxilia no controle e na redução da gordura abdominal',
        'Contribui para a melhora do metabolismo de carboidratos e lipídios',
        'Regula a glicemia e reduz os picos de insulina',
        'Aumenta a saciedade, ajudando no controle do apetite',
        'Ação antioxidante que combate o envelhecimento precoce',
        'Estimula o corpo a usar gordura como fonte de energia',
        'Favorece a definição corporal e o equilíbrio metabólico'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'BVB_MORO';

-- 32. PROWOMAN
UPDATE public.supplements SET
    description = 'Um suplemento especialmente formulado para atender às necessidades das mulheres modernas. Cada cápsula contém uma combinação poderosa de nutrientes que trabalham em sinergia para promover saúde e bem-estar. Você Radiante e Forte Sempre.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 500mg cada.',
    active_ingredients = ARRAY['Nutrientes para mulher', '500mg por cápsula'],
    benefits = ARRAY[
        'Alivia os sintomas da Menopausa',
        'Reduz o risco de câncer de mama',
        'Equilibra os níveis hormonais',
        'Saúde feminina',
        'Bem-estar geral'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'PROWOMAN';

-- 33. SÉRUM VITAMINA C OZONIZADO
UPDATE public.supplements SET
    description = 'Para Uma Pele Radiante E Protegida, Todos Os Dias! Este poderoso antioxidante, conhecido por suas propriedades de combate aos radicais livres e estimulação da produção de colágeno, é uma verdadeira celebração da ciência e da natureza em sua forma mais pura.',
    recommended_dosage = 'Uso diário. Aplicar no rosto pela manhã e/ou à noite. Conteúdo: 20ml ou 30ml (verificar embalagem).',
    active_ingredients = ARRAY['Vitamina C', 'Ozônio'],
    benefits = ARRAY[
        'Neutraliza radicais livres',
        'Reduz a inflamação e acalma a pele',
        'Clareia manchas escuras',
        'Estimula produção de colágeno',
        'Proteção diária'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'SERUM_VITAMINA_C';

-- 34. ORGANIC OZON3 ÓLEO DE ARGAN
UPDATE public.supplements SET
    description = 'Combinando o óleo de argan, rico em ácidos graxos e vitamina E, com o poder regenerador do ozônio, ele hidrata profundamente, restaura o brilho e fortalece os fios. Ideal para todos os tipos de cabelo, especialmente os danificados. Orgânico com Ozônio. Cuidado profundo, brilho intenso.',
    recommended_dosage = 'Uso Diário. Aplicar nos cabelos úmidos ou secos. Conteúdo: 30ml e 1,01 fl.oz.',
    active_ingredients = ARRAY['Óleo de Argan Orgânico', 'Ozônio'],
    benefits = ARRAY[
        'Reparação de cabelos danificados',
        'Hidratação profunda',
        'Ação antioxidante',
        'Restaura o brilho',
        'Fortalece os fios'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'ORGANIC_OZON3_ARGAN';

-- 35. POLIVITAMIX
UPDATE public.supplements SET
    description = 'Descubra o segredo para uma vida mais saudável e ativa com nosso polivitamínico. Sua incrível fórmula fornece mais energia e saúde para o seu dia a dia. Agora com Ômega 3.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 700mg cada.',
    active_ingredients = ARRAY['Vitaminas A-Z', 'Minerais', 'Ômega 3 (MEG-3)', '700mg por cápsula'],
    benefits = ARRAY[
        'Fortalece o Sistema Imunológico: Reforça suas defesas naturais para combater doenças',
        'Regula o Metabolismo: Mantém seu corpo em equilíbrio para um funcionamento saudável',
        'Energia e Vitalidade: Combate a fadiga e mantém a vitalidade ao longo do dia',
        'Saúde Óssea e Mental: Promove ossos fortes e melhora o desempenho físico e mental',
        'Suporte completo nutricional'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'POLIVITAMIX';

-- 36. LIFE WAY GEL MASSAGEADOR
UPDATE public.supplements SET
    description = 'Com mentol, cânfora, centella asiática, chá verde, alecrim e óleo de girassol ozonizado, ele promove frescor, relaxamento e cuidado com a pele, aliviando tensões musculares e tonificando. Experimente e transforme sua rotina em um momento de autocuidado! Chega de conviver com dores, sinta a diferença.',
    recommended_dosage = 'Uso Diário. Aplicar com movimentos de massagem nas áreas doloridas. Conteúdo: 150g.',
    active_ingredients = ARRAY['Mentol', 'Cânfora', 'Centella Asiática', 'Chá Verde', 'Alecrim', 'Óleo de Girassol Ozonizado'],
    benefits = ARRAY[
        'Alívio imediato de dores musculares, sensação de relaxamento e bem-estar ao ser aplicado',
        'Pele tonificada e suave e suavidade à pele',
        'Alívio muscular',
        'Relaxamento profundo',
        'Cuidado com a pele'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'LIFE_WAY_GEL';

-- 37. VISION WAY
UPDATE public.supplements SET
    description = 'Sua fórmula combina luteína e zeaxantina, que filtram a luz azul e protegem contra os raios UV, com DHA, um ácido graxo essencial para a função visual e a prevenção de doenças oculares. A escolha ideal para uma visão saudável e protegida. Proteção avançada, visão clara para a sua vida.',
    recommended_dosage = '01 Cápsula ao dia. Conteúdo: 30 Cápsulas Soft Gel de 750mg cada.',
    active_ingredients = ARRAY['Luteína', 'Zeaxantina', 'DHA', 'Óleo de Cártamo', '750mg por cápsula'],
    benefits = ARRAY[
        'Redução da síndrome de olho seco',
        'Prevenção de inflamações oculares',
        'Melhora da circulação ocular',
        'Proteção contra luz azul e raios UV',
        'Prevenção de doenças oculares',
        'Função visual otimizada'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'VISION_WAY';

-- 38. BVB Q10
UPDATE public.supplements SET
    description = 'A Q10 é essencial para a produção de energia, saúde cardiovascular, proteção antioxidante e função neurológica, tornando-a um suplemento valioso para promover a saúde geral e o bem-estar. O Suporte Completo para uma Vida Equilibrada.',
    recommended_dosage = '01 Cápsula ao dia. Conteúdo: 30 Cápsulas de 700mg cada. Conteúdo Líquido: 21g.',
    active_ingredients = ARRAY['Coenzima Q10', '700mg por cápsula'],
    benefits = ARRAY[
        'Produção de energia',
        'Contribui a melhorar a fertilidade',
        'Diminui as chances de doenças cardiovasculares',
        'Proteção antioxidante',
        'Função neurológica',
        'Saúde geral e bem-estar'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'BVB_Q10';

-- 39. SABONETE ÍNTIMO SEDUÇÃO
UPDATE public.supplements SET
    description = 'Apresentamos Sedução, o sabonete íntimo incrível, desenvolvido com o cuidado que sua saúde íntima merece. Porque o bem-estar do seu corpo começa com uma higiene adequada. Fragrância Delicada. Nova Fórmula.',
    recommended_dosage = 'Uso diário. Aplicar na região íntima durante o banho. Conteúdo: 200ml.',
    active_ingredients = ARRAY['Morango', 'Malva', 'Barbatimão', 'pH neutro'],
    benefits = ARRAY[
        'Mantém o PH da Região Íntima Equilibrado',
        'Estimula o Processo Imunológico',
        'Auxilia no Processo da Candidíase',
        'Previne Doenças Ginecológicas',
        'Fragrância delicada',
        'Proteção & Segurança 24h'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'SABONETE_INTIMO_SEDUCAO';

-- 40. TÊNIS BIOQUÂNTICO
UPDATE public.supplements SET
    description = 'A verdadeira revolução da NemasWay em tecnologia e conforto. Com íons magnéticos, infra-vermelho longo, tecido inteligente para proporcionar conforto, palmilha que se ajusta no Pé para o alinhamento da coluna e frequência para proporcionar energia e disposição. Caminhar com saúde, tecnologia e conforto com o novo tênis NemasWay!',
    recommended_dosage = 'Uso diário. Usar durante caminhadas e atividades físicas. 1 par.',
    active_ingredients = ARRAY['Íons Magnéticos', 'Infra-vermelho Longo', 'Tecido Inteligente', 'Palmilha Ajustável'],
    benefits = ARRAY[
        'Alivia as dores na coluna',
        'Correção de postura',
        'Bem estar e conforto',
        'Energia e disposição',
        'Tecnologia avançada'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'TENIS_BIOQUANTICO';

-- 41. MELATONINA
UPDATE public.supplements SET
    description = 'Promove relaxamento físico e mental e desperta pronto para viver o dia com energia e bem-estar. Diga adeus às noites em claro e dê boas-vindas a um sono profundo e revigorante! Durma profundamente e acorde renovado! A Melatonina da Nemasway é seu aliado para noites completas e restauradoras.',
    recommended_dosage = '2 cápsulas 30 minutos antes de dormir. Conteúdo: 60 Cápsulas de 600mg cada.',
    active_ingredients = ARRAY['Melatonina', '600mg por cápsula'],
    benefits = ARRAY[
        'Auxilia no início do sono, reduzindo o tempo para adormecer',
        'Melhora a qualidade do sono, favorecendo ciclos completos e restauradores',
        'Promove relaxamento físico e mental',
        'Auxilia em quadros de insônia leve, jet lag e rotina noturna desregulada',
        'Contribui para o equilíbrio hormonal e bem-estar geral',
        'Sono profundo e revigorante'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'MELATONINA';

-- 42. CREATINA COM Q10
UPDATE public.supplements SET
    description = 'Corpo em forma, mente em equilíbrio: nutrição avançada com Creatina e Coenzima Q10. A creatina é fundamental para a produção de energia durante exercícios de alta intensidade, melhorando o desempenho físico e mental. A Coenzima Q10 potencializa esses efeitos, aumentando força, resistência e recuperação pós-treino. Juntos, promovem foco, concentração, combate à fadiga, ação antioxidante e saúde cardiovascular.',
    recommended_dosage = 'Diluir 3g / 1 scoop em 150ml de água. Conteúdo: 300g. Creatina 3g 100% Pura. Uso Adulto - Uso Oral.',
    active_ingredients = ARRAY['Creatina Monohidratada', 'Coenzima Q10Z', '3g por dose'],
    benefits = ARRAY[
        'Mais energia e resistência física',
        'Foco mental e desempenho cognitivo',
        'Saúde do coração',
        'Ação antioxidante e antienvelhecimento',
        'Combate ao cansaço crônico',
        'Aumento de força e massa muscular',
        'Recuperação pós-treino'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'CREATINA_Q10';

-- 43. KIT ORGANIC OZON3 CAPILAR
UPDATE public.supplements SET
    description = 'Com o poder purificador e regenerador do ozônio, o Organic Ozon3 não só alisa os fios, como também nutre profundamente, repara danos e revitaliza a fibra capilar. O resultado são cabelos mais lisos, com brilho intenso, movimento natural e proteção. Cabelos lisos, leves e radiantes.',
    recommended_dosage = 'Uso profissional/doméstico. Aplicar Shampoo e Alinhamento conforme instruções. Conteúdo: 550ml cada (Kit completo). Observação: Produto para ser aplicado por um profissional cabeleireiro.',
    active_ingredients = ARRAY['Ozônio', 'Tanino', 'Argan Orgânico', '0% Formaldeído'],
    benefits = ARRAY[
        'Ação antioxidante e antibacteriana',
        'Facilidade de manutenção',
        'Redução do frizz',
        'Alisa e nutre profundamente',
        'Repara danos e revitaliza',
        'Brilho intenso e movimento natural'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'KIT_ORGANIC_OZON3';

-- 44. SÉRUM RETINOL OZONIZADO
UPDATE public.supplements SET
    description = 'Descubra o Sérum Retinol Ozonizado, formulado com Vitamina E, Ácido Hialurônico e Colágeno. Este sérum rejuvenescedor reduz rugas e linhas finas, enquanto a Vitamina E protege contra os radicais livres. Revitalize Sua Pele Com O Poder Do Retinol E A Pureza Do Ozônio!',
    recommended_dosage = 'Uso diário. Aplicar no rosto à noite. Conteúdo: 20ml ou 30ml (verificar embalagem).',
    active_ingredients = ARRAY['Retinol', 'Vitamina E', 'Ácido Hialurônico', 'Colágeno', 'Ozônio'],
    benefits = ARRAY[
        'Protege a pele de radicais livres',
        'Reduz os sinais de envelhecimento',
        'Promove a elasticidade e firmeza da pele',
        'Reduz rugas e linhas finas',
        'Rejuvenescimento profundo'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'SERUM_RETINOL';

-- 45. SD FIBRO3 COM CÚRCUMA
UPDATE public.supplements SET
    description = 'Apresentamos o nosso impressionante SDFIBRO3, uma fusão poderosa de três tipos de magnésio com a riqueza do cúrcuma. Este tratamento excepcional oferece alívio eficaz contra dores e inflamações. Para uma vida sem dor.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 600mg cada.',
    active_ingredients = ARRAY['Magnésio Quelato', 'Dimagnésio Malato', 'Taurato de Magnésio', 'Cúrcuma', '600mg por cápsula'],
    benefits = ARRAY[
        'Combate as Dores da Fibromialgia e da Osteoporose',
        'Adeus Enxaqueca e Alívio da Asma',
        'Melhora a Saúde do Sistema Cardiovascular, Sistema Nervoso, Saúde Óssea, do Intestino e Musculatura',
        'Alívio eficaz contra dores e inflamações',
        'Tratamento completo'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'SD_FIBRO3';

-- 46. SPIRULINA + VITAMINA E
UPDATE public.supplements SET
    description = 'Potencialize sua saúde com Spirulina, nosso incrível suplemento que proporciona uma limpeza completa em seu organismo, para que sua saúde esteja sempre em dia! Uma Limpeza Completa para o seu Organismo!',
    recommended_dosage = '03 Comprimidos ao dia. Conteúdo: 90 Comprimidos de 1000mg cada. Peso Líquido: 60g.',
    active_ingredients = ARRAY['Spirulina', 'Vitamina E', '1000mg por comprimido'],
    benefits = ARRAY[
        'Age como um Poderoso Antioxidante, combate os Radicais Livres',
        'Possui Ação Anti-Inflamatória',
        'Colabora para uma Flora Intestinal Saudável',
        'Reduz os Sintomas do Cansaço',
        'Limpeza completa do organismo',
        'Saúde geral'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'SPIRULINA_VIT_E';

-- 47. ÓLEO DE GIRASSOL OZONIZADO
UPDATE public.supplements SET
    description = 'Experimente nosso incrível Óleo de Girassol Ozonizado para uma pele saudável e rejuvenescida. Sua tecnologia avançada promove uma cicatrização eficaz. Com ele: manchas, acnes, ou qualquer problema de pele não serão mais um problema!',
    recommended_dosage = '02 aplicações ao dia. Aplicar nas áreas afetadas. Conteúdo: 30ml e 1,01 fl.oz.',
    active_ingredients = ARRAY['Óleo de Girassol', 'Ozônio'],
    benefits = ARRAY[
        'Combate Acnes, Rugas e Promove a Renovação Celular',
        'Hidratação anti-idade e ativação de colágeno',
        'Alto Poder de Cicatrização e Tratamento de Queimaduras',
        'Ação Antioxidante, Antimicrobiana e Alívio para a Psoríase',
        'Tecnologia avançada',
        'Cicatrização eficaz'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'OLEO_GIRASSOL_OZONIZADO';

-- 48. ÓLEO REGENERADOR OZONIZADO
UPDATE public.supplements SET
    description = 'Descubra a verdadeira revolução nos cuidados com a pele com o nosso Óleo Regenerador. Uma sinfonia natural de ingredientes preciosos, cada gota é um elixir de rejuvenescimento. A Transformação Começa em Cada Gota.',
    recommended_dosage = 'Diariamente a noite. Aplicar no rosto com movimentos suaves. Conteúdo: 30ml e 1,01 Fl. Oz.',
    active_ingredients = ARRAY['Rosa Mosqueta', 'Semente de Uva', 'Copaíba', 'Girassol Extra Virgem', 'Ozônio'],
    benefits = ARRAY[
        'Promove a Regeneração Celular, Reduzindo a Aparência de Rugas e Linhas Finas',
        'Rica em Antioxidantes',
        'Promove a Elasticidade e Nutrição da Pele',
        'Redução de Cicatrizes e Manchas',
        'Elixir de rejuvenescimento'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'OLEO_REGENERADOR';

-- 49. GEL CRIOTERÁPICO
UPDATE public.supplements SET
    description = 'Com o nosso Gel Crioterápico, você terá uma solução de alta performance para lhe auxiliar com a perda de peso, redução de medidas e tratar a celulite. Transforme a sua rotina de cuidados com a nossa poderosa fórmula! Seu Corpo, sua Regra: Sem Espaço para Pneuzinhos.',
    recommended_dosage = 'Uso diário. Aplicar nas áreas desejadas com movimentos circulares. Conteúdo: 500g.',
    active_ingredients = ARRAY['Mentol', 'Centella Asiática', 'Alga Fucus', 'Colágeno'],
    benefits = ARRAY[
        'Redução de Gordura Localizada',
        'Modelagem do Contorno Corporal',
        'Ação Drenante para Redução do Inchaço',
        'Melhora na Textura da Pele, deixando-a mais Lisa e Firme',
        'Tratamento de celulite',
        'Alta performance'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'GEL_CRIOTERAPICO';

-- 50. FOCUS TDAH PREMIUM
UPDATE public.supplements SET
    description = 'Descubra o poder do Focus TDAH e desperte todo o potencial da sua mente! Com uma fórmula inovadora, o Focus TDAH combina ingredientes poderosos para proporcionar mais foco, clareza mental e equilíbrio emocional. Essa solução completa auxilia no aumento da concentração, reduz a fadiga mental e melhora o bem-estar, ajudando você a manter a produtividade sem abrir mão da tranquilidade. Seja para otimizar os estudos, o trabalho ou as atividades do dia a dia, Focus TDAH é o suporte que sua mente precisa! Foco, clareza e equilíbrio para sua mente!',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 500mg cada.',
    active_ingredients = ARRAY['Nootrópicos', '500mg por cápsula'],
    benefits = ARRAY[
        'Melhora do foco e concentração',
        'Redução do estresse e ansiedade',
        'Melhora do humor e bem-estar',
        'Proteção do sistema nervoso',
        'Aumento da energia e disposição',
        'Redução da fadiga mental',
        'Otimização de estudos e trabalho'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'FOCUS_TDAH';

-- 51. CAR BLACK PERFUME
UPDATE public.supplements SET
    description = 'Entre em um mundo de elegância e luxo com Car Black, uma fragrância inspirada no lendário Ferrari Black. Desafie as probabilidades. Supere os limites.',
    recommended_dosage = 'Uso externo. Aplicar nas áreas de pulso e pescoço. Conteúdo: 100ml | 3,38 FL OZ.',
    active_ingredients = ARRAY['Fragrância Premium Masculina'],
    benefits = ARRAY[
        'Fragrância masculina',
        'Sofisticação',
        'Elegância e luxo',
        'Longa duração'
    ],
    contraindications = ARRAY['Evitar contato com os olhos']
WHERE external_id = 'CAR_BLACK';

-- 52. MADAME X PERFUME
UPDATE public.supplements SET
    description = 'Descubra sua singularidade com nossa fragrância inspirada no Coco Mademoiselle. Revele sua autenticidade, abrace suas escolhas, sua história e sua aura.',
    recommended_dosage = 'Uso externo. Aplicar nas áreas de pulso e pescoço. Conteúdo: 100ml | 3,38 FL OZ.',
    active_ingredients = ARRAY['Fragrância Premium Feminina'],
    benefits = ARRAY[
        'Fragrância feminina',
        'Elegância',
        'Singularidade e autenticidade',
        'Longa duração'
    ],
    contraindications = ARRAY['Evitar contato com os olhos']
WHERE external_id = 'MADAME_X';

-- 53. MOLÉCULA DA VIDA
UPDATE public.supplements SET
    description = 'Descubra o poder da Molécula da Vida e cuide do seu sistema digestivo de forma natural e eficaz! Com ação anti-inflamatória e protetora, auxilia no alívio de gastrite, úlceras e inflamações intestinais, além de combater a bactéria H. pylori e melhorar a saúde da mucosa intestinal.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 300mg cada.',
    active_ingredients = ARRAY['Molécula da Vida', '300mg por cápsula'],
    benefits = ARRAY[
        'Melhora da saúde digestiva e da mucosa intestinal',
        'Alívio de gastrite, úlceras e desconfortos gastrointestinais',
        'Ação anti-inflamatória natural e potente',
        'Redução do ácido araquidônico (inflamatório)',
        'Proteção contra a bactéria H. pylori',
        'Promoção do equilíbrio intestinal e digestivo'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'MOLECULA_DA_VIDA';

-- 54. MEGA NUTRI RX21
UPDATE public.supplements SET
    description = 'Apresentamos o RX21, a solução completa para fortalecer e cuidar da beleza dos seus cabelos e unhas. Sinta a diferença e exiba fios fortes e unhas saudáveis. Tratamento para Cabelo, Pele e Unhas.',
    recommended_dosage = '01 Comprimido ao dia. Conteúdo: 30 Comprimidos de 800mg cada. Peso Líq.: 24g.',
    active_ingredients = ARRAY['Vitaminas e Minerais', '800mg por comprimido'],
    benefits = ARRAY[
        'Reduz a Queda Capilar',
        'Fortalece e Aumenta a Elasticidade dos Fios Capilares, tornando-os mais Fortes',
        'Promove Unhas Saudáveis e Menos Quebradiças',
        'Estimula o Crescimento do Cabelo e das Unhas',
        'Solução completa para beleza'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'MEGA_NUTRI_RX21';

-- 55. ÓLEO DE MASSAGEM OZONIZADO
UPDATE public.supplements SET
    description = 'Explore os benefícios revigorantes do nosso incrível Óleo de Massagem Ozonizado, uma solução completa para o seu bem-estar. Com uma fórmula potente, este óleo oferece um tratamento completo para todas as suas dores. Tratamento para o Corpo Inteiro. Para as Pernas com árnica e óleo de girassol ozonizado.',
    recommended_dosage = 'Uso diário. Aplicar com movimentos de massagem nas áreas desejadas. Conteúdo: 120ml.',
    active_ingredients = ARRAY['Arnica', 'Óleo de Girassol Ozonizado', 'Biotecnologia Avançada'],
    benefits = ARRAY[
        'Tratamento eficaz para hematomas',
        'Promove o relaxamento muscular e alivia tensões',
        'Auxilia no tratamento de varizes',
        'Ativa articulações e melhora a circulação sanguínea',
        'Relaxamento profundo',
        'Bem-estar geral'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'OLEO_MASSAGEM_OZONIZADO';

-- 56. PRÓPOLIS VERDE
UPDATE public.supplements SET
    description = 'Potencialize seu sistema imunológico com nosso Própolis Verde. Sua fórmula poderosa combate infecções bacterianas, fúngicas e virais, acelera a cicatrização e previne doenças cardiovasculares. Cuide da sua saúde com eficácia. Imunidade Imediata em uma Única Cápsula.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas Soft Gel de 300mg cada.',
    active_ingredients = ARRAY['Própolis Verde', '300mg por cápsula'],
    benefits = ARRAY[
        'Reforça o Sistema Imunológico para Maior Resistência a Infecções',
        'Acelera a Cicatrização de Feridas, Incluindo Queimaduras',
        'Alivia Desconfortos Relacionados à Faringite, Amigdalite, Gripes e Resfriados',
        'Contribui para a Prevenção de Infecções e Promove a Saúde Geral',
        'Combate infecções bacterianas, fúngicas e virais',
        'Previne doenças cardiovasculares'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'PROPOLIS_VERDE';

-- 57. PROPOWAY VERMELHA
UPDATE public.supplements SET
    description = 'O PROPOWAY visa fortalecer o sistema imunológico, melhorar a saúde cardiovascular e fornecer energia, promovendo uma vida mais saudável e equilibrada. Imunidade e Resistência em Duas Cápsulas!',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas Soft Gel de 300mg cada (+ Óleo de Linhaça + TCM).',
    active_ingredients = ARRAY['Extrato de Própolis', 'Óleo de Linhaça', 'TCM (Triglicerídeos de Cadeia Média)', '300mg por cápsula'],
    benefits = ARRAY[
        'Auxilia no fortalecimento do sistema imunológico',
        'Previne cáries e gengivites',
        'Auxilia na recuperação de feridas e lesões na pele',
        'Melhora a saúde cardiovascular',
        'Fornece energia',
        'Vida mais saudável e equilibrada'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'PROPOWAY_VERMELHA';

-- 58. PROMEN
UPDATE public.supplements SET
    description = 'O Promen é um tratamento para homens e mulheres, proporcionando uma vida de qualidade para todos. Tenha uma vida de qualidade e bem-estar com Promen. Tratamento para Homens e Mulheres.',
    recommended_dosage = '02 Cápsulas ao dia. Conteúdo: 60 Cápsulas de 1.400mg cada.',
    active_ingredients = ARRAY['Ingredientes para saúde geral', '1.400mg por cápsula'],
    benefits = ARRAY[
        'Prevenção do Infarto e do AVC',
        'Auxilia na Prevenção do Câncer de Próstata, Colo do Útero, Mamas, entre outros',
        'Fortalecimento do Sistema Imunológico',
        'Melhora da Fertilidade Masculina',
        'Trata a Hiperplasia Benigna da Próstata (próstata aumentada)',
        'Vida de qualidade e bem-estar'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'PROMEN';

-- 59. ÓLEO HOT OZONIZADO
UPDATE public.supplements SET
    description = 'Explore o poder da sensualidade e do cuidado íntimo com nosso revolucionário Óleo HOT. Cada gota desse elixir luxuoso é formulada para proporcionar uma experiência única e estimulante, cuidando delicadamente da área íntima feminina. Uma Explosão de Emoções em Cada Gota.',
    recommended_dosage = 'Use antes de dormir. Aplicar na área íntima. Conteúdo: 30ml e 1,01 fl.oz.',
    active_ingredients = ARRAY['Canela', 'Menta', 'Óleo de Girassol Extra Virgem', 'Ozônio'],
    benefits = ARRAY[
        'Estimulação Sensorial',
        'Nutrição Profunda',
        'Refrescância Duradoura',
        'Mantém o Equilíbrio Natural da Área Íntima',
        'Bactericida e Lubrificante',
        'Experiência única e estimulante'
    ],
    contraindications = ARRAY[]::TEXT[]
WHERE external_id = 'OLEO_HOT';

-- 60. OZÔNIO EM CÁPSULAS (CRÍTICO)
UPDATE public.supplements SET
    description = 'Óleo de girassol ozonizado em cápsulas para oxigenação e regeneração celular. Ação anti-inflamatória, melhora oxigenação celular, antioxidante e regeneração celular. Tratamento complementar de saúde com tecnologia avançada de ozonização. Usado em todos os protocolos de suplementação Nema''s Way.',
    recommended_dosage = '2 cápsulas ao dia. Conteúdo: 60 Cápsulas de 500mg cada.',
    active_ingredients = ARRAY['Óleo de Girassol Ozonizado', '500mg por cápsula'],
    benefits = ARRAY[
        'Ação anti-inflamatória',
        'Melhora oxigenação celular',
        'Antioxidante',
        'Regeneração celular',
        'Combate infecções',
        'Melhora circulação',
        'Tratamento complementar de saúde'
    ],
    contraindications = ARRAY['Gravidez', 'Lactação']
WHERE external_id = 'OZONIO';

COMMIT;

-- Verificar atualizações
SELECT 
    external_id,
    name,
    LENGTH(description) as tamanho_descricao,
    ARRAY_LENGTH(benefits, 1) as qtd_beneficios,
    ARRAY_LENGTH(active_ingredients, 1) as qtd_ingredientes
FROM public.supplements
ORDER BY name;

