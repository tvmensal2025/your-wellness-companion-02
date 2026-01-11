-- Script para atualizar preços dos suplementos existentes
-- Este script atualiza os preços dos suplementos que já estão na tabela

-- Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'supplements' 
ORDER BY ordinal_position;

-- Atualizar preços dos suplementos existentes
UPDATE public.supplements 
SET 
    original_price = CASE 
        WHEN name = 'Whey Protein 80%' THEN 179.90
        WHEN name = 'Creatina Monohidratada' THEN 89.90
        WHEN name = 'BCAA 2:1:1' THEN 79.90
        WHEN name = 'Glutamina' THEN 69.90
        WHEN name = 'Multivitamínico' THEN 59.90
        WHEN name = 'Ômega 3' THEN 69.90
        WHEN name = 'Magnésio' THEN 49.90
        WHEN name = 'Zinco' THEN 39.90
        WHEN name = 'Vitamina D3' THEN 45.90
        WHEN name = 'Vitamina B12' THEN 35.90
        WHEN name = 'Ferro' THEN 29.90
        WHEN name = 'Cálcio' THEN 39.90
        WHEN name = 'Colágeno' THEN 89.90
        WHEN name = 'Probióticos' THEN 79.90
        WHEN name = 'Coenzima Q10' THEN 99.90
        WHEN name = 'Curcumina' THEN 69.90
        WHEN name = 'Resveratrol' THEN 119.90
        WHEN name = 'Ashwagandha' THEN 89.90
        WHEN name = 'Rhodiola' THEN 79.90
        WHEN name = 'Melatonina' THEN 49.90
        WHEN name = 'L-Tirosina' THEN 59.90
        WHEN name = '5-HTP' THEN 69.90
        WHEN name = 'Ginkgo Biloba' THEN 59.90
        WHEN name = 'Ginseng' THEN 79.90
        WHEN name = 'Cordyceps' THEN 99.90
        WHEN name = 'Reishi' THEN 89.90
        WHEN name = 'Chlorella' THEN 69.90
        WHEN name = 'Spirulina' THEN 59.90
        WHEN name = 'Cúrcuma' THEN 49.90
        WHEN name = 'Gengibre' THEN 39.90
        WHEN name = 'Canela' THEN 29.90
        WHEN name = 'Pimenta Preta' THEN 19.90
        WHEN name = 'Alho' THEN 39.90
        WHEN name = 'Echinacea' THEN 59.90
        WHEN name = 'Equinácea' THEN 59.90
        WHEN name = 'Própolis' THEN 69.90
        WHEN name = 'Geleia Real' THEN 89.90
        WHEN name = 'Pólen' THEN 79.90
        WHEN name = 'Maca Peruana' THEN 69.90
        WHEN name = 'Tribulus' THEN 59.90
        WHEN name = 'Saw Palmetto' THEN 79.90
        WHEN name = 'Dong Quai' THEN 69.90
        WHEN name = 'Vitex' THEN 59.90
        WHEN name = 'Chasteberry' THEN 59.90
        WHEN name = 'Black Cohosh' THEN 69.90
        WHEN name = 'Red Clover' THEN 59.90
        WHEN name = 'Soy Isoflavones' THEN 49.90
        WHEN name = 'Flaxseed Oil' THEN 39.90
        WHEN name = 'Evening Primrose' THEN 59.90
        WHEN name = 'Borage Oil' THEN 69.90
        WHEN name = 'Coconut Oil' THEN 29.90
        WHEN name = 'MCT Oil' THEN 49.90
        WHEN name = 'CLA' THEN 79.90
        WHEN name = 'L-Carnitine' THEN 69.90
        WHEN name = 'Garcinia Cambogia' THEN 59.90
        WHEN name = 'Green Tea Extract' THEN 49.90
        WHEN name = 'Raspberry Ketones' THEN 89.90
        WHEN name = 'Forskolin' THEN 79.90
        WHEN name = 'Yohimbe' THEN 69.90
        WHEN name = 'Beta-Alanine' THEN 59.90
        WHEN name = 'Citrulline Malate' THEN 69.90
        WHEN name = 'Arginina' THEN 49.90
        WHEN name = 'Taurina' THEN 39.90
        WHEN name = 'HMB' THEN 89.90
        ELSE 50.00
    END,
    discount_price = CASE 
        WHEN name = 'Whey Protein 80%' THEN 89.90
        WHEN name = 'Creatina Monohidratada' THEN 44.90
        WHEN name = 'BCAA 2:1:1' THEN 39.90
        WHEN name = 'Glutamina' THEN 34.90
        WHEN name = 'Multivitamínico' THEN 29.90
        WHEN name = 'Ômega 3' THEN 34.90
        WHEN name = 'Magnésio' THEN 24.90
        WHEN name = 'Zinco' THEN 19.90
        WHEN name = 'Vitamina D3' THEN 22.90
        WHEN name = 'Vitamina B12' THEN 17.90
        WHEN name = 'Ferro' THEN 14.90
        WHEN name = 'Cálcio' THEN 19.90
        WHEN name = 'Colágeno' THEN 44.90
        WHEN name = 'Probióticos' THEN 39.90
        WHEN name = 'Coenzima Q10' THEN 49.90
        WHEN name = 'Curcumina' THEN 34.90
        WHEN name = 'Resveratrol' THEN 59.90
        WHEN name = 'Ashwagandha' THEN 44.90
        WHEN name = 'Rhodiola' THEN 39.90
        WHEN name = 'Melatonina' THEN 24.90
        WHEN name = 'L-Tirosina' THEN 29.90
        WHEN name = '5-HTP' THEN 34.90
        WHEN name = 'Ginkgo Biloba' THEN 29.90
        WHEN name = 'Ginseng' THEN 39.90
        WHEN name = 'Cordyceps' THEN 49.90
        WHEN name = 'Reishi' THEN 44.90
        WHEN name = 'Chlorella' THEN 34.90
        WHEN name = 'Spirulina' THEN 29.90
        WHEN name = 'Cúrcuma' THEN 24.90
        WHEN name = 'Gengibre' THEN 19.90
        WHEN name = 'Canela' THEN 14.90
        WHEN name = 'Pimenta Preta' THEN 9.90
        WHEN name = 'Alho' THEN 19.90
        WHEN name = 'Echinacea' THEN 29.90
        WHEN name = 'Equinácea' THEN 29.90
        WHEN name = 'Própolis' THEN 34.90
        WHEN name = 'Geleia Real' THEN 44.90
        WHEN name = 'Pólen' THEN 39.90
        WHEN name = 'Maca Peruana' THEN 34.90
        WHEN name = 'Tribulus' THEN 29.90
        WHEN name = 'Saw Palmetto' THEN 39.90
        WHEN name = 'Dong Quai' THEN 34.90
        WHEN name = 'Vitex' THEN 29.90
        WHEN name = 'Chasteberry' THEN 29.90
        WHEN name = 'Black Cohosh' THEN 34.90
        WHEN name = 'Red Clover' THEN 29.90
        WHEN name = 'Soy Isoflavones' THEN 24.90
        WHEN name = 'Flaxseed Oil' THEN 19.90
        WHEN name = 'Evening Primrose' THEN 29.90
        WHEN name = 'Borage Oil' THEN 34.90
        WHEN name = 'Coconut Oil' THEN 14.90
        WHEN name = 'MCT Oil' THEN 24.90
        WHEN name = 'CLA' THEN 39.90
        WHEN name = 'L-Carnitine' THEN 34.90
        WHEN name = 'Garcinia Cambogia' THEN 29.90
        WHEN name = 'Green Tea Extract' THEN 24.90
        WHEN name = 'Raspberry Ketones' THEN 44.90
        WHEN name = 'Forskolin' THEN 39.90
        WHEN name = 'Yohimbe' THEN 34.90
        WHEN name = 'Beta-Alanine' THEN 29.90
        WHEN name = 'Citrulline Malate' THEN 34.90
        WHEN name = 'Arginina' THEN 24.90
        WHEN name = 'Taurina' THEN 19.90
        WHEN name = 'HMB' THEN 44.90
        ELSE 25.00
    END,
    stock_quantity = CASE 
        WHEN name = 'Whey Protein 80%' THEN 100
        WHEN name = 'Creatina Monohidratada' THEN 150
        WHEN name = 'BCAA 2:1:1' THEN 200
        WHEN name = 'Glutamina' THEN 180
        WHEN name = 'Multivitamínico' THEN 300
        WHEN name = 'Ômega 3' THEN 250
        WHEN name = 'Magnésio' THEN 220
        WHEN name = 'Zinco' THEN 190
        WHEN name = 'Vitamina D3' THEN 280
        WHEN name = 'Vitamina B12' THEN 210
        WHEN name = 'Ferro' THEN 160
        WHEN name = 'Cálcio' THEN 240
        WHEN name = 'Colágeno' THEN 120
        WHEN name = 'Probióticos' THEN 170
        WHEN name = 'Coenzima Q10' THEN 130
        WHEN name = 'Curcumina' THEN 200
        WHEN name = 'Resveratrol' THEN 90
        WHEN name = 'Ashwagandha' THEN 140
        WHEN name = 'Rhodiola' THEN 110
        WHEN name = 'Melatonina' THEN 180
        WHEN name = 'L-Tirosina' THEN 160
        WHEN name = '5-HTP' THEN 150
        WHEN name = 'Ginkgo Biloba' THEN 170
        WHEN name = 'Ginseng' THEN 130
        WHEN name = 'Cordyceps' THEN 100
        WHEN name = 'Reishi' THEN 120
        WHEN name = 'Chlorella' THEN 190
        WHEN name = 'Spirulina' THEN 210
        WHEN name = 'Cúrcuma' THEN 230
        WHEN name = 'Gengibre' THEN 250
        WHEN name = 'Canela' THEN 270
        WHEN name = 'Pimenta Preta' THEN 290
        WHEN name = 'Alho' THEN 240
        WHEN name = 'Echinacea' THEN 180
        WHEN name = 'Equinácea' THEN 190
        WHEN name = 'Própolis' THEN 160
        WHEN name = 'Geleia Real' THEN 140
        WHEN name = 'Pólen' THEN 150
        WHEN name = 'Maca Peruana' THEN 170
        WHEN name = 'Tribulus' THEN 130
        WHEN name = 'Saw Palmetto' THEN 120
        WHEN name = 'Dong Quai' THEN 110
        WHEN name = 'Vitex' THEN 100
        WHEN name = 'Chasteberry' THEN 90
        WHEN name = 'Black Cohosh' THEN 80
        WHEN name = 'Red Clover' THEN 70
        WHEN name = 'Soy Isoflavones' THEN 200
        WHEN name = 'Flaxseed Oil' THEN 180
        WHEN name = 'Evening Primrose' THEN 160
        WHEN name = 'Borage Oil' THEN 140
        WHEN name = 'Coconut Oil' THEN 220
        WHEN name = 'MCT Oil' THEN 200
        WHEN name = 'CLA' THEN 150
        WHEN name = 'L-Carnitine' THEN 170
        WHEN name = 'Garcinia Cambogia' THEN 160
        WHEN name = 'Green Tea Extract' THEN 190
        WHEN name = 'Raspberry Ketones' THEN 120
        WHEN name = 'Forskolin' THEN 110
        WHEN name = 'Yohimbe' THEN 100
        WHEN name = 'Beta-Alanine' THEN 180
        WHEN name = 'Citrulline Malate' THEN 170
        WHEN name = 'Arginina' THEN 160
        WHEN name = 'Taurina' THEN 150
        WHEN name = 'HMB' THEN 130
        ELSE 100
    END,
    description = CASE 
        WHEN name = 'Whey Protein 80%' THEN 'Proteína de alta qualidade para atletas e praticantes de exercícios físicos'
        WHEN name = 'Creatina Monohidratada' THEN 'Creatina monohidratada de alta qualidade para aumento de força e massa muscular'
        WHEN name = 'BCAA 2:1:1' THEN 'Aminoácidos essenciais em proporção ideal para recuperação muscular'
        WHEN name = 'Glutamina' THEN 'Aminoácido essencial para recuperação muscular e sistema imunológico'
        WHEN name = 'Multivitamínico' THEN 'Complexo vitamínico completo para suporte nutricional diário'
        WHEN name = 'Ômega 3' THEN 'Óleo de peixe rico em EPA e DHA para saúde cardiovascular'
        WHEN name = 'Magnésio' THEN 'Mineral essencial para relaxamento muscular e qualidade do sono'
        WHEN name = 'Zinco' THEN 'Mineral importante para sistema imunológico e síntese proteica'
        WHEN name = 'Vitamina D3' THEN 'Vitamina essencial para saúde óssea e sistema imunológico'
        WHEN name = 'Vitamina B12' THEN 'Vitamina importante para energia e função neurológica'
        WHEN name = 'Ferro' THEN 'Mineral essencial para transporte de oxigênio e prevenção de anemia'
        WHEN name = 'Cálcio' THEN 'Mineral fundamental para saúde óssea e função muscular'
        WHEN name = 'Colágeno' THEN 'Proteína estrutural para saúde articular e da pele'
        WHEN name = 'Probióticos' THEN 'Bactérias benéficas para saúde intestinal e sistema imunológico'
        WHEN name = 'Coenzima Q10' THEN 'Antioxidante importante para energia celular e saúde cardiovascular'
        WHEN name = 'Curcumina' THEN 'Composto ativo da cúrcuma com propriedades anti-inflamatórias'
        WHEN name = 'Resveratrol' THEN 'Antioxidante potente com benefícios para longevidade'
        WHEN name = 'Ashwagandha' THEN 'Adaptógeno para redução do estresse e melhora do sono'
        WHEN name = 'Rhodiola' THEN 'Adaptógeno para energia e resistência ao estresse'
        WHEN name = 'Melatonina' THEN 'Hormônio natural para regulação do sono'
        WHEN name = 'L-Tirosina' THEN 'Aminoácido para foco, concentração e energia mental'
        WHEN name = '5-HTP' THEN 'Precursor da serotonina para bem-estar e qualidade do sono'
        WHEN name = 'Ginkgo Biloba' THEN 'Extrato para melhora da circulação cerebral e memória'
        WHEN name = 'Ginseng' THEN 'Adaptógeno para energia, resistência e função cognitiva'
        WHEN name = 'Cordyceps' THEN 'Cogumelo medicinal para energia e resistência física'
        WHEN name = 'Reishi' THEN 'Cogumelo medicinal para sistema imunológico e relaxamento'
        WHEN name = 'Chlorella' THEN 'Alga rica em clorofila para desintoxicação e nutrientes'
        WHEN name = 'Spirulina' THEN 'Alga rica em proteína completa e ferro'
        WHEN name = 'Cúrcuma' THEN 'Especiaria com propriedades anti-inflamatórias'
        WHEN name = 'Gengibre' THEN 'Raiz com propriedades digestivas e anti-inflamatórias'
        WHEN name = 'Canela' THEN 'Especiaria para controle glicêmico e antioxidante'
        WHEN name = 'Pimenta Preta' THEN 'Especiaria para absorção de nutrientes e metabolismo'
        WHEN name = 'Alho' THEN 'Bulbo com propriedades imunológicas e cardiovasculares'
        WHEN name = 'Echinacea' THEN 'Planta medicinal para sistema imunológico'
        WHEN name = 'Equinácea' THEN 'Planta medicinal para prevenção de infecções'
        WHEN name = 'Própolis' THEN 'Produto das abelhas com propriedades imunológicas'
        WHEN name = 'Geleia Real' THEN 'Produto das abelhas para energia e vitalidade'
        WHEN name = 'Pólen' THEN 'Produto das abelhas rico em nutrientes essenciais'
        WHEN name = 'Maca Peruana' THEN 'Raiz adaptógena para energia e libido'
        WHEN name = 'Tribulus' THEN 'Planta para libido masculina e testosterona'
        WHEN name = 'Saw Palmetto' THEN 'Planta para saúde prostática e função urinária'
        WHEN name = 'Dong Quai' THEN 'Planta medicinal para saúde feminina'
        WHEN name = 'Vitex' THEN 'Planta para desequilíbrio hormonal feminino'
        WHEN name = 'Chasteberry' THEN 'Planta para síndrome pré-menstrual'
        WHEN name = 'Black Cohosh' THEN 'Planta para sintomas da menopausa'
        WHEN name = 'Red Clover' THEN 'Planta para ondas de calor na menopausa'
        WHEN name = 'Soy Isoflavones' THEN 'Isoflavonas de soja para sintomas da menopausa'
        WHEN name = 'Flaxseed Oil' THEN 'Óleo de linhaça rico em ômega 3 vegetal'
        WHEN name = 'Evening Primrose' THEN 'Óleo de prímula para hormônios femininos'
        WHEN name = 'Borage Oil' THEN 'Óleo de borragem rico em GLA'
        WHEN name = 'Coconut Oil' THEN 'Óleo de coco rico em MCTs'
        WHEN name = 'MCT Oil' THEN 'Óleo de triglicerídeos de cadeia média'
        WHEN name = 'CLA' THEN 'Ácido linoleico conjugado para perda de gordura'
        WHEN name = 'L-Carnitine' THEN 'Aminoácido para queima de gordura e energia'
        WHEN name = 'Garcinia Cambogia' THEN 'Extrato para controle do apetite'
        WHEN name = 'Green Tea Extract' THEN 'Extrato de chá verde para metabolismo'
        WHEN name = 'Raspberry Ketones' THEN 'Cetona de framboesa para metabolismo'
        WHEN name = 'Forskolin' THEN 'Extrato para queima de gordura'
        WHEN name = 'Yohimbe' THEN 'Extrato para queima de gordura e libido'
        WHEN name = 'Beta-Alanine' THEN 'Aminoácido para resistência muscular'
        WHEN name = 'Citrulline Malate' THEN 'Aminoácido para pump muscular'
        WHEN name = 'Arginina' THEN 'Aminoácido para fluxo sanguíneo'
        WHEN name = 'Taurina' THEN 'Aminoácido para energia e função cardíaca'
        WHEN name = 'HMB' THEN 'Metabólito para preservação muscular'
        ELSE 'Suplemento de alta qualidade da Atlântica Natural'
    END
WHERE original_price IS NULL OR discount_price IS NULL;

-- Verificar os dados atualizados
SELECT 
    name, 
    original_price, 
    discount_price, 
    stock_quantity,
    description
FROM public.supplements 
ORDER BY name
LIMIT 10;

-- Contar quantos registros foram atualizados
SELECT COUNT(*) as total_suplementos_atualizados
FROM public.supplements 
WHERE original_price IS NOT NULL AND discount_price IS NOT NULL;

