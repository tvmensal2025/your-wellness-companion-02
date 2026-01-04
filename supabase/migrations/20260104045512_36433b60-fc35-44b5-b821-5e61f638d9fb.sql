-- Fix infinite recursion in RLS (user_roles) and unblock user_sessions loading

-- 1) Replace recursive admin policy on user_roles
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Replace user_sessions admin policies to use has_role() (avoids RLS dependency on user_roles)
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can insert sessions for any user" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can update all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can delete any session" ON public.user_sessions;

CREATE POLICY "Admins can view all sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert sessions for any user"
ON public.user_sessions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any session"
ON public.user_sessions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
