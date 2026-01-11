-- INVESTIGAR ESTRUTURA REAL DA TABELA USER_ANAMNESIS
-- Execute esta query para listar todas as colunas existentes

SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'user_anamnesis' 
ORDER BY ordinal_position;
