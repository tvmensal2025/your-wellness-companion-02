-- Script para verificar e corrigir problemas com recomendações de suplementos

-- 1. Verificar se a tabela supplements existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'supplements'
) as tabela_supplements_existe;

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'supplements' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se existem dados na tabela
SELECT COUNT(*) as total_suplementos FROM public.supplements;

-- 4. Verificar suplementos aprovados
SELECT COUNT(*) as suplementos_aprovados 
FROM public.supplements 
WHERE is_approved = true;

-- 5. Verificar alguns registros de exemplo
SELECT id, name, category, is_approved, image_url
FROM public.supplements 
WHERE is_approved = true
ORDER BY name
LIMIT 10;

-- 6. Verificar se a tabela user_supplements existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_supplements'
) as tabela_user_supplements_existe;

-- 7. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('supplements', 'user_supplements');

-- 8. Se não houver dados, inserir alguns suplementos básicos
INSERT INTO public.supplements (
    id, name, active_ingredients, recommended_dosage, benefits, contraindications,
    category, brand, is_approved, image_url, original_price, discount_price,
    description, stock_quantity, tags
) VALUES 
('TESTE_1', 'MULTIVITAMÍNICO A-Z', 
 ARRAY['24 Vitaminas e Minerais'],
 '1 cápsula ao dia',
 ARRAY['Suporte nutricional completo', 'Aumenta energia', 'Fortalece imunidade'],
 ARRAY['Hipervitaminose'],
 'vitaminas', 'Atlântica Natural', true,
 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=MULTIVITAMÍNICO',
 159.90, 79.90,
 'Multivitamínico completo com 24 nutrientes essenciais.',
 200, ARRAY['multivitaminico', 'essencial', 'energia']),

('TESTE_2', 'ÔMEGA 3', 
 ARRAY['EPA 500mg', 'DHA 250mg'],
 '2 cápsulas ao dia',
 ARRAY['Saúde cardiovascular', 'Anti-inflamatório', 'Melhora cognição'],
 ARRAY['Alergia a peixes'],
 'cardiovascular', 'Atlântica Natural', true,
 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=ÔMEGA+3',
 149.90, 74.90,
 'Ômega 3 de alta concentração (EPA + DHA).',
 180, ARRAY['omega3', 'cardiovascular', 'antiinflamatorio']),

('TESTE_3', 'VITAMINA D3', 
 ARRAY['Colecalciferol (D3) 2000UI'],
 '1 cápsula ao dia',
 ARRAY['Fortalece ossos', 'Melhora imunidade', 'Previne osteoporose'],
 ARRAY['Hipercalcemia'],
 'vitaminas', 'Atlântica Natural', true,
 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=VITAMINA+D3',
 79.90, 39.90,
 'Vitamina D3 na forma ativa.',
 300, ARRAY['vitamina_d', 'ossos', 'imunidade'])

ON CONFLICT (id) DO NOTHING;

-- 9. Verificar novamente após inserção
SELECT COUNT(*) as total_apos_insercao FROM public.supplements WHERE is_approved = true;

-- 10. Verificar se há usuários na tabela profiles
SELECT COUNT(*) as total_usuarios FROM public.profiles;

-- 11. Verificar se há anamnese
SELECT COUNT(*) as total_anamneses FROM public.user_anamnesis;
