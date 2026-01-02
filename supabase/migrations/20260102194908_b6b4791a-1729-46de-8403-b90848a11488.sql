-- ========================================
-- TABELAS ADICIONAIS - PARTE 4
-- ========================================

-- Adicionar coluna text_response em daily_responses
ALTER TABLE public.daily_responses 
ADD COLUMN IF NOT EXISTS text_response TEXT;

-- Adicionar colunas faltantes em supplements
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- FOOD_ANALYSIS (Análise de alimentos)
CREATE TABLE IF NOT EXISTS public.food_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_items TEXT[],
  meal_type TEXT,
  nutrition_analysis JSONB,
  total_calories INTEGER,
  total_proteins DECIMAL(5,2),
  total_carbs DECIMAL(5,2),
  total_fats DECIMAL(5,2),
  health_rating INTEGER,
  recommendations TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PREVENTIVE_HEALTH_ANALYSES (Análises preventivas)
CREATE TABLE IF NOT EXISTS public.preventive_health_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT,
  risk_score INTEGER,
  risk_factors JSONB,
  recommendations JSONB,
  health_indicators JSONB,
  lifestyle_score INTEGER,
  action_plan TEXT,
  next_steps TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS (Notificações)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHAT_MESSAGES (Mensagens de chat)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  content TEXT,
  personality TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADMIN_LOGS (Logs administrativos)
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WORKOUT_PLANS (Planos de treino)
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  goal TEXT,
  difficulty TEXT,
  duration_weeks INTEGER,
  workouts_per_week INTEGER,
  exercises JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MEAL_PLANS (Planos alimentares)
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  goal TEXT,
  daily_calories INTEGER,
  daily_proteins DECIMAL(5,2),
  daily_carbs DECIMAL(5,2),
  daily_fats DECIMAL(5,2),
  meals JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS
ALTER TABLE public.food_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_health_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS
CREATE POLICY "Users can view own food analysis" ON public.food_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food analysis" ON public.food_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own preventive analyses" ON public.preventive_health_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preventive analyses" ON public.preventive_health_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view admin logs" ON public.admin_logs FOR SELECT USING (true);
CREATE POLICY "Admins can insert admin logs" ON public.admin_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own workout plans" ON public.workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout plans" ON public.workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout plans" ON public.workout_plans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own meal plans" ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal plans" ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal plans" ON public.meal_plans FOR UPDATE USING (auth.uid() = user_id);

-- TRIGGERS
CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ÍNDICES
CREATE INDEX idx_food_analysis_user ON public.food_analysis(user_id);
CREATE INDEX idx_preventive_health_user ON public.preventive_health_analyses(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_chat_messages_user ON public.chat_messages(user_id);
CREATE INDEX idx_admin_logs_admin ON public.admin_logs(admin_id);
CREATE INDEX idx_workout_plans_user ON public.workout_plans(user_id);
CREATE INDEX idx_meal_plans_user ON public.meal_plans(user_id);