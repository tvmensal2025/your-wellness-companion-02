-- Criar tabela de exercícios base
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL CHECK (location IN ('casa', 'academia', 'ambos')),
  difficulty TEXT DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  muscle_group TEXT,
  equipment_needed TEXT[],
  video_url TEXT,
  image_url TEXT,
  instructions JSONB,
  tips TEXT[],
  sets TEXT,
  reps TEXT,
  rest_time TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos podem ver exercícios ativos
CREATE POLICY "Anyone can view active exercises"
  ON public.exercises FOR SELECT
  USING (is_active = true);

-- Admins podem gerenciar (usando função is_super_admin que já existe)
CREATE POLICY "Admins can manage exercises"
  ON public.exercises FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_exercises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exercises_timestamp
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_exercises_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS idx_exercises_location ON public.exercises(location);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON public.exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_active ON public.exercises(is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON public.exercises(muscle_group);

-- Inserir alguns exercícios de exemplo
INSERT INTO public.exercises (name, description, location, difficulty, muscle_group, equipment_needed, instructions, tips, sets, reps, rest_time) VALUES
('Agachamento na cadeira', 'Sente e levante usando uma cadeira como referência', 'casa', 'facil', 'Pernas', ARRAY['Cadeira'], 
  '{"passos": ["Fique de frente para cadeira, pés na largura dos ombros", "Desça controladamente até quase sentar", "Pause 1 segundo antes de tocar", "Empurre pelos calcanhares para subir", "Mantenha peito elevado e core ativado"]}'::jsonb,
  ARRAY['Não deixe os joelhos ultrapassarem a ponta dos pés'],
  '3-4', '12-15', '60s'),
  
('Flexão na mesa', 'Flexão inclinada usando a mesa como apoio', 'casa', 'facil', 'Peito', ARRAY['Mesa'],
  '{"passos": ["Mãos na borda da mesa, largura dos ombros", "Corpo reto da cabeça aos pés", "Desça até peito quase tocar a mesa", "Empurre com força", "Mantenha core contraído"]}'::jsonb,
  ARRAY['Quanto mais alto o apoio, mais fácil'],
  '3-4', '10-15', '60s'),

('Supino reto', 'Exercício principal para peito', 'academia', 'medio', 'Peito', ARRAY['Barra', 'Banco'],
  '{"passos": ["Deite no banco, pés firmes no chão", "Pegada na largura dos ombros + 10cm", "Tire a barra do suporte com braços esticados", "Desça controladamente até tocar peito", "Empurre explosivamente"]}'::jsonb,
  ARRAY['Escápulas retraídas e peito para cima durante todo movimento'],
  '3-4', '8-12', '90s'),

('Agachamento livre', 'Rei dos exercícios para pernas', 'academia', 'dificil', 'Pernas', ARRAY['Barra', 'Rack'],
  '{"passos": ["Barra nas costas (trapézio superior)", "Pés largura dos ombros, pontas levemente para fora", "Inspire e desça controladamente", "Desça até coxas paralelas ao chão (mínimo)", "Empurre pelos calcanhares para subir"]}'::jsonb,
  ARRAY['Joelhos na direção dos pés', 'Core sempre ativado'],
  '3-4', '6-10', '120s');