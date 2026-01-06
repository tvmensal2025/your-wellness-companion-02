-- ============================================
-- FASE 1: Adicionar novos campos na tabela
-- ============================================
ALTER TABLE exercises_library 
ADD COLUMN IF NOT EXISTS youtube_channel TEXT,
ADD COLUMN IF NOT EXISTS youtube_quality TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS gender_focus TEXT DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS age_appropriate TEXT[] DEFAULT ARRAY['young', 'adult', 'middle', 'senior'],
ADD COLUMN IF NOT EXISTS special_condition TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- ============================================
-- FASE 2: Atualizar URLs existentes com videos profissionais
-- ============================================

-- PEITO
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=EZMYCLKuGow', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%supino reto%barra%' OR LOWER(name) = 'supino reto';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=WP1VLAt8hbM', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%supino inclinado%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=b_WvXDvPkd8', youtube_channel = 'Renato Cariani', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%crucifixo%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=WGXWKEj66C8', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%cross%over%' OR LOWER(name) LIKE '%crossover%';

-- COSTAS
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=9FFLBDWXSZA', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%puxada frontal%' OR LOWER(name) LIKE '%puxada aberta%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=HpvaOR4H5Hg', youtube_channel = 'Laércio Refundini', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%remada curvada%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=UB6fhWvB4dY', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%barra fixa%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=tm0IywBhIYM', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%remada unilateral%' OR LOWER(name) LIKE '%remada serrote%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=vB5OHsJ3EME', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%remada cavalinho%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=lw9d2W47ZOQ', youtube_channel = 'Laércio Refundini', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%puxada supinada%';

-- OMBROS
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=EuQAfhXBEvs', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%desenvolvimento%' AND muscle_group = 'ombros';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=IwWvZ0rlNXs', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%eleva%lateral%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=Q7K6DI9R-A8', youtube_channel = 'Treino Mestre', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%eleva%frontal%';

-- BICEPS
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=Q8TqfD8E7BU', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%rosca direta%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=EEpvOQAAtRo', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%rosca concentrada%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=Q8TqfD8E7BU', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%rosca martelo%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=COn-YdNClSA', youtube_channel = 'Treino Mestre', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%rosca 21%';

-- TRICEPS
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=dTqDKC0D6P4', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%tr%ceps pulley%' OR LOWER(name) LIKE '%tr%ceps polia%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=EHe8HBIPdGU', youtube_channel = 'Laércio Refundini', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%tr%ceps corda%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=OIoEiCKBS50', youtube_channel = 'Renato Cariani', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%tr%ceps testa%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=BmNjWW4G1Dc', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%mergulho%tr%ceps%' OR LOWER(name) LIKE '%paralelas%';

-- PERNAS - QUADRICEPS
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=zgk71dUUt0Y', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%agachamento livre%' OR (LOWER(name) = 'agachamento' AND location = 'academia');
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=xczGwAyCn74', youtube_channel = 'Laércio Refundini', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%leg press%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=p8xQJHqD5ug', youtube_channel = 'Laércio Refundini', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%cadeira extensora%' OR LOWER(name) LIKE '%extensor%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=9j8IHdic0F0', youtube_channel = 'Laércio Refundini', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%agachamento hack%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=IGf9fR4Y7Iw', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%agachamento b%lgaro%' OR LOWER(name) LIKE '%afundo b%lgaro%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=u1E3_u2gJYE', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%stiff%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=uv3urTpBku0', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%cadeira flexora%' OR LOWER(name) LIKE '%flexora%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=pTUfuTLoTQU', youtube_channel = 'Laércio Refundini', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%mesa flexora%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=8m44I0bQ7Y4', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%levantamento terra%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=2lPqKwHi7A8', youtube_channel = 'Leandro Twin', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%panturrilha%' OR LOWER(name) LIKE '%gêmeos%';

