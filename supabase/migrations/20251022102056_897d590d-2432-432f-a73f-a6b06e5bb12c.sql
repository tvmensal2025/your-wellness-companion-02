-- Limpar exercícios existentes
DELETE FROM public.exercises;

-- Ajustar constraint de location
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_location_check;
ALTER TABLE public.exercises ADD CONSTRAINT exercises_location_check 
  CHECK (location = ANY (ARRAY['academia'::text, 'casa_com_equipamento'::text, 'casa_sem_equipamento'::text]));

-- Inserir base de exercícios (50+ exercícios completos)
INSERT INTO public.exercises (name, description, location, difficulty, muscle_group, equipment_needed, instructions, tips, sets, reps, rest_time, is_active) VALUES

-- ACADEMIA (28 exercícios)
('Supino Reto', 'Exercício fundamental para peitoral', 'academia', 'facil', 'peito', ARRAY['Barra', 'Banco'], 
 '[{"step": 1, "text": "Deite no banco"}, {"step": 2, "text": "Segure a barra"}, {"step": 3, "text": "Desça até o peito"}, {"step": 4, "text": "Empurre para cima"}]'::jsonb,
 ARRAY['Ombros retraídos', 'Controle a descida', 'Expire ao empurrar'], '3', '8-12', '90', true),

('Supino Inclinado', 'Porção superior do peitoral', 'academia', 'medio', 'peito', ARRAY['Barra', 'Banco inclinado'],
 '[{"step": 1, "text": "Banco 30-45 graus"}, {"step": 2, "text": "Pegue a barra"}, {"step": 3, "text": "Desça ao peito superior"}, {"step": 4, "text": "Empurre verticalmente"}]'::jsonb,
 ARRAY['Banco correto', 'Foco superior', 'Controle'], '3', '8-12', '90', true),

('Crossover', 'Definição peitoral', 'academia', 'dificil', 'peito', ARRAY['Cabos'],
 '[{"step": 1, "text": "No meio do cross"}, {"step": 2, "text": "Segure alças"}, {"step": 3, "text": "Braços ao centro"}, {"step": 4, "text": "Retorne"}]'::jsonb,
 ARRAY['Tensão constante', 'Varie ângulo'], '3', '12-15', '60', true),

('Barra Fixa', 'Costas completo', 'academia', 'medio', 'costas', ARRAY['Barra fixa'],
 '[{"step": 1, "text": "Pegada média"}, {"step": 2, "text": "Pendure"}, {"step": 3, "text": "Puxe até queixo"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Pegada pronada', 'Escápulas retraídas'], '3', '6-10', '120', true),

('Remada Curvada', 'Espessura das costas', 'academia', 'medio', 'costas', ARRAY['Barra'],
 '[{"step": 1, "text": "Incline 45°"}, {"step": 2, "text": "Pegue barra"}, {"step": 3, "text": "Puxe ao abdômen"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Costas retas', 'Puxe com cotovelos'], '3', '8-12', '90', true),

('Pulley Frente', 'Largura costas', 'academia', 'facil', 'costas', ARRAY['Pulley', 'Barra'],
 '[{"step": 1, "text": "Sente"}, {"step": 2, "text": "Barra larga"}, {"step": 3, "text": "Puxe ao peito"}, {"step": 4, "text": "Retorne"}]'::jsonb,
 ARRAY['Não balance', 'Puxe com costas'], '3', '10-12', '75', true),

('Levantamento Terra', 'Posterior completo', 'academia', 'dificil', 'costas', ARRAY['Barra', 'Anilhas'],
 '[{"step": 1, "text": "Pés sob barra"}, {"step": 2, "text": "Pegada média"}, {"step": 3, "text": "Levante reto"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Lombar neutra', 'Força nas pernas'], '4', '5-8', '180', true),

('Desenvolvimento Barra', 'Ombros geral', 'academia', 'medio', 'ombros', ARRAY['Barra', 'Banco'],
 '[{"step": 1, "text": "Sente com apoio"}, {"step": 2, "text": "Barra nos ombros"}, {"step": 3, "text": "Empurre"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Não arqueie costas', 'Core ativo'], '3', '8-12', '90', true),

