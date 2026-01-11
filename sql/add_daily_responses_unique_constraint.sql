-- Adicionar constraint única para evitar duplicatas em daily_responses
-- Isso permite usar UPSERT corretamente

-- Primeiro, remover duplicatas existentes (manter a mais recente)
DELETE FROM daily_responses a
USING daily_responses b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.date = b.date
  AND a.question_id = b.question_id;

-- Criar constraint única
ALTER TABLE daily_responses
ADD CONSTRAINT daily_responses_user_date_question_unique 
UNIQUE (user_id, date, question_id);

-- Verificar
SELECT 
  conname as constraint_name,
  contype as type
FROM pg_constraint 
WHERE conrelid = 'daily_responses'::regclass;
