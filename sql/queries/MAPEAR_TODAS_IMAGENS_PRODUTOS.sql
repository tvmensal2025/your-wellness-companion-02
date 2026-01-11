-- Script para mapear TODAS as imagens dos produtos com os nomes reais dos arquivos
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna score se não existir
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 50;

-- 2. Mapear TODAS as imagens com nomes reais dos arquivos
-- Produtos principais já mapeados
UPDATE public.supplements
SET image_url = '/images/produtos/azcomplex.png'
WHERE name = 'A-Z COMPLEX';

UPDATE public.supplements
SET image_url = '/images/produtos/cartcontrol.png'
WHERE name = 'CART CONTROL';

UPDATE public.supplements
SET image_url = '/images/produtos/bcacapsulas.png'
WHERE name = 'BCAA';

UPDATE public.supplements
SET image_url = '/images/produtos/Chlorella.png'
WHERE name = 'Chlorella';

UPDATE public.supplements
SET image_url = '/images/produtos/cloretodemagnesio.png'
WHERE name = 'Cloreto de Magnésio';

UPDATE public.supplements
SET image_url = '/images/produtos/coezimaq10.png'
WHERE name = 'Coenzima Q10';

UPDATE public.supplements
SET image_url = '/images/produtos/colagenoacidohialuronico.png'
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
SET image_url = '/images/produtos/focus.png'
WHERE name = 'Focuss';

UPDATE public.supplements
SET image_url = '/images/produtos/geleiarealsuplementoalimentar.png'
WHERE name = 'GELEIA REAL';

UPDATE public.supplements
SET image_url = '/images/produtos/Imunikids.png'
WHERE name = 'IMUNI KIDS';

UPDATE public.supplements
SET image_url = '/images/produtos/imunicvitaminac.png'
WHERE name = 'IMUNIC';

UPDATE public.supplements
SET image_url = '/images/produtos/ltriptofano.png'
WHERE name = 'L-TRIPTOFANO';

UPDATE public.supplements
SET image_url = '/images/produtos/lifecontrol.png'
WHERE name = 'LÍFE control';

UPDATE public.supplements
SET image_url = '/images/produtos/macaperuanaextratoconcentrado.png'
WHERE name = 'MACA PERUANA';

UPDATE public.supplements
SET image_url = '/images/produtos/Natuozhot.png'
WHERE name = 'NatuOz HOT';

UPDATE public.supplements
SET image_url = '/images/produtos/naturalcafe.png'
WHERE name = 'NATURAL Café Fibras';

UPDATE public.supplements
SET image_url = '/images/produtos/naturalcafepretreino.png'
WHERE name = 'NATURAL PRÉ-TREINO CAFÉ';

UPDATE public.supplements
SET image_url = '/images/produtos/nightchá.png'
WHERE name = 'Nighth Chá';

UPDATE public.supplements
SET image_url = '/images/produtos/oleodepeixeomega3.png'
WHERE name = 'OMEGA3';

UPDATE public.supplements
SET image_url = '/images/produtos/picolinatodecromo.png'
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
SET image_url = '/images/produtos/slinchá.png'
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

-- 3. Mapear produtos com nomes similares usando produtos genéricos
-- Aminoácidos
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja100.png'
WHERE name LIKE '%L-Carnitina%' OR name LIKE '%Carnitina%';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja102.png'
WHERE name LIKE '%L-Metionina%' OR name LIKE '%Metionina%';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja103.png'
WHERE name LIKE '%L-Treonina%' OR name LIKE '%Treonina%';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja104.png'
WHERE name LIKE '%L-Histidina%' OR name LIKE '%Histidina%';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja105.png'
WHERE name LIKE '%L-Isoleucina%' OR name LIKE '%Isoleucina%';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja106.png'
WHERE name LIKE '%L-Glutamina%' OR name LIKE '%Glutamina%';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja107.png'
WHERE name LIKE '%L-Cisteína%' OR name LIKE '%Cisteína%';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja108.png'
WHERE name LIKE '%L-Taurina%' OR name LIKE '%Taurina%';

UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja109.png'
WHERE name LIKE '%L-Prolina%' OR name LIKE '%Prolina%';

