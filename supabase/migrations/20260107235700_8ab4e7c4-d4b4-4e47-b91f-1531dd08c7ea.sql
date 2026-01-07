-- Adicionar colunas para notificações expandidas de WhatsApp
ALTER TABLE public.user_notification_settings
ADD COLUMN IF NOT EXISTS whatsapp_water_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_water_times TEXT[] DEFAULT ARRAY['09:00', '12:00', '15:00', '18:00'],
ADD COLUMN IF NOT EXISTS whatsapp_mission_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_mission_time TIME DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS whatsapp_goals_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_goals_time TIME DEFAULT '19:00',
ADD COLUMN IF NOT EXISTS whatsapp_challenges_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_challenges_time TIME DEFAULT '10:00';