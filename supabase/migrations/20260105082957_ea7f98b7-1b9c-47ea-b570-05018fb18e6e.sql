-- Função para verificar role usando tipo text
CREATE OR REPLACE FUNCTION public.has_role_text(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Everyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can view all courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;

-- Política para visualização pública de cursos publicados
CREATE POLICY "Everyone can view published courses" ON public.courses
FOR SELECT USING (is_published = true);

-- Política para admins visualizarem todos os cursos
CREATE POLICY "Admins can view all courses" ON public.courses
FOR SELECT USING (public.has_role_text(auth.uid(), 'admin'));

-- Política para admins criarem cursos
CREATE POLICY "Admins can insert courses" ON public.courses
FOR INSERT WITH CHECK (public.has_role_text(auth.uid(), 'admin'));

-- Política para admins atualizarem cursos
CREATE POLICY "Admins can update courses" ON public.courses
FOR UPDATE USING (public.has_role_text(auth.uid(), 'admin'));

-- Política para admins deletarem cursos
CREATE POLICY "Admins can delete courses" ON public.courses
FOR DELETE USING (public.has_role_text(auth.uid(), 'admin'));