('Elevação Lateral', 'Deltoide lateral', 'academia', 'facil', 'ombros', ARRAY['Halteres'],
 '[{"step": 1, "text": "Em pé com halteres"}, {"step": 2, "text": "Eleve lateralmente"}, {"step": 3, "text": "Até ombros"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Cotovelos levemente flexionados', 'Sem impulso'], '3', '12-15', '60', true),

('Elevação Frontal', 'Deltoide anterior', 'academia', 'facil', 'ombros', ARRAY['Halteres'],
 '[{"step": 1, "text": "Em pé"}, {"step": 2, "text": "Eleve à frente"}, {"step": 3, "text": "Até olhos"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Não arqueie', 'Controle'], '3', '12-15', '60', true),

('Agachamento Livre', 'Pernas completo', 'academia', 'medio', 'pernas', ARRAY['Barra', 'Rack'],
 '[{"step": 1, "text": "Barra nos ombros"}, {"step": 2, "text": "Pés largura ombros"}, {"step": 3, "text": "Desça paralelo"}, {"step": 4, "text": "Empurre"}]'::jsonb,
 ARRAY['Joelhos alinhados', 'Costas retas'], '4', '8-12', '120', true),

('Leg Press', 'Quadríceps e glúteos', 'academia', 'facil', 'pernas', ARRAY['Leg Press'],
 '[{"step": 1, "text": "Sente"}, {"step": 2, "text": "Pés na plataforma"}, {"step": 3, "text": "Desça 90°"}, {"step": 4, "text": "Empurre"}]'::jsonb,
 ARRAY['Não tranque joelhos', 'Amplitude completa'], '3', '10-15', '90', true),

('Cadeira Extensora', 'Isolamento quadríceps', 'academia', 'facil', 'pernas', ARRAY['Cadeira Extensora'],
 '[{"step": 1, "text": "Ajuste máquina"}, {"step": 2, "text": "Estenda pernas"}, {"step": 3, "text": "Contraia"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Sem impulso', 'Contraia quadríceps'], '3', '12-15', '60', true),

('Mesa Flexora', 'Posteriores', 'academia', 'facil', 'pernas', ARRAY['Mesa Flexora'],
 '[{"step": 1, "text": "Deite de bruços"}, {"step": 2, "text": "Flexione pernas"}, {"step": 3, "text": "Calcanhar aos glúteos"}, {"step": 4, "text": "Estenda"}]'::jsonb,
 ARRAY['Quadril no banco', 'Amplitude completa'], '3', '12-15', '60', true),

('Stiff', 'Posterior e glúteos', 'academia', 'medio', 'pernas', ARRAY['Barra'],
 '[{"step": 1, "text": "Em pé com barra"}, {"step": 2, "text": "Pernas semi-estendidas"}, {"step": 3, "text": "Desça"}, {"step": 4, "text": "Suba contraindo"}]'::jsonb,
 ARRAY['Lombar neutra', 'Joelhos levemente flexionados'], '3', '10-12', '90', true),

('Panturrilha Máquina', 'Panturrilhas', 'academia', 'facil', 'pernas', ARRAY['Máquina'],
 '[{"step": 1, "text": "Posicione-se"}, {"step": 2, "text": "Pontas dos pés"}, {"step": 3, "text": "Eleve"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Amplitude completa', 'Pause no topo'], '4', '15-20', '45', true),

('Rosca Direta', 'Bíceps geral', 'academia', 'facil', 'biceps', ARRAY['Barra'],
 '[{"step": 1, "text": "Em pé com barra"}, {"step": 2, "text": "Flexione cotovelos"}, {"step": 3, "text": "Eleve ao peito"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Não balance', 'Cotovelos fixos'], '3', '10-12', '60', true),

