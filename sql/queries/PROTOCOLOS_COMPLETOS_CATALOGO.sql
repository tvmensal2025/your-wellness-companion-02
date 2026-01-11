-- ==============================================================================
-- PROTOCOLOS COMPLETOS DO CATÁLOGO NEMA'S WAY
-- Baseado no Guia Prático de Suplementação - 37+ Protocolos
-- ==============================================================================
-- Este script adiciona TODOS os protocolos identificados no catálogo
-- Execute APÓS o MIGRACAO_PRODUTOS_FINAL_V2.sql
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. VERIFICAR E ADICIONAR HORÁRIOS FALTANTES
-- ==============================================================================
INSERT INTO public.usage_times (code, name, time_of_day, display_order) VALUES
  ('APOS_ALMOCO_E_JANTAR', 'Após o Almoço e Jantar', '13:00:00', 13),
  ('30MIN_APOS_ALMOCO', '30 Minutos Após o Almoço', '13:30:00', 14),
  ('USO_TOPICO', 'Uso Tópico', NULL, 15),
  ('MOMENTOS_CRISE', 'Em Momentos de Crise', NULL, 16)
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- 2. ADICIONAR CONDIÇÕES DE SAÚDE FALTANTES
-- ==============================================================================
INSERT INTO public.health_conditions (name, description, icon_name, color_code) VALUES
  ('Alzheimer e Memória Fraca', 'Protocolo para saúde cognitiva e memória', 'brain', '#10B981'),
  ('Candidíase', 'Protocolo para tratamento de candidíase', 'shield', '#EC4899'),
  ('Hipertensão', 'Protocolo para controle de pressão arterial', 'activity', '#F97316'),
  ('Saúde Cardiovascular', 'Protocolo para saúde do coração', 'heart', '#DC2626'),
  ('Saúde Ocular', 'Protocolo para saúde dos olhos', 'eye', '#0284C7'),
  ('Queda de Cabelos', 'Protocolo para fortalecimento capilar', 'scissors', '#8B5CF6'),
  ('Infecção Urinária', 'Protocolo para infecções do trato urinário', 'droplet', '#3B82F6'),
  ('Gripe e Resfriados', 'Protocolo para fortalecimento imunológico em gripes', 'shield', '#10B981'),
  ('S.O.S. Dor', 'Protocolo para alívio de dores', 'heart', '#EF4444'),
  ('Cãimbra e Formigamento', 'Protocolo para problemas neuromusculares', 'zap', '#F59E0B'),
  ('Saúde do Homem', 'Protocolo específico para saúde masculina', 'user', '#3B82F6'),
  ('Saúde da Mulher', 'Protocolo específico para saúde feminina', 'heart', '#EC4899'),
  ('Saúde Sexual', 'Protocolo para saúde e vitalidade sexual', 'heart', '#EC4899'),
  ('Próstata', 'Protocolo para saúde prostática', 'user', '#3B82F6'),
  ('Inflamação no Útero, Ovários, Endometriose', 'Protocolo para saúde reprodutiva feminina', 'heart', '#EC4899'),
  ('Esgotamento Físico e Mental', 'Protocolo para fadiga e cansaço', 'zap', '#F59E0B'),
  ('Enxaqueca', 'Protocolo específico para enxaquecas', 'brain', '#8B5CF6'),
  ('Bactéria H. Pylori', 'Protocolo para tratamento de H. Pylori', 'shield', '#10B981'),
  ('Alergias Respiratórias', 'Protocolo para alergias e asma', 'wind', '#06B6D4'),
  ('Sinusite', 'Protocolo para sinusite e congestão nasal', 'wind', '#06B6D4'),
  ('Herpes Zoster', 'Protocolo para herpes zoster', 'shield', '#10B981'),
  ('Intestino Preso', 'Protocolo para constipação intestinal', 'stomach', '#059669'),
  ('Inchaço e Retenção de Líquidos', 'Protocolo para retenção hídrica', 'droplet', '#3B82F6'),
  ('Feridas', 'Protocolo para cicatrização de feridas', 'shield', '#10B981'),
  ('Apoio ao Tratamento de Câncer', 'Protocolo de suporte oncológico', 'heart', '#DC2626'),
  ('Psoríase / Dermatite', 'Protocolo para doenças de pele', 'sparkles', '#F59E0B'),
  ('Varizes - Dor e Cansaço nas Pernas', 'Protocolo para problemas circulatórios', 'activity', '#EF4444'),
  ('Hidratação e Relaxamento para os Pés', 'Protocolo para cuidados dos pés', 'footprints', '#8B5CF6'),
  ('Acne', 'Protocolo para tratamento de acne', 'sparkles', '#F59E0B'),
  ('Tratamento de Unha', 'Protocolo para fortalecimento de unhas', 'scissors', '#8B5CF6'),
  ('Hepatite', 'Protocolo para saúde hepática', 'shield', '#10B981'),
  ('Circulação', 'Protocolo para melhora da circulação', 'activity', '#EF4444')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color_code = EXCLUDED.color_code,
  updated_at = NOW();

