-- QUERY ADAPTATIVA - TENTA BUSCAR DADOS DE ONDE ESTIVEREM DISPONÍVEIS
-- Se não estiver na anamnese, busca no profile ou retorna NULL

SELECT 
    ua.id as anamnesis_id,
    ua.user_id,
    p.full_name as nome_usuario,
    p.email,
    
    -- Tenta pegar peso do profile se não tiver na anamnese (baseado na sugestão do erro)
    p.current_weight as peso_profile,
    
    -- Dados básicos da anamnese que confirmamos existir
    ua.created_at,
    ua.updated_at

FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC;
