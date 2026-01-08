-- Configurações de IA para análise de imagens com máxima precisão
INSERT INTO ai_configurations (functionality, service, model, max_tokens, temperature, is_enabled, system_prompt, personality)
VALUES 
('image_analysis', 'lovable', 'google/gemini-2.5-flash', 2500, 0.3, true, 
 'Analise a foto de refeição brasileira com MÁXIMA PRECISÃO. Identifique TODOS os alimentos, método de preparo e quantidade em gramas.', 'sofia'),
('medical_exam_analysis', 'lovable', 'google/gemini-2.5-pro', 4000, 0.1, true,
 'Extraia TODOS os dados dos exames laboratoriais com precisão absoluta: nome do exame, valor, unidade e referência.', 'sofia')
ON CONFLICT (functionality) DO UPDATE SET
  service = EXCLUDED.service,
  model = EXCLUDED.model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  is_enabled = EXCLUDED.is_enabled,
  system_prompt = EXCLUDED.system_prompt,
  updated_at = now();