-- ==============================================================================
-- 3. FUNÇÃO AUXILIAR PARA INSERÇÃO SEGURA
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.insert_protocol_supplement_safe(
  p_protocol_id UUID,
  p_supplement_id UUID,
  p_usage_time_id UUID,
  p_dosage TEXT,
  p_display_order INTEGER,
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  IF p_protocol_id IS NOT NULL AND p_supplement_id IS NOT NULL AND p_usage_time_id IS NOT NULL THEN
    INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, notes, display_order)
    VALUES (p_protocol_id, p_supplement_id, p_usage_time_id, p_dosage, p_notes, p_display_order)
    ON CONFLICT (protocol_id, supplement_id, usage_time_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. PROTOCOLOS COMPLETOS
-- ==============================================================================

-- =====================================================
-- PROTOCOLO 1: ANSIEDADE (CORRIGIDO)
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_sdfibro_id UUID;
  v_bvbinsu_id UUID;
  v_seremix_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Ansiedade';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3';
  SELECT id INTO v_bvbinsu_id FROM public.supplements WHERE external_id = 'BVB_INSU';
  SELECT id INTO v_seremix_id FROM public.supplements WHERE external_id = 'SEREMIX';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_APOS_JANTAR';

  -- Validações
  IF v_condition_id IS NULL THEN
    RAISE EXCEPTION 'Condição de saúde "Ansiedade" não encontrada';
  END IF;
  IF v_ozonio_id IS NULL THEN
    RAISE EXCEPTION 'Produto OZONIO não encontrado. Execute primeiro o MIGRACAO_PRODUTOS_FINAL_V2.sql';
  END IF;
  IF v_sdfibro_id IS NULL THEN
    RAISE EXCEPTION 'Produto SD_FIBRO3 não encontrado';
  END IF;
  IF v_bvbinsu_id IS NULL THEN
    RAISE EXCEPTION 'Produto BVB_INSU não encontrado';
  END IF;
  IF v_seremix_id IS NULL THEN
    RAISE EXCEPTION 'Produto SEREMIX não encontrado';
  END IF;

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Ansiedade', 'Protocolo completo para redução de ansiedade e estresse', 'Acompanhamento profissional recomendado')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  -- Limpar protocolo anterior
  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  -- Inserir produtos usando função segura
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_sdfibro_id, v_apos_cafe_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_bvbinsu_id, v_30min_almoco_id, '2 Cápsulas', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_seremix_id, v_30min_jantar_id, '1 Cápsula', 4);
END $$;

-- =====================================================
-- PROTOCOLO 2: DIABETES (CORRIGIDO)
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_bvbinsu_id UUID;
  v_omega3_id UUID;
  v_d3k2_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Diabetes';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_bvbinsu_id FROM public.supplements WHERE external_id = 'BVB_INSU';
  SELECT id INTO v_omega3_id FROM public.supplements WHERE external_id = 'OMEGA_3_1400MG';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_ANTES_JANTAR';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Diabetes', 'Protocolo para controle glicêmico e diabetes', 'Monitorar glicemia regularmente')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_bvbinsu_id, v_apos_cafe_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_omega3_id, v_30min_almoco_id, '1 Cápsula', 4);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_omega3_id, v_30min_jantar_id, '1 Cápsula', 5);
