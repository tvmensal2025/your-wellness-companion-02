-- Tabela de fila de webhooks para sincronização de leads
CREATE TABLE public.webhook_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  payload jsonb NOT NULL,
  destination_url text NOT NULL,
  status text DEFAULT 'pending',
  attempts int DEFAULT 0,
  last_error text,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

-- Habilitar RLS
ALTER TABLE public.webhook_queue ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todos os webhooks
CREATE POLICY "Admins can manage webhook_queue"
ON public.webhook_queue
FOR ALL
USING (public.is_admin_user());

-- Função que adiciona webhook na fila quando perfil é criado/atualizado
CREATE OR REPLACE FUNCTION public.queue_lead_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO webhook_queue (event_type, user_id, payload, destination_url)
  VALUES (
    CASE WHEN TG_OP = 'INSERT' THEN 'new_user' ELSE 'user_updated' END,
    NEW.user_id,
    jsonb_build_object(
      'event', CASE WHEN TG_OP = 'INSERT' THEN 'new_user' ELSE 'user_updated' END,
      'source', 'instituto-dos-sonhos-maxnutrition',
      'timestamp', now(),
      'lead', jsonb_build_object(
        'user_id', NEW.user_id,
        'full_name', NEW.full_name,
        'email', NEW.email,
        'phone', NEW.phone,
        'city', NEW.city,
        'state', NEW.state,
        'birth_date', NEW.birth_date,
        'gender', NEW.gender
      ),
      'health_profile', jsonb_build_object(
        'height_cm', NEW.height,
        'current_weight_kg', NEW.current_weight,
        'target_weight_kg', NEW.target_weight,
        'activity_level', NEW.activity_level,
        'fitness_level', NEW.fitness_level
      ),
      'engagement', jsonb_build_object(
        'points', COALESCE(NEW.points, 0),
        'signup_date', NEW.created_at,
        'last_activity', NEW.updated_at
      )
    ),
    'https://financeiromaxnutrition.lovable.app/functions/v1/receive-leads'
  );
  RETURN NEW;
END;
$$;

-- Trigger na tabela profiles
CREATE TRIGGER trigger_lead_sync
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.queue_lead_webhook();