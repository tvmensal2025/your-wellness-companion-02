-- Alinhar schema existente de goal_updates com o código (new_value / previous_value)
ALTER TABLE public.goal_updates
  ADD COLUMN IF NOT EXISTS previous_value NUMERIC,
  ADD COLUMN IF NOT EXISTS new_value NUMERIC;

-- Backfill para dados antigos (coluna `value` -> `new_value`)
UPDATE public.goal_updates
SET new_value = value
WHERE new_value IS NULL AND value IS NOT NULL;

-- Manter compatibilidade: sincronizar `value` e `new_value` em INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.sync_goal_updates_values()
RETURNS TRIGGER AS $$
BEGIN
  -- Se apenas um dos campos vier preenchido, espelha no outro
  IF NEW.new_value IS NULL AND NEW.value IS NOT NULL THEN
    NEW.new_value := NEW.value;
  ELSIF NEW.value IS NULL AND NEW.new_value IS NOT NULL THEN
    NEW.value := NEW.new_value;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_goal_updates_values ON public.goal_updates;
CREATE TRIGGER trg_sync_goal_updates_values
BEFORE INSERT OR UPDATE ON public.goal_updates
FOR EACH ROW
EXECUTE FUNCTION public.sync_goal_updates_values();