END $$;

-- =====================================================
-- PROTOCOLO 3: FIBROMIALGIA E ENXAQUECA
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_sdfibro_id UUID;
  v_d3k2_id UUID;
  v_coq10_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_as_10h_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Fibromialgia e Enxaqueca';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_coq10_id FROM public.supplements WHERE external_id = 'BVB_Q10';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Fibromialgia e Enxaqueca', 'Protocolo para alívio de dores crônicas e enxaquecas', 'Pode levar algumas semanas para efeito completo')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_sdfibro_id, v_as_10h_id, '2 Cápsulas', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_coq10_id, v_jejum_id, '1 Cápsula', 4);
END $$;

-- =====================================================
-- PROTOCOLO 4: INSÔNIA (CORRIGIDO)
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_sdfibro_id UUID;
  v_seremix_id UUID;
  v_jejum_id UUID;
  v_as_10h_id UUID;
  v_30min_jantar_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Insônia';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3';
  SELECT id INTO v_seremix_id FROM public.supplements WHERE external_id = 'SEREMIX';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_APOS_JANTAR';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Insônia', 'Protocolo para melhora da qualidade do sono', 'Tomar Seremix 30 minutos antes de dormir')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_sdfibro_id, v_as_10h_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_seremix_id, v_30min_jantar_id, '1 Cápsula', 3);
END $$;

-- =====================================================
-- PROTOCOLO 5: EMAGRECIMENTO (CORRIGIDO)
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_propoway_id UUID;
  v_spirulina_id UUID;
  v_lipoway_id UUID;
  v_amargo_id UUID;
  v_gel_crio_id UUID;
  v_oleo_massagem_id UUID;
  v_jejum_id UUID;
  v_as_10h_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
  v_apos_almoco_id UUID;
  v_antes_exercicios_id UUID;
  v_apos_exercicios_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Emagrecimento';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_propoway_id FROM public.supplements WHERE external_id = 'PROPOWAY_VERMELHA';
  SELECT id INTO v_spirulina_id FROM public.supplements WHERE external_id = 'SPIRULINA_VIT_E';
  SELECT id INTO v_lipoway_id FROM public.supplements WHERE external_id = 'LIPOWAY';
  SELECT id INTO v_amargo_id FROM public.supplements WHERE external_id = 'AMARGO';
  SELECT id INTO v_gel_crio_id FROM public.supplements WHERE external_id = 'GEL_CRIOTERAPICO';
  SELECT id INTO v_oleo_massagem_id FROM public.supplements WHERE external_id = 'OLEO_MASSAGEM_OZONIZADO';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_ANTES_JANTAR';
  SELECT id INTO v_apos_almoco_id FROM public.usage_times WHERE code = 'APOS_ALMOCO_E_JANTAR';
  SELECT id INTO v_antes_exercicios_id FROM public.usage_times WHERE code = 'ANTES_EXERCICIOS';
  SELECT id INTO v_apos_exercicios_id FROM public.usage_times WHERE code = 'APOS_EXERCICIOS';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Emagrecimento', 'Protocolo completo para perda de peso e redução de gordura', 'Aumentar ingestão de água. Spirulina: começar com 3 comprimidos, aumentar 1 por dia até observar fezes esverdeadas ou atingir 12 comprimidos. Não tomar com outro suplemento no mesmo horário (intervalo de 2h). Lipoway contém cafeína - se interferir no sono, tomar mais cedo ou antes de exercícios.')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_propoway_id, v_jejum_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_spirulina_id, v_as_10h_id, '3-12 Comprimidos', 3, 'Começar com 3, aumentar 1 por dia até fezes esverdeadas ou 12 comprimidos. Não tomar com outro suplemento no mesmo horário (intervalo 2h).');
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_lipoway_id, v_30min_almoco_id, '1 Cápsula', 4, 'Contém cafeína. Se interferir no sono, tomar mais cedo ou antes de exercícios.');
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_lipoway_id, v_30min_jantar_id, '1 Cápsula', 5);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_amargo_id, v_apos_almoco_id, '2 Colheres de Sopa', 6);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_oleo_massagem_id, v_antes_exercicios_id, 'Aplicar em toda área que deseja eliminar medidas', 7);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_gel_crio_id, v_apos_exercicios_id, 'Aplicar em toda área que deseja eliminar medidas', 8);
END $$;

