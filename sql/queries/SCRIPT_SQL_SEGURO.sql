-- Script seguro para criar/atualizar tabela de suplementos
-- Este script verifica se as colunas existem antes de tentar usá-las

-- 1. Primeiro, vamos verificar se a tabela existe
DO $$ 
BEGIN
    -- Se a tabela não existe, criar
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'supplements') THEN
        CREATE TABLE public.supplements (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            active_ingredients TEXT[],
            recommended_dosage TEXT,
            benefits TEXT[],
            contraindications TEXT[],
            category TEXT,
            brand TEXT,
            is_approved BOOLEAN DEFAULT false,
            image_url TEXT,
            original_price DECIMAL(10,2),
            discount_price DECIMAL(10,2),
            description TEXT,
            stock_quantity INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Habilitar RLS
        ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable read access for all users" ON public.supplements FOR SELECT USING (true);
        
        RAISE NOTICE 'Tabela supplements criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela supplements já existe. Verificando colunas...';
        
        -- Adicionar colunas que podem não existir
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'image_url') THEN
            ALTER TABLE public.supplements ADD COLUMN image_url TEXT;
            RAISE NOTICE 'Coluna image_url adicionada.';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'original_price') THEN
            ALTER TABLE public.supplements ADD COLUMN original_price DECIMAL(10,2);
            RAISE NOTICE 'Coluna original_price adicionada.';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'discount_price') THEN
            ALTER TABLE public.supplements ADD COLUMN discount_price DECIMAL(10,2);
            RAISE NOTICE 'Coluna discount_price adicionada.';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'description') THEN
            ALTER TABLE public.supplements ADD COLUMN description TEXT;
            RAISE NOTICE 'Coluna description adicionada.';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'stock_quantity') THEN
            ALTER TABLE public.supplements ADD COLUMN stock_quantity INTEGER DEFAULT 0;
            RAISE NOTICE 'Coluna stock_quantity adicionada.';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'updated_at') THEN
            ALTER TABLE public.supplements ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Coluna updated_at adicionada.';
        END IF;
        
        -- Habilitar RLS se não estiver habilitado
        IF NOT EXISTS (SELECT FROM pg_class WHERE relname = 'supplements' AND relrowsecurity = true) THEN
            ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
            
            -- Criar política se não existir
            IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'supplements' AND policyname = 'Enable read access for all users') THEN
                CREATE POLICY "Enable read access for all users" ON public.supplements FOR SELECT USING (true);
                RAISE NOTICE 'Política RLS criada.';
            END IF;
        END IF;
    END IF;
END $$;

