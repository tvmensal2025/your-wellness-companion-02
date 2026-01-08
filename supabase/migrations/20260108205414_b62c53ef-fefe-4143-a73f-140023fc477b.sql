
-- =====================================================
-- FASE 3: CORREÇÃO DE POLÍTICAS RLS (PARTE 3)
-- Corrigir políticas restantes com WITH CHECK (true)
-- =====================================================

-- 1. admin_logs - remover políticas duplicadas e criar correta
DROP POLICY IF EXISTS "System can insert admin logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can insert admin logs" ON public.admin_logs;

CREATE POLICY "Admins can insert admin logs"
ON public.admin_logs
FOR INSERT
WITH CHECK (public.is_admin_user());

-- 2. ai_configurations - remover política permissiva
DROP POLICY IF EXISTS "Allow insert ai_configurations" ON public.ai_configurations;

-- 3. ai_system_logs - corrigir
DROP POLICY IF EXISTS "System can insert AI logs" ON public.ai_system_logs;

CREATE POLICY "Authenticated users can insert AI logs"
ON public.ai_system_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. chat_conversation_history - substituir por política baseada em user_id
DROP POLICY IF EXISTS "Service role full access on chat history" ON public.chat_conversation_history;

CREATE POLICY "Users can access own chat history"
ON public.chat_conversation_history
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. food_analysis_logs - substituir por política baseada em user_id
DROP POLICY IF EXISTS "Service role can manage food logs" ON public.food_analysis_logs;

CREATE POLICY "Users can manage own food analysis logs"
ON public.food_analysis_logs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. food_history - substituir por política baseada em user_id
DROP POLICY IF EXISTS "Service role full access to food_history" ON public.food_history;

CREATE POLICY "Users can manage own food history"
ON public.food_history
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. memória_sofia - substituir por política baseada em user_id
DROP POLICY IF EXISTS "System can manage sofia memory" ON public.memória_sofia;

CREATE POLICY "Users can manage own sofia memory"
ON public.memória_sofia
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. public_report_links - corrigir
DROP POLICY IF EXISTS "Sistema pode atualizar view_count" ON public.public_report_links;
DROP POLICY IF EXISTS "Usuários autenticados podem criar links" ON public.public_report_links;

CREATE POLICY "Users can create own report links"
ON public.public_report_links
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own report links"
ON public.public_report_links
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public links"
ON public.public_report_links
FOR SELECT
USING (true);

-- 9. subscribers - substituir por política baseada em user_id ou email
DROP POLICY IF EXISTS "Service role can manage subscribers" ON public.subscribers;

CREATE POLICY "Users can manage own subscriptions"
ON public.subscribers
FOR ALL
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 10. whatsapp_pending_medical - substituir por política baseada em user_id
DROP POLICY IF EXISTS "Sistema pode gerenciar pendentes" ON public.whatsapp_pending_medical;

CREATE POLICY "Users can manage own pending medical"
ON public.whatsapp_pending_medical
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. whatsapp_pending_nutrition - substituir por política baseada em user_id
DROP POLICY IF EXISTS "Service role can manage all pending nutrition" ON public.whatsapp_pending_nutrition;

CREATE POLICY "Users can manage own pending nutrition"
ON public.whatsapp_pending_nutrition
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 12. whatsapp_scheduled_messages - substituir por política baseada em user_id
DROP POLICY IF EXISTS "Service role can manage scheduled messages" ON public.whatsapp_scheduled_messages;

CREATE POLICY "Users can manage own scheduled messages"
ON public.whatsapp_scheduled_messages
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
