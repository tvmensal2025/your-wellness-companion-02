-- =============================================
-- RLS POLICIES PARA TABELAS SEM POLÍTICAS
-- =============================================

-- 1. ai_system_logs - Logs do sistema AI (apenas admin pode ver, usuário vê seus próprios)
CREATE POLICY "Users can view their own AI logs"
ON public.ai_system_logs
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "System can insert AI logs"
ON public.ai_system_logs
FOR INSERT
WITH CHECK (true);

-- 2. food_active_principles - Dados públicos de referência (leitura pública)
CREATE POLICY "Anyone can read food active principles"
ON public.food_active_principles
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage food active principles"
ON public.food_active_principles
FOR ALL
USING (public.is_admin_user());

-- 3. meal_plan_items - Itens do plano alimentar (usuário vê seus próprios via meal_plan)
CREATE POLICY "Users can view their meal plan items"
ON public.meal_plan_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.meal_plans mp 
        WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
    ) OR public.is_admin_user()
);

CREATE POLICY "Users can insert their meal plan items"
ON public.meal_plan_items
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.meal_plans mp 
        WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
    ) OR public.is_admin_user()
);

CREATE POLICY "Users can update their meal plan items"
ON public.meal_plan_items
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.meal_plans mp 
        WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
    ) OR public.is_admin_user()
);

CREATE POLICY "Users can delete their meal plan items"
ON public.meal_plan_items
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.meal_plans mp 
        WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
    ) OR public.is_admin_user()
);

-- 4. mock_users - Apenas admin pode acessar
CREATE POLICY "Only admins can access mock users"
ON public.mock_users
FOR ALL
USING (public.is_admin_user());

-- 5. nutritional_yields - Dados públicos de referência
CREATE POLICY "Anyone can read nutritional yields"
ON public.nutritional_yields
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage nutritional yields"
ON public.nutritional_yields
FOR ALL
USING (public.is_admin_user());

-- 6. premium_report_events - Eventos de relatório (usuário vê seus próprios)
CREATE POLICY "Users can view their premium report events"
ON public.premium_report_events
FOR SELECT
USING (triggered_by = auth.uid() OR public.is_admin_user());

CREATE POLICY "Users can insert their premium report events"
ON public.premium_report_events
FOR INSERT
WITH CHECK (triggered_by = auth.uid() OR public.is_admin_user());

-- 7. recipe_components - Componentes de receitas (público para leitura)
CREATE POLICY "Anyone can read recipe components"
ON public.recipe_components
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage recipe components"
ON public.recipe_components
FOR ALL
USING (public.is_admin_user());

-- 8. recipe_items - Itens de receitas (público para leitura)
CREATE POLICY "Anyone can read recipe items"
ON public.recipe_items
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage recipe items"
ON public.recipe_items
FOR ALL
USING (public.is_admin_user());

-- 9. users_needing_analysis - Apenas admin e próprio usuário
CREATE POLICY "Users can view their analysis queue"
ON public.users_needing_analysis
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin_user());

CREATE POLICY "System can manage analysis queue"
ON public.users_needing_analysis
FOR ALL
USING (public.is_admin_user());

-- =============================================
-- CORRIGIR SECURITY DEFINER VIEWS
-- Recriar como SECURITY INVOKER (padrão)
-- =============================================

-- Dropar e recriar view v_ingestão_diária_de_macronutrientes
DROP VIEW IF EXISTS public."v_ingestão_diária_de_macronutrientes";

CREATE VIEW public."v_ingestão_diária_de_macronutrientes" AS
SELECT user_id,
    data,
    sum(total_proteinas) AS proteinas_dia,
    sum(total_carboidratos) AS carboidratos_dia,
    sum(total_gorduras) AS gorduras_dia,
    sum(total_calorias) AS calorias_dia,
    sum(total_fibras) AS fibras_dia,
    sum(total_agua_ml) AS agua_ml_dia,
    avg(score_saude) AS score_medio,
    count(*) AS registros_dia
FROM public."resumo_nutricional_diário"
GROUP BY user_id, data;

-- Dropar e recriar view v_user_conversation_summary
DROP VIEW IF EXISTS public.v_user_conversation_summary;

CREATE VIEW public.v_user_conversation_summary AS
SELECT user_id,
    count(*) AS total_conversas,
    max(created_at) AS ultima_conversa,
    avg(CASE WHEN sentiment_score IS NOT NULL THEN sentiment_score ELSE 0::numeric END) AS sentimento_medio,
    array_agg(DISTINCT conversation_id) AS conversas_ids
FROM public.chat_emotional_analysis
GROUP BY user_id;