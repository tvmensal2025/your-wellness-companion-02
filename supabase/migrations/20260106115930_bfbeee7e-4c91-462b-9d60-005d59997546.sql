
-- Adicionar campo target_audience para segmentação de público
ALTER TABLE exercises_library 
ADD COLUMN IF NOT EXISTS target_audience TEXT[];

-- Atualizar exercícios existentes do Aurélio Alfieri com age_appropriate mais inclusivo
UPDATE exercises_library 
SET age_appropriate = ARRAY['adult', 'middle', 'senior'],
    target_audience = ARRAY['idosos', 'iniciantes', 'sedentarios']
WHERE youtube_channel = 'Aurélio Alfieri';

-- INSERIR NOVOS EXERCÍCIOS: CAMINHADA EM CASA
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, age_appropriate, target_audience, tags) VALUES
('Caminhada Queima Barriga 30min', 'funcional', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=k9lQVTc3ijs', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['mulheres_50_mais', 'iniciantes', 'emagrecer'], ARRAY['caminhada', 'sem_impacto', 'queima_gordura']),
('Caminhada 5000 Passos Nível 3-4', 'funcional', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=CbAIoZx-Kx8', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['intermediario', 'emagrecer'], ARRAY['caminhada', 'sem_impacto', 'cardio']),
('Caminhada 10000 Passos Nível 3-4', 'funcional', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=HipZs4QIOpw', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['intermediario', 'emagrecer'], ARRAY['caminhada', 'sem_impacto', 'cardio']),
('Caminhada Emagrecer 30min', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=DnOz6Zc0LRc', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['iniciantes', 'mulheres_50_mais', 'emagrecer'], ARRAY['caminhada', 'sem_impacto', 'queima_gordura']),
('Caminhada Emagrecer Rápido 20min', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=xqSsnkB08qM', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['iniciantes', 'emagrecer'], ARRAY['caminhada', 'sem_impacto', 'queima_gordura']),
('Caminhada Iniciantes Super Fácil', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=DkOctBqJJlI', 'Aurélio Alfieri', 'professional', ARRAY['middle', 'senior'], ARRAY['idosos', 'sedentarios', 'iniciantes'], ARRAY['caminhada', 'sem_impacto', 'basico']);

-- INSERIR NOVOS EXERCÍCIOS: TREINOS NA CADEIRA
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, age_appropriate, target_audience, special_condition, tags) VALUES
('Aula Completa Sentado Cadeira Nível 1', 'funcional', 'facil', 'casa', ARRAY['cadeira'], 'https://www.youtube.com/watch?v=fq3usJz2uEw', 'Aurélio Alfieri', 'professional', ARRAY['senior'], ARRAY['idosos', 'mobilidade_reduzida'], 'mobilidade_reduzida', ARRAY['cadeira', 'sem_impacto', 'sentado']),
('Exercícios Sentado Cadeira Nível 2', 'funcional', 'facil', 'casa', ARRAY['cadeira'], 'https://www.youtube.com/watch?v=4zewRp7bmvs', 'Aurélio Alfieri', 'professional', ARRAY['middle', 'senior'], ARRAY['idosos', 'sedentarios'], 'mobilidade_reduzida', ARRAY['cadeira', 'sem_impacto', 'sentado']),
('Queimar Calorias Sentado Cadeira', 'funcional', 'facil', 'casa', ARRAY['cadeira'], 'https://www.youtube.com/watch?v=GJtu-U90vuQ', 'Aurélio Alfieri', 'professional', ARRAY['senior'], ARRAY['idosos', 'mobilidade_reduzida', 'emagrecer'], 'mobilidade_reduzida', ARRAY['cadeira', 'sem_impacto', 'sentado', 'queima_gordura']),
('Fortalecer Pernas com Cadeira 15min', 'pernas', 'facil', 'casa', ARRAY['cadeira'], 'https://www.youtube.com/watch?v=ASI7xPgDI2M', 'Aurélio Alfieri', 'professional', ARRAY['middle', 'senior'], ARRAY['mulheres_50_mais', 'idosos'], NULL, ARRAY['cadeira', 'sem_impacto', 'pernas']),
('Exercícios Fáceis Especial Alzheimer', 'funcional', 'facil', 'casa', ARRAY['cadeira'], 'https://www.youtube.com/watch?v=g4HpK7vd1VI', 'Aurélio Alfieri', 'professional', ARRAY['senior'], ARRAY['idosos', 'mobilidade_reduzida'], 'mobilidade_reduzida', ARRAY['cadeira', 'sem_impacto', 'cognitivo']);

-- INSERIR NOVOS EXERCÍCIOS: TREINOS NA CAMA
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, age_appropriate, target_audience, special_condition, tags) VALUES
('Exercícios Idosos na Cama Nível 1', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=2u3VMYDxKuk', 'Aurélio Alfieri', 'professional', ARRAY['senior'], ARRAY['idosos', 'mobilidade_reduzida'], 'mobilidade_reduzida', ARRAY['cama', 'deitado', 'sem_impacto']),
('Treino Fácil Deitado na Cama', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=uD-DdWGLyLU', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['iniciantes', 'sedentarios'], NULL, ARRAY['cama', 'deitado', 'sem_impacto', 'manha']);

-- INSERIR NOVOS EXERCÍCIOS: FORTALECIMENTO ESPECÍFICO
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, age_appropriate, target_audience, gender_focus, tags) VALUES
('Solução Pernas Flácidas', 'pernas', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=vP9HL3Ax2XI', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['mulheres_50_mais'], 'female', ARRAY['pernas', 'flacidez', 'tonificacao']),
('Ginástica Braços com Peso 2kg', 'bracos', 'facil', 'casa', ARRAY['halteres'], 'https://www.youtube.com/watch?v=pLI9ddWH2mA', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['iniciantes', 'mulheres_50_mais'], 'female', ARRAY['bracos', 'halteres', 'tonificacao']),
('Solução Braço Mole Tríceps', 'triceps', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=bcBBMriW_40', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['mulheres_50_mais'], 'female', ARRAY['triceps', 'flacidez', 'bracos']),
('Desafio da Parede 15min', 'funcional', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=v2A7RDuDPZQ', 'Aurélio Alfieri', 'professional', ARRAY['young', 'adult', 'middle', 'senior'], ARRAY['iniciantes', 'intermediario'], 'neutral', ARRAY['parede', 'funcional', 'desafio']),
('Treino Bumbum e Barriga Casa', 'gluteos', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=N8mbKkOOd7g', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['mulheres_50_mais'], 'female', ARRAY['gluteos', 'abdomen', 'tonificacao']),
('Ombros e Braços Sem Impacto Nível 1', 'ombros', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=-EvsDX_8afI', 'Aurélio Alfieri', 'professional', ARRAY['middle', 'senior'], ARRAY['idosos', 'iniciantes'], 'neutral', ARRAY['ombros', 'bracos', 'sem_impacto']),
('Recuperar Músculos Mulheres +50', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=h_NHMJ9E3Po', 'Aurélio Alfieri', 'professional', ARRAY['middle', 'senior'], ARRAY['mulheres_50_mais'], 'female', ARRAY['funcional', 'tonificacao', 'recuperacao']);

-- INSERIR NOVOS EXERCÍCIOS: ALONGAMENTO E MOBILIDADE
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, age_appropriate, target_audience, tags) VALUES
('Alongamento Dinâmico Mobilidade', 'mobilidade', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=F1iejoRbRts', 'Aurélio Alfieri', 'professional', ARRAY['young', 'adult', 'middle', 'senior'], ARRAY['iniciantes', 'sedentarios'], ARRAY['alongamento', 'mobilidade', 'flexibilidade']),
('Alongamento Fácil Completo Nível 3', 'mobilidade', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=xOCh5HJMsZ8', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['iniciantes', 'sedentarios'], ARRAY['alongamento', 'completo', 'flexibilidade']),
('Alongamento Sentado no Chão', 'mobilidade', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=HKlTrGdgI7A', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['iniciantes', 'sedentarios'], ARRAY['alongamento', 'sentado', 'flexibilidade']),
('Solução Postura Fácil em Casa', 'mobilidade', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=caYcY3LHEKU', 'Aurélio Alfieri', 'professional', ARRAY['young', 'adult', 'middle', 'senior'], ARRAY['mulheres_50_mais', 'trabalho_sentado'], ARRAY['postura', 'coluna', 'correcao']),
('Alongamento Coluna Lombar Nível 3-4', 'coluna', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=QEzj6OMR3t8', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['dor_coluna'], ARRAY['coluna', 'lombar', 'alongamento']),
('Melhor Alongamento Coluna Ao Vivo', 'coluna', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=iIQvwaUsMbU', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['dor_coluna', 'iniciantes'], ARRAY['coluna', 'alongamento', 'alivio']);

-- INSERIR NOVOS EXERCÍCIOS: BARRIGA E CORE
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, age_appropriate, target_audience, gender_focus, tags) VALUES
('Treino Rápido Desinchar Barriga 10min', 'abdomen', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=jBlS3CzQgfg', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['mulheres_50_mais', 'emagrecer'], 'female', ARRAY['abdomen', 'barriga', 'rapido']),
('Exercícios Fáceis Diminuir Barriga 30min', 'abdomen', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=ffe_w9GdCzY', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['mulheres_50_mais', 'emagrecer'], 'female', ARRAY['abdomen', 'barriga', 'queima_gordura']);

-- INSERIR NOVOS EXERCÍCIOS: EQUILÍBRIO E DOR
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, age_appropriate, target_audience, special_condition, tags) VALUES
('Exercícios Equilíbrio Idosos Completo', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=W2EucDEc9Pg', 'Aurélio Alfieri', 'professional', ARRAY['senior'], ARRAY['idosos', 'prevencao_quedas'], NULL, ARRAY['equilibrio', 'prevencao', 'seguranca']),
('Exercícios Dor no Quadril', 'mobilidade', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=hSv2tuKVWaY', 'Aurélio Alfieri', 'professional', ARRAY['adult', 'middle', 'senior'], ARRAY['dor_quadril'], 'dor_quadril', ARRAY['quadril', 'dor', 'alivio', 'mobilidade']);

-- Criar índice para target_audience
CREATE INDEX IF NOT EXISTS idx_exercises_target_audience ON exercises_library USING GIN(target_audience);
