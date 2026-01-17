-- Add camera workout challenges to the challenges table
-- These challenges are specifically for the camera-based workout system

-- Insert camera workout challenges
INSERT INTO challenges (
  title,
  description,
  challenge_type,
  difficulty,
  duration_days,
  points_reward,
  xp_reward,
  is_active,
  created_at
) VALUES
  (
    '🎯 Primeiro Treino com Câmera',
    'Complete seu primeiro treino usando a câmera com pelo menos 10 repetições',
    'camera_workout',
    'easy',
    7,
    100,
    50,
    true,
    now()
  ),
  (
    '💪 Mestre do Agachamento',
    'Complete 100 agachamentos com boa forma (score >= 80)',
    'camera_workout',
    'medium',
    14,
    300,
    150,
    true,
    now()
  ),
  (
    '🔥 Sequência de 7 Dias',
    'Treine com a câmera por 7 dias consecutivos',
    'camera_workout',
    'medium',
    7,
    500,
    250,
    true,
    now()
  ),
  (
    '⭐ Forma Perfeita',
    'Complete 50 repetições com score de forma >= 90',
    'camera_workout',
    'hard',
    30,
    800,
    400,
    true,
    now()
  ),
  (
    '🏆 Campeão do Mês',
    'Complete 20 sessões de treino com câmera em 30 dias',
    'camera_workout',
    'hard',
    30,
    1000,
    500,
    true,
    now()
  )
ON CONFLICT DO NOTHING;

-- Add comment explaining the camera_workout challenge type
COMMENT ON COLUMN challenges.challenge_type IS 'Type of challenge: daily, weekly, monthly, special, camera_workout, etc.';