-- =====================================================
-- PROTOCOLO 6: DESINTOXICAÇÃO
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_propoway_id UUID;
  v_spirulina_id UUID;
  v_amargo_id UUID;
  v_jejum_id UUID;
  v_as_10h_id UUID;
  v_apos_almoco_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Desintoxicação';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_propoway_id FROM public.supplements WHERE external_id = 'PROPOWAY_VERMELHA';
  SELECT id INTO v_spirulina_id FROM public.supplements WHERE external_id = 'SPIRULINA_VIT_E';
  SELECT id INTO v_amargo_id FROM public.supplements WHERE external_id = 'AMARGO';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_apos_almoco_id FROM public.usage_times WHERE code = 'APOS_ALMOCO_E_JANTAR';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Desintoxicação', 'Protocolo para desintoxicação e limpeza do organismo', 'Aumentar ingestão de água durante o protocolo')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_propoway_id, v_jejum_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_spirulina_id, v_as_10h_id, '3 Comprimidos', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_amargo_id, v_apos_almoco_id, '2 Colheres de Sopa', 4);
END $$;

-- =====================================================
-- PROTOCOLO 7: SAÚDE ÍNTIMA (CORRIGIDO)
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_d3k2_id UUID;
  v_propoway_id UUID;
  v_sabonete_id UUID;
  v_oleo_hot_id UUID;
  v_oleo_primula_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_as_10h_id UUID;
  v_uso_diario_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Saúde Íntima';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_propoway_id FROM public.supplements WHERE external_id = 'PROPOWAY_VERMELHA';
  SELECT id INTO v_sabonete_id FROM public.supplements WHERE external_id = 'SABONETE_INTIMO_SEDUCAO';
  SELECT id INTO v_oleo_hot_id FROM public.supplements WHERE external_id = 'OLEO_HOT';
  SELECT id INTO v_oleo_primula_id FROM public.supplements WHERE external_id = 'OLEO_PRIMULA';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_uso_diario_id FROM public.usage_times WHERE code = 'USO_DIARIO';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Saúde Íntima', 'Protocolo completo para saúde íntima feminina', 'Manter higiene adequada')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_propoway_id, v_jejum_id, '2 Cápsulas', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_oleo_primula_id, v_as_10h_id, '2 Cápsulas', 4);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_sabonete_id, v_uso_diario_id, '1x ao dia', 5);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_oleo_hot_id, v_uso_diario_id, 'Todas as noites', 6);
END $$;

-- =====================================================
-- PROTOCOLO 8: MENOPAUSA (CORRIGIDO)
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_prowoman_id UUID;
  v_propoway_id UUID;
  v_d3k2_id UUID;
  v_oleo_primula_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_as_10h_id UUID;
  v_30min_almoco_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Menopausa';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_prowoman_id FROM public.supplements WHERE external_id = 'PROWOMAN';
  SELECT id INTO v_propoway_id FROM public.supplements WHERE external_id = 'PROPOWAY_VERMELHA';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_oleo_primula_id FROM public.supplements WHERE external_id = 'OLEO_PRIMULA';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Menopausa', 'Protocolo para alívio dos sintomas da menopausa', 'Acompanhamento médico recomendado')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_prowoman_id, v_as_10h_id, '3 Comprimidos', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_propoway_id, v_jejum_id, '2 Cápsulas', 4);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_oleo_primula_id, v_30min_almoco_id, '2 Cápsulas', 5);
END $$;

