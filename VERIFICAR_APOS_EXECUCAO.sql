-- ==============================================================================
-- VERIFICAÇÃO APÓS EXECUTAR PROTOCOLOS_COMPLETOS_CATALOGO.sql
-- Execute este script para confirmar que tudo está funcionando
-- ==============================================================================

-- 1. Resumo geral
SELECT 
  '✅ VERIFICAÇÃO COMPLETA' as status,
  (SELECT COUNT(*) FROM public.health_conditions WHERE category = 'nutrição') as total_condicoes_nutricao,
  (SELECT COUNT(*) FROM public.supplement_protocols WHERE is_active = true) as total_protocolos_ativos,
  (SELECT COUNT(*) FROM public.protocol_supplements) as total_associacoes_produtos,
  (SELECT COUNT(DISTINCT protocol_id) FROM public.protocol_supplements) as protocolos_com_produtos;

-- 2. Protocolos com produtos associados
SELECT 
  sp.name as protocolo,
  hc.name as condicao,
  COUNT(ps.id) as total_produtos,
  STRING_AGG(s.name, ', ' ORDER BY ps.display_order) as produtos
FROM public.supplement_protocols sp
JOIN public.health_conditions hc ON hc.id = sp.health_condition_id
LEFT JOIN public.protocol_supplements ps ON ps.protocol_id = sp.id
LEFT JOIN public.supplements s ON s.id = ps.supplement_id
WHERE hc.category = 'nutrição'
  AND sp.is_active = true
GROUP BY sp.id, sp.name, hc.name
HAVING COUNT(ps.id) > 0
ORDER BY hc.name, sp.name;

-- 3. Detalhes de um protocolo (exemplo: Ansiedade)
SELECT 
  sp.name as protocolo,
  s.name as produto,
  ut.name as horario,
  ps.dosage as dosagem,
  ps.notes as observacoes
FROM public.supplement_protocols sp
JOIN public.health_conditions hc ON hc.id = sp.health_condition_id
JOIN public.protocol_supplements ps ON ps.protocol_id = sp.id
JOIN public.supplements s ON s.id = ps.supplement_id
JOIN public.usage_times ut ON ut.id = ps.usage_time_id
WHERE hc.name = 'Ansiedade'
  AND sp.is_active = true
ORDER BY ps.display_order;

-- 4. Estatísticas por protocolo
SELECT 
  hc.name as condicao,
  COUNT(DISTINCT sp.id) as total_protocolos,
  COUNT(ps.id) as total_produtos_associados,
  COUNT(DISTINCT ps.supplement_id) as produtos_unicos
FROM public.health_conditions hc
LEFT JOIN public.supplement_protocols sp ON sp.health_condition_id = hc.id AND sp.is_active = true
LEFT JOIN public.protocol_supplements ps ON ps.protocol_id = sp.id
WHERE hc.category = 'nutrição'
GROUP BY hc.id, hc.name
ORDER BY total_produtos_associados DESC, hc.name;

