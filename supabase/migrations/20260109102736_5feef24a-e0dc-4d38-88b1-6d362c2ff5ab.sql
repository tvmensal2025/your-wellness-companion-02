-- Criar trigger para enfileirar webhooks automaticamente quando um perfil é criado ou atualizado
CREATE TRIGGER on_profile_insert_or_update
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_lead_webhook();