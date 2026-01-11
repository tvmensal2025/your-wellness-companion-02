-- ==============================================================================
-- ATUALIZAÇÃO COMPLETA DO CATÁLOGO DE PRODUTOS E IMAGENS
-- ==============================================================================
-- Este script faz o seguinte:
-- 1. Atualiza/Insere todos os 58+ produtos oficiais com preços e nomes corretos.
-- 2. Define o caminho da imagem (image_url) padronizado para cada produto.
-- 3. Remove produtos que não estão na lista oficial.
-- 4. Garante que o desconto de 50% seja aplicado.

BEGIN;

-- 1. Definir lista de external_ids e dados para UPSERT
-- Tabela temporária para manipular os dados
CREATE TEMP TABLE temp_products_update (
    external_id TEXT,
    name TEXT,
    category TEXT,
    original_price DECIMAL(10,2),
    description TEXT,
    image_filename TEXT
);

INSERT INTO temp_products_update (external_id, name, category, original_price, description, image_filename) VALUES
('SOS_UNHAS', 'SOS Unhas Base Fortalecedora', 'Beleza', 49.90, 'Base fortalecedora e antifúngica com óleo de girassol ozonizado.', 'sos_unhas.jpg'),
('COLAGENO_ACIDO_HIALURONICO', 'Colágeno com Ácido Hialurônico', 'Beleza', 299.90, 'Colágeno Verisol com Ácido Hialurônico, Vitamina C e Biotina.', 'colageno_acido_hialuronico.jpg'),
('BVB_CALCIO', 'BVB Cálcio Concha de Ostra', 'Saúde', 99.90, 'Cálcio natural de concha de ostra para ossos fortes.', 'bvb_calcio.jpg'),
('LIPOWAY', 'Lipo Way Emagrecedor', 'Emagrecimento', 149.90, 'Queima gordura, fornece energia e acelera o metabolismo.', 'lipoway.jpg'),
('BVB_SB', 'BVB SB Seca Barriga', 'Emagrecimento', 149.90, 'Combinação de antioxidantes e fibras para controle de peso.', 'bvb_sb.jpg'),
('WINNER_OLEO_PERNAS', 'Winner Óleo para Pernas Ozonizado', 'Bem-Estar', 79.90, 'Alívio imediato para pernas cansadas com ozônio.', 'winner_oleo.jpg'),
('VITAMINA_K2', 'Vitamina K2', 'Saúde', 99.90, 'Direciona o cálcio para os ossos e protege o coração.', 'vitamina_k2.jpg'),
('FRESH_GLOW_CREME', 'Fresh Glow Creme Corporal', 'Beleza', 99.99, 'Hidratação profunda com ozônio, colágeno e elastina.', 'fresh_glow_creme.jpg'),
('VITAMINA_C_400MG', 'Vitamina C 400mg', 'Saúde', 49.90, 'Imunidade e rejuvenescimento em cápsulas.', 'vitamina_c.jpg'),
('FRESH_GLOW_LOCAO', 'Fresh Glow Loção Adstringente', 'Beleza', 99.90, 'Limpeza profunda e tonificação com ozônio.', 'fresh_glow_locao.jpg'),
('BVB_COLEST', 'BVB Colest Cranberry', 'Saúde', 129.90, 'Saúde do trato urinário e controle do colesterol.', 'bvb_colest.jpg'),
('FRESH_GLOW_SABONETE', 'Fresh Glow Sabonete Facial', 'Beleza', 99.99, 'Limpeza facial ozonizada com extrato de kiwi.', 'fresh_glow_sabonete.jpg'),
('BVB_D3K2', 'BVB D3K2', 'Saúde', 149.90, 'Imunidade e saúde óssea com Vitamina D3 e K2.', 'bvb_d3k2.jpg'),
('SD_ARTRO', 'SD Artro', 'Saúde', 134.90, 'Saúde das articulações e alívio de dores.', 'sd_artro.jpg'),
('COLAGENO_TIPO_II', 'Colágeno Tipo II', 'Saúde', 119.90, 'Reconstrução de cartilagens e articulações.', 'colageno_tipo_ii.jpg'),
('OLEO_PRIMULA', 'Óleo de Prímula', 'Saúde', 119.90, 'Equilíbrio hormonal e saúde da mulher.', 'oleo_primula.jpg'),
('GOLD_MONEY', 'Gold Money Perfume', 'Perfumaria', 199.99, 'Fragrância marcante e sofisticada.', 'gold_money.jpg'),
('LIBWAY', 'Lib Way', 'Saúde', 149.90, 'Energia e vitalidade para o dia a dia.', 'libway.jpg'),
('BVB_B12', 'BVB B12 Metilcobalamina', 'Saúde', 149.90, 'Energia para mente e corpo, saúde do sistema nervoso.', 'bvb_b12.jpg'),
('BVB_INSU', 'BVB Insu', 'Saúde', 149.90, 'Controle da glicose e diabetes.', 'bvb_insu.jpg'),
('VITAMIX_SKIN', 'Vitamix Skin', 'Beleza', 109.90, 'Nutrição avançada para uma pele radiante.', 'vitamix_skin.jpg'),
('ACIDO_HIALURONICO_FITIOS', 'Ácido Hialurônico Fitios', 'Beleza', 99.90, 'Hidratação e preenchimento da pele de dentro para fora.', 'acido_hialuronico.jpg'),
('OMEGA_3_1400MG', 'Ômega 3 1400mg', 'Saúde', 129.99, 'Saúde cardiovascular e cerebral.', 'omega_3.jpg'),
('VIP_GLAMOUR_KIT', 'Kit Vip Glamour', 'Perfumaria', 149.90, 'Body Splash e Creme Corporal inspirados em grandes fragrâncias.', 'vip_glamour.jpg'),
('FAIR_WAY', 'Fair Way Ozonizado', 'Beleza', 99.99, 'Cuidado corporal com o poder do ozônio.', 'fair_way.jpg'),
('BVB_ZINCO_QUELATO', 'BVB Zinco Quelato', 'Saúde', 129.90, 'Imunidade e cicatrização com máxima absorção.', 'bvb_zinco.jpg'),
('AMARGO', 'Chá Amargo', 'Emagrecimento', 99.90, 'Digestivo natural e auxiliar no emagrecimento.', 'amargo.jpg'),
('TOP_SECRETS', 'Top Secrets Creme Clareador', 'Beleza', 99.90, 'Clareamento de manchas com rosa mosqueta ozonizada.', 'top_secrets.jpg'),
('PEELING_5X1', 'Peeling 5x1 Gomage', 'Beleza', 99.90, 'Renovação celular e limpeza profunda.', 'peeling_5x1.jpg'),
('SEREMIX', 'Seremix', 'Bem-Estar', 149.90, 'Suplemento para um sono reparador e tranquilo.', 'seremix.jpg'),
('BVB_MORO', 'BVB Moro', 'Emagrecimento', 129.90, 'Laranja Moro para redução de medidas.', 'bvb_moro.jpg'),
('PROWOMAN', 'Pro Woman', 'Saúde', 149.90, 'Saúde integral da mulher.', 'prowoman.jpg'),
('SERUM_VITAMINA_C', 'Sérum Vitamina C Ozonizado', 'Beleza', 119.99, 'Antioxidante potente para o rosto.', 'serum_vitamina_c.jpg'),
('ORGANIC_OZON3_ARGAN', 'Organic Ozon3 Óleo de Argan', 'Beleza', 99.90, 'Hidratação e brilho para os cabelos.', 'organic_ozon3_argan.jpg'),
('POLIVITAMIX', 'Polivitamix A-Z', 'Saúde', 109.90, 'Polivitamínico completo para imunidade e energia.', 'polivitamix.jpg'),
('LIFE_WAY_GEL', 'Life Way Gel Massageador', 'Bem-Estar', 139.90, 'Alívio de dores musculares com ozônio.', 'life_way.jpg'),
('VISION_WAY', 'Vision Way', 'Saúde', 149.90, 'Proteção e saúde para os olhos.', 'vision_way.jpg'),
('BVB_Q10', 'BVB Coenzima Q10', 'Saúde', 159.90, 'Energia celular e saúde do coração.', 'bvb_q10.jpg'),
('SABONETE_INTIMO_SEDUCAO', 'Sabonete Íntimo Sedução', 'Higiene', 59.90, 'Cuidado íntimo diário com suavidade.', 'sabonete_intimo.jpg'),
('TENIS_BIOQUANTICO', 'Tênis Bioquântico', 'Bem-Estar', 1099.99, 'Tecnologia magnética para conforto e saúde dos pés.', 'tenis_bioquantico.jpg'),
('MELATONINA', 'Melatonina', 'Bem-Estar', 99.90, 'Hormônio do sono para noites tranquilas.', 'melatonina.jpg'),
('CREATINA_Q10', 'Creatina com Q10', 'Esporte', 299.99, 'Força muscular e energia com Coenzima Q10.', 'creatina_q10.jpg'),
('KIT_ORGANIC_OZON3', 'Kit Organic Ozon3 Capilar', 'Beleza', 399.90, 'Tratamento capilar completo com ozônio.', 'kit_organic_ozon3.jpg'),
('SERUM_RETINOL', 'Sérum Retinol Ozonizado', 'Beleza', 119.99, 'Rejuvenescimento facial com retinol e ozônio.', 'serum_retinol.jpg'),
('SD_FIBRO3', 'SD Fibro3', 'Saúde', 149.90, 'Alívio para dores crônicas e fibromialgia.', 'sd_fibro3.jpg'),
('SPIRULINA_VIT_E', 'Spirulina com Vitamina E', 'Saúde', 139.90, 'Detox e nutrição completa.', 'spirulina.jpg'),
('OLEO_GIRASSOL_OZONIZADO', 'Óleo de Girassol Ozonizado', 'Saúde', 109.90, 'Cicatrizante e regenerador potente.', 'oleo_girassol.jpg'),
('OLEO_REGENERADOR', 'Óleo Regenerador Ozonizado', 'Beleza', 109.90, 'Regeneração da pele com óleos ozonizados.', 'oleo_regenerador.jpg'),
('GEL_CRIOTERAPICO', 'Gel Crioterapico', 'Emagrecimento', 99.90, 'Redução de medidas com efeito gelado.', 'gel_crioterapico.jpg'),
('FOCUS_TDAH', 'Focus TDAH Premium', 'Saúde', 159.90, 'Foco, concentração e clareza mental.', 'focus_tdah.jpg'),
('CAR_BLACK', 'Car Black Perfume', 'Perfumaria', 199.99, 'Fragrância masculina intensa.', 'car_black.jpg'),
('MADAME_X', 'Madame X Perfume', 'Perfumaria', 199.99, 'Fragrância feminina elegante.', 'madame_x.jpg'),
('MOLECULA_DA_VIDA', 'Molécula da Vida', 'Saúde', 159.99, 'Saúde digestiva e proteção estomacal.', 'molecula_da_vida.jpg'),
('MEGA_NUTRI_RX21', 'Mega Nutri RX21', 'Beleza', 99.90, 'Fortalecimento de cabelos e unhas.', 'mega_nutri.jpg'),
('OLEO_MASSAGEM_OZONIZADO', 'Óleo de Massagem Ozonizado', 'Bem-Estar', 99.90, 'Relaxamento e alívio de tensões.', 'oleo_massagem.jpg'),
('PROPOLIS_VERDE', 'Própolis Verde', 'Saúde', 139.90, 'Imunidade natural potente.', 'propolis_verde.jpg'),
('PROPOWAY_VERMELHA', 'Propoway Vermelha', 'Saúde', 139.90, 'Própolis vermelha para saúde avançada.', 'propoway_vermelha.jpg'),
('PROMEN', 'Pro Men', 'Saúde', 149.90, 'Saúde integral do homem.', 'promen.jpg'),
('OLEO_HOT', 'Óleo Hot Ozonizado', 'Bem-Estar', 109.90, 'Óleo de massagem aquecedor e estimulante.', 'oleo_hot.jpg'),
('SERUM_ACIDO_HIALURONICO', 'Sérum Ácido Hialurônico Ozonizado', 'Beleza', 119.99, 'Hidratação profunda e preenchimento.', 'serum_acido_hialuronico.jpg');

