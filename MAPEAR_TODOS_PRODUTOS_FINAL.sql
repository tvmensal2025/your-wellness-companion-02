-- Script FINAL para mapear TODOS os produtos com nomes corretos dos arquivos
-- Execute este script no Supabase SQL Editor

-- 1. Mapear produtos que ainda não têm imagem usando os arquivos renomeados
-- Aminoácidos
UPDATE public.supplements
SET image_url = '/images/produtos/5-htp-100mg.png'
WHERE name = '5-HTP 100mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-alanina-500mg.png'
WHERE name = 'L-Alanina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-arginina-500mg.png'
WHERE name = 'L-Arginina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-aspartato-500mg.png'
WHERE name = 'L-Aspartato 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-citrulina-500mg.png'
WHERE name = 'L-Citrulina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-fenilalanina-500mg.png'
WHERE name = 'L-Fenilalanina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-glicina-500mg.png'
WHERE name = 'L-Glicina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-leucina-500mg.png'
WHERE name = 'L-Leucina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-lisina-500mg.png'
WHERE name = 'L-Lisina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-serina-500mg.png'
WHERE name = 'L-Serina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-valina-500mg.png'
WHERE name = 'L-Valina 500mg';

-- Minerais
UPDATE public.supplements
SET image_url = '/images/produtos/cobre-zinco.png'
WHERE name = 'Cobre + Zinco';

UPDATE public.supplements
SET image_url = '/images/produtos/ferro-vitamina-c.png'
WHERE name = 'Ferro + Vitamina C';

UPDATE public.supplements
SET image_url = '/images/produtos/iodo-zinco.png'
WHERE name = 'Iodo + Zinco';

UPDATE public.supplements
SET image_url = '/images/produtos/magnesio-zinco.png'
WHERE name = 'Magnésio + Zinco';

UPDATE public.supplements
SET image_url = '/images/produtos/selenio-zinco.png'
WHERE name = 'Selênio + Zinco';

UPDATE public.supplements
SET image_url = '/images/produtos/zinco-cobre.png'
WHERE name = 'Zinco + Cobre';

-- Vitaminas
UPDATE public.supplements
SET image_url = '/images/produtos/complexo-b-completo.png'
WHERE name = 'Complexo B Completo';

UPDATE public.supplements
SET image_url = '/images/produtos/vitamina-c-zinco.png'
WHERE name = 'Vitamina C + Zinco';

UPDATE public.supplements
SET image_url = '/images/produtos/vitamina-d3-k2.png'
WHERE name = 'Vitamina D3 + K2';

UPDATE public.supplements
SET image_url = '/images/produtos/vitamina-e-selenio.png'
WHERE name = 'Vitamina E + Selênio';

-- Neurotransmissores
UPDATE public.supplements
SET image_url = '/images/produtos/melatoninacapsula.png'
WHERE name = 'GABA 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/l-tirosina-500mg.png'
WHERE name = 'L-Tirosina 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/triptofano-500mg.png'
WHERE name = 'Triptofano 500mg';

-- Fitoterápicos
UPDATE public.supplements
SET image_url = '/images/produtos/curcumais.png'
WHERE name = 'Ashwagandha 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/ginkgo-biloba-120mg.png'
WHERE name = 'Ginkgo Biloba 120mg';

UPDATE public.supplements
SET image_url = '/images/produtos/ginseng-coreano-500mg.png'
WHERE name = 'Ginseng Coreano 500mg';

UPDATE public.supplements
SET image_url = '/images/produtos/rhodiola-rosea-400mg.png'
WHERE name = 'Rhodiola Rosea 400mg';

-- Probióticos
UPDATE public.supplements
SET image_url = '/images/produtos/probioticos-prebioticos.png'
WHERE name = 'Probióticos + Prebióticos';

UPDATE public.supplements
SET image_url = '/images/produtos/lactobacillus-acidophilus.png'
WHERE name = 'Lactobacillus Acidophilus';

-- Ácidos Graxos
UPDATE public.supplements
SET image_url = '/images/produtos/oleodepeixeomega3.png'
WHERE name = 'Óleo de Peixe Omega 3';

