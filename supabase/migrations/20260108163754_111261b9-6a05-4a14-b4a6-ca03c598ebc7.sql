-- Criar tabela de histórico de conversas para memória da IA
CREATE TABLE IF NOT EXISTS public.chat_conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  personality TEXT DEFAULT 'sofia',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_history_user_session 
ON public.chat_conversation_history(user_id, session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_created 
ON public.chat_conversation_history(user_id, created_at DESC);

-- RLS
ALTER TABLE public.chat_conversation_history ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view own chat history" 
ON public.chat_conversation_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" 
ON public.chat_conversation_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Service role pode gerenciar tudo (para edge functions)
CREATE POLICY "Service role full access on chat history" 
ON public.chat_conversation_history 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Função para limpar histórico antigo (manter últimos 100 por usuário)
CREATE OR REPLACE FUNCTION public.cleanup_old_chat_history()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM chat_conversation_history 
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY user_id, session_id 
        ORDER BY created_at DESC
      ) as rn
      FROM chat_conversation_history
    ) ranked
    WHERE rn <= 100
  );
END;
$$;