-- =============================================
-- 🔧 CORREÇÃO: Ranking da Comunidade mostrando #0
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. DIAGNÓSTICO: Ver estado atual
SELECT '📊 DIAGNÓSTICO INICIAL:' as info;

SELECT 
  (SELECT COUNT(*) FROM profiles WHERE user_id IS NOT NULL) as total_profiles,
  (SELECT COUNT(*) FROM user_points) as total_user_points,
  (SELECT COUNT(*) FROM profiles p WHERE p.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM user_points up WHERE up.user_id = p.user_id)) as usuarios_sem_pontos;

-- 2. Ver políticas RLS atuais
SELECT '🔐 POLÍTICAS RLS ATUAIS:' as info;
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_points';

-- 3. CORRIGIR: Remover política restritiva
DROP POLICY IF EXISTS "Users can view their own points" ON public.user_points;

-- 4. CRIAR: Política que permite ver todos os pontos
DROP POLICY IF EXISTS "Everyone can view all points for ranking" ON public.user_points;
CREATE POLICY "Everyone can view all points for ranking"
  ON public.user_points 
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. MANTER: Políticas de escrita restritas
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

-- 6. ADICIONAR coluna missions_completed se não existir
ALTER TABLE public.user_points 
ADD COLUMN IF NOT EXISTS missions_completed INTEGER DEFAULT 0;

-- 7. INSERIR: Registros de pontos para usuários que não têm
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

-- 8. CRIAR índices para performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points_desc ON public.user_points(total_points DESC);

-- 9. VERIFICAR: Estado após correção
SELECT '✅ RESULTADO APÓS CORREÇÃO:' as info;

SELECT 
  (SELECT COUNT(*) FROM profiles WHERE user_id IS NOT NULL) as total_profiles,
  (SELECT COUNT(*) FROM user_points) as total_user_points,
  (SELECT COUNT(*) FROM profiles p WHERE p.user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM user_points up WHERE up.user_id = p.user_id)) as usuarios_sem_pontos;

-- 10. VER: Top 10 do ranking
SELECT '🏆 TOP 10 DO RANKING:' as info;

SELECT 
  ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as posicao,
  p.full_name as nome,
  up.total_points as pontos,
  up.current_streak as streak,
  up.missions_completed as missoes
FROM user_points up
LEFT JOIN profiles p ON up.user_id = p.user_id
WHERE p.full_name IS NOT NULL
ORDER BY up.total_points DESC
LIMIT 10;

-- 11. VER: Políticas após correção
SELECT '🔐 POLÍTICAS RLS APÓS CORREÇÃO:' as info;
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_points';

SELECT '🎉 CORREÇÃO CONCLUÍDA!' as status;
