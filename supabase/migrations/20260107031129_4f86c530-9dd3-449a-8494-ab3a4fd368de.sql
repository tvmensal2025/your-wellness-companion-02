-- Tabela de logs de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_evolution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id),
  phone TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_content TEXT,
  media_url TEXT,
  media_type TEXT,
  evolution_response JSONB,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS public.whatsapp_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  use_ai_enhancement BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  media_url TEXT,
  schedule_time TIME,
  schedule_days INTEGER[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id)
);

-- Adicionar colunas de configuração WhatsApp em user_notification_settings
ALTER TABLE public.user_notification_settings 
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_daily_motivation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_daily_time TIME DEFAULT '07:00',
ADD COLUMN IF NOT EXISTS whatsapp_weekly_report BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_weekly_day INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS whatsapp_reminders BOOLEAN DEFAULT true;

-- RLS para whatsapp_evolution_logs
ALTER TABLE public.whatsapp_evolution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs" ON public.whatsapp_evolution_logs
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can insert logs" ON public.whatsapp_evolution_logs
  FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Service role can manage logs" ON public.whatsapp_evolution_logs
  FOR ALL USING (auth.role() = 'service_role');

-- RLS para whatsapp_message_templates
ALTER TABLE public.whatsapp_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active templates" ON public.whatsapp_message_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON public.whatsapp_message_templates
  FOR ALL USING (public.is_admin_user());

-- Inserir templates padrão
INSERT INTO public.whatsapp_message_templates (template_key, name, description, category, content, variables, use_ai_enhancement, ai_prompt) VALUES
('welcome', 'Boas-vindas', 'Mensagem enviada quando usuário se cadastra', 'onboarding', 
'🎉 Olá {{nome}}!

Seja muito bem-vindo(a) ao *Dr. Vita*! 

Estamos muito felizes em ter você conosco nessa jornada de transformação. Aqui você vai encontrar:

✅ Missões diárias personalizadas
📊 Acompanhamento do seu progresso
🏆 Desafios e conquistas
💬 Suporte da nossa equipe

Vamos juntos conquistar seus objetivos de saúde! 💪

Se precisar de ajuda, é só me chamar!', 
'["nome", "email"]'::jsonb, false, null),

('daily_motivation', 'Motivação Diária', 'Mensagem motivacional enviada toda manhã', 'engagement',
'☀️ Bom dia, {{nome}}!

{{mensagem_motivacional}}

📋 *Suas missões de hoje:*
{{missoes}}

Você está no dia *{{streak}}* da sua sequência! 🔥

Vamos fazer deste dia incrível? 💪', 
'["nome", "mensagem_motivacional", "missoes", "streak"]'::jsonb, true, 'Gere uma mensagem motivacional curta e inspiradora sobre saúde, focada em hábitos saudáveis. Tom amigável e encorajador.'),

('weekly_report', 'Relatório Semanal', 'Resumo semanal enviado às sextas', 'report',
'📊 *Relatório Semanal - {{nome}}*

Olá! Sou o *Dr. Vital* e preparei seu resumo da semana:

{{analise_semanal}}

📈 *Seus números:*
• Missões completadas: {{missoes_completadas}}
• Sequência atual: {{streak}} dias
• Pontos ganhos: {{pontos}}

{{recomendacoes}}

Continue assim! Você está no caminho certo! 🌟', 
'["nome", "analise_semanal", "missoes_completadas", "streak", "pontos", "recomendacoes"]'::jsonb, true, 'Analise o progresso do usuário na semana e dê feedback personalizado como um médico amigável. Inclua elogios específicos e sugestões de melhoria.'),

('water_reminder', 'Lembrete de Água', 'Lembrete para beber água', 'reminder',
'💧 Hora de se hidratar, {{nome}}!

Já bebeu água hoje? Manter-se hidratado é essencial para:
• Mais energia
• Melhor concentração  
• Pele saudável

Beba um copo agora! 🥤', 
'["nome"]'::jsonb, false, null),

('weight_reminder', 'Lembrete de Pesagem', 'Lembrete matinal para registrar peso', 'reminder',
'⚖️ Bom dia, {{nome}}!

Não esqueça de registrar seu peso hoje! 

O acompanhamento regular é fundamental para visualizar seu progresso. 📈

👉 Acesse o app e registre agora!', 
'["nome"]'::jsonb, false, null),

('mission_reminder', 'Lembrete de Missões', 'Lembrete para completar missões do dia', 'reminder',
'📋 Oi {{nome}}!

Você ainda tem {{missoes_pendentes}} missão(ões) para completar hoje!

Não perca sua sequência de {{streak}} dias! 🔥

Faltam apenas algumas horas... Vamos lá! 💪', 
'["nome", "missoes_pendentes", "streak"]'::jsonb, false, null),

('streak_alert', 'Alerta de Streak', 'Aviso quando streak está em risco', 'reminder',
'⚠️ {{nome}}, sua sequência está em risco!

Você está há {{streak}} dias mantendo o ritmo! Não deixe isso acabar hoje!

Complete pelo menos uma missão antes da meia-noite para manter sua conquista! 🏆

👉 Acesse agora e finalize!', 
'["nome", "streak"]'::jsonb, false, null),

('achievement_celebration', 'Celebração de Conquista', 'Parabéns por conquistar badge/meta', 'engagement',
'🎉🎉🎉 PARABÉNS, {{nome}}! 🎉🎉🎉

Você acabou de desbloquear:

🏆 *{{conquista}}*

{{descricao_conquista}}

Isso é incrível! Continue assim e desbloqueie ainda mais conquistas! 🌟

#DrVita #Conquista #Orgulho', 
'["nome", "conquista", "descricao_conquista"]'::jsonb, false, null),

('goal_milestone', 'Marco de Meta', 'Celebração de marco em meta pessoal', 'engagement',
'🎯 {{nome}}, você atingiu um marco importante!

*{{meta}}*
Progresso: {{progresso}}% ✨

{{mensagem_celebracao}}

Continue focado(a) e logo você chegará lá! 💪🔥', 
'["nome", "meta", "progresso", "mensagem_celebracao"]'::jsonb, true, 'Gere uma mensagem de celebração empolgante para o usuário que atingiu um marco importante em sua meta de saúde.')

ON CONFLICT (template_key) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_whatsapp_templates_timestamp ON public.whatsapp_message_templates;
CREATE TRIGGER update_whatsapp_templates_timestamp
  BEFORE UPDATE ON public.whatsapp_message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_templates_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_user_id ON public.whatsapp_evolution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON public.whatsapp_evolution_logs(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_sent_at ON public.whatsapp_evolution_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_category ON public.whatsapp_message_templates(category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_active ON public.whatsapp_message_templates(is_active);