-- Vitaminas
UPDATE public.supplements
SET image_url = '/images/produtos/vitaminab12.png'
WHERE name LIKE '%Vitamina B%' OR name LIKE '%B9%' OR name LIKE '%Ácido Fólico%' OR name LIKE '%B3%';

UPDATE public.supplements
SET image_url = '/images/produtos/vitaminad3capsula.png'
WHERE name LIKE '%Cálcio%' OR name LIKE '%Vitamina D%';

-- Minerais
UPDATE public.supplements
SET image_url = '/images/produtos/picolinatodecromo.png'
WHERE name LIKE '%Cromo%' OR name LIKE '%Vanádio%';

-- Neurotransmissores
UPDATE public.supplements
SET image_url = '/images/produtos/melatoninacapsula.png'
WHERE name LIKE '%Melatonina%';

-- Fitoterápicos
UPDATE public.supplements
SET image_url = '/images/produtos/curcumais.png'
WHERE name LIKE '%Curcuma%' OR name LIKE '%Pimpreta%';

-- 4. Mapear produtos restantes com imagens genéricas
UPDATE public.supplements
SET image_url = '/images/produtos/produto_loja110.png'
WHERE name LIKE '%ÓLEO ESSENCIAL%' AND name LIKE '%MENTA%';

UPDATE public.supplements
SET image_url = '/images/produtos/oleoessencialeucalipto.png'
WHERE name LIKE '%ÓLEO ESSENCIAL%' AND name LIKE '%EUCALIPTO%';

UPDATE public.supplements
SET image_url = '/images/produtos/balsamooleodavida.png'
WHERE name LIKE '%BÁLSAMO%' OR name LIKE '%ÓLEO DA VIDA%';

UPDATE public.supplements
SET image_url = '/images/produtos/mascarafacialozonizada.png'
WHERE name LIKE '%MÁSCARA%' OR name LIKE '%FACIAL%';

UPDATE public.supplements
SET image_url = '/images/produtos/oleodegirassolozonizado.png'
WHERE name LIKE '%ÓLEO DE GIRASSOL%' OR name LIKE '%ROSA MOSQUETA%';

UPDATE public.supplements
SET image_url = '/images/produtos/elevaday.png'
WHERE name LIKE '%ELEVA%' OR name LIKE '%DAY%';

UPDATE public.supplements
SET image_url = '/images/produtos/essencialbeauty.png'
WHERE name LIKE '%ESSENCIAL%' OR name LIKE '%BEAUTY%';

UPDATE public.supplements
SET image_url = '/images/produtos/natuozbronze.png'
WHERE name LIKE '%NATUOZ%' AND name LIKE '%BRONZE%';

UPDATE public.supplements
SET image_url = '/images/produtos/natuozbucal.png'
WHERE name LIKE '%NATUOZ%' AND name LIKE '%BUCAL%';

UPDATE public.supplements
SET image_url = '/images/produtos/cremehidratanteozonizado.png'
WHERE name LIKE '%CREME%' OR name LIKE '%DENTAL%';

UPDATE public.supplements
SET image_url = '/images/produtos/energyguarana.png'
WHERE name LIKE '%ENERGY%' OR name LIKE '%GUARANÁ%';

UPDATE public.supplements
SET image_url = '/images/produtos/morotreiny.png'
WHERE name LIKE '%MORO%' OR name LIKE '%TREINY%';

UPDATE public.supplements
SET image_url = '/images/produtos/imunipro.png'
WHERE name LIKE '%İMUNİ%' OR name LIKE '%IMUNI PRO%';

UPDATE public.supplements
SET image_url = '/images/produtos/chaverdecomgengibre.png'
WHERE name LIKE '%CHÁ%' OR name LIKE '%VERDE%';

-- 5. Atualizar scores para produtos baseado em categorias
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
  ELSE 60
END
WHERE score IS NULL OR score = 0;

-- 6. Garantir que todos os produtos estão aprovados
UPDATE public.supplements 
SET is_approved = true
WHERE is_approved IS NULL OR is_approved = false;

-- 7. Verificar resultado final
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN image_url LIKE '/images/produtos/%' THEN 1 END) as com_imagem_local,
    COUNT(CASE WHEN score > 0 THEN 1 END) as com_score,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as aprovados
FROM public.supplements;

-- 8. Verificar produtos sem imagem
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
