-- ============================================
-- SCRIPT DE TESTE: Integração Mealie
-- ============================================
-- Descrição: Script para criar dados de teste e validar a integração
-- Uso: Executar no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. VERIFICAR TABELA CRIADA
-- ============================================
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'shopping_lists'
ORDER BY ordinal_position;

-- ============================================
-- 2. VERIFICAR POLICIES (RLS)
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'shopping_lists';

-- ============================================
-- 3. DESCOBRIR SEU USER_ID
-- ============================================
-- Substitua 'seu@email.com' pelo seu email real
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email = 'seu@email.com';

-- Copie o user_id retornado e use nas queries abaixo

-- ============================================
-- 4. CRIAR REFEIÇÕES DE TESTE (SEMANA ATUAL)
-- ============================================
-- IMPORTANTE: Substitua 'USER_ID_AQUI' pelo seu user_id real

-- Calcular datas da semana atual
WITH week_dates AS (
  SELECT 
    date_trunc('week', CURRENT_DATE)::date as week_start,
    (date_trunc('week', CURRENT_DATE) + interval '6 days')::date as week_end
)
SELECT 
  week_start as domingo,
  week_start + 1 as segunda,
  week_start + 2 as terca,
  week_start + 3 as quarta,
  week_start + 4 as quinta,
  week_start + 5 as sexta,
  week_start + 6 as sabado
FROM week_dates;

-- DOMINGO (vazio - para testar status "empty")
-- Não inserir nada

-- SEGUNDA-FEIRA (completo - 4 refeições)
INSERT INTO sofia_food_analysis (
  user_id,
  meal_type,
  total_calories,
  total_protein,
  total_carbs,
  total_fat,
  foods_detected,
  image_url,
  created_at
) VALUES
  -- Café
  ('USER_ID_AQUI', 'breakfast', 400, 25, 35, 12, 
   '[{"nome": "Omelete de 3 ovos", "quantidade": 150, "unidade": "g"}, {"nome": "Pão integral", "quantidade": 50, "unidade": "g"}, {"nome": "Café com leite", "quantidade": 200, "unidade": "ml"}]',
   'https://example.com/breakfast.jpg',
   (date_trunc('week', CURRENT_DATE) + interval '1 day' + interval '7 hours')),
  
  -- Almoço
  ('USER_ID_AQUI', 'lunch', 600, 45, 50, 15,
   '[{"nome": "Frango grelhado", "quantidade": 200, "unidade": "g"}, {"nome": "Arroz integral", "quantidade": 100, "unidade": "g"}, {"nome": "Feijão preto", "quantidade": 80, "unidade": "g"}, {"nome": "Salada verde", "quantidade": 100, "unidade": "g"}]',
   'https://example.com/lunch.jpg',
   (date_trunc('week', CURRENT_DATE) + interval '1 day' + interval '12 hours 30 minutes')),
  
  -- Lanche
  ('USER_ID_AQUI', 'snack', 200, 15, 25, 5,
   '[{"nome": "Iogurte grego", "quantidade": 150, "unidade": "g"}, {"nome": "Banana", "quantidade": 100, "unidade": "g"}]',
   'https://example.com/snack.jpg',
   (date_trunc('week', CURRENT_DATE) + interval '1 day' + interval '16 hours')),
  
  -- Jantar
  ('USER_ID_AQUI', 'dinner', 500, 35, 40, 18,
   '[{"nome": "Salmão assado", "quantidade": 150, "unidade": "g"}, {"nome": "Batata doce", "quantidade": 150, "unidade": "g"}, {"nome": "Brócolis", "quantidade": 100, "unidade": "g"}]',
   'https://example.com/dinner.jpg',
   (date_trunc('week', CURRENT_DATE) + interval '1 day' + interval '19 hours 30 minutes'));

