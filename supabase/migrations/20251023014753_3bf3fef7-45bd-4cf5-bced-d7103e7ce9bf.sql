-- ========================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA - PROFILES
-- ========================================

-- Remover policy perigosa que permite acesso público
DROP POLICY IF EXISTS "profiles_temp_all_select" ON public.profiles;

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins podem ver todos os perfis
CREATE POLICY "profiles_select_admin" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy: Admins podem atualizar qualquer perfil
CREATE POLICY "profiles_update_admin" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- ========================================
-- CORREÇÃO: WEIGHT MEASUREMENTS
-- ========================================

-- Remover acesso anônimo de weight_measurements
DROP POLICY IF EXISTS "weight_measurements_select" ON public.weight_measurements;
DROP POLICY IF EXISTS "weight_measurements_update" ON public.weight_measurements;
DROP POLICY IF EXISTS "weight_measurements_delete" ON public.weight_measurements;

-- Policy: Apenas donos podem ver suas medições
CREATE POLICY "weight_measurements_select_own" 
ON public.weight_measurements 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Apenas donos podem inserir suas medições
CREATE POLICY "weight_measurements_insert_own" 
ON public.weight_measurements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Apenas donos podem atualizar suas medições
CREATE POLICY "weight_measurements_update_own" 
ON public.weight_measurements 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Apenas donos podem deletar suas medições
CREATE POLICY "weight_measurements_delete_own" 
ON public.weight_measurements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Verificar configurações aplicadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'weight_measurements')
ORDER BY tablename, policyname;