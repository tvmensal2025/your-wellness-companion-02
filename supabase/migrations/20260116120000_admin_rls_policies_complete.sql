-- ============================================
-- ADMIN RLS POLICIES - COMPLETE FIX
-- Corrige todas as políticas RLS para admin
-- ============================================

-- ============================================
-- 1. CHALLENGES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can create challenges" ON public.challenges;
DROP POLICY IF EXISTS "Admins can update challenges" ON public.challenges;
DROP POLICY IF EXISTS "Admins can delete challenges" ON public.challenges;
DROP POLICY IF EXISTS "Everyone can view challenges" ON public.challenges;

CREATE POLICY "Everyone can view challenges" 
  ON public.challenges FOR SELECT USING (true);

CREATE POLICY "Admins can create challenges" 
  ON public.challenges FOR INSERT 
  WITH CHECK (public.is_admin_user() OR auth.uid() = created_by);

CREATE POLICY "Admins can update challenges" 
  ON public.challenges FOR UPDATE 
  USING (public.is_admin_user() OR auth.uid() = created_by);

CREATE POLICY "Admins can delete challenges" 
  ON public.challenges FOR DELETE 
  USING (public.is_admin_user() OR auth.uid() = created_by);

-- ============================================
-- 2. COURSES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can create courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;

CREATE POLICY "Everyone can view courses" 
  ON public.courses FOR SELECT USING (true);

CREATE POLICY "Admins can create courses" 
  ON public.courses FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update courses" 
  ON public.courses FOR UPDATE 
  USING (public.is_admin_user());

CREATE POLICY "Admins can delete courses" 
  ON public.courses FOR DELETE 
  USING (public.is_admin_user());

-- ============================================
-- 3. COURSE_MODULES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage course_modules" ON public.course_modules;
DROP POLICY IF EXISTS "Everyone can view course_modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can create course_modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can update course_modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can delete course_modules" ON public.course_modules;

CREATE POLICY "Everyone can view course_modules" 
  ON public.course_modules FOR SELECT USING (true);

CREATE POLICY "Admins can create course_modules" 
  ON public.course_modules FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update course_modules" 
  ON public.course_modules FOR UPDATE 
  USING (public.is_admin_user());

CREATE POLICY "Admins can delete course_modules" 
  ON public.course_modules FOR DELETE 
  USING (public.is_admin_user());

-- ============================================
-- 4. LESSONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Everyone can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can create lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;

CREATE POLICY "Everyone can view lessons" 
  ON public.lessons FOR SELECT USING (true);

CREATE POLICY "Admins can create lessons" 
  ON public.lessons FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update lessons" 
  ON public.lessons FOR UPDATE 
  USING (public.is_admin_user());

CREATE POLICY "Admins can delete lessons" 
  ON public.lessons FOR DELETE 
  USING (public.is_admin_user());

-- ============================================
-- 5. SESSIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage sessions" ON public.sessions;
DROP POLICY IF EXISTS "Everyone can view sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can update sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can delete sessions" ON public.sessions;

CREATE POLICY "Everyone can view sessions" 
  ON public.sessions FOR SELECT USING (true);

CREATE POLICY "Admins can create sessions" 
  ON public.sessions FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update sessions" 
  ON public.sessions FOR UPDATE 
  USING (public.is_admin_user());

CREATE POLICY "Admins can delete sessions" 
  ON public.sessions FOR DELETE 
  USING (public.is_admin_user());

-- ============================================
-- 6. EXERCISES TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage exercises" ON public.exercises;
DROP POLICY IF EXISTS "Everyone can view exercises" ON public.exercises;
DROP POLICY IF EXISTS "Admins can create exercises" ON public.exercises;
DROP POLICY IF EXISTS "Admins can update exercises" ON public.exercises;
DROP POLICY IF EXISTS "Admins can delete exercises" ON public.exercises;

CREATE POLICY "Everyone can view exercises" 
  ON public.exercises FOR SELECT USING (true);

CREATE POLICY "Admins can create exercises" 
  ON public.exercises FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update exercises" 
  ON public.exercises FOR UPDATE 
  USING (public.is_admin_user());

CREATE POLICY "Admins can delete exercises" 
  ON public.exercises FOR DELETE 
  USING (public.is_admin_user());

-- ============================================
-- 7. SUPPLEMENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage supplements" ON public.supplements;
DROP POLICY IF EXISTS "Everyone can view supplements" ON public.supplements;
DROP POLICY IF EXISTS "Admins can create supplements" ON public.supplements;
DROP POLICY IF EXISTS "Admins can update supplements" ON public.supplements;
DROP POLICY IF EXISTS "Admins can delete supplements" ON public.supplements;

CREATE POLICY "Everyone can view supplements" 
  ON public.supplements FOR SELECT USING (true);

CREATE POLICY "Admins can create supplements" 
  ON public.supplements FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update supplements" 
  ON public.supplements FOR UPDATE 
  USING (public.is_admin_user());