UPDATE public.supplements
SET image_url = '/images/produtos/oleo-linhaca.png'
WHERE name = 'Óleo de Linhaça';

UPDATE public.supplements
SET image_url = '/images/produtos/oleo-coco.png'
WHERE name = 'Óleo de Coco';

-- Proteínas
UPDATE public.supplements
SET image_url = '/images/produtos/whey-protein-isolado.png'
WHERE name = 'Whey Protein Isolado';

UPDATE public.supplements
SET image_url = '/images/produtos/caseina-micelar.png'
WHERE name = 'Caseína Micelar';

UPDATE public.supplements
SET image_url = '/images/produtos/proteina-vegetal.png'
WHERE name = 'Proteína Vegetal';

-- Antioxidantes
UPDATE public.supplements
SET image_url = '/images/produtos/resveratrol-200mg.png'
WHERE name = 'Resveratrol 200mg';

UPDATE public.supplements
SET image_url = '/images/produtos/coenzima-q10-vitamina-e.png'
WHERE name = 'Coenzima Q10 + Vitamina E';

UPDATE public.supplements
SET image_url = '/images/produtos/astaxantina-4mg.png'
WHERE name = 'Astaxantina 4mg';

UPDATE public.supplements
SET image_url = '/images/produtos/luteina-zeaxantina.png'
WHERE name = 'Luteína + Zeaxantina';

-- Termogênicos
UPDATE public.supplements
SET image_url = '/images/produtos/cafe-verde-400mg.png'
WHERE name = 'Café Verde 400mg';

UPDATE public.supplements
SET image_url = '/images/produtos/cha-verde-cafeina.png'
WHERE name = 'Chá Verde + Cafeína';

UPDATE public.supplements
SET image_url = '/images/produtos/guarana-cafeina.png'
WHERE name = 'Guaraná + Cafeína';

-- Digestivos
UPDATE public.supplements
SET image_url = '/images/produtos/enzimas-digestivas.png'
WHERE name = 'Enzimas Digestivas';

UPDATE public.supplements
SET image_url = '/images/produtos/fibras-soluveis.png'
WHERE name = 'Fibras Solúveis';

UPDATE public.supplements
SET image_url = '/images/produtos/psyllium-fibras.png'
WHERE name = 'Psyllium + Fibras';

-- 2. Garantir que TODOS os produtos têm imagem
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja85.png'
WHERE image_url IS NULL OR image_url = '';

-- 3. Atualizar scores para produtos baseado em categorias
UPDATE public.supplements 
SET score = CASE 
  WHEN category ILIKE '%proteina%' THEN 85
  WHEN category ILIKE '%vitamina%' THEN 80
  WHEN category ILIKE '%mineral%' THEN 75
  WHEN category ILIKE '%omega%' THEN 82
  WHEN category ILIKE '%termogenico%' THEN 78
  WHEN category ILIKE '%sono%' THEN 70
  WHEN category ILIKE '%energia%' THEN 76
  WHEN category ILIKE '%imunidade%' THEN 88
  WHEN category ILIKE '%aminoácido%' THEN 75
  WHEN category ILIKE '%neurotransmissor%' THEN 70
  WHEN category ILIKE '%fitoterápico%' THEN 72
  WHEN category ILIKE '%probiótico%' THEN 85
  WHEN category ILIKE '%antioxidante%' THEN 78
  WHEN category ILIKE '%digestivo%' THEN 70
  ELSE 60
END
WHERE score IS NULL OR score = 0;

-- 4. Garantir que todos os produtos estão aprovados
UPDATE public.supplements 
SET is_approved = true
WHERE is_approved IS NULL OR is_approved = false;

-- 5. Verificar resultado final
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN image_url LIKE '/images/produtos/%' THEN 1 END) as com_imagem_local,
    COUNT(CASE WHEN score > 0 THEN 1 END) as com_score,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as aprovados
FROM public.supplements;

-- 6. Verificar se ainda há produtos sem imagem (deve retornar 0)
SELECT 
    COUNT(*) as produtos_sem_imagem
FROM public.supplements 
WHERE image_url IS NULL OR image_url = '';

-- 7. Mostrar alguns produtos como exemplo
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
ORDER BY score DESC
LIMIT 20;
