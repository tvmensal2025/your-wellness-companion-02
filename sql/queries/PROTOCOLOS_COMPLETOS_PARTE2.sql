-- ==============================================================================
-- PROTOCOLOS COMPLETOS DO CATÁLOGO NEMA'S WAY - PARTE 2
-- Protocolos 17-37+ (continuação)
-- ==============================================================================
-- Execute APÓS o PROTOCOLOS_COMPLETOS_CATALOGO.sql
-- ==============================================================================

BEGIN;

-- =====================================================
-- PROTOCOLO 17: S.O.S. DOR
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_sdfibro_id UUID;
  v_sdartro_id UUID;
  v_colageno2_id UUID;
  v_jejum_id UUID;
  v_as_10h_id UUID;
  v_as_18h_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'S.O.S. Dor';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3';
  SELECT id INTO v_sdartro_id FROM public.supplements WHERE external_id = 'SD_ARTRO';
  SELECT id INTO v_colageno2_id FROM public.supplements WHERE external_id = 'COLAGENO_TIPO_II';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_as_18h_id FROM public.usage_times WHERE code = 'AS_18H_NOITE';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo S.O.S. Dor', 'Protocolo para alívio de dores', 'Pode levar algumas semanas para efeito completo')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order)
  VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_sdfibro_id, v_as_10h_id, '2 Cápsulas', 2),
    (v_protocol_id, v_sdartro_id, v_as_18h_id, '2 Cápsulas', 3),
    (v_protocol_id, v_colageno2_id, v_as_18h_id, '1 Comprimido', 4)
  ON CONFLICT (protocol_id, supplement_id, usage_time_id) DO NOTHING;
END $$;

-- =====================================================
-- PROTOCOLO 18: CÃIMBRA E FORMIGAMENTO
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_polivitamix_id UUID;
  v_b12_id UUID;
  v_sdfibro_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Cãimbra e Formigamento';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_polivitamix_id FROM public.supplements WHERE external_id = 'POLIVITAMIX';
  SELECT id INTO v_b12_id FROM public.supplements WHERE external_id = 'BVB_B12';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_APOS_JANTAR';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Cãimbra e Formigamento', 'Protocolo para problemas neuromusculares', 'Acompanhamento médico recomendado')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order)
  VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_polivitamix_id, v_apos_cafe_id, '2 Cápsulas', 2),
    (v_protocol_id, v_b12_id, v_30min_almoco_id, '2 Cápsulas', 3),
    (v_protocol_id, v_sdfibro_id, v_30min_jantar_id, '2 Cápsulas', 4)
  ON CONFLICT (protocol_id, supplement_id, usage_time_id) DO NOTHING;
END $$;

-- =====================================================
-- PROTOCOLO 19: SAÚDE DO HOMEM
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_promen_id UUID;
  v_d3k2_id UUID;
  v_omega3_id UUID;
  v_b12_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_30min_almoco_id UUID;
  v_as_18h_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Saúde do Homem';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_promen_id FROM public.supplements WHERE external_id = 'PROMEN';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_omega3_id FROM public.supplements WHERE external_id = 'OMEGA_3_1400MG';
  SELECT id INTO v_b12_id FROM public.supplements WHERE external_id = 'BVB_B12';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_as_18h_id FROM public.usage_times WHERE code = 'AS_18H_NOITE';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Saúde do Homem', 'Protocolo específico para saúde masculina', 'ProMen não indicado em casos de insuficiência cardíaca')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order)
  VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_promen_id, v_as_18h_id, '2 Cápsulas', 2),
    (v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 3),
    (v_protocol_id, v_omega3_id, v_30min_almoco_id, '2 Cápsulas', 4),
    (v_protocol_id, v_b12_id, v_30min_almoco_id, '2 Cápsulas', 5)
  ON CONFLICT (protocol_id, supplement_id, usage_time_id) DO NOTHING;
END $$;

-- =====================================================
-- PROTOCOLO 20: SAÚDE DA MULHER
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_coq10_id UUID;
  v_prowoman_id UUID;
  v_omega3_id UUID;
  v_d3k2_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_as_10h_id UUID;
  v_30min_almoco_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Saúde da Mulher';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_coq10_id FROM public.supplements WHERE external_id = 'BVB_Q10';
  SELECT id INTO v_prowoman_id FROM public.supplements WHERE external_id = 'PROWOMAN';
  SELECT id INTO v_omega3_id FROM public.supplements WHERE external_id = 'OMEGA_3_1400MG';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Saúde da Mulher', 'Protocolo específico para saúde feminina', 'Acompanhamento médico recomendado')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order)
  VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 2),
    (v_protocol_id, v_prowoman_id, v_as_10h_id, '2 Cápsulas', 3),
    (v_protocol_id, v_omega3_id, v_30min_almoco_id, '2 Cápsulas', 4),
    (v_protocol_id, v_coq10_id, v_apos_cafe_id, '1 Cápsula', 5)
  ON CONFLICT (protocol_id, supplement_id, usage_time_id) DO NOTHING;
