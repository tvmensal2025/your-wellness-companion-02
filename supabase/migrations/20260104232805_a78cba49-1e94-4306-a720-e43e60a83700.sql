-- Tabela de exercícios editáveis pelo admin
CREATE TABLE IF NOT EXISTS public.exercises_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL CHECK (location IN ('casa', 'academia', 'ambos')),
  difficulty TEXT DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  muscle_group TEXT,
  equipment_needed TEXT[],
  youtube_url TEXT,
  image_url TEXT,
  instructions TEXT[],
  tips TEXT,
  sets TEXT DEFAULT '3-4',
  reps TEXT DEFAULT '10-12',
  rest_time TEXT DEFAULT '60s',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.exercises_library ENABLE ROW LEVEL SECURITY;

-- Políticas: todos podem ler (exercícios são públicos), só admin pode modificar
CREATE POLICY "Exercícios visíveis para todos" 
  ON public.exercises_library FOR SELECT 
  USING (true);

CREATE POLICY "Admin pode inserir exercícios" 
  ON public.exercises_library FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin pode atualizar exercícios" 
  ON public.exercises_library FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin pode deletar exercícios" 
  ON public.exercises_library FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE TRIGGER update_exercises_library_updated_at
  BEFORE UPDATE ON public.exercises_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_exercises_library_location ON public.exercises_library(location);
