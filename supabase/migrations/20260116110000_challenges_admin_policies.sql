-- ============================================
-- CHALLENGES ADMIN POLICIES
-- Permite admins gerenciarem desafios
-- ============================================

-- 1. Política para admins criarem desafios
DROP POLICY IF EXISTS "Admins can create challenges" ON public.challenges;
CREATE POLICY "Admins can create challenges" 
  ON public.challenges 
  FOR INSERT 
  WITH CHECK (
    public.is_admin_user()
    OR 
    auth.uid() = created_by
  );

-- 2. Política para admins atualizarem desafios
DROP POLICY IF EXISTS "Admins can update challenges" ON public.challenges;
CREATE POLICY "Admins can update challenges" 
  ON public.challenges 
  FOR UPDATE 
  USING (
    public.is_admin_user()
    OR 
    auth.uid() = created_by
  );

-- 3. Política para admins deletarem desafios
DROP POLICY IF EXISTS "Admins can delete challenges" ON public.challenges;
CREATE POLICY "Admins can delete challenges" 
  ON public.challenges 
  FOR DELETE 
  USING (
    public.is_admin_user()
    OR 
    auth.uid() = created_by
  );

-- 4. Garantir que a coluna created_by existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenges' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.challenges ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 5. Comentários
COMMENT ON POLICY "Admins can create challenges" ON public.challenges IS 'Permite admins criarem desafios';
COMMENT ON POLICY "Admins can update challenges" ON public.challenges IS 'Permite admins atualizarem desafios';
COMMENT ON POLICY "Admins can delete challenges" ON public.challenges IS 'Permite admins deletarem desafios';
