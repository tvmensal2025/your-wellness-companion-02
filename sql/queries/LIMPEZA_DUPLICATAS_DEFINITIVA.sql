-- ==============================================================================
-- LIMPEZA INTELIGENTE DE DUPLICATAS E PRODUTOS INVÁLIDOS (VERSÃO SEGURA)
-- Remove produtos duplicados e mantém apenas os oficiais da Nema's Way
-- Trata dependências em user_supplements antes de deletar
-- ==============================================================================

BEGIN;

-- 1. LISTA DE EXTERNAL_ID VÁLIDOS (OFICIAIS DA NEMA'S WAY)
-- ==============================================================================
CREATE TEMP TABLE IF NOT EXISTS valid_external_ids_list AS
SELECT UNNEST(ARRAY[
  'OZONIO',
  'SOS_UNHAS',
  'COLAGENO_ACIDO_HIALURONICO',
  'BVB_CALCIO',
  'LIPOWAY',
  'BVB_SB',
  'WINNER_OLEO_PERNAS',
  'VITAMINA_K2',
  'FRESH_GLOW_CREME',
  'VITAMINA_C_400MG',
  'FRESH_GLOW_LOCAO',
  'BVB_COLEST',
  'FRESH_GLOW_SABONETE',
  'BVB_D3K2',
  'SD_ARTRO',
  'COLAGENO_TIPO_II',
  'OLEO_PRIMULA',
  'GOLD_MONEY',
  'LIBWAY',
  'BVB_B12',
  'BVB_INSU',
  'VITAMIX_SKIN',
  'ACIDO_HIALURONICO_FITIOS',
  'OMEGA_3_1400MG',
  'VIP_GLAMOUR_KIT',
  'FAIR_WAY',
  'BVB_ZINCO_QUELATO',
  'AMARGO',
  'TOP_SECRETS',
  'PEELING_5X1',
  'SEREMIX',
  'BVB_MORO',
  'PROWOMAN',
  'SERUM_VITAMINA_C',
  'ORGANIC_OZON3_ARGAN',
  'POLIVITAMIX',
  'LIFE_WAY_GEL',
  'VISION_WAY',
  'BVB_Q10',
  'SABONETE_INTIMO_SEDUCAO',
  'TENIS_BIOQUANTICO',
  'MELATONINA',
  'CREATINA_Q10',
  'KIT_ORGANIC_OZON3',
  'SERUM_RETINOL',
  'SD_FIBRO3',
  'SPIRULINA_VIT_E',
  'OLEO_GIRASSOL_OZONIZADO',
  'OLEO_REGENERADOR',
  'GEL_CRIOTERAPICO',
  'FOCUS_TDAH',
  'CAR_BLACK',
  'MADAME_X',
  'MOLECULA_DA_VIDA',
  'MEGA_NUTRI_RX21',
  'OLEO_MASSAGEM_OZONIZADO',
  'PROPOLIS_VERDE',
  'PROPOWAY_VERMELHA',
  'PROMEN',
  'OLEO_HOT'
]) AS valid_id;

-- 2. LIMPAR REFERÊNCIAS EM user_supplements ANTES DE DELETAR PRODUTOS
-- ==============================================================================
-- Remove referências a produtos que serão deletados (produtos inválidos)
DELETE FROM public.user_supplements
WHERE supplement_id IN (
  SELECT id FROM public.supplements
  WHERE external_id IS NULL 
     OR external_id NOT IN (SELECT valid_id FROM valid_external_ids_list)
     OR brand IS DISTINCT FROM 'Nema''s Way'
);

-- 3. REMOVER PRODUTOS QUE NÃO TÊM EXTERNAL_ID OU TÊM ID INVÁLIDO
-- ==============================================================================
-- Agora podemos deletar com segurança, pois as referências já foram removidas
DELETE FROM public.supplements
WHERE external_id IS NULL 
   OR external_id NOT IN (SELECT valid_id FROM valid_external_ids_list)
   OR brand IS DISTINCT FROM 'Nema''s Way';

-- 4. REMOVER DUPLICATAS POR EXTERNAL_ID (MANTÉM O MAIS RECENTE)
-- ==============================================================================
-- Se houver múltiplos produtos com o mesmo external_id, mantém apenas o mais recente
-- Primeiro, atualizar referências em user_supplements para apontar para o produto correto
UPDATE public.user_supplements us
SET supplement_id = (
  SELECT id 
  FROM public.supplements s
  WHERE s.external_id = (
    SELECT external_id 
    FROM public.supplements 
    WHERE id = us.supplement_id
  )
  AND s.external_id IN (SELECT valid_id FROM valid_external_ids_list)
  ORDER BY s.updated_at DESC
  LIMIT 1
)
WHERE us.supplement_id IN (
  SELECT s1.id
  FROM public.supplements s1
  WHERE s1.external_id IN (SELECT valid_id FROM valid_external_ids_list)
  AND EXISTS (
    SELECT 1 
    FROM public.supplements s2
    WHERE s2.external_id = s1.external_id
    AND s2.id != s1.id
    AND s2.updated_at > s1.updated_at
  )
);

-- Agora deletar os duplicados mais antigos
DELETE FROM public.supplements a
USING (
  SELECT 
    external_id,
    MAX(updated_at) as max_updated_at
  FROM public.supplements
  WHERE external_id IN (SELECT valid_id FROM valid_external_ids_list)
  GROUP BY external_id
  HAVING COUNT(*) > 1
) b
WHERE a.external_id = b.external_id
  AND a.updated_at < b.max_updated_at;

-- 5. REMOVER DUPLICATAS POR NOME (MANTÉM O QUE TEM EXTERNAL_ID VÁLIDO)
-- ==============================================================================
-- Se houver múltiplos produtos com o mesmo nome, mantém apenas o que tem external_id válido
-- Primeiro, atualizar referências
UPDATE public.user_supplements us
SET supplement_id = (
  SELECT id 
  FROM public.supplements s
  WHERE s.name = (
    SELECT name 
    FROM public.supplements 
    WHERE id = us.supplement_id
  )
  AND s.external_id IN (SELECT valid_id FROM valid_external_ids_list)
  ORDER BY s.updated_at DESC
  LIMIT 1
)
WHERE us.supplement_id IN (
  SELECT s1.id
  FROM public.supplements s1
  WHERE s1.external_id IN (SELECT valid_id FROM valid_external_ids_list)
  AND EXISTS (
    SELECT 1 
    FROM public.supplements s2
    WHERE s2.name = s1.name
    AND s2.id != s1.id
    AND s2.external_id IN (SELECT valid_id FROM valid_external_ids_list)
  )
);

-- Agora deletar os duplicados
DELETE FROM public.supplements a
USING (
  SELECT 
    name,
    MIN(id) as keep_id
  FROM public.supplements
  WHERE external_id IN (SELECT valid_id FROM valid_external_ids_list)
  GROUP BY name
  HAVING COUNT(*) > 1
) b
WHERE a.name = b.name 
  AND a.id != b.keep_id
  AND a.external_id IN (SELECT valid_id FROM valid_external_ids_list);

-- 6. GARANTIR QUE TODOS OS PRODUTOS RESTANTES TENHAM MARCA CORRETA
-- ==============================================================================
UPDATE public.supplements 
SET brand = 'Nema''s Way'
WHERE brand IS DISTINCT FROM 'Nema''s Way';

-- 7. GARANTIR QUE O DISCONTO ESTÁ CORRETO (50%)
-- ==============================================================================
UPDATE public.supplements
SET discount_price = ROUND(original_price * 0.5, 2)
WHERE original_price IS NOT NULL 
  AND (discount_price IS NULL OR discount_price IS DISTINCT FROM ROUND(original_price * 0.5, 2));

-- 8. GARANTIR QUE TODOS OS PRODUTOS ESTÃO APROVADOS
-- ==============================================================================
UPDATE public.supplements
SET is_approved = true
WHERE external_id IN (SELECT valid_id FROM valid_external_ids_list)
  AND is_approved IS DISTINCT FROM true;

COMMIT;