('Rosca Alternada', 'Bíceps com halteres', 'academia', 'facil', 'biceps', ARRAY['Halteres'],
 '[{"step": 1, "text": "Em pé"}, {"step": 2, "text": "Alterne braços"}, {"step": 3, "text": "Supine punho"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Um braço por vez', 'Sem balanço'], '3', '10-12', '60', true),

('Rosca Scott', 'Isolamento bíceps', 'academia', 'medio', 'biceps', ARRAY['Banco Scott', 'Barra'],
 '[{"step": 1, "text": "Sente no Scott"}, {"step": 2, "text": "Apoie braços"}, {"step": 3, "text": "Flexione"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Não estenda totalmente', 'Controle'], '3', '10-12', '60', true),

('Tríceps Testa', 'Tríceps completo', 'academia', 'medio', 'triceps', ARRAY['Barra', 'Banco'],
 '[{"step": 1, "text": "Deite no banco"}, {"step": 2, "text": "Barra acima"}, {"step": 3, "text": "Flexione à testa"}, {"step": 4, "text": "Estenda"}]'::jsonb,
 ARRAY['Cotovelos para cima', 'Amplitude completa'], '3', '10-12', '60', true),

('Tríceps Pulley', 'Definição tríceps', 'academia', 'facil', 'triceps', ARRAY['Pulley', 'Corda'],
 '[{"step": 1, "text": "Frente ao pulley"}, {"step": 2, "text": "Segure corda"}, {"step": 3, "text": "Estenda abaixo"}, {"step": 4, "text": "Flexione"}]'::jsonb,
 ARRAY['Cotovelos fixos', 'Contraia final'], '3', '12-15', '45', true),

('Tríceps Francês', 'Porção longa', 'academia', 'medio', 'triceps', ARRAY['Halteres'],
 '[{"step": 1, "text": "Sentado ou em pé"}, {"step": 2, "text": "Peso acima cabeça"}, {"step": 3, "text": "Flexione atrás"}, {"step": 4, "text": "Estenda"}]'::jsonb,
 ARRAY['Cotovelos próximos', 'Controle'], '3', '10-12', '60', true),

('Abdominal Polia', 'Abdômen com resistência', 'academia', 'medio', 'abdomen', ARRAY['Pulley', 'Corda'],
 '[{"step": 1, "text": "Ajoelhe ao pulley"}, {"step": 2, "text": "Corda à cabeça"}, {"step": 3, "text": "Contraia às coxas"}, {"step": 4, "text": "Retorne"}]'::jsonb,
 ARRAY['Quadril fixo', 'Não puxe com braços'], '3', '15-20', '45', true),

-- CASA COM EQUIPAMENTO (12 exercícios)
('Supino Halteres', 'Peito com halteres', 'casa_com_equipamento', 'facil', 'peito', ARRAY['Halteres', 'Banco'],
 '[{"step": 1, "text": "Deite com halteres"}, {"step": 2, "text": "Empurre"}, {"step": 3, "text": "Desça"}, {"step": 4, "text": "Repita"}]'::jsonb,
 ARRAY['Controle movimento', 'Desça devagar'], '3', '10-15', '75', true),

('Remada Halteres', 'Costas', 'casa_com_equipamento', 'facil', 'costas', ARRAY['Halteres', 'Banco'],
 '[{"step": 1, "text": "Joelho no banco"}, {"step": 2, "text": "Halter oposto"}, {"step": 3, "text": "Puxe lateral"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Costas paralelas', 'Puxe com cotovelo'], '3', '10-15', '60', true),

('Desenvolvimento Halteres', 'Ombros', 'casa_com_equipamento', 'facil', 'ombros', ARRAY['Halteres'],
 '[{"step": 1, "text": "Sentado ou em pé"}, {"step": 2, "text": "Halteres nos ombros"}, {"step": 3, "text": "Empurre"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Não arqueie', 'Movimento completo'], '3', '10-15', '60', true),

