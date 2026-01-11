-- ==============================================================================
-- MIGRACAO COMPLETA E DEFINITIVA - NEMA'S WAY CATÁLOGO (CORRIGIDO)
-- Limpa TUDO e insere os 58 produtos com preços, imagens e descrições corretas.
-- ==============================================================================

BEGIN;

-- 1. LIMPEZA SEGURA
-- Remove referências primeiro para evitar erro de foreign key
DELETE FROM public.protocol_supplements;
DELETE FROM public.user_supplements;
DELETE FROM public.supplements;

-- 2. INSERÇÃO DOS PRODUTOS (58 ITENS)
INSERT INTO public.supplements (
    external_id, name, category, brand, original_price, discount_price, 
    description, recommended_dosage, active_ingredients, benefits, 
    contraindications, image_url, is_approved, stock_quantity, tags
) VALUES

-- 1. SOS UNHAS
('SOS_UNHAS', 'SOS Unhas', 'Beleza', 'Nema''s Way', 49.90, 24.95,
'Base fortalecedora e antifúngica com óleo de girassol ozonizado. O poder do ozônio unido ao mix de vitaminas.',
'Aplique sobre unhas limpas e secas.',
ARRAY['Óleo de Girassol Ozonizado', 'Vitaminas'],
ARRAY['Fortalece unhas frágeis', 'Combate fungos', 'Estimula crescimento', 'Protege e nutre'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/sos_unhas.jpg',
true, 100, ARRAY['unhas', 'fortalecedor', 'ozônio']),

-- 2. COLÁGENO COM ÁCIDO HIALURÔNICO
('COLAGENO_ACIDO_HIALURONICO', 'Colágeno com Ácido Hialurônico', 'Beleza', 'Nema''s Way', 299.90, 149.95,
'Colágeno Verisol com Ácido Hialurônico, Vitamina C e Biotina. Sabor Frutas Vermelhas.',
'Ingerir 2 scoops com água pela manhã.',
ARRAY['Colágeno Verisol', 'Ácido Hialurônico', 'Vitamina C', 'Biotina'],
ARRAY['Melhora elasticidade da pele', 'Hidratação profunda', 'Fortalece unhas e cabelos', 'Ação antioxidante'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/colageno_acido_hialuronico.jpg',
true, 100, ARRAY['colágeno', 'pele', 'beleza']),

-- 3. BVB CÁLCIO
('BVB_CALCIO', 'BVB Cálcio Concha de Ostra', 'Saúde', 'Nema''s Way', 99.90, 49.95,
'O único cálcio natural de concha de ostra que fortalece ossos e melhora função muscular.',
'2 cápsulas antes de dormir.',
ARRAY['Cálcio de Concha de Ostra'],
ARRAY['Fortalecimento ósseo', 'Coagulação sanguínea', 'Suporte muscular', 'Sistema nervoso equilibrado'],
ARRAY['Alergia a frutos do mar'],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_calcio.jpg',
true, 100, ARRAY['cálcio', 'ossos']),

-- 4. LIPO WAY
('LIPOWAY', 'Lipo Way', 'Emagrecimento', 'Nema''s Way', 149.90, 74.95,
'Adeus Gordurinha. Queima gordura, é termogênico, fornece energia e acelera o metabolismo.',
'02 Cápsulas ao dia.',
ARRAY['Termogênicos Naturais'],
ARRAY['Queima gordura', 'Fornece energia', 'Acelera metabolismo', 'Auxilia ganho massa magra'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/lipoway.jpg',
true, 100, ARRAY['emagrecimento', 'gordura', 'termogênico']),

-- 5. BVB SB (SECA BARRIGA)
('BVB_SB', 'BVB SB', 'Emagrecimento', 'Nema''s Way', 149.90, 74.95,
'Queime gordura, domine seu metabolismo. Combina antioxidantes, fibras e nutrientes.',
'2 cápsulas 30 minutos antes do almoço.',
ARRAY['Fibras', 'Antioxidantes'],
ARRAY['Saciedade prolongada', 'Reduz absorção gorduras', 'Controle glicêmico', 'Estimula metabolismo'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_sb.jpg',
true, 100, ARRAY['emagrecimento', 'seca barriga']),

-- 6. WINNER ÓLEO PARA PERNAS
('WINNER_OLEO_PERNAS', 'Winner Óleo Para Pernas', 'Bem-Estar', 'Nema''s Way', 79.90, 39.95,
'O campeão voltou. Óleo para pernas ozonizado com Castanha da Índia e ativos naturais.',
'Aplicar nas pernas com movimentos circulares suaves.',
ARRAY['Castanha da Índia', 'Calêndula', 'Cânfora', 'Mentol'],
ARRAY['Ativa circulação', 'Alivia sensação peso', 'Devolve frescor', 'Ação vasoprotetora'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/winner_oleo.jpg',
true, 100, ARRAY['pernas', 'circulação', 'ozônio']),

-- 7. VITAMINA K2
('VITAMINA_K2', 'Vitamina K2', 'Saúde', 'Nema''s Way', 99.90, 49.95,
'O GPS que o corpo precisa. Direciona o cálcio para os ossos e impede acúmulo nas artérias.',
'2 cápsulas na hora do almoço.',
ARRAY['Vitamina K2'],
ARRAY['Saúde óssea', 'Proteção cardiovascular', 'Sinergia com vitamina D3', 'Prevenção osteoporose'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/vitamina_k2.jpg',
true, 100, ARRAY['vitamina', 'ossos', 'coração']),

-- 8. FRESH GLOW CREME CORPORAL
('FRESH_GLOW_CREME', 'Fresh Glow Creme Corporal', 'Beleza', 'Nema''s Way', 99.99, 49.99,
'Revitalizante com Ozônio, Colágeno e Elastina para hidratação profunda.',
'Uso Diário.',
ARRAY['Ozônio', 'Colágeno', 'Elastina'],
ARRAY['Ação purificadora', 'Prevenção envelhecimento', 'Hidratação e maciez', 'Firmeza'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/fresh_glow_creme.jpg',
true, 100, ARRAY['pele', 'hidratante', 'ozônio']),

-- 9. VITAMINA C 400MG
('VITAMINA_C_400MG', 'Vitamina C 400mg', 'Saúde', 'Nema''s Way', 49.90, 24.95,
'Segredo para rejuvenescimento, longevidade e imunidade.',
'01 Cápsula ao dia.',
ARRAY['Vitamina C 400mg'],
ARRAY['Rejuvenescimento da pele', 'Reforço imunológico', 'Proteção radicais livres'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/vitamina_c.jpg',
true, 100, ARRAY['vitamina', 'imunidade']),

-- 10. FRESH GLOW LOÇÃO ADSTRINGENTE
('FRESH_GLOW_LOCAO', 'Fresh Glow Loção Adstringente', 'Beleza', 'Nema''s Way', 99.90, 49.95,
'Limpa e tonifica com Ozônio, Alantoína e Aloe Vera.',
'Uso Diário.',
ARRAY['Alantoína', 'Aloe Vera', 'Ozônio'],
ARRAY['Esfoliante natural', 'Aumenta elasticidade', 'Limpa e tonifica'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/fresh_glow_locao.jpg',
true, 100, ARRAY['pele', 'limpeza', 'rosto']),

-- 11. BVB COLEST
('BVB_COLEST', 'BVB Colest (Cranberry)', 'Saúde', 'Nema''s Way', 129.90, 64.95,
'Fonte de Proantocianidinas. Proteção do trato urinário e equilíbrio do colesterol.',
'2 cápsulas na hora do almoço.',
ARRAY['Cranberry'],
ARRAY['Saúde trato urinário', 'Ação antioxidante', 'Redução colesterol ruim', 'Apoio imunológico'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_colest.jpg',
true, 100, ARRAY['colesterol', 'cranberry']),

-- 12. FRESH GLOW SABONETE FACIAL
('FRESH_GLOW_SABONETE', 'Fresh Glow Sabonete Facial', 'Beleza', 'Nema''s Way', 99.99, 49.99,
'Purificante Ozonizado com Extrato de Kiwi e Aloe Vera.',
'Uso Diário.',
ARRAY['Extrato de Kiwi', 'Aloe Vera', 'Ozônio'],
ARRAY['Limpeza profunda', 'Ação purificadora', 'Desobstrução dos poros'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/fresh_glow_sabonete.jpg',
true, 100, ARRAY['sabonete', 'rosto', 'limpeza']),

-- 13. BVB D3K2
('BVB_D3K2', 'BVB D3K2', 'Saúde', 'Nema''s Way', 149.90, 74.95,
'A fórmula perfeita para sua saúde. Renova saúde, imunidade e previne calvície.',
'02 Cápsulas ao dia.',
ARRAY['Vitamina D3', 'Vitamina K2'],
ARRAY['Combate doenças autoimunes', 'Dentes saudáveis', 'Coagulação sanguínea', 'Previne infarto'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_d3k2.jpg',
true, 100, ARRAY['vitamina', 'imunidade']),

-- 14. SD ARTRO
('SD_ARTRO', 'SD Artro', 'Saúde', 'Nema''s Way', 134.90, 67.45,
'Alívio nas articulações e força nos músculos. Vida sem dor.',
'02 Cápsulas ao dia.',
ARRAY['Ingredientes para articulação'],
ARRAY['Previne trombose', 'Melhora musculatura', 'Redução inflamações', 'Indicado para Artrite/Artrose'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/sd_artro.jpg',
true, 100, ARRAY['articulações', 'dor', 'saúde']),

-- 15. COLÁGENO TIPO II
('COLAGENO_TIPO_II', 'Colágeno Tipo II', 'Saúde', 'Nema''s Way', 119.90, 59.95,
'Aumente a elasticidade das articulações e trate lesões.',
'01 comprimido ao dia.',
ARRAY['Colágeno Tipo II', 'Vitamina E'],
ARRAY['Melhora musculatura', 'Redução inflamações', 'Saúde óssea', 'Tratamento Artrite Reumatoide'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/colageno_tipo_ii.jpg',
true, 100, ARRAY['colágeno', 'articulações']),

-- 16. ÓLEO DE PRÍMULA
('OLEO_PRIMULA', 'Óleo de Prímula', 'Saúde', 'Nema''s Way', 119.90, 59.95,
'Parceiro na busca por vida saudável. Saúde para o corpo.',
'02 Cápsulas ao dia.',
ARRAY['Óleo de Prímula'],
ARRAY['Fortalece sistema imunológico', 'Auxilia perda de peso', 'Combate má digestão', 'Saúde da pele'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/oleo_primula.jpg',
true, 100, ARRAY['óleo', 'saúde', 'mulher']),

-- 17. GOLD MONEY
('GOLD_MONEY', 'Gold Money Perfume', 'Perfumaria', 'Nema''s Way', 199.99, 99.99,
'Desafie as probabilidades. Supere os limites. Perfume 100ml.',
'Uso externo.',
ARRAY[]::TEXT[],
ARRAY['Fragrância marcante', 'Longa duração'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/gold_money.jpg',
true, 100, ARRAY['perfume', 'fragrância']),

-- 18. LIB WAY
('LIBWAY', 'Lib Way', 'Saúde', 'Nema''s Way', 149.90, 74.95,
'Sua confiança de volta. Estimulante com Boro, Arginina e Taurina.',
'01 Cápsula ao dia.',
ARRAY['Boro', 'Aspartato', 'Arginina', 'Taurina'],
ARRAY['Aumento hormônios', 'Melhora desempenho sexual', 'Aumento libido', 'Mais energia'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/libway.jpg',
true, 100, ARRAY['estimulante', 'libido', 'energia']),

-- 19. BVB B12
('BVB_B12', 'BVB B12', 'Saúde', 'Nema''s Way', 149.90, 74.95,
'Energia para mente e corpo. Metilcobalamina.',
'02 Cápsulas ao dia.',
ARRAY['Vitamina B12 (Metilcobalamina)'],
ARRAY['Previne problemas cardíacos', 'Prevenção Alzheimer', 'Melhor oxigenação', 'Manutenção sistema nervoso'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_b12.jpg',
true, 100, ARRAY['vitamina b12', 'energia', 'cérebro']),

-- 20. BVB INSU
('BVB_INSU', 'BVB Insu', 'Saúde', 'Nema''s Way', 149.90, 74.95,
'Caminho para equilíbrio. Auxilia diabetes e colesterol.',
'02 Cápsulas ao dia.',
ARRAY['Ingredientes naturais'],
ARRAY['Diminui Colesterol Ruim', 'Auxilia Diabetes/Insulina', 'Diminui compulsão por doces'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_insu.jpg',
true, 100, ARRAY['diabetes', 'insulina', 'colesterol']),

-- 21. VITAMIX SKIN
('VITAMIX_SKIN', 'Vitamix Skin', 'Beleza', 'Nema''s Way', 109.90, 54.95,
'Cuide da sua pele do jeito que ela merece.',
'02 Cápsulas ao dia.',
ARRAY['Vitaminas para pele'],
ARRAY['Melhora elasticidade', 'Reduz linhas expressão', 'Regeneração células', 'Firmeza'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/vitamix_skin.jpg',
true, 100, ARRAY['pele', 'beleza', 'anti-idade']),

-- 22. ACIDO HIALURONICO FITIOS
('ACIDO_HIALURONICO_FITIOS', 'Ácido Hialurônico Fitios', 'Beleza', 'Nema''s Way', 99.90, 49.95,
'Refaz o que o tempo desfaz. Com Vitamina B5 e C.',
'01 Cápsula ao dia.',
ARRAY['Ácido Hialurônico', 'Vitamina B5', 'Vitamina C'],
ARRAY['Melhora elasticidade', 'Reduz linhas expressão', 'Combate flacidez'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/acido_hialuronico_fitios.jpg',
true, 100, ARRAY['ácido hialurônico', 'pele']),

-- 23. OMEGA 3
('OMEGA_3_1400MG', 'Ômega 3 1400mg', 'Saúde', 'Nema''s Way', 129.99, 64.99,
'DHA 360 / EPA 540. Produto indicado para toda família.',
'02 Cápsulas ao dia.',
ARRAY['Óleo de Peixe (Ômega 3)'],
ARRAY['Prevenção Parkinson/Alzheimer', 'Saúde cardiovascular', 'Controle pressão arterial', 'Anti-inflamatório'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/omega_3.jpg',
true, 100, ARRAY['omega 3', 'coração', 'cérebro']),

-- 24. VIP GLAMOUR KIT
('VIP_GLAMOUR_KIT', 'Kit Vip Glamour', 'Perfumaria', 'Nema''s Way', 149.90, 74.95,
'Charme e sofisticação. Body Splash + Creme Corporal.',
'Uso externo.',
ARRAY[]::TEXT[],
ARRAY['Fragrância sofisticada', 'Hidratação'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/vip_glamour_kit.jpg',
true, 100, ARRAY['kit', 'perfume', 'hidratante']),

-- 25. FAIR WAY
('FAIR_WAY', 'Fair Way Ozonizado', 'Beleza', 'Nema''s Way', 99.99, 49.99,
'Loção hidratante com Colágeno e Elastina.',
'Uso Diário.',
ARRAY['Colágeno', 'Elastina', 'Ozônio'],
ARRAY['Estimulação circulação', 'Ação antioxidante', 'Hidratação profunda', 'Combate flacidez'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/fair_way.jpg',
true, 100, ARRAY['hidratante', 'corpo', 'ozônio']),

-- 26. BVB ZINCO QUELATO
('BVB_ZINCO_QUELATO', 'BVB Zinco Quelato', 'Saúde', 'Nema''s Way', 129.90, 64.95,
'Sua imunidade merece mais. Máxima absorção.',
'2 cápsulas ao dia.',
ARRAY['Zinco Quelato'],
ARRAY['Ação antioxidante', 'Saúde pele/cabelo/unhas', 'Fortalecimento imunológico', 'Metabolismo otimizado'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_zinco_quelato.jpg',
true, 100, ARRAY['zinco', 'imunidade']),

-- 27. AMARGO
('AMARGO', 'Chá Amargo', 'Emagrecimento', 'Nema''s Way', 99.90, 49.95,
'Chá com vegetais para digestão e fígado.',
'02 colheres de sopa ao dia.',
ARRAY['Alcachofra', 'Camomila', 'Chá Verde', 'Berinjela'],
ARRAY['Promove organismo eficiente', 'Elimina azia', 'Reduz gordura no fígado', 'Perda de peso'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/amargo.jpg',
true, 100, ARRAY['chá', 'digestão', 'fígado']),

-- 28. TOP SECRETS
('TOP_SECRETS', 'Top Secrets Creme Clareador', 'Beleza', 'Nema''s Way', 99.90, 49.95,
'Creme para mãos e rosto ozonizado com Rosa Mosqueta.',
'02 aplicações ao dia.',
ARRAY['Rosa Mosqueta', 'Ozônio'],
ARRAY['Clareamento da pele', 'Hidratação profunda', 'Efeito rejuvenescedor', 'Cicatrização'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/top_secrets.jpg',
true, 100, ARRAY['clareador', 'rosto', 'manchas']),

-- 29. PEELING 5X1
('PEELING_5X1', 'Peeling 5x1 Gomage', 'Beleza', 'Nema''s Way', 99.90, 49.95,
'Corpo e Rosto. Limpa, tonifica, amacia, hidrata e clareia.',
'03 aplicações durante a semana.',
ARRAY['Vitamina E'],
ARRAY['Remove células mortas', 'Prevenção rugas', 'Ação antioxidante', 'Clareia'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/peeling_5x1.jpg',
true, 100, ARRAY['peeling', 'esfoliante']),

-- 30. SEREMIX
('SEREMIX', 'Seremix', 'Bem-Estar', 'Nema''s Way', 149.90, 74.95,
'Seu aliado para uma melhor noite de sono. Triptofano.',
'02 Cápsulas ao dia.',
ARRAY['L-Triptofano'],
ARRAY['Promove relaxamento', 'Melhora qualidade sono', 'Alivia estresse'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/seremix.jpg',
true, 100, ARRAY['sono', 'relaxamento']),

-- 31. BVB MORO
('BVB_MORO', 'BVB Moro', 'Emagrecimento', 'Nema''s Way', 129.90, 64.95,
'Transforme metabolismo em máquina de queimar gorduras.',
'2 cápsulas 30min antes almoço.',
ARRAY['Laranja Moro'],
ARRAY['Redução gordura abdominal', 'Regula glicemia', 'Aumenta saciedade', 'Ação antioxidante'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_moro.jpg',
true, 100, ARRAY['emagrecimento', 'moro', 'gordura']),

-- 32. PROWOMAN
('PROWOMAN', 'ProWoman', 'Saúde', 'Nema''s Way', 149.90, 74.95,
'Tratamento para mulheres. Radiante e forte sempre.',
'02 Cápsulas ao dia.',
ARRAY['Nutrientes para mulher'],
ARRAY['Alivia sintomas menopausa', 'Equilibra níveis hormonais', 'Saúde feminina'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/prowoman.jpg',
true, 100, ARRAY['mulher', 'hormonal']),

-- 33. SÉRUM VITAMINA C
('SERUM_VITAMINA_C', 'Sérum Vitamina C Ozonizado', 'Beleza', 'Nema''s Way', 119.99, 59.99,
'Pele radiante e protegida. Antioxidante poderoso.',
'Uso diário.',
ARRAY['Vitamina C', 'Ozônio'],
ARRAY['Neutraliza radicais livres', 'Clareia manchas', 'Estimula colágeno'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/serum_vitamina_c.jpg',
true, 100, ARRAY['sérum', 'rosto', 'vitamina c']),

-- 34. ORGANIC OZON3 ARGAN
('ORGANIC_OZON3_ARGAN', 'Organic Ozon3 Óleo de Argan', 'Beleza', 'Nema''s Way', 99.90, 49.95,
'Cuidado profundo e brilho intenso para cabelos.',
'Uso Diário.',
ARRAY['Óleo de Argan', 'Ozônio'],
ARRAY['Reparação cabelos danificados', 'Hidratação profunda', 'Brilho'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/organic_ozon3_argan.jpg',
true, 100, ARRAY['cabelo', 'argan', 'óleo']),

-- 35. POLIVITAMIX
('POLIVITAMIX', 'Polivitamix A-Z', 'Saúde', 'Nema''s Way', 109.90, 54.95,
'Polivitamínico completo com Ômega 3.',
'02 Cápsulas ao dia.',
ARRAY['Vitaminas', 'Minerais', 'Ômega 3'],
ARRAY['Fortalece imunidade', 'Energia e vitalidade', 'Saúde óssea e mental'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/polivitamix.jpg',
true, 100, ARRAY['multivitamínico', 'energia']),

-- 36. LIFE WAY GEL
('LIFE_WAY_GEL', 'Life Way Gel Massageador', 'Bem-Estar', 'Nema''s Way', 139.90, 69.95,
'Gel ozonizado para massagem. Alívio imediato.',
'Uso Diário.',
ARRAY['Mentol', 'Cânfora', 'Ozônio'],
ARRAY['Alívio dores musculares', 'Relaxamento', 'Pele tonificada'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/life_way_gel.jpg',
true, 100, ARRAY['gel', 'massagem', 'dor']),

-- 37. VISION WAY
('VISION_WAY', 'Vision Way', 'Saúde', 'Nema''s Way', 149.90, 74.95,
'Proteção avançada para sua visão. Luteína e Zeaxantina.',
'01 Cápsula ao dia.',
ARRAY['Luteína', 'Zeaxantina', 'DHA'],
ARRAY['Proteção luz azul', 'Melhora circulação ocular', 'Previne inflamações'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/vision_way.jpg',
true, 100, ARRAY['visão', 'olhos']),

-- 38. BVB Q10
('BVB_Q10', 'BVB Q10', 'Saúde', 'Nema''s Way', 159.90, 79.95,
'Suporte completo com Coenzima Q10.',
'01 Cápsula ao dia.',
ARRAY['Coenzima Q10'],
ARRAY['Produção de energia', 'Saúde cardiovascular', 'Proteção antioxidante'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/bvb_q10.jpg',
true, 100, ARRAY['q10', 'coração', 'energia']),

-- 39. SABONETE INTIMO SEDUCAO
('SABONETE_INTIMO_SEDUCAO', 'Sabonete Íntimo Sedução', 'Higiene', 'Nema''s Way', 59.90, 29.95,
'Fragrância delicada para higiene íntima.',
'Uso diário.',
ARRAY['Morango', 'Malva', 'Barbatimão'],
ARRAY['Mantém PH equilibrado', 'Previne doenças ginecológicas', 'Higiene'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/sabonete_intimo_seducao.jpg',
true, 100, ARRAY['íntimo', 'sabonete']),

-- 40. TENIS BIOQUANTICO
('TENIS_BIOQUANTICO', 'Tênis Bioquântico', 'Bem-Estar', 'Nema''s Way', 1099.99, 549.99,
'Caminhar com saúde e tecnologia. Íons magnéticos.',
'Uso diário.',
ARRAY[]::TEXT[],
ARRAY['Alivia dores na coluna', 'Correção postura', 'Conforto'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/tenis_bioquantico.jpg',
true, 100, ARRAY['tênis', 'saúde', 'coluna']),

-- 41. MELATONINA
('MELATONINA', 'Melatonina', 'Bem-Estar', 'Nema''s Way', 99.90, 49.95,
'Durma profundamente. Hormônio do sono.',
'2 cápsulas 30min antes dormir.',
ARRAY['Melatonina'],
ARRAY['Auxilia início do sono', 'Ciclos completos sono', 'Relaxamento'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/melatonina.jpg',
true, 100, ARRAY['sono', 'insônia']),

-- 42. CREATINA
('CREATINA_Q10', 'Creatina com Q10', 'Esporte', 'Nema''s Way', 299.99, 149.99,
'Creatina Monohidratada com Coenzima Q10.',
'Diluir 3g em água.',
ARRAY['Creatina', 'Coenzima Q10'],
ARRAY['Energia', 'Resistência física', 'Foco mental', 'Força'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/creatina_q10.jpg',
true, 100, ARRAY['creatina', 'esporte', 'força']),

-- 43. KIT ORGANIC OZON3
('KIT_ORGANIC_OZON3', 'Kit Organic Ozon3 Capilar', 'Beleza', 'Nema''s Way', 399.90, 199.95,
'Shampoo + Alinhamento. Cabelos lisos e radiantes com Ozônio.',
'Uso profissional/doméstico.',
ARRAY['Ozônio', 'Tanino'],
ARRAY['Alisa e nutre', 'Redução frizz', 'Brilho intenso'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/kit_organic_ozon3.jpg',
true, 100, ARRAY['cabelo', 'alisamento']),

-- 44. SERUM RETINOL
('SERUM_RETINOL', 'Sérum Retinol Ozonizado', 'Beleza', 'Nema''s Way', 119.99, 59.99,
'Revitalize sua pele com Retinol e Ozônio.',
'Uso diário.',
ARRAY['Retinol', 'Ozônio'],
ARRAY['Reduz rugas', 'Elasticidade', 'Firmeza'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/serum_retinol.jpg',
true, 100, ARRAY['retinol', 'rosto', 'anti-idade']),

-- 45. SD FIBRO3
('SD_FIBRO3', 'SD Fibro3', 'Saúde', 'Nema''s Way', 149.90, 74.95,
'Para uma vida sem dor. Magnésio e Cúrcuma.',
'02 Cápsulas ao dia.',
ARRAY['Magnésio', 'Cúrcuma'],
ARRAY['Combate dores fibromialgia', 'Saúde óssea', 'Alívio dores'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/sd_fibro3.jpg',
true, 100, ARRAY['fibromialgia', 'dor', 'magnésio']),

-- 46. SPIRULINA
('SPIRULINA_VIT_E', 'Spirulina + Vitamina E', 'Saúde', 'Nema''s Way', 139.90, 69.95,
'Limpeza completa para organismo.',
'03 Comprimidos ao dia.',
ARRAY['Spirulina', 'Vitamina E'],
ARRAY['Antioxidante', 'Anti-inflamatório', 'Flora intestinal'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/spirulina.jpg',
true, 100, ARRAY['detox', 'spirulina']),

-- 47. OLEO GIRASSOL OZONIZADO
('OLEO_GIRASSOL_OZONIZADO', 'Óleo de Girassol Ozonizado', 'Saúde', 'Nema''s Way', 109.90, 54.95,
'Tecnologia avançada para cicatrização.',
'02 aplicações ao dia.',
ARRAY['Óleo Girassol', 'Ozônio'],
ARRAY['Cicatrização', 'Combate acnes', 'Antimicrobiano'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/oleo_girassol_ozonizado.jpg',
true, 100, ARRAY['ozônio', 'cicatrização']),

-- 48. OLEO REGENERADOR
('OLEO_REGENERADOR', 'Óleo Regenerador Ozonizado', 'Beleza', 'Nema''s Way', 109.90, 54.95,
'Rosa mosqueta e Ozônio para regeneração.',
'Diariamente a noite.',
ARRAY['Rosa Mosqueta', 'Ozônio'],
ARRAY['Regeneração celular', 'Reduz manchas e cicatrizes'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/oleo_regenerador.jpg',
true, 100, ARRAY['regenerador', 'pele']),

-- 49. GEL CRIOTERAPICO
('GEL_CRIOTERAPICO', 'Gel Crioterapico', 'Emagrecimento', 'Nema''s Way', 99.90, 49.95,
'Redução de medidas e gordura localizada.',
'Uso diário.',
ARRAY['Mentol', 'Centella Asiática'],
ARRAY['Redução gordura', 'Drenante', 'Melhora celulite'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/gel_crioterapico.jpg',
true, 100, ARRAY['gel', 'emagrecimento']),

-- 50. FOCUS TDAH
('FOCUS_TDAH', 'Focus TDAH Premium', 'Saúde', 'Nema''s Way', 159.90, 79.95,
'Foco, clareza e equilíbrio mental.',
'02 Cápsulas ao dia.',
ARRAY['Nootrópicos'],
ARRAY['Foco', 'Concentração', 'Redução ansiedade', 'Memória'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/focus_tdah.jpg',
true, 100, ARRAY['foco', 'cérebro', 'memória']),

-- 51. CAR BLACK
('CAR_BLACK', 'Car Black Perfume', 'Perfumaria', 'Nema''s Way', 199.99, 99.99,
'Elegância e luxo. Inspirado no Ferrari Black.',
'Uso externo.',
ARRAY[]::TEXT[],
ARRAY['Fragrância masculina', 'Sofisticação'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/car_black.jpg',
true, 100, ARRAY['perfume', 'masculino']),

-- 52. MADAME X
('MADAME_X', 'Madame X Perfume', 'Perfumaria', 'Nema''s Way', 199.99, 99.99,
'Inspirada no Coco Mademoiselle.',
'Uso externo.',
ARRAY[]::TEXT[],
ARRAY['Fragrância feminina', 'Elegância'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/madame_x.jpg',
true, 100, ARRAY['perfume', 'feminino']),

-- 53. MOLECULA DA VIDA
('MOLECULA_DA_VIDA', 'Molécula da Vida', 'Saúde', 'Nema''s Way', 159.99, 79.99,
'Saúde digestiva e proteção estomacal.',
'02 Cápsulas ao dia.',
ARRAY[]::TEXT[],
ARRAY['Saúde digestiva', 'Alívio gastrite', 'Proteção contra H. pylori'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/molecula_da_vida.jpg',
true, 100, ARRAY['digestão', 'estômago']),

-- 54. MEGA NUTRI RX21
('MEGA_NUTRI_RX21', 'Mega Nutri RX21', 'Beleza', 'Nema''s Way', 99.90, 49.95,
'Solução completa para cabelos, pele e unhas.',
'01 Comprimido ao dia.',
ARRAY['Vitaminas e Minerais'],
ARRAY['Reduz queda capilar', 'Fortalece unhas', 'Crescimento fios'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/mega_nutri_rx21.jpg',
true, 100, ARRAY['cabelo', 'unhas', 'vitaminas']),

-- 55. OLEO MASSAGEM
('OLEO_MASSAGEM_OZONIZADO', 'Óleo de Massagem Ozonizado', 'Bem-Estar', 'Nema''s Way', 99.90, 49.95,
'Tratamento para corpo inteiro.',
'Uso diário.',
ARRAY['Arnica', 'Girassol Ozonizado'],
ARRAY['Relaxamento', 'Alivia tensões', 'Trata hematomas'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/oleo_massagem_ozonizado.jpg',
true, 100, ARRAY['massagem', 'óleo']),

-- 56. PROPOLIS VERDE
('PROPOLIS_VERDE', 'Própolis Verde', 'Saúde', 'Nema''s Way', 139.90, 69.95,
'Imunidade imediata.',
'02 Cápsulas ao dia.',
ARRAY['Própolis Verde'],
ARRAY['Reforça imunidade', 'Cicatrização', 'Saúde geral'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/propolis_verde.jpg',
true, 100, ARRAY['própolis', 'imunidade']),

-- 57. PROPOWAY VERMELHA
('PROPOWAY_VERMELHA', 'Propoway Vermelha', 'Saúde', 'Nema''s Way', 139.90, 69.95,
'Extrato de Própolis + Óleo de Linhaça.',
'02 Cápsulas ao dia.',
ARRAY['Própolis', 'Linhaça'],
ARRAY['Fortalece imunidade', 'Previne inflamações'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/propoway_vermelha.jpg',
true, 100, ARRAY['própolis', 'imunidade']),

-- 58. PROMEN
('PROMEN', 'ProMen', 'Saúde', 'Nema''s Way', 149.90, 74.95,
'Tratamento para homens e mulheres. Prevenção.',
'02 Cápsulas ao dia.',
ARRAY[]::TEXT[],
ARRAY['Saúde cardiovascular', 'Imunidade', 'Saúde da próstata'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/promen.jpg',
true, 100, ARRAY['homem', 'prevenção']),

-- EXTRA (que estava na lista anterior mas não nas imagens principais, mantendo por segurança ou remover se desejar estrito)
('OLEO_HOT', 'Óleo Hot Ozonizado', 'Bem-Estar', 'Nema''s Way', 109.90, 54.95,
'Óleo de massagem aquecedor e estimulante.',
'Uso local.',
ARRAY['Ozônio'],
ARRAY['Aquecimento', 'Estimulante'],
ARRAY[]::TEXT[],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/oleo_hot.jpg',
true, 100, ARRAY['hot', 'massagem']),

-- 59. OZÔNIO EM CÁPSULAS (CRÍTICO - USADO EM TODOS OS PROTOCOLOS)
('OZONIO', 'Ozônio em Cápsulas', 'Saúde', 'Nema''s Way', 149.90, 74.95,
'Óleo de girassol ozonizado em cápsulas para oxigenação e regeneração celular. Ação anti-inflamatória, melhora oxigenação celular, antioxidante e regeneração celular.',
'2 cápsulas ao dia.',
ARRAY['Óleo de Girassol Ozonizado 500mg'],
ARRAY['Ação anti-inflamatória', 'Melhora oxigenação celular', 'Antioxidante', 'Regeneração celular', 'Combate infecções', 'Melhora circulação'],
ARRAY['Gravidez', 'Lactação'],
'https://xgqyqewiwaulkvbqmmeo.supabase.co/storage/v1/object/public/product-images/ozonio.jpg',
true, 200, ARRAY['ozonio', 'oxigenacao', 'antiinflamatorio', 'regeneracao']);

COMMIT;