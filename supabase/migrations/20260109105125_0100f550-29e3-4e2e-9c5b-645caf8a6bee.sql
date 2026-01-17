-- 1. Criar tabela webhook_destinations para múltiplos destinos
CREATE TABLE IF NOT EXISTS public.webhook_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret_key TEXT,
  is_active BOOLEAN DEFAULT true,
  headers JSONB DEFAULT '{}',
  events TEXT[] DEFAULT ARRAY['new_user', 'user_updated'],
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Adicionar novos campos na webhook_queue
ALTER TABLE public.webhook_queue 
ADD COLUMN IF NOT EXISTS destination_id UUID REFERENCES public.webhook_destinations(id),
ADD COLUMN IF NOT EXISTS response_code INTEGER,
ADD COLUMN IF NOT EXISTS response_body TEXT,
ADD COLUMN IF NOT EXISTS headers_sent JSONB,
ADD COLUMN IF NOT EXISTS execution_time_ms INTEGER;

-- 3. Remover trigger duplicado se existir
DROP TRIGGER IF EXISTS trigger_lead_sync ON public.profiles;

-- 4. Criar função melhorada queue_lead_webhook
CREATE OR REPLACE FUNCTION public.queue_lead_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  destination RECORD;
  event_type TEXT;
  lead_payload JSONB;
BEGIN
  event_type := CASE WHEN TG_OP = 'INSERT' THEN 'new_user' ELSE 'user_updated' END;
  
  -- Payload padronizado compatível com CRMs
  lead_payload := jsonb_build_object(
    'event', CASE WHEN TG_OP = 'INSERT' THEN 'lead.created' ELSE 'lead.updated' END,
    'event_type', event_type,
    'timestamp', now(),
    'source', 'instituto-dos-sonhos-maxnutrition',
    'webhook_id', gen_random_uuid(),
    
    'contact', jsonb_build_object(
      'id', NEW.user_id,
      'email', NEW.email,
      'phone', NEW.phone,
      'full_name', NEW.full_name,
      'first_name', split_part(COALESCE(NEW.full_name, ''), ' ', 1),
      'last_name', NULLIF(substring(NEW.full_name from position(' ' in COALESCE(NEW.full_name, '')) + 1), '')
    ),
    
    'location', jsonb_build_object(
      'city', NEW.city,
      'state', NEW.state,
      'country', 'BR'
    ),
    
    'profile', jsonb_build_object(
      'gender', NEW.gender,
      'birth_date', NEW.birth_date,
      'age', CASE 
        WHEN NEW.birth_date IS NOT NULL 
        THEN EXTRACT(YEAR FROM age(NEW.birth_date))::INTEGER 
        ELSE NULL 
      END
    ),
    
    'health_data', jsonb_build_object(
      'height_cm', NEW.height,
      'current_weight_kg', NEW.current_weight,
      'target_weight_kg', NEW.target_weight,
      'activity_level', NEW.activity_level,
      'fitness_level', NEW.fitness_level
    ),
    
    'engagement', jsonb_build_object(
      'points', COALESCE(NEW.points, 0),
      'registered_at', NEW.created_at,
      'last_activity', NEW.updated_at
    ),
    
    'meta', jsonb_build_object(
      'raw_event', event_type,
      'table_name', TG_TABLE_NAME
    )
  );

  -- Inserir na fila para cada destino ativo que aceita este evento
  FOR destination IN 
    SELECT * FROM webhook_destinations 
    WHERE is_active = true 
    AND event_type = ANY(events)
  LOOP
    INSERT INTO webhook_queue (
      event_type, 
      user_id, 
      payload, 
      destination_url,
      destination_id,
      headers_sent
    )
    VALUES (
      event_type,
      NEW.user_id,
      lead_payload,
      destination.url,
      destination.id,
      destination.headers
    );
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 5. Habilitar RLS na webhook_destinations
ALTER TABLE public.webhook_destinations ENABLE ROW LEVEL SECURITY;

-- 6. Política para admins gerenciarem destinos
CREATE POLICY "Admins can manage webhook destinations"
ON public.webhook_destinations
FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_queue_destination_id ON public.webhook_queue(destination_id);
CREATE INDEX IF NOT EXISTS idx_webhook_destinations_active ON public.webhook_destinations(is_active) WHERE is_active = true;

-- 8. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_webhook_destinations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS update_webhook_destinations_timestamp ON public.webhook_destinations;
CREATE TRIGGER update_webhook_destinations_timestamp
  BEFORE UPDATE ON public.webhook_destinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_webhook_destinations_updated_at();