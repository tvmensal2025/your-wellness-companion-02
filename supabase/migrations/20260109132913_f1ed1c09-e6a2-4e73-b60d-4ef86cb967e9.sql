-- Tabela para armazenar leads recebidos via webhook
CREATE TABLE public.received_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT,
  source_name TEXT,
  lead_data JSONB NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.received_leads ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem
CREATE POLICY "Admins can view received leads" 
ON public.received_leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Política para admins atualizarem
CREATE POLICY "Admins can update received leads" 
ON public.received_leads 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Política para inserção via função (service role)
CREATE POLICY "Service role can insert received leads" 
ON public.received_leads 
FOR INSERT 
WITH CHECK (true);

-- Índice para busca por data
CREATE INDEX idx_received_leads_received_at ON public.received_leads(received_at DESC);

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.received_leads;