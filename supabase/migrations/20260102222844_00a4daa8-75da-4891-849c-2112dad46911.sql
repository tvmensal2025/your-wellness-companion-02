-- Garantir que o UPsert da anamnese funcione corretamente
-- Cria uma restrição única em user_anamnesis.user_id, sem alterar dados existentes

ALTER TABLE public.user_anamnesis
  ADD CONSTRAINT user_anamnesis_user_id_key UNIQUE (user_id);

-- Opcional: comentar para documentação
COMMENT ON CONSTRAINT user_anamnesis_user_id_key ON public.user_anamnesis IS 'Garante no máximo uma anamnese completa por usuário (necessário para ON CONFLICT ON user_id)';