CREATE INDEX IF NOT EXISTS idx_exercises_library_active ON public.exercises_library(is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_library_muscle ON public.exercises_library(muscle_group);

-- Inserir os exercícios de casa existentes
INSERT INTO public.exercises_library (name, description, location, youtube_url, instructions, tips, muscle_group) VALUES
('Agachamento na cadeira', 'Sente e levante usando uma cadeira como referência', 'casa', 'https://www.youtube.com/watch?v=aclHkVaku9U', 
  ARRAY['1. Fique de frente para cadeira, pés na largura dos ombros', '2. Desça controladamente até quase sentar', '3. Pause 1 segundo antes de tocar', '4. Empurre pelos calcanhares para subir', '5. Mantenha peito elevado e core ativado'], 
  'Não deixe os joelhos ultrapassarem a ponta dos pés', 'Pernas'),

('Flexão na mesa', 'Flexão inclinada usando a mesa como apoio', 'casa', 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  ARRAY['1. Mãos na borda da mesa, largura dos ombros', '2. Corpo reto da cabeça aos pés', '3. Desça até peito quase tocar a mesa', '4. Empurre com força', '5. Mantenha core contraído'],
  'Quanto mais alto o apoio, mais fácil. Use banco para nível intermediário', 'Peito'),

('Subida no banco', 'Step up usando banco ou degrau da escada', 'casa', 'https://www.youtube.com/watch?v=Z2F0b0c5xV8',
  ARRAY['1. Coloque um pé completamente sobre o banco', '2. Empurre pelo calcanhar para subir', '3. Joelho do outro pé deve ultrapassar a linha do banco', '4. Desça controladamente', '5. Alterne as pernas'],
  'Para mais intensidade, segure halteres ou garrafas de água', 'Pernas'),

('Mergulho na cadeira', 'Tríceps dip usando cadeira', 'casa', 'https://www.youtube.com/watch?v=0326dy_-CzM',
  ARRAY['1. Mãos na borda da cadeira, dedos para frente', '2. Pés no chão, joelhos dobrados (iniciante) ou esticados (avançado)', '3. Desça dobrando os cotovelos até 90°', '4. Empurre para cima usando tríceps', '5. Mantenha cotovelos próximos ao corpo'],
  'Para aumentar dificuldade, coloque pés em outro banco', 'Tríceps'),

('Remada na mesa', 'Remada invertida usando mesa resistente', 'casa', 'https://www.youtube.com/watch?v=GZpWaKW9nDU',
  ARRAY['1. Deite sob a mesa, segure a borda', '2. Corpo reto, apenas calcanhares no chão', '3. Puxe peito em direção à mesa', '4. Aperte escapulas no topo', '5. Desça controladamente'],
  'Quanto mais horizontal, mais difícil. Dobre joelhos para facilitar', 'Costas'),

('Panturrilha na escada', 'Elevação de panturrilha usando degrau', 'casa', 'https://www.youtube.com/watch?v=YMmgqO8Jo-k',
  ARRAY['1. Pontas dos pés no degrau, calcanhares fora', '2. Segure no corrimão para equilíbrio', '3. Suba na ponta dos pés o máximo possível', '4. Pause 1 segundo no topo', '5. Desça abaixo do nível do degrau'],
  'Amplitude completa é essencial. Faça unilateral para mais intensidade', 'Panturrilha'),

('Agachamento búlgaro', 'Split squat com pé traseiro elevado', 'casa', 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
  ARRAY['1. Pé traseiro apoiado em cadeira/banco', '2. Pé da frente afastado (1 passo)', '3. Desça dobrando joelho da frente até 90°', '4. Joelho não ultrapassa ponta do pé', '5. Empurre pelo calcanhar para subir'],
  'Um dos melhores exercícios para pernas em casa', 'Pernas'),

('Flexão declinada', 'Flexão com pés elevados no banco', 'casa', 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  ARRAY['1. Pés no banco, mãos no chão', '2. Corpo reto, core contraído', '3. Desça até peito quase tocar chão', '4. Cotovelos 45° do corpo', '5. Empurre explosivamente'],
  'Trabalha mais a parte superior do peito', 'Peito'),

-- Exercícios de academia
('Supino reto', 'Exercício principal para peito', 'academia', 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  ARRAY['1. Deite no banco, pés firmes no chão', '2. Pegada na largura dos ombros + 10cm', '3. Tire a barra do suporte com braços esticados', '4. Desça controladamente até tocar peito', '5. Empurre explosivamente'],
  'Escápulas retraídas e peito para cima durante todo movimento. Arquear levemente a lombar', 'Peito'),

('Agachamento livre', 'Rei dos exercícios para pernas', 'academia', 'https://www.youtube.com/watch?v=1xMaFs0L3ao',
  ARRAY['1. Barra nas costas (trapézio superior)', '2. Pés largura dos ombros, pontas levemente para fora', '3. Inspire e desça controladamente', '4. Desça até coxas paralelas ao chão (mínimo)', '5. Empurre pelos calcanhares para subir'],
  'Joelhos na direção dos pés. Core sempre ativado. Olhar ligeiramente para cima', 'Pernas'),

('Levantamento terra', 'Exercício completo de força', 'academia', 'https://www.youtube.com/watch?v=apzFT8P9A5c',
  ARRAY['1. Barra no chão, sobre a linha dos pés', '2. Pés largura do quadril', '3. Segure a barra, braços esticados fora das pernas', '4. Peito para cima, core ativado', '5. Empurre pernas e estique quadril simultaneamente'],
  'Barra sempre próxima ao corpo. Costas neutra SEMPRE. Não arredondar lombar', 'Costas'),

('Desenvolvimento', 'Principal exercício para ombros', 'academia', 'https://www.youtube.com/watch?v=qEwKCR5JCog',
  ARRAY['1. Sentado com costas apoiadas', '2. Halteres na altura dos ombros', '3. Empurre para cima até braços quase esticados', '4. Não travar cotovelos', '5. Desça controladamente'],
  'Não arquear demais as costas. Core ativado', 'Ombros'),

('Barra fixa', 'Exercício fundamental para costas', 'academia', 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
  ARRAY['1. Pegada pronada (palmas para frente)', '2. Pendurado, braços esticados', '3. Puxe até queixo passar a barra', '4. Peito para frente, cotovelos para baixo e trás', '5. Desça controladamente'],
  'Não balançar corpo. Se não conseguir, use máquina assistida ou elástico', 'Costas'),

('Leg press 45°', 'Exercício seguro e efetivo para pernas', 'academia', 'https://www.youtube.com/watch?v=Ny0-wLJxUkU',
  ARRAY['1. Costas e quadril colados no encosto', '2. Pés na plataforma, largura dos ombros', '3. Destrave e desça controladamente', '4. Desça até joelhos formarem 90°', '5. Empurre pelos calcanhares'],
  'Não desgrudar lombar do encosto. Não travar joelhos totalmente', 'Pernas'),

('Puxada frontal', 'Desenvolvimento de costas e largura', 'academia', 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  ARRAY['1. Sentado, coxas travadas no apoio', '2. Pegada aberta (mais que largura ombros)', '3. Puxe barra até altura do peito', '4. Cotovelos para baixo e trás', '5. Aperte escápulas no final'],
  'Não balançar tronco. Movimento controlado', 'Costas'),

('Rosca direta', 'Exercício clássico para bíceps', 'academia', 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
  ARRAY['1. Em pé, cotovelos fixos ao lado do corpo', '2. Barra ou halteres nas mãos', '3. Curl até máxima contração', '4. Pause 1 segundo no topo', '5. Desça controladamente'],
  'Não balançar corpo. Cotovelos sempre fixos. Supinação completa no topo', 'Bíceps');