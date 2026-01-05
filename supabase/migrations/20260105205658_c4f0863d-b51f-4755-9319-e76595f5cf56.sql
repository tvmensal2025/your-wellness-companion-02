-- =====================================================
-- MIGRAÇÃO DE SEGURANÇA - TABELAS EXISTENTES
-- =====================================================

-- 1. PROFILES - Proteger dados pessoais
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin_user());

-- 2. CHAT_MESSAGES - Proteger conversas com IA
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can manage own messages" ON public.chat_messages;

CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own messages" ON public.chat_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. CHAT_CONVERSATIONS - Proteger histórico de conversas
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can manage own conversations" ON public.chat_conversations;

CREATE POLICY "Users can view own conversations" ON public.chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own conversations" ON public.chat_conversations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. WEIGHT_MEASUREMENTS - Proteger medições de peso
ALTER TABLE public.weight_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own measurements" ON public.weight_measurements;
DROP POLICY IF EXISTS "Users can manage own measurements" ON public.weight_measurements;

CREATE POLICY "Users can view own measurements" ON public.weight_measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own measurements" ON public.weight_measurements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. ADVANCED_DAILY_TRACKING - Proteger rastreamento diário
ALTER TABLE public.advanced_daily_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tracking" ON public.advanced_daily_tracking;
DROP POLICY IF EXISTS "Users can manage own tracking" ON public.advanced_daily_tracking;

CREATE POLICY "Users can view own tracking" ON public.advanced_daily_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tracking" ON public.advanced_daily_tracking
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. USER_GOALS - Proteger metas do usuário
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can manage own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can view all goals" ON public.user_goals;

CREATE POLICY "Users can view own goals" ON public.user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON public.user_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all goals" ON public.user_goals
  FOR SELECT USING (public.is_admin_user());

-- 7. CHAT_EMOTIONAL_ANALYSIS - Proteger análise emocional
ALTER TABLE public.chat_emotional_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analysis" ON public.chat_emotional_analysis;
DROP POLICY IF EXISTS "Users can manage own analysis" ON public.chat_emotional_analysis;

CREATE POLICY "Users can view own analysis" ON public.chat_emotional_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own analysis" ON public.chat_emotional_analysis
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. CHALLENGE_PARTICIPATIONS - Proteger participações em desafios
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own participations" ON public.challenge_participations;
DROP POLICY IF EXISTS "Users can manage own participations" ON public.challenge_participations;

CREATE POLICY "Users can view own participations" ON public.challenge_participations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own participations" ON public.challenge_participations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. CHALLENGE_DAILY_LOGS - Proteger logs diários de desafios
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own logs via participation" ON public.challenge_daily_logs;
DROP POLICY IF EXISTS "Users can manage own logs" ON public.challenge_daily_logs;

CREATE POLICY "Users can view own logs via participation" ON public.challenge_daily_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.challenge_participations cp 
      WHERE cp.id = challenge_daily_logs.participation_id 
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own logs" ON public.challenge_daily_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.challenge_participations cp 
      WHERE cp.id = challenge_daily_logs.participation_id 
      AND cp.user_id = auth.uid()
    )
  );

-- 10. AI_DOCUMENTS - Proteger documentos de IA
ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ai docs" ON public.ai_documents;
DROP POLICY IF EXISTS "Users can manage own ai docs" ON public.ai_documents;

CREATE POLICY "Users can view own ai docs" ON public.ai_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own ai docs" ON public.ai_documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);