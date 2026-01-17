# 🎯 MAPEAMENTO COMPLETO - Sistema de Pontuação MaxNutrition

## 📋 TODAS as Funcionalidades que Geram Pontos

### ✅ JÁ CONFIGURADAS (15 ações)

| # | Ação | action_type | Pontos | Categoria | Limite/Dia |
|---|------|-------------|--------|-----------|------------|
| 1 | Sessão Diária | `daily_session` | 50 | missao | 1 |
| 2 | Missão do Dia | `mission_complete` | 30 | missao | 3 |
| 3 | Comentar Post | `comment` | 5 | social | 10 |
| 4 | Curtir Post | `like` | 2 | social | 20 |
| 5 | Enviar Foto | `photo_upload` | 15 | interacao | 5 |
| 6 | Registrar Peso | `weight_log` | 20 | interacao | 1 |
| 7 | Concluir Meta | `goal_complete` | 100 | desafio | - |
| 8 | Participar Desafio | `challenge_join` | 10 | desafio | 3 |
| 9 | Completar Desafio | `challenge_complete` | 200 | desafio | - |
| 10 | Bônus 7 dias | `streak_bonus_7` | 50 | bonus | - |
| 11 | Bônus 30 dias | `streak_bonus_30` | 200 | bonus | - |
| 12 | Primeiro Acesso | `first_login` | 100 | bonus | - |
| 13 | Perfil Completo | `profile_complete` | 50 | bonus | - |
| 14 | Indicar Amigo | `referral` | 100 | social | - |
| 15 | Compartilhar | `share_post` | 10 | social | 5 |

---

### 🆕 FALTANDO ADICIONAR (35+ ações)

#### 📱 COMUNIDADE / SOCIAL (8 ações)

| # | Ação | action_type | Pontos Sugeridos | Categoria | Limite/Dia |
|---|------|-------------|------------------|-----------|------------|
| 16 | **Criar Post** | `create_post` | 15 | social | 5 |
| 17 | **Criar Story** | `create_story` | 10 | social | 10 |
| 18 | **Visualizar Story** | `view_story` | 1 | social | 50 |
| 19 | **Reagir Post (❤️ 💪 🔥)** | `react_post` | 3 | social | 30 |
| 20 | **Responder Comentário** | `reply_comment` | 5 | social | 10 |
| 21 | **Seguir Usuário** | `follow_user` | 5 | social | 10 |
| 22 | **Ser Seguido** | `get_followed` | 10 | social | - |
| 23 | **Post Destaque (Top 10)** | `trending_post` | 50 | bonus | - |

#### 🏆 DESAFIOS AVANÇADOS (12 ações)

| # | Ação | action_type | Pontos Sugeridos | Categoria | Limite/Dia |
|---|------|-------------|------------------|-----------|------------|
| 24 | **Flash Challenge Completo** | `flash_challenge_complete` | 150 | desafio | - |
| 25 | **Duelo 1v1 Vencido** | `duel_win` | 200 | desafio | 3 |
| 26 | **Duelo 1v1 Participação** | `duel_participate` | 50 | desafio | 5 |
| 27 | **Entrar em Time** | `join_team` | 20 | desafio | 1 |
| 28 | **Criar Time** | `create_team` | 50 | desafio | 1 |
| 29 | **Desafio de Time Completo** | `team_challenge_complete` | 300 | desafio | - |
| 30 | **Batalha Time vs Time Vencida** | `team_battle_win` | 500 | desafio | - |
| 31 | **Contribuir para Time** | `team_contribution` | 10 | desafio | 10 |
| 32 | **Jornada Épica - Checkpoint** | `journey_checkpoint` | 75 | desafio | 7 |
| 33 | **Jornada Épica - Boss Derrotado** | `journey_boss_defeat` | 200 | desafio | - |
| 34 | **Evento Sazonal Completo** | `seasonal_event_complete` | 400 | desafio | - |
| 35 | **Promoção de Liga** | `league_promotion` | 300 | bonus | - |

#### 🎓 CURSOS / EDUCAÇÃO (5 ações)

| # | Ação | action_type | Pontos Sugeridos | Categoria | Limite/Dia |
|---|------|-------------|------------------|-----------|------------|
| 36 | **Assistir Aula** | `watch_lesson` | 20 | educacao | 10 |
| 37 | **Completar Módulo** | `complete_module` | 100 | educacao | 3 |
| 38 | **Completar Curso** | `complete_course` | 500 | educacao | - |
| 39 | **Quiz Acertado** | `quiz_correct` | 15 | educacao | 20 |
| 40 | **Certificado Obtido** | `certificate_earned` | 200 | bonus | - |

#### 💪 EXERCÍCIOS / TREINO (7 ações)

