-- Script para corrigir completamente o sistema de recomendações
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna score se não existir
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 50;

-- 2. Corrigir os 3 produtos restantes que não foram atualizados
UPDATE public.supplements
SET image_url = '/images/produtos/az-complex.png'
WHERE name = 'A-Z COMPLEX';

UPDATE public.supplements
SET image_url = '/images/produtos/cart-control.png'
WHERE name = 'CART CONTROL';

UPDATE public.supplements
SET image_url = '/images/produtos/vitamina-k2mk7.png'
WHERE name = 'Vitamina K2 MK7';

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
  ELSE 60
END
WHERE score IS NULL OR score = 0;

-- 4. Verificar se todos os produtos têm imagem_url
UPDATE public.supplements 
SET image_url = '/images/produtos/produto-generico.png'
WHERE image_url IS NULL OR image_url = '';

-- 5. Garantir que todos os produtos estão aprovados
UPDATE public.supplements 
SET is_approved = true
WHERE is_approved IS NULL OR is_approved = false;

-- 6. Verificar estrutura da tabela
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as com_imagem,
    COUNT(CASE WHEN score IS NOT NULL THEN 1 END) as com_score,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as aprovados
FROM public.supplements;

-- 7. Verificar alguns produtos específicos
SELECT 
    name,
    category,
    score,
    image_url,
    is_approved,
    CASE 
        WHEN image_url LIKE '/images/produtos/%' THEN '✅ Imagem Local'
        WHEN image_url LIKE 'https://%' THEN '🌐 URL Externa'
        ELSE '❌ Sem Imagem'
    END as status_imagem
FROM public.supplements 
ORDER BY score DESC
LIMIT 10;
