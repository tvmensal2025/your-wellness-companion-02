-- =============================================
-- FIX: Comunidade - Ranking mostrando #0
-- Problema: RLS restritiva + usuários sem pontos
-- =============================================

-- 1. REMOVER política restritiva que impede ver ranking
DROP POLICY IF EXISTS "Users can view their own points" ON public.user_points;

-- 2. CRIAR política que permite ver TODOS os pontos (necessário para ranking)
DROP POLICY IF EXISTS "Everyone can view all points for ranking" ON public.user_points;
CREATE POLICY "Everyone can view all points for ranking"
  ON public.user_points 
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. MANTER políticas de INSERT/UPDATE restritas ao próprio usuário
DROP POLICY IF EXISTS "Users can insert their own points" ON public.user_points;
CREATE POLICY "Users can insert their own points"
  ON public.user_points 
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own points" ON public.user_points;
CREATE POLICY "Users can update their own points"
  ON public.user_points 
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. GARANTIR que todos os usuários têm registro de pontos
INSERT INTO public.user_points (
  user_id, 
  total_points, 
  daily_points,
  weekly_points,
  monthly_points,
  current_streak, 
  best_streak,
  level,
  completed_challenges,
  missions_completed
)
SELECT 
  p.user_id,
  COALESCE(p.points, 0),
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0
FROM public.profiles p
WHERE p.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.user_points up WHERE up.user_id = p.user_id)
ON CONFLICT (user_id) DO NOTHING;

-- 5. CRIAR índices para performance do ranking
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points_desc ON public.user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_ranking ON public.user_points(total_points DESC, current_streak DESC);

-- 6. ADICIONAR coluna missions_completed se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_points' AND column_name = 'missions_completed'
  ) THEN
    ALTER TABLE public.user_points ADD COLUMN missions_completed INTEGER DEFAULT 0;
  END IF;
END $$;

-- 7. VERIFICAR resultado
DO $$
DECLARE
  v_total_profiles INTEGER;
  v_total_points INTEGER;
  v_sem_pontos INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_profiles FROM public.profiles WHERE user_id IS NOT NULL;
  SELECT COUNT(*) INTO v_total_points FROM public.user_points;
  SELECT COUNT(*) INTO v_sem_pontos FROM public.profiles p 
    WHERE p.user_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM public.user_points up WHERE up.user_id = p.user_id);
  
  RAISE NOTICE '✅ Correção aplicada:';
  RAISE NOTICE '   - Total de perfis: %', v_total_profiles;
  RAISE NOTICE '   - Total com pontos: %', v_total_points;
  RAISE NOTICE '   - Ainda sem pontos: %', v_sem_pontos;
END $$;
