-- Atualizar a função queue_lead_webhook para usar a nova URL de destino
CREATE OR REPLACE FUNCTION public.queue_lead_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO webhook_queue (event_type, user_id, payload, destination_url)
  VALUES (
    CASE WHEN TG_OP = 'INSERT' THEN 'new_user' ELSE 'user_updated' END,
    NEW.user_id,
    jsonb_build_object(
      'event', CASE WHEN TG_OP = 'INSERT' THEN 'new_user' ELSE 'user_updated' END,
      'source', 'mission-health-nexus',
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
    'https://tljbxoakdzuipkxkecph.supabase.co/functions/v1/receive-leads'
  );
  RETURN NEW;
END;
$function$;