('Elevação Lateral Halteres', 'Deltoides', 'casa_com_equipamento', 'facil', 'ombros', ARRAY['Halteres'],
 '[{"step": 1, "text": "Em pé"}, {"step": 2, "text": "Eleve lateralmente"}, {"step": 3, "text": "Até ombros"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Cotovelos flexionados', 'Sem impulso'], '3', '12-15', '45', true),

('Agachamento Halteres', 'Pernas', 'casa_com_equipamento', 'facil', 'pernas', ARRAY['Halteres'],
 '[{"step": 1, "text": "Halteres nas mãos"}, {"step": 2, "text": "Pés largura ombros"}, {"step": 3, "text": "Agache"}, {"step": 4, "text": "Empurre"}]'::jsonb,
 ARRAY['Joelhos alinhados', 'Costas retas'], '3', '12-15', '75', true),

('Avanço Halteres', 'Glúteos e pernas', 'casa_com_equipamento', 'medio', 'pernas', ARRAY['Halteres'],
 '[{"step": 1, "text": "Halteres"}, {"step": 2, "text": "Passo à frente"}, {"step": 3, "text": "Desça"}, {"step": 4, "text": "Retorne"}]'::jsonb,
 ARRAY['Joelho não ultrapassa pé', 'Alterne'], '3', '10-12', '60', true),

('Stiff Halteres', 'Posterior', 'casa_com_equipamento', 'medio', 'pernas', ARRAY['Halteres'],
 '[{"step": 1, "text": "Halteres à frente"}, {"step": 2, "text": "Pernas semi-estendidas"}, {"step": 3, "text": "Desça"}, {"step": 4, "text": "Suba"}]'::jsonb,
 ARRAY['Lombar neutra', 'Joelhos levemente flexionados'], '3', '10-15', '75', true),

('Panturrilha Halteres', 'Panturrilhas', 'casa_com_equipamento', 'facil', 'pernas', ARRAY['Halteres'],
 '[{"step": 1, "text": "Em pé com halteres"}, {"step": 2, "text": "Pontas dos pés"}, {"step": 3, "text": "Eleve"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Amplitude total', 'Pause topo'], '4', '15-20', '30', true),

('Rosca Halteres', 'Bíceps', 'casa_com_equipamento', 'facil', 'biceps', ARRAY['Halteres'],
 '[{"step": 1, "text": "Em pé ou sentado"}, {"step": 2, "text": "Flexione cotovelos"}, {"step": 3, "text": "Supine"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Cotovelos fixos', 'Sem balanço'], '3', '10-15', '45', true),

('Rosca Martelo', 'Bíceps e antebraço', 'casa_com_equipamento', 'facil', 'biceps', ARRAY['Halteres'],
 '[{"step": 1, "text": "Pegada neutra"}, {"step": 2, "text": "Flexione"}, {"step": 3, "text": "Mantenha neutro"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Punhos neutros', 'Cotovelos fixos'], '3', '10-15', '45', true),

('Tríceps Coice', 'Tríceps isolamento', 'casa_com_equipamento', 'facil', 'triceps', ARRAY['Halteres'],
 '[{"step": 1, "text": "Incline tronco"}, {"step": 2, "text": "Cotovelo fixo"}, {"step": 3, "text": "Estenda atrás"}, {"step": 4, "text": "Flexione"}]'::jsonb,
 ARRAY['Cotovelo fixo', 'Só antebraço'], '3', '12-15', '45', true),

('Abdominal Peso', 'Abdômen resistência', 'casa_com_equipamento', 'medio', 'abdomen', ARRAY['Halter'],
 '[{"step": 1, "text": "Deite com peso"}, {"step": 2, "text": "Peso no peito"}, {"step": 3, "text": "Contraia"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Não puxe pescoço', 'Controle'], '3', '15-20', '45', true),

-- CASA SEM EQUIPAMENTO (18 exercícios)
('Flexão Braço', 'Peito e tríceps', 'casa_sem_equipamento', 'facil', 'peito', ARRAY[]::text[],
 '[{"step": 1, "text": "Prancha mãos no chão"}, {"step": 2, "text": "Desça"}, {"step": 3, "text": "Peito quase toca"}, {"step": 4, "text": "Empurre"}]'::jsonb,
 ARRAY['Corpo alinhado', 'Core ativo'], '3', '10-20', '60', true),

