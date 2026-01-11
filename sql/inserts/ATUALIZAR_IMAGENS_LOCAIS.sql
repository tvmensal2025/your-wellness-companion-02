-- Script para atualizar as imagens dos produtos com URLs locais
-- Usa as imagens que foram enviadas para o projeto

UPDATE public.supplements 
SET image_url = '/images/produtos/cart-control.png'
WHERE name = 'CART CONTROL';

UPDATE public.supplements 
SET image_url = '/images/produtos/az-complex.png'
WHERE name = 'A-Z COMPLEX';

UPDATE public.supplements 
SET image_url = '/images/produtos/bcaa.png'
WHERE name = 'BCAA';

UPDATE public.supplements 
SET image_url = '/images/produtos/maca-peruana.png'
WHERE name = 'MACA PERUANA';

UPDATE public.supplements 
SET image_url = '/images/produtos/imunic.png'
WHERE name = 'IMUNIC';

UPDATE public.supplements 
SET image_url = '/images/produtos/chlorella.png'
WHERE name = 'Chlorella';

UPDATE public.supplements 
SET image_url = '/images/produtos/coenzima-q10.png'
WHERE name = 'Coenzima Q10';

UPDATE public.supplements 
SET image_url = '/images/produtos/espirulina.png'
WHERE name = 'Espirulina';

UPDATE public.supplements 
SET image_url = '/images/produtos/vitamina-d3.png'
WHERE name = 'Vitamina D3';

UPDATE public.supplements 
SET image_url = '/images/produtos/magnesio.png'
WHERE name = 'Cloreto de Magnésio';

UPDATE public.supplements 
SET image_url = '/images/produtos/colageno.png'
WHERE name = 'Colágeno';

UPDATE public.supplements 
SET image_url = '/images/produtos/vitamina-k2.png'
WHERE name = 'Vitamina K2 MK7';

UPDATE public.supplements 
SET image_url = '/images/produtos/vitamina-b12.png'
WHERE name = 'Vitamina B12';

UPDATE public.supplements 
SET image_url = '/images/produtos/vitamina-a.png'
WHERE name = 'Vitamina A';

UPDATE public.supplements 
SET image_url = '/images/produtos/colageno-sub30.png'
WHERE name = 'Colágeno SUB 30';

UPDATE public.supplements 
SET image_url = '/images/produtos/focuss.png'
WHERE name = 'Focuss';

UPDATE public.supplements 
SET image_url = '/images/produtos/imuni-pro.png'
WHERE name = 'İMUNİ PRO';

UPDATE public.supplements 
SET image_url = '/images/produtos/geleia-real.png'
WHERE name = 'GELEIA REAL';

UPDATE public.supplements 
SET image_url = '/images/produtos/imuni-kids.png'
WHERE name = 'IMUNI KIDS';

UPDATE public.supplements 
SET image_url = '/images/produtos/natuoz-bronze.png'
WHERE name = 'NatuOz BRONZE';

UPDATE public.supplements 
SET image_url = '/images/produtos/natuoz-bucal.png'
WHERE name = 'NatuOz BUCAL';

UPDATE public.supplements 
SET image_url = '/images/produtos/l-triptofano.png'
WHERE name = 'L-TRIPTOFANO';

UPDATE public.supplements 
SET image_url = '/images/produtos/natuoz-hot.png'
WHERE name = 'NatuOz HOT';

UPDATE public.supplements 
SET image_url = '/images/produtos/life-control.png'
WHERE name = 'LÍFE control';

UPDATE public.supplements 
SET image_url = '/images/produtos/omega3.png'
WHERE name = 'OMEGA3';

UPDATE public.supplements 
SET image_url = '/images/produtos/dermo-peeling.png'
WHERE name = 'Dermo Natuoz PEELING DE CRISTAL OZONIZADO';

UPDATE public.supplements 
SET image_url = '/images/produtos/shake-baunilha.png'
WHERE name = 'Shake BAUNILHA';

UPDATE public.supplements 
SET image_url = '/images/produtos/shake-chocolate.png'
WHERE name = 'Shake CHOCOLATE';

UPDATE public.supplements 
SET image_url = '/images/produtos/zma.png'
WHERE name = 'ZMA';

UPDATE public.supplements 
SET image_url = '/images/produtos/slim-cha.png'
WHERE name = 'SLIM Cha SB.';

UPDATE public.supplements 
SET image_url = '/images/produtos/pre-treino-cafe.png'
WHERE name = 'NATURAL PRÉ-TREINO CAFÉ';

UPDATE public.supplements 
SET image_url = '/images/produtos/picolinato-cromo.png'
WHERE name = 'Picolinato de Cromo';

UPDATE public.supplements 
SET image_url = '/images/produtos/cafe-fibras.png'
WHERE name = 'NATURAL Café Fibras';

UPDATE public.supplements 
SET image_url = '/images/produtos/nighth-cha.png'
WHERE name = 'Nighth Chá';

UPDATE public.supplements 
SET image_url = '/images/produtos/shake-morango.png'
WHERE name = 'Shake Morango';

UPDATE public.supplements 
SET image_url = '/images/produtos/thermo-heat.png'
WHERE name = 'Thermo Heat';

-- Verificar se as imagens foram atualizadas
SELECT name, image_url FROM public.supplements 
WHERE image_url IS NOT NULL 
ORDER BY name;