END $$;

-- =====================================================
-- PROTOCOLO 21: SAÚDE SEXUAL
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_libway_id UUID;
  v_b12_id UUID;
  v_d3k2_id UUID;
  v_coq10_id UUID;
  v_oleo_verde_id UUID;
  v_jejum_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
  v_uso_diario_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Saúde Sexual';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_libway_id FROM public.supplements WHERE external_id = 'LIBWAY';
  SELECT id INTO v_b12_id FROM public.supplements WHERE external_id = 'BVB_B12';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_coq10_id FROM public.supplements WHERE external_id = 'BVB_Q10';
  SELECT id INTO v_oleo_verde_id FROM public.supplements WHERE external_id = 'OLEO_MASSAGEM_OZONIZADO';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_APOS_JANTAR';
  SELECT id INTO v_uso_diario_id FROM public.usage_times WHERE code = 'USO_DIARIO';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Saúde Sexual', 'Protocolo para saúde e vitalidade sexual', 'Óleo Verde: aplicar todas as noites nos testículos e massagear')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order)
  VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_coq10_id, v_jejum_id, '1 Cápsula', 2),
    (v_protocol_id, v_d3k2_id, v_30min_almoco_id, '2 Cápsulas', 3),
    (v_protocol_id, v_b12_id, v_30min_almoco_id, '2 Cápsulas', 4),
    (v_protocol_id, v_libway_id, v_30min_jantar_id, '1 Cápsula', 5),
    (v_protocol_id, v_oleo_verde_id, v_uso_diario_id, 'Aplicar todas as noites nos testículos e massagear', 6)
  ON CONFLICT (protocol_id, supplement_id, usage_time_id) DO NOTHING;
END $$;

-- =====================================================
-- PROTOCOLO 22: PRÓSTATA
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_spirulina_id UUID;
  v_omega3_id UUID;
  v_promen_id UUID;
  v_propoway_id UUID;
  v_jejum_id UUID;
  v_as_10h_id UUID;
  v_30min_almoco_id UUID;
  v_as_18h_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Próstata';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_spirulina_id FROM public.supplements WHERE external_id = 'SPIRULINA_VIT_E';
  SELECT id INTO v_omega3_id FROM public.supplements WHERE external_id = 'OMEGA_3_1400MG';
  SELECT id INTO v_promen_id FROM public.supplements WHERE external_id = 'PROMEN';
  SELECT id INTO v_propoway_id FROM public.supplements WHERE external_id = 'PROPOWAY_VERMELHA';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_as_18h_id FROM public.usage_times WHERE code = 'AS_18H_NOITE';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Próstata', 'Protocolo para saúde prostática', 'ProMen não indicado em casos de insuficiência cardíaca')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order)
  VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_spirulina_id, v_as_10h_id, '3-5 Comprimidos', 2),
    (v_protocol_id, v_omega3_id, v_30min_almoco_id, '2 Cápsulas', 3),
    (v_protocol_id, v_promen_id, v_as_18h_id, '2 Cápsulas', 4),
    (v_protocol_id, v_propoway_id, v_jejum_id, '2 Cápsulas', 5)
  ON CONFLICT (protocol_id, supplement_id, usage_time_id) DO NOTHING;
END $$;

-- =====================================================
-- PROTOCOLO 23: BACTÉRIA H. PYLORI
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_propolis_id UUID;
  v_d3k2_id UUID;
  v_amargo_id UUID;
  v_spirulina_id UUID;
  v_jejum_id UUID;
  v_apos_cafe_id UUID;
  v_as_10h_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
  v_apos_almoco_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Bactéria H. Pylori';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_propolis_id FROM public.supplements WHERE external_id = 'PROPOLIS_VERDE';
  SELECT id INTO v_d3k2_id FROM public.supplements WHERE external_id = 'BVB_D3K2';
  SELECT id INTO v_amargo_id FROM public.supplements WHERE external_id = 'AMARGO';
  SELECT id INTO v_spirulina_id FROM public.supplements WHERE external_id = 'SPIRULINA_VIT_E';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_apos_cafe_id FROM public.usage_times WHERE code = 'APOS_CAFE_MANHA';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_ANTES_JANTAR';
  SELECT id INTO v_apos_almoco_id FROM public.usage_times WHERE code = 'APOS_ALMOCO_E_JANTAR';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo H. Pylori', 'Protocolo para tratamento de H. Pylori', 'Acompanhamento médico essencial')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order)
  VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_propolis_id, v_jejum_id, '2 Cápsulas', 2),
    (v_protocol_id, v_d3k2_id, v_apos_cafe_id, '2 Cápsulas', 3),
    (v_protocol_id, v_spirulina_id, v_as_10h_id, '3 Comprimidos', 4),
    (v_protocol_id, v_propolis_id, v_30min_almoco_id, '2 Cápsulas', 5),
    (v_protocol_id, v_propolis_id, v_30min_jantar_id, '2 Cápsulas', 6),
    (v_protocol_id, v_amargo_id, v_apos_almoco_id, '2 Colheres de Sopa', 7)
  ON CONFLICT (protocol_id, supplement_id, usage_time_id) DO NOTHING;
