-- Adicionar campos de recursos e quiz na tabela lessons
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS quiz_questions JSONB DEFAULT NULL;

-- Comentários para documentar os campos
COMMENT ON COLUMN public.lessons.resources IS 'Lista de materiais para download: [{"title": "Nome", "url": "link", "type": "pdf|doc|video"}]';
COMMENT ON COLUMN public.lessons.quiz_questions IS 'Perguntas do quiz: {"questions": [{"question": "?", "options": ["A","B","C","D"], "correct": 0}]}';