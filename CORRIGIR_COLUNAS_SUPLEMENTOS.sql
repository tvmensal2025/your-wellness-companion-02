-- Script para corrigir colunas faltantes na tabela supplements
-- Este script adiciona as colunas que estão faltando

-- Verificar se a tabela supplements existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'supplements') THEN
        -- Criar tabela supplements se não existir
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
        
        -- Criar política RLS
        CREATE POLICY "Enable read access for all users" ON public.supplements FOR SELECT USING (true);
        
        RAISE NOTICE 'Tabela supplements criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela supplements já existe';
    END IF;
END $$;

-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
    -- Adicionar original_price se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'original_price') THEN
        ALTER TABLE public.supplements ADD COLUMN original_price DECIMAL(10,2);
        RAISE NOTICE 'Coluna original_price adicionada';
    ELSE
        RAISE NOTICE 'Coluna original_price já existe';
    END IF;

    -- Adicionar discount_price se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'discount_price') THEN
        ALTER TABLE public.supplements ADD COLUMN discount_price DECIMAL(10,2);
        RAISE NOTICE 'Coluna discount_price adicionada';
    ELSE
        RAISE NOTICE 'Coluna discount_price já existe';
    END IF;

    -- Adicionar description se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'description') THEN
        ALTER TABLE public.supplements ADD COLUMN description TEXT;
        RAISE NOTICE 'Coluna description adicionada';
    ELSE
        RAISE NOTICE 'Coluna description já existe';
    END IF;

    -- Adicionar stock_quantity se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'stock_quantity') THEN
        ALTER TABLE public.supplements ADD COLUMN stock_quantity INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna stock_quantity adicionada';
    ELSE
        RAISE NOTICE 'Coluna stock_quantity já existe';
    END IF;

    -- Adicionar image_url se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'image_url') THEN
        ALTER TABLE public.supplements ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Coluna image_url adicionada';
    ELSE
        RAISE NOTICE 'Coluna image_url já existe';
    END IF;

    -- Adicionar updated_at se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'updated_at') THEN
        ALTER TABLE public.supplements ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna updated_at adicionada';
    ELSE
        RAISE NOTICE 'Coluna updated_at já existe';
    END IF;
END $$;

-- Inserir dados de exemplo se a tabela estiver vazia
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM public.supplements) = 0 THEN
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
        ) VALUES
        ('Whey Protein 80%', ARRAY['Proteína do soro do leite (80%)'], '30g ao dia', ARRAY['Aumento de massa muscular', 'Recuperação pós-treino', 'Saciedade'], ARRAY['Intolerância à lactose'], 'Proteínas', 'Atlântica Natural', true, 179.90, 89.90, 'Proteína de alta qualidade para atletas e praticantes de exercícios físicos', 100),
        ('Creatina Monohidratada', ARRAY['Creatina monohidratada (3g)'], '3-5g ao dia', ARRAY['Aumento de força', 'Ganho de massa muscular', 'Melhora do desempenho'], ARRAY['Problemas renais'], 'Creatina', 'Atlântica Natural', true, 89.90, 44.90, 'Creatina monohidratada de alta qualidade para aumento de força e massa muscular', 150),
        ('BCAA 2:1:1', ARRAY['L-Leucina (2g)', 'L-Isoleucina (1g)', 'L-Valina (1g)'], '5-10g ao dia', ARRAY['Recuperação muscular', 'Redução da fadiga', 'Preservação da massa muscular'], ARRAY['Alergia a aminoácidos'], 'Aminoácidos', 'Atlântica Natural', true, 79.90, 39.90, 'Aminoácidos essenciais em proporção ideal para recuperação muscular', 200),
        ('Multivitamínico', ARRAY['Vitaminas A, C, D, E', 'Complexo B', 'Minerais'], '1 cápsula ao dia', ARRAY['Suporte nutricional', 'Energia', 'Sistema imunológico'], ARRAY['Hipersensibilidade'], 'Vitaminas', 'Atlântica Natural', true, 59.90, 29.90, 'Complexo vitamínico completo para suporte nutricional diário', 300),
        ('Ômega 3', ARRAY['EPA (180mg)', 'DHA (120mg)'], '2 cápsulas ao dia', ARRAY['Saúde cardiovascular', 'Função cerebral', 'Anti-inflamatório'], ARRAY['Distúrbios hemorrágicos'], 'Ômega 3', 'Atlântica Natural', true, 69.90, 34.90, 'Óleo de peixe rico em EPA e DHA para saúde cardiovascular', 250);
        
        RAISE NOTICE 'Dados de exemplo inseridos com sucesso';
    ELSE
        RAISE NOTICE 'Tabela já possui dados';
    END IF;
END $$;

-- Verificar estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'supplements' 
ORDER BY ordinal_position;

-- Verificar dados inseridos
SELECT name, original_price, discount_price, stock_quantity FROM public.supplements LIMIT 5;