-- TERÇA-FEIRA (completo - 4 refeições)
INSERT INTO sofia_food_analysis (
  user_id,
  meal_type,
  total_calories,
  total_protein,
  total_carbs,
  total_fat,
  foods_detected,
  created_at
) VALUES
  ('USER_ID_AQUI', 'breakfast', 380, 22, 38, 11,
   '[{"nome": "Ovos mexidos", "quantidade": 120, "unidade": "g"}, {"nome": "Aveia", "quantidade": 50, "unidade": "g"}, {"nome": "Leite", "quantidade": 200, "unidade": "ml"}]',
   (date_trunc('week', CURRENT_DATE) + interval '2 days' + interval '7 hours 15 minutes')),
  
  ('USER_ID_AQUI', 'lunch', 650, 48, 55, 16,
   '[{"nome": "Carne moída", "quantidade": 150, "unidade": "g"}, {"nome": "Macarrão integral", "quantidade": 100, "unidade": "g"}, {"nome": "Molho de tomate", "quantidade": 80, "unidade": "g"}]',
   (date_trunc('week', CURRENT_DATE) + interval '2 days' + interval '12 hours 45 minutes')),
  
  ('USER_ID_AQUI', 'snack', 180, 12, 22, 4,
   '[{"nome": "Queijo branco", "quantidade": 50, "unidade": "g"}, {"nome": "Maçã", "quantidade": 120, "unidade": "g"}]',
   (date_trunc('week', CURRENT_DATE) + interval '2 days' + interval '16 hours 30 minutes')),
  
  ('USER_ID_AQUI', 'dinner', 520, 38, 42, 19,
   '[{"nome": "Tilápia grelhada", "quantidade": 180, "unidade": "g"}, {"nome": "Arroz integral", "quantidade": 100, "unidade": "g"}, {"nome": "Legumes", "quantidade": 150, "unidade": "g"}]',
   (date_trunc('week', CURRENT_DATE) + interval '2 days' + interval '19 hours'));

-- QUARTA-FEIRA (parcial - 2 refeições)
INSERT INTO sofia_food_analysis (
  user_id,
  meal_type,
  total_calories,
  total_protein,
  total_carbs,
  total_fat,
  foods_detected,
  created_at
) VALUES
  ('USER_ID_AQUI', 'breakfast', 350, 20, 40, 10,
   '[{"nome": "Tapioca", "quantidade": 100, "unidade": "g"}, {"nome": "Queijo", "quantidade": 50, "unidade": "g"}]',
   (date_trunc('week', CURRENT_DATE) + interval '3 days' + interval '7 hours')),
  
  ('USER_ID_AQUI', 'lunch', 580, 42, 48, 14,
   '[{"nome": "Frango desfiado", "quantidade": 180, "unidade": "g"}, {"nome": "Batata", "quantidade": 150, "unidade": "g"}]',
   (date_trunc('week', CURRENT_DATE) + interval '3 days' + interval '13 hours'));

-- QUINTA-FEIRA (parcial - 1 refeição)
INSERT INTO sofia_food_analysis (
  user_id,
  meal_type,
  total_calories,
  total_protein,
  total_carbs,
  total_fat,
  foods_detected,
  created_at
) VALUES
  ('USER_ID_AQUI', 'breakfast', 420, 28, 36, 13,
   '[{"nome": "Panqueca de aveia", "quantidade": 150, "unidade": "g"}, {"nome": "Mel", "quantidade": 20, "unidade": "g"}]',
   (date_trunc('week', CURRENT_DATE) + interval '4 days' + interval '7 hours 30 minutes'));

-- SEXTA, SÁBADO (vazios - para testar status "empty")
-- Não inserir nada

-- ============================================
-- 5. VERIFICAR DADOS INSERIDOS
-- ============================================
-- Ver refeições da semana atual
SELECT 
  DATE(created_at) as dia,
  meal_type,
  total_calories,
  array_length(foods_detected, 1) as num_alimentos,
  created_at
FROM sofia_food_analysis
WHERE user_id = 'USER_ID_AQUI'
  AND created_at >= date_trunc('week', CURRENT_DATE)
  AND created_at < date_trunc('week', CURRENT_DATE) + interval '7 days'
ORDER BY created_at;

-- Contar refeições por dia
SELECT 
  DATE(created_at) as dia,
  COUNT(*) as total_refeicoes,
  SUM(total_calories) as total_calorias
FROM sofia_food_analysis
WHERE user_id = 'USER_ID_AQUI'
  AND created_at >= date_trunc('week', CURRENT_DATE)
  AND created_at < date_trunc('week', CURRENT_DATE) + interval '7 days'
GROUP BY DATE(created_at)
ORDER BY dia;

