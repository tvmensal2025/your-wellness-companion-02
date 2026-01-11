-- Atualizar tabela de suplementos com novos campos
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar produtos existentes com preços e descrições
UPDATE public.supplements SET 
    original_price = 179.90,
    discount_price = 89.90,
    description = 'Proteína de alta qualidade para atletas e praticantes de exercícios físicos',
    stock_quantity = 100
WHERE name = 'Whey Protein 80%';

UPDATE public.supplements SET 
    original_price = 129.90,
    discount_price = 64.90,
    description = 'Creatina monohidratada para aumento de força e massa muscular',
    stock_quantity = 80
WHERE name = 'Creatina Monohidratada';

UPDATE public.supplements SET 
    original_price = 99.90,
    discount_price = 49.90,
    description = 'Aminoácidos essenciais para recuperação muscular',
    stock_quantity = 120
WHERE name = 'BCAA 2:1:1';

UPDATE public.supplements SET 
    original_price = 89.90,
    discount_price = 44.90,
    description = 'Glutamina para recuperação e sistema imunológico',
    stock_quantity = 90
WHERE name = 'Glutamina';

UPDATE public.supplements SET 
    original_price = 99.90,
    discount_price = 49.90,
    description = 'Complexo vitamínico completo para suporte nutricional',
    stock_quantity = 150
WHERE name = 'Multivitamínico';

UPDATE public.supplements SET 
    original_price = 149.90,
    discount_price = 74.90,
    description = 'Ômega 3 para saúde cardiovascular e cerebral',
    stock_quantity = 110
WHERE name = 'Ômega 3';

UPDATE public.supplements SET 
    original_price = 89.90,
    discount_price = 44.90,
    description = 'Magnésio para relaxamento muscular e qualidade do sono',
    stock_quantity = 95
WHERE name = 'Magnésio';

UPDATE public.supplements SET 
    original_price = 79.90,
    discount_price = 39.90,
    description = 'Vitamina D3 para saúde óssea e sistema imunológico',
    stock_quantity = 130
WHERE name = 'Vitamina D3';

UPDATE public.supplements SET 
    original_price = 119.90,
    discount_price = 59.90,
    description = 'Colágeno para saúde articular e da pele',
    stock_quantity = 85
WHERE name = 'Colágeno';

UPDATE public.supplements SET 
    original_price = 109.90,
    discount_price = 54.90,
    description = 'Probióticos para saúde intestinal e digestão',
    stock_quantity = 105
WHERE name = 'Probióticos';

-- Criar bucket para imagens de produtos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de imagens
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