-- =====================================================
-- PROTOCOLO 9: ALZHEIMER E MEMÓRIA FRACA
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_omega3_id UUID;
  v_b12_id UUID;
  v_sdfibro_id UUID;
  v_jejum_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
  v_as_10h_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Alzheimer e Memória Fraca';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_omega3_id FROM public.supplements WHERE external_id = 'OMEGA_3_1400MG';
  SELECT id INTO v_b12_id FROM public.supplements WHERE external_id = 'BVB_B12';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_ANTES_JANTAR';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Alzheimer e Memória', 'Protocolo para saúde cognitiva e memória', 'Acompanhamento médico essencial')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_omega3_id, v_30min_almoco_id, '1 Cápsula', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_b12_id, v_30min_almoco_id, '2 Cápsulas', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_sdfibro_id, v_as_10h_id, '2 Cápsulas', 4);
END $$;

-- =====================================================
-- PROTOCOLO 10: CANDIDÍASE
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_d3k2_id UUID;
  v_propoway_id UUID;
  v_sabonete_id UUID;
  v_oleo_hot_id UUID;
  v_oleo_girassol_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_uso_diario_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Candidíase';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_propoway_id FROM public.supplements WHERE external_id = 'PROPOWAY_VERMELHA';
  SELECT id INTO v_sabonete_id FROM public.supplements WHERE external_id = 'SABONETE_INTIMO_SEDUCAO';
  SELECT id INTO v_oleo_hot_id FROM public.supplements WHERE external_id = 'OLEO_HOT';
  SELECT id INTO v_oleo_girassol_id FROM public.supplements WHERE external_id = 'OLEO_GIRASSOL_OZONIZADO';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_uso_diario_id FROM public.usage_times WHERE code = 'USO_DIARIO';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Candidíase', 'Protocolo para tratamento de candidíase', 'Manter higiene adequada e evitar açúcares')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_propoway_id, v_jejum_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_sabonete_id, v_uso_diario_id, '1x ao dia', 4);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_oleo_hot_id, v_uso_diario_id, 'Todas as noites', 5);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_oleo_girassol_id, v_uso_diario_id, 'Aplicar quando necessário', 6);
END $$;

-- =====================================================
-- PROTOCOLO 11: HIPERTENSÃO
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_sdfibro_id UUID;
  v_bvbinsu_id UUID;
  v_omega3_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Hipertensão';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3';
  SELECT id INTO v_bvbinsu_id FROM public.supplements WHERE external_id = 'BVB_INSU';
  SELECT id INTO v_omega3_id FROM public.supplements WHERE external_id = 'OMEGA_3_1400MG';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_APOS_JANTAR';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Hipertensão', 'Protocolo para controle de pressão arterial', 'Monitorar pressão arterial regularmente')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_sdfibro_id, v_apos_cafe_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_bvbinsu_id, v_apos_cafe_id, '2 Cápsulas', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_omega3_id, v_30min_almoco_id, '2 Cápsulas', 4);
END $$;

-- =====================================================
-- PROTOCOLO 12: SAÚDE CARDIOVASCULAR
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_omega3_id UUID;
  v_sdfibro_id UUID;
  v_d3k2_id UUID;
  v_coq10_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Saúde Cardiovascular';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_omega3_id FROM public.supplements WHERE external_id = 'OMEGA_3_1400MG';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_coq10_id FROM public.supplements WHERE external_id = 'BVB_Q10';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_APOS_JANTAR';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Saúde Cardiovascular', 'Protocolo para saúde do coração e circulação', 'Acompanhamento médico recomendado')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_coq10_id, v_jejum_id, '1 Cápsula', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_omega3_id, v_30min_almoco_id, '2 Cápsulas', 4);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_sdfibro_id, v_30min_jantar_id, '2 Cápsulas', 5);
END $$;