-- ============================================
-- 6. TESTAR GERAÇÃO DE LISTA DE COMPRAS
-- ============================================
-- Extrair todos os ingredientes da semana
WITH week_meals AS (
  SELECT 
    user_id,
    jsonb_array_elements(foods_detected::jsonb) as food
  FROM sofia_food_analysis
  WHERE user_id = 'USER_ID_AQUI'
    AND created_at >= date_trunc('week', CURRENT_DATE)
    AND created_at < date_trunc('week', CURRENT_DATE) + interval '7 days'
)
SELECT 
  food->>'nome' as ingrediente,
  SUM((food->>'quantidade')::numeric) as quantidade_total,
  food->>'unidade' as unidade,
  COUNT(*) as vezes_usado
FROM week_meals
GROUP BY food->>'nome', food->>'unidade'
ORDER BY vezes_usado DESC, ingrediente;

-- ============================================
-- 7. CRIAR LISTA DE COMPRAS MANUALMENTE (TESTE)
-- ============================================
INSERT INTO shopping_lists (
  user_id,
  week_start,
  week_end,
  items,
  sent_to_whatsapp
) VALUES (
  'USER_ID_AQUI',
  date_trunc('week', CURRENT_DATE)::date,
  (date_trunc('week', CURRENT_DATE) + interval '6 days')::date,
  '[
    {"name": "Frango (peito)", "quantity": 380, "unit": "g", "category": "Proteínas", "checked": false},
    {"name": "Salmão (filé)", "quantity": 150, "unit": "g", "category": "Proteínas", "checked": false},
    {"name": "Ovos", "quantity": 6, "unit": "unidades", "category": "Proteínas", "checked": false},
    {"name": "Arroz integral", "quantity": 200, "unit": "g", "category": "Grãos e Cereais", "checked": false},
    {"name": "Aveia", "quantity": 50, "unit": "g", "category": "Grãos e Cereais", "checked": false},
    {"name": "Batata doce", "quantity": 150, "unit": "g", "category": "Tubérculos", "checked": false},
    {"name": "Brócolis", "quantity": 100, "unit": "g", "category": "Vegetais", "checked": false},
    {"name": "Banana", "quantity": 100, "unit": "g", "category": "Frutas", "checked": false},
    {"name": "Iogurte grego", "quantity": 150, "unit": "g", "category": "Laticínios", "checked": false}
  ]'::jsonb,
  false
);

-- Verificar lista criada
SELECT 
  id,
  week_start,
  week_end,
  jsonb_array_length(items) as total_items,
  sent_to_whatsapp,
  created_at
FROM shopping_lists
WHERE user_id = 'USER_ID_AQUI'
ORDER BY created_at DESC
LIMIT 1;

-- Ver itens da lista
SELECT 
  jsonb_array_elements(items)->>'name' as item,
  jsonb_array_elements(items)->>'quantity' as quantidade,
  jsonb_array_elements(items)->>'unit' as unidade,
  jsonb_array_elements(items)->>'category' as categoria
FROM shopping_lists
WHERE user_id = 'USER_ID_AQUI'
ORDER BY created_at DESC
LIMIT 1;

-- ============================================
-- 8. LIMPAR DADOS DE TESTE (SE NECESSÁRIO)
-- ============================================
-- CUIDADO: Isso vai deletar TODOS os dados de teste!
-- Descomente apenas se quiser limpar

-- DELETE FROM shopping_lists WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM sofia_food_analysis 
-- WHERE user_id = 'USER_ID_AQUI' 
--   AND created_at >= date_trunc('week', CURRENT_DATE);

-- ============================================
-- 9. VERIFICAR PERFORMANCE
-- ============================================
-- Analisar query plan
EXPLAIN ANALYZE
SELECT *
FROM sofia_food_analysis
WHERE user_id = 'USER_ID_AQUI'
  AND created_at >= date_trunc('week', CURRENT_DATE)
  AND created_at < date_trunc('week', CURRENT_DATE) + interval '7 days';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Próximos passos:
-- 1. Aplicar migration: 20260117150000_create_shopping_lists.sql
-- 2. Executar este script substituindo USER_ID_AQUI
-- 3. Abrir app e verificar card semanal
-- 4. Clicar em um dia e ver detalhes
-- 5. Gerar lista de compras
-- ============================================