-- 2. Inserir alguns produtos básicos (apenas se não existirem)
INSERT INTO public.supplements (
    name, 
    active_ingredients, 
    recommended_dosage, 
    benefits, 
    contraindications, 
    category, 
    brand, 
    is_approved,
    original_price,
    discount_price,
    description,
    stock_quantity
) 
SELECT * FROM (VALUES
    ('Whey Protein 80%', ARRAY['Proteína do soro do leite (80%)'], '30g ao dia', ARRAY['Aumento de massa muscular', 'Recuperação pós-treino', 'Saciedade'], ARRAY['Intolerância à lactose'], 'Proteínas', 'Atlântica Natural', true, 179.90, 89.90, 'Proteína de alta qualidade para atletas e praticantes de exercícios físicos', 100),
    ('Creatina Monohidratada', ARRAY['Creatina monohidratada (3g)'], '3-5g ao dia', ARRAY['Aumento de força', 'Ganho de massa muscular', 'Melhora do desempenho'], ARRAY['Problemas renais'], 'Creatina', 'Atlântica Natural', true, 129.90, 64.90, 'Creatina monohidratada para aumento de força e massa muscular', 80),
    ('Multivitamínico', ARRAY['Vitaminas A, C, D, E', 'Complexo B', 'Minerais'], '1 cápsula ao dia', ARRAY['Suporte nutricional', 'Energia', 'Sistema imunológico'], ARRAY['Hipersensibilidade'], 'Vitaminas', 'Atlântica Natural', true, 99.90, 49.90, 'Complexo vitamínico completo para suporte nutricional', 150),
    ('Ômega 3', ARRAY['EPA (180mg)', 'DHA (120mg)'], '2 cápsulas ao dia', ARRAY['Saúde cardiovascular', 'Função cerebral', 'Anti-inflamatório'], ARRAY['Distúrbios hemorrágicos'], 'Ômega 3', 'Atlântica Natural', true, 149.90, 74.90, 'Ômega 3 para saúde cardiovascular e cerebral', 110),
    ('Magnésio', ARRAY['Magnésio (400mg)'], '1-2 cápsulas ao dia', ARRAY['Relaxamento muscular', 'Qualidade do sono', 'Função nervosa'], ARRAY['Insuficiência renal'], 'Minerais', 'Atlântica Natural', true, 89.90, 44.90, 'Magnésio para relaxamento muscular e qualidade do sono', 95),
    ('Vitamina D3', ARRAY['Vitamina D3 (2000 UI)'], '1 cápsula ao dia', ARRAY['Saúde óssea', 'Sistema imunológico', 'Função muscular'], ARRAY['Hipercalcemia'], 'Vitaminas', 'Atlântica Natural', true, 79.90, 39.90, 'Vitamina D3 para saúde óssea e sistema imunológico', 130),
    ('Colágeno', ARRAY['Colágeno hidrolisado (10g)'], '10g ao dia', ARRAY['Saúde articular', 'Pele firme', 'Unhas e cabelos'], ARRAY['Alergia a proteínas'], 'Colágeno', 'Atlântica Natural', true, 119.90, 59.90, 'Colágeno para saúde articular e da pele', 85),
    ('Probióticos', ARRAY['Lactobacillus', 'Bifidobacterium'], '1 cápsula ao dia', ARRAY['Saúde intestinal', 'Sistema imunológico', 'Digestão'], ARRAY['Imunossupressão'], 'Probióticos', 'Atlântica Natural', true, 109.90, 54.90, 'Probióticos para saúde intestinal e digestão', 105),
    ('Ashwagandha', ARRAY['Withania somnifera (600mg)'], '1-2 cápsulas ao dia', ARRAY['Redução do estresse', 'Melhora do sono', 'Função adrenal'], ARRAY['Hipertireoidismo'], 'Adaptógenos', 'Atlântica Natural', true, 139.90, 69.90, 'Ashwagandha para redução do estresse e melhora do sono', 75),
    ('Melatonina', ARRAY['Melatonina (3mg)'], '1 cápsula antes de dormir', ARRAY['Qualidade do sono', 'Ritmo circadiano', 'Relaxamento'], ARRAY['Gravidez'], 'Sono', 'Atlântica Natural', true, 69.90, 34.90, 'Melatonina para qualidade do sono e relaxamento', 120)
) AS new_supplements(
    name, 
    active_ingredients, 
    recommended_dosage, 
    benefits, 
    contraindications, 
    category, 
    brand, 
    is_approved,
    original_price,
    discount_price,
    description,
    stock_quantity
)
WHERE NOT EXISTS (
    SELECT 1 FROM public.supplements s 
    WHERE s.name = new_supplements.name 
    AND s.brand = new_supplements.brand
);

-- 3. Criar tabela user_supplements se não existir
CREATE TABLE IF NOT EXISTS public.user_supplements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplement_id UUID REFERENCES public.supplements(id),
    supplement_name TEXT,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela user_supplements
ALTER TABLE public.user_supplements ENABLE ROW LEVEL SECURITY;

-- Políticas para user_supplements
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_supplements' AND policyname = 'Enable read access for users based on user_id') THEN
        CREATE POLICY "Enable read access for users based on user_id" ON public.user_supplements FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_supplements' AND policyname = 'Enable insert for users based on user_id') THEN
        CREATE POLICY "Enable insert for users based on user_id" ON public.user_supplements FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_supplements' AND policyname = 'Enable update for users based on user_id') THEN
        CREATE POLICY "Enable update for users based on user_id" ON public.user_supplements FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_supplements' AND policyname = 'Enable delete for users based on user_id') THEN
        CREATE POLICY "Enable delete for users based on user_id" ON public.user_supplements FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Criar bucket para imagens (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket de imagens
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public uploads') THEN
        CREATE POLICY "Allow public uploads" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'product-images');
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow public access') THEN
        CREATE POLICY "Allow public access" ON storage.objects
        FOR SELECT USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Mensagem de sucesso
SELECT 'Sistema de suplementos configurado com sucesso! Tabelas criadas/atualizadas e produtos inseridos.' as status;