| # | Ação | action_type | Pontos Sugeridos | Categoria | Limite/Dia |
|---|------|-------------|------------------|-----------|------------|
| 41 | **Treino Completo** | `workout_complete` | 100 | exercicio | 3 |
| 42 | **Exercício com Câmera** | `camera_workout` | 150 | exercicio | 5 |
| 43 | **Boa Forma (>80%)** | `good_form_bonus` | 50 | bonus | 10 |
| 44 | **Série Completa** | `set_complete` | 25 | exercicio | 20 |
| 45 | **Conquista de Exercício** | `exercise_achievement` | 100 | bonus | - |
| 46 | **Streak de Treino (7 dias)** | `workout_streak_7` | 100 | bonus | - |
| 47 | **Programa de Treino Completo** | `program_complete` | 300 | exercicio | - |

#### 🥗 NUTRIÇÃO (5 ações)

| # | Ação | action_type | Pontos Sugeridos | Categoria | Limite/Dia |
|---|------|-------------|------------------|-----------|------------|
| 48 | **Registrar Refeição** | `meal_log` | 15 | nutricao | 6 |
| 49 | **Foto de Refeição** | `meal_photo` | 20 | nutricao | 6 |
| 50 | **Análise Sofia** | `sofia_analysis` | 25 | nutricao | 5 |
| 51 | **Meta Calórica Atingida** | `calorie_goal_met` | 50 | nutricao | 1 |
| 52 | **Hidratação Completa (2L)** | `hydration_complete` | 30 | nutricao | 1 |

#### 🏃 TRACKING / MÉTRICAS (6 ações)

| # | Ação | action_type | Pontos Sugeridos | Categoria | Limite/Dia |
|---|------|-------------|------------------|-----------|------------|
| 53 | **Meta de Passos Atingida** | `steps_goal_met` | 40 | tracking | 1 |
| 54 | **Registrar Sono** | `sleep_log` | 15 | tracking | 1 |
| 55 | **Registrar Humor** | `mood_log` | 10 | tracking | 3 |
| 56 | **Registrar Sintomas** | `symptoms_log` | 15 | tracking | 5 |
| 57 | **Conectar Google Fit** | `connect_google_fit` | 50 | bonus | 1 |
| 58 | **Sincronizar Dados** | `sync_health_data` | 5 | tracking | 3 |

#### 🎁 POWER-UPS / ESPECIAIS (4 ações)

| # | Ação | action_type | Pontos Sugeridos | Categoria | Limite/Dia |
|---|------|-------------|------------------|-----------|------------|
| 59 | **Usar Power-up** | `use_powerup` | 0 | especial | - |
| 60 | **Ganhar Power-up** | `earn_powerup` | 20 | bonus | 5 |
| 61 | **Combo Multiplicador (3x)** | `combo_3x` | 100 | bonus | - |
| 62 | **Caixa Presente Aberta** | `mystery_box_open` | 50-200 | bonus | 3 |

#### 🩺 DR. VITAL / SAÚDE (4 ações)

| # | Ação | action_type | Pontos Sugeridos | Categoria | Limite/Dia |
|---|------|-------------|------------------|-----------|------------|
| 63 | **Enviar Exame** | `upload_exam` | 30 | saude | 3 |
| 64 | **Análise Dr. Vital** | `dr_vital_analysis` | 40 | saude | 3 |
| 65 | **Consulta Completa** | `health_consultation` | 100 | saude | 1 |
| 66 | **Streak Saúde (7 dias)** | `health_streak_7` | 75 | bonus | - |

---

## 📊 RESUMO POR CATEGORIA

| Categoria | Ações | Pontos Totais Possíveis/Dia |
|-----------|-------|------------------------------|
| **Social** | 15 | ~500 pts |
| **Desafios** | 15 | ~1000 pts |
| **Educação** | 5 | ~500 pts |
| **Exercício** | 7 | ~800 pts |
| **Nutrição** | 5 | ~200 pts |
| **Tracking** | 6 | ~150 pts |
| **Saúde** | 4 | ~200 pts |
| **Bônus** | 9 | Variável |
| **TOTAL** | **66 ações** | **~3.350 pts/dia** |

---

## 🎮 SISTEMA DE MULTIPLICADORES

### Combos
- **2 dias consecutivos**: 1.25x
- **3 dias consecutivos**: 1.5x
- **5 dias consecutivos**: 2.0x
- **7 dias consecutivos**: 2.5x
- **14 dias consecutivos**: 3.0x (máximo)

### Eventos Especiais
- **Fim de semana**: 1.5x em exercícios
- **Eventos sazonais**: 2.0x em ações do evento
- **Flash challenges**: 1.5x base
- **Batalhas de time**: 2.0x contribuições

### Ligas
- **Bronze**: 1.0x
- **Prata**: 1.1x
- **Ouro**: 1.25x
- **Diamante**: 1.5x
- **Mestre**: 2.0x

---

## 🗄️ TABELAS ENVOLVIDAS

### Principais
1. `user_points` - Pontos acumulados
2. `points_configuration` - Configuração de ações
3. `exercise_points_history` - Histórico exercícios
4. `challenge_participations` - Participações em desafios
5. `health_streaks` - Streaks Dr. Vital

