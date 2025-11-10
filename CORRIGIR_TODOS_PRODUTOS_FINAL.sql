-- Script FINAL para corrigir TODOS os produtos sem imagem
-- Execute este script no Supabase SQL Editor

-- 1. Mapear produtos que ainda não têm imagem usando as imagens disponíveis
-- Aminoácidos - usar produtos genéricos
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja100.png'
WHERE name = '5-HTP 100mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja102.png'
WHERE name = 'L-Alanina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja103.png'
WHERE name = 'L-Arginina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja104.png'
WHERE name = 'L-Aspartato 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja105.png'
WHERE name = 'L-Citrulina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja106.png'
WHERE name = 'L-Fenilalanina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja107.png'
WHERE name = 'L-Glicina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja108.png'
WHERE name = 'L-Leucina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja109.png'
WHERE name = 'L-Lisina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja110.png'
WHERE name = 'L-Serina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja111.png'
WHERE name = 'L-Valina 500mg';

-- Minerais
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja25.png'
WHERE name = 'Cobre + Zinco';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja26.png'
WHERE name = 'Ferro + Vitamina C';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja30.png'
WHERE name = 'Iodo + Zinco';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja33.png'
WHERE name = 'Magnésio + Zinco';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja37.png'
WHERE name = 'Selênio + Zinco';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja39.png'
WHERE name = 'Zinco + Cobre';

-- Vitaminas
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja40.png'
WHERE name = 'Complexo B Completo';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja41.png'
WHERE name = 'Vitamina C + Zinco';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja44.png'
WHERE name = 'Vitamina D3 + K2';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja48.png'
WHERE name = 'Vitamina E + Selênio';

-- Neurotransmissores
UPDATE public.supplements
SET image_url = '/images/produtos/melatoninacapsula.png'
WHERE name = 'GABA 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja49.png'
WHERE name = 'L-Tirosina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja51.png'
WHERE name = 'Triptofano 500mg';

-- Fitoterápicos
UPDATE public.supplements
SET image_url = '/images/produtos/curcumais.png'
WHERE name = 'Ashwagandha 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja55.png'
WHERE name = 'Ginkgo Biloba 120mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja56.png'
WHERE name = 'Ginseng Coreano 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja60.png'
WHERE name = 'Rhodiola Rosea 400mg';

-- Probióticos
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja61.png'
WHERE name = 'Probióticos + Prebióticos';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja62.png'
WHERE name = 'Lactobacillus Acidophilus';

-- Ácidos Graxos
UPDATE public.supplements
SET image_url = '/images/produtos/oleodepeixeomega3.png'
WHERE name = 'Óleo de Peixe Omega 3';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja63.png'
WHERE name = 'Óleo de Linhaça';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja64.png'
WHERE name = 'Óleo de Coco';

-- Proteínas
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja65.png'
WHERE name = 'Whey Protein Isolado';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja66.png'
WHERE name = 'Caseína Micelar';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja67.png'
WHERE name = 'Proteína Vegetal';

-- Antioxidantes
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja68.png'
WHERE name = 'Resveratrol 200mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja73.png'
WHERE name = 'Coenzima Q10 + Vitamina E';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja74.png'
WHERE name = 'Astaxantina 4mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja75.png'
WHERE name = 'Luteína + Zeaxantina';

-- Termogênicos
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja76.png'
WHERE name = 'Café Verde 400mg';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja77.png'
WHERE name = 'Chá Verde + Cafeína';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja78.png'
WHERE name = 'Guaraná + Cafeína';

-- Digestivos
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja79.png'
WHERE name = 'Enzimas Digestivas';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja81.png'
WHERE name = 'Fibras Solúveis';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja84.png'
WHERE name = 'Psyllium + Fibras';

-- 2. Garantir que TODOS os produtos têm imagem
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja85.png'
WHERE image_url IS NULL OR image_url = '';

-- 3. Verificar resultado final
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN image_url LIKE '/images/produtos/%' THEN 1 END) as com_imagem_local,
    COUNT(CASE WHEN score > 0 THEN 1 END) as com_score,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as aprovados
FROM public.supplements;

-- 4. Verificar se ainda há produtos sem imagem
SELECT 
    name,
    category,
    score,
    image_url,
    CASE 
        WHEN image_url LIKE '/images/produtos/%' THEN '✅ Imagem Local'
        WHEN image_url LIKE 'https://%' THEN '🌐 URL Externa'
        ELSE '❌ Sem Imagem'
    END as status_imagem
FROM public.supplements 
WHERE image_url IS NULL OR image_url = ''
ORDER BY name;