('Flexão Diamante', 'Tríceps', 'casa_sem_equipamento', 'medio', 'peito', ARRAY[]::text[],
 '[{"step": 1, "text": "Mãos diamante"}, {"step": 2, "text": "Flexão"}, {"step": 3, "text": "Desça próximo"}, {"step": 4, "text": "Empurre"}]'::jsonb,
 ARRAY['Cotovelos próximos', 'Foco tríceps'], '3', '8-15', '60', true),

('Flexão Inclinada', 'Peito superior', 'casa_sem_equipamento', 'medio', 'peito', ARRAY[]::text[],
 '[{"step": 1, "text": "Pés elevados"}, {"step": 2, "text": "Mãos chão"}, {"step": 3, "text": "Desça"}, {"step": 4, "text": "Empurre"}]'::jsonb,
 ARRAY['Quanto mais alto mais difícil', 'Corpo alinhado'], '3', '10-15', '60', true),

('Superman', 'Lombar', 'casa_sem_equipamento', 'facil', 'costas', ARRAY[]::text[],
 '[{"step": 1, "text": "Deite de bruços"}, {"step": 2, "text": "Braços à frente"}, {"step": 3, "text": "Eleve simultaneamente"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Olhe baixo', 'Não force pescoço'], '3', '15-20', '30', true),

('Pike Push Up', 'Ombros', 'casa_sem_equipamento', 'medio', 'ombros', ARRAY[]::text[],
 '[{"step": 1, "text": "V invertido"}, {"step": 2, "text": "Quadril elevado"}, {"step": 3, "text": "Desça cabeça"}, {"step": 4, "text": "Empurre"}]'::jsonb,
 ARRAY['Quanto mais vertical mais difícil', 'Foco ombros'], '3', '8-15', '60', true),

('Agachamento', 'Pernas', 'casa_sem_equipamento', 'facil', 'pernas', ARRAY[]::text[],
 '[{"step": 1, "text": "Pés largura ombros"}, {"step": 2, "text": "Braços à frente"}, {"step": 3, "text": "Desça paralelo"}, {"step": 4, "text": "Empurre"}]'::jsonb,
 ARRAY['Joelhos alinhados', 'Peso calcanhares'], '3', '15-25', '45', true),

('Agachamento Sumô', 'Glúteos adutores', 'casa_sem_equipamento', 'facil', 'pernas', ARRAY[]::text[],
 '[{"step": 1, "text": "Pés afastados"}, {"step": 2, "text": "Pontas para fora"}, {"step": 3, "text": "Agache"}, {"step": 4, "text": "Suba"}]'::jsonb,
 ARRAY['Joelhos alinhados com pés', 'Foco glúteos'], '3', '15-20', '45', true),

('Avanço', 'Glúteos pernas', 'casa_sem_equipamento', 'facil', 'pernas', ARRAY[]::text[],
 '[{"step": 1, "text": "Passo à frente"}, {"step": 2, "text": "Desça"}, {"step": 3, "text": "Joelho não ultrapassa"}, {"step": 4, "text": "Retorne"}]'::jsonb,
 ARRAY['Tronco ereto', 'Alterne pernas'], '3', '10-15', '45', true),

('Ponte Glúteo', 'Glúteos', 'casa_sem_equipamento', 'facil', 'gluteos', ARRAY[]::text[],
 '[{"step": 1, "text": "Deite joelhos flexionados"}, {"step": 2, "text": "Pés chão"}, {"step": 3, "text": "Eleve quadril"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Contraia glúteos', 'Pause 2 seg topo'], '3', '15-25', '30', true),

('Panturrilha', 'Panturrilhas', 'casa_sem_equipamento', 'facil', 'pernas', ARRAY[]::text[],
 '[{"step": 1, "text": "Em pé"}, {"step": 2, "text": "Pontas pés"}, {"step": 3, "text": "Eleve"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Use degrau', 'Pause topo'], '4', '20-30', '30', true),

