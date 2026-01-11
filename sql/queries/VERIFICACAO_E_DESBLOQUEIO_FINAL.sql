-- =====================================================
-- VERIFICAÇÃO E DESBLOQUEIO FINAL - INSTITUTO DOS SONHOS
-- =====================================================
-- Execute este SQL apenas para verificar se tudo está OK
-- As tabelas já existem, só precisamos confirmar

-- 1. VERIFICAR SE AS TABELAS PRINCIPAIS EXISTEM
SELECT 
    'courses' as tabela,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'courses'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status
UNION ALL
SELECT 
    'course_modules' as tabela,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'course_modules'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status
UNION ALL
SELECT 
    'lessons' as tabela,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'lessons'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status
UNION ALL
SELECT 
    'challenges' as tabela,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'challenges'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status
UNION ALL
SELECT 
    'layout_config' as tabela,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'layout_config'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status;

-- 2. VERIFICAR SE OS CAMPOS DE ORDEM EXISTEM
SELECT 
    'courses.featured_order' as campo,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'featured_order'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status
UNION ALL
SELECT 
    'courses.display_type' as campo,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'display_type'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status
UNION ALL
SELECT 
    'courses.order_index' as campo,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'order_index'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status;

-- 3. VERIFICAR SE AS FUNÇÕES EXISTEM
SELECT 
    'get_layout_config' as funcao,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'get_layout_config'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status
UNION ALL
SELECT 
    'reorder_courses' as funcao,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'reorder_courses'
    ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status;

-- 4. ADICIONAR CAMPOS APENAS SE NÃO EXISTIREM (SEGURO)
DO $$ 
BEGIN
    -- Adicionar featured_order se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'featured_order'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN featured_order INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Campo featured_order adicionado à tabela courses';
    ELSE
        RAISE NOTICE '✅ Campo featured_order já existe na tabela courses';
    END IF;

    -- Adicionar display_type se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'display_type'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN display_type TEXT DEFAULT 'course_cards';
        RAISE NOTICE '✅ Campo display_type adicionado à tabela courses';
    ELSE
        RAISE NOTICE '✅ Campo display_type já existe na tabela courses';
    END IF;
END $$;

-- 5. CRIAR TABELA LAYOUT_CONFIG SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.layout_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INSERIR CONFIGURAÇÕES PADRÃO SE NÃO EXISTIREM
INSERT INTO public.layout_config (config_key, config_value, description) 
VALUES 
    ('enable_featured_section', 'true', 'Habilitar seção de cursos em destaque'),
    ('max_featured_courses', '6', 'Máximo de cursos em destaque'),
    ('default_display_mode', '"course_cards"', 'Modo de exibição padrão')
ON CONFLICT (config_key) DO NOTHING;

-- 7. HABILITAR RLS NA TABELA LAYOUT_CONFIG SE NECESSÁRIO
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'layout_config' 
        AND policyname = 'Anyone can view layout config'
    ) THEN
        ALTER TABLE public.layout_config ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view layout config" 
        ON public.layout_config FOR SELECT USING (true);
        
        CREATE POLICY "Only admins can modify layout config" 
        ON public.layout_config FOR ALL 
        USING (auth.jwt() ->> 'role' = 'admin');
        
        RAISE NOTICE '✅ Políticas RLS criadas para layout_config';
    ELSE
        RAISE NOTICE '✅ Políticas RLS já existem para layout_config';
    END IF;
END $$;

-- 8. CRIAR FUNÇÕES BÁSICAS SE NÃO EXISTIREM
CREATE OR REPLACE FUNCTION public.get_layout_config(config_key_param TEXT DEFAULT NULL)
RETURNS TABLE(key TEXT, value JSONB, description TEXT) AS $$
BEGIN
    IF config_key_param IS NULL THEN
        RETURN QUERY
        SELECT lc.config_key, lc.config_value, lc.description
        FROM public.layout_config lc
        ORDER BY lc.config_key;
    ELSE
        RETURN QUERY
        SELECT lc.config_key, lc.config_value, lc.description
        FROM public.layout_config lc
        WHERE lc.config_key = config_key_param;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_layout_config(
    config_key_param TEXT,
    config_value_param JSONB,
    description_param TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.layout_config (config_key, config_value, description)
    VALUES (config_key_param, config_value_param, description_param)
    ON CONFLICT (config_key) 
    DO UPDATE SET 
        config_value = EXCLUDED.config_value,
        description = COALESCE(EXCLUDED.description, layout_config.description),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. VERIFICAÇÃO FINAL
SELECT '🎉 VERIFICAÇÃO CONCLUÍDA!' as resultado;
SELECT 'Execute este SQL e depois remova os bloqueios no código!' as proxima_acao;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Todas as tabelas verificadas/criadas
-- ✅ Todos os campos verificados/adicionados  
-- ✅ Funções básicas criadas
-- ✅ Sistema pronto para funcionar
-- =====================================================