-- GLUTEOS - Tay Training
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=IW-xVGlldho', youtube_channel = 'Tay Training', youtube_quality = 'professional', gender_focus = 'female' WHERE LOWER(name) LIKE '%eleva%pélvica%' OR LOWER(name) LIKE '%eleva%pelvica%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=V4A0QrhcBLk', youtube_channel = 'Tay Training', youtube_quality = 'professional', gender_focus = 'female' WHERE LOWER(name) LIKE '%agachamento sum%' OR LOWER(name) LIKE '%sumo%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=WtdMt00Ctg8', youtube_channel = 'Tay Training', youtube_quality = 'professional', gender_focus = 'female' WHERE LOWER(name) LIKE '%gl%teo%polia%' OR LOWER(name) LIKE '%gl%teo%cabo%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=2ryaLFz07z8', youtube_channel = 'Tay Training', youtube_quality = 'professional', gender_focus = 'female' WHERE LOWER(name) LIKE '%hip thrust%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=zbN3mChHGDI', youtube_channel = 'Tay Training', youtube_quality = 'professional', gender_focus = 'female' WHERE LOWER(name) LIKE '%cadeira abdutora%' OR LOWER(name) LIKE '%abdutora%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=6jS6aH-78w4', youtube_channel = 'Tay Training', youtube_quality = 'professional', gender_focus = 'female' WHERE LOWER(name) LIKE '%ponte gl%teo%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=LV2ZIXv0lqI', youtube_channel = 'Tay Training', youtube_quality = 'professional', gender_focus = 'female' WHERE LOWER(name) LIKE '%cadeira adutora%' OR LOWER(name) LIKE '%adutora%';

-- CASA - Masculino (Sérgio Bertoluci)
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=J32bEKmnBaw', youtube_channel = 'Sérgio Bertoluci', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%flex%o de bra%os%' AND location = 'casa';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=J32bEKmnBaw', youtube_channel = 'Sérgio Bertoluci', youtube_quality = 'professional' WHERE LOWER(name) = 'agachamento' AND location = 'casa';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=J32bEKmnBaw', youtube_channel = 'Sérgio Bertoluci', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%afundo%' AND location = 'casa';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=J32bEKmnBaw', youtube_channel = 'Sérgio Bertoluci', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%prancha%' AND location = 'casa';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=hWeWg2yvC_Y', youtube_channel = 'Sérgio Bertoluci', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%burpee%';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=MKkxEifgGCY', youtube_channel = 'Sérgio Bertoluci', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%mountain climber%';

-- ABDOMEN
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=v6rKhWEeEwg', youtube_channel = 'CHASE Brasil', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%abdominal%' AND location = 'casa';
UPDATE exercises_library SET youtube_url = 'https://www.youtube.com/watch?v=9n2jdWdDbl4', youtube_channel = 'Aurélio Alfieri', youtube_quality = 'professional' WHERE LOWER(name) LIKE '%abdominal%infra%';

-- ============================================
-- FASE 3: Inserir NOVOS exercícios
-- ============================================

