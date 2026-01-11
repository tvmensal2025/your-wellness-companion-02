-- ==============================================================================
-- LIMPEZA DEFINITIVA E CORREÇÃO DOS PRODUTOS DO CATÁLOGO 
-- Remove duplicatas, corrige preços e configura imagens corretamente
-- ==============================================================================

BEGIN;

-- 1. PRIMEIRO: LIMPAR TODAS AS REFERÊNCIAS EM user_supplements
-- ==============================================================================
DELETE FROM public.user_supplements;

-- 2. LIMPAR COMPLETAMENTE A TABELA DE PRODUTOS
-- ==============================================================================
DELETE FROM public.supplements;

-- 3. INSERIR APENAS OS PRODUTOS OFICIAIS DO CATÁLOGO COM DADOS CORRETOS
-- ==============================================================================
INSERT INTO public.supplements (
    external_id,
    name,
    category,
    brand,
    original_price,
    discount_price,
    description,
    recommended_dosage,
    active_ingredients,
    benefits,
    contraindications,
    image_url,
    is_approved,
    stock_quantity,
    tags
) VALUES

-- 1. SOS UNHAS
('SOS_UNHAS', 'SOS Unhas', 'Beleza', 'Nema''s Way', 49.90, 24.95, 
'Base fortalecedora e antifúngica ozonizada. O poder do ozônio unido ao mix de vitaminas para suas unhas.', 
'Aplique sobre unhas limpas e secas', 
ARRAY['Óleo de Girassol Ozonizado', 'Vitaminas'], 
ARRAY['Fortalece unhas frágeis', 'Combate fungos', 'Estimula crescimento', 'Protege e nutre'],
ARRAY[]::TEXT[], 
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/sos_unhas.jpg',
true, 100, ARRAY['unhas', 'fortalecedor', 'ozônio']),

