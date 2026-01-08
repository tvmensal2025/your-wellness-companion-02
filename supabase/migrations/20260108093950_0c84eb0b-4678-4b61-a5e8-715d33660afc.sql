-- Tabela para links públicos de relatórios médicos
CREATE TABLE public_report_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  user_id UUID,
  medical_document_id UUID,
  report_path TEXT NOT NULL,
  title TEXT DEFAULT 'Relatório Médico',
  exam_type TEXT,
  exam_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ
);

-- Índice para busca rápida por token
CREATE INDEX idx_public_report_links_token ON public_report_links(token);

-- RLS: leitura pública por token (não precisa auth)
ALTER TABLE public_report_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública por token" ON public_report_links
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem criar links" ON public_report_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar view_count" ON public_report_links
  FOR UPDATE USING (true);

-- Tabela para fluxo conversacional de exames médicos no WhatsApp
CREATE TABLE whatsapp_pending_medical (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  phone TEXT NOT NULL,
  image_url TEXT,
  image_base64 TEXT,
  exam_type TEXT,
  exam_date DATE,
  doctor_name TEXT,
  status TEXT DEFAULT 'awaiting_info',
  medical_document_id UUID,
  public_link_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '1 hour'
);

-- Índice para busca por telefone e status
CREATE INDEX idx_whatsapp_pending_medical_phone ON whatsapp_pending_medical(phone, status);

-- RLS
ALTER TABLE whatsapp_pending_medical ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sistema pode gerenciar pendentes" ON whatsapp_pending_medical
  FOR ALL USING (true);