-- IDOSOS (Aurélio Alfieri) - 12 exercícios
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, age_appropriate, description)
VALUES 
('Ginástica Completa Idosos Nível 1', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=9cKe2I-Ta14', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Treino completo e seguro para idosos iniciantes, foco em mobilidade e força básica'),
('Ginástica Sentado na Cadeira', 'funcional', 'facil', 'casa', ARRAY['cadeira'], 'https://www.youtube.com/watch?v=Hxi_y9l9O6s', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Exercícios seguros realizados sentado, ideal para quem tem dificuldade de equilíbrio'),
('Treino Completo Terceira Idade', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=uSpTUFH5Nn4', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Programa completo de fortalecimento para terceira idade'),
('Caminhada em Casa 15min Idosos', 'aquecimento', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=DkOctBqJJlI', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Caminhada estacionária leve de 15 minutos para idosos'),
('Ginástica Fácil Sem Impacto 15min', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=3MNqTF0d0tQ', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Exercícios de baixo impacto para proteger articulações'),
('Ginástica Completa Mulheres Idosas', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=3JpxQlMt3ck', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Programa específico para mulheres da terceira idade'),
('Fortalecer Barriga Sem Impacto', 'abdomen', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=9n2jdWdDbl4', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Fortalecimento abdominal seguro para idosos'),
('Exercícios Aliviar Dor Joelho', 'mobilidade', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=Y5vpelp8-ww', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Exercícios terapêuticos para aliviar dor nos joelhos'),
('Alongamento Idosos Completo', 'mobilidade', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=w-xVyiEI9AA', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Rotina completa de alongamento para terceira idade'),
('Equilíbrio e Fortalecimento Idosos', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=uSpTUFH5Nn4', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Exercícios para melhorar equilíbrio e prevenir quedas'),
('Marcha Estacionária Suave', 'aquecimento', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=DkOctBqJJlI', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Marcha no lugar com movimentos controlados'),
('Ginástica com Bastão Idosos', 'funcional', 'facil', 'casa', ARRAY['bastão'], 'https://www.youtube.com/watch?v=w-xVyiEI9AA', 'Aurélio Alfieri', 'professional', ARRAY['senior'], 'Exercícios com bastão para mobilidade de ombros e costas')
ON CONFLICT DO NOTHING;

-- GESTANTES - 10 exercícios
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, special_condition, age_appropriate, description)
VALUES 
('Treino Gestante Corpo Todo', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=ZkBUYXOORfk', 'Gizele Monteiro', 'professional', 'gestante', ARRAY['young', 'adult', 'middle'], 'Treino completo e seguro para gestantes'),
('Treino Gestante Carol Borba', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=3RssxPFS_io', 'Carol Borba', 'professional', 'gestante', ARRAY['young', 'adult', 'middle'], 'Exercícios seguros para grávidas com Carol Borba'),
('Mobilidade Pélvica Gestante', 'mobilidade', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=ZkBUYXOORfk', 'Gizele Monteiro', 'professional', 'gestante', ARRAY['young', 'adult', 'middle'], 'Exercícios para mobilidade pélvica durante a gravidez'),
('Fortalecimento Core Gestante', 'abdomen', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=ZkBUYXOORfk', 'Gizele Monteiro', 'professional', 'gestante', ARRAY['young', 'adult', 'middle'], 'Fortalecimento seguro do core para gestantes'),
('Elevação Pélvica Gestante', 'gluteos', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=ZkBUYXOORfk', 'Gizele Monteiro', 'professional', 'gestante', ARRAY['young', 'adult', 'middle'], 'Elevação pélvica adaptada para gestantes'),
('Alongamento Gestante Completo', 'mobilidade', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=ZkBUYXOORfk', 'Gizele Monteiro', 'professional', 'gestante', ARRAY['young', 'adult', 'middle'], 'Alongamento completo e seguro para gestantes'),
('Exercício Kegel Assoalho Pélvico', 'funcional', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=ZkBUYXOORfk', 'Gizele Monteiro', 'professional', 'gestante', ARRAY['young', 'adult', 'middle'], 'Fortalecimento do assoalho pélvico para gestantes'),
('Respiração e Relaxamento Gestante', 'mobilidade', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=ZkBUYXOORfk', 'Gizele Monteiro', 'professional', 'gestante', ARRAY['young', 'adult', 'middle'], 'Técnicas de respiração e relaxamento para gestantes'),
('Agachamento Suave Gestante', 'pernas', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=3RssxPFS_io', 'Carol Borba', 'professional', 'gestante', ARRAY['young', 'adult', 'middle'], 'Agachamento adaptado e seguro para gestantes'),
('Caminhada Leve Gestante', 'aquecimento', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=3RssxPFS_io', 'Carol Borba', 'professional', 'gestante', ARRAY['young', 'adult', 'middle'], 'Caminhada estacionária leve para gestantes')
ON CONFLICT DO NOTHING;

-- GLUTEOS FEMININO (Tay Training / Carol Borba) - 8 exercícios
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, gender_focus, description)
VALUES 
('Treino Empinar Glúteo Completo', 'gluteos', 'medio', 'academia', ARRAY['aparelhos'], 'https://www.youtube.com/watch?v=Qjf3cd4wYDI', 'Tay Training', 'professional', 'female', 'Treino focado em empinar e definir glúteos'),
('Levantamento Terra Sumô Glúteo', 'gluteos', 'medio', 'academia', ARRAY['barra'], 'https://www.youtube.com/watch?v=8486w8A9r9c', 'Tay Training', 'professional', 'female', 'Levantamento terra sumô com foco em glúteos'),
('Treino Glúteo 30 Dias Casa', 'gluteos', 'facil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=8m7_LUVKsIk', 'Tay Training', 'professional', 'female', 'Programa de 30 dias para glúteos em casa'),
('Explode Glúteos Mini Band', 'gluteos', 'medio', 'casa', ARRAY['mini band'], 'https://www.youtube.com/watch?v=7DTHDIrBqpk', 'Carol Borba', 'professional', 'female', 'Treino intenso de glúteos com mini band'),
('Endurecer Glúteos 20min', 'gluteos', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=lEz5yMKM760', 'Carol Borba', 'professional', 'female', 'Rotina de 20 minutos para endurecer glúteos'),
('Rotina Pernas e Glúteos Casa', 'gluteos', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=cBe6TlpiSUI', 'Carol Borba', 'professional', 'female', 'Treino completo de pernas e glúteos em casa'),
('Ativação Glúteo Pré-Treino', 'gluteos', 'facil', 'academia', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=XzgMREI_7Tk', 'Tay Training', 'professional', 'female', 'Ativação de glúteos antes do treino principal'),
('Divisão Treino Perna Glúteo', 'gluteos', 'medio', 'academia', ARRAY['aparelhos'], 'https://www.youtube.com/watch?v=LV2ZIXv0lqI', 'Tay Training', 'professional', 'female', 'Como dividir treino de pernas focando em glúteos')
ON CONFLICT DO NOTHING;

-- HIIT/CARDIO (CHASE Brasil) - 8 exercícios
INSERT INTO exercises_library (name, muscle_group, difficulty, location, equipment_needed, youtube_url, youtube_channel, youtube_quality, tags, description)
VALUES 
('HIIT Cardio Intenso 30min', 'funcional', 'dificil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=gI5mwlLYI6s', 'CHASE Brasil', 'professional', ARRAY['hiit', 'cardio', 'queima_gordura'], 'Treino HIIT intenso de 30 minutos para queima máxima'),
('HIIT Queima 600 Calorias 27min', 'funcional', 'dificil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=ulNZFpJEkTE', 'CHASE Brasil', 'professional', ARRAY['hiit', 'cardio', 'queima_gordura'], 'HIIT para queimar aproximadamente 600 calorias'),
('HIIT Barriga 23min', 'abdomen', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=gp9mampRZrw', 'CHASE Brasil', 'professional', ARRAY['hiit', 'cardio', 'abdomen'], 'HIIT focado em abdômen e core'),
('HIIT Intenso 40min 800 Calorias', 'funcional', 'dificil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=Yu1JZsOxRbA', 'CHASE Brasil', 'professional', ARRAY['hiit', 'cardio', 'queima_gordura'], 'Mega treino HIIT de 40 minutos'),
('HIIT Iniciantes 17min', 'funcional', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=a8taWxTMTJc', 'CHASE Brasil', 'professional', ARRAY['hiit', 'cardio', 'iniciante'], 'HIIT adaptado para iniciantes'),
('HIIT 25min 500 Calorias', 'funcional', 'medio', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=gA8m91Ja_Gg', 'CHASE Brasil', 'professional', ARRAY['hiit', 'cardio', 'queima_gordura'], 'Treino HIIT de 25 minutos eficiente'),
('HIIT Insano Avançado', 'funcional', 'dificil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=QXe7raCu-8g', 'CHASE Brasil', 'professional', ARRAY['hiit', 'cardio', 'avancado'], 'HIIT nível insano para avançados'),
('Abdômen HIIT 10min Killer', 'abdomen', 'dificil', 'casa', ARRAY['nenhum'], 'https://www.youtube.com/watch?v=v6rKhWEeEwg', 'CHASE Brasil', 'professional', ARRAY['hiit', 'cardio', 'abdomen'], 'HIIT killer de 10 minutos focado em abdômen')
ON CONFLICT DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_exercises_youtube_channel ON exercises_library(youtube_channel);
CREATE INDEX IF NOT EXISTS idx_exercises_youtube_quality ON exercises_library(youtube_quality);
CREATE INDEX IF NOT EXISTS idx_exercises_gender_focus ON exercises_library(gender_focus);
CREATE INDEX IF NOT EXISTS idx_exercises_special_condition ON exercises_library(special_condition);