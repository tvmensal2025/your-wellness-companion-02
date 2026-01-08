
-- =====================================================
-- FASE 3: CORREÇÃO DE POLÍTICAS RLS (PARTE 2)
-- =====================================================

-- 4. GARANTIR QUE weight_measurements TENHA POLÍTICAS CORRETAS
DROP POLICY IF EXISTS "Everyone can view weight" ON public.weight_measurements;

-- Verificar se já existe política correta
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_measurements' 
    AND policyname = 'Users can view own measurements'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own measurements" ON public.weight_measurements FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_measurements' 
    AND policyname = 'Users can insert own measurements'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own measurements" ON public.weight_measurements FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_measurements' 
    AND policyname = 'Users can update own measurements'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own measurements" ON public.weight_measurements FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_measurements' 
    AND policyname = 'Users can delete own measurements'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own measurements" ON public.weight_measurements FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END $$;
