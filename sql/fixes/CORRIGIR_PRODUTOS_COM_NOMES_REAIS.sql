-- Script para corrigir os produtos com os nomes reais das imagens
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna score se não existir
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 50;

-- 2. Corrigir os 3 produtos restantes com nomes reais das imagens
UPDATE public.supplements
SET image_url = '/images/produtos/azcomplex.png'
WHERE name = 'A-Z COMPLEX';

UPDATE public.supplements
SET image_url = '/images/produtos/cartcontrol.png'
WHERE name = 'CART CONTROL';

UPDATE public.supplements
SET image_url = '/images/produtos/vitaminak2mk7.png'
WHERE name = 'Vitamina K2 MK7';

-- 3. Atualizar outros produtos importantes com nomes corretos
UPDATE public.supplements
SET image_url = '/images/produtos/bcacapsulas.png'
WHERE name = 'BCAA';

UPDATE public.supplements
SET image_url = '/images/produtos/Chlorella.png'
WHERE name = 'Chlorella';

UPDATE public.supplements
SET image_url = '/images/produtos/coenzimaq10.png'
WHERE name = 'Coenzima Q10';

UPDATE public.supplements
SET image_url = '/images/produtos/colageno.png'
WHERE name = 'Colágeno';

UPDATE public.supplements
SET image_url = '/images/produtos/colagenosub30.png'
WHERE name = 'Colágeno SUB 30';

UPDATE public.supplements
SET image_url = '/images/produtos/DermoNatuoz.png'
WHERE name = 'Dermo Natuoz PEELING DE CRISTAL OZONIZADO';

UPDATE public.supplements
SET image_url = '/images/produtos/espirulina.png'
WHERE name = 'Espirulina';

UPDATE public.supplements
SET image_url = '/images/produtos/fibrascomplex.png'
WHERE name = 'Fibras Complex';

UPDATE public.supplements
SET image_url = '/images/produtos/focuss.png'
WHERE name = 'Focuss';

UPDATE public.supplements
SET image_url = '/images/produtos/geleia-real.png'
WHERE name = 'GELEIA REAL';

UPDATE public.supplements
SET image_url = '/images/produtos/Imunikids.png'
WHERE name = 'IMUNI KIDS';

UPDATE public.supplements
SET image_url = '/images/produtos/imunic.png'
WHERE name = 'IMUNIC';

UPDATE public.supplements
SET image_url = '/images/produtos/lifecontrol.png'
WHERE name = 'LÍFE control';

UPDATE public.supplements
SET image_url = '/images/produtos/macaperuana.png'
WHERE name = 'MACA PERUANA';

UPDATE public.supplements
SET image_url = '/images/produtos/Natuozhot.png'
WHERE name = 'NatuOz HOT';

UPDATE public.supplements
SET image_url = '/images/produtos/naturalcafefibras.png'
WHERE name = 'NATURAL Café Fibras';

UPDATE public.supplements
SET image_url = '/images/produtos/naturalpre-treino-cafe.png'
WHERE name = 'NATURAL PRÉ-TREINO CAFÉ';

UPDATE public.supplements
SET image_url = '/images/produtos/nighthcha.png'
WHERE name = 'Nighth Chá';

UPDATE public.supplements
SET image_url = '/images/produtos/omega3.png'
WHERE name = 'OMEGA3';

UPDATE public.supplements
SET image_url = '/images/produtos/picolinatocromo.png'
WHERE name = 'Picolinato de Cromo';

UPDATE public.supplements
SET image_url = '/images/produtos/Shakebaunilha.png'
WHERE name = 'Shake BAUNILHA';

UPDATE public.supplements
SET image_url = '/images/produtos/shakechocolate.png'
WHERE name = 'Shake CHOCOLATE';

UPDATE public.supplements
SET image_url = '/images/produtos/shakemorango.png'
WHERE name = 'Shake Morango';

UPDATE public.supplements
SET image_url = '/images/produtos/slimchasb.png'
WHERE name = 'SLIM Cha SB.';

UPDATE public.supplements
SET image_url = '/images/produtos/thermoheat.png'
WHERE name = 'Thermo Heat';

UPDATE public.supplements
SET image_url = '/images/produtos/vitaminaaemgotas.png'
WHERE name = 'Vitamina A';

UPDATE public.supplements
SET image_url = '/images/produtos/vitaminab12.png'
WHERE name = 'Vitamina B12';

UPDATE public.supplements
SET image_url = '/images/produtos/vitaminad3capsula.png'
WHERE name = 'Vitamina D3';

UPDATE public.supplements
SET image_url = '/images/produtos/vitaminak2mk7.png'
WHERE name = 'Vitamina K2 MK7';

UPDATE public.supplements
SET image_url = '/images/produtos/zma.png'
WHERE name = 'ZMA';

-- 4. Atualizar scores para produtos baseado em categorias
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
  ELSE 60
END
WHERE score IS NULL OR score = 0;

-- 5. Garantir que todos os produtos estão aprovados
UPDATE public.supplements 
SET is_approved = true
WHERE is_approved IS NULL OR is_approved = false;

-- 6. Verificar resultado
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN image_url LIKE '/images/produtos/%' THEN 1 END) as com_imagem_local,
    COUNT(CASE WHEN score > 0 THEN 1 END) as com_score,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as aprovados
FROM public.supplements;

-- 7. Verificar alguns produtos específicos
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
LIMIT 15;
