-- ============================================
-- ADMIN RLS POLICIES - CORREÇÃO COMPLETA
-- Apenas tabelas que existem
-- ============================================

-- 1. CHALLENGES TABLE
DROP POLICY IF EXISTS "Admins can create challenges" ON public.challenges;
DROP POLICY IF EXISTS "Admins can update challenges" ON public.challenges;
DROP POLICY IF EXISTS "Admins can delete challenges" ON public.challenges;

CREATE POLICY "Admins can create challenges" 
ON public.challenges FOR INSERT 
WITH CHECK (public.is_admin_user() OR auth.uid() = created_by);

CREATE POLICY "Admins can update challenges" 
ON public.challenges FOR UPDATE 
USING (public.is_admin_user() OR auth.uid() = created_by);

CREATE POLICY "Admins can delete challenges" 
ON public.challenges FOR DELETE 
USING (public.is_admin_user() OR auth.uid() = created_by);

-- 2. COURSES TABLE
DROP POLICY IF EXISTS "Admins can create courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;

CREATE POLICY "Admins can create courses" 
ON public.courses FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update courses" 
ON public.courses FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete courses" 
ON public.courses FOR DELETE USING (public.is_admin_user());

-- 3. COURSE_MODULES TABLE
DROP POLICY IF EXISTS "Admins can create course_modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can update course_modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can delete course_modules" ON public.course_modules;

CREATE POLICY "Admins can create course_modules" 
ON public.course_modules FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update course_modules" 
ON public.course_modules FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete course_modules" 
ON public.course_modules FOR DELETE USING (public.is_admin_user());

-- 4. LESSONS TABLE
DROP POLICY IF EXISTS "Admins can create lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;

CREATE POLICY "Admins can create lessons" 
ON public.lessons FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update lessons" 
ON public.lessons FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete lessons" 
ON public.lessons FOR DELETE USING (public.is_admin_user());

-- 5. SESSIONS TABLE
DROP POLICY IF EXISTS "Admins can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can update sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can delete sessions" ON public.sessions;

CREATE POLICY "Admins can create sessions" 
ON public.sessions FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update sessions" 
ON public.sessions FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete sessions" 
ON public.sessions FOR DELETE USING (public.is_admin_user());

-- 6. EXERCISES TABLE
DROP POLICY IF EXISTS "Admins can create exercises" ON public.exercises;
DROP POLICY IF EXISTS "Admins can update exercises" ON public.exercises;
DROP POLICY IF EXISTS "Admins can delete exercises" ON public.exercises;

CREATE POLICY "Admins can create exercises" 
ON public.exercises FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update exercises" 
ON public.exercises FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete exercises" 
ON public.exercises FOR DELETE USING (public.is_admin_user());

-- 7. SUPPLEMENTS TABLE
DROP POLICY IF EXISTS "Admins can create supplements" ON public.supplements;
DROP POLICY IF EXISTS "Admins can update supplements" ON public.supplements;
DROP POLICY IF EXISTS "Admins can delete supplements" ON public.supplements;

CREATE POLICY "Admins can create supplements" 
ON public.supplements FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update supplements" 
ON public.supplements FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete supplements" 
ON public.supplements FOR DELETE USING (public.is_admin_user());

-- 8. WEBHOOK_DESTINATIONS TABLE
DROP POLICY IF EXISTS "Admins can view webhook_destinations" ON public.webhook_destinations;
DROP POLICY IF EXISTS "Admins can create webhook_destinations" ON public.webhook_destinations;
DROP POLICY IF EXISTS "Admins can update webhook_destinations" ON public.webhook_destinations;
DROP POLICY IF EXISTS "Admins can delete webhook_destinations" ON public.webhook_destinations;

CREATE POLICY "Admins can view webhook_destinations" 
ON public.webhook_destinations FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can create webhook_destinations" 
ON public.webhook_destinations FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update webhook_destinations" 
ON public.webhook_destinations FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete webhook_destinations" 
ON public.webhook_destinations FOR DELETE USING (public.is_admin_user());

-- 9. USER_GOALS TABLE
DROP POLICY IF EXISTS "Admins can view all user_goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can update all user_goals" ON public.user_goals;
DROP POLICY IF EXISTS "Admins can delete all user_goals" ON public.user_goals;

CREATE POLICY "Admins can view all user_goals" 
ON public.user_goals FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "Admins can update all user_goals" 
ON public.user_goals FOR UPDATE 
USING (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "Admins can delete all user_goals" 
ON public.user_goals FOR DELETE 
USING (auth.uid() = user_id OR public.is_admin_user());

-- 10. NOTIFICATIONS TABLE
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;

CREATE POLICY "Admins can create notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (public.is_admin_user() OR auth.uid() = user_id);

-- 11. USER_SESSIONS TABLE
DROP POLICY IF EXISTS "Admins can create user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update own user_sessions" ON public.user_sessions;

CREATE POLICY "Admins can create user_sessions" 
ON public.user_sessions FOR INSERT 
WITH CHECK (public.is_admin_user() OR auth.uid() = user_id);

CREATE POLICY "Users can update own user_sessions" 
ON public.user_sessions FOR UPDATE 
USING (auth.uid() = user_id OR public.is_admin_user());

-- 12. AI_CONFIGURATIONS TABLE
DROP POLICY IF EXISTS "Admins can create ai_configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Admins can update ai_configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Admins can delete ai_configurations" ON public.ai_configurations;

CREATE POLICY "Admins can create ai_configurations" 
ON public.ai_configurations FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update ai_configurations" 
ON public.ai_configurations FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete ai_configurations" 
ON public.ai_configurations FOR DELETE USING (public.is_admin_user());

-- 13. EXERCISE_CHALLENGES TABLE (X1 Duelos)
DROP POLICY IF EXISTS "Admins can view all exercise_challenges" ON public.exercise_challenges;

CREATE POLICY "Admins can view all exercise_challenges" 
ON public.exercise_challenges FOR SELECT 
USING (auth.uid() IN (challenger_id, challenged_id) OR public.is_admin_user());