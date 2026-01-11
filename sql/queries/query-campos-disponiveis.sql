-- VER TODOS OS CAMPOS DA ANAMNESE DE UM USUÁRIO
-- Para descobrir quais dados estão realmente disponíveis

SELECT *
FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
LIMIT 1;

-- Query separada para ver só os campos da anamnese
SELECT *
FROM user_anamnesis
LIMIT 1;