CREATE POLICY "Admins can delete supplements" 
  ON public.supplements FOR DELETE 
  USING (public.is_admin_user());

-- ============================================
-- 8. WEBHOOK_DESTINATIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage webhook_destinations" ON public.webhook_destinations;
DROP POLICY IF EXISTS "Admins can view webhook_destinations" ON public.webhook_destinations;
DROP POLICY IF EXISTS "Admins can create webhook_destinations" ON public.webhook_destinations;
DROP POLICY IF EXISTS "Admins can update webhook_destinations" ON public.webhook_destinations;
DROP POLICY IF EXISTS "Admins can delete webhook_destinations" ON public.webhook_destinations;

CREATE POLICY "Admins can view webhook_destinations" 
  ON public.webhook_destinations FOR SELECT 
  USING (public.is_admin_user());

CREATE POLICY "Admins can create webhook_destinations" 
  ON public.webhook_destinations FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update webhook_destinations" 
  ON public.webhook_destinations FOR UPDATE 
  USING (public.is_admin_user());

CREATE POLICY "Admins can delete webhook_destinations" 
  ON public.webhook_destinations FOR DELETE 
  USING (public.is_admin_user());

-- ============================================
-- 9. USER_GOALS TABLE (Admin can manage all)
-- ============================================
DROP POLICY IF EXISTS "Admins can manage all user_goals" ON public.user_goals;
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

-- ============================================
-- 10. NOTIFICATIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (public.is_admin_user() OR auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin_user());

-- ============================================
-- 11. USER_SESSIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view own user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can create user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can update user_sessions" ON public.user_sessions;

CREATE POLICY "Users can view own user_sessions" 
  ON public.user_sessions FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "Admins can create user_sessions" 
  ON public.user_sessions FOR INSERT 
  WITH CHECK (public.is_admin_user() OR auth.uid() = user_id);

CREATE POLICY "Users can update own user_sessions" 
  ON public.user_sessions FOR UPDATE 
  USING (auth.uid() = user_id OR public.is_admin_user());

-- ============================================
-- 12. AI_CONFIGURATIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage ai_configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Everyone can view ai_configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Admins can create ai_configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Admins can update ai_configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Admins can delete ai_configurations" ON public.ai_configurations;

CREATE POLICY "Everyone can view ai_configurations" 
  ON public.ai_configurations FOR SELECT USING (true);

CREATE POLICY "Admins can create ai_configurations" 
  ON public.ai_configurations FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update ai_configurations" 
  ON public.ai_configurations FOR UPDATE 
  USING (public.is_admin_user());

CREATE POLICY "Admins can delete ai_configurations" 
  ON public.ai_configurations FOR DELETE 
  USING (public.is_admin_user());

-- ============================================
-- 13. POINTS_CONFIG TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage points_config" ON public.points_config;
DROP POLICY IF EXISTS "Everyone can view points_config" ON public.points_config;
DROP POLICY IF EXISTS "Admins can create points_config" ON public.points_config;
DROP POLICY IF EXISTS "Admins can update points_config" ON public.points_config;

CREATE POLICY "Everyone can view points_config" 
  ON public.points_config FOR SELECT USING (true);

CREATE POLICY "Admins can create points_config" 
  ON public.points_config FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update points_config" 
  ON public.points_config FOR UPDATE 
  USING (public.is_admin_user());

-- ============================================
-- 14. XP_CONFIG TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage xp_config" ON public.xp_config;
DROP POLICY IF EXISTS "Everyone can view xp_config" ON public.xp_config;
DROP POLICY IF EXISTS "Admins can create xp_config" ON public.xp_config;
DROP POLICY IF EXISTS "Admins can update xp_config" ON public.xp_config;

CREATE POLICY "Everyone can view xp_config" 
  ON public.xp_config FOR SELECT USING (true);

CREATE POLICY "Admins can create xp_config" 
  ON public.xp_config FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update xp_config" 
  ON public.xp_config FOR UPDATE 
  USING (public.is_admin_user());

-- ============================================
-- 15. PLATFORM_SETTINGS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Everyone can view platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can create platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can update platform_settings" ON public.platform_settings;

CREATE POLICY "Everyone can view platform_settings" 
  ON public.platform_settings FOR SELECT USING (true);

CREATE POLICY "Admins can create platform_settings" 
  ON public.platform_settings FOR INSERT 
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update platform_settings" 
  ON public.platform_settings FOR UPDATE 
  USING (public.is_admin_user());

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY "Admins can create challenges" ON public.challenges IS 'Permite admins criarem desafios';
COMMENT ON POLICY "Admins can create courses" ON public.courses IS 'Permite admins criarem cursos';
COMMENT ON POLICY "Admins can create sessions" ON public.sessions IS 'Permite admins criarem sessões';
COMMENT ON POLICY "Admins can create exercises" ON public.exercises IS 'Permite admins criarem exercícios';
