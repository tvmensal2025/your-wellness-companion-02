-- ==============================================================================
-- ADICIONAR LINKS CIENTÍFICOS AOS PRODUTOS
-- ==============================================================================

BEGIN;

-- 1. Adicionar coluna para links científicos se não existir
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS scientific_studies TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Atualizar produtos com links reais de busca ou artigos do PubMed para seus ativos
-- Usando links de busca qualificados para garantir que o cliente encontre artigos relevantes

-- OZÔNIO
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=ozonized+oil+therapeutic+properties', 'https://pubmed.ncbi.nlm.nih.gov/?term=ozone+therapy+clinical+trials'] 
WHERE external_id = 'OZONIO';

-- SOS UNHAS (Óleo de Girassol Ozonizado)
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=ozonized+sunflower+oil+antifungal'] 
WHERE external_id = 'SOS_UNHAS';

-- COLÁGENO
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=hydrolyzed+collagen+skin+aging', 'https://pubmed.ncbi.nlm.nih.gov/?term=verisol+collagen+skin'] 
WHERE external_id = 'COLAGENO_ACIDO_HIALURONICO';

-- BVB CÁLCIO (Cálcio de Ostra)
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=calcium+supplementation+bone+density'] 
WHERE external_id = 'BVB_CALCIO';

-- LIPO WAY (Termogênicos)
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=thermogenic+supplements+weight+loss', 'https://pubmed.ncbi.nlm.nih.gov/?term=caffeine+metabolism+fat+loss'] 
WHERE external_id = 'LIPOWAY';

-- BVB SB (Fibras e Antioxidantes)
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=dietary+fiber+weight+loss+clinical+trials'] 
WHERE external_id = 'BVB_SB';

-- VITAMINA K2
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+k2+osteoporosis', 'https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+k2+cardiovascular+health'] 
WHERE external_id = 'VITAMINA_K2';

-- VITAMINA C
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+c+immune+system+review'] 
WHERE external_id = 'VITAMINA_C_400MG';

-- BVB COLEST (Cranberry)
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=cranberry+urinary+tract+infection+review'] 
WHERE external_id = 'BVB_COLEST';

-- BVB D3K2
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+d3+k2+synergy'] 
WHERE external_id = 'BVB_D3K2';

-- SD ARTRO (Colágeno Tipo 2 / Articulação)
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=type+ii+collagen+osteoarthritis', 'https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+muscle+cramps'] 
WHERE external_id = 'SD_ARTRO';

-- COLAGENO TIPO II
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=undenatured+type+ii+collagen+joint+health'] 
WHERE external_id = 'COLAGENO_TIPO_II';

-- OLEO DE PRIMULA
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=evening+primrose+oil+menopause', 'https://pubmed.ncbi.nlm.nih.gov/?term=evening+primrose+oil+pms'] 
WHERE external_id = 'OLEO_PRIMULA';

-- LIB WAY (Maca/Tribulus)
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=tribulus+terrestris+sexual+function', 'https://pubmed.ncbi.nlm.nih.gov/?term=maca+root+libido'] 
WHERE external_id = 'LIBWAY';

-- BVB B12
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=methylcobalamin+cognitive+function', 'https://pubmed.ncbi.nlm.nih.gov/?term=vitamin+b12+energy'] 
WHERE external_id = 'BVB_B12';

-- BVB INSU
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=berberine+insulin+resistance', 'https://pubmed.ncbi.nlm.nih.gov/?term=chromium+picolinate+diabetes'] 
WHERE external_id = 'BVB_INSU';

-- OMEGA 3
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=omega+3+cardiovascular+health+review', 'https://pubmed.ncbi.nlm.nih.gov/?term=dha+epa+brain+function'] 
WHERE external_id = 'OMEGA_3_1400MG';

-- BVB ZINCO
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=zinc+immune+system', 'https://pubmed.ncbi.nlm.nih.gov/?term=zinc+supplementation+skin'] 
WHERE external_id = 'BVB_ZINCO_QUELATO';

-- SEREMIX (Triptofano/Melatonina)
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=tryptophan+sleep+quality', 'https://pubmed.ncbi.nlm.nih.gov/?term=melatonin+sleep+disorders'] 
WHERE external_id = 'SEREMIX';

-- BVB MORO
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=moro+orange+extract+weight+management'] 
WHERE external_id = 'BVB_MORO';

-- PROWOMAN
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=phytoestrogens+menopause+symptoms'] 
WHERE external_id = 'PROWOMAN';

-- POLIVITAMIX
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=multivitamin+supplementation+immune+function'] 
WHERE external_id = 'POLIVITAMIX';

-- VISION WAY
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=lutein+zeaxanthin+eye+health'] 
WHERE external_id = 'VISION_WAY';

-- BVB Q10
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=coenzyme+q10+heart+failure', 'https://pubmed.ncbi.nlm.nih.gov/?term=coq10+energy+metabolism'] 
WHERE external_id = 'BVB_Q10';

-- MELATONINA
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=melatonin+insomnia+efficacy'] 
WHERE external_id = 'MELATONINA';

-- CREATINA
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=creatine+supplementation+muscle+strength', 'https://pubmed.ncbi.nlm.nih.gov/?term=creatine+cognitive+function'] 
WHERE external_id = 'CREATINA_Q10';

-- SD FIBRO3 (Magnésio e Cúrcuma)
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+fibromyalgia', 'https://pubmed.ncbi.nlm.nih.gov/?term=curcumin+inflammation+pain'] 
WHERE external_id = 'SD_FIBRO3';

-- SPIRULINA
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=spirulina+antioxidant+effects', 'https://pubmed.ncbi.nlm.nih.gov/?term=spirulina+lipid+profile'] 
WHERE external_id = 'SPIRULINA_VIT_E';

-- FOCUS TDAH
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=nootropics+cognitive+performance', 'https://pubmed.ncbi.nlm.nih.gov/?term=l-theanine+caffeine+focus'] 
WHERE external_id = 'FOCUS_TDAH';

-- PROPOLIS
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=propolis+immune+system', 'https://pubmed.ncbi.nlm.nih.gov/?term=propolis+antiviral+activity'] 
WHERE external_id = 'PROPOLIS_VERDE';

-- PROPOWAY
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=red+propolis+biological+activity'] 
WHERE external_id = 'PROPOWAY_VERMELHA';

-- PROMEN (Licopeno/Semente de Abóbora)
UPDATE public.supplements SET scientific_studies = ARRAY['https://pubmed.ncbi.nlm.nih.gov/?term=lycopene+prostate+cancer+prevention', 'https://pubmed.ncbi.nlm.nih.gov/?term=pumpkin+seed+oil+bph'] 
WHERE external_id = 'PROMEN';

COMMIT;
