-- Fix RLS policy for user_points - allow anyone to view points for ranking
CREATE POLICY "Anyone can view user points for ranking"
ON public.user_points
FOR SELECT
TO authenticated
USING (true);

-- Create trigger function to automatically create user_points on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_points (user_id, total_points, current_streak, level)
  VALUES (NEW.user_id, 0, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_add_points ON public.profiles;
CREATE TRIGGER on_profile_created_add_points
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_points();

-- Backfill: Create user_points for existing profiles that don't have them
INSERT INTO public.user_points (user_id, total_points, current_streak, level)
SELECT p.user_id, 0, 0, 1
FROM public.profiles p
LEFT JOIN public.user_points up ON up.user_id = p.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;