### Desafios Avançados
6. `flash_challenges` - Desafios relâmpago
7. `challenge_duels` - Duelos 1v1
8. `challenge_teams` - Times/Clãs
9. `team_battles` - Batalhas time vs time
10. `challenge_journeys` - Jornadas épicas
11. `seasonal_events` - Eventos sazonais
12. `user_leagues` - Sistema de ligas

### Comunidade
13. `health_feed_posts` - Posts
14. `health_feed_comments` - Comentários
15. `health_feed_stories` - Stories 24h
16. `health_feed_reactions` - Reações

### Educação
17. `courses` - Cursos
18. `course_modules` - Módulos
19. `course_lessons` - Aulas
20. `user_course_progress` - Progresso

### Exercícios
21. `camera_workout_sessions` - Treinos com câmera
22. `exercise_sessions` - Sessões de exercício
23. `exercise_achievements` - Conquistas

### Nutrição
24. `food_analysis` - Análises Sofia
25. `food_history` - Histórico alimentar
26. `daily_nutrition_tracking` - Tracking diário

### Tracking
27. `advanced_daily_tracking` - Tracking avançado
28. `weight_measurements` - Pesagens
29. `google_fit_data` - Dados Google Fit

---

## 🔧 PRÓXIMOS PASSOS

### 1. Adicionar Configurações Faltantes
```sql
INSERT INTO points_configuration (action_type, action_name, points, description, icon, category, max_daily) VALUES
-- Social
('create_post', 'Criar Post', 15, 'Publicar na comunidade', '📝', 'social', 5),
('create_story', 'Criar Story', 10, 'Publicar story 24h', '📸', 'social', 10),
('react_post', 'Reagir Post', 3, 'Reagir com emoji', '❤️', 'social', 30),

-- Desafios
('flash_challenge_complete', 'Flash Challenge', 150, 'Completar desafio relâmpago', '⚡', 'desafio', NULL),
('duel_win', 'Vencer Duelo', 200, 'Vencer duelo 1v1', '⚔️', 'desafio', 3),
('team_battle_win', 'Batalha de Time', 500, 'Time vence batalha', '🏆', 'desafio', NULL),

-- Educação
('watch_lesson', 'Assistir Aula', 20, 'Assistir aula completa', '🎓', 'educacao', 10),
('complete_course', 'Completar Curso', 500, 'Finalizar curso', '🎖️', 'educacao', NULL),

-- Exercício
('workout_complete', 'Treino Completo', 100, 'Completar treino', '💪', 'exercicio', 3),
('camera_workout', 'Treino com Câmera', 150, 'Treino com análise de pose', '📹', 'exercicio', 5),

-- Nutrição
('meal_log', 'Registrar Refeição', 15, 'Registrar refeição', '🍽️', 'nutricao', 6),
('calorie_goal_met', 'Meta Calórica', 50, 'Atingir meta de calorias', '🎯', 'nutricao', 1),

-- Tracking
('steps_goal_met', 'Meta de Passos', 40, 'Atingir meta de passos', '👟', 'tracking', 1),
('sleep_log', 'Registrar Sono', 15, 'Registrar qualidade do sono', '😴', 'tracking', 1),

-- Saúde
('upload_exam', 'Enviar Exame', 30, 'Upload de exame médico', '🩺', 'saude', 3),
('dr_vital_analysis', 'Análise Dr. Vital', 40, 'Análise de exame', '🔬', 'saude', 3)
ON CONFLICT (action_type) DO NOTHING;
```

### 2. Criar Triggers Automáticos
- Trigger ao criar post → adicionar pontos
- Trigger ao completar desafio → adicionar pontos + XP
- Trigger ao assistir aula → adicionar pontos
- Trigger ao registrar refeição → adicionar pontos

### 3. Atualizar Painel Admin
- Adicionar nova categoria "Educação"
- Adicionar nova categoria "Exercício"
- Adicionar nova categoria "Nutrição"
- Adicionar nova categoria "Tracking"
- Adicionar nova categoria "Saúde"

### 4. Implementar Sistema de Caixas Presente
- Caixas ganhas por streaks
- Caixas ganhas por níveis
- Caixas ganhas por eventos
- Recompensas aleatórias (50-200 pts)

---

## 📈 ECONOMIA DE PONTOS

### Ganho Médio Esperado
- **Usuário Casual**: 100-300 pts/dia
- **Usuário Ativo**: 500-1000 pts/dia
- **Usuário Hardcore**: 1500-3000 pts/dia

### Níveis
- **Nível 1**: 0 pts
- **Nível 10**: 10.000 pts
- **Nível 50**: 250.000 pts
- **Nível 100**: 1.000.000 pts

### Tempo para Níveis
- **Nível 10** (casual): ~33 dias
- **Nível 10** (ativo): ~10 dias
- **Nível 50** (casual): ~833 dias
- **Nível 50** (ativo): ~250 dias

---

*Última atualização: Janeiro 2026*
