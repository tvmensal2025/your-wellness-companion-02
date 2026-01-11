-- Script para corrigir scores dos suplementos e garantir que as recomendações funcionem
-- Execute este script no Supabase SQL Editor

-- 1. Garantir que a coluna score existe
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 50;

-- 2. Atualizar scores baseado em categorias e nomes dos produtos
UPDATE public.supplements 
SET score = CASE 
  -- Proteínas - alta pontuação
  WHEN name ILIKE '%whey%' OR name ILIKE '%proteína%' OR name ILIKE '%protein%' THEN 85
  WHEN name ILIKE '%creatina%' OR name ILIKE '%creatine%' THEN 80
  WHEN name ILIKE '%bcaa%' OR name ILIKE '%aminoácido%' THEN 75
  
  -- Vitaminas essenciais - alta pontuação
  WHEN name ILIKE '%vitamina d%' OR name ILIKE '%vitamin d%' THEN 88
  WHEN name ILIKE '%vitamina b%' OR name ILIKE '%vitamin b%' THEN 82
  WHEN name ILIKE '%vitamina c%' OR name ILIKE '%vitamin c%' THEN 80
  WHEN name ILIKE '%multivitamínico%' OR name ILIKE '%multivitamin%' THEN 85
  
  -- Minerais importantes
  WHEN name ILIKE '%magnésio%' OR name ILIKE '%magnesium%' THEN 78
  WHEN name ILIKE '%zinco%' OR name ILIKE '%zinc%' THEN 75
  WHEN name ILIKE '%ferro%' OR name ILIKE '%iron%' THEN 70
  
  -- Ômega 3 e ácidos graxos
  WHEN name ILIKE '%ômega%' OR name ILIKE '%omega%' THEN 82
  WHEN name ILIKE '%óleo%' OR name ILIKE '%oil%' THEN 75
  
  -- Probióticos e digestivos
  WHEN name ILIKE '%probiótico%' OR name ILIKE '%probiotic%' THEN 85
  WHEN name ILIKE '%enzima%' OR name ILIKE '%enzyme%' THEN 70
  
  -- Adaptógenos e fitoterápicos
  WHEN name ILIKE '%ashwagandha%' THEN 80
  WHEN name ILIKE '%ginkgo%' THEN 75
  WHEN name ILIKE '%ginseng%' THEN 78
  WHEN name ILIKE '%rhodiola%' THEN 76
  
  -- Sono e relaxamento
  WHEN name ILIKE '%melatonina%' OR name ILIKE '%melatonin%' THEN 85
  WHEN name ILIKE '%gaba%' THEN 75
  WHEN name ILIKE '%triptofano%' OR name ILIKE '%tryptophan%' THEN 78
  
  -- Colágeno e beleza
  WHEN name ILIKE '%colágeno%' OR name ILIKE '%collagen%' THEN 80
  WHEN name ILIKE '%biotina%' OR name ILIKE '%biotin%' THEN 70
  
  -- Antioxidantes
  WHEN name ILIKE '%resveratrol%' THEN 75
  WHEN name ILIKE '%coenzima%' OR name ILIKE '%coenzyme%' THEN 78
  WHEN name ILIKE '%astaxantina%' OR name ILIKE '%astaxanthin%' THEN 76
  
  -- Termogênicos
  WHEN name ILIKE '%café verde%' OR name ILIKE '%green coffee%' THEN 70
  WHEN name ILIKE '%chá verde%' OR name ILIKE '%green tea%' THEN 72
  WHEN name ILIKE '%guaraná%' OR name ILIKE '%guarana%' THEN 68
  
  -- Produtos específicos da Atlântica Natural
  WHEN name ILIKE '%a-z complex%' THEN 85
  WHEN name ILIKE '%cart control%' THEN 80
  WHEN name ILIKE '%chlorella%' THEN 78
  WHEN name ILIKE '%espirulina%' OR name ILIKE '%spirulina%' THEN 82
  WHEN name ILIKE '%fibras%' OR name ILIKE '%fiber%' THEN 70
  WHEN name ILIKE '%focuss%' THEN 75
  WHEN name ILIKE '%geleia real%' THEN 80
  WHEN name ILIKE '%imuni%' THEN 85
  WHEN name ILIKE '%life control%' THEN 78
  WHEN name ILIKE '%maca%' THEN 75
  WHEN name ILIKE '%natuoz%' THEN 70
  WHEN name ILIKE '%natural%' THEN 72
  WHEN name ILIKE '%night%' THEN 75
  WHEN name ILIKE '%shake%' THEN 80
  WHEN name ILIKE '%slim%' THEN 68
  WHEN name ILIKE '%thermo%' THEN 70
  WHEN name ILIKE '%vitamina a%' THEN 75
  WHEN name ILIKE '%vitamina k%' THEN 78
  WHEN name ILIKE '%zma%' THEN 80
  
  -- Score padrão para outros produtos
  ELSE 60
END
WHERE score IS NULL OR score = 0;

-- 3. Garantir que todos os produtos estão aprovados
UPDATE public.supplements 
SET is_approved = true
WHERE is_approved IS NULL OR is_approved = false;

-- 4. Verificar resultado final
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN score > 0 THEN 1 END) as com_score,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as aprovados,
    AVG(score) as score_medio,
    MIN(score) as score_minimo,
    MAX(score) as score_maximo
FROM public.supplements;

-- 5. Mostrar produtos com maiores scores
SELECT 
    name,
    category,
    score,
    image_url,
    CASE 
        WHEN score >= 80 THEN '🔥 Alta Prioridade'
        WHEN score >= 60 THEN '⭐ Média Prioridade'
        ELSE '📋 Baixa Prioridade'
    END as prioridade
FROM public.supplements 
ORDER BY score DESC
LIMIT 20;

-- 6. Verificar se há produtos sem score
SELECT 
    COUNT(*) as produtos_sem_score
FROM public.supplements 
WHERE score IS NULL OR score = 0;
