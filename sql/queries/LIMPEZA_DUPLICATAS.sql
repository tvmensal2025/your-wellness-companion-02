-- SCRIPT DE LIMPEZA DE DUPLICATAS E PADRONIZAÇÃO
-- Remove produtos que não têm external_id (antigos/manuais) se já existir um oficial com o mesmo nome
-- E garante que só fiquem os produtos oficiais da Nema's Way

BEGIN;

-- 1. Remover produtos duplicados pelo nome, mantendo o mais recente (que tem external_id)
DELETE FROM public.supplements a USING (
      SELECT min(ctid) as ctid, name
        FROM public.supplements 
        GROUP BY name HAVING COUNT(*) > 1
      ) b
      WHERE a.name = b.name 
      AND a.ctid <> b.ctid
      AND (a.external_id IS NULL OR a.updated_at < (SELECT MAX(updated_at) FROM public.supplements s2 WHERE s2.name = a.name));

-- 2. Garantir que todos os produtos restantes sejam da marca correta
UPDATE public.supplements SET brand = 'Nema''s Way' WHERE brand IS DISTINCT FROM 'Nema''s Way';

COMMIT;

