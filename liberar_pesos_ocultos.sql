-- Script para liberar todos os pesos ocultos
-- Define show_weight_results = true para todos os usuários na tabela profiles

-- Atualizar todos os perfis para mostrar resultados de peso
UPDATE profiles 
SET show_weight_results = true
WHERE show_weight_results IS NULL OR show_weight_results = false;

-- Verificar quantos perfis foram atualizados
SELECT 
  COUNT(*) as total_perfis,
  COUNT(*) FILTER (WHERE show_weight_results = true) as perfis_visiveis,
  COUNT(*) FILTER (WHERE show_weight_results = false) as perfis_ocultos
FROM profiles;

