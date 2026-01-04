-- Corrigir views com SECURITY INVOKER explícito
-- Dropar e recriar com propriedades corretas

DROP VIEW IF EXISTS public."v_ingestão_diária_de_macronutrientes";
DROP VIEW IF EXISTS public.v_user_conversation_summary;

-- Recriar v_ingestão_diária_de_macronutrientes com SECURITY INVOKER
CREATE VIEW public."v_ingestão_diária_de_macronutrientes" 
WITH (security_invoker = true) AS
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

-- Recriar v_user_conversation_summary com SECURITY INVOKER
CREATE VIEW public.v_user_conversation_summary
WITH (security_invoker = true) AS
SELECT user_id,
    count(*) AS total_conversas,
    max(created_at) AS ultima_conversa,
    avg(CASE WHEN sentiment_score IS NOT NULL THEN sentiment_score ELSE 0::numeric END) AS sentimento_medio,
    array_agg(DISTINCT conversation_id) AS conversas_ids
FROM public.chat_emotional_analysis
GROUP BY user_id;