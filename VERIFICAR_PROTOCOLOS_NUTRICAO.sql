-- ==============================================================================
-- SCRIPT DE VERIFICAÇÃO - PROTOCOLOS DE NUTRIÇÃO
-- Execute este script para verificar se tudo está 100% configurado
-- ==============================================================================

-- 1. Verificar se a coluna category existe
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'health_conditions' 
  AND column_name = 'category';

-- 2. Verificar quantas condições têm categoria 'nutrição'
SELECT 
  COUNT(*) as total_condicoes,
  COUNT(CASE WHEN category = 'nutrição' THEN 1 END) as condicoes_nutricao,
  COUNT(CASE WHEN category IS NULL THEN 1 END) as sem_categoria
FROM public.health_conditions;

-- 3. Listar todas as condições e suas categorias
SELECT 
  name as condicao,
  category as categoria,
  is_active as ativo
FROM public.health_conditions 
ORDER BY category, name;

-- 4. Verificar protocolos de nutrição
SELECT 
  sp.name as protocolo,
  hc.name as condicao,
  hc.category as categoria,
  COUNT(ps.id) as total_produtos
FROM public.supplement_protocols sp
JOIN public.health_conditions hc ON hc.id = sp.health_condition_id
LEFT JOIN public.protocol_supplements ps ON ps.protocol_id = sp.id
WHERE hc.category = 'nutrição'
  AND sp.is_active = true
GROUP BY sp.id, sp.name, hc.name, hc.category
ORDER BY hc.name, sp.name;

-- 5. Verificar se há protocolos sem categoria de nutrição
SELECT 
  sp.name as protocolo,
  hc.name as condicao,
  hc.category as categoria
FROM public.supplement_protocols sp
JOIN public.health_conditions hc ON hc.id = sp.health_condition_id
WHERE hc.category != 'nutrição' OR hc.category IS NULL
ORDER BY hc.category, hc.name;

-- 6. Resumo final
SELECT 
  '✅ VERIFICAÇÃO COMPLETA' as status,
  (SELECT COUNT(*) FROM public.health_conditions WHERE category = 'nutrição') as total_nutricao,
  (SELECT COUNT(*) FROM public.supplement_protocols WHERE is_active = true) as total_protocolos_ativos,
  (SELECT COUNT(*) FROM public.protocol_supplements) as total_associacoes_produtos;