-- =====================================================
-- PROTOCOLO 13: SAÚDE OCULAR
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_visionway_id UUID;
  v_omega3_id UUID;
  v_oleo_girassol_id UUID;
  v_jejum_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
  v_uso_diario_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Saúde Ocular';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_visionway_id FROM public.supplements WHERE external_id = 'VISION_WAY';
  SELECT id INTO v_omega3_id FROM public.supplements WHERE external_id = 'OMEGA_3_1400MG';
  SELECT id INTO v_oleo_girassol_id FROM public.supplements WHERE external_id = 'OLEO_GIRASSOL_OZONIZADO';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_ANTES_JANTAR';
  SELECT id INTO v_uso_diario_id FROM public.usage_times WHERE code = 'USO_DIARIO';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Saúde Ocular', 'Protocolo para saúde dos olhos e visão', 'Colírio: 10ml soro fisiológico + 5 gotas óleo de girassol ozonizado. Aplicar 1-2x ao dia, conservar na geladeira')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_visionway_id, v_30min_almoco_id, '1 Cápsula', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_omega3_id, v_30min_almoco_id, '1 Cápsula', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_omega3_id, v_30min_jantar_id, '1 Cápsula', 4);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_oleo_girassol_id, v_uso_diario_id, 'Colírio: 10ml soro + 5 gotas. Aplicar 1-2x ao dia', 5);
END $$;

-- =====================================================
-- PROTOCOLO 14: QUEDA DE CABELOS
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_rx21_id UUID;
  v_b12_id UUID;
  v_vitamix_id UUID;
  v_d3k2_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_as_10h_id UUID;
  v_30min_almoco_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Queda de Cabelos';
  SELECT id INTO v_rx21_id FROM public.supplements WHERE external_id = 'MEGA_NUTRI_RX21';
  SELECT id INTO v_b12_id FROM public.supplements WHERE external_id = 'BVB_B12';
  SELECT id INTO v_vitamix_id FROM public.supplements WHERE external_id = 'VITAMIX_SKIN';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Queda de Cabelos', 'Protocolo para fortalecimento capilar', 'Resultados podem levar 3-6 meses')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_rx21_id, v_apos_cafe_id, '1 Comprimido', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_b12_id, v_30min_almoco_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_vitamix_id, v_as_10h_id, '2 Cápsulas', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 4);
END $$;

-- =====================================================
-- PROTOCOLO 15: INFECÇÃO URINÁRIA
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_vitc_id UUID;
  v_promen_id UUID;
  v_polivitamix_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Infecção Urinária';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_vitc_id FROM public.supplements WHERE external_id = 'VITAMINA_C_400MG';
  SELECT id INTO v_promen_id FROM public.supplements WHERE external_id = 'PROMEN';
  SELECT id INTO v_polivitamix_id FROM public.supplements WHERE external_id = 'POLIVITAMIX';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_APOS_JANTAR';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Infecção Urinária', 'Protocolo para infecções do trato urinário', 'Aumentar ingestão de água')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_polivitamix_id, v_apos_cafe_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_vitc_id, v_apos_cafe_id, '1 Cápsula', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_promen_id, v_30min_jantar_id, '2 Cápsulas', 4);
END $$;

-- =====================================================
-- PROTOCOLO 16: GRIPE E RESFRIADOS
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_polivitamix_id UUID;
  v_propolis_id UUID;
  v_d3k2_id UUID;
  v_vitc_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_30min_almoco_id UUID;
  v_as_18h_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Gripe e Resfriados';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_polivitamix_id FROM public.supplements WHERE external_id = 'POLIVITAMIX';
  SELECT id INTO v_propolis_id FROM public.supplements WHERE external_id = 'PROPOLIS_VERDE';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_vitc_id FROM public.supplements WHERE external_id = 'VITAMINA_C_400MG';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_as_18h_id FROM public.usage_times WHERE code = 'AS_18H_NOITE';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Gripe e Resfriados', 'Protocolo para fortalecimento imunológico em gripes', 'Aumentar ingestão de líquidos')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_polivitamix_id, v_apos_cafe_id, '2 Cápsulas', 2);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_vitc_id, v_apos_cafe_id, '1 Cápsula', 3);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_propolis_id, v_30min_almoco_id, '2 Cápsulas', 4);
  PERFORM public.insert_protocol_supplement_safe(v_protocol_id, v_d3k2_id, v_as_18h_id, '2 Cápsulas', 5);
END $$;

COMMIT;

-- ==============================================================================
-- NOTA: Este script contém os primeiros 16 protocolos principais.
-- Os demais protocolos serão adicionados em uma segunda parte.
-- Total de protocolos no catálogo: 37+
-- ==============================================================================

