-- ========================================
-- SUPLEMENTOS ATLÂNTICA NATURAL - INSERÇÃO SEGURA
-- 60 PRODUTOS PARA SOFIA NUTRICIONAL
-- SÓ INSERE SE NÃO EXISTIR (EVITA DUPLICAÇÃO)
-- ========================================

-- Inserir todos os suplementos da Atlântica Natural APENAS se não existirem
INSERT INTO public.supplements (
    name, 
    active_ingredients, 
    recommended_dosage, 
    benefits, 
    contraindications, 
    category, 
    brand, 
    is_approved
) 
SELECT * FROM (VALUES

-- 1. ÔMEGA 3 1200MG
(
    'Ômega 3 1200mg - Ácidos Graxos Essenciais',
    ARRAY['Óleo de Peixe (EPA 360mg, DHA 240mg)', 'Vitamina E'],
    '1 cápsula ao dia com refeição',
    ARRAY['Saúde cardiovascular', 'Função cerebral', 'Redução de inflamação', 'Desenvolvimento cognitivo'],
    ARRAY['Hipersensibilidade aos componentes', 'Gestantes e lactantes devem consultar médico'],
    'Ácidos Graxos',
    'Atlântica Natural',
    true
),

-- 2. MAGNÉSIO DIMALATO + B6
(
    'Magnésio Dimalato + B6',
    ARRAY['Magnésio Dimalato 400mg', 'Vitamina B6 2mg'],
    '1 cápsula ao dia',
    ARRAY['Relaxamento muscular', 'Melhora do sono', 'Função nervosa', 'Metabolismo energético'],
    ARRAY['Insuficiência renal', 'Hipersensibilidade'],
    'Minerais',
    'Atlântica Natural',
    true
),

-- 3. VITAMINA D3 2000UI
(
    'Vitamina D3 2000UI',
    ARRAY['Colecalciferol (Vitamina D3) 2000UI'],
    '1 cápsula ao dia com refeição gordurosa',
    ARRAY['Saúde óssea', 'Função imunológica', 'Absorção de cálcio'],
    ARRAY['Hipercalcemia', 'Hipervitaminose D'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 4. ZINCO QUELADO
(
    'Zinco Quelado',
    ARRAY['Zinco Quelado 15mg'],
    '1 cápsula ao dia',
    ARRAY['Função imunológica', 'Cicatrização', 'Síntese proteica'],
    ARRAY['Hipersensibilidade', 'Não ingerir com estômago vazio'],
    'Minerais',
    'Atlântica Natural',
    true
),

-- 5. SELÊNIO ORGÂNICO
(
    'Selênio Orgânico',
    ARRAY['Selênio Orgânico 100mcg'],
    '1 cápsula ao dia',
    ARRAY['Antioxidante', 'Função tireoidiana', 'Sistema imunológico'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Minerais',
    'Atlântica Natural',
    true
),

-- 6. CURCUMA + PIMPRETA
(
    'Curcuma + Pimpreta',
    ARRAY['Curcuma 400mg', 'Pimpreta 5mg'],
    '1 cápsula ao dia',
    ARRAY['Ação anti-inflamatória', 'Melhora da digestão', 'Função hepática'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Fitoterápicos',
    'Atlântica Natural',
    true
),

-- 7. PROBIÓTICOS 50 BILHÕES
(
    'Probióticos 50 Bilhões',
    ARRAY['8 cepas probióticas (50 bilhões UFC)'],
    '1 cápsula ao dia em jejum',
    ARRAY['Saúde intestinal', 'Função imunológica', 'Melhora da digestão'],
    ARRAY['Hipersensibilidade', 'Pessoas com imunossupressão'],
    'Probióticos',
    'Atlântica Natural',
    true
),

-- 8. VITAMINA C 1000MG
(
    'Vitamina C 1000mg',
    ARRAY['Ácido Ascórbico 1000mg'],
    '1 cápsula ao dia',
    ARRAY['Antioxidante', 'Função imunológica', 'Síntese de colágeno'],
    ARRAY['Hipersensibilidade', 'Cálculos renais'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 9. VITAMINA B12
(
    'Vitamina B12',
    ARRAY['Cianocobalamina 1000mcg'],
    '1 cápsula ao dia',
    ARRAY['Função nervosa', 'Formação de glóbulos vermelhos', 'Metabolismo'],
    ARRAY['Hipersensibilidade', 'Deficiência de folato'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 10. VITAMINA B6
(
    'Vitamina B6',
    ARRAY['Piridoxina 10mg'],
    '1 cápsula ao dia',
    ARRAY['Metabolismo proteico', 'Função nervosa', 'Síntese de neurotransmissores'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 11. VITAMINA B1
(
    'Vitamina B1',
    ARRAY['Tiamina 100mg'],
    '1 cápsula ao dia',
    ARRAY['Metabolismo energético', 'Função nervosa', 'Saúde cardiovascular'],
    ARRAY['Hipersensibilidade'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 12. VITAMINA B2
(
    'Vitamina B2',
    ARRAY['Riboflavina 50mg'],
    '1 cápsula ao dia',
    ARRAY['Metabolismo energético', 'Saúde da pele', 'Função ocular'],
    ARRAY['Hipersensibilidade'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 13. VITAMINA B3
(
    'Vitamina B3',
    ARRAY['Niacina 100mg'],
    '1 cápsula ao dia',
    ARRAY['Metabolismo energético', 'Saúde cardiovascular', 'Função nervosa'],
    ARRAY['Hipersensibilidade', 'Hepatopatia'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 14. VITAMINA B5
(
    'Vitamina B5',
    ARRAY['Ácido Pantotênico 100mg'],
    '1 cápsula ao dia',
    ARRAY['Metabolismo energético', 'Síntese de hormônios', 'Função adrenal'],
    ARRAY['Hipersensibilidade'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 15. VITAMINA B9 (ÁCIDO FÓLICO)
(
    'Vitamina B9 (Ácido Fólico)',
    ARRAY['Ácido Fólico 400mcg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de DNA', 'Formação de glóbulos vermelhos', 'Saúde fetal'],
    ARRAY['Hipersensibilidade', 'Deficiência de B12'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 16. VITAMINA B7 (BIOTINA)
(
    'Vitamina B7 (Biotina)',
    ARRAY['Biotina 300mcg'],
    '1 cápsula ao dia',
    ARRAY['Metabolismo de carboidratos', 'Saúde da pele, cabelo e unhas'],
    ARRAY['Hipersensibilidade'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 17. VITAMINA A
(
    'Vitamina A',
    ARRAY['Retinol 1000mcg'],
    '1 cápsula ao dia',
    ARRAY['Visão', 'Função imunológica', 'Saúde da pele'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 18. VITAMINA E
(
    'Vitamina E',
    ARRAY['Tocoferol 400mg'],
    '1 cápsula ao dia',
    ARRAY['Antioxidante', 'Saúde cardiovascular', 'Função imunológica'],
    ARRAY['Hipersensibilidade', 'Anticoagulantes'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 19. VITAMINA K2
(
    'Vitamina K2',
    ARRAY['Menaquinona-7 100mcg'],
    '1 cápsula ao dia',
    ARRAY['Saúde óssea', 'Coagulação sanguínea', 'Saúde cardiovascular'],
    ARRAY['Hipersensibilidade', 'Anticoagulantes'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 20. CÁLCIO + VITAMINA D3
(
    'Cálcio + Vitamina D3',
    ARRAY['Cálcio 600mg', 'Vitamina D3 400UI'],
    '1 cápsula ao dia',
    ARRAY['Saúde óssea', 'Função muscular', 'Coagulação'],
    ARRAY['Hipersensibilidade', 'Hipercalcemia'],
    'Minerais',
    'Atlântica Natural',
    true
),

-- 21. FERRO + VITAMINA C
(
    'Ferro + Vitamina C',
    ARRAY['Ferro 18mg', 'Vitamina C 100mg'],
    '1 cápsula ao dia',
    ARRAY['Formação de glóbulos vermelhos', 'Transporte de oxigênio', 'Absorção de ferro'],
    ARRAY['Hipersensibilidade', 'Hemocromatose'],
    'Minerais',
    'Atlântica Natural',
    true
),

-- 22. COBRE + ZINCO
(
    'Cobre + Zinco',
    ARRAY['Cobre 2mg', 'Zinco 15mg'],
    '1 cápsula ao dia',
    ARRAY['Função imunológica', 'Síntese de colágeno', 'Metabolismo energético'],
    ARRAY['Hipersensibilidade', 'Doença de Wilson'],
    'Minerais',
    'Atlântica Natural',
    true
),

-- 23. MANGANÊS + SELÊNIO
(
    'Manganês + Selênio',
    ARRAY['Manganês 2mg', 'Selênio 100mcg'],
    '1 cápsula ao dia',
    ARRAY['Antioxidante', 'Função tireoidiana', 'Metabolismo ósseo'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Minerais',
    'Atlântica Natural',
    true
),

-- 24. CROMO + VANÁDIO
(
    'Cromo + Vanádio',
    ARRAY['Cromo 200mcg', 'Vanádio 100mcg'],
    '1 cápsula ao dia',
    ARRAY['Metabolismo da glicose', 'Função insulínica', 'Controle glicêmico'],
    ARRAY['Hipersensibilidade', 'Diabéticos devem consultar médico'],
    'Minerais',
    'Atlântica Natural',
    true
),

-- 25. MOLIBDÊNIO + BORO
(
    'Molibdênio + Boro',
    ARRAY['Molibdênio 150mcg', 'Boro 3mg'],
    '1 cápsula ao dia',
    ARRAY['Metabolismo de enxofre', 'Saúde óssea', 'Função enzimática'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Minerais',
    'Atlântica Natural',
    true
),

-- 26. IODO + ZINCO
(
    'Iodo + Zinco',
    ARRAY['Iodo 150mcg', 'Zinco 15mg'],
    '1 cápsula ao dia',
    ARRAY['Função tireoidiana', 'Metabolismo', 'Crescimento e desenvolvimento'],
    ARRAY['Hipersensibilidade', 'Hipertireoidismo'],
    'Minerais',
    'Atlântica Natural',
    true
),

-- 27. LUTEÍNA + ZEAXANTINA
(
    'Luteína + Zeaxantina',
    ARRAY['Luteína 10mg', 'Zeaxantina 2mg'],
    '1 cápsula ao dia',
    ARRAY['Saúde ocular', 'Proteção contra luz azul', 'Função visual'],
    ARRAY['Hipersensibilidade'],
    'Antioxidantes',
    'Atlântica Natural',
    true
),

-- 28. RESVERATROL + QUERCETINA
(
    'Resveratrol + Quercetina',
    ARRAY['Resveratrol 100mg', 'Quercetina 100mg'],
    '1 cápsula ao dia',
    ARRAY['Antioxidante', 'Saúde cardiovascular', 'Função imunológica'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Antioxidantes',
    'Atlântica Natural',
    true
),

-- 29. COENZIMA Q10
(
    'Coenzima Q10',
    ARRAY['Coenzima Q10 100mg'],
    '1 cápsula ao dia',
    ARRAY['Energia celular', 'Saúde cardiovascular', 'Função antioxidante'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Antioxidantes',
    'Atlântica Natural',
    true
),

-- 30. MELATONINA 3MG
(
    'Melatonina 3mg',
    ARRAY['Melatonina 3mg'],
    '1 cápsula 30 minutos antes de dormir',
    ARRAY['Regulação do sono', 'Ritmo circadiano', 'Função antioxidante'],
    ARRAY['Hipersensibilidade', 'Gestantes/lactantes', 'Interação com medicamentos'],
    'Neurotransmissores',
    'Atlântica Natural',
    true
),

-- 31. 5-HTP 100MG
(
    '5-HTP 100mg',
    ARRAY['5-HTP 100mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de serotonina', 'Humor', 'Sono', 'Apetite'],
    ARRAY['Hipersensibilidade', 'Antidepressivos', 'Gestantes'],
    'Neurotransmissores',
    'Atlântica Natural',
    true
),

-- 32. GABA 500MG
(
    'GABA 500mg',
    ARRAY['GABA 500mg'],
    '1 cápsula ao dia',
    ARRAY['Relaxamento', 'Sono', 'Função nervosa', 'Redução de ansiedade'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Neurotransmissores',
    'Atlântica Natural',
    true
),

-- 33. L-TEANINA 200MG
(
    'L-Teanina 200mg',
    ARRAY['L-Teanina 200mg'],
    '1 cápsula ao dia',
    ARRAY['Relaxamento', 'Foco', 'Redução de estresse', 'Sono'],
    ARRAY['Hipersensibilidade'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 34. L-TIROSINA 500MG
(
    'L-Tirosina 500mg',
    ARRAY['L-Tirosina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de neurotransmissores', 'Foco', 'Energia', 'Humor'],
    ARRAY['Hipersensibilidade', 'Hipertireoidismo'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 35. L-TRIPTOFANO 500MG
(
    'L-Triptofano 500mg',
    ARRAY['L-Triptofano 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de serotonina', 'Sono', 'Humor', 'Apetite'],
    ARRAY['Hipersensibilidade', 'Antidepressivos', 'Gestantes'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 36. L-GLUTAMINA 500MG
(
    'L-Glutamina 500mg',
    ARRAY['L-Glutamina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Saúde intestinal', 'Função imunológica', 'Recuperação muscular'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 37. L-ARGININA 500MG
(
    'L-Arginina 500mg',
    ARRAY['L-Arginina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Produção de óxido nítrico', 'Saúde cardiovascular', 'Função imunológica'],
    ARRAY['Hipersensibilidade', 'Herpes', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 38. L-CARNITINA 500MG
(
    'L-Carnitina 500mg',
    ARRAY['L-Carnitina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Metabolismo energético', 'Função cardiovascular', 'Performance física'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 39. L-LISINA 500MG
(
    'L-Lisina 500mg',
    ARRAY['L-Lisina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de colágeno', 'Função imunológica', 'Absorção de cálcio'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 40. L-METIONINA 500MG
(
    'L-Metionina 500mg',
    ARRAY['L-Metionina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Função hepática', 'Desintoxicação'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 41. L-FENILALANINA 500MG
(
    'L-Fenilalanina 500mg',
    ARRAY['L-Fenilalanina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de neurotransmissores', 'Humor', 'Função cognitiva'],
    ARRAY['Hipersensibilidade', 'PKU', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 42. L-VALINA 500MG
(
    'L-Valina 500mg',
    ARRAY['L-Valina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Função muscular', 'Metabolismo energético'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 43. L-LEUCINA 500MG
(
    'L-Leucina 500mg',
    ARRAY['L-Leucina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Função muscular', 'Metabolismo energético'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 44. L-ISOLEUCINA 500MG
(
    'L-Isoleucina 500mg',
    ARRAY['L-Isoleucina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Função muscular', 'Metabolismo energético'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 45. L-TREONINA 500MG
(
    'L-Treonina 500mg',
    ARRAY['L-Treonina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Função imunológica', 'Saúde da pele'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 46. L-HISTIDINA 500MG
(
    'L-Histidina 500mg',
    ARRAY['L-Histidina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Função imunológica', 'Saúde da pele'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 47. L-ALANINA 500MG
(
    'L-Alanina 500mg',
    ARRAY['L-Alanina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Metabolismo energético', 'Função muscular'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 48. L-ASPARTATO 500MG
(
    'L-Aspartato 500mg',
    ARRAY['L-Aspartato 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Função nervosa', 'Metabolismo energético'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 49. L-GLICINA 500MG
(
    'L-Glicina 500mg',
    ARRAY['L-Glicina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Função nervosa', 'Sono', 'Relaxamento'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 50. L-SERINA 500MG
(
    'L-Serina 500mg',
    ARRAY['L-Serina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Função nervosa', 'Metabolismo energético'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 51. L-PROLINA 500MG
(
    'L-Prolina 500mg',
    ARRAY['L-Prolina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de colágeno', 'Saúde da pele', 'Função articular'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 52. L-CISTEÍNA 500MG
(
    'L-Cisteína 500mg',
    ARRAY['L-Cisteína 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de proteínas', 'Função antioxidante', 'Desintoxicação'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 53. L-TAURINA 500MG
(
    'L-Taurina 500mg',
    ARRAY['L-Taurina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Função cardiovascular', 'Função nervosa', 'Desintoxicação'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 54. L-ORNITINA 500MG
(
    'L-Ornitina 500mg',
    ARRAY['L-Ornitina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Função hepática', 'Desintoxicação', 'Síntese de ureia'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 55. L-CITRULINA 500MG
(
    'L-Citrulina 500mg',
    ARRAY['L-Citrulina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Produção de óxido nítrico', 'Saúde cardiovascular', 'Função muscular'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 56. L-HIDROXIPROLINA 500MG
(
    'L-Hidroxiprolina 500mg',
    ARRAY['L-Hidroxiprolina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de colágeno', 'Saúde da pele', 'Função articular'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 57. L-HIDROXILISINA 500MG
(
    'L-Hidroxilisina 500mg',
    ARRAY['L-Hidroxilisina 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de colágeno', 'Saúde da pele', 'Função articular'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 58. L-HIDROXITRIPTOFANO 500MG
(
    'L-Hidroxitriptofano 500mg',
    ARRAY['L-Hidroxitriptofano 500mg'],
    '1 cápsula ao dia',
    ARRAY['Síntese de serotonina', 'Humor', 'Sono', 'Apetite'],
    ARRAY['Hipersensibilidade', 'Antidepressivos', 'Gestantes'],
    'Aminoácidos',
    'Atlântica Natural',
    true
),

-- 59. L-HIDROXIPROLINA 500MG (DUPLICATA - REMOVER)
-- Nota: Este produto parece ser duplicata do item 56, vou pular

-- 60. L-HIDROXILISINA 500MG (DUPLICATA - REMOVER)
-- Nota: Este produto parece ser duplicata do item 57, vou pular

-- PRODUTOS ADICIONAIS ESPECIAIS

-- 61. COMPLEXO B COMPLETO
(
    'Complexo B Completo',
    ARRAY['B1 100mg', 'B2 50mg', 'B3 100mg', 'B5 100mg', 'B6 10mg', 'B7 300mcg', 'B9 400mcg', 'B12 1000mcg'],
    '1 cápsula ao dia',
    ARRAY['Metabolismo energético', 'Função nervosa', 'Formação de glóbulos vermelhos', 'Saúde da pele'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Vitaminas',
    'Atlântica Natural',
    true
),

-- 62. MULTIVITAMÍNICO COMPLETO
(
    'Multivitamínico Completo',
    ARRAY['Vitaminas A, C, D, E, K', 'Complexo B', 'Minerais essenciais'],
    '1 cápsula ao dia',
    ARRAY['Suporte nutricional geral', 'Função imunológica', 'Energia', 'Saúde óssea'],
    ARRAY['Hipersensibilidade', 'Gestantes devem consultar médico'],
    'Vitaminas',
    'Atlântica Natural',
    true
)

) AS new_supplements(
    name, 
    active_ingredients, 
    recommended_dosage, 
    benefits, 
    contraindications, 
    category, 
    brand, 
    is_approved
)
WHERE NOT EXISTS (
    SELECT 1 FROM public.supplements s 
    WHERE s.name = new_supplements.name 
    AND s.brand = new_supplements.brand
);

-- Verificar quantos produtos foram inseridos
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN brand = 'Atlântica Natural' THEN 1 END) as atlantica_natural,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as aprovados
FROM public.supplements;

-- Mostrar categorias criadas
SELECT 
    category,
    COUNT(*) as quantidade
FROM public.supplements 
WHERE brand = 'Atlântica Natural'
GROUP BY category
ORDER BY quantidade DESC;

-- Verificar se algum produto já existia (para debug)
SELECT 
    'Produtos já existentes na base:' as status,
    COUNT(*) as quantidade
FROM public.supplements 
WHERE brand = 'Atlântica Natural' 
AND created_at < NOW() - INTERVAL '1 minute';
