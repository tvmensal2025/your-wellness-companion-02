-- =====================================================
-- SISTEMA COMPLETO DE PONTUAÇÃO - TODAS AS AÇÕES
-- =====================================================
-- Adiciona todas as configurações de pontos faltantes
-- Total: 66 ações configuradas

-- Inserir configurações de pontos
INSERT INTO public.points_configuration (
  action_type, action_name, points, description, icon, category, max_daily, multiplier
) VALUES

-- BONUS

-- DESAFIO

-- EDUCACAO

-- ESPECIAL

-- EXERCICIO

-- NUTRICAO

-- SAUDE

-- SOCIAL

-- TRACKING
('trending_post', 'Post em Destaque', 50, 'Pontos por post em destaque', '🔥', 'bonus', NULL, 1.0),
('league_promotion', 'Promoção de Liga', 300, 'Pontos por promoção de liga', '📈', 'bonus', NULL, 1.0),
('certificate_earned', 'Certificado', 200, 'Pontos por certificado', '🏅', 'bonus', NULL, 1.0),
('good_form_bonus', 'Boa Forma', 50, 'Pontos por boa forma', '✨', 'bonus', 10, 1.0),
('exercise_achievement', 'Conquista Exercício', 100, 'Pontos por conquista exercício', '🎯', 'bonus', NULL, 1.0),
('workout_streak_7', 'Streak Treino 7d', 100, 'Pontos por streak treino 7d', '🔥', 'bonus', NULL, 1.0),
('connect_google_fit', 'Conectar Google Fit', 50, 'Pontos por conectar google fit', '🔗', 'bonus', 1, 1.0),
('health_streak_7', 'Streak Saúde 7d', 75, 'Pontos por streak saúde 7d', '💚', 'bonus', NULL, 1.0),
('earn_powerup', 'Ganhar Power-up', 20, 'Pontos por ganhar power-up', '🎁', 'bonus', 5, 1.0),
('combo_3x', 'Combo 3x', 100, 'Pontos por combo 3x', '🌟', 'bonus', NULL, 1.0),
('mystery_box_open', 'Caixa Presente', 100, 'Pontos por caixa presente', '🎁', 'bonus', 3, 1.0),
('flash_challenge_complete', 'Flash Challenge', 150, 'Pontos por flash challenge', '⚡', 'desafio', NULL, 1.0),
('duel_win', 'Vencer Duelo', 200, 'Pontos por vencer duelo', '⚔️', 'desafio', 3, 1.0),
('duel_participate', 'Participar Duelo', 50, 'Pontos por participar duelo', '🤺', 'desafio', 5, 1.0),
('join_team', 'Entrar em Time', 20, 'Pontos por entrar em time', '🏃', 'desafio', 1, 1.0),
('create_team', 'Criar Time', 50, 'Pontos por criar time', '🎯', 'desafio', 1, 1.0),
('team_challenge_complete', 'Desafio de Time', 300, 'Pontos por desafio de time', '🏆', 'desafio', NULL, 1.0),
('team_battle_win', 'Batalha de Time', 500, 'Pontos por batalha de time', '👑', 'desafio', NULL, 1.0),
('team_contribution', 'Contribuir Time', 10, 'Pontos por contribuir time', '🤝', 'desafio', 10, 1.0),
('journey_checkpoint', 'Checkpoint Jornada', 75, 'Pontos por checkpoint jornada', '🗺️', 'desafio', 7, 1.0),
('journey_boss_defeat', 'Boss Derrotado', 200, 'Pontos por boss derrotado', '🐉', 'desafio', NULL, 1.0),
('seasonal_event_complete', 'Evento Sazonal', 400, 'Pontos por evento sazonal', '🎉', 'desafio', NULL, 1.0),
('watch_lesson', 'Assistir Aula', 20, 'Pontos por assistir aula', '🎓', 'educacao', 10, 1.0),
('complete_module', 'Completar Módulo', 100, 'Pontos por completar módulo', '📚', 'educacao', 3, 1.0),
('complete_course', 'Completar Curso', 500, 'Pontos por completar curso', '🎖️', 'educacao', NULL, 1.0),
('quiz_correct', 'Quiz Correto', 15, 'Pontos por quiz correto', '✅', 'educacao', 20, 1.0),
('use_powerup', 'Usar Power-up', 0, 'Pontos por usar power-up', '⚡', 'especial', NULL, 1.0),
('workout_complete', 'Treino Completo', 100, 'Pontos por treino completo', '💪', 'exercicio', 3, 1.0),
('camera_workout', 'Treino com Câmera', 150, 'Pontos por treino com câmera', '📹', 'exercicio', 5, 1.0),
('set_complete', 'Série Completa', 25, 'Pontos por série completa', '🔄', 'exercicio', 20, 1.0),
('program_complete', 'Programa Completo', 300, 'Pontos por programa completo', '🏋️', 'exercicio', NULL, 1.0),
('meal_log', 'Registrar Refeição', 15, 'Pontos por registrar refeição', '🍽️', 'nutricao', 6, 1.0),
('meal_photo', 'Foto Refeição', 20, 'Pontos por foto refeição', '📷', 'nutricao', 6, 1.0),
('sofia_analysis', 'Análise Sofia', 25, 'Pontos por análise sofia', '🤖', 'nutricao', 5, 1.0),
('calorie_goal_met', 'Meta Calórica', 50, 'Pontos por meta calórica', '🎯', 'nutricao', 1, 1.0),
('hydration_complete', 'Hidratação 2L', 30, 'Pontos por hidratação 2l', '💧', 'nutricao', 1, 1.0),
('upload_exam', 'Enviar Exame', 30, 'Pontos por enviar exame', '🩺', 'saude', 3, 1.0),
('dr_vital_analysis', 'Análise Dr. Vital', 40, 'Pontos por análise dr. vital', '🔬', 'saude', 3, 1.0),
('health_consultation', 'Consulta Completa', 100, 'Pontos por consulta completa', '👨‍⚕️', 'saude', 1, 1.0),
('create_post', 'Criar Post', 15, 'Pontos por criar post', '📝', 'social', 5, 1.0),
('create_story', 'Criar Story', 10, 'Pontos por criar story', '📸', 'social', 10, 1.0),
('view_story', 'Visualizar Story', 1, 'Pontos por visualizar story', '👀', 'social', 50, 1.0),
('react_post', 'Reagir Post', 3, 'Pontos por reagir post', '❤️', 'social', 30, 1.0),
('reply_comment', 'Responder Comentário', 5, 'Pontos por responder comentário', '💬', 'social', 10, 1.0),
('follow_user', 'Seguir Usuário', 5, 'Pontos por seguir usuário', '👥', 'social', 10, 1.0),
('get_followed', 'Ser Seguido', 10, 'Pontos por ser seguido', '⭐', 'social', NULL, 1.0),
('steps_goal_met', 'Meta de Passos', 40, 'Pontos por meta de passos', '👟', 'tracking', 1, 1.0),
('sleep_log', 'Registrar Sono', 15, 'Pontos por registrar sono', '😴', 'tracking', 1, 1.0),
('mood_log', 'Registrar Humor', 10, 'Pontos por registrar humor', '😊', 'tracking', 3, 1.0),
('symptoms_log', 'Registrar Sintomas', 15, 'Pontos por registrar sintomas', '🩹', 'tracking', 5, 1.0),
('sync_health_data', 'Sincronizar Dados', 5, 'Pontos por sincronizar dados', '🔄', 'tracking', 3, 1.0)
ON CONFLICT (action_type) DO UPDATE SET
  action_name = EXCLUDED.action_name,
  points = EXCLUDED.points,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  max_daily = EXCLUDED.max_daily,
  updated_at = NOW();

-- Comentários para documentação
COMMENT ON COLUMN points_configuration.category IS 'Categorias: bonus, desafio, educacao, especial, exercicio, nutricao, saude, social, tracking';
