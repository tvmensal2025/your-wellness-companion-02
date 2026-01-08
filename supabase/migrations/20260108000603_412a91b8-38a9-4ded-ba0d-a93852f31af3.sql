-- 1. Criar trigger on_auth_user_created (CRÍTICO)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Criar tabela whatsapp_message_logs
CREATE TABLE IF NOT EXISTS public.whatsapp_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  message_content TEXT,
  phone_number TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own whatsapp logs" ON public.whatsapp_message_logs;
CREATE POLICY "Users can view own whatsapp logs" ON public.whatsapp_message_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all whatsapp logs" ON public.whatsapp_message_logs;
CREATE POLICY "Service role can manage all whatsapp logs" ON public.whatsapp_message_logs
  FOR ALL USING (auth.role() = 'service_role');

-- 3. Sincronizar usuários existentes - criar profiles faltantes (sem ON CONFLICT)
INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  NOW(),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = u.id);

-- 4. Criar roles para usuários que não têm (sem ON CONFLICT)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::app_role
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id);

-- 5. Criar configurações de notificação padrão para usuários que não têm
INSERT INTO public.user_notification_settings (user_id, whatsapp_enabled)
SELECT p.user_id, false
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_notification_settings n WHERE n.user_id = p.user_id);