-- Políticas RLS para user_sessions permitir acesso de admins

-- Política para admins visualizarem todas as sessões
CREATE POLICY "Admins can view all sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Política para admins atualizarem qualquer sessão
CREATE POLICY "Admins can update all sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Política para admins inserirem sessões para qualquer usuário
CREATE POLICY "Admins can insert sessions for any user"
ON public.user_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Política para admins deletarem qualquer sessão
CREATE POLICY "Admins can delete any session"
ON public.user_sessions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);