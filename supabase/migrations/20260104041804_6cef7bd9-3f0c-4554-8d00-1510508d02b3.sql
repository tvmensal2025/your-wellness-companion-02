-- Política para admins poderem inserir sessões
CREATE POLICY "Admins can insert sessions" ON public.sessions
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Política para admins poderem atualizar sessões
CREATE POLICY "Admins can update sessions" ON public.sessions
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Política para admins poderem deletar sessões
CREATE POLICY "Admins can delete sessions" ON public.sessions
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));