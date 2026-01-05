# 🗄️ Schema Completo do Banco de Dados

**Última atualização:** 05 de Janeiro de 2026  
**Total de Tabelas:** 236 tabelas

---

## 📋 Índice por Categoria

1. [Usuários e Perfis](#usuários-e-perfis)
2. [Saúde e Medições](#saúde-e-medições)
3. [Nutrição e Alimentação](#nutrição-e-alimentação)
4. [Exercícios e Atividade](#exercícios-e-atividade)
5. [Metas e Gamificação](#metas-e-gamificação)
6. [Cursos e Conteúdo](#cursos-e-conteúdo)
7. [Comunidade e Social](#comunidade-e-social)
8. [IAs e Configurações](#ias-e-configurações)
9. [Integrações Externas](#integrações-externas)
10. [Sistema e Admin](#sistema-e-admin)

---

## 👤 Usuários e Perfis

### profiles
Perfil principal do usuário.

```sql
profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  avatar_url TEXT,
  data_nascimento DATE,
  genero TEXT,
  altura_cm INTEGER,
  peso_inicial NUMERIC,
  peso_meta NUMERIC,
  nivel_atividade TEXT,
  objetivo TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  subscription_status TEXT,
  subscription_plan TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### user_anamnesis
Anamnese médica completa do usuário.

```sql
user_anamnesis (
  id UUID PRIMARY KEY,
  user_id UUID,
  
  -- Histórico médico
  medical_history JSONB,
  current_medications TEXT[],
  allergies TEXT[],
  chronic_conditions TEXT[],
  surgeries TEXT[],
  family_history JSONB,
  
  -- Estilo de vida
  smoking_status TEXT,
  alcohol_consumption TEXT,
  physical_activity_level TEXT,
  sleep_quality_score INTEGER,
  daily_stress_level INTEGER,
  
  -- Alimentação
  dietary_restrictions TEXT[],
  food_preferences TEXT[],
  eating_habits JSONB,
  water_intake_daily INTEGER,
  
  -- Objetivos
  health_goals TEXT[],
  weight_loss_attempts TEXT,
  motivation_factors TEXT[],
  
  -- Relacionamento com comida
  emotional_eating BOOLEAN,
  binge_eating BOOLEAN,
  food_relationship_notes TEXT,
  
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### user_physical_data
Dados físicos do usuário.

```sql
user_physical_data (
  id UUID PRIMARY KEY,
  user_id UUID,
  altura_cm NUMERIC,
  peso_kg NUMERIC,
  imc NUMERIC,
  sexo TEXT,
  idade INTEGER,
  circunferencia_cintura NUMERIC,
  circunferencia_quadril NUMERIC,
  biotipo TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

## 🏥 Saúde e Medições

### weight_measurements
Medições de peso e composição corporal.

```sql
weight_measurements (
  id UUID PRIMARY KEY,
  user_id UUID,
  peso_kg NUMERIC NOT NULL,
  imc NUMERIC,
  
  -- Composição corporal (bioimpedância)
  gordura_corporal_percent NUMERIC,
  massa_muscular_kg NUMERIC,
  agua_corporal_percent NUMERIC,
  massa_ossea_kg NUMERIC,
  taxa_metabolica_basal INTEGER,
  gordura_visceral INTEGER,
  idade_corporal INTEGER,
  proteina_percent NUMERIC,
  
  -- Medidas
  circunferencia_abdominal_cm NUMERIC,
  circunferencia_braco_cm NUMERIC,
  circunferencia_coxa_cm NUMERIC,
  
  -- Risco
  risco_cardiometabolico TEXT,
  
  -- Metadados
  measurement_date DATE,
  source TEXT, -- 'manual', 'xiaomi', 'google_fit'
  notes TEXT,
  created_at TIMESTAMPTZ
)
```

### sleep_tracking
Monitoramento de sono.

```sql
sleep_tracking (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  hours_slept NUMERIC,
  sleep_quality INTEGER, -- 1-10
  bedtime TIME,
  wake_time TIME,
  deep_sleep_hours NUMERIC,
  rem_sleep_hours NUMERIC,
  light_sleep_hours NUMERIC,
  awake_time_minutes INTEGER,
  sleep_efficiency NUMERIC,
  notes TEXT,
  source TEXT,
  created_at TIMESTAMPTZ
)
```

### mood_tracking
Monitoramento de humor.

```sql
mood_tracking (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  mood_score INTEGER, -- 1-10
  energy_level INTEGER, -- 1-10
  stress_level INTEGER, -- 1-10
  anxiety_level INTEGER, -- 1-10
  emotions TEXT[], -- ['feliz', 'ansioso', 'cansado']
  notes TEXT,
  created_at TIMESTAMPTZ
)
```

### heart_rate_data
Dados de frequência cardíaca.

```sql
heart_rate_data (
  id UUID PRIMARY KEY,
  user_id UUID,
  bpm INTEGER,
  resting_bpm INTEGER,
  max_bpm INTEGER,
  min_bpm INTEGER,
  recorded_at TIMESTAMPTZ,
  source TEXT,
  activity_type TEXT,
  created_at TIMESTAMPTZ
)
```

### medical_documents
Documentos médicos.

```sql
medical_documents (
  id UUID PRIMARY KEY,
  user_id UUID,
  document_type TEXT, -- 'exame', 'receita', 'atestado'
  title TEXT,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Processamento IA
  status TEXT, -- 'pending', 'processing', 'completed', 'error'
  extracted_data JSONB,
  ai_analysis TEXT,
  
  -- Metadados
  document_date DATE,
  doctor_name TEXT,
  clinic_name TEXT,
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### prescriptions
Prescrições médicas.

```sql
prescriptions (
  id UUID PRIMARY KEY,
  user_id UUID,
  medication_name TEXT,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  prescriber TEXT,
  notes TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
```

### user_supplements
Suplementos do usuário.

```sql
user_supplements (
  id UUID PRIMARY KEY,
  user_id UUID,
  supplement_name TEXT,
  brand TEXT,
  dosage TEXT,
  frequency TEXT,
  purpose TEXT,
  is_active BOOLEAN,
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ
)
```

---

## 🍎 Nutrição e Alimentação

### nutrition_tracking
Rastreamento nutricional diário.

```sql
nutrition_tracking (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  meal_type TEXT, -- 'cafe_manha', 'almoco', 'lanche', 'jantar', 'ceia'
  foods_consumed TEXT[],
  calories INTEGER,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  sodium_mg INTEGER,
  water_ml INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ
)
```

### food_analysis
Análises de alimentos por IA.

```sql
food_analysis (
  id UUID PRIMARY KEY,
  user_id UUID,
  meal_type TEXT,
  image_url TEXT,
  
  -- Alimentos detectados
  foods_detected JSONB,
  portion_sizes JSONB,
  
  -- Valores nutricionais
  total_calories INTEGER,
  total_protein NUMERIC,
  total_carbs NUMERIC,
  total_fat NUMERIC,
  total_fiber NUMERIC,
  
  -- Análise IA
  health_score INTEGER, -- 1-100
  suggestions TEXT[],
  warnings TEXT[],
  
  -- Status
  confirmed BOOLEAN DEFAULT false,
  user_adjustments JSONB,
  
  created_at TIMESTAMPTZ
)
```

### water_tracking
Monitoramento de hidratação.

```sql
water_tracking (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  amount_ml INTEGER,
  total_daily_ml INTEGER,
  goal_ml INTEGER,
  created_at TIMESTAMPTZ
)
```

### nutrition_foods
Base de alimentos.

```sql
nutrition_foods (
  id UUID PRIMARY KEY,
  food_name TEXT NOT NULL,
  category TEXT,
  portion_size TEXT,
  portion_weight_g NUMERIC,
  
  -- Macros por porção
  calories NUMERIC,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  sugar_g NUMERIC,
  sodium_mg NUMERIC,
  
  -- Micros
  vitamins JSONB,
  minerals JSONB,
  
  -- Metadados
  source TEXT, -- 'taco', 'usda', 'manual'
  is_verified BOOLEAN,
  created_at TIMESTAMPTZ
)
```

### nutrition_aliases
Aliases para normalização de nomes.

```sql
nutrition_aliases (
  id UUID PRIMARY KEY,
  food_id UUID REFERENCES nutrition_foods,
  alias TEXT,
  alias_normalized TEXT,
  created_at TIMESTAMPTZ
)
```

### meal_plans
Planos de refeição.

```sql
meal_plans (
  id UUID PRIMARY KEY,
  user_id UUID,
  plan_name TEXT,
  start_date DATE,
  end_date DATE,
  meals JSONB, -- estrutura de refeições por dia
  total_daily_calories INTEGER,
  created_by TEXT, -- 'ai', 'nutritionist', 'user'
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
```

---

## 💪 Exercícios e Atividade

### exercise_tracking
Registro de exercícios.

```sql
exercise_tracking (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  exercise_type TEXT,
  exercise_name TEXT,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  intensity TEXT, -- 'leve', 'moderado', 'intenso'
  heart_rate_avg INTEGER,
  distance_km NUMERIC,
  sets INTEGER,
  reps INTEGER,
  weight_kg NUMERIC,
  notes TEXT,
  source TEXT,
  created_at TIMESTAMPTZ
)
```

### workout_plans
Planos de treino.

```sql
workout_plans (
  id UUID PRIMARY KEY,
  user_id UUID,
  plan_name TEXT,
  description TEXT,
  goal TEXT,
  difficulty TEXT,
  duration_weeks INTEGER,
  workouts_per_week INTEGER,
  exercises JSONB,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
```

### google_fit_data
Dados sincronizados do Google Fit.

```sql
google_fit_data (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  
  -- Atividade
  steps INTEGER,
  calories INTEGER,
  distance_meters INTEGER,
  active_minutes INTEGER,
  
  -- Cardio
  heart_rate_avg INTEGER,
  heart_rate_min INTEGER,
  heart_rate_max INTEGER,
  heart_rate_resting INTEGER,
  
  -- Sono
  sleep_hours NUMERIC,
  sleep_efficiency NUMERIC,
  sleep_stages JSONB,
  
  -- Corpo
  weight_kg NUMERIC,
  height_cm INTEGER,
  bmi NUMERIC,
  body_fat_percentage NUMERIC,
  muscle_mass_kg NUMERIC,
  
  -- Hidratação
  hydration_ml INTEGER,
  water_intake_ml INTEGER,
  
  -- Nutrição
  nutrition_calories INTEGER,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  
  -- Metadados
  sync_timestamp TIMESTAMPTZ,
  data_quality INTEGER,
  raw_data JSONB,
  
  UNIQUE(user_id, date)
)
```

---

## 🎯 Metas e Gamificação

### user_goals
Metas do usuário.

```sql
user_goals (
  id UUID PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'peso', 'exercicio', 'nutricao', 'sono'
  
  -- Valores
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  
  -- Datas
  start_date DATE,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Configurações
  difficulty TEXT,
  is_group_goal BOOLEAN DEFAULT false,
  evidence_required BOOLEAN DEFAULT false,
  
  -- Gamificação
  estimated_points INTEGER,
  challenge_id UUID,
  
  -- Status
  status TEXT DEFAULT 'active',
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### goal_updates
Atualizações de progresso.

```sql
goal_updates (
  id UUID PRIMARY KEY,
  goal_id UUID REFERENCES user_goals,
  user_id UUID,
  previous_value NUMERIC,
  new_value NUMERIC,
  notes TEXT,
  evidence_url TEXT,
  created_at TIMESTAMPTZ
)
```

### challenges
Desafios disponíveis.

```sql
challenges (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT,
  difficulty TEXT,
  
  -- Configurações
  duration_days INTEGER,
  start_date DATE,
  end_date DATE,
  target_value NUMERIC,
  target_unit TEXT,
  
  -- Recompensas
  points_reward INTEGER,
  xp_reward INTEGER,
  badge_name TEXT,
  badge_icon TEXT,
  
  -- Regras
  rules TEXT,
  tips TEXT[],
  requirements JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  max_participants INTEGER,
  
  created_at TIMESTAMPTZ
)
```

### challenge_participations
Participações em desafios.

```sql
challenge_participations (
  id UUID PRIMARY KEY,
  challenge_id UUID REFERENCES challenges,
  user_id UUID,
  
  -- Progresso
  progress NUMERIC DEFAULT 0,
  target_value NUMERIC,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  
  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  points_earned INTEGER DEFAULT 0,
  
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
```

### user_achievements
Conquistas desbloqueadas.

```sql
user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID,
  achievement_name TEXT,
  achievement_type TEXT,
  description TEXT,
  badge_icon TEXT,
  points_value INTEGER,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
```

### user_points
Sistema de pontos.

```sql
user_points (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER,
  updated_at TIMESTAMPTZ
)
```

### daily_mission_sessions
Sessões de missões diárias.

```sql
daily_mission_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  
  -- Missões
  missions_completed INTEGER DEFAULT 0,
  missions_total INTEGER,
  missions_data JSONB,
  
  -- Pontos
  points_earned INTEGER DEFAULT 0,
  bonus_earned INTEGER DEFAULT 0,
  
  -- Status
  is_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ
)
```

---

## 📚 Cursos e Conteúdo

### courses
Cursos disponíveis.

```sql
courses (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  instructor TEXT,
  category TEXT,
  difficulty TEXT,
  duration_hours NUMERIC,
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  
  -- Preço
  price NUMERIC,
  
  -- Ordem
  order_index INTEGER,
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### course_modules
Módulos de cursos.

```sql
course_modules (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)
```

### lessons
Aulas.

```sql
lessons (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES course_modules,
  course_id UUID REFERENCES courses,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  
  -- Conteúdo
  content TEXT,
  resources JSONB,
  
  -- Status
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER,
  
  created_at TIMESTAMPTZ
)
```

### lesson_progress
Progresso nas aulas.

```sql
lesson_progress (
  id UUID PRIMARY KEY,
  user_id UUID,
  lesson_id UUID REFERENCES lessons,
  course_id UUID,
  
  -- Progresso
  progress_percent NUMERIC DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  -- Tempo
  watch_time_seconds INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### sessions
Sessões de conteúdo (meditações, reflexões).

```sql
sessions (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT, -- 'meditacao', 'reflexao', 'exercicio'
  category TEXT,
  
  -- Mídia
  audio_url TEXT,
  video_url TEXT,
  image_url TEXT,
  
  -- Conteúdo
  content TEXT,
  script TEXT,
  
  -- Duração
  duration_minutes INTEGER,
  
  -- Status
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER,
  
  created_at TIMESTAMPTZ
)
```

---

## 👥 Comunidade e Social

### community_posts
Posts da comunidade.

```sql
community_posts (
  id UUID PRIMARY KEY,
  user_id UUID,
  
  -- Conteúdo
  content TEXT,
  image_url TEXT,
  post_type TEXT, -- 'texto', 'foto', 'progresso', 'conquista'
  
  -- Métricas
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Privacidade
  is_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### comments
Comentários.

```sql
comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES community_posts,
  user_id UUID,
  parent_comment_id UUID, -- para respostas
  content TEXT,
  created_at TIMESTAMPTZ
)
```

### likes
Curtidas.

```sql
likes (
  id UUID PRIMARY KEY,
  post_id UUID,
  comment_id UUID,
  user_id UUID,
  created_at TIMESTAMPTZ,
  UNIQUE(post_id, user_id),
  UNIQUE(comment_id, user_id)
)
```

### follows
Seguidores.

```sql
follows (
  id UUID PRIMARY KEY,
  follower_id UUID,
  following_id UUID,
  created_at TIMESTAMPTZ,
  UNIQUE(follower_id, following_id)
)
```

---

## 🤖 IAs e Configurações

### ai_configurations
Configurações de IA.

```sql
ai_configurations (
  id UUID PRIMARY KEY,
  functionality TEXT NOT NULL, -- 'dr_vital_chat', 'chat_daily', etc
  service TEXT DEFAULT 'lovable',
  model TEXT DEFAULT 'google/gemini-2.5-flash',
  max_tokens INTEGER DEFAULT 1024,
  temperature NUMERIC DEFAULT 0.7,
  system_prompt TEXT,
  personality TEXT,
  level TEXT,
  is_enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  cost_per_request NUMERIC DEFAULT 0.01,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### conversations
Conversas com IAs.

```sql
conversations (
  id UUID PRIMARY KEY,
  user_id UUID,
  agent TEXT, -- 'sofia', 'dr_vital'
  title TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
```

### conversation_messages
Mensagens de conversas.

```sql
conversation_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations,
  role TEXT, -- 'user', 'assistant'
  content TEXT,
  model TEXT, -- modelo usado
  tokens_used INTEGER,
  created_at TIMESTAMPTZ
)
```

### user_conversations
Histórico permanente de conversas.

```sql
user_conversations (
  id UUID PRIMARY KEY,
  user_id UUID,
  conversation_id TEXT,
  message_role TEXT,
  message_content TEXT,
  timestamp TIMESTAMPTZ,
  session_metadata JSONB,
  analysis_type TEXT,
  context JSONB,
  created_at TIMESTAMPTZ
)
```

### dr_vital_memory
Memória de longo prazo do Dr. Vital.

```sql
dr_vital_memory (
  id UUID PRIMARY KEY,
  user_id UUID,
  key TEXT, -- 'long_term_summary', 'allergies', 'chronic_flags'
  value JSONB,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, key)
)
```

### base_de_conhecimento_sofia
Base de conhecimento da Sofia.

```sql
base_de_conhecimento_sofia (
  id UUID PRIMARY KEY,
  categoria TEXT NOT NULL,
  topico TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  fonte TEXT,
  referencias TEXT[],
  tags TEXT[],
  relevancia INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### ai_usage_logs
Logs de uso de IA.

```sql
ai_usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  service_name TEXT,
  model TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost NUMERIC,
  created_at TIMESTAMPTZ
)
```

---

## 🔗 Integrações Externas

### google_fit_tokens
Tokens do Google Fit.

```sql
google_fit_tokens (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  token_type TEXT DEFAULT 'Bearer',
  scope TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### n8n_webhooks
Webhooks n8n.

```sql
n8n_webhooks (
  id UUID PRIMARY KEY,
  name TEXT,
  url TEXT,
  event_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)
```

### n8n_webhook_logs
Logs de webhooks.

```sql
n8n_webhook_logs (
  id UUID PRIMARY KEY,
  webhook_id UUID REFERENCES n8n_webhooks,
  status TEXT,
  response JSONB,
  created_at TIMESTAMPTZ
)
```

---

## ⚙️ Sistema e Admin

### admin_logs
Logs de ações administrativas.

```sql
admin_logs (
  id UUID PRIMARY KEY,
  admin_id UUID,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ
)
```

### company_configurations
Configurações da empresa.

```sql
company_configurations (
  id UUID PRIMARY KEY,
  company_name TEXT,
  mission TEXT,
  vision TEXT,
  values TEXT,
  about_us TEXT,
  main_services TEXT,
  differentials TEXT,
  target_audience TEXT,
  health_philosophy TEXT,
  company_culture TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### daily_responses
Respostas diárias dos usuários.

```sql
daily_responses (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  section TEXT, -- 'morning', 'evening', 'saboteurs'
  question_id TEXT,
  answer TEXT,
  text_response TEXT,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ
)
```

---

## 📊 Estatísticas

| Categoria | Quantidade |
|-----------|------------|
| Usuários e Perfis | 5 tabelas |
| Saúde e Medições | 7 tabelas |
| Nutrição | 8 tabelas |
| Exercícios | 4 tabelas |
| Metas e Gamificação | 8 tabelas |
| Cursos | 5 tabelas |
| Comunidade | 4 tabelas |
| IAs | 8 tabelas |
| Integrações | 3 tabelas |
| Sistema | 3+ tabelas |
| **Total Principal** | ~55 tabelas |
| **Total Geral** | 236 tabelas |

---

## 🔐 Políticas RLS

### Padrão de Políticas

```sql
-- Usuários veem apenas seus dados
CREATE POLICY "Users see own data" ON table_name
FOR SELECT USING (auth.uid() = user_id);

-- Usuários inserem apenas seus dados
CREATE POLICY "Users insert own data" ON table_name
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários atualizam apenas seus dados
CREATE POLICY "Users update own data" ON table_name
FOR UPDATE USING (auth.uid() = user_id);

-- Admins têm acesso total
CREATE POLICY "Admins full access" ON table_name
USING (
  auth.jwt()->'app_metadata'->>'role' = 'admin' OR
  auth.jwt()->'user_metadata'->>'role' = 'admin'
);
```

---

*Documentação gerada em 05/01/2026*
