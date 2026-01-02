-- ==============================================================================
-- DIAGNÓSTICO: Por que não há produtos associados aos protocolos?
-- ==============================================================================

-- 1. Verificar se os protocolos existem
SELECT 
  'Protocolos existentes' as tipo,
  COUNT(*) as total
FROM public.supplement_protocols
WHERE is_active = true;

-- 2. Verificar se há produtos cadastrados
SELECT 
  'Produtos cadastrados' as tipo,
  COUNT(*) as total
FROM public.supplements
WHERE is_approved = true;

-- 3. Verificar se há associações
SELECT 
  'Associações existentes' as tipo,
  COUNT(*) as total
FROM public.protocol_supplements;

-- 4. Listar protocolos SEM produtos associados
SELECT 
  sp.id,
  sp.name as protocolo,
  hc.name as condicao,
  'SEM PRODUTOS' as status
FROM public.supplement_protocols sp
LEFT JOIN public.protocol_supplements ps ON ps.protocol_id = sp.id
JOIN public.health_conditions hc ON hc.id = sp.health_condition_id
WHERE ps.id IS NULL
  AND sp.is_active = true
ORDER BY hc.name, sp.name;

-- 5. Verificar se o arquivo PROTOCOLOS_COMPLETOS_CATALOGO.sql foi executado
-- Se este resultado mostrar 0 associações, você precisa executar:
-- PROTOCOLOS_COMPLETOS_CATALOGO.sql

SELECT 
  '⚠️ AÇÃO NECESSÁRIA' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.protocol_supplements) = 0 
    THEN 'Execute o arquivo: PROTOCOLOS_COMPLETOS_CATALOGO.sql'
    ELSE 'Produtos já associados ✅'
  END as acao
;