('Tríceps Banco', 'Tríceps', 'casa_sem_equipamento', 'facil', 'triceps', ARRAY[]::text[],
 '[{"step": 1, "text": "Mãos em cadeira"}, {"step": 2, "text": "Atrás de você"}, {"step": 3, "text": "Desça"}, {"step": 4, "text": "Empurre"}]'::jsonb,
 ARRAY['Cotovelos atrás', 'Pernas mais estendidas mais difícil'], '3', '10-20', '45', true),

('Prancha', 'Core', 'casa_sem_equipamento', 'facil', 'abdomen', ARRAY[]::text[],
 '[{"step": 1, "text": "Antebraços e pés"}, {"step": 2, "text": "Corpo alinhado"}, {"step": 3, "text": "Core contraído"}, {"step": 4, "text": "Segure"}]'::jsonb,
 ARRAY['Corpo alinhado', 'Não deixe quadril cair'], '3', '30-60 seg', '30', true),

('Prancha Lateral', 'Oblíquos', 'casa_sem_equipamento', 'medio', 'abdomen', ARRAY[]::text[],
 '[{"step": 1, "text": "Antebraço e pé lateral"}, {"step": 2, "text": "Corpo alinhado"}, {"step": 3, "text": "Quadril elevado"}, {"step": 4, "text": "Segure"}]'::jsonb,
 ARRAY['Alinhado lateralmente', 'Alterne lados'], '3', '20-45 seg', '30', true),

('Abdominal', 'Reto abdominal', 'casa_sem_equipamento', 'facil', 'abdomen', ARRAY[]::text[],
 '[{"step": 1, "text": "Deite joelhos flexionados"}, {"step": 2, "text": "Mãos cabeça"}, {"step": 3, "text": "Contraia"}, {"step": 4, "text": "Desça"}]'::jsonb,
 ARRAY['Não puxe pescoço', 'Lombar no chão'], '3', '15-25', '30', true),

('Bicicleta', 'Oblíquos', 'casa_sem_equipamento', 'medio', 'abdomen', ARRAY[]::text[],
 '[{"step": 1, "text": "Deite mãos cabeça"}, {"step": 2, "text": "Eleve pernas"}, {"step": 3, "text": "Cotovelo joelho oposto"}, {"step": 4, "text": "Alterne"}]'::jsonb,
 ARRAY['Movimento contínuo', 'Lombar chão'], '3', '20-30', '30', true),

('Tesoura', 'Abdômen inferior', 'casa_sem_equipamento', 'medio', 'abdomen', ARRAY[]::text[],
 '[{"step": 1, "text": "Deite pernas estendidas"}, {"step": 2, "text": "Eleve pernas"}, {"step": 3, "text": "Alterne"}, {"step": 4, "text": "Mantenha lombar"}]'::jsonb,
 ARRAY['Lombar colada', 'Pernas não tocam chão'], '3', '15-25', '30', true),

('Mountain Climber', 'Core cardio', 'casa_sem_equipamento', 'medio', 'abdomen', ARRAY[]::text[],
 '[{"step": 1, "text": "Prancha alta"}, {"step": 2, "text": "Joelho ao peito"}, {"step": 3, "text": "Alterne rápido"}, {"step": 4, "text": "Quadril estável"}]'::jsonb,
 ARRAY['Core ativo', 'Movimento rápido'], '3', '30-60 seg', '45', true),

('Burpee', 'Corpo todo', 'casa_sem_equipamento', 'medio', 'corpo_todo', ARRAY[]::text[],
 '[{"step": 1, "text": "Em pé"}, {"step": 2, "text": "Agache e mãos chão"}, {"step": 3, "text": "Pernas atrás"}, {"step": 4, "text": "Flexão volte e salte"}]'::jsonb,
 ARRAY['Movimento explosivo', 'Excelente cardio'], '3', '10-20', '60', true);
