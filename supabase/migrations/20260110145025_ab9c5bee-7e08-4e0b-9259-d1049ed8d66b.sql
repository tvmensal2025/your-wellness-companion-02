-- Índices de Performance MaxNutrition - Faltantes

-- Índice para busca por email em profiles (acelera login e verificações)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Índice para busca case-insensitive de alimentos na tabela TACO
CREATE INDEX IF NOT EXISTS idx_taco_foods_name_lower ON public.taco_foods(LOWER(food_name));