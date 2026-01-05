-- 1. Corrigir admin_logs - remover política permissiva e criar políticas seguras
DROP POLICY IF EXISTS "Admins can view admin logs" ON public.admin_logs;
DROP POLICY IF EXISTS "admin_logs_admin_select" ON public.admin_logs;
DROP POLICY IF EXISTS "admin_logs_admin_insert" ON public.admin_logs;

-- Política para SELECT - apenas admins podem ver
CREATE POLICY "admin_logs_admin_select" ON public.admin_logs
FOR SELECT USING (public.is_admin_user());

-- Política para INSERT - apenas admins podem inserir logs
CREATE POLICY "admin_logs_admin_insert" ON public.admin_logs
FOR INSERT WITH CHECK (public.is_admin_user());

-- 2. Corrigir ai_configurations - remover políticas permissivas
DROP POLICY IF EXISTS "Everyone can view ai config" ON public.ai_configurations;
DROP POLICY IF EXISTS "Allow update ai_configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Allow delete ai_configurations" ON public.ai_configurations;

-- Política para SELECT - todos autenticados podem ler configurações
CREATE POLICY "ai_configurations_authenticated_select" ON public.ai_configurations
FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas de escrita apenas para admins
CREATE POLICY "ai_configurations_admin_update" ON public.ai_configurations
FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "ai_configurations_admin_delete" ON public.ai_configurations
FOR DELETE USING (public.is_admin_user());

CREATE POLICY "ai_configurations_admin_insert" ON public.ai_configurations
FOR INSERT WITH CHECK (public.is_admin_user());

-- 3. Corrigir dr_vital_memory - remover política ALL com true
DROP POLICY IF EXISTS "System can manage dr vital memory" ON public.dr_vital_memory;

CREATE POLICY "dr_vital_memory_user_select" ON public.dr_vital_memory
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "dr_vital_memory_user_insert" ON public.dr_vital_memory
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dr_vital_memory_user_update" ON public.dr_vital_memory
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "dr_vital_memory_user_delete" ON public.dr_vital_memory
FOR DELETE USING (auth.uid() = user_id);

-- 4. Corrigir challenge_group_messages - proteger mensagens
DROP POLICY IF EXISTS "Everyone can view challenge messages" ON public.challenge_group_messages;

CREATE POLICY "challenge_messages_authenticated_select" ON public.challenge_group_messages
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "challenge_messages_user_insert" ON public.challenge_group_messages
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Corrigir configurações_ai
DROP POLICY IF EXISTS "Everyone can view ai configurations" ON public.configurações_ai;

CREATE POLICY "configuracoes_ai_authenticated_select" ON public.configurações_ai
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "configuracoes_ai_admin_all" ON public.configurações_ai
FOR ALL USING (public.is_admin_user());