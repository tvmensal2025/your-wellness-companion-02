-- Criar bucket para thumbnails dos cursos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para course-thumbnails
CREATE POLICY "Public can view course thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Admins can upload course thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-thumbnails' 
  AND public.has_role_text(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update course thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-thumbnails' 
  AND public.has_role_text(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete course thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-thumbnails' 
  AND public.has_role_text(auth.uid(), 'admin')
);

-- Políticas RLS para course_modules
DROP POLICY IF EXISTS "Everyone can view modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can view all modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can insert modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can update modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can delete modules" ON public.course_modules;

CREATE POLICY "Everyone can view modules" ON public.course_modules
FOR SELECT USING (true);

CREATE POLICY "Admins can insert modules" ON public.course_modules
FOR INSERT WITH CHECK (public.has_role_text(auth.uid(), 'admin'));

CREATE POLICY "Admins can update modules" ON public.course_modules
FOR UPDATE USING (public.has_role_text(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete modules" ON public.course_modules
FOR DELETE USING (public.has_role_text(auth.uid(), 'admin'));

-- Políticas RLS para lessons
DROP POLICY IF EXISTS "Everyone can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can view all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;

CREATE POLICY "Everyone can view lessons" ON public.lessons
FOR SELECT USING (true);

CREATE POLICY "Admins can insert lessons" ON public.lessons
FOR INSERT WITH CHECK (public.has_role_text(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lessons" ON public.lessons
FOR UPDATE USING (public.has_role_text(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lessons" ON public.lessons
FOR DELETE USING (public.has_role_text(auth.uid(), 'admin'));