END $$;

-- =====================================================
-- PROTOCOLO 24: ESGOTAMENTO FÍSICO E MENTAL
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_omega3_id UUID;
  v_sdfibro_id UUID;
  v_b12_id UUID;
  v_seremix_id UUID;
  v_jejum_id UUID;
  v_30min_almoco_id UUID;
  v_30min_jantar_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Esgotamento Físico e Mental';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_omega3_id FROM public.supplements WHERE external_id = 'OMEGA_3_1400MG';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3';
  SELECT id INTO v_b12_id FROM public.supplements WHERE external_id = 'BVB_B12';
  SELECT id INTO v_seremix_id FROM public.supplements WHERE external_id = 'SEREMIX';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_30min_almoco_id FROM public.usage_times WHERE code = '30MIN_ANTES_ALMOCO';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_APOS_JANTAR';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Esgotamento Físico e Mental', 'Protocolo para fadiga e cansaço', 'Descanso adequado é essencial')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order)
  VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_omega3_id, v_30min_almoco_id, '2 Cápsulas', 2),
    (v_protocol_id, v_b12_id, v_30min_almoco_id, '2 Cápsulas', 3),
    (v_protocol_id, v_sdfibro_id, v_30min_jantar_id, '2 Cápsulas', 4),
    (v_protocol_id, v_seremix_id, v_30min_jantar_id, '1 Cápsula', 5)
  ON CONFLICT (protocol_id, supplement_id, usage_time_id) DO NOTHING;
END $$;

-- =====================================================
-- PROTOCOLO 25: ENXAQUECA
-- =====================================================
DO $$
DECLARE
  v_condition_id UUID;
  v_protocol_id UUID;
  v_ozonio_id UUID;
  v_spirulina_id UUID;
  v_sdfibro_id UUID;
  v_coq10_id UUID;
  v_jejum_id UUID;
  v_as_10h_id UUID;
  v_30min_jantar_id UUID;
BEGIN
  SELECT id INTO v_condition_id FROM public.health_conditions WHERE name = 'Enxaqueca';
  SELECT id INTO v_ozonio_id FROM public.supplements WHERE external_id = 'OZONIO';
  SELECT id INTO v_spirulina_id FROM public.supplements WHERE external_id = 'SPIRULINA_VIT_E';
  SELECT id INTO v_sdfibro_id FROM public.supplements WHERE external_id = 'SD_FIBRO3';
  SELECT id INTO v_coq10_id FROM public.supplements WHERE external_id = 'BVB_Q10';
  SELECT id INTO v_jejum_id FROM public.usage_times WHERE code = 'EM_JEJUM';
  SELECT id INTO v_as_10h_id FROM public.usage_times WHERE code = 'AS_10H_MANHA';
  SELECT id INTO v_30min_jantar_id FROM public.usage_times WHERE code = '30MIN_APOS_JANTAR';

  INSERT INTO public.supplement_protocols (health_condition_id, name, description, notes)
  VALUES (v_condition_id, 'Protocolo Enxaqueca', 'Protocolo específico para enxaquecas', 'Evitar gatilhos conhecidos')
  ON CONFLICT (health_condition_id, name) DO UPDATE SET
    description = EXCLUDED.description,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_protocol_id;

  IF v_protocol_id IS NULL THEN
    SELECT id INTO v_protocol_id FROM public.supplement_protocols WHERE health_condition_id = v_condition_id LIMIT 1;
  END IF;

  DELETE FROM public.protocol_supplements WHERE protocol_id = v_protocol_id;

  INSERT INTO public.protocol_supplements (protocol_id, supplement_id, usage_time_id, dosage, display_order)
  VALUES
    (v_protocol_id, v_ozonio_id, v_jejum_id, '2 Cápsulas', 1),
    (v_protocol_id, v_spirulina_id, v_as_10h_id, '3-5 Comprimidos', 2),
    (v_protocol_id, v_sdfibro_id, v_30min_jantar_id, '2 Cápsulas', 3),
    (v_protocol_id, v_coq10_id, v_jejum_id, '1 Cápsula', 4)
  ON CONFLICT (protocol_id, supplement_id, usage_time_id) DO NOTHING;
END $$;

COMMIT;

-- ==============================================================================
-- NOTA: Este script contém os protocolos 17-25.
-- Os demais protocolos (26-37+) serão adicionados em uma terceira parte se necessário.
-- ==============================================================================

