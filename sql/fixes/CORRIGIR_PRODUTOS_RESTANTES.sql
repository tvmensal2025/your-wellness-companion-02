-- Script para corrigir os 3 produtos restantes que não foram atualizados
-- Execute este script no Supabase SQL Editor

-- A-Z COMPLEX
UPDATE public.supplements
SET image_url = '/images/produtos/az-complex.png'
WHERE name = 'A-Z COMPLEX';

-- CART CONTROL  
UPDATE public.supplements
SET image_url = '/images/produtos/cart-control.png'
WHERE name = 'CART CONTROL';

-- Vitamina K2 MK7
UPDATE public.supplements
SET image_url = '/images/produtos/vitamina-k2mk7.png'
WHERE name = 'Vitamina K2 MK7';

-- Verificar se as correções foram aplicadas
SELECT 
    name,
    image_url,
    CASE 
        WHEN image_url LIKE '/images/produtos/%' THEN '✅ Atualizado'
        ELSE '❌ Não atualizado'
    END as status
FROM public.supplements 
WHERE name IN ('A-Z COMPLEX', 'CART CONTROL', 'Vitamina K2 MK7')
ORDER BY name;
