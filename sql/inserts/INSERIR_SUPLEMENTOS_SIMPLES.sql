-- Script simples para inserir suplementos na tabela
-- Primeiro, vamos verificar se a tabela existe e tem dados

-- Verificar estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'supplements' 
AND table_schema = 'public';

-- Verificar se já existem dados
SELECT COUNT(*) as total_registros FROM public.supplements;

-- Se não houver dados, inserir alguns suplementos básicos para teste
INSERT INTO public.supplements (
    id, name, active_ingredients, recommended_dosage, benefits, contraindications,
    category, brand, is_approved, image_url, original_price, discount_price,
    description, stock_quantity, tags
) VALUES 
('CART_CONTROL', 'CART CONTROL', 
 ARRAY['Cafeína', 'Chá Verde', 'L-Carnitina', 'Cromo', 'Capsaicina'],
 '2 cápsulas 30 minutos antes do almoço',
 ARRAY['Acelera metabolismo', 'Reduz gordura abdominal', 'Controla apetite', 'Aumenta termogênese'],
 ARRAY['Hipertensão grave não controlada', 'Gravidez', 'Lactação', 'Problemas cardíacos'],
 'emagrecimento', 'Atlântica Natural', true,
 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=CART+CONTROL',
 189.90, 94.90,
 'Complexo termogênico avançado para controle de peso e aceleração metabólica.',
 150, ARRAY['termogenico', 'emagrecimento', 'metabolismo', 'gordura_abdominal']),

('AZ_COMPLEX', 'A-Z COMPLEX',
 ARRAY['24 Vitaminas e Minerais', 'Vitamina A', 'Complexo B', 'Vitamina C', 'Vitamina D3', 'Vitamina E', 'Zinco', 'Selênio', 'Magnésio'],
 '1 cápsula ao dia com refeição principal',
 ARRAY['Suporte nutricional completo', 'Aumenta energia', 'Fortalece imunidade', 'Melhora concentração'],
 ARRAY['Hipervitaminose', 'Alergia a algum componente'],
 'vitaminas', 'Atlântica Natural', true,
 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=A-Z+COMPLEX',
 159.90, 79.90,
 'Multivitamínico completo com 24 nutrientes essenciais em doses ideais.',
 200, ARRAY['multivitaminico', 'essencial', 'energia', 'imunidade']),

('OMEGA_3', 'OMEGA 3',
 ARRAY['EPA 500mg', 'DHA 250mg', 'Vitamina E'],
 '2 cápsulas ao dia com refeições',
 ARRAY['Saúde cardiovascular', 'Reduz triglicerídeos', 'Anti-inflamatório', 'Melhora cognição'],
 ARRAY['Alergia a peixes', 'Uso de anticoagulantes (consultar médico)'],
 'cardiovascular', 'Atlântica Natural', true,
 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=OMEGA+3',
 149.90, 74.90,
 'Ômega 3 de alta concentração (EPA + DHA) purificado por destilação molecular.',
 180, ARRAY['omega3', 'cardiovascular', 'antiinflamatorio', 'cerebro']),

('VITAMINA_D3', 'VITAMINA D3 2000UI',
 ARRAY['Colecalciferol (D3) 2000UI'],
 '1 cápsula ao dia com refeição',
 ARRAY['Fortalece ossos', 'Melhora imunidade', 'Previne osteoporose', 'Melhora humor'],
 ARRAY['Hipercalcemia', 'Sarcoidose'],
 'vitaminas', 'Atlântica Natural', true,
 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=VITAMINA+D3',
 79.90, 39.90,
 'Vitamina D3 na forma ativa com máxima biodisponibilidade.',
 300, ARRAY['vitamina_d', 'ossos', 'imunidade', 'essencial']),

('CREATINA', 'CREATINA MONOHIDRATADA PURA',
 ARRAY['Creatina Monohidratada 3g'],
 '1 scoop (3g) ao dia, qualquer horário',
 ARRAY['Aumenta força', 'Ganha massa muscular', 'Melhora performance', 'Acelera recuperação'],
 ARRAY['Problemas renais'],
 'performance', 'Atlântica Natural', true,
 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=CREATINA',
 129.90, 64.90,
 'Creatina 100% pura, micronizada, sem aditivos.',
 200, ARRAY['creatina', 'forca', 'massa_muscular', 'treino']),

('WHEY_PROTEIN', 'WHEY PROTEIN CONCENTRADO 80%',
 ARRAY['Whey Protein Concentrado 25g', 'BCAAs 5.5g'],
 '1 scoop (30g) pós-treino ou entre refeições',
 ARRAY['Ganho muscular', 'Recuperação', 'Saciedade', 'Aminoácidos essenciais'],
 ARRAY['Alergia ao leite', 'Intolerância à lactose severa'],
 'proteinas', 'Atlântica Natural', true,
 'https://via.placeholder.com/300x300/EF4444/FFFFFF?text=WHEY+PROTEIN',
 179.90, 89.90,
 'Whey protein de alto valor biológico com 80% de proteína.',
 150, ARRAY['whey', 'proteina', 'massa_muscular', 'recuperacao'])

ON CONFLICT (id) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_suplementos FROM public.supplements;
SELECT name, category, is_approved FROM public.supplements WHERE is_approved = true ORDER BY name;
