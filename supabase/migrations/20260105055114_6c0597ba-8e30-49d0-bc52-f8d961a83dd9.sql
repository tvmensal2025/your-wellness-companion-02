-- Atualizar política de UPDATE para usar user_roles
DROP POLICY IF EXISTS "Admin pode atualizar exercícios" ON public.exercises_library;
CREATE POLICY "Admin pode atualizar exercícios" 
ON public.exercises_library 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Atualizar política de DELETE para usar user_roles
DROP POLICY IF EXISTS "Admin pode deletar exercícios" ON public.exercises_library;
CREATE POLICY "Admin pode deletar exercícios" 
ON public.exercises_library 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Atualizar política de INSERT para usar user_roles
DROP POLICY IF EXISTS "Admin pode inserir exercícios" ON public.exercises_library;
CREATE POLICY "Admin pode inserir exercícios" 
ON public.exercises_library 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);