-- 2. COLÁGENO COM ÁCIDO HIALURÔNICO  
('COLAGENO_ACIDO_HIALURONICO', 'Colágeno com Ácido Hialurônico', 'Beleza', 'Nema''s Way', 299.90, 149.95,
'Colágeno Verisol com Ácido Hialurônico, Vitamina C e Biotina. Sabor Frutas Vermelhas.',
'Ingerir 2 scoops com água pela manhã',
ARRAY['Colágeno Verisol', 'Ácido Hialurônico', 'Vitamina C', 'Biotina'],
ARRAY['Melhora elasticidade da pele', 'Hidratação profunda', 'Fortalece unhas e cabelos', 'Ação antioxidante'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/colageno_acido_hialuronico.jpg',
true, 100, ARRAY['colágeno', 'pele', 'beleza']),

-- 3. BVB CÁLCIO
('BVB_CALCIO', 'BVB Cálcio', 'Saúde', 'Nema''s Way', 99.90, 49.95,
'O único cálcio natural de concha de ostra que fortalece ossos e melhora função muscular.',
'2 cápsulas antes de dormir',
ARRAY['Cálcio de Concha de Ostra'],
ARRAY['Fortalecimento ósseo', 'Coagulação sanguínea', 'Suporte muscular', 'Sistema nervoso equilibrado'],
ARRAY['Contraindicado para pessoas com alergia a frutos do mar'],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_calcio.jpg',
true, 100, ARRAY['cálcio', 'ossos', 'músculos']),

-- 4. LIPO WAY
('LIPOWAY', 'Lipo Way', 'Emagrecimento', 'Nema''s Way', 149.90, 74.95,
'Adeus Gordurinha. Queima gordura, é termogênico, fornece energia e acelera o metabolismo.',
'02 Cápsulas ao dia',
ARRAY['Termogênicos Naturais'],
ARRAY['Queima gordura', 'É termogênico', 'Fornece energia', 'Acelera metabolismo', 'Auxilia ganho massa magra'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/lipoway.jpg',
true, 100, ARRAY['emagrecimento', 'termogênico', 'gordura']),

-- 5. BVB SB (SECA BARRIGA)
('BVB_SB', 'BVB SB', 'Emagrecimento', 'Nema''s Way', 149.90, 74.95,
'Queime gordura, domine seu metabolismo e transforme seu corpo. Combina antioxidantes, fibras e nutrientes essenciais.',
'2 cápsulas 30 minutos antes do almoço',
ARRAY['Antioxidantes', 'Fibras', 'Nutrientes essenciais'],
ARRAY['Saciedade prolongada', 'Reduz absorção gorduras', 'Controle glicêmico', 'Estimula metabolismo', 'Anti-inflamatório'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_sb.jpg',
true, 100, ARRAY['emagrecimento', 'seca barriga', 'metabolismo']),

-- 6. WINNER ÓLEO PARA PERNAS
('WINNER_OLEO_PERNAS', 'Winner Óleo Para Pernas Ozonizado', 'Bem-Estar', 'Nema''s Way', 79.90, 39.95,
'O campeão voltou, desde 1986. Sensação de alívio e relaxamento com Castanha da Índia, Calêndula, Óleo de Amêndoas.',
'Aplicar nas pernas com movimentos circulares suaves até completa absorção',
ARRAY['Castanha da Índia', 'Óleo de Calêndula', 'Óleo de Amêndoas', 'Óleo Semente de Uva', 'Cânfora', 'Mentol'],
ARRAY['Ativa circulação sanguínea', 'Alivia sensação peso/cansaço', 'Devolve frescor imediato', 'Ação vasoprotetora', 'Favorece vitalidade'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/winner_oleo.jpg',
true, 100, ARRAY['pernas', 'circulação', 'ozônio']),

-- 7. VITAMINA K2
('VITAMINA_K2', 'Vitamina K2', 'Saúde', 'Nema''s Way', 99.90, 49.95,
'O GPS que o seu corpo precisa. A vitamina K2 direciona o cálcio para os ossos e impede o acúmulo nas artérias.',
'2 cápsulas na hora do almoço',
ARRAY['Vitamina K2'],
ARRAY['Saúde óssea', 'Proteção cardiovascular', 'Sinergia com vitamina D3', 'Prevenção osteoporose'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/vitamina_k2.jpg',
true, 100, ARRAY['vitamina', 'ossos', 'coração']),

-- 8. FRESH GLOW CREME CORPORAL
('FRESH_GLOW_CREME', 'Fresh Glow Creme Corporal', 'Beleza', 'Nema''s Way', 99.99, 49.99,
'Revitalize sua pele com hidratação e firmeza. Combinação perfeita de ozônio, colágeno e elastina.',
'Uso Diário',
ARRAY['Ozônio', 'Colágeno', 'Elastina'],
ARRAY['Ação purificadora e regenerativa', 'Prevenção envelhecimento', 'Hidratação e maciez'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/fresh_glow_creme.jpg',
true, 100, ARRAY['hidratante', 'ozônio', 'pele']),

-- 9. VITAMINA C 400MG
('VITAMINA_C_400MG', 'Vitamina C', 'Saúde', 'Nema''s Way', 49.90, 24.95,
'Mais longevidade para a sua vida. Seu segredo para rejuvenescimento, longevidade e imunidade.',
'01 Cápsula ao dia',
ARRAY['Vitamina C 400mg'],
ARRAY['Rejuvenescimento da pele', 'Promoção longevidade', 'Reforço sistema imunológico', 'Proteção contra radicais livres'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/vitamina_c.jpg',
true, 100, ARRAY['vitamina', 'imunidade', 'antioxidante']),

-- 10. FRESH GLOW LOÇÃO ADSTRINGENTE
('FRESH_GLOW_LOCAO', 'Fresh Glow Loção Adstringente', 'Beleza', 'Nema''s Way', 99.90, 49.95,
'Pele limpa, fresca e equilibrada. Com Alantoína, Aloe Vera, D-Pantenol, Ácido de Frutas e Vitamina E.',
'Uso Diário',
ARRAY['Alantoína', 'Aloe Vera', 'D-Pantenol', 'Ácido de Frutas', 'Vitamina E'],
ARRAY['Esfoliante natural', 'Aumenta elasticidade', 'Propriedades calmantes'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/fresh_glow_locao.jpg',
true, 100, ARRAY['adstringente', 'limpeza', 'pele']),

-- 11. BVB COLEST CRANBERRY
('BVB_COLEST', 'BVB Colest', 'Saúde', 'Nema''s Way', 129.90, 64.95,
'Fonte de Proantocianidinas Cranberry. Formulado para proteção do trato urinário e equilíbrio do colesterol.',
'2 cápsulas na hora do almoço',
ARRAY['Proantocianidinas de Cranberry'],
ARRAY['Saúde do trato urinário', 'Ação antioxidante', 'Redução colesterol ruim', 'Apoio sistema imunológico'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_colest.jpg',
true, 100, ARRAY['cranberry', 'urinário', 'colesterol']),

-- 12. FRESH GLOW SABONETE FACIAL
('FRESH_GLOW_SABONETE', 'Fresh Glow Sabonete Facial', 'Beleza', 'Nema''s Way', 99.99, 49.99,
'Frescor e luminosidade em cada limpeza. Purificante Ozonizado com Extrato de Kiwi & Aloe Vera.',
'Uso Diário',
ARRAY['Extrato de Kiwi', 'Aloe Vera', 'Ozônio'],
ARRAY['Limpeza profunda e revitalização', 'Ação purificadora', 'Hidratação e suavização'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/fresh_glow_sabonete.jpg',
true, 100, ARRAY['sabonete', 'facial', 'ozônio']),

-- 13. BVB D3K2
('BVB_D3K2', 'BVB D3K2', 'Saúde', 'Nema''s Way', 149.90, 74.95,
'A Fórmula Perfeita para sua Saúde. Renovar saúde, melhorar imunidade e prevenir calvície.',
'02 Cápsulas ao dia',
ARRAY['Vitamina D3', 'Vitamina K2'],
ARRAY['Combate doenças autoimunes', 'Dentes saudáveis', 'Coagulação sanguínea', 'Função hormonal', 'Previne infarto'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_d3k2.jpg',
true, 100, ARRAY['vitamina d3', 'vitamina k2', 'imunidade']),

-- 14. FOCUS TDAH PREMIUM
('FOCUS_TDAH', 'Focus TDAH Premium', 'Saúde', 'Nema''s Way', 159.90, 79.95,
'Foco, clareza e equilíbrio para sua mente! Descubra o poder do Focus TDAH.',
'02 Cápsulas ao dia',
ARRAY['Ingredientes Nootrópicos'],
ARRAY['Melhora foco e concentração', 'Redução estresse e ansiedade', 'Melhora humor', 'Proteção sistema nervoso'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/focus_tdah.jpg',
true, 100, ARRAY['foco', 'concentração', 'TDAH']),

-- 15. SEREMIX
('SEREMIX', 'Seremix', 'Bem-Estar', 'Nema''s Way', 149.90, 74.95,
'Seu Aliado Para Uma Melhor Noite De Sono. Suplemento revolucionário em cápsulas de L-Triptofano.',
'02 Cápsulas ao dia',
ARRAY['L-Triptofano 500mg'],
ARRAY['Promove relaxamento', 'Melhora qualidade do sono', 'Alivia estresse'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/seremix.jpg',
true, 100, ARRAY['sono', 'triptofano', 'relaxamento']),

-- 16. MELATONINA
('MELATONINA', 'Melatonina', 'Bem-Estar', 'Nema''s Way', 99.90, 49.95,
'Durma profundamente e acorde renovado! A Melatonina da NemasWay é seu aliado para noites completas e restauradoras.',
'2 cápsulas 30 minutos antes de dormir',
ARRAY['Melatonina 600mg'],
ARRAY['Auxilia no início do sono', 'Melhora qualidade do sono', 'Promove relaxamento físico e mental', 'Auxilia em quadros de insônia leve'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/melatonina.jpg',
true, 100, ARRAY['melatonina', 'sono', 'insônia', 'relaxamento']),

-- 17. VITAMIX SKIN
('VITAMIX_SKIN', 'Vitamix Skin', 'Beleza', 'Nema''s Way', 109.90, 54.95,
'Cuide da sua pele do jeito que ela merece! Desfrute de todo o poder do VITAMIX SKIN.',
'02 Cápsulas ao dia',
ARRAY['Vitaminas e Minerais para Pele'],
ARRAY['Melhora elasticidade da pele', 'Reduz linhas de expressão', 'Regeneração das células'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/vitamix_skin.jpg',
true, 100, ARRAY['pele', 'vitaminas', 'beleza']);

-- 4. ATUALIZAR SEQUÊNCIA APENAS SE EXISTIR (PostgreSQL com UUID não precisa, mas não vai dar erro)
-- ==============================================================================

COMMIT;