-- 2. Atualizar/Inserir produtos na tabela supplements
-- O caminho da imagem é construído automaticamente apontando para o bucket 'product-images'
INSERT INTO public.supplements (
    external_id,
    name,
    category,
    brand,
    original_price,
    discount_price,
    description,
    image_url,
    is_approved,
    stock_quantity
)
SELECT
    t.external_id,
    t.name,
    t.category,
    'Nema''s Way',
    t.original_price,
    ROUND(t.original_price * 0.5, 2), -- Aplica 50% de desconto automaticamente
    t.description,
    'https://[SEU_PROJECT_REF].supabase.co/storage/v1/object/public/product-images/' || t.image_filename,
    true,
    100 -- Estoque padrão inicial
FROM temp_products_update t
ON CONFLICT (external_id) 
DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    brand = EXCLUDED.brand,
    original_price = EXCLUDED.original_price,
    discount_price = EXCLUDED.discount_price,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    is_approved = true,
    updated_at = NOW();

-- 3. Limpeza de produtos obsoletos (que não estão na tabela temporária)
-- Primeiro, remover dependências em user_supplements
DELETE FROM public.user_supplements
WHERE supplement_id IN (
    SELECT id FROM public.supplements
    WHERE external_id NOT IN (SELECT external_id FROM temp_products_update)
    OR external_id IS NULL
);

-- Depois, remover os produtos
DELETE FROM public.supplements
WHERE external_id NOT IN (SELECT external_id FROM temp_products_update)
OR external_id IS NULL;

COMMIT;

