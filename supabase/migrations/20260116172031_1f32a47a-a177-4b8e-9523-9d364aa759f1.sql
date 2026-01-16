-- Adicionar configurações faltando: image_analysis, medical_exam_analysis, simple_messages (Ollama)
INSERT INTO ai_configurations (functionality, service, model, max_tokens, temperature, is_enabled, level, personality, system_prompt)
VALUES 
  ('image_analysis', 'lovable', 'google/gemini-2.5-flash', 2048, 0.7, true, 'maximo', 'sofia', 'Você é a Sofia. Analise imagens de forma detalhada e forneça insights úteis sobre nutrição e saúde.'),
  ('medical_exam_analysis', 'lovable', 'google/gemini-2.5-pro', 4096, 0.5, true, 'maximo', 'drvital', 'Você é o Dr. Vital. Extraia e analise dados de exames médicos com precisão e segurança.'),
  ('simple_messages', 'ollama', 'llama3.2:3b', 512, 0.7, true, 'minimo', 'sofia', 'Você é a Sofia. Responda mensagens simples de forma amigável e calorosa.')
ON CONFLICT (functionality) DO UPDATE SET
  service = EXCLUDED.service,
  model = EXCLUDED.model,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  is_enabled = EXCLUDED.is_enabled,
  level = EXCLUDED.level,
  personality = EXCLUDED.personality,
  system_prompt = EXCLUDED.system_prompt,
  updated_at = now();